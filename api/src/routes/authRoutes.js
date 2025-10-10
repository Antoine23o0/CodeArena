import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Submission from '../models/submission.js';

const router = express.Router();

const sanitizeUser = (user) => {
  const { password, __v, ...safeUser } = user.toObject({ versionKey: false });
  return safeUser;
};

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ userName: username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already in use' });
    }

    const user = new User({ userName: username, password });
    await user.save();

    const token = user.generateJWT();
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = user.generateJWT();
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const buildLanguageBreakdown = (languages = []) => {
  if (!Array.isArray(languages) || languages.length === 0) {
    return { favorite: null, breakdown: [] };
  }

  const counts = languages.reduce((acc, lang) => {
    if (!lang) return acc;
    const normalized = lang.toLowerCase();
    acc.set(normalized, (acc.get(normalized) || 0) + 1);
    return acc;
  }, new Map());

  const breakdown = Array.from(counts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));

  return {
    favorite: breakdown[0]?.language ?? null,
    breakdown,
  };
};

router.get('/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [stats] = await Submission.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$userId',
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0],
            },
          },
          contests: { $addToSet: '$contestId' },
          languages: { $push: '$language' },
        },
      },
    ]);

    const totalSubmissions = stats?.totalSubmissions ?? 0;
    const acceptedSubmissions = stats?.acceptedSubmissions ?? 0;
    const contestsParticipated = stats?.contests?.filter(Boolean)?.length ?? 0;
    const acceptanceRate = totalSubmissions
      ? Math.round((acceptedSubmissions / totalSubmissions) * 1000) / 10
      : 0;

    const languageStats = buildLanguageBreakdown(stats?.languages);

    const betterRankCount = await User.countDocuments({
      $or: [
        { totalScore: { $gt: user.totalScore ?? 0 } },
        {
          $and: [
            { totalScore: user.totalScore ?? 0 },
            { userName: { $lt: user.userName } },
          ],
        },
      ],
    });

    const recentSubmissions = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('contestId', 'title startDate endDate')
      .populate('problemId', 'title');

    const history = recentSubmissions.map((submission) => ({
      id: submission._id.toString(),
      status: submission.status,
      score: submission.score ?? 0,
      language: submission.language,
      createdAt: submission.createdAt,
      contest: submission.contestId
        ? {
            id: submission.contestId._id.toString(),
            title: submission.contestId.title,
          }
        : null,
      problem: submission.problemId
        ? {
            id: submission.problemId._id.toString(),
            title: submission.problemId.title,
          }
        : null,
    }));

    return res.json({
      user: sanitizeUser(user),
      rank: betterRankCount + 1,
      stats: {
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
        contestsParticipated,
        favoriteLanguage: languageStats.favorite,
        languages: languageStats.breakdown,
      },
      recentSubmissions: history,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

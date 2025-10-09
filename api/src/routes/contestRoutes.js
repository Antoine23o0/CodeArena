import express from 'express';
import Contest from '../models/contest.js';
import Problem from '../models/problem.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { getContestScoreboard } from '../services/scoreboardService.js';

const router = express.Router();

const updateContestStatus = (contest) => {
  const now = new Date();
  const previous = contest.status;
  if (contest.endDate < now) {
    contest.status = 'finished';
  } else if (contest.startDate <= now && contest.endDate >= now) {
    contest.status = 'running';
  } else if (contest.startDate > now) {
    contest.status = 'scheduled';
  }
  return previous !== contest.status;
};

router.post('/', authenticate, async (req, res) => {
  try {
    const contest = new Contest({
      ...req.body,
      createdBy: req.user._id,
    });
    updateContestStatus(contest);
    await contest.save();
    return res.status(201).json(contest);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/', optionalAuth, async (_req, res) => {
  try {
    const contests = await Contest.find().sort({ startDate: 1 });
    const updates = contests.filter((contest) => updateContestStatus(contest));
    await Promise.all(updates.map((contest) => contest.save()));
    return res.json(contests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/active', optionalAuth, async (_req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ startDate: 1 });
    const updates = contests.filter((contest) => updateContestStatus(contest));
    await Promise.all(updates.map((contest) => contest.save()));
    return res.json(contests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate({
      path: 'problemsList',
      select: 'title difficulty maxScore',
    });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    if (updateContestStatus(contest)) {
      await contest.save();
    }
    return res.json(contest);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id/problems', optionalAuth, async (req, res) => {
  try {
    const problems = await Problem.find({ contest: req.params.id }).select(
      'title difficulty maxScore',
    );
    return res.json(problems);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: req.user._id } },
      { new: true },
    );
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    return res.json(contest);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    if (contest.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the contest owner can update it' });
    }

    Object.assign(contest, req.body);
    updateContestStatus(contest);
    await contest.save();
    return res.json(contest);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    if (contest.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the contest owner can delete it' });
    }
    await contest.deleteOne();
    return res.json({ message: 'Contest deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id/scoreboard', optionalAuth, async (req, res) => {
  try {
    const scoreboard = await getContestScoreboard(req.params.id);
    if (!scoreboard) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    return res.json(scoreboard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

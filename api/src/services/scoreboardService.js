import Contest from '../models/contest.js';
import Submission from '../models/submission.js';
import User from '../models/user.js';
import eventBus, { EVENTS } from './eventBus.js';

const computeContestScoreboard = async (contestId) => {
  const submissions = await Submission.find({
    contestId,
    status: 'Accepted',
  })
    .populate('userId', 'userName')
    .populate('problemId', 'maxScore');

  const byUser = new Map();

  submissions.forEach((submission) => {
    const key = submission.userId._id.toString();
    if (!byUser.has(key)) {
      byUser.set(key, {
        user: submission.userId,
        problems: new Map(),
        lastSubmissionAt: submission.updatedAt,
      });
    }

    const userEntry = byUser.get(key);
    const problemKey = submission.problemId._id.toString();
    const previous = userEntry.problems.get(problemKey) || 0;
    if (submission.score > previous) {
      userEntry.problems.set(problemKey, submission.score);
    }
    if (!userEntry.lastSubmissionAt || submission.updatedAt > userEntry.lastSubmissionAt) {
      userEntry.lastSubmissionAt = submission.updatedAt;
    }
  });

  const scoreboard = Array.from(byUser.values()).map((entry) => {
    const totalScore = Array.from(entry.problems.values()).reduce((acc, val) => acc + val, 0);
    return {
      user: entry.user._id,
      userName: entry.user.userName,
      solved: entry.problems.size,
      totalScore,
      lastSubmissionAt: entry.lastSubmissionAt,
    };
  });

  scoreboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.solved !== a.solved) {
      return b.solved - a.solved;
    }
    if (a.lastSubmissionAt && b.lastSubmissionAt) {
      return a.lastSubmissionAt - b.lastSubmissionAt;
    }
    return a.userName.localeCompare(b.userName);
  });

  return scoreboard;
};

const computeGlobalScoreboard = async () => {
  const users = await User.find().select('userName totalScore updatedAt');
  const scoreboard = users
    .map((user) => ({
      user: user._id,
      userName: user.userName,
      totalScore: user.totalScore || 0,
      solved: undefined,
      lastSubmissionAt: user.updatedAt,
    }))
    .filter((entry) => entry.totalScore > 0)
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.userName.localeCompare(b.userName);
    });

  return scoreboard;
};

export const refreshContestScoreboard = async (contestId) => {
  const contest = await Contest.findById(contestId);
  if (!contest) {
    return null;
  }

  const scoreboard = await computeContestScoreboard(contestId);

  contest.scores = scoreboard.map((entry) => ({
    user: entry.user,
    totalScore: entry.totalScore,
    solved: entry.solved,
    lastSubmissionAt: entry.lastSubmissionAt,
  }));
  await contest.save();

  eventBus.emit(EVENTS.CONTEST_SCOREBOARD_UPDATED, { contestId: contest._id.toString(), scoreboard });

  await refreshGlobalScoreboard();

  return scoreboard;
};

export const refreshGlobalScoreboard = async () => {
  const scoreboard = await computeGlobalScoreboard();
  eventBus.emit(EVENTS.GLOBAL_SCOREBOARD_UPDATED, { scoreboard });
  return scoreboard;
};

export const getContestScoreboard = async (contestId) => {
  const contest = await Contest.findById(contestId).populate('scores.user', 'userName');
  if (!contest) {
    return null;
  }

  if (!contest.scores || contest.scores.length === 0) {
    return refreshContestScoreboard(contestId);
  }

  return contest.scores.map((entry) => ({
    user: entry.user._id,
    userName: entry.user.userName,
    totalScore: entry.totalScore,
    solved: entry.solved,
    lastSubmissionAt: entry.lastSubmissionAt,
  }));
};

export const getGlobalScoreboard = async () => computeGlobalScoreboard();

export const awardUserScore = async (userId, increment) => {
  if (!increment) {
    return;
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $inc: { totalScore: increment },
    },
    { new: true },
  );
};


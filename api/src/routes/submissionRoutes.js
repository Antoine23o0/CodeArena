import express from 'express';
import mongoose from 'mongoose';
import Contest from '../models/contest.js';
import Problem from '../models/problem.js';
import Submission from '../models/submission.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { runSubmission } from '../services/evaluator.js';
import {
  awardUserScore,
  getContestScoreboard,
  getGlobalScoreboard,
  refreshContestScoreboard,
} from '../services/scoreboardService.js';

const router = express.Router();

const allowedLanguages = ['python', 'java', 'c'];

const normalizeLanguage = (value) => (typeof value === 'string' ? value.toLowerCase() : undefined);

const validateSubmissionPayload = ({ problemId, contestId, sourceCode, language }) => {
  const errors = [];
  const normalizedLanguage = normalizeLanguage(language) || 'python';
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    errors.push({ field: 'problemId', message: 'problemId is required' });
  }
  if (!mongoose.Types.ObjectId.isValid(contestId)) {
    errors.push({ field: 'contestId', message: 'contestId is required' });
  }
  if (typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
    errors.push({ field: 'sourceCode', message: 'sourceCode is required' });
  }
  if (language && !allowedLanguages.includes(normalizedLanguage)) {
    errors.push({ field: 'language', message: 'Unsupported language' });
  }
  return { errors, normalizedLanguage };
};

const ensureProblemAndContest = async (contestId, problemId, language) => {
  const [problem, contest] = await Promise.all([
    Problem.findById(problemId),
    Contest.findById(contestId),
  ]);

  if (!problem) {
    const error = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  if (!contest) {
    const error = new Error('Contest not found');
    error.statusCode = 404;
    throw error;
  }

  if (problem.contest && problem.contest.toString() !== contestId) {
    const error = new Error('Problem does not belong to this contest');
    error.statusCode = 400;
    throw error;
  }

  const normalizedAllowed = Array.isArray(problem.allowedLanguages)
    ? problem.allowedLanguages.map((item) => `${item}`.toLowerCase())
    : [];

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(language)) {
    const error = new Error('Language not allowed for this problem');
    error.statusCode = 400;
    throw error;
  }

  return { problem, contest };
};

const evaluateSolution = async (problem, language, sourceCode) => {
  const runnerPayload = {
    language,
    code: sourceCode,
    testCases: (problem.testCases || []).map((test) => ({
      input: test.input ?? '',
      expectedOutput: test.expectedOutput ?? '',
    })),
    timeLimitMs: problem.timeLimitMs,
  };

  let status = 'Runtime Error';
  let stdout = '';
  let stderr = '';
  let executionTimeMs = 0;
  let testResults = [];
  let passedCount = 0;

  try {
    const runnerResult = await runSubmission(runnerPayload);
    status = runnerResult.status ?? status;
    stdout = runnerResult.stdout || '';
    stderr = runnerResult.stderr || '';
    executionTimeMs = runnerResult.executionTimeMs || 0;
    testResults = runnerResult.testResults || [];

    if (Array.isArray(testResults) && testResults.length > 0) {
      passedCount = testResults.filter((test) => test.passed).length;
      if (status === 'Accepted' || status === 'Wrong Answer') {
        status = passedCount === testResults.length ? 'Accepted' : 'Wrong Answer';
      }
    }
  } catch (error) {
    status = 'Runtime Error';
    stderr = error.message;
  }

  const score = Array.isArray(testResults) && testResults.length > 0
    ? Math.round((problem.maxScore * passedCount) / testResults.length)
    : 0;

  return { status, stdout, stderr, executionTimeMs, testResults, score };
};

router.post('/compile', authenticate, async (req, res) => {
  const { problemId, contestId, sourceCode, language = 'python' } = req.body;

  const { errors, normalizedLanguage } = validateSubmissionPayload({
    problemId,
    contestId,
    sourceCode,
    language,
  });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const { problem } = await ensureProblemAndContest(contestId, problemId, normalizedLanguage);
    const evaluation = await evaluateSolution(problem, normalizedLanguage, sourceCode);

    return res.json({ ...evaluation, isCompilation: true });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    return res.status(statusCode).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { problemId, contestId, sourceCode, language = 'python' } = req.body;

  const { errors, normalizedLanguage } = validateSubmissionPayload({
    problemId,
    contestId,
    sourceCode,
    language,
  });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const { problem } = await ensureProblemAndContest(contestId, problemId, normalizedLanguage);

    const submission = await Submission.create({
      userId: req.user._id,
      problemId,
      contestId,
      language: normalizedLanguage,
      sourceCode,
      status: 'Pending',
    });

    await Contest.updateOne(
      { _id: contestId },
      { $addToSet: { participants: req.user._id, problemsList: problemId } },
    );

    const evaluation = await evaluateSolution(problem, normalizedLanguage, sourceCode);

    submission.status = evaluation.status;
    submission.score = evaluation.score;
    submission.stdout = evaluation.stdout;
    submission.stderr = evaluation.stderr;
    submission.executionTimeMs = evaluation.executionTimeMs;
    submission.testResults = evaluation.testResults;
    await submission.save();

    if (submission.status === 'Accepted') {
      const previousBest = await Submission.findOne({
        _id: { $ne: submission._id },
        userId: req.user._id,
        problemId,
        contestId,
        status: 'Accepted',
      })
        .sort({ score: -1 })
        .lean();

      const previousScore = previousBest?.score ?? 0;
      const delta = Math.max(0, submission.score - previousScore);
      if (delta > 0) {
        await awardUserScore(req.user._id, delta);
      }
    }

    await refreshContestScoreboard(contestId);

    const responsePayload = { ...submission.toObject(), isCompilation: false };

    return res.status(201).json(responsePayload);
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    return res.status(statusCode).json({ error: error.message });
  }
});

router.get('/contest/:contestId/scoreboard', optionalAuth, async (req, res) => {
  try {
    const scoreboard = await getContestScoreboard(req.params.contestId);
    if (!scoreboard) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    return res.json(scoreboard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/scoreboard', optionalAuth, async (_req, res) => {
  try {
    const scoreboard = await getGlobalScoreboard();
    return res.json(scoreboard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/contest/:contestId', authenticate, async (req, res) => {
  try {
    const submissions = await Submission.find({
      userId: req.user._id,
      contestId: req.params.contestId,
    })
      .sort({ createdAt: -1 })
      .populate('problemId', 'title');
    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('problemId', 'title')
      .populate('contestId', 'title');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json(submission);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;


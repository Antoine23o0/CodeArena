import express from 'express';
import Contest from '../models/contest.js';
import Problem from '../models/problem.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const SUPPORTED_LANGUAGES = ['python', 'java', 'c'];

const sanitizeLanguages = (value) => {
  if (!Array.isArray(value)) {
    return null;
  }
  const normalized = value
    .map((lang) => `${lang}`.toLowerCase())
    .filter((lang) => SUPPORTED_LANGUAGES.includes(lang));
  if (normalized.length === 0) {
    return [...SUPPORTED_LANGUAGES];
  }
  return normalized;
};

router.post('/', authenticate, async (req, res) => {
  try {
    const problem = new Problem(req.body);
    const allowedLanguages = sanitizeLanguages(req.body.allowedLanguages);
    if (allowedLanguages) {
      problem.allowedLanguages = allowedLanguages;
    }
    await problem.save();

    if (problem.contest) {
      await Contest.updateOne(
        { _id: problem.contest },
        { $addToSet: { problemsList: problem._id } },
      );
    }

    return res.status(201).json(problem);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/', optionalAuth, async (_req, res) => {
  try {
    const problems = await Problem.find().populate('contest', 'title startDate endDate');
    return res.json(problems);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/contest/:contestId', optionalAuth, async (req, res) => {
  try {
    const problems = await Problem.find({ contest: req.params.contestId }).populate(
      'contest',
      'title',
    );
    return res.json(problems);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate('contest', 'title');
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    return res.json(problem);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const previous = await Problem.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    Object.assign(previous, req.body);
    const allowedLanguages = sanitizeLanguages(req.body.allowedLanguages);
    if (allowedLanguages) {
      previous.allowedLanguages = allowedLanguages;
    }
    await previous.save();

    if (previous.contest) {
      await Contest.updateOne(
        { _id: previous.contest },
        { $addToSet: { problemsList: previous._id } },
      );
    }

    return res.json(previous);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    if (problem.contest) {
      await Contest.updateOne(
        { _id: problem.contest },
        { $pull: { problemsList: problem._id } },
      );
    }

    return res.json({ message: 'Problem deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

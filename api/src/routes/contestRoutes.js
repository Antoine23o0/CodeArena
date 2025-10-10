import express from 'express';
import Contest from '../models/contest.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const contest = new Contest(req.body);
    await contest.save();
    res.status(201).json(contest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const contests = await Contest.find().sort({ difficultyOrder: 1, startDate: 1 });
    const updates = contests.filter((contest) => updateContestStatus(contest));
    await Promise.all(updates.map((contest) => contest.save()));
    return res.json(contests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ difficultyOrder: 1, startDate: 1 });
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
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    res.json(contest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    res.json(contest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    res.json({ message: 'Contest deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


import express from 'express';
import Contest from '../models/contest.js';
const router = express.Router();

// Create
router.post('/', async (req, res) => {
    try {
        const contest = new Contest(req.body);
        await contest.save();
        res.status(201).json(contest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Real all
router.get('/', async (req, res) => {
    try {
        const contests = await Contest.find();
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active contests
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const contests = await Contest.find({ startDate: { $lte: now }, EndDate: { $gte: now } });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read specific
router.get('/:id', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        res.json({ message: 'Contest deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active contests
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const contests = await Contest.find({ startDate: { $lte: now }, endDate: { $gte: now } });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
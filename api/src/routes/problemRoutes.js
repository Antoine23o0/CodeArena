import express from 'express';
import Problem from '../models/problem.js';
const router = express.Router();

// Create
router.post('/', async (req, res) => {
    try {
        const problem = new Problem(req.body);
        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find().populate('contest');
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read by ID
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('contest');
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.json({ message: 'Problem deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read by Contest ID
router.get('/contest/:contestId', async (req, res) => {
    try {
        const problems = await Problem.find({ contest: req.params.contestId}).populate('contest');
        res.json(problems);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

export default router;

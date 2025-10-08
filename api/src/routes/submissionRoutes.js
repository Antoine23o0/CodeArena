import express from 'express';
import Submission from '../models/submission.js';
const router = express.Router();

// Create
router.post('/', async (req, res) => {
    try {
        const submission = new Submission(req.body);
        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all
router.get('/', async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('userId')
            .populate('problemId')
            .populate('eventId');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read by ID
router.get('/:id', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('user')
            .populate('problem');
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const submission = await Submission.findByIdAndDelete(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json({ message: 'Submission deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read submissions by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId})
            .populate('problemId')
            .populate('eventId')
            .populate('userId');
            res.json(submissions);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.get('/problem/:problemId', async (req, res) => {
    try {
        const submissions = await Submission.find({ problemId: req.params.problemId})
            .populate('userId')
            .populate('eventId');
            res.json(submissions);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

export default router;

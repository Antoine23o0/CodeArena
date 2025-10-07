import Submission from '../models/submission.js';
const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
    try {
        const submission = new Submission(req.body);
        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// READ all
router.get('/', async (req, res) => {
    try {
        const submissions = await find()
            .populate('user')
            .populate('problem');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ by ID
router.get('/:id', async (req, res) => {
    try {
        const submission = await findById(req.params.id)
            .populate('user')
            .populate('problem');
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const submission = await findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const submission = await findByIdAndDelete(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json({ message: 'Submission deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

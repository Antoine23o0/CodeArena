import Problem from '../models/problem.js';
const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
    try {
        const problem = new Problem(req.body);
        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// READ all
router.get('/', async (req, res) => {
    try {
        const problems = await find().populate('contest');
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ by ID
router.get('/:id', async (req, res) => {
    try {
        const problem = await findById(req.params.id).populate('contest');
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const problem = await findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) return res.status(404).json({ error: 'Probleme not found' });
        res.json(problem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const problem = await findByIdAndDelete(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Probleme not found' });
        res.json({ message: 'Probleme deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

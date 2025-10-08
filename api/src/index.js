import express from 'express';
import authRoutes from './routes/authRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

const router = express.Router();

router.use('/users', authRoutes);
router.use('/contests', contestRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);

export default router;

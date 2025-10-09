// Import modules
import dotenv from 'dotenv';
import express from 'express';
import apiRouter from './routes/index.js';

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Error handler (during tests, include stack)
app.use((err, req, res, next) => {
	console.error(err.stack || err);
	if (process.env.NODE_ENV === 'test') {
		return res.status(500).json({ error: err.message, stack: err.stack });
	}
	return res.status(500).json({ error: err.message });
});

export default app;

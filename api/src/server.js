// Import modules
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import apiRouter from './index.js';

dotenv.config();

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

// Routes
app.use('/api', apiRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

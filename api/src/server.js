// Import modules
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';

// Init express app
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/codearena';

// Middlewares
app.use(cors());
app.use(json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 API CodeArena is running!' });
});

// Connect to mongo and start server
connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

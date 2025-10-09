import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './server.js';
import { fileURLToPath } from 'url';

dotenv.config();

const PORT = process.env.PORT || 3000;
// prefer explicit IPv4 fallback to avoid ::1/IPv6 connection attempts
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/codearena';

async function start() {
  try {
    mongoose.set('strictQuery', false);

    //console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {});

    //console.log('Connected to MongoDB');

    const server = app.listen(PORT, () => {
      //console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      //console.log('Shutting down...');
      await mongoose.disconnect();
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Do NOT auto-start on import. Start only when executed directly and not during tests.
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && process.argv[1] === __filename && process.env.NODE_ENV !== 'test') {
  start();
}

// export start for manual invocation by scripts/tests if needed
export default start;


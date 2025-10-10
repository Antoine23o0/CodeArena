// Import modules
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import apiRouter from './index.js';
import registerSocketHandlers from './socket.js';
import eventBus, { EVENTS } from './services/eventBus.js';
import { seedPredefinedContests } from './services/contestSeeder.js';

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use(express.json());

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret';
}

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://root:rootpassword@mongo:27017/codearena?authSource=admin';
mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    if (process.env.AUTO_SEED_CONTESTS !== 'false') {
      await seedPredefinedContests({ logger: console });
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  },
});

registerSocketHandlers(io);

eventBus.on(EVENTS.CONTEST_SCOREBOARD_UPDATED, ({ contestId, scoreboard }) => {
  io.to(`contest:${contestId}`).emit('scoreboard:update', { contestId, scoreboard });
});

eventBus.on(EVENTS.GLOBAL_SCOREBOARD_UPDATED, ({ scoreboard }) => {
  io.to('scoreboard:global').emit('scoreboard:update', { contestId: 'global', scoreboard });
});

// Routes
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

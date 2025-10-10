// Import modules
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
<<<<<<< HEAD
import apiRouter from './routes/index.js';
=======
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import apiRouter from './index.js';
import registerSocketHandlers from './socket.js';
import eventBus, { EVENTS } from './services/eventBus.js';
import { seedPredefinedContests } from './services/contestSeeder.js';
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh

dotenv.config();

const app = express();

<<<<<<< HEAD
//Autorise le JSON dans les requêtes
app.use(express.json());

//Active CORS (autorise ton frontend à communiquer avec ton API)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // utile si tu gères des cookies / tokens plus tard
  })
);
=======
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
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh

//Routes principales
app.use('/api', apiRouter);

<<<<<<< HEAD
//Middleware global d’erreur
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  if (process.env.NODE_ENV === 'test') {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
  return res.status(500).json({ error: err.message });
=======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
});

export default app;

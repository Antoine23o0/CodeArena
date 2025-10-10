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

dotenv.config();

const app = express();

// Handle CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json());

// Default JWT secret for dev
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret';
}

// MongoDB connection
const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://root:rootpassword@mongo:27017/codearena?authSource=admin';

mongoose
  .connect(mongoUri)
  .then(() => console.log(`✅ Connected to MongoDB at ${mongoUri}`))
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Create HTTP + Socket.io server
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  },
});

// Register socket handlers
registerSocketHandlers(io);

// API routes
app.use('/api', apiRouter);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Import modules
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';

dotenv.config();

const app = express();

//Autorise le JSON dans les requêtes
app.use(express.json());

//Active CORS (autorise ton frontend à communiquer avec ton API)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // utile si tu gères des cookies / tokens plus tard
  })
);

//Routes principales
app.use('/api', apiRouter);

//Middleware global d’erreur
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  if (process.env.NODE_ENV === 'test') {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
  return res.status(500).json({ error: err.message });
});

export default app;

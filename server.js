// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Exemple de route
app.get('/', (req, res) => {
  res.send('API CodeArena running ');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(5000, () => console.log('✅ Server running on port 5000'));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

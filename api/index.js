import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './src/server.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';

mongoose.connect(mongoUri)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

export default app;

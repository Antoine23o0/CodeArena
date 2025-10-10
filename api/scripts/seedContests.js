import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedPredefinedContests } from '../src/services/contestSeeder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://root:rootpassword@mongo:27017/codearena?authSource=admin';

const run = async () => {
  await mongoose.connect(mongoUri);
  await seedPredefinedContests();
  await mongoose.disconnect();
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed contests', error);
    process.exit(1);
  });

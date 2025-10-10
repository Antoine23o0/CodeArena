import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import contestSeeds from './contestSeeds.js';
import Contest from '../src/models/contest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://root:rootpassword@mongo:27017/codearena?authSource=admin';

const computeStatus = (startDate, endDate) => {
  const now = new Date();
  if (now < startDate) {
    return 'scheduled';
  }
  if (now > endDate) {
    return 'finished';
  }
  return 'running';
};

const run = async () => {
  await mongoose.connect(mongoUri);

  for (const seed of contestSeeds) {
    const data = {
      ...seed,
      startDate: new Date(seed.startDate),
      endDate: new Date(seed.endDate),
    };
    data.status = computeStatus(data.startDate, data.endDate);

    const existing = await Contest.findOne({ title: data.title });

    if (existing) {
      existing.description = data.description;
      existing.startDate = data.startDate;
      existing.endDate = data.endDate;
      existing.status = data.status;
      await existing.save();
      console.log(`Updated contest: ${data.title}`);
    } else {
      await Contest.create(data);
      console.log(`Created contest: ${data.title}`);
    }
  }

  console.log(`Contest seeding complete. Total contests processed: ${contestSeeds.length}`);
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

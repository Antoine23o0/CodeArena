import Contest from '../models/contest.js';
import contestSeeds from '../../scripts/contestSeeds.js';

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

const log = (logger, message) => {
  if (typeof logger?.info === 'function') {
    logger.info(message);
  } else if (typeof logger?.log === 'function') {
    logger.log(message);
  }
};

export const seedPredefinedContests = async ({ logger = console } = {}) => {
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
      existing.difficulty = data.difficulty;
      existing.difficultyOrder = data.difficultyOrder;
      await existing.save();
      log(logger, `Updated contest: ${data.title}`);
    } else {
      await Contest.create(data);
      log(logger, `Created contest: ${data.title}`);
    }
  }

  log(logger, `Contest seeding complete. Total contests processed: ${contestSeeds.length}`);
};

export default seedPredefinedContests;

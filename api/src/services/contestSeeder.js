import Contest from '../models/contest.js';
import Problem from '../models/problem.js';
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
    const { problems = [], ...contestData } = seed;
    const data = {
      ...contestData,
      startDate: new Date(contestData.startDate),
      endDate: new Date(contestData.endDate),
    };

    data.status = computeStatus(data.startDate, data.endDate);

    let contest = await Contest.findOne({ title: data.title });

    if (contest) {
      contest.description = data.description;
      contest.startDate = data.startDate;
      contest.endDate = data.endDate;
      contest.status = data.status;
      contest.difficulty = data.difficulty;
      contest.difficultyOrder = data.difficultyOrder;
      await contest.save();
      log(logger, `Updated contest: ${data.title}`);
    } else {
      contest = await Contest.create(data);
      log(logger, `Created contest: ${data.title}`);
    }

    const problemIds = [];

    for (const problemSeed of problems) {
      const testCases = Array.isArray(problemSeed.testCases)
        ? problemSeed.testCases.map((test) => ({
            input: `${test.input ?? ''}`,
            expectedOutput: `${test.expectedOutput ?? ''}`,
            hidden: Boolean(test.hidden),
          }))
        : [];

      let problem = await Problem.findOne({ title: problemSeed.title, contest: contest._id });

      if (!problem) {
        problem = new Problem({
          title: problemSeed.title,
          contest: contest._id,
        });
      }

      problem.description = problemSeed.description ?? '';
      problem.difficulty = problemSeed.difficulty ?? 'Easy';
      problem.maxScore = problemSeed.maxScore ?? 100;
      problem.timeLimitMs = problemSeed.timeLimitMs ?? 3000;
      problem.memoryLimitMb = problemSeed.memoryLimitMb ?? 256;
      problem.testCases = testCases;
      await problem.save();

      problemIds.push(problem._id);
      log(logger, `${problemSeed.title} synchronisé pour ${contest.title}`);
    }

    if (problemIds.length > 0) {
      await Problem.deleteMany({ contest: contest._id, _id: { $nin: problemIds } });
    }

    contest.problemsList = problemIds;
    await contest.save();
  }

  log(logger, `Contest seeding complete. Total contests processed: ${contestSeeds.length}`);
};

export default seedPredefinedContests;

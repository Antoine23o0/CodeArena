import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import Problem from '../src/models/problem.js';
import Submission from '../src/models/submission.js';
import User from '../src/models/user.js';
import Contest from '../src/models/contest.js';
import './test-setup.js'; // ensure in-memory mongo + mongoose connection

let mongod;

describe('Contest score aggregation', function() {
  this.timeout(20000);

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('aggregates best submission per user per problem and stores total in contest.scores', async () => {
    const p1 = await Problem.create({ title: 'P1', description: 'desc', maxScore: 100 });
    const p2 = await Problem.create({ title: 'P2', description: 'desc', maxScore: 50 });

    const userA = await User.create({ userName: 'A', password: 'pass' });
    const userB = await User.create({ userName: 'B', password: 'pass' });

    const contest = await Contest.create({ title: 'C1', startDate: new Date(), endDate: new Date(Date.now() + 1000000), problemsList: [p1._id, p2._id] });

    // userA: best on p1 = 100, p2 = 25 => total 125
  await Submission.create({ userId: userA._id, problemId: p1._id, eventId: contest._id, sourceCode: 'print("ok")', result: 'Success' });
  await Submission.create({ userId: userA._id, problemId: p2._id, eventId: contest._id, sourceCode: 'print("ok")', result: 'Tests failed' });

    // userB: best on p1 = 50 (Tests failed), p2 = 0 => total 50
  await Submission.create({ userId: userB._id, problemId: p1._id, eventId: contest._id, sourceCode: 'print("ok")', result: 'Tests failed' });
  await Submission.create({ userId: userB._id, problemId: p2._id, eventId: contest._id, sourceCode: 'print("ok")', result: 'Compilation error' });

    // Manually trigger recalculation
    await Contest.recalculateScores(contest._id);

    const updated = await Contest.findById(contest._id);
    const scores = updated.scores.reduce((acc, s) => { acc[s.userId.toString()] = s.totalScore; return acc; }, {});

    expect(scores[userA._id.toString()]).to.equal(125);
    expect(scores[userB._id.toString()]).to.equal(50);
  });
});

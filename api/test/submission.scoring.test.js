import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import Problem from '../src/models/problem.js';
import Submission from '../src/models/submission.js';
import User from '../src/models/user.js';

let mongod;

describe('Submission scoring', function() {
  this.timeout(10000);

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('calculates score based on problem.maxScore and result', async () => {
    const problem = await Problem.create({ title: 'P1', description: 'desc', maxScore: 50 });
    const user = await User.create({ userName: 'u1', password: 'pass' });

    const s1 = await Submission.create({ userId: user._id, problemId: problem._id, sourceCode: 'print()', result: 'Success' });
    expect(s1.score).to.equal(50);

    const s2 = await Submission.create({ userId: user._id, problemId: problem._id, sourceCode: 'print()', result: 'Tests failed' });
    expect(s2.score).to.equal(25);

    const s3 = await Submission.create({ userId: user._id, problemId: problem._id, sourceCode: 'print()', result: 'Compilation error' });
    expect(s3.score).to.equal(0);
  });
});

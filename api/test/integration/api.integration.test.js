import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/server.js';
import User from '../../src/models/user.js';
import Problem from '../../src/models/problem.js';
import Contest from '../../src/models/contest.js';
import Submission from '../../src/models/submission.js';

let mongod;
let server;

describe('API integration', function() {
  this.timeout(20000);

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    // Start express server on an ephemeral port
    server = app.listen(0);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    await server.close();
  });

  it('creates resources and recalculates contest scores via endpoints', async () => {
    // Create users
    const uA = await User.create({ userName: 'intA', password: 'pass' });
    const uB = await User.create({ userName: 'intB', password: 'pass' });

    // Create problems via model (no problem route for brevity)
    const p1 = await Problem.create({ title: 'P1', description: 'd', maxScore: 100 });
    const p2 = await Problem.create({ title: 'P2', description: 'd', maxScore: 50 });

    // Create contest
    const contest = await Contest.create({ title: 'C1', startDate: new Date(), endDate: new Date(Date.now() + 1000000), problemsList: [p1._id, p2._id] });

    // Submit via API
    const agent = request.agent(server);

    // Create submissions via API POST /api/submissions
    await agent.post('/api/submissions').send({ userId: uA._id, problemId: p1._id, eventId: contest._id, sourceCode: 'c', result: 'Success' }).expect(201);
    await agent.post('/api/submissions').send({ userId: uA._id, problemId: p2._id, eventId: contest._id, sourceCode: 'c', result: 'Tests failed' }).expect(201);
    await agent.post('/api/submissions').send({ userId: uB._id, problemId: p1._id, eventId: contest._id, sourceCode: 'c', result: 'Tests failed' }).expect(201);

    // Wait a tick for post-save hooks to run
    await new Promise(r => setTimeout(r, 200));

    const updated = await Contest.findById(contest._id);
    const scores = updated.scores.reduce((acc, s) => { acc[s.userId.toString()] = s.totalScore; return acc; }, {});

    expect(scores[uA._id.toString()]).to.equal(125);
    expect(scores[uB._id.toString()]).to.equal(50);
  });
});

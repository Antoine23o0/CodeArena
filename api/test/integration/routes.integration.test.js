import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { expect } from 'chai';

// Ensure JWT secret is set for auth routes
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

import app from '../../src/server.js';
import '../../test/test-setup.js'; // ensure in-memory mongo + mongoose connection

let mongod;
let server;

describe('Route integration tests', function() {
  this.timeout(20000);

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    server = app.listen(0);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    await server.close();
  });

  it('auth: register, login, profile', async () => {
    const agent = request.agent(server);
    // register
    const regRes = await agent.post('/api/users/register').send({ userName: 'routeUser', password: 'pwd' }).expect(201);
    expect(regRes.body).to.have.property('token');
    // login
    const loginRes = await agent.post('/api/users/login').send({ username: 'routeUser', password: 'pwd' }).expect(200);
    expect(loginRes.body).to.have.property('token');
    const token = loginRes.body.token;

    // profile
    const profileRes = await agent.get('/api/users/profile').set('Authorization', `Bearer ${token}`).expect(200);
    expect(profileRes.body).to.have.property('user');
    expect(profileRes.body.user).to.have.property('userName', 'routeUser');
  });

  it('problems: create, list, get, update, delete', async () => {
    const agent = request.agent(server);
    // create
    const create = await agent.post('/api/problems').send({ title: 'R1', description: 'd', maxScore: 10 }).expect(201);
    const pId = create.body._id;

    // list
    const list = await agent.get('/api/problems').expect(200);
    expect(Array.isArray(list.body)).to.be.true;

    // get
    const get = await agent.get(`/api/problems/${pId}`).expect(200);
    expect(get.body).to.have.property('title', 'R1');

    // update
    const upd = await agent.put(`/api/problems/${pId}`).send({ title: 'R1-upd' }).expect(200);
    expect(upd.body).to.have.property('title', 'R1-upd');

    // delete
    await agent.delete(`/api/problems/${pId}`).expect(200);
    await agent.get(`/api/problems/${pId}`).expect(404);
  });

  it('contests: create, list, get, active, update, delete', async () => {
    const agent = request.agent(server);
    // create problem to include
    const p = await agent.post('/api/problems').send({ title: 'C-P', description: 'd', maxScore: 5 }).expect(201);

    const now = new Date();
    const later = new Date(Date.now() + 1000000);

    // create contest
    const cRes = await agent.post('/api/contests').send({ title: 'Contest1', startDate: now.toISOString(), endDate: later.toISOString(), problemsList: [p.body._id] }).expect(201);
    const cId = cRes.body._id;

    // list
    const list = await agent.get('/api/contests').expect(200);
    expect(Array.isArray(list.body)).to.be.true;

    // get
    const get = await agent.get(`/api/contests/${cId}`).expect(200);
    expect(get.body).to.have.property('title', 'Contest1');

    // active
    const act = await agent.get('/api/contests/active').expect(200);
    expect(Array.isArray(act.body)).to.be.true;

    // update
    const upd = await agent.put(`/api/contests/${cId}`).send({ title: 'Contest1-upd' }).expect(200);
    expect(upd.body).to.have.property('title', 'Contest1-upd');

    // delete
    await agent.delete(`/api/contests/${cId}`).expect(200);
    await agent.get(`/api/contests/${cId}`).expect(404);
  });
});

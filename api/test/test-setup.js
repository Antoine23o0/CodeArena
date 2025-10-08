import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

before(async function () {
  // First-run mongod binary download can be slow — increase timeout
  this.timeout(120000);
  console.log('[TEST SETUP] starting');

  // If an existing mongoose connection is active, close it first
  if (mongoose.connection && mongoose.connection.readyState) {
    try {
      console.log('[TEST SETUP] disconnecting existing mongoose connection');
      await mongoose.disconnect();
    } catch (e) {
      console.warn('[TEST SETUP] warning while disconnecting previous mongoose connection:', e.message);
    }
  }

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('[TEST SETUP] mongod uri', uri);

    process.env.MONGODB_URI = uri;
    process.env.NODE_ENV = 'test';

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log('[TEST SETUP] mongoose connected');
  } catch (err) {
    console.error('[TEST SETUP] failed to start in-memory mongo', err);
    throw err;
  }
});

after(async function () {
  // allow more time for teardown
  this.timeout(30000);
  console.log('[TEST TEARDOWN] starting');

  try {
    if (mongoose.connection && mongoose.connection.readyState) {
      await mongoose.disconnect();
      console.log('[TEST TEARDOWN] mongoose disconnected');
    }
  } catch (e) {
    console.warn('[TEST TEARDOWN] error disconnecting mongoose:', e.message);
  }

  if (mongod) {
    try {
      await mongod.stop();
      console.log('[TEST TEARDOWN] mongod stopped');
    } catch (e) {
      console.warn('[TEST TEARDOWN] error stopping mongod:', e.message);
      // try force-stop if available
      try { await mongod.cleanup(); } catch(_) {}
    }
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});
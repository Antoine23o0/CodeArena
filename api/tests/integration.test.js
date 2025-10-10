import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/test-db';
let connectionError;

test.before(async () => {
  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 2000,
    });
  } catch (error) {
    connectionError = error;
  }
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('should connect to MongoDB successfully', (t) => {
  if (connectionError) {
    if (process.env.CI) {
      throw connectionError;
    }

    t.skip(`MongoDB not available locally: ${connectionError.message}`);
    return;
  }

  assert.equal(mongoose.connection.readyState, 1);
});

const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/test-db';

describe('MongoDB connection', () => {
  beforeAll(async () => {
    await mongoose.connect(mongoUrl);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('should connect to MongoDB successfully', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
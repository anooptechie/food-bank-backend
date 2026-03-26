const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Force test environment
process.env.NODE_ENV = "test";

// Load env
dotenv.config({ path: ".env.test" });

let mongoServer;

beforeAll(async () => {
  console.log("Starting in-memory MongoDB...");

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  console.log("Mongo Connected (in-memory)");
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop(); // 🔥 important
});
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Force test environment
process.env.NODE_ENV = "test";

// Load test env variables
dotenv.config({ path: ".env.test" });

// 🚨 Safety check (VERY IMPORTANT)
if (!process.env.MONGO_URI || !process.env.MONGO_URI.includes("127.0.0.1")) {
  throw new Error("Tests must run on local database only!");
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

// ✅ Clean ALL collections (not just User)
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

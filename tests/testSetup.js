const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Force test environment
process.env.NODE_ENV = "test";

// Load test env variables
dotenv.config({ path: ".env.test" });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

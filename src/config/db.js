const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connection Successful");
  } catch (error) {
    console.error("MongoDb Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/userModel");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Double check it's really gone
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (adminExists) {
      console.log("Admin still exists! Run the delete command again.");
      process.exit();
    }

    // 2. Manually hash the password here
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);

    // 3. Use insertMany to bypass the pre-save hook in userModel.js
    // This prevents the "Double Hashing" issue.
    await User.insertMany([
      {
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      },
    ]);

    console.log("Admin created successfully with a clean hash.");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

createAdmin();

//Mongoose automatically pluralizes and lowercases model names to form collection names.
//if you look at all the collection names in database, its lowercase and plural.

//Bootstrap scripts are meant to:
// Create the first admin
// Prevent accidental duplicates
// Be run once
// In real systems:
// There is usually one bootstrap admin
// All other admins are created by an existing admin

//One bootstrap admin is enough.
//After that, admins should create admins through controlled logic.

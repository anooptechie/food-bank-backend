const mongoose = require("mongoose");
const User = require("../src/models/userModel");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    console.log("Admin created successfully:");
    console.log({
      email: admin.email,
      role: admin.role,
    });

    process.exit();
  } catch (error) {
    console.error(error);
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
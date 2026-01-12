const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncError");
const AppError = require("../utils/appError")

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2. Find user and explicitly select password
  const user = await User.findOne({ email }).select("+password");

  // 3. Check if user exists and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 4. Generate token
  const token = signToken(user._id);

  // 5. Send response
  res.status(200).json({
    status: "success",
    token,
  });
});

// exports.signup = async (req, res) => {
//   try {
//     //create a new user
//     const newUser = await User.create({
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password,
//       role: "volunteer",
//     });
//     //Generate token so they are logged in immediately after sign up
//     const token = signToken(newUser._id);

//     res.status(201).json({
//       status: "success",
//       token,
//       data: {
//         user: newUser,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };

//jwt.sign(payload, secret, options)
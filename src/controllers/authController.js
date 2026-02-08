const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncError");
const AppError = require("../utils/appError");
const { signAccessToken, signRefreshToken } = require("../utils/token");

// ⚠️ NOTE:
// signToken is no longer used for login.
// We keep it for backward compatibility (if used elsewhere),
// but login now uses access + refresh tokens.
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = asyncErrorHandler(async (req, res, next) => {
  console.log("LOGIN ATTEMPT:", req.body.email);
  const { email, password } = req.body;

  // 1️⃣ Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2️⃣ Find user and explicitly select password
  const user = await User.findOne({ email }).select("+password");
  console.log("USER FOUND:", user ? user.email : "NONE");

  // 3️⃣ Check if user exists and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 4️⃣ Issue tokens
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // 5️⃣ Store refresh token on user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 6️⃣ Send response
  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
  });
});
exports.refresh = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  // 1️⃣ Refresh token must be provided
  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  // 2️⃣ Find user with matching refresh token
  const user = await User.findOne({
    _id: decoded.id,
    refreshToken,
  });

  if (!user) {
    return next(new AppError("Refresh token not recognized", 401));
  }

  // 3️⃣ Rotate tokens
  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);

  // 4️⃣ Persist new refresh token (rotation)
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  // 5️⃣ Respond
  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});
exports.logout = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncError");
const AppError = require("../utils/appError");
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
} = require("../utils/token");

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

  // 1️⃣ Validate input
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2️⃣ Find user
  const user = await User.findOne({ email }).select("+password");
  console.log("USER FOUND:", user ? user.email : "NONE");

  // 3️⃣ If user doesn't exist
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 🔓 Reset lock if expired
  if (user.lockUntil && user.lockUntil <= Date.now()) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  // 🔐 Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    return next(
      new AppError(
        "Account temporarily locked due to too many failed login attempts. Please try again later.",
        403,
      ),
    );
  }

  // 4️⃣ Check password
  const isPasswordCorrect = await user.correctPassword(password, user.password);

  if (!isPasswordCorrect) {
    user.loginAttempts += 1;

    // 🔴 Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    }

    await user.save({ validateBeforeSave: false });

    return next(new AppError("Incorrect email or password", 401));
  }

  // ✅ Successful login → reset attempts
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  // 5️⃣ Issue tokens
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id, user.tokenVersion);

  // 6️⃣ Store hashed refresh token
  user.refreshToken = hashToken(refreshToken);

  await user.save({ validateBeforeSave: false });

  // 7️⃣ Respond
  res.status(200).json({
    status: "success",

  // ✅ backward compatibility for tests
    token: accessToken,

  // ✅ actual system design
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

  // 2️⃣ Hash incoming token
  const hashedIncoming = hashToken(refreshToken);

  // 3️⃣ Find user by ID and explicitly select refreshToken + tokenVersion
  const user = await User.findById(decoded.id).select(
    "+refreshToken +tokenVersion",
  );

  // 4️⃣ Validate user exists
  if (!user) {
    return next(new AppError("User not found", 401));
  }

  // 🔴 5️⃣ Reuse detection (token mismatch)
  if (user.refreshToken !== hashedIncoming) {
    user.tokenVersion += 1; // invalidate all sessions
    user.refreshToken = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Refresh token reuse detected. Session invalidated.", 401),
    );
  }

  // 🔐 6️⃣ Token version check (prevents old tokens after rotation)
  if (user.tokenVersion !== decoded.tokenVersion) {
    return next(new AppError("Session invalidated. Please login again.", 401));
  }

  // 7️⃣ Rotate tokens
  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id, user.tokenVersion);

  // 8️⃣ Store hashed new refresh token
  user.refreshToken = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  // 9️⃣ Respond
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

  const { hashToken } = require("../utils/token");
  const hashedIncoming = hashToken(refreshToken);

  const user = await User.findOne({ refreshToken: hashedIncoming });

  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

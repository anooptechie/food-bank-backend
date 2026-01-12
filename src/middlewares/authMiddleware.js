const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncError");
const AppError = require("../utils/appError");

// PROTECT ROUTES
exports.protect = asyncErrorHandler(async (req, res, next) => {
  let token;

  // 1. Extract token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to get access.", 401)
    );
  }

  // 2. Verify token (JWT errors bubble to global handler)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // 4. Attach user to request
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

//Checking if user has LOGGED IN, VERIFYING THE TOKEN and make sure is not SOFT DELETED....moving onto restrictTO, if ROLE exists in req.user
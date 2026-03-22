// PROTECT ROUTES
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncError");
const AppError = require("../utils/appError");
const ROLE_PERMISSIONS = require("../utils/permissions");

// 🔐 PROTECT ROUTES
exports.protect = asyncErrorHandler(async (req, res, next) => {
  let token;

  // 1️⃣ Extract token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to get access.", 401),
    );
  }

  // 2️⃣ Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3️⃣ Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  // 🔐 4️⃣ Check if user is active
  if (!currentUser.isActive) {
    return next(
      new AppError("User account is deactivated. Please contact admin.", 403),
    );
  }

  // ✅ 5️⃣ Attach user
  req.user = currentUser;

  // ✅ 6️⃣ Attach permissions (NEW)
  req.user.permissions = ROLE_PERMISSIONS[currentUser.role] || [];

  next();
});

// 🔐 PERMISSION-BASED AUTHORIZATION (NEW)
exports.authorize = (action, resource) => {
  return (req, res, next) => {
    const permission = `${resource}:${action}`;

    if (!req.user.permissions.includes(permission)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }

    next();
  };
};

// 🔁 (KEEP FOR NOW — backward compatibility)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

//Checking if user has LOGGED IN, VERIFYING THE TOKEN and make sure is not SOFT DELETED....moving onto restrictTO, if ROLE exists in req.user

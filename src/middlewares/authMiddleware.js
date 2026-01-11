const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// PROTECTING ROUTES
exports.protect = async (req, res, next) => {
  try {
    let token;

    //1. EXTRACT TOKEN FROM AUTHORIZATION HEADER
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please login to get access.",
      });
    }

    //2. VERIFY TOKEN
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    //3. CHECK IF USER STILL EXISTS
    const currentUser = await User.findById(decode.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    //4. ATTACH USER TO REQUEST
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by protect middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

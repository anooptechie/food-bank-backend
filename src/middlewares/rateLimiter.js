const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// 🔴 Strict limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    status: "fail",
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🟡 Moderate limiter for refresh
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: "fail",
    message: "Too many refresh requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🌍 Global limiter (for all routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    logger.warn(
      {
        requestId: req.requestId,
        ip: req.ip,
        url: req.originalUrl,
      },
      "Global rate limit exceeded",
    );

    res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later",
    });
  },
});

// 🔴 Strict limiter (for critical routes)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,

  handler: (req, res) => {
    logger.warn(
      {
        requestId: req.requestId,
        ip: req.ip,
        url: req.originalUrl,
      },
      "Strict rate limit exceeded",
    );

    res.status(429).json({
      status: "error",
      message: "Too many requests (strict limit)",
    });
  },
});

module.exports = {
  loginLimiter,
  refreshLimiter,
  globalLimiter,
  strictLimiter,
};

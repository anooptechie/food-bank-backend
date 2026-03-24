const logger = require("../utils/logger");

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // 🔥 CENTRALIZED ERROR LOG
  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      errorMessage: err.message,
      stack: err.stack,
    },
    "Request Error",
  );

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = globalErrorHandler;

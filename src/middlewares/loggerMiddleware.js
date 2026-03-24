const logger = require("../utils/logger");
const { recordRequest } = require("../utils/metrics");

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    recordRequest(req.originalUrl, req.method, duration, res.statusCode);

    logger.info(
      {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
      },
      "HTTP Request",
    );
  });

  next();
};

module.exports = loggerMiddleware;

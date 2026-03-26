const redis = require("../utils/redisClient");
const logger = require("../utils/logger");

const cacheMiddleware = async (req, res, next) => {
  console.log("🚀 Cache middleware triggered"); // 👈 ADD HERE (FIRST LINE)
  const key = `cache:${req.originalUrl}`;

  try {
    const cachedData = await redis.get(key);

    if (cachedData) {
      logger.info({ key }, "Cache HIT");
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.info({ key }, "Cache MISS"); 
    // store key for later use
    res.locals.cacheKey = key;

    next();
  } catch (err) {
    console.error("Cache error:", err);
    next();
  }
};

module.exports = cacheMiddleware;
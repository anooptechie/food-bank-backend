const redis = require("../utils/redisClient");

const cacheMiddleware = async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;

  try {
    const cachedData = await redis.get(key);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // store key for later use
    res.locals.cacheKey = key;

    next();
  } catch (err) {
    console.error("Cache error:", err);
    next();
  }
};

module.exports = cacheMiddleware;
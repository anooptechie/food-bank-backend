const redis = require("./redisClient");

const clearInventoryCache = async () => {
  const keys = await redis.keys("cache:/api/inventory*");

  if (keys.length > 0) {
    logger.info({ keys }, "Cache INVALIDATED");
    await redis.del(keys);
  }
};

module.exports = {
  clearInventoryCache,
};
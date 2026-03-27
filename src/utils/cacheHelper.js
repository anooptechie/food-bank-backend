const redis = require("./redisClient");
const logger = require("./logger");

const clearInventoryCache = async () => {
  if (!redis) return;

  let cursor = "0";
  const pattern = "cache:/api/inventory*";

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);

        logger.info(
          { keysDeleted: keys.length },
          "Cache INVALIDATED (partial)"
        );
      }

    } while (cursor !== "0");

  } catch (err) {
    logger.error("Cache invalidation failed", {
      error: err.message,
    });
  }
};

module.exports = {
  clearInventoryCache,
};
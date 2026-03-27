async function deleteKeysByPattern(redis, pattern) {
  let cursor = "0";

  do {
    const result = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);

    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      await redis.del(...keys);
    }

  } while (cursor !== "0");
}

module.exports = {
  deleteKeysByPattern,
};
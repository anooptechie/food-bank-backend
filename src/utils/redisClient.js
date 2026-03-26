const Redis = require("ioredis");

let redisClient = null;

// 🚨 Disable Redis in test environment
if (process.env.NODE_ENV !== "test") {
  redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on("connect", () => {
    console.log("Redis Connected");
  });

  redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });
} else {
  console.log("Redis disabled in test environment");
}

module.exports = redisClient;
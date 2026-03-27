const mongoose = require("mongoose");
const { createClient } = require("redis");

let redisClient;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    });
  }
  return redisClient;
};

exports.getHealthStatus = async (req, res) => {
  const services = {
    mongodb: "down",
    redis: "down",
    queue: "down",
  };

  // 🔹 Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      services.mongodb = "up";
    }
  } catch (err) {}

  // 🔹 Check Redis
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    await client.ping();
    services.redis = "up";
  } catch (err) {}

  // 🔹 Check Queue (BullMQ uses Redis)
  try {
    if (services.redis === "up") {
      services.queue = "up";
    }
  } catch (err) {}

  // 🔹 Final status
  const overallStatus =
    services.mongodb === "up" &&
    services.redis === "up" &&
    services.queue === "up"
      ? "ok"
      : "degraded";

  return res.status(200).json({
    status: overallStatus,
    services,
  });
};
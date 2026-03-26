const { Queue } = require("bullmq");

let auditQueue = null;

if (process.env.NODE_ENV !== "test") {
  const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  };

  auditQueue = new Queue("auditQueue", { connection });
}

module.exports = auditQueue;
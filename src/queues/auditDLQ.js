const { Queue } = require("bullmq");

let auditDLQ = null;

if (process.env.NODE_ENV !== "test") {
  auditDLQ = new Queue("audit-dlq", {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  });
}

module.exports = auditDLQ;
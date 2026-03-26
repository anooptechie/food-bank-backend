const { Worker } = require("bullmq");
const emitAuditEvent = require("../audit/auditEmitter");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker(
  "auditQueue",
  async (job) => {
    if (job.name === "audit.log") {
      await emitAuditEvent(job.data);
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Audit job done: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Audit job failed: ${job.id}`, err.message);
});
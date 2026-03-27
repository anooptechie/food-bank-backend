const { Worker } = require("bullmq");
const emitAuditEvent = require("../audit/auditEmitter");
const auditDLQ = require("../queues/auditDLQ");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

if (process.env.NODE_ENV !== "test") {
  const worker = new Worker(
    "auditQueue",
    async (job) => {
      // if (job.name === "audit.log") {
      //   await emitAuditEvent(job.data);
      // }
      if (job.name === "audit.log") {
        throw new Error("DLQ test failure");
      }
    },
    { connection }
  );

  // ✅ SUCCESS
  worker.on("completed", (job) => {
    console.log(`Audit job done: ${job.id}`);
  });

  // 🔥 FAILURE → DLQ
  worker.on("failed", async (job, err) => {
    console.error(`Audit job failed: ${job.id}`, err.message);

    // ✅ ONLY move to DLQ on FINAL attempt
    if (job.attemptsMade === job.opts.attempts) {
      if (auditDLQ) {
        try {
          const dlqJob = await auditDLQ.add("audit.failed", {
            originalJobId: job.id,
            data: job.data,
            failedReason: err.message,
            timestamp: new Date().toISOString(),
          });

          console.log(`Moved job ${job.id} to DLQ as DLQ Job ID: ${dlqJob.id}`);
        } catch (dlqError) {
          console.error("Failed to move job to DLQ", dlqError.message);
        }
      }
    }
  });
}
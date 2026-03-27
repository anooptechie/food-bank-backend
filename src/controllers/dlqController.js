const auditDLQ = require("../queues/auditDLQ");
const auditQueue = require("../queues/auditQueue");
const logger = require("../utils/logger");

exports.replayFailedJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    if (!auditDLQ || !auditQueue) {
      return res.status(500).json({
        status: "error",
        message: "Queue system not available",
      });
    }

    // 🔍 Get job from DLQ
    const job = await auditDLQ.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        status: "fail",
        message: "DLQ job not found",
      });
    }

    const jobData = job.data;

    // 🚀 Push back to main queue
    await auditQueue.add("audit.log", jobData.data, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 500,
      },
    });

    logger.info("Replayed DLQ job", {
      originalJobId: jobId,
    });

    return res.status(200).json({
      status: "success",
      message: "Job replayed successfully",
    });

  } catch (error) {
    next(error);
  }
};
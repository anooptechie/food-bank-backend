const Outbox = require("../models/outboxModel");
const auditQueue = require("../queues/auditQueue");
const logger = require("../utils/logger");

const POLL_INTERVAL = 5000; // every 5 seconds

const processOutbox = async () => {
    try {
        const events = await Outbox.find({ status: "pending" }).limit(10);

        for (const event of events) {
            try {
                // 🚀 Push to queue
                await auditQueue.add("audit.log", event.payload, {
                    attempts: 5,
                    backoff: {
                        type: "exponential",
                        delay: 500,
                    },
                });

                // ✅ ADD THIS LOG (NEW)
                logger.info("Outbox → Queue success", {
                    eventId: event._id,
                    eventType: event.eventType,
                });

                // ✅ Mark as processed
                event.status = "processed";
                await event.save();

                logger.info("Outbox event processed", {
                    eventId: event._id,
                });

            } catch (err) {
                // ❌ Mark failure
                event.attempts += 1;
                event.lastError = err.message;

                if (event.attempts >= 5) {
                    event.status = "failed";
                }

                await event.save();

                logger.error("Outbox processing failed", {
                    eventId: event._id,
                    error: err.message,
                });
            }
        }

    } catch (err) {
        logger.error("Outbox worker error", err);
    }
};

// 🔁 Run periodically
setInterval(processOutbox, POLL_INTERVAL);
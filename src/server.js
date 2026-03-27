const dotenv = require("dotenv");
// require("./worker/inventoryWorker");
// Load correct env file based on NODE_ENV
require("dotenv").config();
console.log("ENV:", process.env.NODE_ENV);

const app = require("./app");
if (process.env.NODE_ENV !== "test") {
  require("./worker/inventoryWorker");
  require("./worker/auditWorker");
  require("./worker/outboxWorker");
}
const connectDB = require("./config/db");

// Import job controls (Phase 3)
const {
  startInventoryAlertsJob,
  stopInventoryAlertsJob,
} = require("./jobs/inventoryAlertsJob");

// Connect to database
connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} [${process.env.NODE_ENV || "development"} mode]`,
  );

  // STEP 2: Explicit, env-gated job start
  if (process.env.ENABLE_INVENTORY_ALERTS_JOB === "true") {
    startInventoryAlertsJob();
  }
});

// STEP 3: Clean shutdown handling
const shutdown = () => {
  console.log("Gracefully shutting down...");

  stopInventoryAlertsJob();

  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

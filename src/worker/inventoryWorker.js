const { Worker } = require("bullmq");
const InventoryItem = require("../models/inventoryModel");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker(
  "inventoryQueue",
  async (job) => {
    if (job.name === "inventory.updated") {
      const { itemId } = job.data;

      const item = await InventoryItem.findById(itemId);

      if (!item) return;

      if (item.quantity < item.minThreshold) {
        console.log(`⚠️ Low stock: ${item.name}`);
      }

      const today = new Date();
      const next7Days = new Date();
      next7Days.setDate(today.getDate() + 7);

      if (item.expiryDate <= next7Days) {
        console.log(`⏰ Expiring soon: ${item.name}`);
      }
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}`, err.message);
});
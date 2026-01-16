const cron = require("node-cron");
const InventoryItem = require("../models/inventoryModel");

const runInventoryAlertsJob = async () => {
  console.log("Running inventory alerts job...");

  // Low stock items
  const lowStockItems = await InventoryItem.find({
    $expr: { $lt: ["$quantity", "$minThreshold"] },
  });

  // Expiring items (next 7 days)
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const expiringItems = await InventoryItem.find({
    expiryDate: { $lte: next7Days },
  });

  if (lowStockItems.length > 0) {
    console.log(`⚠️ Low stock items: ${lowStockItems.length}`);
  }

  if (expiringItems.length > 0) {
    console.log(`⏰ Expiring soon items: ${expiringItems.length}`);
  }

  console.log("Inventory alerts job completed.");
};

cron.schedule("*/1 * * * *", async () => {
  try {
    await runInventoryAlertsJob();
  } catch (err) {
    console.error("Inventory alerts job failed:", err.message);
  }
});

module.exports = {};
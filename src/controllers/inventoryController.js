exports.testInventory = (req, res) => {
  res.json({
    status: "success",
    message: "Inventory controller is working",
  });
};
const InventoryItem = require("../models/inventoryModel");

exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      $expr: { $lt: ["$quantity", "$minThreshold"] },
    });

    res.status(200).json({
      status: "success",
      results: lowStockItems.length,
      data: {
        items: lowStockItems,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

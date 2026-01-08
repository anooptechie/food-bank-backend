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

exports.getExpiringItems = async (req, res) => {
  try {
    const today = new Date();

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringItems = await InventoryItem.find({
      expiryDate: {
        $gte: today,
        $lte: sevenDaysFromNow,
      },
    });
    res.status(200).json({
      status: "success",
      results: expiringItems.length,
      data: {
        items: expiringItems,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};

exports.addItems = async (req, res) => {
  try {
    const newItem = await InventoryItem.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        item: newItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

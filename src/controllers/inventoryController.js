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
      isDeleted: false,
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
      isDeleted: false,
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

exports.updateInventoryItem = async (req, res) => {
  try {
    //defining all the fields that are not allowed to be updated
    const restrictedFields = ["name", "category"];

    //check if any key/field in the incoming request is matching with restrictedFields
    const attemptedFields = Object.keys(req.body).filter((key) =>
      restrictedFields.includes(key)
    );

    //Strict Mode Removed
    // if (attemptedFields.length > 0) {
    //   return res.status(400).json({
    //     status: "Error",
    //     message: `${attemptedFields.join(", ")} fields are not allowed to be updated.`,
    //   });
    // }

    //Only proceed if restricted fields are not present
    // const { quantity, minThreshold, expiryDate } = req.body;
    // const updates = { quantity, minThreshold, expiryDate };

    const allowedUpdateFields = ["quantity", "minThreshold", "expiryDate"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdateFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Only quantity, minThreshold, or expiryDate can be updated",
      });
    }

    const updatedItem = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updates,
      {
        new: true, //returns updated document
        runValidators: true, //schema rules enforced
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        status: "fail",
        message: "Inventory item not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        item: updatedItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.softDeleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Inventory item not found or already deleted",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Inventory item soft deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

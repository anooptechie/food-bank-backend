const InventoryItem = require("../models/inventoryModel");
const AppError = require("../utils/appError");
const emitAuditEvent = require("../audit/auditEmitter");
const { INVENTORY_UPDATED } = require("../audit/auditEvent.types");
const logger = require("../utils/logger");

// 🔹 INCREMENT
exports.incrementItem = async (id, amount, requestId) => {
  try {
    const updatedItem = await InventoryItem.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        $inc: { quantity: amount },
      },
      { new: true },
    );

    if (!updatedItem) {
      throw new AppError("Inventory item not found", 404);
    }

    // ✅ Success log
    logger.info("Inventory incremented", {
      requestId,
      itemId: id,
      amount,
      newQuantity: updatedItem.quantity,
    });

    return updatedItem;
  } catch (error) {
    // ❌ Error log

    throw error;
  }
};

// 🔹 DECREMENT
exports.decrementItem = async (id, amount, requestId) => {
  try {
    const updatedItem = await InventoryItem.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
        quantity: { $gte: amount },
      },
      {
        $inc: { quantity: -amount },
      },
      { new: true },
    );

    if (!updatedItem) {
      throw new AppError("Insufficient stock or item not found", 400);
    }

    // ✅ Success log
    logger.info("Inventory decremented", {
      requestId,
      itemId: id,
      amount,
      newQuantity: updatedItem.quantity,
    });

    return updatedItem;
  } catch (error) {
    throw error;
  }
};

// 🔹 UPDATE
exports.updateItem = async (id, updates, userId, requestId) => {
  try {
    // Fetch existing item
    const existingItem = await InventoryItem.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingItem) {
      throw new AppError("Inventory item not found", 404);
    }

    // Perform update
    const updatedItem = await InventoryItem.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    // Emit audit event
    emitAuditEvent({
      actorId: userId,
      action: INVENTORY_UPDATED,
      resourceType: "InventoryItem",
      resourceId: updatedItem._id,
      metadata: {
        updatedFields: Object.keys(updates),
        before: {
          quantity: existingItem.quantity,
          minThreshold: existingItem.minThreshold,
          expiryDate: existingItem.expiryDate,
        },
        after: {
          quantity: updatedItem.quantity,
          minThreshold: updatedItem.minThreshold,
          expiryDate: updatedItem.expiryDate,
        },
      },
    });

    // ✅ Success log
    logger.info("Inventory updated", {
      requestId,
      itemId: id,
      updatedFields: Object.keys(updates),
      userId,
    });

    return updatedItem;
  } catch (error) {
    // ❌ Error log

    throw error;
  }
};

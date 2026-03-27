const InventoryItem = require("../models/inventoryModel");
const AppError = require("../utils/appError");
const emitAuditEvent = require("../audit/auditEmitter");
const { INVENTORY_UPDATED } = require("../audit/auditEvent.types");
const logger = require("../utils/logger");
const { clearInventoryCache } = require("../utils/cacheHelper");
const auditQueue = require("../queues/auditQueue")
const Outbox = require("../models/outboxModel");

// 🔹 INCREMENT
exports.incrementItem = async (id, amount, requestId, userId) => {
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

    await Outbox.create({
      eventType: "inventory.updated",
      payload: {
        actorId: userId,
        action: INVENTORY_UPDATED,
        resourceType: "InventoryItem",
        resourceId: updatedItem._id,
        metadata: {
          type: "increment",
          amount,
          newQuantity: updatedItem.quantity,
        },
      },
    });

    // ✅ Success log
    logger.info("Inventory incremented", {
      requestId,
      itemId: id,
      amount,
      newQuantity: updatedItem.quantity,
    });

    await clearInventoryCache();

    return updatedItem;

  } catch (error) {
    // ❌ Error log

    throw error;
  }
};

// 🔹 DECREMENT
exports.decrementItem = async (id, amount, requestId, userId) => {
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

    await Outbox.create({
      eventType: "inventory.updated",
      payload: {
        actorId: userId,
        action: INVENTORY_UPDATED,
        resourceType: "InventoryItem",
        resourceId: updatedItem._id,
        metadata: {
          type: "decrement",
          amount,
          newQuantity: updatedItem.quantity,
        },
      },
    });


    // ✅ Success log
    logger.info("Inventory decremented", {
      requestId,
      itemId: id,
      amount,
      newQuantity: updatedItem.quantity,
    });

    await clearInventoryCache();

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
    await Outbox.create({
      eventType: "inventory.updated",
      payload: {
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
      },
    });

    // ✅ Success log
    logger.info("Inventory updated", {
      requestId,
      itemId: id,
      updatedFields: Object.keys(updates),
      userId,
    });

    await clearInventoryCache();

    return updatedItem;



  } catch (error) {
    // ❌ Error log

    throw error;
  }
};

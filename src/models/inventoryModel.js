const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "Others",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
    },
    minThreshold: {
      type: Number,
      required: [true, "Minimum Threshold is required"],
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry Date is required"],
    },
  },
  {
    timestamps: true, //automatically adds createdAt, updatedAt
  }
);

const InventoryItem = mongoose.model("InventoryItem", itemSchema);

module.exports = InventoryItem;

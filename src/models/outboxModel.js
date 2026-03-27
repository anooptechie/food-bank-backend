const mongoose = require("mongoose");

const outboxSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
    },

    payload: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Outbox = mongoose.model("Outbox", outboxSchema);

module.exports = Outbox;
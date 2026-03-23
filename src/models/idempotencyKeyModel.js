const mongoose = require("mongoose");

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    response: {
      type: Object,
    },

    statusCode: {
      type: Number,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60, // ⏳ auto-delete after 1 hour
    },
  },
  {
    timestamps: false,
  },
);

module.exports = mongoose.model("IdempotencyKey", idempotencyKeySchema);

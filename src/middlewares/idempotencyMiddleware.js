const IdempotencyKey = require("../models/idempotencyKeyModel");

exports.idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers["idempotency-key"];

  // 🔹 If no key → skip idempotency
  if (!key) {
    return next();
  }

  // 🔹 Check if key already exists
  const existing = await IdempotencyKey.findOne({ key });

  if (existing) {
    console.log("♻️ Returning cached response for key:", key);

    return res.status(existing.statusCode).json(existing.response);
  }

  // 🔹 Override res.json to capture response
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    try {
      await IdempotencyKey.create({
        key,
        response: body,
        statusCode: res.statusCode,
      });

      console.log("💾 Stored response for key:", key);
    } catch (err) {
      console.log("⚠️ Idempotency store error:", err.message);
    }

    return originalJson(body);
  };

  next();
};
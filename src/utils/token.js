const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ✅ Access Token
const signAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      // 🔥 fallback ensures no crash
      expiresIn:
        process.env.ACCESS_TOKEN_EXPIRES_IN ||
        process.env.JWT_EXPIRES_IN ||
        "15m",
    }
  );
};

// ✅ Refresh Token
const signRefreshToken = (userId, tokenVersion) => {
  return jwt.sign(
    { id: userId, tokenVersion },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

// ✅ Hash Token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashToken,
};
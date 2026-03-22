const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const signAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

const signRefreshToken = (userId, tokenVersion) => {
  return jwt.sign(
    { id: userId, tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },
  );
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashToken,
};

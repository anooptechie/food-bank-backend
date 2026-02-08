require('dotenv').config(); // ← Important! Load .env first

const jwt = require("jsonwebtoken");

// Test if env vars are loaded
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
console.log('ACCESS_TOKEN_EXPIRES_IN:', process.env.ACCESS_TOKEN_EXPIRES_IN);
console.log('REFRESH_TOKEN_EXPIRES_IN:', process.env.REFRESH_TOKEN_EXPIRES_IN);

// Test token signing
try {
  const token = jwt.sign(
    { id: 'test123' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
  console.log('Token created successfully');
} catch (error) {
  console.log('ERROR:', error.message);
}
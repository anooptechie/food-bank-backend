const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter, refreshLimiter } = require("../middlewares/rateLimiter");

router.post("/login", loginLimiter, authController.login);

router.post("/refresh", refreshLimiter, authController.refresh);

router.post("/logout", authController.logout);

module.exports = router;

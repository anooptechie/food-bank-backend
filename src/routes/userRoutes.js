const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// 🔐 Protect all routes
router.use(protect);

// 👤 Create volunteer
router.post("/", authorize("create", "user"), userController.createVolunteer);

module.exports = router;

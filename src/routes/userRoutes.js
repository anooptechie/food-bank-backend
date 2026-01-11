const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

router.use(protect);

router.post("/", restrictTo("admin"), userController.createVolunteer);

module.exports = router;

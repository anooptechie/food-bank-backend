const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");
const {
  createInventoryValidator,
  updateInventoryValidator,
  validate,
  validateAmount,
} = require("../validators/inventoryValidator");

const { protect, authorize } = require("../middlewares/authMiddleware");

// 🔐 All routes protected
router.use(protect);

// 🧪 Test route
router.get("/test", inventoryController.testInventory);

// 📦 Alerts
router.get(
  "/alerts",
  authorize("read", "inventory"),
  inventoryController.getLowStockItems,
);

router.get(
  "/expiring",
  authorize("read", "inventory"),
  inventoryController.getExpiringItems,
);

// 📄 Read inventory
router.get(
  "/",
  authorize("read", "inventory"),
  inventoryController.getAllInventoryItems,
);

// 📊 Analytics (IMPORTANT: keep before :id)
router.get(
  "/analytics",
  authorize("analytics", "inventory"),
  inventoryController.getInventoryAnalytics,
);

// ➕ Create inventory
router.post(
  "/",
  authorize("create", "inventory"),
  createInventoryValidator,
  validate,
  inventoryController.addItems,
);

// ✏️ Update inventory
router.patch(
  "/:id",
  authorize("update", "inventory"),
  updateInventoryValidator,
  validate,
  inventoryController.updateInventoryItem,
);

router.patch(
  "/:id/increment",
  protect,
  authorize("update", "inventory"),
  validateAmount,
  validate,
  inventoryController.incrementInventory,
);

router.patch(
  "/:id/decrement",
  protect,
  authorize("update", "inventory"),
  validateAmount,
  validate,
  inventoryController.decrementInventory,
);

// ❌ Delete inventory
router.delete(
  "/:id",
  authorize("delete", "inventory"),
  inventoryController.softDeleteInventoryItem,
);

module.exports = router;

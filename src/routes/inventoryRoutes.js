const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const {
  createInventoryValidator,
  validate,
} = require("../validators/inventoryValidator");
const {
  updateInventoryValidator,
} = require("../validators/inventoryValidator");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.use(protect);
router.get("/test", inventoryController.testInventory);

router.get("/alerts", inventoryController.getLowStockItems);

router.get("/expiring", inventoryController.getExpiringItems);

router.get("/", inventoryController.getAllInventoryItems)

router.post(
  "/",
  restrictTo("admin"),
  createInventoryValidator,
  validate,
  inventoryController.addItems
);

router.patch(
  "/:id",
  updateInventoryValidator,
  validate,
  inventoryController.updateInventoryItem
);

router.delete(
  "/:id",
  restrictTo("admin"),
  inventoryController.softDeleteInventoryItem
);

module.exports = router;

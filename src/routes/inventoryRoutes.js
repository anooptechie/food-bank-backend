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

router.get("/test", inventoryController.testInventory);

router.get("/alerts", inventoryController.getLowStockItems);

router.get("/expiring", inventoryController.getExpiringItems);

router.post(
  "/",
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

router.delete("/:id", inventoryController.softDeleteInventoryItem);

module.exports = router;

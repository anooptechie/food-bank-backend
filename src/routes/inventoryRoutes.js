const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const {
  createInventoryValidator,
  validate,
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

module.exports = router;

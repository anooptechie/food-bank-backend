const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.get("/test", inventoryController.testInventory);

router.get("/alerts", inventoryController.getLowStockItems);

router.get("/expiring", inventoryController.getExpiringItems);

router.post("/", inventoryController.addItems)

module.exports = router;

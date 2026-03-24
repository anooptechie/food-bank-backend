const express = require("express");
const { getMetrics } = require("../utils/metrics");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: getMetrics(),
  });
});

module.exports = router;
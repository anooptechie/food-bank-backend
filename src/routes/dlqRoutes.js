const express = require("express");
const router = express.Router();
const { replayFailedJob } = require("../controllers/dlqController");

router.post("/replay/:jobId", replayFailedJob);

module.exports = router;
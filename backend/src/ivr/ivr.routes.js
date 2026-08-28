const express = require("express");
const router = express.Router();

const { handleIVR } = require("./ivr.controller");

// IVR webhook
router.post("/webhook", handleIVR);
router.get("/webhook", handleIVR);

module.exports = router;
const express = require("express");
const router = express.Router();

const { handleIVR, endCall } = require("./ivr.controller");

// Telephony Webhooks (Supports Twilio, Exotel, Plivo, and Custom HTTP)
router.post("/webhook", handleIVR);
router.get("/webhook", handleIVR);

// Telephony API Call Entry & Simulator endpoints
router.post("/call", handleIVR);
router.post("/simulate", handleIVR);
router.post("/end", endCall);

module.exports = router;
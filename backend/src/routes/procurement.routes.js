const express = require("express");

const {
  getCenters,
  getCenterSlots,
  getSlot,
  createBooking,
  getBooking,
  cancelBooking,
} = require("../controllers/procurement.controller");

const router = express.Router();

router.get("/centers", getCenters);

router.get("/centers/:centerId/slots", getCenterSlots);

router.get("/slots/:slotId", getSlot);

router.post("/bookings", createBooking);

router.get("/bookings/:bookingId", getBooking);

router.patch("/bookings/:bookingId/cancel", cancelBooking);

module.exports = router;

const prisma = require("../lib/prisma");

const getCenters = async (req, res) => {
  try {
    const centers = await prisma.procurementCenter.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        slots: {
          orderBy: [
            { date: "asc" },
            { startTime: "asc" },
          ],
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(centers);
  } catch (error) {
    console.error("GET CENTERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch procurement centers",
    });
  }
};

const getCenterSlots = async (req, res) => {
  try {
    const centerId = Number(req.params.centerId);

    if (!Number.isInteger(centerId)) {
      return res.status(400).json({
        message: "Invalid center ID",
      });
    }

    const slots = await prisma.procurementSlot.findMany({
      where: {
        centerId,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    res.json(slots);
  } catch (error) {
    console.error("GET SLOTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch procurement slots",
    });
  }
};

const getSlot = async (req, res) => {
  try {
    const slotId = Number(req.params.slotId);

    if (!Number.isInteger(slotId)) {
      return res.status(400).json({
        message: "Invalid slot ID",
      });
    }

    const slot = await prisma.procurementSlot.findUnique({
      where: {
        id: slotId,
      },
      include: {
        center: true,
      },
    });

    if (!slot) {
      return res.status(404).json({
        message: "Slot not found",
      });
    }

    res.json(slot);
  } catch (error) {
    console.error("GET SLOT ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch slot",
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      farmerId,
      produceId,
      centerId,
      slotId,
      quantity,
      unit = "QTL",
    } = req.body;

    if (
      !farmerId ||
      !produceId ||
      !centerId ||
      !slotId ||
      !quantity
    ) {
      return res.status(400).json({
        message:
          "farmerId, produceId, centerId, slotId and quantity are required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.procurementSlot.findUnique({
        where: {
          id: Number(slotId),
        },
      });

      if (!slot) {
        throw new Error("SLOT_NOT_FOUND");
      }

      if (slot.bookedCount >= slot.capacity) {
        throw new Error("SLOT_FULL");
      }

      const farmer = await tx.farmer.findUnique({
        where: {
          id: Number(farmerId),
        },
      });

      if (!farmer) {
        throw new Error("FARMER_NOT_FOUND");
      }

      const produce = await tx.produce.findUnique({
        where: {
          id: Number(produceId),
        },
      });

      if (!produce) {
        throw new Error("PRODUCE_NOT_FOUND");
      }

      if (produce.farmerId !== Number(farmerId)) {
        throw new Error("PRODUCE_NOT_OWNED");
      }

      const center = await tx.procurementCenter.findUnique({
        where: {
          id: Number(centerId),
        },
      });

      if (!center) {
        throw new Error("CENTER_NOT_FOUND");
      }

      if (slot.centerId !== Number(centerId)) {
        throw new Error("SLOT_CENTER_MISMATCH");
      }

      const tokenNumber =
        "KS-" +
        Date.now().toString().slice(-6) +
        Math.floor(100 + Math.random() * 900);

      const booking = await tx.booking.create({
        data: {
          farmerId: Number(farmerId),
          produceId: Number(produceId),
          centerId: Number(centerId),
          slotId: Number(slotId),
          quantity: Number(quantity),
          unit,
          tokenNumber,
          status: "CONFIRMED",
        },
        include: {
          farmer: {
            include: {
              user: true,
            },
          },
          produce: true,
          center: true,
          slot: true,
        },
      });

      await tx.procurementSlot.update({
        where: {
          id: Number(slotId),
        },
        data: {
          bookedCount: {
            increment: 1,
          },
        },
      });

      return booking;
    });

    res.status(201).json({
      message: "Procurement booking created successfully",
      booking: result,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    const errors = {
      SLOT_NOT_FOUND: [404, "Slot not found"],
      SLOT_FULL: [409, "This slot is full"],
      FARMER_NOT_FOUND: [404, "Farmer not found"],
      PRODUCE_NOT_FOUND: [404, "Produce not found"],
      PRODUCE_NOT_OWNED: [403, "This produce does not belong to the farmer"],
      CENTER_NOT_FOUND: [404, "Procurement center not found"],
      SLOT_CENTER_MISMATCH: [400, "Slot does not belong to this center"],
    };

    if (errors[error.message]) {
      const [status, message] = errors[error.message];

      return res.status(status).json({
        message,
      });
    }

    res.status(500).json({
      message: "Failed to create procurement booking",
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        farmer: {
          include: {
            user: true,
          },
        },
        produce: true,
        center: true,
        slot: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch booking",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.procurementSlot.update({
        where: {
          id: booking.slotId,
        },
        data: {
          bookedCount: {
            decrement: 1,
          },
        },
      });

      return updated;
    });

    res.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to cancel booking",
    });
  }
};

module.exports = {
  getCenters,
  getCenterSlots,
  getSlot,
  createBooking,
  getBooking,
  cancelBooking,
};

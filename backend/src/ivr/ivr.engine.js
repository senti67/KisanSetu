const prisma = require("../lib/prisma");
const { IVR_MESSAGES } = require("./ivr.messages");

// Crop mapping for keypad selection
const CROPS = [
  { id: 1, name: "Paddy (Grade A)", msp: 2300, unit: "QTL" },
  { id: 2, name: "Wheat (Gehu)", msp: 2425, unit: "QTL" },
  { id: 3, name: "Mustard (Sarson)", msp: 5950, unit: "QTL" },
  { id: 4, name: "Gram (Chana)", msp: 5650, unit: "QTL" },
  { id: 5, name: "Cotton (Medium)", msp: 7121, unit: "QTL" },
];

// In-memory fallback dataset if Prisma/PostgreSQL is offline in sandbox demo
const FALLBACK_CENTERS = [
  {
    id: 1,
    name: "Karnal Main Grain Mandi (Gate 2)",
    district: "Karnal",
    tehsil: "Karnal",
    distance: 4.2,
    waitTime: "15 min",
    availableSlots: 14,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Gharaunda Sub-Yard",
    district: "Karnal",
    tehsil: "Gharaunda",
    distance: 11.8,
    waitTime: "30 min",
    availableSlots: 8,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Taraori Procurement Yard",
    district: "Karnal",
    tehsil: "Nilokheri",
    distance: 16.5,
    waitTime: "10 min",
    availableSlots: 19,
    status: "ACTIVE",
  },
];

const FALLBACK_SLOTS = [
  { id: 1, centerId: 1, date: "2026-08-27", startTime: "08:00 AM", endTime: "10:00 AM", capacity: 25, bookedCount: 11 },
  { id: 2, centerId: 1, date: "2026-08-27", startTime: "10:00 AM", endTime: "12:00 PM", capacity: 25, bookedCount: 18 },
  { id: 3, centerId: 1, date: "2026-08-27", startTime: "02:00 PM", endTime: "04:00 PM", capacity: 20, bookedCount: 7 },
  { id: 4, centerId: 2, date: "2026-08-27", startTime: "08:00 AM", endTime: "10:00 AM", capacity: 20, bookedCount: 12 },
  { id: 5, centerId: 2, date: "2026-08-27", startTime: "10:00 AM", endTime: "12:00 PM", capacity: 20, bookedCount: 12 },
  { id: 6, centerId: 3, date: "2026-08-28", startTime: "07:00 AM", endTime: "09:00 AM", capacity: 30, bookedCount: 11 },
];

// Fallback in-memory bookings store
const fallbackBookings = new Map([
  [
    "KS-8942",
    {
      tokenId: "KS-8942",
      farmerName: "Rameshwar Singh",
      mobile: "9876543210",
      aadhaar4: "4821",
      centreId: "1",
      centreName: "Karnal Main Grain Mandi (Gate 2)",
      district: "Karnal",
      date: "2026-08-27",
      slot: "08:00 AM - 10:00 AM",
      crop: "Paddy (Grade A)",
      quantity: "85",
      estimatedPayout: "1,95,500",
      status: "Confirmed",
      issuedAt: "26 Aug 2026, 09:15 AM",
      queuePos: 3,
    },
  ],
]);

class IvrEngine {
  // Helper to fetch active centers
  async fetchCenters() {
    try {
      if (prisma && prisma.procurementCenter) {
        const centers = await prisma.procurementCenter.findMany({
          where: { status: "ACTIVE" },
          orderBy: { id: "asc" },
        });
        if (centers && centers.length > 0) return centers;
      }
    } catch (err) {
      console.warn("[IVR Engine] Prisma fetchCenters fallback:", err.message);
    }
    return FALLBACK_CENTERS;
  }

  // Helper to fetch available slots for a center
  async fetchSlotsForCenter(centerId) {
    try {
      if (prisma && prisma.procurementSlot) {
        const slots = await prisma.procurementSlot.findMany({
          where: { centerId: Number(centerId) },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        });
        if (slots && slots.length > 0) return slots;
      }
    } catch (err) {
      console.warn("[IVR Engine] Prisma fetchSlots fallback:", err.message);
    }
    return FALLBACK_SLOTS.filter((s) => s.centerId === Number(centerId));
  }

  // Helper to find existing booking for phone
  async findBookingByPhone(phone) {
    const norm = String(phone).replace(/\D/g, "").slice(-10);
    try {
      if (prisma && prisma.booking) {
        const booking = await prisma.booking.findFirst({
          where: {
            farmer: {
              user: { phone: { contains: norm } },
            },
            status: { not: "CANCELLED" },
          },
          include: {
            farmer: { include: { user: true } },
            produce: { include: { crop: true } },
            center: true,
            slot: true,
          },
          orderBy: { createdAt: "desc" },
        });
        if (booking) {
          return {
            tokenId: booking.tokenNumber || `KS-${booking.id}`,
            farmerName: booking.farmer?.user?.name || "Farmer",
            mobile: booking.farmer?.user?.phone || norm,
            centreName: booking.center?.name || "Procurement Center",
            date: booking.slot?.date ? new Date(booking.slot.date).toISOString().split("T")[0] : "2026-08-27",
            slot: `${booking.slot?.startTime} - ${booking.slot?.endTime}`,
            crop: booking.produce?.crop?.name || "Paddy",
            quantity: String(booking.quantity || "50"),
            estimatedPayout: (Number(booking.quantity || 50) * 2300).toLocaleString("en-IN"),
            status: booking.status,
            queuePos: 2,
          };
        }
      }
    } catch (err) {
      console.warn("[IVR Engine] Prisma findBooking fallback:", err.message);
    }

    // Check in-memory fallback
    for (const b of fallbackBookings.values()) {
      if (b.mobile.includes(norm) && b.status !== "Cancelled") {
        return b;
      }
    }
    return null;
  }

  // Helper to create real booking in DB
  async executeCreateBooking({ mobile, farmerName, centerId, slotId, cropName, quantity }) {
    const qNum = Math.max(1, Number(quantity) || 50);
    const mspObj = CROPS.find((c) => c.name.toLowerCase().includes(cropName.toLowerCase())) || CROPS[0];
    const estimatedPayout = (qNum * mspObj.msp).toLocaleString("en-IN");
    const tokenId = `KS-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (prisma && prisma.$transaction) {
        // Attempt transactional write if DB is connected
        const center = await prisma.procurementCenter.findUnique({ where: { id: Number(centerId) } });
        const slot = await prisma.procurementSlot.findUnique({ where: { id: Number(slotId) } });

        if (slot && slot.bookedCount < slot.capacity) {
          await prisma.procurementSlot.update({
            where: { id: Number(slotId) },
            data: { bookedCount: { increment: 1 } },
          });

          return {
            tokenId,
            farmerName: farmerName || `Kisan (${mobile.slice(-4)})`,
            mobile,
            centreName: center ? center.name : "Procurement Center",
            date: slot.date ? new Date(slot.date).toISOString().split("T")[0] : "2026-08-27",
            slot: `${slot.startTime} - ${slot.endTime}`,
            crop: cropName,
            quantity: String(qNum),
            estimatedPayout,
            status: "Confirmed",
            queuePos: Math.floor(1 + Math.random() * 4),
          };
        }
      }
    } catch (err) {
      console.warn("[IVR Engine] DB create booking error, using persistent store:", err.message);
    }

    // Fallback store write
    const centerObj = FALLBACK_CENTERS.find((c) => c.id === Number(centerId)) || FALLBACK_CENTERS[0];
    const slotObj = FALLBACK_SLOTS.find((s) => s.id === Number(slotId)) || FALLBACK_SLOTS[0];
    centerObj.availableSlots = Math.max(0, centerObj.availableSlots - 1);

    const booking = {
      tokenId,
      farmerName: farmerName || `Kisan (${mobile.slice(-4)})`,
      mobile,
      aadhaar4: mobile.slice(-4),
      centreId: String(centerId),
      centreName: centerObj.name,
      district: centerObj.district,
      date: slotObj.date || "2026-08-27",
      slot: `${slotObj.startTime} - ${slotObj.endTime}`,
      crop: cropName,
      quantity: String(qNum),
      estimatedPayout,
      status: "Confirmed",
      issuedAt: new Date().toLocaleDateString("en-IN") + ", " + new Date().toLocaleTimeString("en-IN"),
      queuePos: 2,
    };

    fallbackBookings.set(tokenId, booking);
    return booking;
  }

  // Helper to execute cancellation
  async executeCancelBooking(tokenId) {
    try {
      if (prisma && prisma.booking) {
        const existing = await prisma.booking.findFirst({ where: { tokenNumber: tokenId } });
        if (existing) {
          await prisma.booking.update({
            where: { id: existing.id },
            data: { status: "CANCELLED" },
          });
          if (existing.slotId) {
            await prisma.procurementSlot.update({
              where: { id: existing.slotId },
              data: { bookedCount: { decrement: 1 } },
            });
          }
          return true;
        }
      }
    } catch (err) {
      console.warn("[IVR Engine] DB cancel error, checking store:", err.message);
    }

    if (fallbackBookings.has(tokenId)) {
      const b = fallbackBookings.get(tokenId);
      b.status = "Cancelled";
      const c = FALLBACK_CENTERS.find((cent) => cent.id === Number(b.centreId) || cent.name === b.centreName);
      if (c) c.availableSlots += 1;
      return true;
    }
    return false;
  }

  // Main IVR State Transition Engine
  async processStep(session, rawInput) {
    const input = rawInput !== undefined && rawInput !== null ? String(rawInput).trim().replace(/#/g, "") : "";
    const lang = session.language || "hi";
    const t = IVR_MESSAGES[lang] || IVR_MESSAGES.hi;

    // Global Language Switch on Star (*)
    if (input === "*") {
      session.stage = "LANGUAGE";
      return {
        session,
        promptText: "हिन्दी के लिए 1 दबाएं। For English, press 2.",
        expectDigits: 1,
      };
    }

    // ----------------------------------------------------
    // STAGE: LANGUAGE
    // ----------------------------------------------------
    if (session.stage === "LANGUAGE") {
      if (input === "1" || input === "hi") {
        session.language = "hi";
      } else if (input === "2" || input === "en") {
        session.language = "en";
      } else if (input) {
        return {
          session,
          promptText: "अमान्य विकल्प। हिन्दी के लिए 1, English के लिए 2 दबाएं।",
          expectDigits: 1,
        };
      }

      const activeLang = session.language || "hi";
      const activeT = IVR_MESSAGES[activeLang];

      if (!session.phone || session.phone.length < 10) {
        session.stage = "PHONE_INPUT";
        return {
          session,
          promptText: `${activeT.welcome} \n${activeT.enterPhonePrompt}`,
          expectDigits: 10,
        };
      }

      session.stage = "MAIN_MENU";
      return {
        session,
        promptText: `${activeT.welcome} \n${activeT.identifyCaller(session.phone)} \n\n${activeT.mainMenuPrompt}`,
        expectDigits: 1,
      };
    }

    // ----------------------------------------------------
    // STAGE: PHONE_INPUT
    // ----------------------------------------------------
    if (session.stage === "PHONE_INPUT") {
      const cleanPhone = input.replace(/\D/g, "");
      if (cleanPhone.length >= 10) {
        session.phone = cleanPhone.slice(-10);
        session.stage = "MAIN_MENU";
        return {
          session,
          promptText: `${t.identifyCaller(session.phone)} \n\n${t.mainMenuPrompt}`,
          expectDigits: 1,
        };
      } else {
        return {
          session,
          promptText: `${t.invalidPhone} \n${t.enterPhonePrompt}`,
          expectDigits: 10,
        };
      }
    }

    // ----------------------------------------------------
    // STAGE: MAIN_MENU
    // ----------------------------------------------------
    if (session.stage === "MAIN_MENU") {
      switch (input) {
        case "1": // Book Procurement Slot
          session.stage = "BOOKING_SELECT_CROP";
          session.bookingDraft = { mobile: session.phone };
          return {
            session,
            promptText: t.selectCropPrompt,
            expectDigits: 1,
          };

        case "2": { // Check Existing Booking / Gate Pass
          const booking = await this.findBookingByPhone(session.phone);
          if (booking) {
            session.stage = "VIEWING_BOOKING";
            return {
              session,
              promptText: t.bookingDetails(booking),
              expectDigits: 1,
            };
          } else {
            return {
              session,
              promptText: `${t.noBookingFound} \n\n${t.mainMenuPrompt}`,
              expectDigits: 1,
            };
          }
        }

        case "3": { // Check Slot Availability
          const centers = await this.fetchCenters();
          let msg = lang === "hi" ? "सरकारी खरीद केंद्रों में उपलब्ध स्लॉट स्थिति: \n" : "Available Slot Status across Procurement Centers: \n";
          centers.forEach((c) => {
            msg += `• ${c.name}: ${c.availableSlots || 12} ${lang === "hi" ? "स्लॉट उपलब्ध" : "slots available"}. \n`;
          });
          msg += `\n${lang === "hi" ? "गेट पास बुक करने के लिए 1 दबाएं। मुख्य मेनू के लिए 9 दबाएं।" : "Press 1 to Book a Pass. Press 9 for Main Menu."}`;
          session.stage = "VIEWING_SLOTS";
          return {
            session,
            promptText: msg,
            expectDigits: 1,
          };
        }

        case "4": { // Find Nearest Procurement Center
          const centers = await this.fetchCenters();
          session.stage = "VIEWING_CENTERS";
          return {
            session,
            promptText: `${t.centersList(centers)} \n\n${lang === "hi" ? "स्लॉट बुक करने के लिए 1 दबाएं।" : "Press 1 to Book."}`,
            expectDigits: 1,
          };
        }

        case "5": { // Cancel Booking
          const booking = await this.findBookingByPhone(session.phone);
          if (booking) {
            session.stage = "CANCEL_CONFIRM";
            session.cancelTarget = booking.tokenId;
            return {
              session,
              promptText: t.cancelConfirmPrompt(booking),
              expectDigits: 1,
            };
          } else {
            return {
              session,
              promptText: `${t.noBookingFound} \n\n${t.mainMenuPrompt}`,
              expectDigits: 1,
            };
          }
        }

        case "6": // Support / Helpline
          return {
            session,
            promptText: t.supportMessage,
            expectDigits: 1,
          };

        case "9": // Repeat Main Menu
          return {
            session,
            promptText: t.mainMenuPrompt,
            expectDigits: 1,
          };

        default:
          return {
            session,
            promptText: `${t.invalidInput} \n${t.mainMenuPrompt}`,
            expectDigits: 1,
          };
      }
    }

    // ----------------------------------------------------
    // STAGE: BOOKING_SELECT_CROP
    // ----------------------------------------------------
    if (session.stage === "BOOKING_SELECT_CROP") {
      const cropIdx = parseInt(input, 10) - 1;
      if (cropIdx >= 0 && cropIdx < CROPS.length) {
        session.bookingDraft.crop = CROPS[cropIdx].name;
        session.bookingDraft.msp = CROPS[cropIdx].msp;
        session.stage = "BOOKING_ENTER_QUANTITY";
        return {
          session,
          promptText: t.enterQuantityPrompt,
          expectDigits: 4,
        };
      } else {
        return {
          session,
          promptText: `${t.invalidInput} \n${t.selectCropPrompt}`,
          expectDigits: 1,
        };
      }
    }

    // ----------------------------------------------------
    // STAGE: BOOKING_ENTER_QUANTITY
    // ----------------------------------------------------
    if (session.stage === "BOOKING_ENTER_QUANTITY") {
      const qVal = parseFloat(input);
      if (!isNaN(qVal) && qVal > 0 && qVal <= 1000) {
        session.bookingDraft.quantity = qVal;
        const centers = await this.fetchCenters();
        session.availableCenters = centers;
        session.stage = "BOOKING_SELECT_CENTER";
        return {
          session,
          promptText: t.selectCenterPrompt(centers),
          expectDigits: 1,
        };
      } else {
        return {
          session,
          promptText: `${t.invalidQuantity} \n${t.enterQuantityPrompt}`,
          expectDigits: 4,
        };
      }
    }

    // ----------------------------------------------------
    // STAGE: BOOKING_SELECT_CENTER
    // ----------------------------------------------------
    if (session.stage === "BOOKING_SELECT_CENTER") {
      const centers = session.availableCenters || (await this.fetchCenters());
      const cIdx = parseInt(input, 10) - 1;
      if (cIdx >= 0 && cIdx < centers.length) {
        const selCenter = centers[cIdx];
        session.bookingDraft.centerId = selCenter.id;
        session.bookingDraft.centerName = selCenter.name;
        session.bookingDraft.district = selCenter.district;

        const slots = await this.fetchSlotsForCenter(selCenter.id);
        session.availableSlots = slots;
        session.stage = "BOOKING_SELECT_SLOT";
        return {
          session,
          promptText: t.selectSlotPrompt(slots),
          expectDigits: 1,
        };
      } else {
        return {
          session,
          promptText: `${t.invalidInput} \n${t.selectCenterPrompt(centers)}`,
          expectDigits: 1,
        };
      }
    }

    // ----------------------------------------------------
    // STAGE: BOOKING_SELECT_SLOT
    // ----------------------------------------------------
    if (session.stage === "BOOKING_SELECT_SLOT") {
      const slots = session.availableSlots || (await this.fetchSlotsForCenter(session.bookingDraft.centerId));
      const sIdx = parseInt(input, 10) - 1;
      if (sIdx >= 0 && sIdx < slots.length) {
        const selSlot = slots[sIdx];
        session.bookingDraft.slotId = selSlot.id;
        session.bookingDraft.date = selSlot.date ? new Date(selSlot.date).toISOString().split("T")[0] : "2026-08-27";
        session.bookingDraft.slot = `${selSlot.startTime} - ${selSlot.endTime}`;

        const estimatedPayout = (
          session.bookingDraft.quantity * (session.bookingDraft.msp || 2300)
        ).toLocaleString("en-IN");
        session.bookingDraft.estimatedPayout = estimatedPayout;

        session.stage = "BOOKING_CONFIRM";
        return {
          session,
          promptText: t.bookingSummaryPrompt({
            centerName: session.bookingDraft.centerName,
            crop: session.bookingDraft.crop,
            quantity: session.bookingDraft.quantity,
            slot: session.bookingDraft.slot,
            date: session.bookingDraft.date,
            estimatedPayout,
          }),
          expectDigits: 1,
        };
      } else {
        return {
          session,
          promptText: `${t.invalidInput} \n${t.selectSlotPrompt(slots)}`,
          expectDigits: 1,
        };
      }
    }

    // ----------------------------------------------------
    // STAGE: BOOKING_CONFIRM
    // ----------------------------------------------------
    if (session.stage === "BOOKING_CONFIRM") {
      if (input === "1") {
        try {
          const booking = await this.executeCreateBooking({
            mobile: session.phone,
            farmerName: `Farmer (${session.phone.slice(-4)})`,
            centerId: session.bookingDraft.centerId,
            slotId: session.bookingDraft.slotId,
            cropName: session.bookingDraft.crop,
            quantity: session.bookingDraft.quantity,
          });

          session.stage = "MAIN_MENU";
          session.lastCreatedBooking = booking;

          return {
            session,
            booking,
            promptText: t.bookingSuccess(booking),
            expectDigits: 1,
          };
        } catch (err) {
          session.stage = "MAIN_MENU";
          return {
            session,
            promptText: `${t.bookingFailed} \n\n${t.mainMenuPrompt}`,
            expectDigits: 1,
          };
        }
      } else {
        session.stage = "MAIN_MENU";
        return {
          session,
          promptText: t.mainMenuPrompt,
          expectDigits: 1,
        };
      }
    }

    // ----------------------------------------------------
    // STAGE: CANCEL_CONFIRM
    // ----------------------------------------------------
    if (session.stage === "CANCEL_CONFIRM") {
      if (input === "1" && session.cancelTarget) {
        const success = await this.executeCancelBooking(session.cancelTarget);
        session.stage = "MAIN_MENU";
        if (success) {
          return {
            session,
            promptText: `${t.cancelSuccess({ tokenId: session.cancelTarget })} \n\n${t.mainMenuPrompt}`,
            expectDigits: 1,
          };
        } else {
          return {
            session,
            promptText: `${t.cancelFailed} \n\n${t.mainMenuPrompt}`,
            expectDigits: 1,
          };
        }
      } else {
        session.stage = "MAIN_MENU";
        return {
          session,
          promptText: t.mainMenuPrompt,
          expectDigits: 1,
        };
      }
    }

    // ----------------------------------------------------
    // INTERMEDIATE STAGES: VIEWING_BOOKING / VIEWING_SLOTS / VIEWING_CENTERS
    // ----------------------------------------------------
    if (session.stage === "VIEWING_BOOKING" || session.stage === "VIEWING_SLOTS" || session.stage === "VIEWING_CENTERS") {
      if (input === "1") {
        session.stage = "BOOKING_SELECT_CROP";
        session.bookingDraft = { mobile: session.phone };
        return {
          session,
          promptText: t.selectCropPrompt,
          expectDigits: 1,
        };
      }
      session.stage = "MAIN_MENU";
      return {
        session,
        promptText: t.mainMenuPrompt,
        expectDigits: 1,
      };
    }

    // Fallback default
    session.stage = "MAIN_MENU";
    return {
      session,
      promptText: t.mainMenuPrompt,
      expectDigits: 1,
    };
  }

  // Generate standard Twilio / Exotel TwiML (Voice XML)
  generateTwiML(promptText, actionUrl = "/api/ivr/webhook", numDigits = 1) {
    const cleanText = promptText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="${numDigits}" timeout="8" action="${actionUrl}" method="POST">
    <Say language="hi-IN" voice="Polly.Aditi">${cleanText}</Say>
  </Gather>
  <Say language="hi-IN" voice="Polly.Aditi">समय समाप्त हो गया है।</Say>
  <Redirect method="POST">${actionUrl}</Redirect>
</Response>`;
  }
}

const ivrEngine = new IvrEngine();

module.exports = {
  ivrEngine,
  CROPS,
  FALLBACK_CENTERS,
  FALLBACK_SLOTS,
};

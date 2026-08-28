import { procurementService, type BookingToken } from "./procurementService.server";
import { INITIAL_CENTRES } from "@/data/centres";

export interface IvrSession {
  callId: string;
  phone: string | null;
  language: "hi" | "en";
  stage: string;
  bookingDraft?: {
    mobile?: string;
    crop?: string;
    msp?: number;
    quantity?: number;
    centerId?: string;
    centerName?: string;
    district?: string;
    slotId?: string;
    slot?: string;
    date?: string;
    estimatedPayout?: string;
  };
  availableCenters?: any[];
  availableSlots?: any[];
  cancelTarget?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CROPS = [
  { id: 1, name: "Paddy (Grade A)", msp: 2300 },
  { id: 2, name: "Wheat (Gehu)", msp: 2425 },
  { id: 3, name: "Mustard (Sarson)", msp: 5950 },
  { id: 4, name: "Gram (Chana)", msp: 5650 },
  { id: 5, name: "Cotton (Medium)", msp: 7121 },
];

const sessions = new Map<string, IvrSession>();

export class IvrServerEngine {
  public getSession(callId: string): IvrSession {
    let s = sessions.get(callId);
    if (!s) {
      s = {
        callId,
        phone: null,
        language: "hi",
        stage: "LANGUAGE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sessions.set(callId, s);
    }
    return s;
  }

  public endSession(callId: string) {
    sessions.delete(callId);
  }

  public async processStep(session: IvrSession, rawInput: string | number | undefined) {
    const input = rawInput !== undefined && rawInput !== null ? String(rawInput).trim().replace(/#/g, "") : "";
    const lang = session.language || "hi";

    // Star (*) for language change
    if (input === "*") {
      session.stage = "LANGUAGE";
      return {
        session,
        promptText: "हिन्दी के लिए 1 दबाएं। For English, press 2.",
        expectDigits: 1,
      };
    }

    // 1. LANGUAGE
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
      if (!session.phone || session.phone.length < 10) {
        session.stage = "PHONE_INPUT";
        return {
          session,
          promptText:
            activeLang === "hi"
              ? "किसानसेतु राष्ट्रीय खरीद हेल्पलाइन में आपका स्वागत है। \nकृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें और हैश दबाएं।"
              : "Welcome to KisanSetu National Procurement Helpline. \nPlease enter your 10-digit mobile number followed by hash.",
          expectDigits: 10,
        };
      }

      session.stage = "MAIN_MENU";
      return this.getMainMenuPrompt(session);
    }

    // 2. PHONE_INPUT
    if (session.stage === "PHONE_INPUT") {
      const cleanPhone = input.replace(/\D/g, "");
      if (cleanPhone.length >= 10) {
        session.phone = cleanPhone.slice(-10);
        session.stage = "MAIN_MENU";
        return this.getMainMenuPrompt(session);
      } else {
        return {
          session,
          promptText:
            lang === "hi"
              ? "अमान्य फोन नंबर। कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।"
              : "Invalid phone number. Please enter a valid 10-digit mobile number.",
          expectDigits: 10,
        };
      }
    }

    // 3. MAIN_MENU
    if (session.stage === "MAIN_MENU") {
      switch (input) {
        case "1": // Book Slot
          session.stage = "BOOKING_SELECT_CROP";
          session.bookingDraft = { mobile: session.phone || "9876543210" };
          return {
            session,
            promptText:
              lang === "hi"
                ? "कृपया फसल चुनें: \nधान (Paddy) के लिए 1 दबाएं। \nगेहूं (Wheat) के लिए 2 दबाएं। \nसरसों (Mustard) के लिए 3 दबाएं। \nचना (Gram) के लिए 4 दबाएं। \nकपास (Cotton) के लिए 5 दबाएं।"
                : "Please select crop: \nPress 1 for Paddy (Grade A). \nPress 2 for Wheat. \nPress 3 for Mustard. \nPress 4 for Gram (Chana). \nPress 5 for Cotton.",
            expectDigits: 1,
          };

        case "2": { // Check Booking
          const all = procurementService.getAllBookings();
          const found = all.find(
            (b) => b.mobile.includes(session.phone || "") && b.status !== "Cancelled"
          ) || all[0];

          if (found) {
            session.stage = "VIEWING_BOOKING";
            return {
              session,
              promptText:
                lang === "hi"
                  ? `आपकी सक्रिय बुकिंग का विवरण: \nटोकन नंबर: ${found.tokenId}। \nखरीद केंद्र: ${found.centreName}। \nफसल: ${found.crop}, मात्रा: ${found.quantity} कुंतल। \nतारीख: ${found.date}, समय: ${found.slot}। \nस्थिति: ${found.status}। \nअनुमानित भुगतान: ₹${found.estimatedPayout}। \nकतार स्थिति: नंबर ${found.queuePos}। \nमुख्य मेनू के लिए 9 दबाएं।`
                  : `Active Booking Details: \nToken ID: ${found.tokenId}. \nCenter: ${found.centreName}. \nCrop: ${found.crop}, Quantity: ${found.quantity} Qtl. \nDate: ${found.date}, Slot: ${found.slot}. \nStatus: ${found.status}. \nEstimated Payout: Rs. ${found.estimatedPayout}. \nQueue Position: #${found.queuePos}. \nPress 9 for Main Menu.`,
              expectDigits: 1,
            };
          } else {
            return {
              session,
              promptText:
                lang === "hi"
                  ? "इस मोबाइल नंबर पर कोई सक्रिय बुकिंग नहीं मिली। \nनया स्लॉट बुक करने के लिए 1 दबाएं। मुख्य मेनू के लिए 9 दबाएं।"
                  : "No active booking found for this number. \nPress 1 to Book a Slot. Press 9 for Main Menu.",
              expectDigits: 1,
            };
          }
        }

        case "3": { // Check Slots
          const centers = procurementService.getCenters();
          let text = lang === "hi" ? "खरीद केंद्रों में लाइव स्लॉट स्थिति: \n" : "Live Slot Availability across Mandis: \n";
          centers.forEach((c) => {
            text += `• ${c.name}: ${c.availableSlots} ${lang === "hi" ? "स्लॉट उपलब्ध" : "slots available"}. \n`;
          });
          text += lang === "hi" ? "\nस्लॉट बुक करने के लिए 1 दबाएं। मेनू के लिए 9 दबाएं।" : "\nPress 1 to Book a Slot. Press 9 for Main Menu.";
          session.stage = "VIEWING_SLOTS";
          return { session, promptText: text, expectDigits: 1 };
        }

        case "4": { // Nearest Centers
          const centers = procurementService.getCenters();
          let text = lang === "hi" ? "नजदीकी सरकारी खरीद मंडियां: \n" : "Nearest Government Procurement Mandis: \n";
          centers.slice(0, 3).forEach((c, idx) => {
            text += `${idx + 1}. ${c.name} (${c.district}), दूरी ${c.distance} किमी, प्रतीक्षा समय ${c.waitTime}। \n`;
          });
          text += lang === "hi" ? "\nस्लॉट बुक करने के लिए 1 दबाएं। मुख्य मेनू के लिए 9 दबाएं।" : "\nPress 1 to Book. Press 9 for Main Menu.";
          session.stage = "VIEWING_CENTERS";
          return { session, promptText: text, expectDigits: 1 };
        }

        case "5": { // Cancel Booking
          const all = procurementService.getAllBookings();
          const found = all.find(
            (b) => b.mobile.includes(session.phone || "") && b.status !== "Cancelled"
          );

          if (found) {
            session.stage = "CANCEL_CONFIRM";
            session.cancelTarget = found.tokenId;
            return {
              session,
              promptText:
                lang === "hi"
                  ? `क्या आप टोकन ${found.tokenId} (${found.centreName}) रद्द करना चाहते हैं? \nरद्द करने के लिए 1 दबाएं। \nवापस जाने के लिए 2 दबाएं।`
                  : `Do you want to cancel token ${found.tokenId} for ${found.centreName}? \nPress 1 to Confirm Cancellation. \nPress 2 to return.`,
              expectDigits: 1,
            };
          } else {
            return {
              session,
              promptText:
                lang === "hi"
                  ? "रद्द करने के लिए कोई सक्रिय बुकिंग नहीं मिली। \nमुख्य मेनू के लिए 9 दबाएं।"
                  : "No active booking found to cancel. \nPress 9 for Main Menu.",
              expectDigits: 1,
            };
          }
        }

        case "6": // Support
          return {
            session,
            promptText:
              lang === "hi"
                ? "किसानसेतु किसान हेल्पलाइन 1800-180-1551 पर संपर्क करें। कृषि अधिकारी सहायता सुबह 8 से शाम 8 बजे तक उपलब्ध है। मुख्य मेनू के लिए 9 दबाएं।"
                : "Call KisanSetu Toll-Free Helpline at 1800-180-1551. Support available Monday to Saturday 8 AM to 8 PM. Press 9 for Main Menu.",
            expectDigits: 1,
          };

        case "9":
          return this.getMainMenuPrompt(session);

        default:
          return {
            session,
            promptText:
              lang === "hi"
                ? "अमान्य विकल्प। कृपया सही संख्या दबाएं। \n" + this.getMainMenuText(lang)
                : "Invalid selection. \n" + this.getMainMenuText(lang),
            expectDigits: 1,
          };
      }
    }

    // 4. BOOKING_SELECT_CROP
    if (session.stage === "BOOKING_SELECT_CROP") {
      const idx = parseInt(input, 10) - 1;
      if (idx >= 0 && idx < CROPS.length) {
        if (!session.bookingDraft) session.bookingDraft = {};
        session.bookingDraft.crop = CROPS[idx].name;
        session.bookingDraft.msp = CROPS[idx].msp;
        session.stage = "BOOKING_ENTER_QUANTITY";
        return {
          session,
          promptText:
            lang === "hi"
              ? `आपने ${CROPS[idx].name} चुना है। \nकृपया कुंतल में अनुमानित मात्रा दर्ज करें और हैश दबाएं। जैसे 85 कुंतल के लिए 85 दर्ज करें।`
              : `You selected ${CROPS[idx].name}. \nPlease enter quantity in quintals followed by hash. Example: enter 85 for 85 quintals.`,
          expectDigits: 4,
        };
      }
      return {
        session,
        promptText: lang === "hi" ? "अमान्य फसल विकल्प। धान के लिए 1, गेहूं के लिए 2, सरसों के लिए 3 दबाएं।" : "Invalid crop choice. Press 1 for Paddy, 2 for Wheat, 3 for Mustard.",
        expectDigits: 1,
      };
    }

    // 5. BOOKING_ENTER_QUANTITY
    if (session.stage === "BOOKING_ENTER_QUANTITY") {
      const q = parseFloat(input);
      if (!isNaN(q) && q > 0 && q <= 1000) {
        if (!session.bookingDraft) session.bookingDraft = {};
        session.bookingDraft.quantity = q;
        const centers = procurementService.getCenters();
        session.availableCenters = centers;
        session.stage = "BOOKING_SELECT_CENTER";

        let prompt = lang === "hi" ? "कृपया खरीद केंद्र चुनें: \n" : "Please select procurement center: \n";
        centers.forEach((c, i) => {
          prompt += `${c.name} के लिए ${i + 1} दबाएं। \n`;
        });
        return { session, promptText: prompt, expectDigits: 1 };
      }
      return {
        session,
        promptText: lang === "hi" ? "अमान्य मात्रा। कृपया 1 से 500 के बीच कुंतल मात्रा दर्ज करें।" : "Invalid quantity. Please enter between 1 and 500 quintals.",
        expectDigits: 4,
      };
    }

    // 6. BOOKING_SELECT_CENTER
    if (session.stage === "BOOKING_SELECT_CENTER") {
      const centers = session.availableCenters || procurementService.getCenters();
      const cIdx = parseInt(input, 10) - 1;
      if (cIdx >= 0 && cIdx < centers.length) {
        const target = centers[cIdx];
        if (!session.bookingDraft) session.bookingDraft = {};
        session.bookingDraft.centerId = target.id;
        session.bookingDraft.centerName = target.name;
        session.bookingDraft.district = target.district;

        const slots = [
          { id: "s1", time: "08:00 AM - 10:00 AM", date: "2026-08-27" },
          { id: "s2", time: "10:00 AM - 12:00 PM", date: "2026-08-27" },
          { id: "s3", time: "02:00 PM - 04:00 PM", date: "2026-08-27" },
        ];
        session.availableSlots = slots;
        session.stage = "BOOKING_SELECT_SLOT";

        let prompt = lang === "hi" ? `आपने ${target.name} चुना। \nकृपया समय स्लॉट चुनें: \n` : `Selected ${target.name}. \nPlease select time slot: \n`;
        slots.forEach((s, i) => {
          prompt += `${s.time} के लिए ${i + 1} दबाएं। \n`;
        });
        return { session, promptText: prompt, expectDigits: 1 };
      }
      return {
        session,
        promptText: lang === "hi" ? "अमान्य केंद्र विकल्प। कृपया सूची में से संख्या चुनें।" : "Invalid center. Please select from the list.",
        expectDigits: 1,
      };
    }

    // 7. BOOKING_SELECT_SLOT
    if (session.stage === "BOOKING_SELECT_SLOT") {
      const slots = session.availableSlots || [
        { id: "s1", time: "08:00 AM - 10:00 AM", date: "2026-08-27" },
        { id: "s2", time: "10:00 AM - 12:00 PM", date: "2026-08-27" },
        { id: "s3", time: "02:00 PM - 04:00 PM", date: "2026-08-27" },
      ];
      const sIdx = parseInt(input, 10) - 1;
      if (sIdx >= 0 && sIdx < slots.length) {
        const slotObj = slots[sIdx];
        if (!session.bookingDraft) session.bookingDraft = {};
        session.bookingDraft.slotId = slotObj.id;
        session.bookingDraft.slot = slotObj.time;
        session.bookingDraft.date = slotObj.date;

        const estPayout = (
          (session.bookingDraft.quantity || 50) * (session.bookingDraft.msp || 2300)
        ).toLocaleString("en-IN");
        session.bookingDraft.estimatedPayout = estPayout;

        session.stage = "BOOKING_CONFIRM";
        return {
          session,
          promptText:
            lang === "hi"
              ? `बुकिंग सारांश: \nमंडी: ${session.bookingDraft.centerName} \nफसल: ${session.bookingDraft.crop} (${session.bookingDraft.quantity} कुंतल) \nतारीख: ${session.bookingDraft.date}, स्लॉट: ${session.bookingDraft.slot} \nअनुमानित एमएसपी भुगतान: ₹${estPayout} \n\nपुष्टि करने के लिए 1 दबाएं। \nरद्द करके मुख्य मेनू के लिए 2 दबाएं।`
              : `Booking Summary: \nCenter: ${session.bookingDraft.centerName} \nCrop: ${session.bookingDraft.crop} (${session.bookingDraft.quantity} Qtl) \nDate: ${session.bookingDraft.date}, Slot: ${session.bookingDraft.slot} \nEstimated Payout: Rs. ${estPayout} \n\nPress 1 to Confirm. \nPress 2 to Cancel.`,
          expectDigits: 1,
        };
      }
      return {
        session,
        promptText: lang === "hi" ? "अमान्य स्लॉट विकल्प।" : "Invalid slot selection.",
        expectDigits: 1,
      };
    }

    // 8. BOOKING_CONFIRM
    if (session.stage === "BOOKING_CONFIRM") {
      if (input === "1") {
        const draft = session.bookingDraft || {};
        const booking = procurementService.createBooking({
          farmerName: `Farmer (${(session.phone || "9876").slice(-4)})`,
          mobile: session.phone || "9876543210",
          aadhaar4: (session.phone || "4821").slice(-4),
          centreId: draft.centerId,
          centreName: draft.centerName,
          district: draft.district,
          crop: draft.crop,
          quantity: draft.quantity,
          date: draft.date,
          slot: draft.slot,
        });

        session.stage = "MAIN_MENU";
        return {
          session,
          booking,
          promptText:
            lang === "hi"
              ? `बधाई हो! आपकी खरीद बुकिंग सफल हो गई है। \nआपका गेट पास टोकन नंबर है: ${booking.tokenId}। \nखरीद केंद्र: ${booking.centreName}। \nतारीख: ${booking.date}, समय: ${booking.slot}। \nअनुमानित भुगतान: ₹${booking.estimatedPayout}। \nकतार स्थिति संख्या ${booking.queuePos} है। \nयह टोकन आपके मोबाइल पर एसएमएस द्वारा भी भेजा गया है। \nमुख्य मेनू के लिए 9 दबाएं।`
              : `Congratulations! Your booking is confirmed. \nGate Pass Token: ${booking.tokenId}. \nCenter: ${booking.centreName}. \nDate: ${booking.date}, Slot: ${booking.slot}. \nEstimated Payout: Rs. ${booking.estimatedPayout}. \nQueue Position: #${booking.queuePos}. \nToken details sent via SMS. \nPress 9 for Main Menu.`,
          expectDigits: 1,
        };
      } else {
        session.stage = "MAIN_MENU";
        return this.getMainMenuPrompt(session);
      }
    }

    // 9. CANCEL_CONFIRM
    if (session.stage === "CANCEL_CONFIRM") {
      if (input === "1" && session.cancelTarget) {
        procurementService.cancelBooking(session.cancelTarget);
        const cancelledId = session.cancelTarget;
        session.cancelTarget = undefined;
        session.stage = "MAIN_MENU";
        return {
          session,
          promptText:
            lang === "hi"
              ? `टोकन ${cancelledId} सफलतापूर्वक रद्द कर दिया गया है। \nनया स्लॉट बुक करने के लिए 1 दबाएं। मुख्य मेनू के लिए 9 दबाएं।`
              : `Token ${cancelledId} cancelled successfully. \nPress 1 to Book a Slot. Press 9 for Main Menu.`,
          expectDigits: 1,
        };
      } else {
        session.stage = "MAIN_MENU";
        return this.getMainMenuPrompt(session);
      }
    }

    // 10. Intermediate stages view
    if (
      session.stage === "VIEWING_BOOKING" ||
      session.stage === "VIEWING_SLOTS" ||
      session.stage === "VIEWING_CENTERS"
    ) {
      if (input === "1") {
        session.stage = "BOOKING_SELECT_CROP";
        session.bookingDraft = { mobile: session.phone || "9876543210" };
        return {
          session,
          promptText:
            lang === "hi"
              ? "कृपया फसल चुनें: \nधान (Paddy) के लिए 1, गेहूं के लिए 2, सरसों के लिए 3 दबाएं।"
              : "Please select crop: \nPress 1 for Paddy, 2 for Wheat, 3 for Mustard.",
          expectDigits: 1,
        };
      }
      session.stage = "MAIN_MENU";
      return this.getMainMenuPrompt(session);
    }

    session.stage = "MAIN_MENU";
    return this.getMainMenuPrompt(session);
  }

  private getMainMenuText(lang: "hi" | "en") {
    if (lang === "hi") {
      return "किसानसेतु मुख्य मेनू: \nमंडी गेट पास बुक करने के लिए 1 दबाएं। \nअपनी बुकिंग या गेट पास देखने के लिए 2 दबाएं। \nस्लॉट उपलब्धता देखने के लिए 3 दबाएं। \nनजदीकी मंडी खोजने के लिए 4 दबाएं। \nबुकिंग रद्द करने के लिए 5 दबाएं। \nहेल्पलाइन सहायता के लिए 6 दबाएं। \nमेनू दोबारा सुनने के लिए 9 दबाएं।";
    }
    return "KisanSetu Main Menu: \nPress 1 to Book a Mandi Gate Pass. \nPress 2 to Check your Existing Booking or Gate Pass. \nPress 3 to Check Slot Availability. \nPress 4 to Find Nearest Procurement Center. \nPress 5 to Cancel a Booking. \nPress 6 for Helpline Support. \nPress 9 to Repeat Menu.";
  }

  private getMainMenuPrompt(session: IvrSession) {
    const lang = session.language || "hi";
    const greeting =
      lang === "hi"
        ? `नमस्ते किसान भाई, आपका फोन नंबर ${session.phone || "पहचाना गया"} है।`
        : `Hello farmer, your phone number ${session.phone || "identified"} is verified.`;

    return {
      session,
      promptText: `${greeting}\n\n${this.getMainMenuText(lang)}`,
      expectDigits: 1,
    };
  }
}

export const ivrServerEngine = new IvrServerEngine();

import { INITIAL_CENTRES, MSP_RATES } from "@/data/centres";

export interface ProcurementCenter {
  id: string;
  name: string;
  district: string;
  tehsil: string;
  distance: number;
  status: string;
  congestion: string;
  waitTime: string;
  openHours: string;
  crops: string[];
  availableSlots: number;
  officer: string;
  phone: string;
  lat?: number;
  lng?: number;
}

export interface BookingToken {
  tokenId: string;
  farmerName: string;
  mobile: string;
  aadhaar4: string;
  centreId: string;
  centreName: string;
  district: string;
  date: string;
  slot: string;
  crop: string;
  quantity: string;
  estimatedPayout: string;
  status: "Confirmed" | "Gate In" | "Weighed" | "Completed" | "Cancelled";
  issuedAt: string;
  queuePos: number;
  cancellationReason?: string;
}

export interface CreateBookingInput {
  farmerName?: string;
  mobile?: string;
  aadhaar4?: string;
  centreId?: string;
  centreName?: string;
  district?: string;
  date?: string;
  slot?: string;
  crop?: string;
  quantity?: string | number;
}

export interface IvrBookingInput {
  mobile: string;
  farmerIdentifier?: string; // or Aadhaar last 4
  aadhaar4?: string;
  farmerName?: string;
  crop?: string;
  quantity?: string | number;
  preferredCentre?: string;
  centreId?: string;
  preferredDate?: string;
  preferredSlot?: string;
}

// In-memory data store for the demo session
class ProcurementStore {
  private centers: ProcurementCenter[];
  private bookings: Map<string, BookingToken>;

  constructor() {
    this.centers = JSON.parse(JSON.stringify(INITIAL_CENTRES));
    this.bookings = new Map();

    // Seed initial active bookings
    const defaultBooking1: BookingToken = {
      tokenId: "KS-8942",
      farmerName: "Rameshwar Singh",
      mobile: "9876543210",
      aadhaar4: "4821",
      centreId: "c1",
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
    };
    const defaultBooking2: BookingToken = {
      tokenId: "KS-7120",
      farmerName: "Gurpreet Dhillon",
      mobile: "9812033445",
      aadhaar4: "6512",
      centreId: "c2",
      centreName: "Gharaunda Sub-Yard",
      district: "Karnal",
      date: "2026-08-27",
      slot: "10:00 AM - 12:00 PM",
      crop: "Wheat (Gehu)",
      quantity: "110",
      estimatedPayout: "2,66,750",
      status: "Gate In",
      issuedAt: "26 Aug 2026, 10:30 AM",
      queuePos: 1,
    };
    const defaultBooking3: BookingToken = {
      tokenId: "KS-4399",
      farmerName: "Satish Chand",
      mobile: "9416077889",
      aadhaar4: "3190",
      centreId: "c3",
      centreName: "Taraori Procurement Yard",
      district: "Karnal",
      date: "2026-08-28",
      slot: "07:00 AM - 09:00 AM",
      crop: "Mustard (Sarson)",
      quantity: "40",
      estimatedPayout: "2,38,000",
      status: "Confirmed",
      issuedAt: "27 Aug 2026, 02:45 PM",
      queuePos: 2,
    };

    this.bookings.set(defaultBooking1.tokenId, defaultBooking1);
    this.bookings.set(defaultBooking2.tokenId, defaultBooking2);
    this.bookings.set(defaultBooking3.tokenId, defaultBooking3);
  }

  public getCenters(): ProcurementCenter[] {
    return this.centers;
  }

  public getCenterById(id: string): ProcurementCenter | undefined {
    return this.centers.find((c) => c.id === id || c.name.toLowerCase().includes(id.toLowerCase()));
  }

  public getBooking(tokenId: string): BookingToken | undefined {
    return this.bookings.get(tokenId);
  }

  public getAllBookings(): BookingToken[] {
    return Array.from(this.bookings.values()).reverse();
  }

  public calculatePayout(cropName: string, quantityQuintals: number): string {
    const crop = cropName.toLowerCase();
    const mspObj = MSP_RATES.find((m) =>
      crop.includes(m.crop.toLowerCase()) || m.crop.toLowerCase().includes(crop)
    ) || { msp: 2300 };

    const total = quantityQuintals * mspObj.msp;
    return total.toLocaleString("en-IN");
  }

  public createBooking(input: CreateBookingInput): BookingToken {
    const farmerName = (input.farmerName || "Kisan").trim();
    const rawMobile = (input.mobile || "").replace(/\D/g, "");
    const mobile = rawMobile.length >= 10 ? rawMobile.slice(-10) : rawMobile || "9876543210";

    const rawAadhaar = (input.aadhaar4 || "").replace(/\D/g, "");
    const aadhaar4 = rawAadhaar.length >= 4 ? rawAadhaar.slice(-4) : rawAadhaar.padStart(4, "0");

    let targetCenter: ProcurementCenter | undefined;
    if (input.centreId) {
      targetCenter = this.getCenterById(input.centreId);
    }
    if (!targetCenter && input.centreName) {
      targetCenter = this.centers.find((c) => c.name === input.centreName);
    }
    if (!targetCenter) {
      targetCenter = this.centers[0];
    }

    const crop = input.crop || (targetCenter.crops[0] ?? "Paddy (Grade A)");
    const qNum = Math.max(1, typeof input.quantity === "number" ? input.quantity : parseFloat(input.quantity || "50") || 50);
    const quantity = qNum.toString();
    const estimatedPayout = this.calculatePayout(crop, qNum);

    const date = input.date || "2026-08-27";
    const slot = input.slot || "08:00 AM - 10:00 AM";

    // Enforce 1 active gate pass per farmer rule (anti-hoarding / anti-duplicate)
    const existingActive = Array.from(this.bookings.values()).find(
      (b) =>
        (b.mobile === mobile || (aadhaar4 && aadhaar4 !== "1234" && b.aadhaar4 === aadhaar4)) &&
        b.status !== "Completed" &&
        b.status !== "Cancelled"
    );
    if (existingActive) {
      throw new Error(
        `Active gate pass already exists: Farmer ${existingActive.farmerName} (Mobile: ${mobile}) already holds active token ${existingActive.tokenId} for ${existingActive.centreName} on ${existingActive.date} (${existingActive.slot}). Please cancel your existing pass before booking a new one.`
      );
    }

    // Generate unique Token ID (e.g. KS-5124)
    let tokenId = `KS-${Math.floor(1000 + Math.random() * 9000)}`;
    while (this.bookings.has(tokenId)) {
      tokenId = `KS-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Decrement available slots on center
    if (targetCenter.availableSlots > 0) {
      targetCenter.availableSlots -= 1;
    }

    const issuedAt = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + `, ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;

    const queuePos = Math.floor(1 + Math.random() * 5);

    const booking: BookingToken = {
      tokenId,
      farmerName,
      mobile,
      aadhaar4,
      centreId: targetCenter.id,
      centreName: targetCenter.name,
      district: targetCenter.district,
      date,
      slot,
      crop,
      quantity,
      estimatedPayout,
      status: "Confirmed",
      issuedAt,
      queuePos,
    };

    this.bookings.set(tokenId, booking);
    return booking;
  }

  public updateBookingStatus(
    tokenId: string,
    newStatus: BookingToken["status"],
    reason?: string
  ): boolean {
    const booking = this.bookings.get(tokenId);
    if (!booking) return false;

    if (newStatus === "Cancelled") {
      if (booking.status !== "Cancelled") {
        const center = this.centers.find((c) => c.id === booking.centreId || c.name === booking.centreName);
        if (center) {
          center.availableSlots += 1;
        }
      }
      booking.cancellationReason = reason || booking.cancellationReason || "Cancelled by Mandi Officer / Farmer";
    } else {
      delete booking.cancellationReason;
    }

    booking.status = newStatus;
    return true;
  }

  public cancelBooking(tokenId: string, reason?: string): boolean {
    return this.updateBookingStatus(tokenId, "Cancelled", reason);
  }

  public handleIvrBooking(input: IvrBookingInput) {
    const rawMobile = (input.mobile || "").replace(/\D/g, "");
    const mobile = rawMobile.length >= 10 ? rawMobile.slice(-10) : rawMobile || "9876543210";
    const aadhaar4 = input.aadhaar4 || input.farmerIdentifier?.slice(-4) || "1234";

    // If IVR caller already holds an active pass, announce it instead of creating duplicates
    const existingActive = Array.from(this.bookings.values()).find(
      (b) =>
        b.mobile === mobile &&
        b.status !== "Completed" &&
        b.status !== "Cancelled"
    );
    if (existingActive) {
      return {
        success: true,
        message: `Active pass already exists: ${existingActive.tokenId}`,
        data: existingActive,
        booking: existingActive,
        voiceResponse: {
          textHi: `Aapka gate pass pehle se active hai. Token number ${existingActive.tokenId} hai, mandi ${existingActive.centreName}, slot ${existingActive.slot}. Dobara book karne ki zaroorat nahi hai.`,
          textEn: `You already have an active gate pass ${existingActive.tokenId} for ${existingActive.centreName} on ${existingActive.date} at ${existingActive.slot}.`,
        },
      };
    }

    const farmerName = input.farmerName || `Farmer (${mobile.slice(-4)})`;
    const booking = this.createBooking({
      farmerName,
      mobile,
      aadhaar4,
      crop: input.crop,
      quantity: input.quantity,
      centreId: input.centreId,
      centreName: input.preferredCentre,
      date: input.preferredDate,
      slot: input.preferredSlot,
    });

    return {
      success: true,
      message: "Pass generated successfully via IVR telephony",
      data: booking,
      booking,
      voiceResponse: {
        textHi: `Aapka pass book ho gaya hai. Token number ${booking.tokenId} hai, mandi ${booking.centreName}, slot ${booking.slot}. SMS bhej diya gaya hai.`,
        textEn: `Your pass is confirmed. Token ID ${booking.tokenId}, center ${booking.centreName}, slot ${booking.slot}. SMS receipt sent.`,
      },
    };
  }
}

// Global in-memory singleton instance
const globalForProcurement = globalThis as unknown as { procurementStore?: ProcurementStore };
export const procurementService = globalForProcurement.procurementStore ?? new ProcurementStore();
if (process.env.NODE_ENV !== "production") {
  globalForProcurement.procurementStore = procurementService;
}

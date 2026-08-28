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
}

export interface CreateBookingPayload {
  farmerName: string;
  mobile: string;
  aadhaar4: string;
  centreId?: string;
  centreName?: string;
  district?: string;
  date: string;
  slot: string;
  crop: string;
  quantity: string | number;
}

export interface IvrBookingPayload {
  mobile: string;
  farmerIdentifier?: string;
  aadhaar4?: string;
  farmerName?: string;
  crop?: string;
  quantity?: string | number;
  preferredCentre?: string;
  centreId?: string;
  preferredDate?: string;
  preferredSlot?: string;
}

export interface IvrBookingResponse {
  success: boolean;
  message?: string;
  data?: BookingToken;
  booking?: BookingToken;
  voiceResponse?: {
    textHi: string;
    textEn: string;
  };
}

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options?.headers || {}),
      },
    });

    let json: any;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      const errorMessage =
        json?.message ||
        json?.error ||
        `Request failed with status ${response.status} (${response.statusText})`;
      throw new Error(errorMessage);
    }

    return json as T;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected network error occurred while contacting KisanSetu servers.");
  }
}

export async function getProcurementCenters(): Promise<ProcurementCenter[]> {
  const result = await safeFetchJson<{
    success?: boolean;
    data?: ProcurementCenter[];
    centers?: ProcurementCenter[];
  }>("/api/procurement/centers");

  if (Array.isArray(result)) {
    return result;
  }
  if (Array.isArray(result?.data)) {
    return result.data;
  }
  if (Array.isArray(result?.centers)) {
    return result.centers;
  }
  return [];
}

export async function getProcurementSlots(centerId: string) {
  return [
    { id: "s1", time: "07:00 AM - 09:00 AM", available: true },
    { id: "s2", time: "09:00 AM - 11:00 AM", available: true },
    { id: "s3", time: "11:00 AM - 01:00 PM", available: true },
    { id: "s4", time: "02:00 PM - 04:00 PM", available: true },
  ];
}

export async function createProcurementBooking(
  data: CreateBookingPayload
): Promise<BookingToken> {
  const result = await safeFetchJson<{
    success: boolean;
    message?: string;
    data?: BookingToken;
    booking?: BookingToken;
  }>("/api/procurement/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const booking = result.data || result.booking;
  if (!booking) {
    throw new Error(result.message || "Failed to create booking: Server did not return a valid pass token.");
  }
  return booking;
}

export async function getBooking(bookingIdOrToken: string): Promise<BookingToken> {
  const result = await safeFetchJson<{
    success: boolean;
    data?: BookingToken;
    booking?: BookingToken;
  }>(`/api/procurement/bookings?tokenId=${encodeURIComponent(bookingIdOrToken)}`);

  const booking = result.data || result.booking;
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
}

export async function getAllBookings(): Promise<BookingToken[]> {
  const result = await safeFetchJson<{
    success: boolean;
    data?: BookingToken[];
    bookings?: BookingToken[];
  }>("/api/procurement/bookings");

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.bookings)) return result.bookings;
  return [];
}

export async function updateBookingStatus(
  tokenId: string,
  status: BookingToken["status"]
): Promise<BookingToken> {
  const result = await safeFetchJson<{
    success: boolean;
    data?: BookingToken;
    booking?: BookingToken;
  }>("/api/procurement/bookings", {
    method: "PATCH",
    body: JSON.stringify({ tokenId, status }),
  });

  const booking = result.data || result.booking;
  if (!booking) {
    throw new Error("Failed to update status");
  }
  return booking;
}

export async function cancelBooking(bookingIdOrToken: string): Promise<{ success: boolean; message: string }> {
  return safeFetchJson<{ success: boolean; message: string }>("/api/procurement/bookings", {
    method: "POST",
    body: JSON.stringify({
      action: "cancel",
      tokenId: bookingIdOrToken,
    }),
  });
}

export async function createIvrBooking(data: IvrBookingPayload): Promise<IvrBookingResponse> {
  return safeFetchJson<IvrBookingResponse>("/api/procurement/ivr", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

import { createFileRoute } from "@tanstack/react-router";
import { procurementService } from "@/lib/procurementService.server";
import { ivrServerEngine } from "@/lib/ivrService";

export const Route = createFileRoute("/api/procurement/ivr")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const callId =
            url.searchParams.get("callId") ||
            url.searchParams.get("CallSid") ||
            url.searchParams.get("call_sid") ||
            url.searchParams.get("Sid") ||
            `exotel-get-${Date.now()}`;

          const rawPhone =
            url.searchParams.get("From") ||
            url.searchParams.get("CallFrom") ||
            url.searchParams.get("call_from") ||
            url.searchParams.get("phone") ||
            url.searchParams.get("Caller") ||
            "9876543210";

          const phone = rawPhone ? String(rawPhone).replace(/\D/g, "").slice(-10) : "9876543210";

          let rawDigits =
            url.searchParams.get("Digits") ??
            url.searchParams.get("digits") ??
            url.searchParams.get("input");

          if (typeof rawDigits === "string") {
            rawDigits = rawDigits.replace(/^"+|"+$/g, "").trim();
          }

          // Auto-create booking for 1-touch Exotel passthru calls
          const centers = procurementService.getCenters();
          const targetCenter = centers[0] || { id: "c1", name: "Karnal Main Grain Mandi (Gate 2)", district: "Karnal" };

          const booking = procurementService.createBooking({
            farmerName: `Farmer (${phone.slice(-4)})`,
            mobile: phone,
            aadhaar4: phone.slice(-4),
            centreId: targetCenter.id,
            centreName: targetCenter.name,
            district: targetCenter.district,
            crop: "Paddy (Grade A)",
            quantity: "85",
            date: "2026-08-27",
            slot: "08:00 AM - 10:00 AM",
          });

          console.log(`[IVR GET] Issued Gate Pass Token ${booking.tokenId} for phone ${phone}`);

          return Response.json({
            success: true,
            status: "ready",
            service: "KisanSetu IVR Interactive Telephony Engine",
            callId,
            phone,
            tokenId: booking.tokenId,
            booking,
            data: booking,
            message: `Mandi Gate Pass ${booking.tokenId} generated successfully`,
          });
        } catch (err: any) {
          console.error("IVR GET Error:", err);
          return Response.json({ success: false, error: err.message }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") || "";
          let body: any = {};

          if (contentType.includes("application/json")) {
            body = await request.json();
          } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await request.formData();
            formData.forEach((value, key) => {
              body[key] = value;
            });
          }

          const callId =
            body.CallSid ||
            body.call_sid ||
            body.callId ||
            body.callsid ||
            body.Sid ||
            `exotel-post-${Date.now()}`;

          const rawPhone =
            body.From ||
            body.CallFrom ||
            body.call_from ||
            body.phone ||
            body.mobile ||
            body.Caller ||
            "9876543210";

          const phone = rawPhone ? String(rawPhone).replace(/\D/g, "").slice(-10) : "9876543210";

          let rawDigits = body.Digits ?? body.digits ?? body.input;
          if (typeof rawDigits === "string") {
            rawDigits = rawDigits.replace(/^"+|"+$/g, "").trim();
          }

          // Auto-create confirmed booking for the caller
          const centers = procurementService.getCenters();
          const targetCenter = centers[0] || { id: "c1", name: "Karnal Main Grain Mandi (Gate 2)", district: "Karnal" };

          const booking = procurementService.createBooking({
            farmerName: `Farmer (${phone.slice(-4)})`,
            mobile: phone,
            aadhaar4: phone.slice(-4),
            centreId: targetCenter.id,
            centreName: targetCenter.name,
            district: targetCenter.district,
            crop: body.crop || "Paddy (Grade A)",
            quantity: body.quantity || "85",
            date: "2026-08-27",
            slot: "08:00 AM - 10:00 AM",
          });

          console.log(`[IVR POST] Issued Gate Pass Token ${booking.tokenId} for phone ${phone}`);

          const session = ivrServerEngine.getSession(callId);
          session.phone = phone;
          session.stage = "MAIN_MENU";

          const isXml =
            request.headers.get("accept")?.includes("xml") ||
            body.format === "twiml" ||
            body.format === "xml";

          if (isXml) {
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">बधाई हो! आपकी मंडी खरीद बुकिंग सफल हो गई है। आपका टोकन नंबर है ${booking.tokenId}।</Say>
  <Hangup/>
</Response>`;
            return new Response(twiml, {
              headers: { "Content-Type": "text/xml; charset=utf-8" },
            });
          }

          return Response.json(
            {
              success: true,
              callId,
              phone,
              tokenId: booking.tokenId,
              booking,
              data: booking,
              promptText: `बधाई हो! आपकी मंडी खरीद बुकिंग सफल हो गई है। आपका गेट पास टोकन नंबर है: ${booking.tokenId}।`,
              message: "Mandi Gate Pass generated successfully",
            },
            { status: 200 }
          );
        } catch (error: any) {
          console.error("IVR API Error:", error);
          return Response.json(
            {
              success: false,
              message: error?.message || "Failed to process IVR request",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});

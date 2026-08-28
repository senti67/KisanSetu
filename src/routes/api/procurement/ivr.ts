import { createFileRoute } from "@tanstack/react-router";
import { procurementService } from "@/lib/procurementService.server";

export const Route = createFileRoute("/api/procurement/ivr")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: "ready",
          service: "KisanSetu IVR Voice Booking Service",
          channels: ["IVR", "Telephony-1800-180-1551", "WhatsApp-Bot"],
        });
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          if (!body?.mobile) {
            return Response.json(
              {
                success: false,
                message: "Mobile number is required for IVR booking",
                voiceResponse: {
                  textHi: "कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें।",
                  textEn: "Please provide your 10-digit mobile number.",
                },
              },
              { status: 400 }
            );
          }

          const result = procurementService.handleIvrBooking(body);
          return Response.json(
            {
              success: true,
              message: "IVR Gate Pass booked successfully",
              data: result.booking,
              booking: result.booking,
              voiceResponse: result.voiceResponse,
            },
            { status: 201 }
          );
        } catch (error: any) {
          return Response.json(
            {
              success: false,
              message: error?.message || "Failed to process IVR booking",
              voiceResponse: {
                textHi: "तकनीकी समस्या के कारण बुकिंग नहीं हो सकी। कृपया हेल्पलाइन 1800-180-1551 पर संपर्क करें।",
                textEn: "Booking could not be completed. Please contact helpline 1800-180-1551.",
              },
            },
            { status: 500 }
          );
        }
      },
    },
  },
});

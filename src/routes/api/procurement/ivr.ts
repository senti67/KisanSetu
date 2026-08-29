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

          const session = ivrServerEngine.getSession(callId);
          if (phone) session.phone = phone;

          let stepResult;
          if (rawDigits !== null && rawDigits !== undefined && rawDigits !== "") {
            stepResult = await ivrServerEngine.processStep(session, rawDigits);
          } else {
            stepResult = {
              session,
              promptText:
                "किसानसेतु राष्ट्रीय खरीद हेल्पलाइन 1800-180-1551 में आपका स्वागत है। \nहिन्दी के लिए 1 दबाएं। For English press 2.",
              expectDigits: 1,
            };
          }

          return Response.json({
            success: true,
            status: "ready",
            service: "KisanSetu IVR Interactive Telephony Engine",
            callId,
            phone: session.phone,
            stage: session.stage,
            promptText: stepResult.promptText,
            expectDigits: stepResult.expectDigits,
            session,
            booking: (stepResult as any).booking || null,
            data: (stepResult as any).booking || null,
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

          const session = ivrServerEngine.getSession(callId);
          if (phone) session.phone = phone;

          let stepResult;
          if (rawDigits !== null && rawDigits !== undefined && rawDigits !== "") {
            stepResult = await ivrServerEngine.processStep(session, rawDigits);
          } else {
            stepResult = {
              session,
              promptText:
                "किसानसेतु राष्ट्रीय खरीद हेल्पलाइन 1800-180-1551 में आपका स्वागत है। \nहिन्दी के लिए 1 दबाएं। For English press 2.",
              expectDigits: 1,
            };
          }

          const isXml =
            request.headers.get("accept")?.includes("xml") ||
            body.format === "twiml" ||
            body.format === "xml";

          if (isXml) {
            const xmlVoice = session.language === "en" ? "Polly.Raveena" : "Polly.Aditi";
            const xmlLang = session.language === "en" ? "en-IN" : "hi-IN";
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="${stepResult.expectDigits || 1}" timeout="10">
    <Say language="${xmlLang}" voice="${xmlVoice}">${stepResult.promptText}</Say>
  </Gather>
</Response>`;
            return new Response(twiml, {
              headers: { "Content-Type": "text/xml; charset=utf-8" },
            });
          }

          return Response.json(
            {
              success: true,
              callId,
              phone: session.phone,
              stage: session.stage,
              promptText: stepResult.promptText,
              expectDigits: stepResult.expectDigits,
              session,
              booking: (stepResult as any).booking || null,
              data: (stepResult as any).booking || null,
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

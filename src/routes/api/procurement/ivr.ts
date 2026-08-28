import { createFileRoute } from "@tanstack/react-router";
import { ivrServerEngine } from "@/lib/ivrService";

export const Route = createFileRoute("/api/procurement/ivr")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const callId =
          url.searchParams.get("callId") ||
          url.searchParams.get("CallSid") ||
          url.searchParams.get("call_sid") ||
          url.searchParams.get("Sid") ||
          `exotel-${Date.now()}`;

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

        const language = (url.searchParams.get("language") as "hi" | "en") || "hi";

        const session = ivrServerEngine.getSession(callId);
        if (phone && !session.phone) session.phone = phone;
        if (language && !session.language) session.language = language;

        const result = await ivrServerEngine.processStep(session, rawDigits ?? undefined);

        const isXml =
          request.headers.get("accept")?.includes("xml") ||
          url.searchParams.get("format") === "twiml" ||
          url.searchParams.get("format") === "xml";

        if (isXml) {
          const cleanText = result.promptText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="${result.expectDigits || 1}" timeout="8" action="/api/procurement/ivr?callId=${encodeURIComponent(callId)}" method="POST">
    <Say language="hi-IN" voice="Polly.Aditi">${cleanText}</Say>
  </Gather>
  <Say language="hi-IN">समय समाप्त हो गया है।</Say>
  <Redirect method="POST">/api/procurement/ivr?callId=${encodeURIComponent(callId)}</Redirect>
</Response>`;
          return new Response(twiml, {
            headers: { "Content-Type": "text/xml; charset=utf-8" },
          });
        }

        return Response.json({
          status: "ready",
          service: "KisanSetu IVR Interactive Telephony Engine",
          tollFreeNumber: "1800-180-1551",
          callId,
          session: {
            stage: session.stage,
            language: session.language,
            phone: session.phone,
          },
          promptText: result.promptText,
          expectDigits: result.expectDigits || 1,
          booking: (result as any).booking || null,
        });
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
            `exotel-call-${Date.now()}`;

          const rawPhone =
            body.From ||
            body.CallFrom ||
            body.call_from ||
            body.phone ||
            body.mobile ||
            body.Caller ||
            "9876543210";

          const phone = rawPhone ? String(rawPhone).replace(/\D/g, "").slice(-10) : "9876543210";

          let rawDigits =
            body.Digits ??
            body.digits ??
            body.input;

          if (typeof rawDigits === "string") {
            rawDigits = rawDigits.replace(/^"+|"+$/g, "").trim();
          }

          const language = body.language || "hi";

          const session = ivrServerEngine.getSession(callId);
          if (phone && !session.phone) session.phone = phone;
          if (language && !session.language) session.language = language;

          const result = await ivrServerEngine.processStep(session, rawDigits);

          const isXml =
            request.headers.get("accept")?.includes("xml") ||
            body.format === "twiml" ||
            body.format === "xml";

          if (isXml) {
            const cleanText = result.promptText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="${result.expectDigits || 1}" timeout="8" action="/api/procurement/ivr?callId=${encodeURIComponent(callId)}" method="POST">
    <Say language="hi-IN" voice="Polly.Aditi">${cleanText}</Say>
  </Gather>
  <Say language="hi-IN">समय समाप्त हो गया है।</Say>
  <Redirect method="POST">/api/procurement/ivr?callId=${encodeURIComponent(callId)}</Redirect>
</Response>`;
            return new Response(twiml, {
              headers: { "Content-Type": "text/xml; charset=utf-8" },
            });
          }

          return Response.json(
            {
              success: true,
              callId,
              session: {
                stage: session.stage,
                language: session.language,
                phone: session.phone,
              },
              promptText: result.promptText,
              expectDigits: result.expectDigits || 1,
              booking: (result as any).booking || null,
            },
            { status: 200 }
          );
        } catch (error: any) {
          console.error("IVR API Error:", error);
          return Response.json(
            {
              success: false,
              message: error?.message || "Failed to process IVR request",
              promptText: "तकनीकी समस्या के कारण कॉल नहीं जोड़ी जा सकी। कृपया 1800-180-1551 पर संपर्क करें।",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});

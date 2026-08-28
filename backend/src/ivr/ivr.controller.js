const { ivrEngine } = require("./ivr.engine");
const ivrSession = require("./ivr.session");

/**
 * Main IVR Webhook Handler
 * Supports:
 * - Twilio / Exotel / Plivo / Standard Telephony Webhooks (POST & GET)
 * - JSON Telephony Gateway / In-App Voice Simulator
 * - TwiML Voice XML Response
 */
const handleIVR = async (req, res) => {
  try {
    const body = req.body || {};
    const query = req.query || {};

    // Extract Call Identifier
    const callId =
      body.CallSid ||
      body.CallSid ||
      body.callId ||
      body.callsid ||
      body.call_sid ||
      body.Sid ||
      query.CallSid ||
      query.callId ||
      query.callsid ||
      `sim-call-${Date.now()}`;

    // Extract Phone Number (Caller ID)
    const rawPhone =
      body.From ||
      body.phone ||
      body.Caller ||
      body.callfrom ||
      body.call_from ||
      query.From ||
      query.phone ||
      query.callfrom;

    const phone = rawPhone ? String(rawPhone).replace(/\D/g, "").slice(-10) : null;

    // Extract Keypad DTMF Input (digits)
    let input =
      body.Digits ??
      body.digits ??
      body.input ??
      query.Digits ??
      query.digits ??
      query.input;

    if (typeof input === "string") {
      input = input.replace(/^"+|"+$/g, "").trim();
    }

    // Get or initialize Call Session
    let session = ivrSession.getSession(callId);

    if (!session) {
      session = ivrSession.createSession(callId, {
        phone: phone || null,
        language: body.language || query.language || null,
        stage: "LANGUAGE",
      });
    }

    // Process State Machine Step
    const result = await ivrEngine.processStep(session, input);
    session = ivrSession.updateSession(callId, result.session);

    // Format response based on Client Request (TwiML vs JSON)
    const isXmlRequested =
      req.headers.accept?.includes("xml") ||
      query.format === "xml" ||
      query.format === "twiml" ||
      body.format === "twiml";

    if (isXmlRequested) {
      const twiml = ivrEngine.generateTwiML(
        result.promptText,
        `/api/ivr/webhook?callId=${encodeURIComponent(callId)}`,
        result.expectDigits || 1
      );
      res.setHeader("Content-Type", "text/xml; charset=utf-8");
      return res.send(twiml);
    }

    // Default: Clean JSON REST format for Simulator & API clients
    return res.status(200).json({
      success: true,
      callId,
      session: {
        stage: session.stage,
        language: session.language,
        phone: session.phone,
      },
      promptText: result.promptText,
      expectDigits: result.expectDigits || 1,
      booking: result.booking || null,
    });
  } catch (error) {
    console.error("[IVR Controller Error]:", error);

    const isXmlRequested = req.headers.accept?.includes("xml") || req.query.format === "xml";
    if (isXmlRequested) {
      res.setHeader("Content-Type", "text/xml; charset=utf-8");
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN">क्षमा करें, तकनीकी समस्या के कारण सेवा अनुपलब्ध है।</Say>
  <Hangup/>
</Response>`);
    }

    return res.status(500).json({
      success: false,
      message: "Internal IVR server error",
      promptText: "क्षमा करें, तकनीकी समस्या के कारण सेवा अनुपलब्ध है। कृपया हेल्पलाइन 1800-180-1551 पर संपर्क करें।",
    });
  }
};

/**
 * Reset / End Call Handler
 */
const endCall = (req, res) => {
  const callId = req.params.callId || req.body.callId || req.query.callId;
  if (callId) {
    ivrSession.deleteSession(callId);
  }
  return res.json({ success: true, message: "Call ended and session cleared" });
};

module.exports = {
  handleIVR,
  endCall,
};
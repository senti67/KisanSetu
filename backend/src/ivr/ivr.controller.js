const ivrService = require("./ivr.service");
const ivrSession = require("./ivr.session");

// ==========================
// IVR WEBHOOK
// Supports:
// 1. Development JSON requests
// 2. Exotel Passthru requests
// ==========================

const handleIVR = async (req, res) => {
  try {
    // ==========================
    // READ EXOTEL / JSON INPUT
    // ==========================

    const body = req.body || {};
    const query = req.query || {};

    const callId =
      body.callId ||
      body.callsid ||
      body.call_sid ||
      query.callId ||
      query.callsid ||
      query.call_sid;

    const phone =
      body.phone ||
      body.callfrom ||
      body.call_from ||
      query.phone ||
      query.callfrom ||
      query.call_from;

    let input =
      body.input ??
      body.digits ??
      query.input ??
      query.digits;

    // Exotel may send digits with quotes.
    if (typeof input === "string") {
      input = input.replace(/^"+|"+$/g, "");
    }

    // ==========================
    // VALIDATE CALL ID
    // ==========================

    if (!callId) {
      return res.status(400).json({
        message: "Call ID is required",
      });
    }

    // ==========================
    // GET EXISTING SESSION
    // ==========================

    let session = ivrSession.getSession(callId);

    // ==========================
    // CREATE NEW SESSION
    // ==========================

    if (!session) {
      if (!phone) {
        return res.status(400).json({
          message:
            "Phone number is required for a new call",
        });
      }

      const farmer =
        await ivrService.findFarmerByPhone(phone);

      if (!farmer) {
        return res.status(404).json({
          message:
            "Farmer account not found for this phone number",
        });
      }

      session = ivrSession.createSession(callId, {
        phone,
        farmerId: farmer.farmer.id,
        stage: "LANGUAGE",
      });

      // ==========================
      // FIRST CALL RESPONSE
      // ==========================

      if (input === undefined || input === null) {
        return res.status(200).json({
          success: true,
          session,
          farmer: {
            id: farmer.id,
            name: farmer.name,
          },
          response:
            ivrService.getLanguageMenu(),
        });
      }
    }

    // ==========================
    // LANGUAGE SELECTION
    // ==========================

    if (session.stage === "LANGUAGE") {
      if (input === undefined || input === null) {
        return res.status(200).json({
          success: true,
          session,
          response:
            ivrService.getLanguageMenu(),
        });
      }

      const result =
        ivrService.processLanguage(input);

      if (!result.success) {
        return res.status(200).json({
          success: false,
          session,
          response: result,
        });
      }

      session = ivrSession.updateSession(callId, {
        language: result.language,
        stage: "MAIN_MENU",
      });

      return res.status(200).json({
        success: true,
        session,
        response: {
          ...result,
          next:
            ivrService.getMainMenu(
              result.language
            ),
        },
      });
    }

    // ==========================
    // MAIN MENU
    // ==========================

    if (session.stage === "MAIN_MENU") {
      const selectedLanguage =
        session.language;

      if (!selectedLanguage) {
        return res.status(400).json({
          message:
            "Session language is missing",
        });
      }

      // ==========================
      // REPEAT MENU
      // ==========================

      if (
        input === undefined ||
        input === null ||
        String(input) === "9"
      ) {
        return res.status(200).json({
          success: true,
          session,
          response:
            ivrService.getMainMenu(
              selectedLanguage
            ),
        });
      }

      // ==========================
      // MY PRODUCE
      // ==========================

      if (String(input) === "3") {
        const produce =
          await ivrService.getMyProduce(
            session.farmerId
          );

        const message =
          ivrService.formatProduceForIVR(
            produce
          );

        return res.status(200).json({
          success: true,
          session,
          response: {
            action: "MY_PRODUCE",
            message,
            count: produce.length,
          },
        });
      }

      // ==========================
      // OTHER OPTIONS
      // ==========================

      const response =
        ivrService.processInput(
          input,
          selectedLanguage
        );

      return res.status(200).json({
        success: true,
        session,
        response,
      });
    }

    // ==========================
    // INVALID SESSION STAGE
    // ==========================

    return res.status(400).json({
      message:
        "Invalid IVR session stage",
    });
  } catch (error) {
    console.error("IVR error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  handleIVR,
};
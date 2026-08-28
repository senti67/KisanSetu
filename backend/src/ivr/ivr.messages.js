// Centralized Multilingual IVR Message Dictionary
// Supports natural, conversational Hindi and English for farmers

const IVR_MESSAGES = {
  hi: {
    welcome: "किसानसेतु राष्ट्रीय कृषि खरीद हेल्पलाइन में आपका स्वागत है।",
    langPrompt: "भाषा बदलने के लिए स्टार दबाएं।",
    identifyCaller: (phone) => `नमस्ते किसान भाई, आपका फोन नंबर ${phone} पहचाना गया है।`,
    enterPhonePrompt: "कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें और हैश दबाएं।",
    invalidPhone: "अमान्य फोन नंबर। कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।",

    mainMenuPrompt: "किसानसेतु मुख्य मेनू: \nमंडी गेट पास बुक करने के लिए 1 दबाएं। \nअपनी बुकिंग या गेट पास देखने के लिए 2 दबाएं। \nस्लॉट उपलब्धता जांचने के लिए 3 दबाएं। \nनजदीकी मंडी खोजने के लिए 4 दबाएं। \nबुकिंग रद्द करने के लिए 5 दबाएं। \nहेल्पलाइन सहायता के लिए 6 दबाएं। \nमेनू दोबारा सुनने के लिए 9 दबाएं।",

    selectCropPrompt: "कृपया फसल चुनें: \nधान के लिए 1 दबाएं। \nगेहूं के लिए 2 दबाएं। \nसरसों के लिए 3 दबाएं। \nचना के लिए 4 दबाएं। \nकपास के लिए 5 दबाएं।",

    enterQuantityPrompt: "कृपया कुंतल में फसल की अनुमानित मात्रा दर्ज करें और हैश दबाएं। जैसे 85 कुंतल के लिए 85 दर्ज करें।",
    invalidQuantity: "अमान्य मात्रा। कृपया 1 से 500 कुंतल के बीच मात्रा दर्ज करें।",

    selectCenterPrompt: (centers) => {
      let text = "कृपया खरीद केंद्र चुनें: \n";
      centers.forEach((c, idx) => {
        text += `${c.name} के लिए ${idx + 1} दबाएं। \n`;
      });
      return text;
    },

    selectSlotPrompt: (slots) => {
      let text = "कृपया समय स्लॉट चुनें: \n";
      slots.forEach((s, idx) => {
        text += `${s.time || s.startTime + " - " + s.endTime} के लिए ${idx + 1} दबाएं। \n`;
      });
      return text;
    },

    bookingSummaryPrompt: ({ centerName, centreName, crop, quantity, slot, date, estimatedPayout }) =>
      `आप ${centerName || centreName || "सरकारी खरीद केंद्र"} में ${quantity} कुंतल ${crop} की खरीद के लिए तारीख ${date}, स्लॉट ${slot} की बुकिंग कर रहे हैं। अनुमानित एमएसपी भुगतान लगभग ${estimatedPayout} रुपये है। \nपुष्टि करने के लिए 1 दबाएं। \nरद्द करके मुख्य मेनू पर जाने के लिए 2 दबाएं।`,

    bookingSuccess: ({ tokenId, centerName, centreName, date, slot, estimatedPayout, queuePos }) =>
      `बधाई हो! आपकी मंडी खरीद बुकिंग सफल हो गई है। \nआपका गेट पास टोकन नंबर है: ${tokenId}। \nखरीद केंद्र: ${centerName || centreName || "करनाल मुख्य अनाज मंडी"}। \nतारीख: ${date}, समय: ${slot}। \nअनुमानित एमएसपी भुगतान: ${estimatedPayout} रुपये। \nगेट पर आपकी कतार स्थिति संख्या ${queuePos || 1} है। \nयह टोकन आपके मोबाइल नंबर पर एसएमएस द्वारा भी भेजा गया है। किसानसेतु में कॉल करने के लिए धन्यवाद।`,

    bookingFailed: "क्षमा करें, स्लॉट उपलब्ध न होने या सर्वर त्रुटि के कारण बुकिंग नहीं हो सकी। कृपया कुछ समय बाद पुनः प्रयास करें।",

    noBookingFound: "आपके इस फोन नंबर पर कोई सक्रिय बुकिंग या गेट पास नहीं मिला। नया स्लॉट बुक करने के लिए मुख्य मेनू से 1 दबाएं।",

    bookingDetails: ({ tokenId, centerName, centreName, date, slot, crop, quantity, status, estimatedPayout, queuePos }) =>
      `आपकी सक्रिय बुकिंग का विवरण: \nटोकन नंबर: ${tokenId}। \nखरीद केंद्र: ${centerName || centreName || "करनाल मुख्य अनाज मंडी"}। \nफसल: ${crop}, मात्रा: ${quantity} कुंतल। \nतारीख: ${date}, स्लॉट: ${slot}। \nस्थिति: ${status}। \nअनुमानित भुगतान: ${estimatedPayout} रुपये। \nकतार स्थिति: नंबर ${queuePos || 1}। \nमुख्य मेनू के लिए 9 दबाएं।`,

    cancelConfirmPrompt: ({ tokenId, centerName, centreName }) =>
      `क्या आप टोकन ${tokenId} (${centerName || centreName || "खरीद केंद्र"}) को रद्द करना चाहते हैं? \nरद्द करने की पुष्टि के लिए 1 दबाएं। \nवापस जाने के लिए 2 दबाएं।`,

    cancelSuccess: ({ tokenId }) =>
      `आपका गेट पास टोकन ${tokenId} सफलतापूर्वक रद्द कर दिया गया है और स्लॉट मुक्त कर दिया गया है। नया स्लॉट बुक करने के लिए 1 दबाएं।`,

    cancelFailed: "बुकिंग रद्द करने में असमर्थ। कृपया पुनः प्रयास करें।",

    centersList: (centers) => {
      let text = "नजदीकी सरकारी खरीद मंडियां: \n";
      centers.slice(0, 3).forEach((c, idx) => {
        text += `${idx + 1}. ${c.name} (${c.district}), दूरी ${c.distance || "4"} किमी, अनुमानित प्रतीक्षा समय ${c.waitTime || "15 मिनट"}, उपलब्ध स्लॉट: ${c.availableSlots || 12}। \n`;
      });
      text += "मुख्य मेनू के लिए 9 दबाएं।";
      return text;
    },

    supportMessage:
      "किसानसेतु किसान हेल्पलाइन 1800-180-1551 पर संपर्क करें। कृषि अधिकारी सहायता सोमवार से शनिवार सुबह 8 से शाम 8 बजे तक उपलब्ध है। मुख्य मेनू के लिए 9 दबाएं।",

    invalidInput: "अमान्य इनपुट। कृपया सही विकल्प चुनें।",
    timeout: "कोई इनपुट प्राप्त नहीं हुआ। मेनू दोहराया जा रहा है।",
    goodbye: "किसानसेतु से संपर्क करने के लिए धन्यवाद। आपका दिन शुभ हो।"
  },

  en: {
    welcome: "Welcome to KisanSetu National Procurement Helpline.",
    langPrompt: "Press star to change language.",
    identifyCaller: (phone) => `Hello farmer, your phone number ${phone} has been identified.`,
    enterPhonePrompt: "Please enter your 10-digit mobile number followed by hash.",
    invalidPhone: "Invalid phone number. Please enter a valid 10-digit mobile number.",

    mainMenuPrompt: "KisanSetu Main Menu: \nPress 1 to Book a Mandi Gate Pass. \nPress 2 to Check your Existing Booking or Gate Pass. \nPress 3 to Check Slot Availability. \nPress 4 to Find Nearest Procurement Center. \nPress 5 to Cancel a Booking. \nPress 6 for Helpline Support. \nPress 9 to Repeat Menu.",

    selectCropPrompt: "Please select your crop: \nPress 1 for Paddy (Grade A). \nPress 2 for Wheat. \nPress 3 for Mustard. \nPress 4 for Gram (Chana). \nPress 5 for Cotton.",

    enterQuantityPrompt: "Please enter estimated crop quantity in quintals followed by hash. For example, for 85 quintals enter 85#",
    invalidQuantity: "Invalid quantity. Please enter a quantity between 1 and 500 quintals.",

    selectCenterPrompt: (centers) => {
      let text = "Please select procurement center: \n";
      centers.forEach((c, idx) => {
        text += `Press ${idx + 1} for ${c.name}. \n`;
      });
      return text;
    },

    selectSlotPrompt: (slots) => {
      let text = "Please select time slot: \n";
      slots.forEach((s, idx) => {
        text += `Press ${idx + 1} for ${s.time || s.startTime + " - " + s.endTime}. \n`;
      });
      return text;
    },

    bookingSummaryPrompt: ({ centerName, centreName, crop, quantity, slot, date, estimatedPayout }) =>
      `You are booking at ${centerName || centreName || "Procurement Center"} for ${quantity} quintals of ${crop} on ${date}, slot ${slot}. Estimated MSP payout is Rs. ${estimatedPayout}. \nPress 1 to Confirm. \nPress 2 to Cancel and return to main menu.`,

    bookingSuccess: ({ tokenId, centerName, centreName, date, slot, estimatedPayout, queuePos }) =>
      `Congratulations! Your procurement booking is confirmed. \nYour gate pass token number is: ${tokenId}. \nCenter: ${centerName || centreName || "Karnal Main Grain Mandi"}. \nDate: ${date}, Slot: ${slot}. \nEstimated MSP Payout: Rs. ${estimatedPayout}. \nGate queue position: #${queuePos || 1}. \nThis token has also been sent to your mobile by SMS. Thank you for calling KisanSetu.`,

    bookingFailed: "Sorry, we could not complete your booking due to unavailable slots or server error. Please try again later.",

    noBookingFound: "No active booking or gate pass found for this mobile number. Press 1 from main menu to book a new slot.",

    bookingDetails: ({ tokenId, centerName, centreName, date, slot, crop, quantity, status, estimatedPayout, queuePos }) =>
      `Your active booking details: \nToken ID: ${tokenId}. \nCenter: ${centerName || centreName || "Karnal Main Grain Mandi"}. \nCrop: ${crop}, Quantity: ${quantity} Quintals. \nDate: ${date}, Slot: ${slot}. \nStatus: ${status}. \nEstimated Payout: Rs. ${estimatedPayout}. \nQueue Position: #${queuePos || 1}. \nPress 9 for Main Menu.`,

    cancelConfirmPrompt: ({ tokenId, centerName, centreName }) =>
      `Do you want to cancel token ${tokenId} for ${centerName || centreName || "Procurement Center"}? \nPress 1 to confirm cancellation. \nPress 2 to go back.`,

    cancelSuccess: ({ tokenId }) =>
      `Your gate pass token ${tokenId} has been cancelled and slot capacity restored. Press 1 to book a new slot.`,

    cancelFailed: "Unable to cancel booking. Please try again.",

    centersList: (centers) => {
      let text = "Nearest Government Procurement Centers: \n";
      centers.slice(0, 3).forEach((c, idx) => {
        text += `${idx + 1}. ${c.name} (${c.district}), Distance ${c.distance || "4"} km, Wait Time ${c.waitTime || "15 mins"}, Available Slots: ${c.availableSlots || 12}. \n`;
      });
      text += "Press 9 for Main Menu.";
      return text;
    },

    supportMessage:
      "Please call KisanSetu Toll-Free Helpline at 1800-180-1551. Officer support is available Monday to Saturday 8 AM to 8 PM. Press 9 for Main Menu.",

    invalidInput: "Invalid input. Please try again.",
    timeout: "No input received. Repeating menu.",
    goodbye: "Thank you for contacting KisanSetu. Have a great day."
  }
};

module.exports = {
  IVR_MESSAGES,
};

// @ts-nocheck
/* eslint-disable */
import { useState, useEffect, useMemo } from "react";


    const Icon = ({ name, className = "w-4 h-4" }) => {
      const icons = {
        'home': <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
        'map-pin': <g><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></g>,
        'ticket': <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>,
        'calculator': <g><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></g>,
        'help-circle': <g><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></g>,
        'phone-call': <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
        'calendar': <g><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></g>,
        'search': <g><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>,
        'mic': <g><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></g>,
        'alert-circle': <g><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></g>,
        'arrow-right': <path d="M5 12h14M12 5l7 7-7 7"/>,
        'chevron-right': <path d="m9 18 6-6-6-6"/>,
        'printer': <g><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/><path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5"/></g>,
        'droplet': <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>,
        'check': <path d="M20 6 9 17l-5-5"/>,
        'copy': <g><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></g>,
        'navigation': <polygon points="3 11 22 2 13 21 11 13 3 11"/>,
        'file-text': <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/>,
        'wheat': <path d="M2 22 12 12 M12 12c.5-2.5 2.5-4.5 5-5 M12 12c-2.5.5-4.5 2.5-5 5 M12 12c.5-5.5 4.5-9.5 9.5-10 M12 12c-5.5.5-9.5 4.5-10 9.5"/>
      };

      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={className}
        >
          {icons[name] || <circle cx="12" cy="12" r="10" />}
        </svg>
      );
    };

    const SVGBarcode = ({ value }) => {
      const bars = useMemo(() => {
        let pattern = [1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1];
        for(let i = 0; i < value.length; i++) {
          const charCode = value.charCodeAt(i);
          pattern.push((charCode % 2), 1, (charCode % 3 > 0 ? 1 : 0), 0);
        }
        pattern.push(1,0,1,1,0,1);
        return pattern;
      }, [value]);

      return (
        <svg viewBox="0 0 160 40" className="w-full h-10 bg-white p-1 rounded">
          <g fill="#0f172a">
            {bars.map((bit, idx) => bit ? (
              <rect key={idx} x={idx * 3 + 4} y="4" width="2" height="32" />
            ) : null)}
          </g>
        </svg>
      );
    };

    const TRANSLATIONS = {
      en: {
        portalName: "KisanSetu",
        portalSub: "Mandi Gate Pass & MSP Portal",
        govtHeader: "Dept. of Agriculture • Govt. of India",
        helpline: "Helpdesk: 1800-180-1551",
        home: "Home",
        centres: "Mandis",
        myBooking: "My Pass",
        mspRates: "MSP Rates",
        help: "Helpline",
        bookSlotBtn: "Book Gate Pass",
        findNearest: "Search Mandi",
        searchPlaceholder: "Enter Mandi or District name...",
        cropType: "Select Crop",
        allCrops: "All Crops",
        distKm: "km",
        calculatePayout: "Calculate Payment",
        enterQuintal: "Quantity (Quintals)",
        estPayout: "Est. Bank Credit",
        moistureLimit: "Max Moisture: 17%",
        moistureAdvice: "Drying grain below 17% ensures 100% MSP payout without cuts.",
        requiredDocs: "Documents Required at Gate Entry",
        doc1: "Aadhaar Card",
        doc1Sub: "Original Aadhaar Card for identity verification",
        doc2: "Bank Passbook",
        doc2Sub: "Passbook for Direct Bank Transfer (DBT)",
        doc3: "Land Record (Khasra)",
        doc3Sub: "Land Registration / Khasra document",
        doc4: "Gate Pass (Token)",
        doc4Sub: "Token generated from KisanSetu portal",
        voiceSearchBtn: "Voice Search",
        activeToken: "Active Gate Pass",
        noTokenYet: "No Active Pass",
        noTokenSub: "Book a slot to get fast gate entry.",
        bookNowAction: "Book Gate Pass",
        cancelBooking: "Cancel Pass",
        printToken: "Print Token",
        gateEntryTime: "Entry Time",
        tokenNo: "Pass ID",
        centerLabel: "Mandi",
        dateLabel: "Entry Date",
        slotLabel: "Time Slot",
        qtlLabel: "Quantity",
        farmerName: "Farmer Name",
        mobileNo: "Mobile Number",
        aadhaarLast4: "Aadhaar (Last 4)",
        confirmBooking: "Issue Pass",
        back: "Back",
        gatePassBranch: "1. Mandi Gate Pass",
        gatePassDesc: "Skip gate lines & reserve entry slot",
        mspBranch: "2. MSP Price & Rates",
        mspDesc: "Official 2025-26 government rates",
        moistureBranch: "3. Moisture Tester",
        moistureDesc: "Check 17% limit to prevent price cuts",
        supportBranch: "4. Helpline & Assistance",
        supportDesc: "Direct call & document list",
        quickBookBtn: "Book Slot Now",
        viewPassBtn: "View Active Pass",
        checkMspBtn: "Check MSP List",
        calcEarningsBtn: "Calculate Money",
        testMoistureBtn: "Test Moisture",
        callHelplineBtn: "Call 1800-180-1551",
        viewDocsBtn: "View Required Docs",
        nearestMandisTitle: "Nearest Procurement Mandis",
        nearestMandisSub: "Live queue and slot availability",
        viewAllMandis: "View All Mandis",
        waitingTime: "Waiting",
        bookSlotArrow: "Book Slot →",
        sortByDistance: "Nearest",
        sortByWait: "Fastest Entry",
        sortBySlots: "Most Slots",
        mapNav: "Map",
        tehsilLabel: "Tehsil",
        distanceLabel: "Distance",
        fullSlots: "Full",
        digitalGatePass: "DIGITAL GATE PASS",
        gateScannerCode: "Gate Scanner Code",
        passInstructions: "Instructions: Bring your original Aadhaar card and Land Record passbook to Gate #2.",
        liveGateStatus: "Gate Live Status:",
        trucksAhead: "trucks ahead at Gate #2",
        estGateEntry: "Gate Entry: ~10 min",
        copyPass: "Copy Pass",
        copied: "Copied!",
        calcTitle: "MSP Payment Calculator",
        calcSub: "Enter quantity to calculate expected bank credit",
        mspTableTitle: "Government Minimum Support Prices (MSP Rates 2025-26)",
        cropHeader: "Crop",
        seasonHeader: "Season",
        mspHeader: "MSP Rate",
        changeHeader: "Increase",
        statusHeader: "Status",
        tollFreeTitle: "Government Toll-Free Helplines",
        kisanHelpline: "Kisan Toll-Free",
        kisanCallCenter: "Kisan Call Center",
        whatsappSupport: "WhatsApp Support",
        faqTitle: "Frequently Asked Questions (FAQs)",
        faq1Q: "1. What if moisture is higher than 17%?",
        faq1A: "Dry the crop in the sun for 2-3 hours on the drying yards provided at the mandi.",
        faq2Q: "2. When will MSP payment reach the bank account?",
        faq2A: "Directly into your DBT bank account within 48 to 72 hours of weighing.",
        faq3Q: "3. Can a gate pass be canceled or rescheduled?",
        faq3A: "Yes, go to 'My Pass' tab to cancel your pass and pick a new date/time slot.",
        stepLabel: "Step",
        ofLabel: "of",
        namePlaceholder: "Enter Farmer Name",
        mobilePlaceholder: "10-digit mobile number",
        aadhaarPlaceholder: "Last 4 digits",
        selectDate: "Select Date",
        selectSlot: "Select Slot",
        tomorrow: "Tomorrow",
        dayAfter: "Day After",
        saturday: "Saturday",
        understoodBtn: "Understood",
        requiredDocsHeader: "4 Required Documents for Gate Entry",
        footerGovt: "Dept. of Agriculture • Govt. of India",
        footerTagline: "Easy and Fast Access Portal"
      },
      hi: {
        portalName: "किसानसेतु",
        portalSub: "मंडी गेट पास व एमएसपी पोर्टल",
        govtHeader: "कृषि विभाग • भारत सरकार",
        helpline: "हेल्पलाइन: 1800-180-1551",
        home: "मुख्य पृष्ठ",
        centres: "मंडी सूची",
        myBooking: "मेरा पास",
        mspRates: "एमएसपी भाव",
        help: "सहायता",
        bookSlotBtn: "गेट पास बुक करें",
        findNearest: "मंडी खोजें",
        searchPlaceholder: "मंडी या जिले का नाम लिखें...",
        cropType: "फसल चुनें",
        allCrops: "सभी फसलें",
        distKm: "किमी",
        calculatePayout: "भुगतान कैलकुलेटर",
        enterQuintal: "मात्रा (क्विंटल)",
        estPayout: "अनुमानित बैंक खाते में राशि",
        moistureLimit: "अधिकतम नमी: 17%",
        moistureAdvice: "कटौती से बचने के लिए फसल 17% से कम सुखाकर लाएं।",
        requiredDocs: "मंडी गेट पर जरूरी कागजात",
        doc1: "आधार कार्ड",
        doc1Sub: "पहचान सत्यापन के लिए मूल आधार कार्ड",
        doc2: "बैंक पासबुक",
        doc2Sub: "DBT डायरेक्ट बैंक ट्रांसफर के लिए पासबुक",
        doc3: "खसरा नकल",
        doc3Sub: "मेरी फसल मेरा ब्योरा / जमाबंदी नकल",
        doc4: "गेट पास टोकन",
        doc4Sub: "किसानसेतु पोर्टल से जनरेट किया टोकन",
        voiceSearchBtn: "बोलकर खोजें",
        activeToken: "एक्टिव गेट पास",
        noTokenYet: "कोई पास जारी नहीं है",
        noTokenSub: "बिना लाइन एंट्री के लिए गेट पास बुक करें।",
        bookNowAction: "गेट पास बुक करें",
        cancelBooking: "रद्द करें",
        printToken: "प्रिंट पास",
        gateEntryTime: "रिपोर्टिंग समय",
        tokenNo: "पास ID",
        centerLabel: "मंडी",
        dateLabel: "तारीख",
        slotLabel: "समय स्लॉट",
        qtlLabel: "मात्रा",
        farmerName: "किसान का नाम",
        mobileNo: "मोबाइल नंबर",
        aadhaarLast4: "आधार (अंतिम 4 अंक)",
        confirmBooking: "पास बनाएं",
        back: "वापस",
        gatePassBranch: "1. मंडी गेट पास",
        gatePassDesc: "गेट की कतार से बचें, समय चुनें",
        mspBranch: "2. सरकारी भाव (MSP)",
        mspDesc: "2025-26 की आधिकारिक दरें व कमाई",
        moistureBranch: "3. नमी (Moisture) जांच",
        moistureDesc: "17% नमी सीमा जांचें ताकि दाम न कटे",
        supportBranch: "4. सहायता व कागजात",
        supportDesc: "फोन कॉल और जरूरी दस्तावेजों की सूची",
        quickBookBtn: "गेट पास बुक करें",
        viewPassBtn: "अपना पास देखें",
        checkMspBtn: "सरकारी भाव देखें",
        calcEarningsBtn: "अपनी कमाई जोड़ें",
        testMoistureBtn: "नमी जांचें",
        callHelplineBtn: "1800-180-1551 पर कॉल करें",
        viewDocsBtn: "जरूरी कागजात देखें",
        nearestMandisTitle: "आस-पास की मंडियां",
        nearestMandisSub: "लाइव कतार व स्लॉट स्थिति",
        viewAllMandis: "सभी देखें",
        waitingTime: "वेटिंग",
        bookSlotArrow: "स्लॉट बुक करें →",
        sortByDistance: "कम दूरी",
        sortByWait: "कम वेटिंग",
        sortBySlots: "अधिक स्लॉट",
        mapNav: "नक्शा",
        tehsilLabel: "तहसील",
        distanceLabel: "दूरी",
        fullSlots: "फूल (Full)",
        digitalGatePass: "डिजिटल गेट पास (GATE PASS)",
        gateScannerCode: "गेट स्कैनर कोड",
        passInstructions: "निर्देश: गेट नंबर 2 पर अपना आधार कार्ड और खसरा पासबुक साथ लाएं।",
        liveGateStatus: "गेट लाइव स्थिति:",
        trucksAhead: "ट्रक्स गेट 2 पर आगे हैं",
        estGateEntry: "गेट एंट्री: ~10 मिनट",
        copyPass: "कॉपी पास",
        copied: "कॉपी हुआ!",
        calcTitle: "एमएसपी भुगतान कैलकुलेटर",
        calcSub: "मात्रा डालकर देखें बैंक खाते में कितनी राशि आएगी",
        mspTableTitle: "सरकारी न्यूनतम समर्थन मूल्य (MSP Rates 2025-26)",
        cropHeader: "फसल (Crop)",
        seasonHeader: "सीज़न",
        mspHeader: "सरकारी भाव (MSP)",
        changeHeader: "बढ़ोतरी",
        statusHeader: "स्थिति",
        tollFreeTitle: "सरकारी सहायता नंबर (Toll-Free Helplines)",
        kisanHelpline: "किसान टोल फ्री नंबर",
        kisanCallCenter: "किसान कॉल सेंटर",
        whatsappSupport: "व्हाट्सएप सहायता",
        faqTitle: "अक्सर पूछे जाने वाले सवाल (FAQs)",
        faq1Q: "1. यदि नमी 17% से अधिक है तो क्या करें?",
        faq1A: "मंडी परिसर में बने सुखाने के पैड पर फसल को 2-3 घंटे धूप में सुखाएं।",
        faq2Q: "2. एमएसपी का पैसा बैंक में कब जमा होगा?",
        faq2A: "फसल तुलाई के 48 से 72 घंटे में सीधे DBT द्वारा आपके बैंक खाते में।",
        faq3Q: "3. गेट पास रद्द या बदला जा सकता है?",
        faq3A: "हाँ, 'मेरा पास' टैब में जाकर पास रद्द करें और नया समय चुनें।",
        stepLabel: "स्टेप",
        ofLabel: "का",
        namePlaceholder: "किसान का नाम लिखें",
        mobilePlaceholder: "10 अंक मोबाइल",
        aadhaarPlaceholder: "अंतिम 4 अंक",
        selectDate: "तारीख चुनें",
        selectSlot: "समय चुनें",
        tomorrow: "कल",
        dayAfter: "परसों",
        saturday: "शनिवार",
        understoodBtn: "समझ गया (Close)",
        requiredDocsHeader: "गेट एंट्री के लिए 4 जरूरी दस्तावेज",
        footerGovt: "कृषि विभाग • भारत सरकार",
        footerTagline: "आसान व तेज सीधी पहुंच पोर्टल"
      },
      pa: {
        portalName: "ਕਿਸਾਨਸੇਤੂ",
        portalSub: "ਮੰਡੀ ਗੇਟ ਪਰਚੀ ਅਤੇ MSP ਪੋਰਟਲ",
        govtHeader: "ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ • ਭਾਰਤ ਸਰਕਾਰ",
        helpline: "ਹੈਲਪਲਾਈਨ: 1800-180-1551",
        home: "ਮੁੱਖ ਪੰਨਾ",
        centres: "ਮੰਡੀਆਂ",
        myBooking: "ਮੇਰੀ ਪਰਚੀ",
        mspRates: "MSP ਰੇਟ",
        help: "ਮਦਦ",
        bookSlotBtn: "ਗੇਟ ਪਰਚੀ ਬਣਾਓ",
        findNearest: "ਮੰਡੀ ਲੱਭੋ",
        searchPlaceholder: "ਮੰਡੀ ਜਾਂ ਜ਼ਿਲ੍ਹੇ ਦਾ ਨਾਮ...",
        cropType: "ਫ਼ਸਲ ਚੁਣੋ",
        allCrops: "ਸਾਰੀਆਂ ਫ਼ਸਲਾਂ",
        distKm: "ਕਿਲੋਮੀਟਰ",
        calculatePayout: "ਹਿਸਾਬ ਲਗਾਓ",
        enterQuintal: "ਕੁਇੰਟਲ",
        estPayout: "ਬੈਂਕ 'ਚ ਜਮ੍ਹਾਂ ਰਕਮ",
        moistureLimit: "ਨਮੀ: ਵੱਧ ਤੋਂ ਵੱਧ 17%",
        moistureAdvice: "ਕਟੌਤੀ ਤੋਂ ਬਚਣ ਲਈ ਫ਼ਸਲ 17% ਤੋਂ ਘੱਟ ਸੁਕਾਓ।",
        requiredDocs: "ਗੇਟ 'ਤੇ ਜ਼ਰੂਰੀ ਕਾਗਜ਼",
        doc1: "ਅਧਾਰ ਕਾਰਡ",
        doc1Sub: "ਪਛਾਣ ਲਈ ਅਸਲ ਅਧਾਰ ਕਾਰਡ",
        doc2: "ਬੈਂਕ ਪਾਸਬੁੱਕ",
        doc2Sub: "DBT ਬੈਂਕ ਖਾਤੇ ਲਈ ਪਾਸਬੁੱਕ",
        doc3: "ਜ਼ਮੀਨ ਦੀ ਫ਼ਰਦ",
        doc3Sub: "ਜ਼ਮੀਨ ਦੀ ਜਮ੍ਹਾਂਬੰਦੀ / ਫ਼ਰਦ",
        doc4: "ਗੇਟ ਪਰਚੀ",
        doc4Sub: "ਕਿਸਾਨਸੇਤੂ ਪੋਰਟਲ ਤੋਂ ਪਰਚੀ",
        voiceSearchBtn: "ਬੋਲ ਕੇ ਲੱਭੋ",
        activeToken: "ਤੁਹਾਡੀ ਪਰਚੀ",
        noTokenYet: "ਕੋਈ ਪਰਚੀ ਨਹੀਂ",
        noTokenSub: "ਗੇਟ ਲਾਈਨ ਤੋਂ ਬਚਣ ਲਈ ਬੁੱਕ ਕਰੋ।",
        bookNowAction: "ਗੇਟ ਪਰਚੀ ਬਣਾਓ",
        cancelBooking: "ਰੱਦ ਕਰੋ",
        printToken: "ਪ੍ਰਿੰਟ",
        gateEntryTime: "ਪਹੁੰਚਣ ਦਾ ਸਮਾਂ",
        tokenNo: "ਪਰਚੀ ਨੰਬਰ",
        centerLabel: "ਮੰਡੀ ਕੇਂਦਰ",
        dateLabel: "ਤਾਰੀਖ਼",
        slotLabel: "ਸਮਾਂ",
        qtlLabel: "ਕੁਇੰਟਲ",
        farmerName: "ਕਿਸਾਨ ਦਾ ਨਾਮ",
        mobileNo: "ਮੋਬਾਈਲ ਨੰਬਰ",
        aadhaarLast4: "ਅਧਾਰ ਆਖ਼ਰੀ 4 ਅੰਕ",
        confirmBooking: "ਪਰਚੀ ਬਣਾਓ",
        back: "ਪਿੱਛੇ",
        gatePassBranch: "1. ਮੰਡੀ ਗੇਟ ਪਰਚੀ",
        gatePassDesc: "ਗੇਟ ਲਾਈਨ ਤੋਂ ਬਚੋ, ਸਮਾਂ ਚੁਣੋ",
        mspBranch: "2. MSP ਸਰਕਾਰੀ ਰੇਟ",
        mspDesc: "2025-26 ਦੇ ਰੇਟ ਅਤੇ ਹਿਸਾਬ",
        moistureBranch: "3. ਨਮੀ ਦੀ ਪਰਖ",
        moistureDesc: "17% ਨਮੀ ਚੈੱਕ ਕਰੋ",
        supportBranch: "4. ਮਦਦ ਅਤੇ ਕਾਗਜ਼",
        supportDesc: "ਸਿੱਧਾ ਫੋਨ ਅਤੇ ਜ਼ਰੂਰੀ ਕਾਗਜ਼",
        quickBookBtn: "ਗੇਟ ਪਰਚੀ ਬਣਾਓ",
        viewPassBtn: "ਪਰਚੀ ਵੇਖੋ",
        checkMspBtn: "MSP ਰੇਟ ਵੇਖੋ",
        calcEarningsBtn: "ਹਿਸਾਬ ਜੋੜੋ",
        testMoistureBtn: "ਨਮੀ ਚੈੱਕ ਕਰੋ",
        callHelplineBtn: "1800-180-1551 ਫੋਨ ਲਗਾਓ",
        viewDocsBtn: "ਜ਼ਰੂਰੀ ਕਾਗਜ਼ ਵੇਖੋ",
        nearestMandisTitle: "ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ",
        nearestMandisSub: "ਲਾਈਵ ਲਾਈਨ ਅਤੇ ਸਮਾਂ",
        viewAllMandis: "ਸਾਰੀਆਂ ਵੇਖੋ",
        waitingTime: "ਇੰਤਜ਼ਾਰ",
        bookSlotArrow: "ਬੁੱਕ ਕਰੋ →",
        sortByDistance: "ਘੱਟ ਦੂਰੀ",
        sortByWait: "ਘੱਟ ਇੰਤਜ਼ਾਰ",
        sortBySlots: "ਵੱਧ ਖਾਲੀ",
        mapNav: "ਨਕਸ਼ਾ",
        tehsilLabel: "ਤਹਿਸੀਲ",
        distanceLabel: "ਦੂਰੀ",
        fullSlots: "ਫੁੱਲ (Full)",
        digitalGatePass: "ਡਿਜੀਟਲ ਗੇਟ ਪਰਚੀ (GATE PASS)",
        gateScannerCode: "ਗੇਟ ਸਕੈਨਰ ਕੋਡ",
        passInstructions: "ਹਿਦਾਇਤ: ਗੇਟ ਨੰਬਰ 2 'ਤੇ ਆਪਣਾ ਅਧਾਰ ਕਾਰਡ ਅਤੇ ਫ਼ਰਦ ਨਾਲ ਲਿਆਓ।",
        liveGateStatus: "ਗੇਟ ਲਾਈਵ ਸਥਿਤੀ:",
        trucksAhead: "ਟਰੱਕ ਗੇਟ 2 'ਤੇ ਅੱਗੇ ਹਨ",
        estGateEntry: "ਗੇਟ ਪ੍ਰਵੇਸ਼: ~10 ਮਿੰਟ",
        copyPass: "ਕਾਪੀ ਪਰਚੀ",
        copied: "ਕਾਪੀ ਹੋ ਗਿਆ!",
        calcTitle: "MSP ਹਿਸਾਬ ਕੈਲਕੂਲੇਟਰ",
        calcSub: "ਕੁਇੰਟਲ ਪਾ ਕੇ ਵੇਖੋ ਕਿੰਨਾ ਪੈਸਾ ਮਿਲੇਗਾ",
        mspTableTitle: "ਸਰਕਾਰੀ ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP ਰੇਟ 2025-26)",
        cropHeader: "ਫ਼ਸਲ",
        seasonHeader: "ਸੀਜ਼ਨ",
        mspHeader: "ਸਰਕਾਰੀ ਰੇਟ (MSP)",
        changeHeader: "ਵਾਧਾ",
        statusHeader: "ਸਥਿਤੀ",
        tollFreeTitle: "ਸਰਕਾਰੀ ਹੈਲਪਲਾਈਨ ਨੰਬਰ",
        kisanHelpline: "ਕਿਸਾਨ ਟੋਲ ਫ੍ਰੀ ਨੰਬਰ",
        kisanCallCenter: "ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ",
        whatsappSupport: "ਵਟਸਐਪ ਮਦਦ",
        faqTitle: "ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ (FAQs)",
        faq1Q: "1. ਜੇਕਰ ਨਮੀ 17% ਤੋਂ ਵੱਧ ਹੋਵੇ ਤਾਂ ਕੀ ਕਰੀਏ?",
        faq1A: "ਮੰਡੀ ਵਿੱਚ ਧੁੱਪ ਵਿੱਚ ਫ਼ਸਲ ਨੂੰ 2-3 ਘੰਟੇ ਸੁਕਾਓ।",
        faq2Q: "2. MSP ਦਾ ਪੈਸਾ ਖਾਤੇ ਵਿੱਚ ਕਦੋਂ ਆਵੇਗਾ?",
        faq2A: "ਤੋਲ ਤੋਂ 48 ਤੋਂ 72 ਘੰਟਿਆਂ ਵਿੱਚ ਸਿੱਧਾ DBT ਰਾਹੀਂ ਖਾਤੇ ਵਿੱਚ।",
        faq3Q: "3. ਕੀ ਪਰਚੀ ਰੱਦ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ?",
        faq3A: "ਹਾਂ, 'ਮੇਰੀ ਪਰਚੀ' ਵਿੱਚ ਜਾ ਕੇ ਰੱਦ ਕਰ ਕੇ ਨਵਾਂ ਸਮਾਂ ਚੁਣੋ।",
        stepLabel: "ਸਟੈਪ",
        ofLabel: "ਦਾ",
        namePlaceholder: "ਕਿਸਾਨ ਦਾ ਨਾਮ ਲਿਖੋ",
        mobilePlaceholder: "10 ਅੰਕ ਮੋਬਾਈਲ",
        aadhaarPlaceholder: "ਆਖ਼ਰੀ 4 ਅੰਕ",
        selectDate: "ਤਾਰੀਖ਼ ਚੁਣੋ",
        selectSlot: "ਸਮਾਂ ਚੁਣੋ",
        tomorrow: "ਕੱਲ੍ਹ",
        dayAfter: "ਪਰਸੋਂ",
        saturday: "ਸ਼ਨੀਵਾਰ",
        understoodBtn: "ਠੀਕ ਹੈ (Close)",
        requiredDocsHeader: "ਗੇਟ ਲਈ 4 ਜ਼ਰੂਰੀ ਕਾਗਜ਼",
        footerGovt: "ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ • ਭਾਰਤ ਸਰਕਾਰ",
        footerTagline: "ਸੌਖੀ ਅਤੇ ਤੇਜ਼ ਸੇਵਾ ਪੋਰਟਲ"
      },
      mr: {
        portalName: "किसानसेतू",
        portalSub: "मंडी गेट पास व एमएसपी पोर्टल",
        govtHeader: "कृषी मंत्रालय • भारत सरकार",
        helpline: "हेल्पलाइन: 1800-180-1551",
        home: "मुख्य पृष्ठ",
        centres: "खरेदी केंद्र",
        myBooking: "माझा पास",
        mspRates: "हमीभाव दर",
        help: "मदत",
        bookSlotBtn: "गेट पास बुक करा",
        findNearest: "मंडी शोधा",
        searchPlaceholder: "मंडी किंवा जिल्हा शोधा...",
        cropType: "पिक निवडा",
        allCrops: "सर्व पिके",
        distKm: "किमी",
        calculatePayout: "रक्कम कॅल्क्युलेटर",
        enterQuintal: "मात्रा (क्विंटल)",
        estPayout: "बँकेत जमा रक्कम",
        moistureLimit: "कमाल ओलावा: 17%",
        moistureAdvice: "कपात टाळण्यासाठी धान्य 17% पेक्षा कमी वाळवा.",
        requiredDocs: "गेटवर लागणारी कागदपत्रे",
        doc1: "आधार कार्ड",
        doc1Sub: "ओळख पडताळणीसाठी मूळ आधार कार्ड",
        doc2: "बँक पासबुक",
        doc2Sub: "DBT थेट बँक हस्तांतरणासाठी पासबुक",
        doc3: "सातबारा उतारा",
        doc3Sub: "जमीन नोंदणी / सातबारा उतारा",
        doc4: "गेट पास",
        doc4Sub: "किसानसेतू पोर्टलवरून मिळालेला पास",
        voiceSearchBtn: "बोलून शोधा",
        activeToken: "सक्रिय गेट पास",
        noTokenYet: "पास उपलब्ध नाही",
        noTokenSub: "वेळ वाचवण्यासाठी आधीच स्लॉट निश्चित करा.",
        bookNowAction: "गेट पास बुक करा",
        cancelBooking: "रद्द करा",
        printToken: "प्रिंट करा",
        gateEntryTime: "रिपोर्टिंग वेळ",
        tokenNo: "पास क्रमांक",
        centerLabel: "खरेदी केंद्र",
        dateLabel: "तारीख",
        slotLabel: "वेळ स्लॉट",
        qtlLabel: "प्रमाण (क्विंटल)",
        farmerName: "शेतकऱ्याचे नाव",
        mobileNo: "मोबाईल नंबर",
        aadhaarLast4: "आधार शेवटचे ४ अंक",
        confirmBooking: "पास तयार करा",
        back: "मागे",
        gatePassBranch: "1. मंडी गेट पास",
        gatePassDesc: "रांगेत उभे राहणे टाळा",
        mspBranch: "2. हमीभाव दर",
        mspDesc: "२०२५-२६ चे शासकीय भाव",
        moistureBranch: "3. ओलावा (नमी) तपासणी",
        moistureDesc: "१७% ओलावा मर्यादा तपासा",
        supportBranch: "4. मदत व कागदपत्रे",
        supportDesc: "थेट कॉल व कागदपत्रे",
        quickBookBtn: "गेट पास बुक करा",
        viewPassBtn: "माझा पास पहा",
        checkMspBtn: "हमीभाव दर पहा",
        calcEarningsBtn: "रक्कम मोजा",
        testMoistureBtn: "ओलावा तपासा",
        callHelplineBtn: "1800-180-1551 वर कॉल करा",
        viewDocsBtn: "लागणारे कागदपत्रे पहा",
        nearestMandisTitle: "जवळची खरेदी केंद्रे",
        nearestMandisSub: "लाइव्ह रांग व वेळेची माहिती",
        viewAllMandis: "सर्व पहा",
        waitingTime: "प्रतीक्षा वेळ",
        bookSlotArrow: "स्लॉट बुक करा →",
        sortByDistance: "कमी अंतर",
        sortByWait: "कमी वेळ",
        sortBySlots: "जास्त स्लॉट",
        mapNav: "नकाशा",
        tehsilLabel: "तालुका",
        distanceLabel: "अंतर",
        fullSlots: "फुल (Full)",
        digitalGatePass: "डिजिटल गेट पास (GATE PASS)",
        gateScannerCode: "गेट स्कॅनर कोड",
        passInstructions: "सूचना: गेट क्र. २ वर मूळ आधार कार्ड व सातबारा उतारा सोबत आणा.",
        liveGateStatus: "गेट लाईव्ह स्थिती:",
        trucksAhead: "ट्रक गेट २ वर पुढे आहेत",
        estGateEntry: "गेट प्रवेश: ~१० मिनिटे",
        copyPass: "कॉपी करा",
        copied: "कॉपी झाले!",
        calcTitle: "हमीभाव रक्कम कॅल्क्युलेटर",
        calcSub: "क्विंटल टाकून बँकेत जमा होणारी रक्कम पहा",
        mspTableTitle: "शासकीय हमीभाव दर (MSP Rates 2025-26)",
        cropHeader: "पिक",
        seasonHeader: "हंगाम",
        mspHeader: "शासकीय दर (MSP)",
        changeHeader: "वाढ",
        statusHeader: "स्थिती",
        tollFreeTitle: "शासकीय मोफत मदत क्रमांक (Toll-Free Helplines)",
        kisanHelpline: "शेतकरी टोल फ्री क्रमांक",
        kisanCallCenter: "शेतकरी कॉल सेंटर",
        whatsappSupport: "व्हॉट्सॲप मदत",
        faqTitle: "सतत विचारले जाणारे प्रश्न (FAQs)",
        faq1Q: "१. ओलावा १७% पेक्षा जास्त असल्यास काय करावे?",
        faq1A: "धान्य खरेदी केंद्रावरील वाळवणी तळावर २-३ तास उन्हात वाळवा.",
        faq2Q: "२. हमीभावाचे पैसे बँकेत कधी जमा होतील?",
        faq2A: "मोजमाप झाल्यानंतर ४८ ते ७२ तासांत थेट DBT द्वारे.",
        faq3Q: "३. गेट पास रद्द किंवा बदलता येतो का?",
        faq3A: "होय, 'माझा पास' मधुन रद्द करून नवीन वेळ निवडा.",
        stepLabel: "टप्पा",
        ofLabel: "पैकी",
        namePlaceholder: "शेतकऱ्याचे नाव लिहा",
        mobilePlaceholder: "१० अंकी मोबाईल नंबर",
        aadhaarPlaceholder: "शेवटचे ४ अंक",
        selectDate: "तारीख निवडा",
        selectSlot: "वेळ निवडा",
        tomorrow: "उद्या",
        dayAfter: "परवा",
        saturday: "शनिवार",
        understoodBtn: "समजले (Close)",
        requiredDocsHeader: "गेट प्रवेशासाठी ४ आवश्यक कागदपत्रे",
        footerGovt: "कृषी मंत्रालय • भारत सरकार",
        footerTagline: "सोपी व जलद सेवा"
      }
    };

    const INITIAL_CENTRES = [
      {
        id: "c1",
        name: "Karnal Main Grain Mandi (Gate 2)",
        district: "Karnal",
        tehsil: "Karnal Urban",
        distance: 4.2,
        status: "open",
        congestion: "low",
        waitTime: "15 min",
        openHours: "07:00 AM - 06:00 PM",
        crops: ["Paddy (Dhan)", "Wheat (Gehu)", "Mustard"],
        availableSlots: 48,
        officer: "S. K. Verma",
        phone: "+91 98765 43210"
      },
      {
        id: "c2",
        name: "Gharaunda Sub-Yard",
        district: "Karnal",
        tehsil: "Gharaunda",
        distance: 11.8,
        status: "open",
        congestion: "med",
        waitTime: "30 min",
        openHours: "08:00 AM - 05:30 PM",
        crops: ["Paddy (Dhan)", "Wheat (Gehu)"],
        availableSlots: 19,
        officer: "Rajesh Kumar",
        phone: "+91 98123 00987"
      },
      {
        id: "c3",
        name: "Taraori Procurement Yard",
        district: "Karnal",
        tehsil: "Taraori",
        distance: 16.5,
        status: "open",
        congestion: "low",
        waitTime: "10 min",
        openHours: "07:30 AM - 06:00 PM",
        crops: ["Paddy (Dhan)", "Chana"],
        availableSlots: 62,
        officer: "Harpreet Singh",
        phone: "+91 94160 11223"
      },
      {
        id: "c4",
        name: "Ambala City Grain Hub",
        district: "Ambala",
        tehsil: "Ambala Urban",
        distance: 28.0,
        status: "open",
        congestion: "high",
        waitTime: "60+ min",
        openHours: "07:00 AM - 05:00 PM",
        crops: ["Paddy (Dhan)", "Wheat (Gehu)", "Cotton"],
        availableSlots: 4,
        officer: "M. P. Sharma",
        phone: "+91 99912 33445"
      },
      {
        id: "c5",
        name: "Kurukshetra Sector 13 Yard",
        district: "Kurukshetra",
        tehsil: "Thanesar",
        distance: 32.4,
        status: "open",
        congestion: "med",
        waitTime: "25 min",
        openHours: "08:00 AM - 06:00 PM",
        crops: ["Paddy (Dhan)", "Mustard"],
        availableSlots: 31,
        officer: "Gurdev Singh",
        phone: "+91 98722 88776"
      }
    ];

    const MSP_RATES = [
      { crop: "Paddy (Grade A)", msp: 2300, unit: "Qtl", season: "Kharif 2025-26", change: "+₹117", status: "Active" },
      { crop: "Paddy (Common)", msp: 2300, unit: "Qtl", season: "Kharif 2025-26", change: "+₹117", status: "Active" },
      { crop: "Wheat (Gehu)", msp: 2425, unit: "Qtl", season: "Rabi 2025-26", change: "+₹150", status: "Upcoming" },
      { crop: "Mustard (Sarson)", msp: 5950, unit: "Qtl", season: "Rabi 2025-26", change: "+₹300", status: "Active" },
      { crop: "Chana (Gram)", msp: 5650, unit: "Qtl", season: "Rabi 2025-26", change: "+₹210", status: "Active" },
      { crop: "Cotton (Long Staple)", msp: 7521, unit: "Qtl", season: "Kharif 2025-26", change: "+₹501", status: "Active" },
    ];

    function App() {
      const [lang, setLang] = useState('hi');
      const [activeTab, setActiveTab] = useState('home');
      
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedCrop, setSelectedCrop] = useState('All');
      const [sortBy, setSortBy] = useState('distance');
      const [centresData, setCentresData] = useState(INITIAL_CENTRES);
      
      const [activeToken, setActiveToken] = useState({
        tokenId: "KS-8942",
        farmerName: "Rameshwar Singh",
        mobile: "9876543210",
        aadhaar4: "4821",
        centreName: "Karnal Main Grain Mandi (Gate 2)",
        district: "Karnal",
        date: "2026-08-27",
        slot: "08:00 AM - 10:00 AM",
        crop: "Paddy (Grade A)",
        quantity: "85",
        estimatedPayout: "1,95,500",
        status: "Confirmed",
        issuedAt: "26 Aug 2026, 09:15 AM",
        queuePos: 3
      });

      const [bookingModalOpen, setBookingModalOpen] = useState(false);
      const [selectedCentreForBooking, setSelectedCentreForBooking] = useState(null);
      const [bookingStep, setBookingStep] = useState(1);
      
      const [formName, setFormName] = useState('');
      const [formMobile, setFormMobile] = useState('');
      const [formAadhaar, setFormAadhaar] = useState('');
      const [formCrop, setFormCrop] = useState('Paddy (Grade A)');
      const [formQuantity, setFormQuantity] = useState('50');
      const [formDate, setFormDate] = useState('2026-08-27');
      const [formSlot, setFormSlot] = useState('08:00 AM - 10:00 AM');

      const [isListening, setIsListening] = useState(false);
      const [copiedNotify, setCopiedNotify] = useState(false);
      const [showDocsModal, setShowDocsModal] = useState(false);

      const [calcCrop, setCalcCrop] = useState(MSP_RATES[0]);
      const [calcQuantity, setCalcQuantity] = useState(60);
      const [inputMoisture, setInputMoisture] = useState(16.5);

      const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

      const filteredCentres = useMemo(() => {
        let result = centresData.filter(c => {
          const q = searchQuery.toLowerCase().trim();
          const matchSearch = q === '' || 
            c.name.toLowerCase().includes(q) ||
            c.district.toLowerCase().includes(q) ||
            c.tehsil.toLowerCase().includes(q);
          
          const matchCrop = selectedCrop === 'All' || c.crops.some(cr => cr.toLowerCase().includes(selectedCrop.toLowerCase()));
          return matchSearch && matchCrop;
        });

        return result.sort((a, b) => {
          if (sortBy === 'distance') return a.distance - b.distance;
          if (sortBy === 'slots') return b.availableSlots - a.availableSlots;
          if (sortBy === 'wait') return parseInt(a.waitTime) - parseInt(b.waitTime);
          return 0;
        });
      }, [centresData, searchQuery, selectedCrop, sortBy]);

      const triggerVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';
          recognition.interimResults = false;
          
          setIsListening(true);
          recognition.start();

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript.replace(/\.$/, ''));
            setIsListening(false);
            setActiveTab('centres');
          };

          recognition.onerror = () => {
            setIsListening(false);
            setSearchQuery('Karnal');
            setActiveTab('centres');
          };

          recognition.onend = () => {
            setIsListening(false);
          };
        } else {
          setIsListening(true);
          setTimeout(() => {
            setIsListening(false);
            setSearchQuery('Karnal');
            setActiveTab('centres');
          }, 1200);
        }
      };

      const handleOpenBooking = (centre = null) => {
        const targetCentre = centre || centresData[0];
        setSelectedCentreForBooking(targetCentre);
        setBookingStep(1);
        if (activeToken) {
          setFormName(activeToken.farmerName);
          setFormMobile(activeToken.mobile);
          setFormAadhaar(activeToken.aadhaar4);
        }
        setBookingModalOpen(true);
      };

      const handleConfirmBooking = (e) => {
        e.preventDefault();
        const mspObj = MSP_RATES.find(m => m.crop.toLowerCase().includes(formCrop.toLowerCase())) || { msp: 2300 };
        const qtrNum = parseFloat(formQuantity) || 0;
        const totalPay = (qtrNum * mspObj.msp).toLocaleString('en-IN');

        const newToken = {
          tokenId: "KS-" + Math.floor(1000 + Math.random() * 9000),
          farmerName: formName || "Kisan",
          mobile: formMobile || "9800000000",
          aadhaar4: formAadhaar || "0000",
          centreName: selectedCentreForBooking ? selectedCentreForBooking.name : "Karnal Main Grain Mandi",
          district: selectedCentreForBooking ? selectedCentreForBooking.district : "Karnal",
          date: formDate,
          slot: formSlot,
          crop: formCrop,
          quantity: formQuantity,
          estimatedPayout: totalPay,
          status: "Confirmed",
          issuedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          queuePos: Math.floor(2 + Math.random() * 5)
        };

        if (selectedCentreForBooking) {
          setCentresData(prev => prev.map(c => 
            c.id === selectedCentreForBooking.id ? { ...c, availableSlots: Math.max(0, c.availableSlots - 1) } : c
          ));
        }

        setActiveToken(newToken);
        setBookingModalOpen(false);
        setActiveTab('my-booking');
      };

      const copyTokenToClipboard = () => {
        if (!activeToken) return;
        const text = `KisanSetu Gate Pass: ${activeToken.tokenId} | ${activeToken.centreName} | Date: ${activeToken.date} | Slot: ${activeToken.slot}`;
        
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        setCopiedNotify(true);
        setTimeout(() => setCopiedNotify(false), 2000);
      };

      const moistureAnalysis = useMemo(() => {
        const val = parseFloat(inputMoisture) || 0;
        if (val <= 14.0) {
          return { status: "Optimal", color: "text-emerald-700 bg-emerald-50 border-emerald-300", cut: "0% Deduction" };
        } else if (val <= 17.0) {
          return { status: "Pass", color: "text-ksbrand bg-ksbrand-light border-ksbrand/40", cut: "0% Deduction" };
        } else if (val <= 19.0) {
          return { status: "High Moisture", color: "text-amber-800 bg-amber-50 border-amber-300", cut: "~1.5% Cut" };
        } else {
          return { status: "Rejected", color: "text-red-800 bg-red-50 border-red-300", cut: "No Entry" };
        }
      }, [inputMoisture]);

      return (
        <div className="min-h-screen flex flex-col bg-ksbg">
          
          {/* Top Header Bar */}
          <header className="bg-ksbrand-dark text-white text-xs border-b border-ksbrand-dark/20">
            <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-emerald-100 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {t.govtHeader}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <a href="tel:18001801551" className="font-bold text-yellow-300 flex items-center gap-1 hover:underline bg-white/10 px-2 py-0.5 rounded">
                  <Icon name="phone-call" className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{t.helpline}</span>
                </a>
                
                {/* Language Picker */}
                <div className="flex items-center bg-black/30 rounded border border-white/20 p-0.5 text-[11px]">
                  <button onClick={() => setLang('hi')} className={`px-2 py-0.5 rounded ${lang === 'hi' ? 'bg-ksbrand text-white font-bold' : 'text-slate-200'}`}>हिंदी</button>
                  <button onClick={() => setLang('pa')} className={`px-2 py-0.5 rounded ${lang === 'pa' ? 'bg-ksbrand text-white font-bold' : 'text-slate-200'}`}>ਪੰਜਾਬੀ</button>
                  <button onClick={() => setLang('mr')} className={`px-2 py-0.5 rounded ${lang === 'mr' ? 'bg-ksbrand text-white font-bold' : 'text-slate-200'}`}>मराठी</button>
                  <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-ksbrand text-white font-bold' : 'text-slate-200'}`}>EN</button>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Bar */}
          <section className="bg-white border-b border-ksborder/60 sticky top-0 z-30 shadow-xs">
            <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
              <div 
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-ksbrand text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  🌾
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-none flex items-center gap-1.5">
                    {t.portalName}
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{t.portalSub}</p>
                </div>
              </div>

              <button 
                onClick={() => handleOpenBooking()}
                className="bg-ksbrand hover:bg-ksbrand-hover text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95">
                <Icon name="ticket" className="w-4 h-4 text-emerald-200" />
                <span>{t.bookSlotBtn}</span>
              </button>
            </div>

            {/* Tabs: Home replacing Help Tree */}
            <div className="bg-slate-50 border-t border-slate-200">
              <div className="max-w-5xl mx-auto px-3 flex space-x-1 overflow-x-auto text-xs sm:text-sm font-semibold">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'home' ? 'border-ksbrand text-ksbrand font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                  <Icon name="home" className="w-4 h-4 text-ksbrand" />
                  <span>{t.home}</span>
                </button>

                <button 
                  onClick={() => setActiveTab('centres')}
                  className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'centres' ? 'border-ksbrand text-ksbrand font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                  <Icon name="map-pin" className="w-4 h-4" />
                  <span>{t.centres}</span>
                </button>

                <button 
                  onClick={() => setActiveTab('my-booking')}
                  className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'my-booking' ? 'border-ksbrand text-ksbrand font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                  <Icon name="ticket" className="w-4 h-4" />
                  <span>{t.myBooking}</span>
                  {activeToken && <span className="w-2 h-2 rounded-full bg-ksaccent animate-ping"></span>}
                </button>

                <button 
                  onClick={() => setActiveTab('msp-rates')}
                  className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'msp-rates' ? 'border-ksbrand text-ksbrand font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                  <Icon name="calculator" className="w-4 h-4" />
                  <span>{t.mspRates}</span>
                </button>

                <button 
                  onClick={() => setActiveTab('help')}
                  className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'help' ? 'border-ksbrand text-ksbrand font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                  <Icon name="help-circle" className="w-4 h-4" />
                  <span>{t.help}</span>
                </button>
              </div>
            </div>
          </section>

          {}
          <main className="max-w-5xl w-full mx-auto px-4 py-4 flex-grow space-y-4">
            
            {/* Quick Announcement Banner */}
            <div className="bg-ksaccent-light border border-ksaccent/40 text-slate-900 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📢</span>
                <div>
                  <span className="font-bold text-ksaccent mr-1">MSP Paddy 2025-26: ₹2,300/Qtl.</span>
                  <span className="text-slate-700 hidden sm:inline">{t.moistureAdvice}</span>
                </div>
              </div>
              <button 
                onClick={triggerVoiceSearch}
                disabled={isListening}
                className="shrink-0 bg-white border border-ksaccent text-ksaccent hover:bg-ksaccent hover:text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition">
                <Icon name="mic" className="w-3.5 h-3.5" />
                <span>{isListening ? "Listening..." : t.voiceSearchBtn}</span>
              </button>
            </div>

            {/* TAB: HOME DASHBOARD (Direct Access Cards) */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                
                {/* 4 DIRECT SERVICE ACCESS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* CARD 1: MANDI GATE PASS */}
                  <div className="node-glow bg-white border-2 border-ksbrand/70 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-ksbrand-light text-ksbrand flex items-center justify-center text-xl font-bold border border-ksbrand/20">
                            🎟️
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900">{t.gatePassBranch}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t.gatePassDesc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">Fast Entry</span>
                      </div>

                      {activeToken && (
                        <div className="mt-3 bg-ksbrand-light border border-ksbrand/40 p-2.5 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-ksbrand-dark">
                            <span>{t.activeToken}: {activeToken.tokenId}</span>
                            <span className="bg-white text-slate-800 px-1.5 py-0.5 rounded text-[10px]">Gate #2</span>
                          </div>
                          <div className="text-slate-700 truncate">{activeToken.centreName}</div>
                          <div className="text-slate-600 text-[11px]">{t.slotLabel}: <strong>{activeToken.slot}</strong></div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => handleOpenBooking()}
                        className="w-full bg-ksbrand hover:bg-ksbrand-hover text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition">
                        <Icon name="ticket" className="w-3.5 h-3.5" />
                        <span>{t.quickBookBtn}</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('my-booking')}
                        className="w-full bg-ksbrand-light hover:bg-ksbrand/20 text-ksbrand-dark border border-ksbrand/30 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                        <Icon name="search" className="w-3.5 h-3.5" />
                        <span>{t.viewPassBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: MSP & EARNINGS */}
                  <div className="node-glow bg-white border-2 border-ksaccent/60 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-ksaccent-light text-ksaccent flex items-center justify-center text-xl font-bold border border-ksaccent/20">
                            💰
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900">{t.mspBranch}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t.mspDesc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">₹2,300/Qtl</span>
                      </div>

                      <div className="mt-3 bg-ksbg border border-ksborder/60 p-2.5 rounded-lg text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-700">100 {t.enterQuintal} =</span>
                        <span className="font-black text-ksaccent text-sm">₹2,30,000</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => setActiveTab('msp-rates')}
                        className="w-full bg-ksaccent hover:bg-ksaccent-hover text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition">
                        <Icon name="calculator" className="w-3.5 h-3.5" />
                        <span>{t.calcEarningsBtn}</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('msp-rates')}
                        className="w-full bg-ksaccent-light hover:bg-ksaccent/20 text-ksaccent-hover border border-ksaccent/30 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                        <Icon name="file-text" className="w-3.5 h-3.5" />
                        <span>{t.checkMspBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: MOISTURE CHECKER */}
                  <div className="node-glow bg-white border-2 border-blue-300 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-200">
                            💧
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900">{t.moistureBranch}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t.moistureDesc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">Max 17%</span>
                      </div>

                      <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-600">{t.moistureBranch}:</span>
                          <span className="text-slate-900">{inputMoisture}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="22" 
                          step="0.5" 
                          value={inputMoisture}
                          onChange={(e) => setInputMoisture(parseFloat(e.target.value))}
                          className="w-full accent-ksbrand h-1.5 bg-slate-200 rounded cursor-pointer"
                        />
                        <div className={`p-1 text-center rounded text-[11px] font-bold border ${moistureAnalysis.color}`}>
                          {moistureAnalysis.status} — {moistureAnalysis.cut}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => {
                          const val = prompt(`${t.moistureBranch} (%):`, inputMoisture);
                          if (val) setInputMoisture(parseFloat(val) || 16.5);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                        <Icon name="droplet" className="w-3.5 h-3.5" />
                        <span>{t.testMoistureBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 4: HELPLINE & DOCUMENTS */}
                  <div className="node-glow bg-white border-2 border-purple-300 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold border border-purple-200">
                            📞
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900">{t.supportBranch}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t.supportDesc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-300">Toll Free</span>
                      </div>

                      <div className="mt-3 bg-purple-50/60 p-2.5 rounded-lg border border-purple-100 text-[11px] text-slate-700 space-y-1">
                        <div className="font-bold text-purple-900">{t.requiredDocs}:</div>
                        <div className="grid grid-cols-2 gap-1 font-semibold">
                          <span>1. {t.doc1}</span>
                          <span>2. {t.doc2}</span>
                          <span>3. {t.doc3}</span>
                          <span>4. {t.doc4}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <a 
                        href="tel:18001801551"
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition">
                        <Icon name="phone-call" className="w-3.5 h-3.5" />
                        <span>{t.callHelplineBtn}</span>
                      </a>

                      <button 
                        onClick={() => setShowDocsModal(true)}
                        className="w-full bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                        <Icon name="file-text" className="w-3.5 h-3.5" />
                        <span>{t.viewDocsBtn}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Direct Mandi Selection Grid */}
                <div className="bg-white border border-ksborder rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon name="map-pin" className="w-4 h-4 text-ksbrand" />
                        <span>{t.nearestMandisTitle}</span>
                      </h3>
                      <p className="text-xs text-slate-500">{t.nearestMandisSub}</p>
                    </div>

                    <button 
                      onClick={() => setActiveTab('centres')}
                      className="text-xs font-bold text-ksbrand hover:underline">
                      {t.viewAllMandis} ({centresData.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {centresData.slice(0, 3).map((centre) => (
                      <div 
                        key={centre.id}
                        onClick={() => handleOpenBooking(centre)}
                        className="p-3 bg-ksbg hover:bg-ksbrand-light border border-ksborder/60 hover:border-ksbrand rounded-lg cursor-pointer transition flex flex-col justify-between space-y-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900 truncate">{centre.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{centre.district} • {centre.distance} {t.distKm}</div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-ksborder/40">
                          <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {t.waitingTime}: {centre.waitTime}
                          </span>
                          <span className="font-bold text-ksbrand">
                            {t.bookSlotArrow}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: CENTRES / MANDIS */}
            {activeTab === 'centres' && (
              <div className="space-y-3">
                <div className="bg-white border border-ksborder p-3 rounded-xl flex flex-col sm:flex-row gap-2 shadow-xs">
                  <div className="flex-1 relative">
                    <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full pl-9 pr-7 py-2 bg-ksbg border border-ksborder/80 rounded-lg text-xs sm:text-sm text-slate-900 font-medium"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">✕</button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="py-2 px-3 bg-ksbg border border-ksborder/80 rounded-lg text-xs sm:text-sm font-semibold text-slate-900">
                      <option value="All">{t.allCrops}</option>
                      <option value="Paddy">Paddy (धान)</option>
                      <option value="Wheat">Wheat (गेहूं)</option>
                      <option value="Mustard">Mustard (सरसों)</option>
                      <option value="Chana">Chana (चना)</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="py-2 px-3 bg-ksbg border border-ksborder/80 rounded-lg text-xs sm:text-sm font-semibold text-slate-900">
                      <option value="distance">{t.sortByDistance}</option>
                      <option value="wait">{t.sortByWait}</option>
                      <option value="slots">{t.sortBySlots}</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-ksborder rounded-xl overflow-hidden divide-y divide-slate-100 shadow-xs">
                  {filteredCentres.map((centre) => (
                    <div key={centre.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ksbg/40">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{centre.name}</h3>
                          <span className="text-[10px] bg-ksbg text-slate-700 px-2 py-0.5 rounded border border-ksborder/60 font-semibold">
                            {centre.district}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-x-2 flex flex-wrap items-center">
                          <span>{t.tehsilLabel}: <strong>{centre.tehsil}</strong></span>
                          <span>•</span>
                          <span>{t.distanceLabel}: <strong>{centre.distance} {t.distKm}</strong></span>
                          <span>•</span>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.name + ' ' + centre.district)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ksbrand font-bold underline inline-flex items-center gap-0.5">
                            <Icon name="navigation" className="w-3 h-3" />
                            <span>{t.mapNav}</span>
                          </a>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {centre.crops.map((crop, idx) => (
                            <span key={idx} className="bg-ksbrand-light text-ksbrand-dark text-[10px] px-2 py-0.5 rounded-full font-medium border border-ksbrand/20">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <div className="text-left sm:text-right text-xs">
                          <div className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {t.waitingTime}: {centre.waitTime}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">{t.sortBySlots}: <strong className="text-ksbrand font-bold">{centre.availableSlots}</strong></div>
                        </div>

                        <button 
                          onClick={() => handleOpenBooking(centre)}
                          disabled={centre.availableSlots === 0}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${centre.availableSlots > 0 ? 'bg-ksbrand hover:bg-ksbrand-hover text-white active:scale-95' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}>
                          {centre.availableSlots > 0 ? t.bookSlotBtn : t.fullSlots}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: GATE PASS TOKEN & QUEUE */}
            {activeTab === 'my-booking' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {activeToken ? (
                  <div className="space-y-3">
                    
                    <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="font-extrabold text-emerald-900">{t.liveGateStatus}</span>
                        <span className="text-slate-800 font-semibold">{activeToken.queuePos} {t.trucksAhead}</span>
                      </div>
                      <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">{t.estGateEntry}</span>
                    </div>

                    <div id="printable-token" className="bg-white border-2 border-ksbrand rounded-xl p-5 space-y-4 shadow-md">
                      
                      <div className="flex items-start justify-between border-b border-slate-200 pb-3 gap-2">
                        <div>
                          <span className="text-[11px] font-black uppercase text-ksbrand bg-ksbrand-light px-2.5 py-1 rounded-full border border-ksbrand/20">
                            {t.digitalGatePass}
                          </span>
                          <h2 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
                            {activeToken.tokenId}
                          </h2>
                          <p className="text-[11px] text-slate-500 font-medium">Issued: {activeToken.issuedAt}</p>
                        </div>

                        <div className="bg-ksbg border border-ksborder p-2 rounded-lg text-center max-w-[140px]">
                          <SVGBarcode value={activeToken.tokenId} />
                          <span className="text-[8px] font-mono text-slate-600 block mt-1 font-bold">{t.gateScannerCode}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-2.5 bg-ksbg rounded-lg border border-ksborder/60">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">{t.farmerName}</span>
                          <span className="font-black text-slate-900 block mt-0.5 text-sm">{activeToken.farmerName}</span>
                        </div>

                        <div className="p-2.5 bg-ksbg rounded-lg border border-ksborder/60">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">{t.centerLabel}</span>
                          <span className="font-bold text-slate-900 block mt-0.5 leading-tight">{activeToken.centreName}</span>
                        </div>

                        <div className="p-2.5 bg-ksbrand-light rounded-lg border border-ksbrand/30 col-span-2 sm:col-span-1">
                          <span className="text-[10px] uppercase font-extrabold text-ksbrand-dark block">{t.gateEntryTime}</span>
                          <span className="font-black text-slate-900 block mt-0.5">{activeToken.slot}</span>
                          <span className="text-ksbrand text-[11px] font-bold">{activeToken.date}</span>
                        </div>

                        <div className="p-2.5 bg-ksbg rounded-lg border border-ksborder/60">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">{t.cropType}</span>
                          <span className="font-bold text-slate-900 block mt-0.5">{activeToken.crop}</span>
                        </div>

                        <div className="p-2.5 bg-ksbg rounded-lg border border-ksborder/60">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">{t.qtlLabel}</span>
                          <span className="font-black text-slate-900 block mt-0.5">{activeToken.quantity} {t.enterQuintal}</span>
                        </div>

                        <div className="p-2.5 bg-ksaccent-light rounded-lg border border-ksaccent/30">
                          <span className="text-[10px] uppercase font-extrabold text-ksaccent-hover block">{t.estPayout}</span>
                          <span className="font-black text-ksaccent block mt-0.5 text-sm">₹{activeToken.estimatedPayout}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 font-medium">
                        📌 <strong>{t.passInstructions}</strong>
                      </div>

                    </div>

                    <div className="flex items-center justify-between gap-2 bg-white p-3 border border-ksborder rounded-xl no-print text-xs shadow-xs">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.print()}
                          className="bg-ksbrand hover:bg-ksbrand-hover text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-xs">
                          <Icon name="printer" className="w-4 h-4" />
                          <span>{t.printToken}</span>
                        </button>

                        <button 
                          onClick={copyTokenToClipboard}
                          className="bg-kssec border border-ksborder text-slate-800 px-3.5 py-2 rounded-lg font-bold flex items-center gap-1">
                          <Icon name="copy" className="w-4 h-4" />
                          <span>{copiedNotify ? t.copied : t.copyPass}</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => setActiveToken(null)}
                        className="text-red-700 hover:text-red-900 font-bold px-3 py-2 rounded-lg border border-red-200 bg-red-50">
                        {t.cancelBooking}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-ksborder rounded-xl p-8 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                      🎫
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{t.noTokenYet}</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">{t.noTokenSub}</p>
                    <button 
                      onClick={() => handleOpenBooking()}
                      className="bg-ksbrand hover:bg-ksbrand-hover text-white px-5 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition">
                      <Icon name="ticket" className="w-4 h-4" />
                      <span>{t.bookNowAction}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MSP RATES & CALCULATOR */}
            {activeTab === 'msp-rates' && (
              <div className="space-y-4">
                
                <div className="bg-white border border-ksborder p-4 sm:p-5 rounded-xl space-y-4 shadow-xs">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{t.calcTitle}</h3>
                    <p className="text-xs text-slate-500">{t.calcSub}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-ksbg p-3.5 rounded-lg border border-ksborder/60 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t.cropType}</label>
                      <select
                        value={calcCrop.crop}
                        onChange={(e) => {
                          const c = MSP_RATES.find(m => m.crop === e.target.value);
                          if (c) setCalcCrop(c);
                        }}
                        className="w-full p-2 bg-white border border-ksborder rounded-lg font-bold text-slate-900 text-xs">
                        {MSP_RATES.map((m, idx) => (
                          <option key={idx} value={m.crop}>{m.crop} — ₹{m.msp} / Qtl</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t.enterQuintal}</label>
                      <input 
                        type="number"
                        min="1"
                        max="2000"
                        value={calcQuantity}
                        onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full p-2 bg-white border border-ksborder rounded-lg font-black text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-ksbrand-dark text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                    <div>
                      <span className="text-xs text-emerald-200 font-bold">{t.estPayout}</span>
                      <div className="text-2xl font-black text-yellow-300">
                        ₹{(calcQuantity * calcCrop.msp).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenBooking()}
                      className="bg-white text-ksbrand-dark hover:bg-emerald-50 px-4 py-2 rounded-lg text-xs font-bold shadow-xs">
                      {t.bookSlotArrow}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-ksborder rounded-xl overflow-hidden shadow-xs">
                  <div className="px-4 py-3 border-b border-ksborder/60">
                    <h3 className="text-sm font-bold text-slate-900">{t.mspTableTitle}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-ksbg border-b border-ksborder/60 font-bold text-slate-700">
                          <th className="p-3">{t.cropHeader}</th>
                          <th className="p-3">{t.seasonHeader}</th>
                          <th className="p-3">{t.mspHeader}</th>
                          <th className="p-3">{t.changeHeader}</th>
                          <th className="p-3">{t.statusHeader}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MSP_RATES.map((item, idx) => (
                          <tr key={idx} className="hover:bg-ksbg/40">
                            <td className="p-3 font-black text-slate-900">{item.crop}</td>
                            <td className="p-3 text-slate-600 font-medium">{item.season}</td>
                            <td className="p-3 font-black text-ksbrand text-sm">₹{item.msp} / {item.unit}</td>
                            <td className="p-3 font-bold text-ksaccent">{item.change}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: HELP & FAQ */}
            {activeTab === 'help' && (
              <div className="space-y-4">
                
                <div className="bg-white border border-ksborder p-4 rounded-xl space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900">{t.tollFreeTitle}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-ksbg border border-ksborder/60 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t.kisanHelpline}</span>
                      <a href="tel:18001801551" className="text-base font-black text-ksbrand block mt-1">1800-180-1551</a>
                    </div>

                    <div className="p-3.5 bg-ksbg border border-ksborder/60 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t.kisanCallCenter}</span>
                      <a href="tel:1551" className="text-base font-black text-ksaccent block mt-1">1551</a>
                    </div>

                    <div className="p-3.5 bg-ksbg border border-ksborder/60 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t.whatsappSupport}</span>
                      <a href="https://wa.me/919416000000" target="_blank" rel="noopener noreferrer" className="text-base font-black text-slate-800 block mt-1">+91 94160 00000</a>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-ksborder p-4 rounded-xl space-y-3 text-xs shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900">{t.faqTitle}</h3>
                  
                  <div className="p-3 bg-ksbg border-l-4 border-ksbrand rounded-r-lg space-y-0.5">
                    <h4 className="font-bold text-slate-900">{t.faq1Q}</h4>
                    <p className="text-slate-600">{t.faq1A}</p>
                  </div>

                  <div className="p-3 bg-ksbg border-l-4 border-ksbrand rounded-r-lg space-y-0.5">
                    <h4 className="font-bold text-slate-900">{t.faq2Q}</h4>
                    <p className="text-slate-600">{t.faq2A}</p>
                  </div>

                  <div className="p-3 bg-ksbg border-l-4 border-ksbrand rounded-r-lg space-y-0.5">
                    <h4 className="font-bold text-slate-900">{t.faq3Q}</h4>
                    <p className="text-slate-600">{t.faq3A}</p>
                  </div>
                </div>

              </div>
            )}

          </main>

          {}
          {showDocsModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-ksborder w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Icon name="file-text" className="w-4 h-4 text-purple-200" />
                    <span>{t.requiredDocsHeader}</span>
                  </div>
                  <button onClick={() => setShowDocsModal(false)} className="text-white font-bold text-sm px-2">✕</button>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-black flex items-center justify-center text-xs">1</span>
                    <div>
                      <div className="font-bold text-slate-900">{t.doc1}</div>
                      <div className="text-[11px] text-slate-500">{t.doc1Sub}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-black flex items-center justify-center text-xs">2</span>
                    <div>
                      <div className="font-bold text-slate-900">{t.doc2}</div>
                      <div className="text-[11px] text-slate-500">{t.doc2Sub}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-black flex items-center justify-center text-xs">3</span>
                    <div>
                      <div className="font-bold text-slate-900">{t.doc3}</div>
                      <div className="text-[11px] text-slate-500">{t.doc3Sub}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-black flex items-center justify-center text-xs">4</span>
                    <div>
                      <div className="font-bold text-slate-900">{t.doc4}</div>
                      <div className="text-[11px] text-slate-500">{t.doc4Sub}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowDocsModal(false)}
                    className="w-full bg-purple-900 text-white py-2.5 rounded-lg font-bold text-xs mt-2">
                    {t.understoodBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {bookingModalOpen && selectedCentreForBooking && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
              <div className="bg-white border border-ksborder w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                
                <div className="bg-ksbrand-dark text-white px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                      {t.stepLabel} {bookingStep} {t.ofLabel} 2
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold mt-0.5 truncate">{selectedCentreForBooking.name}</h3>
                  </div>
                  <button onClick={() => setBookingModalOpen(false)} className="text-white font-bold text-base px-1">✕</button>
                </div>

                <form onSubmit={handleConfirmBooking} className="p-4 space-y-3 text-xs">
                  
                  {bookingStep === 1 ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">{t.farmerName} *</label>
                        <input 
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder={t.namePlaceholder}
                          className="w-full p-2.5 bg-ksbg border border-ksborder rounded-lg text-slate-900 text-xs font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">{t.mobileNo} *</label>
                          <input 
                            type="tel"
                            required
                            maxLength="10"
                            value={formMobile}
                            onChange={(e) => setFormMobile(e.target.value)}
                            placeholder={t.mobilePlaceholder}
                            className="w-full p-2.5 bg-ksbg border border-ksborder rounded-lg text-slate-900 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">{t.aadhaarLast4} *</label>
                          <input 
                            type="text"
                            required
                            maxLength="4"
                            value={formAadhaar}
                            onChange={(e) => setFormAadhaar(e.target.value)}
                            placeholder={t.aadhaarPlaceholder}
                            className="w-full p-2.5 bg-ksbg border border-ksborder rounded-lg text-slate-900 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">{t.cropType} *</label>
                        <select
                          value={formCrop}
                          onChange={(e) => setFormCrop(e.target.value)}
                          className="w-full p-2.5 bg-ksbg border border-ksborder rounded-lg text-slate-900 font-bold text-xs">
                          {selectedCentreForBooking.crops.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">{t.qtlLabel} *</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          max="500"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          className="w-full p-2.5 bg-ksbg border border-ksborder rounded-lg font-black text-slate-900 text-sm"
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="w-full bg-ksbrand hover:bg-ksbrand-hover text-white py-2.5 rounded-lg font-bold transition shadow-xs mt-1">
                        {t.selectSlot} →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">{t.dateLabel} *</label>
                        <select 
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full p-2.5 bg-ksbg border border-ksborder rounded-lg font-bold text-slate-900 text-xs">
                          <option value="2026-08-27">{t.tomorrow} (27 Aug 2026)</option>
                          <option value="2026-08-28">{t.dayAfter} (28 Aug 2026)</option>
                          <option value="2026-08-29">{t.saturday} (29 Aug 2026)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">{t.slotLabel} *</label>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {['07:00 AM - 09:00 AM', '09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM'].map((slotStr) => (
                            <button 
                              key={slotStr}
                              type="button"
                              onClick={() => setFormSlot(slotStr)}
                              className={`p-2.5 rounded-lg border text-left font-bold ${formSlot === slotStr ? 'bg-ksbrand text-white border-ksbrand' : 'bg-ksbg border-ksborder text-slate-800'}`}>
                              {slotStr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-ksbrand-light rounded-lg border border-ksbrand/30 text-xs flex justify-between font-bold">
                        <span>{t.estPayout}:</span>
                        <span className="text-ksbrand text-sm">₹{(parseInt(formQuantity || 0) * 2300).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button 
                          type="button"
                          onClick={() => setBookingStep(1)}
                          className="w-1/3 bg-ksbg border border-ksborder text-slate-700 py-2.5 rounded-lg font-bold">
                          {t.back}
                        </button>

                        <button 
                          type="submit"
                          className="w-2/3 bg-ksbrand hover:bg-ksbrand-hover text-white py-2.5 rounded-lg font-bold transition shadow-xs">
                          {t.confirmBooking}
                        </button>
                      </div>
                    </div>
                  )}

                </form>

              </div>
            </div>
          )}

          {}
          <footer className="bg-slate-900 text-slate-400 py-4 px-4 text-xs mt-auto border-t border-slate-800">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div>
                <p className="font-bold text-white">{t.portalName} • {t.footerGovt}</p>
                <p className="text-[11px] text-slate-400">{t.footerTagline}</p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <a href="tel:18001801551" className="hover:text-white transition font-bold text-yellow-300">{t.helpline}</a>
              </div>
            </div>
          </footer>

        </div>
      );
    }

export default App;

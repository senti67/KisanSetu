import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are "Kisan Mitra", the friendly farmer assistant of the KisanSetu portal (Mandi Gate Pass & MSP portal, Dept. of Agriculture, Govt. of India).

Help farmers with:
- Booking a mandi gate pass (choose mandi, date, time slot, quantity in quintals)
- MSP rates 2025-26 and payment calculation (payment reaches the DBT bank account in 48-72 hours after weighing)
- Moisture limit: grain must be below 17% moisture, otherwise the price is cut. Advise drying 2-3 hours in the sun on mandi drying yards.
- Documents needed at gate entry: original Aadhaar card, bank passbook (DBT), land record/Khasra, and the gate pass token.
- Helpline: 1800-180-1551 (Kisan toll-free).

Rules:
- Reply strictly in the language requested by the user or detected from query (Hindi, Punjabi, Marathi, or English).
- Use very simple words, short sentences, and small numbered steps.
- Keep answers under 120 words unless details are requested.
- Never invent government rules. If unsure, advise calling 1800-180-1551.`;

type ChatRequestBody = { messages?: unknown; lang?: string };

function extractLastUserQuery(messages: unknown): string {
  if (!Array.isArray(messages) || messages.length === 0) return "";
  const last = messages[messages.length - 1];
  if (typeof last === "string") return last;
  if (last && typeof last === "object") {
    if ("content" in last && typeof last.content === "string") return last.content;
    if ("text" in last && typeof (last as any).text === "string") return (last as any).text;
    if ("parts" in last && Array.isArray(last.parts)) {
      return last.parts
        .map((p: any) => (p?.type === "text" ? p.text : ""))
        .join(" ")
        .trim();
    }
  }
  return "";
}

function detectLanguage(query: string, preferredLang?: string): "en" | "or" | "mr" | "hi" | "pa" {
  if (preferredLang === "en" || preferredLang === "or" || preferredLang === "mr" || preferredLang === "hi" || preferredLang === "pa") {
    // If explicitly provided via header or body
    return preferredLang;
  }

  // Check for Odia script
  if (/[\u0B00-\u0B7F]/.test(query)) {
    return "or";
  }

  // Check for Gurmukhi script (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(query)) {
    return "pa";
  }

  // Check for English characters (pure Latin text)
  if (/^[a-zA-Z0-9\s?,.!':;@#$%&*()_\-+=\[\]{}|\/<>"~`₹]+$/.test(query)) {
    return "en";
  }

  // Check for common English agricultural keywords
  const lower = query.toLowerCase();
  if (
    lower.includes("how to") ||
    lower.includes("what is") ||
    lower.includes("today") ||
    lower.includes("which") ||
    lower.includes("when will") ||
    lower.includes("document") ||
    lower.includes("moisture") ||
    lower.includes("price") ||
    lower.includes("rate") ||
    lower.includes("book") ||
    lower.includes("pass")
  ) {
    return "en";
  }

  // Check Marathi specific keywords
  if (
    lower.includes("कसा") ||
    lower.includes("कधी") ||
    lower.includes("कागद") ||
    lower.includes("हमीभाव") ||
    lower.includes("शेतकरी") ||
    lower.includes("ओलावा")
  ) {
    return "mr";
  }

  return "hi";
}

function generateLocalKisanResponse(userQuery: string, language: "en" | "or" | "mr" | "hi" | "pa"): string {
  const q = userQuery.toLowerCase().trim();

  // 1. GATE PASS BOOKING
  if (
    q.includes("पास") ||
    q.includes("बुक") ||
    q.includes("slot") ||
    q.includes("pass") ||
    q.includes("book") ||
    q.includes("ਟੋਕਨ") ||
    q.includes("ਪਾਸ") ||
    q.includes("ଟୋକନ") ||
    q.includes("ପାସ") ||
    q.includes("ଟୋକନ୍") ||
    q.includes("ପାସ୍") ||
    q.includes("ବୁକ") ||
    q.includes("टोकन") ||
    q.includes("gate")
  ) {
    if (language === "en") {
      return `🌾 **How to Book a Mandi Gate Pass:**

1. Click on the **"Book Gate Pass"** button on the portal or any Mandi card.
2. Enter your **Farmer Name**, **10-digit Mobile Number**, and **Last 4 Digits of Aadhaar**.
3. Select your **Crop** and enter the **Quantity (Quintals)**.
4. Choose your preferred **Date and Time Slot**, then click **"Issue Pass"**.
5. Your digital token (e.g. **KS-8942**) and barcode will be generated immediately for fast, queue-free gate entry!`;
    }

    if (language === "or") {
      return `🌾 **ମଣ୍ଡି ଗେଟ୍ ପାସ୍ ବୁକ୍ କରିବାର ସହଜ ଉପାୟ:**

1. ପୋର୍ଟାଲରେ **"ଗେଟ୍ ପାସ୍ ବୁକ୍ କରନ୍ତୁ / Book Gate Pass"** ବଟନ୍ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ।
2. ଆପଣଙ୍କ **ଚାଷୀଙ୍କ ନାମ**, **୧୦ ଅଙ୍କର ମୋବାଇଲ୍ ନମ୍ବର** ଏବଂ **ଆଧାରର ଶେଷ ୪ ଅଙ୍କ** ଲେଖନ୍ତୁ।
3. ଆପଣଙ୍କ **ଫସଲ** ଏବଂ **ପରିମାଣ (କ୍ୱିଣ୍ଟାଲରେ)** ବାଛନ୍ତୁ।
4. ଆପଣଙ୍କ ପସନ୍ଦର **ତାରିଖ ଏବଂ ସମୟ ସ୍ଲଟ୍** ବାଛି **"ପାସ୍ ତିଆରି କରନ୍ତୁ"** କ୍ଲିକ୍ କରନ୍ତୁ।
5. ଆପଣଙ୍କ ଡିଜିଟାଲ୍ ଟୋକନ୍ (ଯେପରି KS-8942) ଏବଂ ବାରକୋଡ୍ ତୁରନ୍ତ ସ୍କ୍ରିନରେ ଆସିଯିବ। ମଣ୍ଡି ଗେଟ୍ ୨ ରେ ଏହା ଦେଖାଇ ବିନା ଧାଡ଼ିରେ ସିଧା ପ୍ରବେଶ କରନ୍ତୁ!`;
    }

    if (language === "pa") {
      return `🌾 **ਮੰਡੀ ਗੇਟ ਪਰਚੀ ਬੁੱਕ ਕਰਨ ਦਾ ਆਸਾਨ ਤਰੀਕਾ:**

1. ਪੋਰਟਲ 'ਤੇ **"ਗੇਟ ਪਰਚੀ ਬਣਾਓ / Book Gate Pass"** ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।
2. ਆਪਣਾ **ਕਿਸਾਨ ਨਾਮ**, **10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ** ਅਤੇ **ਅਧਾਰ ਕਾਰਡ ਦੇ ਆਖਰੀ 4 ਅੰਕ** ਦਰਜ ਕਰੋ।
3. ਆਪਣੀ **ਫ਼ਸਲ** ਅਤੇ **ਮਾਤਰਾ (ਕੁਇੰਟਲ ਵਿੱਚ)** ਚੁਣੋ।
4. ਆਪਣੀ ਪਸੰਦ ਦੀ **ਤਾਰੀਖ਼ ਅਤੇ ਸਮਾਂ ਸਲਾਟ** ਚੁਣ ਕੇ **"ਪਰਚੀ ਬਣਾਓ"** 'ਤੇ ਕਲਿੱਕ ਕਰੋ।
5. ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਟੋਕਨ (ਜਿਵੇਂ KS-8942) ਤੁਰੰਤ ਸਕ੍ਰੀਨ 'ਤੇ ਆ ਜਾਵੇਗਾ। ਇਸਨੂੰ ਦਿਖਾ ਕੇ ਗੇਟ 'ਤੇ ਬਿਨਾਂ ਲਾਈਨ ਸਿੱਧਾ ਦਾਖਲਾ ਮਿਲੇਗਾ!`;
    }

    if (language === "mr") {
      return `🌾 **मंडी गेट पास बुक करण्याची सोपी पद्धत:**

1. पोर्टलवर **"गेट पास बुक करा"** या बटणावर क्लिक करा.
2. आपले **शेतकऱ्याचे नाव**, **१० अंकी मोबाईल नंबर** आणि **आधार कार्डचे शेवटचे ४ अंक** टाका.
3. आपले **पीक** आणि **प्रमाण (क्विंटलमध्ये)** निवडा.
4. आपल्या सोयीनुसार **तारीख आणि वेळ स्लॉट** निवडून **"पास तयार करा"** वर क्लिक करा.
5. आपला डिजिटल टोकन क्रमांक (उदा. KS-8942) लगेच जारी होईल आणि गेटवर जलद प्रवेश मिळेल!`;
    }

    return `🌾 **गेट पास (Gate Pass) बुक करने का आसान तरीका:**

1. पोर्टल पर **"Book Gate Pass / गेट पास बुक करें"** बटन पर क्लिक करें।
2. अपना **किसान नाम**, **10 अंकों का मोबाइल नंबर** और **आधार के अंतिम 4 अंक** दर्ज करें।
3. अपनी **फसल** और **मात्रा (क्विंटल में)** चुनें।
4. अपनी पसंद की **तारीख और टाइम स्लॉट** चुनकर **"Issue Pass"** पर क्लिक करें।
5. आपका डिजिटल टोकन (जैसे KS-8942) तुरंत स्क्रीन पर आ जाएगा। इसे गेट पर दिखाकर बिना लाइन सीधी एंट्री पाएं!`;
  }

  // 2. MSP RATES
  if (
    q.includes("msp") ||
    q.includes("भाव") ||
    q.includes("rate") ||
    q.includes("दाम") ||
    q.includes("रेट") ||
    q.includes("रुपये") ||
    q.includes("price") ||
    q.includes("ਮੁੱਲ") ||
    q.includes("दर") ||
    q.includes("धान") ||
    q.includes("गेहूं") ||
    q.includes("paddy") ||
    q.includes("wheat")
  ) {
    if (language === "en") {
      return `💰 **Official Government MSP Rates (2025-26):**

• **Paddy (Grade A):** ₹2,300 / Quintal (+₹117 increase)
• **Paddy (Common):** ₹2,300 / Quintal
• **Wheat (Gehu):** ₹2,425 / Quintal (+₹150 increase)
• **Mustard (Sarson):** ₹5,950 / Quintal (+₹300)
• **Chana (Gram):** ₹5,650 / Quintal (+₹210)
• **Cotton (Long Staple):** ₹7,521 / Quintal (+₹501)

👉 *Payment is credited directly to your DBT bank account within 48 to 72 hours after weighing.*`;
    }

    if (language === "or") {
      return `💰 **ସରକାରୀ ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP ଦର ୨୦୨୫-୨୬):**

• **ଧାନ ଗ୍ରେଡ୍-ଏ (Paddy Grade A):** ₹୨,୩୦୦ / କ୍ୱିଣ୍ଟାଲ (+₹୧୧୭ ବୃଦ୍ଧି)
• **ଧାନ ସାଧାରଣ (Paddy Common):** ₹୨,୩୦୦ / କ୍ୱିଣ୍ଟାଲ
• **ଗହମ (Wheat / Gehu):** ₹୨,୪୨୫ / କ୍ୱିଣ୍ଟାଲ (+₹୧୫୦ ବୃଦ୍ଧି)
• **ସୋରିଷ (Mustard / Sarson):** ₹୫,୯୫୦ / କ୍ୱିଣ୍ଟାଲ (+₹୩୦୦)
• **ବୁଟ / ଚଣା (Gram):** ₹୫,୬୫୦ / କ୍ୱିଣ୍ଟାଲ (+₹୨୧୦)
• **କପା (Cotton Long Staple):** ₹୭,୫୨୧ / କ୍ୱିଣ୍ଟାଲ (+₹୫୦୧)

👉 *ଓଜନ ହେବାର ୪୮ ରୁ ୭୨ ଘଣ୍ଟା ମଧ୍ୟରେ ସିଧାସଳଖ ଆପଣଙ୍କ DBT ବ୍ୟାଙ୍କ ଖାତାକୁ ଟଙ୍କା ଜମା ହେବ।*`;
    }

    if (language === "pa") {
      return `💰 **ਸਰਕਾਰੀ ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP ਰੇਟ 2025-26):**

• **ਝੋਨਾ ਗ੍ਰੇਡ-ਏ (Paddy Grade A):** ₹2,300 / ਕੁਇੰਟਲ (+₹117 ਵਾਧਾ)
• **ਝੋਨਾ ਆਮ (Paddy Common):** ₹2,300 / ਕੁਇੰਟਲ
• **ਕਣਕ (Wheat / Gehu):** ₹2,425 / ਕੁਇੰਟਲ (+₹150 ਵਾਧਾ)
• **ਸਰ੍ਹੋਂ (Mustard / Sarson):** ₹5,950 / ਕੁਇੰਟਲ (+₹300)
• **ਛੋਲੇ (Chana / Gram):** ₹5,650 / ਕੁਇੰਟਲ (+₹210)
• **ਕਪਾਹ (Cotton Long Staple):** ₹7,521 / ਕੁਇੰਟਲ (+₹501)

👉 *ਤੋਲ ਤੋਂ ਬਾਅਦ 48 ਤੋਂ 72 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਪੈਸਾ ਸਿੱਧਾ ਤੁਹਾਡੇ DBT ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਆ ਜਾਵੇਗਾ।*`;
    }

    if (language === "mr") {
      return `💰 **शासकीय हमीभाव दर (MSP Rates 2025-26):**

• **धान ग्रेड-ए (Paddy Grade A):** ₹२,३०० / क्विंटल (+₹११७ वाढ)
• **धान सर्वसाधारण (Paddy Common):** ₹२,३०० / क्विंटल
• **गहू (Wheat / Gehu):** ₹२,४२५ / क्विंटल (+₹१५० वाढ)
• **मोहरी / सरसो (Mustard):** ₹५,९५० / क्विंटल (+₹३००)
• **हरभरा / चना (Gram):** ₹५,६५० / क्विंटल (+₹२१०)
• **कापूस (Cotton Long Staple):** ₹७,५२१ / क्विंटल (+₹५०१)

👉 *मोजमाप झाल्यानंतर ४८ ते ७२ तासांच्या आत रक्कम थेट DBT बँक खात्यात जमा होते.*`;
    }

    return `💰 **सरकारी न्यूनतम समर्थन मूल्य (MSP Rates 2025-26):**

• **धान ग्रेड-ए (Paddy Grade A):** ₹2,300 / क्विंटल (+₹117 बढ़ोतरी)
• **धान सामान्य (Paddy Common):** ₹2,300 / क्विंटल
• **गेहूं (Wheat / Gehu):** ₹2,425 / क्विंटल (+₹150 बढ़ोतरी)
• **सरसों (Mustard / Sarson):** ₹5,950 / क्विंटल (+₹300)
• **चना (Chana / Gram):** ₹5,650 / क्विंटल (+₹210)
• **कपास (Cotton Long Staple):** ₹7,521 / क्विंटल (+₹501)

👉 *फसल तुलाई के 48 से 72 घंटे में पैसा सीधे आपके DBT बैंक खाते में ट्रांसफर होगा।*`;
  }

  // 3. MOISTURE LIMIT
  if (
    q.includes("नमी") ||
    q.includes("moisture") ||
    q.includes("17") ||
    q.includes("कटौती") ||
    q.includes("ਸੁਕਾ") ||
    q.includes("ଆର୍ଦ୍ରତା") ||
    q.includes("ଶୁଖା") ||
    q.includes("सुखा") ||
    q.includes("ओलावा")
  ) {
    if (language === "en") {
      return `💧 **Grain Moisture Limits & Guidelines:**

• The maximum permitted moisture for procurement is **17%**.
• **14% to 17%:** 100% full MSP payout (0% deduction).
• **17% to 19%:** Moisture cut of ~1.5% may apply.
• **Above 19%:** Entry rejected at mandi gate.

☀️ **Tip:** Dry your grain in the sun for **2 to 3 hours** on the mandi drying yards to ensure maximum price without cuts.`;
    }

    if (language === "or") {
      return `💧 **ଆର୍ଦ୍ରତା (Moisture) ସମ୍ପର୍କିତ ନିୟମ ଓ ପରାମର୍ଶ:**

• ସରକାରୀ କ୍ରୟ ପାଇଁ ଶସ୍ୟରେ **ସର୍ବାଧିକ ଆର୍ଦ୍ରତା ୧୭%** ରହିବା ଆବଶ୍ୟକ।
• **୧୪% ରୁ ୧୭% ପର୍ଯ୍ୟନ୍ତ:** ୧୦୦% ପୂରା MSP ମୂଲ୍ୟ ମିଳିବ (୦% କଟା)।
• **୧୭% ରୁ ୧୯%:** ଆର୍ଦ୍ରତା ଅନୁଯାୟୀ ପ୍ରାୟ ୧.୫% ମୂଲ୍ୟ କଟାଯାଇପାରେ।
• **୧୯% ରୁ ଅଧିକ:** ମଣ୍ଡି ଗେଟରେ ପ୍ରବେଶ ବାରଣ।

☀️ **ପରାମର୍ଶ:** ମଣ୍ଡି ଆଣିବା ପୂର୍ବରୁ କିମ୍ବା ମଣ୍ଡି ଶୁଖାଇବା ୟାର୍ଡରେ ଫସଲକୁ **୨ ରୁ ୩ ଘଣ୍ଟା ଖରାରେ ଶୁଖାନ୍ତୁ** ଯାହାଦ୍ୱାରା ପୂରା ଦର ମିଳିପାରିବ।`;
    }

    if (language === "pa") {
      return `💧 **ਨਮੀ (Moisture) ਦੇ ਨਿਯਮ ਅਤੇ ਸੁਝਾਅ:**

• ਸਰਕਾਰੀ ਖਰੀਦ ਲਈ ਅਨਾਜ ਵਿੱਚ **ਵੱਧ ਤੋਂ ਵੱਧ ਨਮੀ 17%** ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।
• **14% ਤੋਂ 17% ਤੱਕ:** 100% ਪੂਰਾ MSP ਮੁੱਲ ਮਿਲੇਗਾ (0% ਕਟੌਤੀ)।
• **17% ਤੋਂ 19%:** ਨਮੀ ਅਨੁਸਾਰ ਲਗਭਗ 1.5% ਕਟੌਤੀ ਹੋ ਸਕਦੀ ਹੈ।
• **19% ਤੋਂ ਵੱਧ:** ਮੰਡੀ ਵਿੱਚ ਦਾਖਲਾ ਨਹੀਂ ਮਿਲੇਗਾ।

☀️ **ਸੁਝਾਅ:** ਮੰਡੀ ਲਿਆਉਣ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂ ਮੰਡੀ ਦੇ ਸੁਕਾਉਣ ਵਾਲੇ ਯਾਰਡ ਵਿੱਚ ਫ਼ਸਲ ਨੂੰ **2-3 ਘੰਟੇ ਧੁੱਪ ਵਿੱਚ ਸੁਕਾਓ** ਤਾਂ ਜੋ ਪੂਰਾ ਮੁੱਲ ਮਿਲੇ।`;
    }

    if (language === "mr") {
      return `💧 **ओलावा (Moisture) मर्यादा व नियम:**

• शासकीय खरेदीसाठी धान्यामध्ये **कमाल ओलावा १७%** असावा.
• **१४% ते १७% पर्यंत:** १००% पूर्ण हमीभाव मिळेल (०% कपात).
• **१७% ते १९%:** ओलाव्यानुसार सुमारे १.५% कपात होऊ शकते.
• **१९% पेक्षा जास्त:** मंडी प्रवेश नाकारला जाईल.

☀️ **सल्ला:** पूर्ण दर मिळवण्यासाठी धान्य आणण्यापूर्वी **२ ते ३ तास उन्हात वाळवा**.`;
    }

    return `💧 **नमी (Moisture) नियम एवं सुझाव:**

• सरकारी खरीद के लिए अनाज में **अधिकतम नमी 17%** होनी चाहिए।
• **14% - 17% तक:** 100% पूरा MSP भाव मिलेगा (0% कटौती)।
• **17% - 19%:** नमी के अनुसार लगभग 1.5% मूल्य कटौती हो सकती है।
• **19% से अधिक:** मंडी में प्रवेश की अनुमति नहीं होगी।

☀️ **सुझाव:** मंडी लाने से पहले या मंडी के सुखाने वाले यार्ड (Drying Yard) पर फसल को **2-3 घंटे धूप में सुखाएं** ताकि पूरे दाम मिलें।`;
  }

  // 4. REQUIRED DOCUMENTS
  if (
    q.includes("कागज") ||
    q.includes("दस्तावेज") ||
    q.includes("doc") ||
    q.includes("paper") ||
    q.includes("आधार") ||
    q.includes("कागजात") ||
    q.includes("ਕਾਗਜ਼") ||
    q.includes("କାଗଜ") ||
    q.includes("ପଟ୍ଟା") ||
    q.includes("कागद") ||
    q.includes("aadhaar")
  ) {
    if (language === "en") {
      return `📋 **4 Documents Required at Mandi Gate Entry:**

1. **Original Aadhaar Card:** For identity verification.
2. **Bank Passbook:** For Direct Bank Transfer (DBT) payment credit.
3. **Land Record / Khasra Document:** Land ownership / Meri Fasal Mera Byora verification.
4. **Digital Gate Pass Token:** Generated from the KisanSetu portal.`;
    }

    if (language === "or") {
      return `📋 **ମଣ୍ଡି ଗେଟ୍ ପ୍ରବେଶ ପାଇଁ ୪ଟି ଆବଶ୍ୟକୀୟ ଦଲିଲ:**

1. **ମୂଳ ଆଧାର କାର୍ଡ (Original Aadhaar Card):** ପରିଚୟ ପ୍ରମାଣ ପାଇଁ।
2. **ବ୍ୟାଙ୍କ ପାସବୁକ୍ (DBT Bank Passbook):** ସିଧାସଳଖ ଖାତାକୁ ଟଙ୍କା ଜମା ପାଇଁ।
3. **ଜମି ପଟ୍ଟା / ଖତିୟାନ (Land Record):** ଜମି ମାଲିକାନା ପ୍ରମାଣ ପାଇଁ।
4. **ଡିଜିଟାଲ୍ ଗେଟ୍ ପାସ୍ ଟୋକନ୍ (Gate Pass Token):** କିଷାନସେତୁ ପୋର୍ଟାଲରୁ ମିଳିଥିବା ପାସ୍।`;
    }

    if (language === "pa") {
      return `📋 **ਮੰਡੀ ਗੇਟ 'ਤੇ ਲੋੜੀਂਦੇ 4 ਜ਼ਰੂਰੀ ਕਾਗਜ਼ਾਤ:**

1. **ਅਸਲ ਅਧਾਰ ਕਾਰਡ (Original Aadhaar Card):** ਪਛਾਣ ਤਸਦੀਕ ਲਈ।
2. **ਬੈਂਕ ਪਾਸਬੁੱਕ (DBT Bank Passbook):** ਖਾਤੇ ਵਿੱਚ ਸਿੱਧੇ ਭੁਗਤਾਨ ਲਈ।
3. **ਜ਼ਮੀਨ ਦੀ ਫ਼ਰਦ / ਜਮ੍ਹਾਂਬੰਦੀ (Land Record):** ਜ਼ਮੀਨ ਦੀ ਪੁਸ਼ਟੀ ਲਈ।
4. **ਡਿਜੀਟਲ ਗੇਟ ਪਰਚੀ ਟੋਕਨ (Gate Pass Token):** ਕਿਸਾਨਸੇਤੂ ਪੋਰਟਲ ਤੋਂ ਜਾਰੀ ਪਰਚੀ।`;
    }

    if (language === "mr") {
      return `📋 **गेटवर आवश्यक ४ महत्त्वाची कागदपत्रे:**

1. **मूळ आधार कार्ड (Original Aadhaar Card):** ओळख पडताळणीसाठी.
2. **बँक पासबुक (DBT Bank Passbook):** थेट बँक खात्यात पैसे जमा होण्यासाठी.
3. **सातबारा उतारा / जमीन नोंद (Land Record):** जमिनीच्या नोंदीसाठी.
4. **डिजिटल गेट पास टोकन (Gate Pass Token):** किसानसेतू पोर्टलवरून मिळालेला पास.`;
    }

    return `📋 **मंडी गेट एंट्री के लिए जरूरी 4 दस्तावेज:**

1. **मूल आधार कार्ड (Original Aadhaar Card):** पहचान सत्यापन हेतु।
2. **बैंक पासबुक (DBT Bank Passbook):** सीधे बैंक खाते में भुगतान के लिए।
3. **खसरा / जमाबंदी नकल (Land Record):** मेरी फसल मेरा ब्योरा / जमीन रिकॉर्ड।
4. **डिजिटल गेट पास टोकन (Gate Pass Token):** किसानसेतु पोर्टल से प्राप्त टोकन।`;
  }

  // 5. PAYMENT TIMING / DBT
  if (
    q.includes("पैसा") ||
    q.includes("भुगतान") ||
    q.includes("पेमेंट") ||
    q.includes("payment") ||
    q.includes("खाता") ||
    q.includes("dbt") ||
    q.includes("पैसे") ||
    q.includes("ଟଙ୍କା") ||
    q.includes("କ୍ରେଡିଟ") ||
    q.includes("କ୍ରେଡିଟ୍") ||
    q.includes("क्रेडिट") ||
    q.includes("money") ||
    q.includes("bank")
  ) {
    if (language === "en") {
      return `🏦 **Payment & Direct Bank Transfer (DBT) Timeline:**

• Full MSP payment is transferred directly into your **DBT-linked bank account** within **48 to 72 hours** after weighing at the mandi.
• For payment status inquiries, call the Kisan toll-free helpline **1800-180-1551**.`;
    }

    if (language === "or") {
      return `🏦 **ପ୍ରାପ୍ୟ ଓ DBT ସିଧାସଳଖ ଜମା ସମୟସୀମା:**

• ମଣ୍ଡିରେ ଓଜନ ଶେଷ ହେବାର **୪୮ ରୁ ୭୨ ଘଣ୍ଟା ମଧ୍ୟରେ** ସମ୍ପୂର୍ଣ୍ଣ MSP ରାଶି ଆପଣଙ୍କ **DBT ସଂଯୁକ୍ତ ବ୍ୟାଙ୍କ ଖାତାକୁ** ପଠାଯାଏ।
• ଅଧିକ ସହାୟତା ପାଇଁ ଟୋଲ୍-ଫ୍ରି ନମ୍ବର **1800-180-1551** ରେ କଲ୍ କରନ୍ତୁ।`;
    }

    if (language === "pa") {
      return `🏦 **ਭੁਗਤਾਨ (Payment) ਦੀ ਜਾਣਕਾਰੀ:**

• ਮੰਡੀ ਵਿੱਚ ਤੋਲ ਪੂਰਾ ਹੋਣ ਤੋਂ ਬਾਅਦ **48 ਤੋਂ 72 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ** ਸਰਕਾਰੀ MSP ਦੀ ਪੂਰੀ ਰਕਮ ਸਿੱਧੇ ਤੁਹਾਡੇ **DBT-ਲਿੰਕਡ ਬੈਂਕ ਖਾਤੇ** ਵਿੱਚ ਜਮ੍ਹਾ ਕਰ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।
• ਸਹਾਇਤਾ ਲਈ ਕਿਸਾਨ ਟੋਲ-ਫ੍ਰੀ **1800-180-1551** 'ਤੇ ਸੰਪਰਕ ਕਰੋ।`;
    }

    if (language === "mr") {
      return `🏦 **देयक (Payment) तपशील:**

• मोजमाप पूर्ण झाल्यानंतर **४८ ते ७२ तासांच्या आत** शासकीय हमीभाव रक्कम थेट आपल्या **DBT बँक खात्यात** जमा केली जाते.
• अधिक माहितीसाठी **1800-180-1551** वर संपर्क साधा.`;
    }

    return `🏦 **भुगतान (Payment) की जानकारी:**

• मंडी में वजन और तुलाई पूरी होने के बाद **48 से 72 घंटों के भीतर** सरकारी MSP की पूरी राशि सीधे आपके **DBT-लिंक्ड बैंक खाते** में जमा कर दी जाती है।
• किसी भी सहायता के लिए किसान टोल-फ्री **1800-180-1551** पर संपर्क करें।`;
  }

  // 6. HELPLINES & SUPPORT
  if (
    q.includes("हेल्प") ||
    q.includes("help") ||
    q.includes("नंबर") ||
    q.includes("फोन") ||
    q.includes("call") ||
    q.includes("ସହାୟତା") ||
    q.includes("ନମ୍ବର") ||
    q.includes("contact") ||
    q.includes("toll") ||
    q.includes("phone")
  ) {
    if (language === "en") {
      return `📞 **Government Farmer Toll-Free Helplines:**

• **Kisan Toll-Free Helpline:** 1800-180-1551
• **Kisan Call Center:** 1551
• **WhatsApp Support:** +91 94160 00000
• 24x7 assistance provided by the Dept. of Agriculture, Govt. of India.`;
    }

    if (language === "or") {
      return `📞 **ସରକାରୀ କୃଷକ ସହାୟତା ନମ୍ବର (Toll-Free):**

• **କିଷାନ ଟୋଲ୍-ଫ୍ରି ହେଲ୍ପଲାଇନ୍:** 1800-180-1551
• **କିଷାନ କଲ୍ ସେଣ୍ଟର୍:** 1551
• **ହ୍ୱାଟ୍ସଆପ୍ ସହାୟତା:** +91 94160 00000
• କୃଷି ମନ୍ତ୍ରଣାଳୟ, ଭାରତ ସରକାର ଦ୍ୱାରା ୨୪x୭ ଉପଲବ୍ଧ।`;
    }

    if (language === "pa") {
      return `📞 **ਸਰਕਾਰੀ ਕਿਸਾਨ ਸਹਾਇਤਾ ਨੰਬਰ (Toll-Free):**

• **ਕਿਸਾਨ ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ:** 1800-180-1551
• **ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ:** 1551
• **WhatsApp ਸਹਾਇਤਾ:** +91 94160 00000
• ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ, ਭਾਰਤ ਸਰਕਾਰ ਵੱਲੋਂ 24x7 ਸੇਵਾ।`;
    }

    if (language === "mr") {
      return `📞 **शासकीय शेतकरी मदत क्रमांक (Toll-Free):**

• **शेतकरी टोल-फ्री हेल्पलाइन:** 1800-180-1551
• **किसान कॉल सेंटर:** 1551
• **WhatsApp मदत:** +91 94160 00000
• कृषी मंत्रालय, भारत सरकारतर्फे २४x७ सेवा उपलब्ध.`;
    }

    return `📞 **सरकारी किसान सहायता नंबर (Toll-Free):**

• **किसान टोल-फ्री हेल्पलाइन:** 1800-180-1551
• **किसान कॉल सेंटर:** 1551
• **WhatsApp सहायता:** +91 94160 00000
• कृषि विभाग, भारत सरकार द्वारा 24x7 सेवा उपलब्ध है।`;
  }

  // 7. GENERAL GREETING / FALLBACK
  if (language === "en") {
    return `🙏 **Namaste! I am Kisan Mitra, your farming assistant.**

I can assist you with:
1. **Gate Pass Booking:** Reserve entry slots to skip long mandi queues.
2. **MSP Rates 2025-26:** Official government support prices for all crops.
3. **Moisture Guidelines:** 17% limit advice to avoid price cuts.
4. **Required Documents:** List of 4 mandatory gate entry documents.

Please ask your question or call toll-free **1800-180-1551**!`;
  }

  if (language === "or") {
    return `🙏 **ନମସ୍କାର ଚାଷୀ ଭାଇ! ମୁଁ କିଷାନ ମିତ୍ର (Kisan Mitra)।**

ମୁଁ ଆପଣଙ୍କୁ ନିମ୍ନ ବିଷୟରେ ସାହାଯ୍ୟ କରିପାରିବି:
1. **ଗେଟ୍ ପାସ୍ ବୁକିଂ:** ଧାଡ଼ି ନ ଲଗାଇ ମଣ୍ଡି ପ୍ରବେଶ ପାଇଁ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ।
2. **MSP ଦର ୨୦୨୫-୨୬:** ସମସ୍ତ ଫସଲର ସରକାରୀ ସହାୟକ ମୂଲ୍ୟ।
3. **ଆର୍ଦ୍ରତା (Moisture) ନିୟମ:** ୧୭% ସୀମା ଓ ଶୁଖାଇବା ପରାମର୍ଶ।
4. **ଆବଶ୍ୟକୀୟ କାଗଜପତ୍ର:** ଗେଟ୍ ପ୍ରବେଶ ପାଇଁ ୪ଟି ଜରୁରୀ ଦଲିଲ।

ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ କିମ୍ବା ଟୋଲ୍-ଫ୍ରି **1800-180-1551** କଲ୍ କରନ୍ତୁ!`;
  }

  if (language === "pa") {
    return `🙏 **ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਕਿਸਾਨ ਮਿੱਤਰ ਹਾਂ।**

ਮੈਂ ਤੁਹਾਡੀ ਹੇਠ ਲਿਖੇ ਵਿਸ਼ਿਆਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:
1. **ਗੇਟ ਪਰਚੀ ਬੁਕਿੰਗ:** ਮੰਡੀ ਵਿੱਚ ਬਿਨਾਂ ਲਾਈਨ ਦਾਖਲੇ ਲਈ ਸਲਾਟ ਬੁੱਕ ਕਰੋ।
2. **MSP ਰੇਟ 2025-26:** ਫ਼ਸਲਾਂ ਦੇ ਸਰਕਾਰੀ ਮੁੱਲ ਜਾਣੋ।
3. **ਨਮੀ ਦੀ ਸੀਮਾ:** 17% ਨਿਯਮ ਅਤੇ ਫ਼ਸਲ ਸੁਕਾਉਣ ਦੇ ਨੁਸਖੇ।
4. **ਜ਼ਰੂਰੀ ਕਾਗਜ਼ਾਤ:** ਮੰਡੀ ਗੇਟ 'ਤੇ ਲੋੜੀਂਦੇ 4 ਕਾਗਜ਼।

ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ ਜਾਂ ਟੋਲ-ਫ੍ਰੀ **1800-180-1551** 'ਤੇ ਕਾਲ ਕਰੋ!`;
  }

  if (language === "mr") {
    return `🙏 **नमस्ते शेतकरी मित्रांनो! मी किसान मित्र आहे.**

मी खालील विषयात आपली मदत करू शकतो:
1. **गेट पास बुकिंग:** रांगेत उभे न राहता मंडी प्रवेशासाठी स्लॉट बुक करा.
2. **हमीभाव दर (MSP):** २०२५-२६ चे अधिकृत शासकीय भाव.
3. **ओलावा मर्यादा:** १७% नियम व दर कपात टाळण्याचे उपाय.
4. **आवश्यक कागदपत्रे:** गेटवर लागणाऱ्या ४ कागदपत्रांची यादी.

कृपया आपला प्रश्न विचारा किंवा **1800-180-1551** वर कॉल करा!`;
  }

  return `🙏 **नमस्ते किसान भाई! मैं किसान मित्र (Kisan Mitra) हूँ।**

मैं आपकी इन विषयों में सहायता कर सकता हूँ:
1. **गेट पास बुकिंग:** बिना कतार मंडी में प्रवेश के लिए स्लॉट बुक करें।
2. **MSP भाव 2025-26:** फसलों के सरकारी समर्थन मूल्य जानें।
3. **नमी (Moisture) सीमा:** 17% नियम और फसल सुखाने के उपाय।
4. **जरूरी दस्तावेज:** गेट पर आवश्यक 4 कागजात की सूची।

कृपया अपना सवाल पूछें या टोल-फ्री **1800-180-1551** पर कॉल करें!`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body?.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const headerLang = request.headers.get("x-language");
        const bodyLang = body?.lang;
        const lastQuery = extractLastUserQuery(messages);
        const language = detectLanguage(lastQuery, headerLang || bodyLang);

        const key = process.env["LOVABLE_API_KEY"] || process.env["GEMINI_API_KEY"];

        // If cloud AI gateway key is available, use streaming AI model
        if (key) {
          try {
            const initialRunId = getLovableAiGatewayRunId(request);
            const gateway = createLovableAiGatewayProvider(key, initialRunId);

            const langInstruction =
              language === "en"
                ? "You must respond strictly in English."
                : language === "or"
                ? "You must respond strictly in Odia (ଓଡ଼ିଆ script)."
                : language === "pa"
                ? "You must respond strictly in Punjabi."
                : language === "mr"
                ? "You must respond strictly in Marathi."
                : "You must respond strictly in Hindi.";

            const result = streamText({
              model: gateway("google/gemini-3.7-flash"),
              system: `${SYSTEM_PROMPT}\n\nIMPORTANT LANGUAGE REQUIREMENT: ${langInstruction}`,
              messages: await convertToModelMessages(messages as UIMessage[]),
            });

            const response = result.toUIMessageStreamResponse({
              originalMessages: messages as UIMessage[],
              headers: getLovableAiGatewayResponseHeaders(undefined, {
                ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
              }),
            });

            return withLovableAiGatewayRunIdHeader(response, gateway);
          } catch (error) {
            console.warn("AI Gateway error, falling back to local agricultural knowledge engine:", error);
          }
        }

        // Resilient Fallback: Stream using Kisan Mitra Agricultural Knowledge Engine in the matched language
        const replyText = generateLocalKisanResponse(lastQuery, language);
        const partId = `part-${Date.now()}`;

        const stream = createUIMessageStream({
          execute: ({ writer }) => {
            writer.write({ type: "text-start", id: partId });
            writer.write({ type: "text-delta", id: partId, delta: replyText });
            writer.write({ type: "text-end", id: partId });
          },
        });

        return createUIMessageStreamResponse({ stream });
      },
    },
  },
});

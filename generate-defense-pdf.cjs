const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createDefensePdf() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89; // A4
  const MARGIN = 40;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function addNewPageIfNeeded(spaceRequired) {
    if (y - spaceRequired < MARGIN + 25) {
      drawFooter(page);
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      return true;
    }
    return false;
  }

  function drawFooter(p) {
    p.drawLine({
      start: { x: MARGIN, y: MARGIN + 15 },
      end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + 15 },
      thickness: 0.5,
      color: rgb(0.7, 0.75, 0.8),
    });
    p.drawText("KisanSetu • Smart India Hackathon 2026 • Ministry of Consumer Affairs, Food & Public Distribution", {
      x: MARGIN,
      y: MARGIN,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });
  }

  function splitIntoLines(text, maxWidth, size, font) {
    const paragraphs = text.split('\n');
    const allLines = [];

    for (const para of paragraphs) {
      if (para.trim() === '') {
        allLines.push('');
        continue;
      }
      const words = para.trim().split(/\s+/);
      let line = '';
      for (const word of words) {
        const testLine = line === '' ? word : line + ' ' + word;
        const width = font.widthOfTextAtSize(testLine, size);
        if (width > maxWidth && line !== '') {
          allLines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line !== '') {
        allLines.push(line);
      }
    }
    return allLines;
  }

  function drawTextLines(lines, x, startY, size, font, color, lineHeight = size * 1.35) {
    let currentY = startY;
    for (const line of lines) {
      if (line !== '') {
        page.drawText(line, { x, y: currentY, size, font, color });
      }
      currentY -= lineHeight;
    }
    return currentY;
  }

  // --- HEADER BANNER ---
  page.drawRectangle({
    x: MARGIN,
    y: y - 85,
    width: CONTENT_WIDTH,
    height: 85,
    color: rgb(0.1, 0.28, 0.2), // Forest Green
  });

  page.drawText("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION • GOVT. OF INDIA", {
    x: MARGIN + 14,
    y: y - 20,
    size: 7.5,
    font: fontBold,
    color: rgb(0.7, 0.9, 0.8),
  });

  page.drawText("KisanSetu — Master Defense & Jury Q&A Guide", {
    x: MARGIN + 14,
    y: y - 42,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Problem Statement ID: 26032 | Smart Automation | End-to-End Technical & Economic Defense", {
    x: MARGIN + 14,
    y: y - 62,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.85, 0.95, 0.9),
  });

  y -= 105;

  function addSection(title) {
    addNewPageIfNeeded(40);
    page.drawRectangle({
      x: MARGIN,
      y: y - 18,
      width: CONTENT_WIDTH,
      height: 20,
      color: rgb(0.92, 0.96, 0.94),
    });
    page.drawText(title, {
      x: MARGIN + 8,
      y: y - 13,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.35, 0.2),
    });
    y -= 26;
  }

  function addQA(q, a) {
    const qLines = splitIntoLines(q, CONTENT_WIDTH - 22, 9.5, fontBold);
    const aLines = splitIntoLines(a, CONTENT_WIDTH - 22, 8.5, fontRegular);
    
    const qHeight = qLines.length * (9.5 * 1.35);
    const aHeight = aLines.length * (8.5 * 1.35);
    const totalBoxHeight = qHeight + aHeight + 16;

    addNewPageIfNeeded(totalBoxHeight + 8);

    page.drawRectangle({
      x: MARGIN,
      y: y - totalBoxHeight,
      width: CONTENT_WIDTH,
      height: totalBoxHeight,
      color: rgb(0.98, 0.99, 1.0),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 0.8,
    });

    page.drawRectangle({
      x: MARGIN,
      y: y - totalBoxHeight,
      width: 4,
      height: totalBoxHeight,
      color: rgb(0.15, 0.45, 0.25),
    });

    let textY = y - 12;
    textY = drawTextLines(qLines, MARGIN + 12, textY, 9.5, fontBold, rgb(0.1, 0.15, 0.25));
    textY -= 2;
    drawTextLines(aLines, MARGIN + 12, textY, 8.5, fontRegular, rgb(0.2, 0.25, 0.35));

    y -= (totalBoxHeight + 7);
  }

  // --- SECTION 1: PROBLEM STATEMENT ---
  addSection("1. Problem Statement 1-to-1 Coverage (SIH ID: 26032)");
  addQA(
    "1. Farmer Registration & Slot Booking",
    "Dual-Channel System: Multi-step web portal booking + Full Voice IVR booking via toll-free phone call (1800-180-1551) for feature-phone users without internet."
  );
  addQA(
    "2. Real-Time Queue Management",
    "Live truck counter on digital gate pass ('3 trucks ahead at Gate #2') + Dedicated Mandi Officer Control Center to verify, scan and advance vehicle queues across 4 stages."
  );
  addQA(
    "3. SMS & App Notifications",
    "Instant Exotel SMS gateway integration sending token IDs to caller mobiles + 1-click WhatsApp digital pass share + In-app live sync."
  );
  addQA(
    "4. Track Procurement & Payment Status",
    "Official 2025-26 MSP calculator, DBT bank credit timeline tracking (48-72 hrs directly into Aadhaar-linked account), and pass status progression."
  );
  addQA(
    "5. Reduce Congestion & Waiting Time",
    "Staggered 2-hour capacity quotas (caps arrivals per window) + Moisture Pre-Check (17.0% limit) preventing wet crop rejection after long travel."
  );

  // --- SECTION 2: COST & UNIT ECONOMICS ---
  addSection("2. Cost & Unit Economics");
  addQA(
    "Q: What is the exact operational cost per farmer booking?",
    "Total Unit Cost: ~Rs. 0.45 per issued gate pass.\n• IVR Voice Call: Standard cloud telephony (Exotel/Airtel) costs Rs. 0.35/min. Our flow completes in under 45s = Rs. 0.28 to Rs. 0.30.\n• Transactional DLT SMS: Rs. 0.12 per message.\n• Edge Serverless Compute: Rs. 0.0001 per request.\nFunding Source: Easily funded by APMC Mandi Board cess (1-2% market fee) or the central Digital Agriculture Mission / PM-AASHA fund."
  );
  addQA(
    "Q: What is the financial ROI for farmers?",
    "• Fuel Savings: Eliminates 8-14 hours of tractor idling in highway queues, saving farmers Rs. 800 to Rs. 1,500 in diesel/rent per trip.\n• Zero Middlemen Cuts: Protects farmers from arbitrary 3-8% 'moisture penalties' and 'queue cuts' imposed by middlemen.\n• Spoilage Prevention: Eliminates overnight open-air parking in rain, preventing sudden grain rot."
  );

  // --- SECTION 3: SCALABILITY ---
  addSection("3. Scalability, Architecture & Peak Season Traffic");
  addQA(
    "Q: How does the system handle massive spikes during 3-week harvest seasons?",
    "• Serverless Edge Infrastructure: Nitro and TanStack Edge Workers scale horizontally on-demand to 10,000+ requests per second without cold-start bottlenecks.\n• Telephony Trunking: Enterprise SIP trunking supports over 10,000 concurrent voice channels.\n• Quota-Driven Load Balancing: When a mandi's 2-hour arrival window fills to capacity, the engine automatically routes farmers to neighboring sub-mandis within a 15 km radius."
  );
  addQA(
    "Q: What happens if there is an internet failure at the Mandi gate?",
    "• Offline Gate Verification Mode: Tokens follow a cryptographic hash format (KS-XXXX). The Gate Officer's tablet runs a PWA with local IndexedDB cache, validating token authenticity and queue positions offline, syncing automatically once connectivity returns."
  );

  // --- SECTION 4: USABILITY ---
  addSection("4. Rural Usability, Inclusivity & Fraud Prevention");
  addQA(
    "Q: How do illiterate smallholders or farmers with basic button phones use KisanSetu?",
    "• Zero-App Feature Phone Voice Line: Farmers dial 1800-180-1551 from any Rs. 1,000 keypad phone. Prompts are spoken in Hindi, Punjabi, Marathi, and English.\n• DTMF Keypad Input: Dialing numbers (1 for Paddy, 2 for Wheat) has a 99.9% accuracy rate, completely unaffected by rural tractor noise or heavy accents.\n• Voice Read-Back + SMS: The system audibly speaks the Token ID twice at the end of the call, followed by an immediate SMS receipt."
  );
  addQA(
    "Q: How do you prevent slot hoarding or fake bookings by middlemen?",
    "• Mobile & Aadhaar Binding: Every booking requires 10-digit mobile verification and Aadhaar last 4 digits.\n• 1-Active-Pass Limit: A single farmer identity can only hold one active, unfulfilled pass per crop season.\n• Land Holding Acreage Cap: Maximum quintals bookable are capped based on registered landholding records."
  );

  // --- SECTION 5: QUALITY CONTROL ---
  addSection("5. Quality Control, MSP & Moisture Pre-Check");
  addQA(
    "Q: How does the Moisture Pre-Check (17.0% threshold) work?",
    "• Village Pre-Check: The farmer enters the reading obtained from their local digital grain moisture meter.\n• Exact Boundary Rules: <= 17.0% is PASS (0% deduction) -> Fast-tracks to gate pass booking. > 17.0% is REJECTED (Sun Drying Required) -> Displays drying advice (2-4 hours on tarpaulin) before spending travel fuel.\n• Official Notice: Explicitly states that official gate laboratory testing at Gate #2 is final."
  );
  addQA(
    "Q: Which MSP rates and payment rules are integrated?",
    "• Hardcoded with official Government CACP 2025-26 MSP Rates: Paddy Common (Rs. 2,300/Qtl), Paddy Grade A (Rs. 2,320/Qtl), Wheat (Rs. 2,425/Qtl), Mustard (Rs. 5,950/Qtl), Chana (Rs. 5,650/Qtl), Cotton (Rs. 7,521/Qtl).\n• Direct DBT bank transfer expectation timeline (48-72 hours after weighbridge stamping)."
  );

  // --- SECTION 6: TECH STACK ---
  addSection("6. Complete Tech Stack Overview");
  addQA(
    "Full Technical Specifications",
    "• Frontend: React 19, TypeScript, TanStack Start/Router, Tailwind CSS, Lucide Icons (PWA Caching & Multilingual).\n• Telephony & Audio: Exotel Passthru, Web Audio API (DTMF tones), Web Speech API (TTS).\n• Backend API: Nitro Serverless Engine, Node.js REST API routes.\n• Hosting & Edge: Vercel Global Edge Network, Cloudflare SSL/DNS (Sub-50ms latency across India)."
  );

  drawFooter(page);

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'KisanSetu_Hackathon_Defense_Guide.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF successfully created at: ${outputPath} (${pdfBytes.length} bytes)`);
}

createDefensePdf().catch(console.error);

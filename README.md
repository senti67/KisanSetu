# 🌾 किसानसेतु / KisanSetu
### *National Agricultural Procurement, Mandi E-Gate Pass & Direct MSP Settlement System*

[![React 19](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/Routing-TanStack_Start_Fullstack-FF4154?logo=tanstack&logoColor=white)](https://tanstack.com/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js_REST_API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma_7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloudflare Tunnel](https://img.shields.io/badge/Deploy-Cloudflare_Tunnel-F38020?logo=cloudflare&logoColor=white)](https://cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary & Problem Statement

Indian farmers lose hundreds of hours every harvesting season waiting in unorganized truck queues at APMC Mandis and Procurement Centres. Extreme congestion causes:
1. **Prolonged Queue Wait Times**: Up to 18–36 hours of idling outside Mandi gates with perishable grain.
2. **Moisture-Based Distress Selling**: Middlemen exploiting lack of awareness around the government's official 17% moisture limit.
3. **Delayed Payouts**: Manual paperwork delaying DBT (Direct Benefit Transfer) settlements for weeks.

**KisanSetu (किसानसेतु)** is an end-to-end full-stack platform built to bridge the gap between farmers, mandis, and government procurement officials. It introduces **instant digital gate pass tokens, time-slot management, live queue status, a multilingual AI assistant, IVR telephony for feature phones, and an authorized Mandi Officer Control Center.**

---

## 🚀 Key Innovations & Core Features

### 1. 🎟️ Digital Mandi E-Gate Pass & Slot Booking
- **Fast-Track Gate Entry**: Real-time slot allocation based on dynamic procurement center capacity.
- **Scannable Barcode & QR**: High-resolution barcodes for instant gate officer verification.
- **WhatsApp Share & SMS Integration**: 1-tap sharing with family or truck drivers.

### 2. 🛡️ Mandi Officer Control Center & Token Scanner
- **Secure Officer Portal**: Concealed from normal farmer view; accessible only via verified Officer credentials.
- **Live Registry & Queue Management**: Search, filter, and track trucks inside the mandi yard.
- **1-Click Workflow Lifecycle**: `Confirmed` ➔ `Gate In` ➔ `Weighed & Passed` ➔ `DBT Completed`.

### 3. 🤖 Multilingual Kisan Mitra AI Assistant
- Powered by streaming LLMs with **dynamic auto-language detection**.
- Supports **Hindi (हिन्दी), Punjabi (ਪੰਜਾਬੀ), Marathi (मराठी), and English**.
- Instant guidance on MSP rates, 17% moisture guidelines, required KYC documents, and DBT timelines.

### 4. 🧮 Interactive Fair MSP & Moisture Calculator
- **Official 2025-26 Crop MSP Data**: Instant payout calculations for Paddy, Wheat, Mustard, Chana, and Cotton.
- **Moisture Threshold Analyzer**: Visual interactive slider displaying 0% deduction limits ($\le 17\%$) vs. sun-drying advisories.

### 5. 📞 IVR Telephony Gateway for Non-Smartphone Farmers
- Integrated voice IVR routes (`/api/ivr`) allowing farmers with basic feature phones to book gate passes and check slot availability via dial-in keypad prompts.

### 6. 📱 Mobile-First Responsive PWA Experience
- Sticky app navigation bar with thumb-friendly touch targets.
- Smooth bottom-drawer sheet modals with numeric keypad optimization (`inputMode="numeric"`).

---

## 🏗️ Monorepo Architecture

The repository is organized as a unified full-stack monorepo:

```
kisansetu/
├── backend/                      # Express + Prisma Backend API
│   ├── prisma/
│   │   ├── migrations/           # Database schema migrations
│   │   ├── schema.prisma         # Models (User, Farmer, Produce, Center, Slot, Booking)
│   │   └── seed.js               # Database seeder with sample mandis & bookings
│   ├── scripts/
│   │   └── create-admin.js       # Admin user generator utility
│   ├── src/
│   │   ├── controllers/          # Procurement, Auth, Farmer, Crop, Produce controllers
│   │   ├── ivr/                  # IVR telephony state machine and routes
│   │   ├── middleware/           # JWT auth & role validation middleware
│   │   └── routes/               # Modular REST endpoints
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express server entry point (Port 5000)
│
├── src/                          # TanStack Start / React 19 Frontend
│   ├── assets/                   # KisanSetu circular emblem & mascot graphics
│   ├── components/
│   │   ├── KisanSetuApp.tsx      # Main application dashboard & workflows
│   │   └── KisanMitraChat.tsx    # Multilingual floating AI assistant
│   ├── data/
│   │   ├── centres.ts            # Procurement centers & MSP reference data
│   │   └── translations.ts       # English, Hindi, Punjabi, Marathi dictionary
│   ├── lib/
│   │   └── procurementApi.ts     # Full-stack API client with fallback resilience
│   ├── routes/
│   │   ├── api/
│   │   │   ├── chat.ts           # Streaming AI assistant endpoint
│   │   │   └── procurement/      # TanStack server endpoints
│   │   └── index.tsx             # Root application page
│   ├── styles.css                # Natural agricultural theme & responsive tokens
│   └── router.tsx                # Client/server route tree
│
├── public/                       # Static public assets (Favicon, Logo, PWA manifest)
├── vite.config.ts                # Vite build & Nitro server configuration
├── package.json                  # Root monorepo scripts & frontend dependencies
└── README.md                     # Project documentation
```

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 | Ultra-fast reactive UI with modern hooks |
| **Framework** | TanStack Start, TanStack Router | Full-stack SSR routing and server functions |
| **Styling** | Tailwind CSS v4, Lucide Icons | Responsive natural agricultural design |
| **AI Assistant** | `@ai-sdk/react`, Streaming LLM | Multilingual conversational helper |
| **Backend API** | Node.js, Express.js | High-throughput REST API with rate limiting |
| **ORM & Database**| Prisma 7, PostgreSQL 16 | Relational data integrity for transactions |
| **Telephony** | IVR Controller State Machine | Voice telephone booking for feature phones |
| **Tunnel / Edge**| Cloudflare HTTP/2 Tunnel | Zero-config public HTTPS URL for demo testing |

---

## ⚙️ Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: `v15.x` or higher (optional for frontend preview, required for full DB persistence)

### 1. Clone the Unified Repository
```bash
git clone https://github.com/soroshimukherjee/soil-sidekick-ai.git kisansetu
cd kisansetu
```

### 2. Install Dependencies
```bash
# Install frontend & root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Configure Environment Variables
```bash
# Root Frontend .env
cp .env.example .env

# Backend .env
cp backend/.env.example backend/.env
```

*Backend `.env` sample:*
```ini
DATABASE_URL="postgresql://postgres:password@localhost:5432/kisansetu?schema=public"
JWT_SECRET="kisansetu_secure_jwt_secret_2026"
PORT=5000
```

### 4. Database Setup & Migration (Prisma)
```bash
# Generate Prisma Client
npm run prisma:generate

# Run schema migrations
npm run prisma:migrate

# Seed database with sample mandis & bookings
npm run prisma:seed
```

### 5. Start Development Servers

**Run Frontend (Port 3000):**
```bash
npm run dev
```

**Run Backend API (Port 5000 in separate terminal):**
```bash
npm run dev:backend
```

Open `http://localhost:3000` in your browser.

---

## 🛡️ Mandi Officer Portal & Token Scanner

To test the Mandi Officer workflow:
1. Click **"Officer Login"** in the top navigation bar or footer.
2. Click **"⚡ 1-Click Demo Officer Login"** (or use credentials: ID `MANDI-701`, PIN `7018`).
3. The **"Mandi Officer / Admin"** tab appears in the navigation.
4. Use the **Token Scanner** to lookup `KS-8942` or search by farmer phone number.
5. Update truck status live: `Gate In` ➔ `Weigh & Pass` ➔ `DBT Paid`.

---

## 📡 Key API Endpoints

### Procurement & Gate Pass APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/procurement/centers` | Fetch all live procurement centers and available slots |
| `GET` | `/api/procurement/bookings` | Fetch booking list for officer registry view |
| `GET` | `/api/procurement/bookings/:tokenId` | Fetch single pass verification details |
| `POST` | `/api/procurement/bookings` | Generate new digital gate pass token and decrement slot |
| `PATCH`| `/api/procurement/bookings` | Update token status (`Gate In`, `Weighed`, `Completed`, `Cancelled`) |
| `DELETE`| `/api/procurement/bookings/:tokenId`| Cancel booked pass and restore slot capacity |

### Kisan Mitra AI & IVR APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Streaming multilingual AI chatbot endpoint |
| `POST` | `/api/ivr/call` | Inbound IVR call handler |
| `POST` | `/api/ivr/input` | IVR DTMF keypad selection processor |

---

## 👥 Hackathon Team & Acknowledgements
- **Project**: KisanSetu (किसानसेतु)
- **Built for**: National Innovation Hackathon 2026
- **Special Thanks**: Ministry of Agriculture & Farmers Welfare data initiatives, e-NAM, and Digital India standards.

---

<div align="center">
  <b>🌾 सशक्त किसान, समृद्ध भारत • Empowering Indian Farmers Digitally 🌾</b>
</div>

<div align="center">

<img src="./public/kisansetu-circle.png" width="140" alt="KisanSetu Official Logo" />

# 🌾 किसानसेतु / KisanSetu
### *National Agricultural Procurement, Mandi E-Gate Pass & Fair MSP Settlement System*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20Portal-138808?style=for-the-badge&logo=cloudflare&logoColor=white)](https://exemption-recruitment-sagem-carnival.trycloudflare.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express API](https://img.shields.io/badge/Backend-Express%20%7C%20Node.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma%207-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-4a7c59?style=for-the-badge)](LICENSE)

<br/>

**Bridging Indian Farmers, APMC Mandis, and Government Procurement Officers through Real-Time Digital Gate Passes, IVR Telephony for Feature Phones, and Multilingual AI Assistance.**

[🌐 Live Demo](https://exemption-recruitment-sagem-carnival.trycloudflare.com) • [✨ Key Innovations](#-key-innovations--features) • [🏗️ Monorepo Architecture](#-monorepo-architecture) • [⚙️ Quickstart](#-quickstart--local-setup) • [🛡️ Officer Portal](#-mandi-officer-control-center) • [📡 API Reference](#-key-api-endpoints)

---

</div>

<br/>

## 📌 Executive Summary & Problem Statement

Indian farmers lose hundreds of hours every harvesting season waiting in unorganized truck queues at APMC Mandis and Procurement Centres. Extreme congestion causes:
- ⏳ **Prolonged Queue Wait Times**: Up to 18–36 hours of idling outside Mandi gates with perishable grain.
- 💧 **Moisture-Based Distress Selling**: Middlemen exploiting lack of awareness around the government's official 17% moisture limit.
- 💸 **Delayed Payouts**: Manual paperwork delaying DBT (Direct Benefit Transfer) settlements for weeks.

**KisanSetu (किसानसेतु)** is an end-to-end full-stack monorepo built to eliminate gate congestion, streamline weighing and inspection, and empower every farmer with direct, transparent procurement access.

---

## ✨ Key Innovations & Features

<table>
  <tr>
    <td width="50%">
      <h3>🎟️ Digital Mandi E-Gate Pass</h3>
      <ul>
        <li><b>Dynamic Slot Booking</b>: Real-time slot allocation based on live mandi capacity.</li>
        <li><b>Scannable Barcode & QR</b>: High-resolution verification codes for gate entry officers.</li>
        <li><b>1-Tap WhatsApp & SMS</b>: Instant pass sharing with family or truck drivers.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🛡️ Mandi Officer Control Center</h3>
      <ul>
        <li><b>Role-Protected Dashboard</b>: Hidden from public navigation until verified login.</li>
        <li><b>Live Yard Registry</b>: Real-time search, filters, and truck queue metrics.</li>
        <li><b>1-Click Lifecycle Tracker</b>: <code>Confirmed</code> ➔ <code>Gate In</code> ➔ <code>Weighed</code> ➔ <code>DBT Paid</code>.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🤖 Multilingual Kisan Mitra AI</h3>
      <ul>
        <li><b>4 Indian Languages</b>: Hindi (हिन्दी), Punjabi (ਪੰਜਾਬੀ), Marathi (मराठी), and English.</li>
        <li><b>Live Streaming LLM</b>: Instant advice on MSP rates, 17% moisture limits, and KYC papers.</li>
        <li><b>Voice Mic Ready</b>: Accessible for rural and non-English-speaking farmers.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📞 IVR Gateway for Feature Phones</h3>
      <ul>
        <li><b>No Internet Required</b>: Keypad dial-in state machine for non-smartphone users.</li>
        <li><b>Automated Pass Generation</b>: Book slots and check live queue position via toll-free phone call.</li>
        <li><b>Full Database Sync</b>: IVR tokens sync directly with the Mandi Officer Registry.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🧮 Interactive Fair MSP & Moisture Calculator</h3>
      <ul>
        <li><b>Official 2025-26 Rates</b>: Live MSP rates for Paddy (₹2,300/Qtl), Wheat, Mustard, etc.</li>
        <li><b>Moisture Threshold Analyzer</b>: Interactive slider displaying 0% price deduction threshold ($\le 17\%$).</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📱 Mobile-First Responsive PWA</h3>
      <ul>
        <li><b>Sticky Bottom Navigation</b>: Large thumb-friendly app controls (Home, Mandis, Pass, MSP, Help).</li>
        <li><b>Bottom Sheet Drawers</b>: Touch-optimized numeric inputs (<code>inputMode="numeric"</code>).</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏗️ Monorepo Architecture

```
kisansetu/ (Unified Full-Stack Repository)
│
├── backend/                       # 🟢 Express + Prisma REST API (Port 5000)
│   ├── prisma/
│   │   ├── migrations/            # SQL schema migrations
│   │   ├── schema.prisma          # PostgreSQL models (User, Farmer, Booking, Slot, Center)
│   │   └── seed.js                # Database seeder with sample mandis & bookings
│   ├── scripts/
│   │   └── create-admin.js        # Admin user generator utility
│   ├── src/
│   │   ├── controllers/           # Procurement, Auth, Farmer, Crop, Produce controllers
│   │   ├── ivr/                   # IVR telephone state machine & dial-in routes
│   │   ├── middleware/            # JWT auth & security rate limiters
│   │   └── routes/                # Modular REST endpoints
│   ├── .env.example               # Backend database configuration template
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express API server entry
│
├── src/                           # 🌾 React 19 + TanStack Start Frontend (Port 3000)
│   ├── assets/                    # Transparent circular emblem & mascots
│   ├── components/
│   │   ├── KisanSetuApp.tsx       # Main dashboard, booking flow & officer control center
│   │   └── KisanMitraChat.tsx     # Multilingual AI assistant widget
│   ├── data/                      # Multi-language translations & MSP tables
│   ├── lib/                       # API clients & service bridges
│   ├── routes/                    # Server functions & page routes
│   └── styles.css                 # Natural agricultural theme & responsive tokens
│
├── public/                        # Static public assets (Favicon, Logo, PWA manifest)
├── vite.config.ts                 # Vite build & Nitro server configuration
├── package.json                   # Unified root monorepo scripts
└── README.md                      # Project documentation
```

---

## 💻 Tech Stack Matrix

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 + TypeScript** | High-performance reactive UI with modern hooks |
| **Routing & SSR** | **TanStack Start & Router** | Type-safe full-stack routing and server endpoints |
| **Styling & Design** | **Tailwind CSS v4** | Natural agricultural color palette & mobile layout |
| **AI Assistant** | **`@ai-sdk/react` + LLM** | Multilingual streaming voice/text assistant |
| **Backend REST API** | **Express.js + Node.js** | Modular API with rate limiting and helmet security |
| **Database & ORM** | **PostgreSQL 16 + Prisma 7** | Strongly typed relational schema with migrations |
| **Voice Telephony** | **IVR State Machine** | Keypad DTMF booking for non-smartphone users |
| **Public Deployment** | **Cloudflare HTTP/2 Tunnel** | Secure global HTTPS edge distribution |

---

## ⚙️ Quickstart & Local Setup

### 1. Clone the Unified Monorepo
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

### 3. Environment Setup
```bash
# Configure Backend Database
cp backend/.env.example backend/.env
```

*`backend/.env` contents:*
```ini
DATABASE_URL="postgresql://postgres:password@localhost:5432/kisansetu?schema=public"
JWT_SECRET="kisansetu_production_secure_jwt_secret_key_2026"
PORT=5000
```

### 4. Database Initialization (Prisma)
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Database Migrations
npm run prisma:migrate

# Seed Sample Mandis & Bookings
npm run prisma:seed
```

### 5. Start Development Servers

| Process | Command | URL |
| :--- | :--- | :--- |
| **Frontend (React 19)** | `npm run dev` | `http://localhost:3000` |
| **Backend (Express API)** | `npm run dev:backend` | `http://localhost:5000` |

---

## 🛡️ Mandi Officer Control Center & Demo Credentials

To test the Mandi Officer workflow:
1. Click **"Officer Login"** in the top navigation bar.
2. Click **"⚡ 1-Click Demo Officer Login"** (or enter: ID `MANDI-701`, PIN `7018`).
3. The **"Mandi Officer / Admin"** tab appears in the navigation.
4. Test the **Gate Scanner** with sample Token `KS-8942` or search by farmer phone number.
5. Update truck status live: `Gate In` ➔ `Weigh & Pass` ➔ `DBT Paid`.

---

## 📡 Key API Endpoints

### 🌾 Mandi Gate Pass & Procurement Endpoints
```http
GET    /api/procurement/centers           # List all active centers and live slot availability
GET    /api/procurement/bookings          # Fetch registry bookings for officer dashboard
GET    /api/procurement/bookings/:tokenId # Single gate pass verification details
POST   /api/procurement/bookings          # Issue new digital gate pass and decrement slot
PATCH  /api/procurement/bookings          # Update token lifecycle status
DELETE /api/procurement/bookings/:tokenId # Cancel pass and restore slot capacity
```

### 🤖 Kisan Mitra AI & IVR Endpoints
```http
POST   /api/chat                          # Multilingual streaming AI conversation
POST   /api/ivr/call                      # Inbound telephone IVR entry handler
POST   /api/ivr/input                     # Keypad DTMF digit input processor
```

---

## 👥 Hackathon Team & Acknowledgements
- **Project**: KisanSetu (किसानसेतु)
- **Built for**: National Innovation Hackathon 2026
- **Data & Standards**: Ministry of Agriculture & Farmers Welfare, e-NAM, and Digital India standards.

---

<div align="center">
  <b>🌾 सशक्त किसान, समृद्ध भारत • Empowering Indian Farmers Digitally 🌾</b>
</div>

# 🌾 KisanSetu (किसानसेतु)
### *Offline-Resilient Agricultural Procurement, Mandi E-Gate Pass & Fair MSP Orchestration Backend*

[![Live Demo](https://img.shields.io/badge/Live%20Portal-Online-138808?style=for-the-badge&logo=cloudflare&logoColor=white)](https://exemption-recruitment-sagem-carnival.trycloudflare.com)
[![React 19](https://img.shields.io/badge/Frontend-React_19_%2B_Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js_REST_API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma 7](https://img.shields.io/badge/ORM-Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-4a7c59?style=for-the-badge)](LICENSE)

---

## 📌 Overview

**KisanSetu (किसानसेतु)** is an offline-capable agricultural procurement orchestration and gate control system built to explore how a modern full-stack backend can safely handle **dynamic slot reservations, offline feature-phone telephony, moisture-aware price calculation, replay-safe gate entry, and transparent DBT settlement tracking**.

In practical terms, KisanSetu is a **procurement control and execution runtime**. It sits between the farmer application experience (Smartphone PWA, SMS, or dial-in IVR telephony) and the physical Mandi APMC yard, where it enforces capacity rules, eliminates 18–36 hour truck gate idling, verifies grain moisture standards, and keeps procurement state fully observable for Mandi Secretaries and Gate Officers.

The project is intentionally positioned as an **orchestration and gate control layer**, not as a bank core ledger. It does not replace the Public Financial Management System (PFMS) or the Reserve Bank of India's NEFT/RTGS settlement rails. Instead, it focuses on the engineering problems where an agricultural procurement backend must:
- Issue **bounded, non-duplicable digital gate pass tokens** to prevent yard congestion.
- Reserve **mandi bay capacity** transactionally before physical arrival.
- Support **offline & low-connectivity workflows** via an IVR (Interactive Voice Response) state machine for feature phones.
- Safely handle **weighbridge lifecycle sagas** (`Confirmed` ➔ `Gate In` ➔ `Weighed & Passed` ➔ `DBT Completed`).
- Prevent distress selling by enforcing the **official $\le 17\%$ moisture baseline** and fair MSP price calculators.
- Record all token status transitions and emit observable events for officer dashboards.

This repository is organized as a unified monorepo: **PostgreSQL-first with Prisma 7 ORM** for durable persistence, accompanied by an in-memory resilient service layer for zero-dependency local preview and edge execution.

---

## 🚀 What KisanSetu Does

At a high level, KisanSetu supports the following full-lifecycle flow:

```
[Farmer / Truck Driver]
        │
        ├── (A) Smartphone Web PWA ────┐
        │                              ▼
        └── (B) Keypad Phone IVR ──► [KisanSetu Gateway]
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [Capacity Pre-Check]          [Slot Reservation]
              (Checks yard throughput)      (Atomically claims 1 slot)
                        │                             │
                        └──────────────┬──────────────┘
                                       ▼
                             [Durable Gate Token]
                             (Barcode + QR + SMS + WhatsApp)
                                       │
                                       ▼
                       [Mandi Physical Gate Arrival]
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [Officer Token Scanner]       [Moisture & Weighbridge]
              (Fast-tracks entry into yard) (Validates moisture <= 17%)
                                       │
                                       ▼
                       [DBT Direct Settlement Ledger]
                       (48-72h Bank Account Credit)
```

1. **Farmer Authentication & Identity**: The farmer accesses the platform via web or phone and resolves their profile (Aadhaar last-4 digits, registered mobile number, district, and land record reference).
2. **Center & Capacity Selection**: The farmer queries nearby procurement centers (e.g., *Karnal Main Grain Mandi Gate 2*) with live queue wait times and real-time slot availability.
3. **Transactional Slot Reservation**: The backend atomically reserves a 2-hour arrival slot and persists a cryptographically unique digital token (e.g. `KS-8942`).
4. **Offline Token Issuance**: For rural farmers without internet, the dial-in IVR telephony state machine processes DTMF keypad inputs and issues an SMS-backed token via the same stored authorization model.
5. **Physical Gate Check & Scanner**: The gate officer scans the barcode at the mandi entrance, verifying validity, slot time-window, and preventing duplicate yard entries.
6. **Moisture & Weighbridge Execution Saga**: The moisture analyzer calculates gross payout against the official MSP baseline (e.g., Paddy Grade-A ₹2,300/Qtl) and records moisture levels ($\le 17\%$ standard vs. high moisture deductions).
7. **Settlement Transition**: The token lifecycle is marked `Completed`, and an immutable ledger record is dispatched to the DBT payment queue for direct bank transfer.

---

## 💡 Why This Project Exists

Most agricultural and logistics demos stop at static listings or simple request-response forms. KisanSetu tackles the harder distributed problems that occur in real Indian APMC Mandis:

- **Anti-Congestion Slot Management**: Mandis face sudden traffic spikes during peak harvesting windows. KisanSetu prevents bottlenecks by capping arrivals per 2-hour window.
- **Offline & Feature Phone Parity**: Over 40% of smallholder farmers operate non-smartphones. KisanSetu provides an identical stored-token state machine over both Web and IVR telephony routes.
- **Moisture Standardization to Prevent Exploitation**: Middlemen often deduct arbitrary cuts claiming "excess moisture". KisanSetu's transparent 17% limit calculator protects farmer revenue.
- **Authorized Mandi Officer Portal**: Separation of concerns between citizen booking flows and gate control operations with 1-click status transitions.
- **Multilingual Accessibility**: Real-time AI support in **Hindi, Punjabi, Marathi, and English** with automatic language detection.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │               KisanSetu Clients              │
                               │  (React 19 PWA / Mobile / IVR Voice / SMS)   │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           Vite / TanStack Start Gateway      │
                               │            (Reverse Proxy & Edge SSR)        │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
        ┌─────────────────────────────┐                               ┌─────────────────────────────┐
        │   Express.js REST Engine    │                               │     Kisan Mitra AI Stream   │
        │       (Port 5000)           │                               │   (OpenAI-Compatible LLM)   │
        └──────────────┬──────────────┘                               └─────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬────────────────┐
       ▼               ▼               ▼                ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌───────────────┐
│ Auth & JWT   ││ Procurement  ││ IVR Telephony││ Officer Yard  │
│ Middleware   ││ Slot Engine  ││ State Machine││ Control Center│
└──────┬───────┘└──────┬───────┘└──────┬───────┘└───────┬───────┘
       │               │               │                │
       └───────────────┴───────┬───────┴────────────────┘
                               ▼
               ┌──────────────────────────────┐
               │    Prisma 7 ORM Layer        │
               │ (Schema, Migrations & Seeds) │
               └──────────────┬───────────────┘
                              ▼
               ┌──────────────────────────────┐
               │    PostgreSQL 16 Database    │
               │ (Users, Centers, Slots, Pass)│
               └──────────────────────────────┘
```

---

## 📊 Core Features & Functional Matrix

| Module | Current Implementation | Technical Details |
| :--- | :--- | :--- |
| **Mandi Gate Pass** | Dynamic token generation, capacity reservation, barcode SVG | Atomic decrement of slot capacity, 2-hour entry windows |
| **Mandi Officer Portal** | Secure dashboard, token verification scanner, status updater | Hidden from public navigation, reveals on officer authentication |
| **Kisan Mitra AI** | Streaming multilingual assistant (HI, PA, MR, EN) | Streaming protocol with `@ai-sdk/react`, auto-language detection |
| **IVR Telephony** | Inbound dial-in keypad state machine (`/api/ivr`) | Keypad DTMF capture, slot reservation over phone, SMS dispatch |
| **MSP & Moisture Engine**| 2025-26 official rates, interactive $\le 17\%$ threshold slider | Formulaic gross revenue calculations, moisture cut warnings |
| **Mobile PWA** | Sticky bottom navigation bar, touch-friendly bottom sheets | Native app feel, numeric keypads (`inputMode="numeric"`), WhatsApp share |
| **Persistence** | PostgreSQL-first with Prisma 7, in-memory edge fallback | Type-safe migrations, seeding scripts, robust offline failover |

---

## 🏗️ Monorepo Directory Structure

```
kisansetu/ (Root Workspace)
├── backend/                       # 🟢 Express.js + Prisma REST Backend
│   ├── prisma/
│   │   ├── migrations/            # SQL schema migration history
│   │   ├── schema.prisma          # PostgreSQL models (User, Farmer, Booking, Slot, Center)
│   │   └── seed.js                # Database seeder with sample mandis & bookings
│   ├── scripts/
│   │   └── create-admin.js        # Admin user creation script
│   ├── src/
│   │   ├── controllers/           # Procurement, auth, crop, produce controllers
│   │   ├── ivr/                   # IVR telephone state machine & route handlers
│   │   ├── middleware/            # JWT auth, role validation, express rate limiters
│   │   ├── routes/                # Modular REST route definitions
│   │   └── lib/                   # Prisma database client instance
│   ├── .env.example               # Backend environment variable template
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express server entry point (Port 5000)
│
├── src/                           # 🌾 React 19 Full-Stack Frontend
│   ├── assets/                    # Transparent KisanSetu circular emblem & mascot icons
│   ├── components/
│   │   ├── KisanSetuApp.tsx       # Main agricultural dashboard, booking flow & officer view
│   │   └── KisanMitraChat.tsx     # Floating multilingual AI assistant
│   ├── data/
│   │   ├── centres.ts             # Initial procurement centers & 2025-26 MSP reference
│   │   └── translations.ts        # Hindi, Punjabi, Marathi, English dictionary
│   ├── lib/
│   │   ├── procurementApi.ts      # Client-side API bridge with fallback resilience
│   │   └── procurementService.ts  # Server-side procurement business logic
│   ├── routes/
│   │   ├── api/
│   │   │   ├── chat.ts            # LLM streaming assistant endpoint
│   │   │   └── procurement/       # TanStack Start server functions
│   │   └── index.tsx              # Root application entry
│   └── styles.css                 # Natural earthy theme & mobile tokens
│
├── public/                        # Static assets (Favicons, logos, manifests)
├── package.json                   # Unified root monorepo scripts
└── README.md                      # Technical project documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Purpose |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string (`postgresql://user:pass@localhost:5432/kisansetu`) |
| `JWT_SECRET` | Yes | — | Cryptographic secret for signing Officer and Farmer JWT sessions |
| `PORT` | No | `5000` | Express REST API port |

### Frontend (`.env`)

| Variable | Required | Default | Purpose |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | No | `/api` | Base URL for API routing (auto-proxies in dev) |
| `OPENAI_API_KEY` | No | — | Optional LLM API key for Kisan Mitra AI (uses built-in streaming mock if unset) |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or newer
- **npm**: `v10.x` or newer
- **PostgreSQL**: `v14.x` or newer (Optional: Docker container)

### 2. Clone & Install
```bash
git clone https://github.com/senti67/KisanSetu.git
cd KisanSetu

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Configure Environment
```bash
# Setup backend environment file
cp backend/.env.example backend/.env
```

### 4. Initialize Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run schema migrations
npm run prisma:migrate

# Seed database with sample procurement centers & tokens
npm run prisma:seed
```

### 5. Start Development Servers

| Process | Command | Endpoint |
| :--- | :--- | :--- |
| **Frontend Web App** | `npm run dev` | `http://localhost:3000` |
| **Express Backend API** | `npm run dev:backend` | `http://localhost:5000` |

---

## 🛡️ Mandi Officer Control Center & Demo Credentials

To test the role-restricted Mandi Officer workflows:

1. Click **"Officer Login"** in the top navigation bar or footer.
2. Enter the official demo credentials (or click **"⚡ 1-Click Demo Officer Login"**):
   - **Officer ID**: `MANDI-701`
   - **PIN / Password**: `7018`
3. The **"Mandi Officer / Admin"** control tab unlocks in the navigation bar.
4. **Token Verification**: In the Gate Scanner box, lookup sample token `KS-8942` or search by farmer phone number.
5. **Lifecycle State Transition**: Click `Gate In` ➔ `Weigh & Pass` ➔ `DBT Paid` to observe real-time queue and status updates.

---

## 📡 REST API Reference

### Procurement & Gate Pass Routes

#### `GET /api/procurement/centers`
Returns all active procurement centers along with real-time available capacity and wait times.
```json
[
  {
    "id": "c1",
    "name": "Karnal Main Grain Mandi (Gate 2)",
    "district": "Karnal",
    "tehsil": "Karnal",
    "distance": 4.2,
    "waitTime": "15 min",
    "availableSlots": 14,
    "crops": ["Paddy (Grade A)", "Wheat", "Mustard"]
  }
]
```

#### `POST /api/procurement/bookings`
Atomically reserves a slot and generates a non-duplicable digital token.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "farmerName": "Rameshwar Singh",
  "mobile": "9876543210",
  "aadhaar4": "4821",
  "centreId": "c1",
  "centreName": "Karnal Main Grain Mandi (Gate 2)",
  "district": "Karnal",
  "date": "2026-08-27",
  "slot": "08:00 AM - 10:00 AM",
  "crop": "Paddy (Grade A)",
  "quantity": "85"
}
```
- **Response**: `201 Created` with signed `tokenId: "KS-8942"` and estimated MSP payout.

#### `PATCH /api/procurement/bookings`
Updates the status of an issued token along the gate lifecycle.
- **Request Body**: `{ "tokenId": "KS-8942", "status": "Gate In" }`
- **Allowed Transitions**: `Confirmed` ➔ `Gate In` ➔ `Weighed` ➔ `Completed` / `Cancelled`.

---

### IVR Telephony & AI Routes

#### `POST /api/ivr/call`
Inbound telephone webhook for feature phone callers. Returns dial-in audio menu choices.

#### `POST /api/ivr/input`
Processes keypad DTMF selections (e.g. `1` for Paddy booking, `2` for slot check) and reserves token over phone.

#### `POST /api/chat`
Streaming conversational AI endpoint powering **Kisan Mitra AI** with multi-language detection.

---

## 📋 Current Scope & Engineering Notes

KisanSetu is built as an extensible, production-oriented prototype. Key architectural decisions include:
- **Resilient Fallback Design**: If PostgreSQL is temporarily unreachable in demo environments, the frontend automatically falls back to an internal service layer to preserve uninterrupted gate-pass booking demonstrations.
- **Separation of Authentication**: Citizen booking is zero-friction (OTP/Aadhaar last-4 + mobile), while Mandi Officer controls are strictly JWT and role-gated.
- **Physical Sensor Simulation**: Moisture levels and weighbridge readings are currently accepted via officer inputs and interactive sliders, designed to plug into hardware IoT serial protocols in future deployments.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>🌾 सशक्त किसान, समृद्ध भारत • Empowering Indian Agriculture Through Open Tech 🌾</b>
</div>

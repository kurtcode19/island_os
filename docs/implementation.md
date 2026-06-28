# Catarman eSuroy — Smart Tourism OS

**Implementation Document** · June 2026

A comprehensive smart tourism platform for **Catarman, Camiguin, Philippines** — serving tourists, local business owners, and the local government unit (LGU) under one unified system.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Project Structure](#3-project-structure)
4. [Authentication & Roles](#4-authentication--roles)
5. [Core Features](#5-core-features)
6. [Data Layer](#6-data-layer)
7. [AI Integration](#7-ai-integration)
8. [Mobile & PWA](#8-mobile--pwa)
9. [Configuration & Environment](#9-configuration--environment)
10. [Development & Deployment](#10-development--deployment)

---

## 1. System Overview

**Catarman eSuroy** (formerly *Island OS*) is a single-page React application that functions as a smart tourism operating system. It provides three distinct interfaces depending on the user's role:

| Role | Interface | Purpose |
|------|-----------|---------|
| **Tourist** | Public website + mobile app | Explore destinations, book accommodations/transport/rentals, generate AI itineraries, manage a digital tourist pass |
| **Business Owner** | Business dashboard | Manage bookings, inventory, tours, reviews, view analytics |
| **LGU** | Government dashboard | Tourist registry, settlement processing, payment tracking, safety monitoring, port operations, reports |

The application runs as a **Progressive Web App (PWA)** in the browser and can be packaged as a native **Android APK** via **Capacitor**.

---

## 2. Tech Stack & Architecture

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Language | TypeScript | 5.8.x |
| Build Tool | Vite | 6.2.x |
| Styling | Tailwind CSS | 4.1.x |
| Animation | Motion (Framer Motion) | 12.x |
| Routing | react-router-dom | 7.x |
| Icons | Duo Icons (via `@duo-icons/react`) | 1.x |
| Notifications | Sonner | 2.x |
| Charts | Recharts | 3.x |
| Maps | Leaflet + react-leaflet | 1.9.x / 5.x |
| QR Code | qrcode.react + html5-qrcode | — |

### Backend / Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Firebase Auth** | Authentication | Google sign-in popup/redirect, anonymous, Capacitor native |
| **Firestore** | Primary database | All collections (users, bookings, businesses, passes, reviews, incidents) |
| **Google Gemini** | AI itinerary generation | `@google/genai` SDK with structured JSON schema |

### Mobile

| Layer | Technology |
|-------|-----------|
| Mobile Shell | Capacitor 8 |
| Android Build | Gradle 8.13 (AGP) |
| Native Auth | `@capacitor-firebase/authentication` |

### Architecture Diagram (text)

```
Browser / Capacitor WebView
        │
        ▼
   React App (SPA)
        │
        ├── Tailwind CSS → Styled UI
        ├── react-router-dom → Routing
        ├── Motion → Animations
        └── Context API → Auth State
              │
              ▼
        ┌──────────── Firestore ────────────┐
        │  users, bookings, businesses,     │
        │  passes, reviews, incidents,      │
        │  audit_logs, inventory            │
        └───────────────────────────────────┘
              │
        Google Gemini API
        (AI Trip Planner)
```

---

## 3. Project Structure

```
island_os/
├── android/                    # Capacitor Android native project
│   ├── app/
│   ├── gradle/
│   ├── build.gradle
│   └── gradlew
├── public/                     # Static assets (images, manifest)
├── scripts/
│   └── seed-firestore.ts       # Database seed script
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component (auth listener, role routing)
│   ├── AppRoutes.tsx           # Route definitions
│   ├── firebase.ts             # Firebase client initialization
│   ├── icons.tsx               # Icon re-exports
│   ├── index.css               # Global styles + Tailwind
│   │
│   ├── components/
│   │   ├── layout/             # Navigation, MobileBottomNav, MobileHeader, RoleNavigator
│   │   ├── mobile/             # BottomNav, Header, SearchBar, OnboardingHero, CardCarousel, etc.
│   │   ├── business/           # AnalyticsModule, BookingsModule, InventoryModule, ToursModule, etc.
│   │   ├── lgu/                # RegistryModule, SettlementModule, PaymentModule, SafetyModule, etc.
│   │   └── shared/             # SOSButton, QRScanner, ReviewForm, DateGuestPicker, StatCard, etc.
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication context + provider
│   │
│   ├── data/                   # Static data sources
│   │   ├── accommodations.ts
│   │   ├── transport.ts
│   │   ├── rentals.ts
│   │   ├── locations.ts
│   │   ├── businesses.ts
│   │   └── processFlow.ts
│   │
│   ├── lib/                    # Service layer
│   │   ├── passService.ts
│   │   ├── checkinService.ts
│   │   ├── capacityService.ts
│   │   ├── reviewService.ts
│   │   ├── incidentService.ts
│   │   ├── auditService.ts
│   │   └── capacitorAuth.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │
│   └── views/                  # Page components
│       ├── LandingView.tsx
│       ├── MobileAppView.tsx
│       ├── TripPlannerView.tsx
│       ├── StayView.tsx
│       ├── TransportView.tsx
│       ├── RentalsView.tsx
│       ├── LocationsView.tsx
│       ├── TouristPassView.tsx
│       ├── MyBookingsView.tsx
│       ├── ClaimBusinessView.tsx
│       ├── HowItWorksView.tsx
│       ├── BusinessDashboard.tsx
│       ├── GovernmentDashboard.tsx
│       └── CheckInView.tsx
│
├── dist/                       # Vite build output
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── firebase-applet-config.json
└── firestore.rules
```

### Route Map

| Path | Component | Access |
|------|-----------|--------|
| `/` | LandingView | Public |
| `/how-it-works` | HowItWorksView | Public |
| `/stay` | StayView | Public |
| `/transport` | TransportView | Public |
| `/locations` | LocationsView | Public |
| `/rentals` | RentalsView | Public |
| `/planner` | TripPlannerView | Public (AI) |
| `/pass` | TouristPassView | Auth required |
| `/my-bookings` | MyBookingsView | Auth required |
| `/claim-business` | ClaimBusinessView | Auth required |
| `/business/*` | BusinessDashboard | Business role |
| `/government/*` | GovernmentDashboard | LGU role |
| `/mobile` | MobileAppView | Public |
| `/checkin` | CheckInView | LGU role |

### Route Gating

The `RoleNavigator` component in `App.tsx` handles:

1. **Mobile redirect**: Screens < 768px automatically redirect to `/mobile`
2. **Role guard**: Paths under `/business` require `role === 'BUSINESS'`; paths under `/government` require `role === 'LGU'`
3. **Desktop redirect**: Users on `/mobile` with screens ≥ 768px are redirected to `/`

---

## 4. Authentication & Roles

### Auth Flow

1. `App.tsx` mounts and listens to Firebase `onAuthStateChanged`
2. On sign-in, the user's Firestore `users/{uid}` document is fetched via `onSnapshot`
3. If no user document exists, one is auto-created with `role: 'TOURIST'`
4. A digital tourist pass is generated via `passService.ts`
5. The `AuthContext` exposes `{ user, profile, loading, login, logout }`

### Login Strategies (in `App.tsx:login()`)

| Environment | Primary | Fallback |
|-------------|---------|---------|
| Web | Google sign-in popup | Google sign-in redirect |
| Capacitor native | Anonymous sign-in | Google sign-in redirect |

### Role Model

| Role | Description | Dashboard Access |
|------|-------------|-----------------|
| `TOURIST` | End-user exploring/booking | None (public views only) |
| `BUSINESS` | Service provider | `/business/*` |
| `LGU` | Local government operator | `/government/*`, `/checkin` |

Roles are stored in the Firestore `users/{uid}` document and can be set/updated via the claim business flow or LGU assignment.

### Firestore User Schema

```typescript
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'TOURIST' | 'BUSINESS' | 'LGU';
  businessId?: string;  // If role === BUSINESS
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5. Core Features

### 5.1 Landing & Discovery (`LandingView.tsx`)

- Hero section with Camiguin imagery
- Search widget (`SearchWidget.tsx`) with tabs: Stays, Cars, Packages, Things to Do
- Featured experience cards
- Process flow explanation
- Call-to-action buttons for key flows

### 5.2 Booking System

Three booking modules share a common pattern:

- **Stay** (`StayView.tsx`): Browse accommodations with photo gallery, calendar date picker, guest count selector, promo packages
- **Transport** (`TransportView.tsx`): Ferry schedules and land transport with date/guest picker and availability check
- **Rentals** (`RentalsView.tsx`): Vehicle rentals by merchant (motorcycles, cars, bikes) with booking form

All bookings write to Firestore `bookings/{docId}` with fields: `touristUid`, `serviceName`, `serviceType`, `date`, `amount`, `status`, `paymentStatus`.

### 5.3 AI Trip Planner (`TripPlannerView.tsx`)

A conversational chatbot-style wizard that collects 7 preferences and generates a personalized itinerary via Google Gemini.

**Preference Flow:**

| Step | Question | Input Type |
|------|----------|-----------|
| Duration | "How many days?" | Horizontal dot slider (1–5) |
| Group | "Who's joining?" | Avatar cluster cards (Solo/Couple/Family/Friends) |
| Transport | "How to get around?" | Tiered comparison with rating bars |
| Pace | "What pace?" | 3-position slider (Relaxed/Moderate/Packed) |
| Interests | "What interests?" | Tag cloud badge picker (multi-select) |
| Style | "What experience?" | Full-bleed vibe cards with gradients |
| Budget | "What budget?" | Material-tier cards (Bronze/Silver/Gold) |

**Generation:**
- Prompt sent to **Gemini 2.0 Flash** via `@google/genai` SDK
- Structured JSON enforced via `responseJsonSchema` (Type.ARRAY of Type.OBJECT)
- Activities are sorted chronologically client-side after response
- Falls back to mock data if API key is not configured

**Itinerary Display:**
- Trip summary bar (total activities, total cost, categories)
- Day-by-day timeline with compact activity cards
- Category color badges (Heritage, Nature, Relax, Adventure)
- "Why this works" insight per activity
- Save to Pass / Transport action buttons per activity

### 5.4 Digital Tourist Pass (`TouristPassView.tsx`)

- Generates a unique pass ID: `CTRM-P-YYYY-XXXX`
- Displays QR code with pass details
- Shows pass status (active/expired), validity dates, and linked bookings
- Used by LGU for check-in/check-out via QR scanner

### 5.5 Interactive Map (`LocationsView.tsx`, `IslandMap.tsx`)

- Full-screen Leaflet map with:
  - Destination markers with clustering (`react-leaflet-cluster`)
  - Business location markers
  - Shop popups with booking links
  - Custom styled popups (glassmorphism)

### 5.6 Business Dashboard (`BusinessDashboard.tsx`)

Sub-modules:
- **Analytics**: Revenue charts, booking trends, visitor stats (Recharts)
- **Bookings**: Manage incoming bookings, confirm/cancel
- **Inventory**: Room/amenity/vehicle management
- **Tours**: Tour package management
- **Reviews**: Moderate and reply to customer reviews
- **Settings**: Business profile configuration

### 5.7 LGU Dashboard (`GovernmentDashboard.tsx`)

Sub-modules:
- **Registry**: Tourist booking registry with real-time view
- **Settlement**: Business settlement processing and tracking
- **Payments**: Payment records, ticket code management
- **Safety**: Incident monitoring, health/safety reports (via SOS button)
- **Port**: Vessel schedule monitoring
- **Reports**: Visitor trend analytics and export

### 5.8 SOS / Safety (`SOSButton.tsx`, `incidentService.ts`)

- Floating SOS button on tourist-facing pages
- Reports GPS-tagged incidents to Firestore `incidents` collection
- LGU Safety module monitors incoming incidents in real-time

### 5.9 Mobile App View (`MobileAppView.tsx`)

- Full-screen immersive mobile shell with tabs: Explore, Map, Services, Pass, Profile
- Phone-frame preview when viewed on desktop (440×928px mockup)
- Auto-redirect for mobile screens < 768px
- Bottom tab navigation with animated transitions

---

## 6. Data Layer

### 6.1 Firestore Collections

| Collection | Document Fields | Used By |
|-----------|----------------|---------|
| `users/{uid}` | name, email, photoURL, role, businessId, createdAt, updatedAt | Auth, profile |
| `bookings/{docId}` | touristUid, touristName, serviceName, serviceType, location, date, amount, status, paymentStatus, createdAt | Bookings, dashboards |
| `businesses/{docId}` | name, ownerUid, category, location, contactInfo, status | Business dashboard |
| `passes/{passId}` | passId (CTRM-P-XXXX), touristUid, status, createdAt, validUntil | Tourist pass |
| `reviews/{docId}` | bookingId, touristUid, businessId, rating, comment, reply, createdAt | Reviews module |
| `incidents/{docId}` | reportedBy, type, description, location (geo), status, createdAt | SOS, LGU safety |
| `audit_logs/{docId}` | action, performedBy, targetType, targetId, details, timestamp | Audit trail |

### 6.2 Static Data Modules (`src/data/`)

| Module | Content |
|--------|---------|
| `accommodations.ts` | 6+ hotel/resort listings with pricing, amenities, promo packages |
| `transport.ts` | Ferry schedules (routes, times, prices), land transport options |
| `rentals.ts` | Vehicle rental merchants and vehicle inventory |
| `locations.ts` | Island points of interest with coordinates, descriptions, categories |
| `businesses.ts` | Business directory for the claim/registration flow |
| `processFlow.ts` | Onboarding steps for booking and trip planner flows |

### 6.3 Service Layer (`src/lib/`)

| Service | Key Functions |
|---------|---------------|
| `passService.ts` | `createPass()`, `subscribeToPass()` — generates CTRM-P IDs, listens for real-time updates |
| `checkinService.ts` | `verifyPass()`, `getActiveBookings()`, `checkin()`, `depart()` |
| `capacityService.ts` | Booking capacity validation against limits |
| `reviewService.ts` | `submitReview()`, `moderateReview()`, `replyToReview()`, `subscribeToReviews()` |
| `incidentService.ts` | `reportIncident()` with GPS coordinates |
| `auditService.ts` | `writeAuditLog()` — writes to Firestore `audit_logs` |
| `capacitorAuth.ts` | `isNativePlatform()` detection via Capacitor |

---

## 7. AI Integration

### 7.1 Model

- **Provider**: Google Generative AI (`@google/genai`)
- **Model**: `gemini-2.0-flash`
- **API Key**: Injected via `VITE_GEMINI_API_KEY` environment variable

### 7.2 Prompt Structure

```
System Instruction (concierge persona + rules):
  - Strictly Catarman locations only
  - Include mandatory spots (Sunken Cemetery, Gui-ob Church, Tuasan Falls, etc.)
  - Chronological order enforced
  - Realistic breaks (lunch, travel time)
  - Pace-appropriate schedules

User Prompt (preferences injected):
  - Duration, group type, transport, pace, interests, style, budget
  - Structured JSON output requirements
```

### 7.3 Structured Output

The Gemini response is constrained via `responseJsonSchema`:

```typescript
{
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: Type.NUMBER,
      activities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timeSlot: Type.STRING,
            activity: Type.STRING,
            location: Type.STRING,
            description: Type.STRING,
            whyGo: Type.STRING,
            price: Type.NUMBER,
            category: Type.STRING
          },
          required: ["timeSlot", "activity", "location", "description", "whyGo", "price"]
        }
      }
    },
    required: ["day", "activities"]
  }
}
```

### 7.4 Client-Side Sorting

After receiving the AI response, activities within each day are sorted chronologically by `timeSlot` to ensure correct display order regardless of model output.

### 7.5 Fallback

If the API key is not configured or the API call fails, a mock itinerary is generated from a predefined set of 12 Catarman activities, shuffled and partitioned across days.

---

## 8. Mobile & PWA

### 8.1 Capacitor (Android)

- **Capacitor version**: 8.x
- **Android Gradle Plugin**: 8.13.0
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 16)
- **Build**: `./gradlew assembleDebug` produces `android/app/build/outputs/apk/debug/app-debug.apk`

### 8.2 PWA

- **Service Worker**: Generated by `vite-plugin-pwa` using Workbox `generateSW` mode
- **Precached assets**: 54 entries (~14 MB)
- **Manifest**: App name "Catarman eSuroy", icon set, theme colors
- **Offline support**: Via service worker caching strategy

### 8.3 Build Pipeline

```
npm run build       → dist/     (Vite + Tailwind + PWA)
npx cap sync android → android/ (copy web assets + update plugins)
./gradlew assembleDebug → .apk  (APK output)
```

---

## 9. Configuration & Environment

### 9.1 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI planner | No (mock fallback) |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |

### 9.2 Firebase Configuration (`firebase-applet-config.json`)

```json
{
  "apiKey": "...",
  "authDomain": "gen-lang-client-0848563824.firebaseapp.com",
  "projectId": "gen-lang-client-0848563824",
  "storageBucket": "gen-lang-client-0848563824.firebasestorage.app",
  "messagingSenderId": "...",
  "appId": "..."
}
```

### 9.3 Capacitor Configuration (`capacitor.config.ts`)

```typescript
const config: CapacitorConfig = {
  appId: 'com.islandos.app',
  appName: 'Island OS',
  webDir: 'dist'
};
```

### 9.4 Vite Configuration (`vite.config.ts`)

- Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-pwa`
- Path alias: `@` → `src/`
- Gemini API key injected via `process.env` (loaded from dotenv)
- Conditional HMR for headless environments

---

## 10. Development & Deployment

### 10.1 Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Java JDK** ≥ 17 (for Android builds)
- **Android SDK** (for APK builds)
- **Firebase project** with Auth and Firestore enabled

### 10.2 Local Setup

```bash
# Clone and install
git clone https://github.com/kurtcode19/island_os.git
cd island_os
npm install

# Set up environment (create .env file)
cp .env.example .env
# Edit .env with your Firebase credentials and Gemini API key

# Run development server
npm run dev
# → http://localhost:3000

# Type check
npm run lint

# Production build
npm run build
```

### 10.3 Android Build

```bash
# Ensure Android SDK is installed and ANDROID_HOME is set
# Install required SDK components:
sdkmanager "platform-tools" "build-tools;36.0.0" "platforms;android-36"

# Build web app and sync
npm run cap:sync

# Build APK (requires JDK 17+)
cd android
export ANDROID_HOME=/path/to/android-sdk
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### 10.4 Firebase Seed Script

```bash
npx tsx scripts/seed-firestore.ts
```

Seeds static data (accommodations, transport, rentals, locations, businesses) to Firestore collections.

### 10.5 Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | TypeScript type check |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove `dist/` |
| `npm run cap:sync` | Sync web build to Capacitor |
| `npm run cap:open android` | Open Android project in Android Studio |
| `npm run cap:build` | Build web + sync to Capacitor |

### 10.6 Git Workflow

```
main        → Production releases
development → Active development branch
feature/*   → Feature branches (merge to development via PR)
```

All current changes should be committed to the `development` branch.

---

*End of document*

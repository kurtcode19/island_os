# Island OS — Investor Demo Guide

## Prerequisites

- Node.js 18+
- Android phone (for APK demo)
- Same WiFi network (if testing web-to-phone)

---

## Setup Before Demo

### 1. Enable Anonymous Auth in Firebase

1. Go to [Firebase Console → Authentication → Sign-in method](https://console.firebase.google.com/project/islandos/authentication/providers)
2. Find **Anonymous** → Enable → Save

Without this, the APK auth will fail silently.

### 2. Seed Firestore (optional, but recommended)

```bash
npx tsx scripts/seed-firestore.ts
```

Uploads 11 businesses, 8 accommodations, 3 transport options, and 5 locations to Firestore.

### 3. Ensure Images Exist

The app references images in `public/images/`. Verify with:

```powershell
Get-ChildItem -Path "public\images" -Name
```

Minimum required: `hero-sunken.png`, `old-spanish-church-ruins-big-tree.jpg`, `tuasan.jpg`, `travellersinn.png`, `coraldiveresort.jpg`, `camiguin-rent-a-scooters.jpg`, `multicab.jpeg`

### 4. Authorize Local Domain for Google Auth

In [Firebase Console → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/islandos/authentication/settings), add:
- `localhost`
- `127.0.0.1`
- Your local network IP (e.g. `192.168.x.x`)

---

## Running the Demo

### Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000` for desktop, or `http://<YOUR_IP>:3000/mobile` on your phone.

### Build the APK (for phone install)

```bash
npm run build
npx cap sync
cd android
.\gradlew.bat assembleDebug
```

APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

Transfer to phone and install (enable "Install from unknown apps" in Settings).

---

## Demo Script (~8-10 minutes)

### Part 1: The Vision (30s)

Open `http://localhost:3000` on desktop.

Landing page shows:
- Hero with island imagery
- "Smart Tourism Operating System" tagline
- Navigation across Stay, Transport, Rentals, Locations, AI Trip Planner

> *"This is Island OS — a complete digital ecosystem connecting tourists, businesses, and the local government. One platform for the entire visitor economy."*

### Part 2: Mobile Experience (3 min)

Navigate to `http://localhost:3000/mobile` (or open the APK on phone).

#### Onboarding
Hero screen → tap **"Explore Now"**.

#### Browse
- Category pills (Heritage, Nature, Adventure)
- "Trending Now" carousel (swipeable)
- Scroll through Popular Destinations (spots, stays, rentals)

> *"Tourists get a native-app experience right in the browser — no install required. PWA-enabled, works offline."*

#### Book a Stay
1. Tap a resort card (e.g. Catarman Coral Dive Resort)
2. Destination detail overlay → tap **"Start Trip"**
3. Select dates (tap check-in, tap check-out), adjust guests, toggle add-ons
4. Tap **"Book Now"**

> *"One tap books directly to Firestore in real-time. The business owner sees this on their dashboard instantly."*

After 2 seconds, auto-redirects to Profile tab showing the new booking with "Pay Now" button.

#### Profile Tab
Shows user avatar, name, booking count, "Claim a Business" link.

> *"The tourist manages everything from one place — bookings, digital pass, payments."*

### Part 3: Claim a Business (2 min)

Navigate to `http://localhost:3000/claim-business`.

1. Show directory with filter buttons: All, Accommodation, Rental, Transport
2. Each business shows type badge, location, tags
3. Select any business → tap to claim

> *"A resort owner registers themselves in 2 taps. No paperwork, no admin approval. They immediately get a full dashboard."*

Success banner appears → auto-redirects to dashboard.

### Part 4: Business Dashboard (2 min)

Navigate to `http://localhost:3000/business`.

#### Configurable by Type
- Sidebar icon and title match business type
- Only relevant modules appear:
  - **Accommodation**: Dashboard, Bookings, Inventory, Reviews, Check-In
  - **Rental**: Dashboard, Bookings, Inventory, Reviews
  - **Transport**: Dashboard, Bookings, Reviews

> *"The dashboard auto-configures based on business type."*

#### Analytics Home
- 4 stat cards (Revenue ₱84,200, 18 Active Bookings, 4.9 Satisfaction, System Active)
- Inventory quick-link
- Reviews card
- Recent Activity feed

#### Bookings Module
Navigate to `/business/bookings`. The booking made in Part 2 appears in real-time (Firestore listener, no refresh needed).

> *"When the tourist booked from their phone 2 minutes ago, it appeared here instantly. The business can confirm, check-in, or cancel with one click."*

#### Settings
Navigate to `/business/settings`. Shows business profile, type, active modules.

> *"Everything is configurable. The business controls their profile, visibility, notifications."*

### Part 5: The Full Ecosystem (1 min)

Quick tour of additional capabilities:

| Route | Feature |
|---|---|
| `/planner` | AI Trip Planner — 7-step chat interface, Gemini AI generates custom itineraries |
| `/pass` | Tourist Pass — digital QR pass, real-time status |
| `/government` | LGU Dashboard — visitor trends, origins pie chart, top destinations, density heatmap |

> *"The LGU gets the full picture — who's visiting, where they go, how much they spend. This is a smart city OS for tourism economies."*

---

## Key Selling Points for Investors

| Feature | Pitch |
|---|---|
| **Mobile-first** | PWA, no app store, works offline, instant loading |
| **Real-time** | Firestore syncs bookings across tourist, business, and LGU in milliseconds |
| **Configurable** | One platform serves accommodations, rentals, transport, shops — each gets tailored modules |
| **AI-powered** | Gemini trip planner generates personalized itineraries |
| **Role-based** | Tourist → Business → LGU — one login, different views |
| **Digital Pass** | QR-based tourist pass replaces paper, enables check-in tracking |
| **Zero paperwork** | Claim a business in 2 taps, dashboard ready immediately |
| **SOS/Emergency** | Built-in safety system with geolocation |

---

## What to Avoid in Demo

| Risk | Mitigation |
|---|---|
| Google Auth popup blocked | Tell browser to allow popups, or pre-sign-in before demo |
| Mobile bottom nav duplication | Stay on `/mobile` during mobile part |
| Empty chart data (Gov dashboard) | Acknowledge as "powered by real visitor data once deployed" |
| APK auth fails | Ensure Anonymous Auth is enabled in Firebase Console |
| Image 404s | Verify `public/images/` has the required files |

---

## Project Structure (Key Files)

```
src/
├── data/
│   ├── businesses.ts       # 11 businesses across 3 types
│   ├── accommodations.ts   # 8 stay options
│   ├── rentals.ts          # 5 vehicles from 2 merchants
│   └── transport.ts        # 3 transport options + ferry schedules
├── views/
│   ├── MobileAppView.tsx   # Mobile booking flow (onboarding → browse → book)
│   ├── ClaimBusinessView.tsx # Business claim flow with type directory
│   ├── BusinessDashboard.tsx # Configurable dashboard by business type
│   └── TripPlannerView.tsx # AI chat itinerary builder
├── components/
│   ├── mobile/             # Mobile UI components
│   └── business/           # Dashboard modules (Bookings, Inventory, etc.)
├── lib/
│   ├── capacitorAuth.ts    # Native platform detection
│   └── dataService.ts      # Firestore CRUD with static fallback
└── types/
    └── index.ts            # BusinessType, ServiceType, Booking, etc.
```

## Package Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npx cap sync` | Sync web build to Capacitor Android |
| `cd android && .\gradlew.bat assembleDebug` | Build APK |
| `npx tsx scripts/seed-firestore.ts` | Seed static data to Firestore |

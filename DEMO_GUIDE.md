# Island OS — Investor Demo Guide

## Prerequisites

- Node.js 18+
- Android phone (for APK demo)
- Same WiFi network (if testing web-to-phone)

---

## Pre-Demo Setup Checklist

### 1. Enable Anonymous Auth in Firebase

1. Go to [Firebase Console → Authentication → Sign-in method](https://console.firebase.google.com/project/islandos/authentication/providers)
2. Find **Anonymous** → Enable → Save

Without this, the APK auth will fail silently.

### 2. Seed Firestore

```bash
npx tsx scripts/seed-firestore.ts
```

Uploads 11 businesses, 8 accommodations, 3 transport options, and 5 locations to Firestore.

### 3. Ensure Images Exist

```bash
ls public/images/ | grep -E "hero-sunken|old-spanish-church|tuasan|travellersinn|coraldiveresort|camiguin-rent|multicab"
```

Minimum required:
- `hero-sunken.png`
- `old-spanish-church-ruins-big-tree.jpg`
- `tuasan.jpg`
- `travellersinn.png`
- `coraldiveresort.jpg`
- `camiguin-rent-a-scooters.jpg`
- `multicab.jpeg`

### 4. Authorize Local Domain for Google Auth

In [Firebase Console → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/islandos/authentication/settings), add:
- `localhost`
- `127.0.0.1`
- Your local network IP (e.g. `192.168.x.x`)

### 5. Pre-create Demo Accounts (Recommended)

Log into the app as a tourist first, make a booking, then claim a business. This pre-populates data so the demo flows smoothly:

1. Open `http://localhost:3000` → **Sign in with Google**
2. Navigate to `/stay` → book a stay (this creates real Firestore data)
3. Navigate to `/claim-business` → claim a business
4. Navigate to the claimed business dashboard → pre-add 2-3 inventory items (shows off the new persistence)
5. Navigate to `/government` to verify the LGU dashboard loads

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
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

Transfer to phone and install (enable "Install from unknown apps" in Settings).

---

## Demo Script (~12 minutes)

### Part 1: The Vision (45s)

Open `http://localhost:3000` on desktop.

**What to show:**
- Hero with island imagery and "Smart Tourism Operating System" tagline
- **"Start Exploring"** button → navigates to `/stay`
- **"Learn More"** button → navigates to `/how-it-works`
- Footer links now navigate to real pages:
  - Destinations → `/locations`
  - Experiences → `/stay`
  - Itineraries → `/planner`
  - About Us → `/how-it-works`
- **Search widget** — click "Search" → navigates to `/stay`

> *"This is Island OS — a complete digital ecosystem connecting tourists, businesses, and the local government. Every button works, every link goes somewhere real."*

---

### Part 2: Mobile Experience (3 min)

Navigate to `http://localhost:3000/mobile` (or open the APK on phone).

#### Onboarding
Hero screen → tap **"Explore Now"**.

#### Browse
- **Search bar** now filters spots, stays, and rentals in real-time as you type
- Category pills (Heritage, Nature, Adventure)
- "Trending Now" carousel (swipeable)
- **8-tab bottom nav**: Explore, Map, **Shops (new)**, **Transport (new)**, Rentals, **AI Planner (new)**, Pass, Profile

> *"Tourists get a native-app experience right in the browser — no install required. PWA-enabled, works offline. Everything is accessible from the bottom nav: shop local products, book transport, and plan with AI."*

#### Book a Stay
1. Tap a resort card (e.g. Catarman Coral Dive Resort)
2. Destination detail overlay → tap **"Start Trip"**
3. Select dates (tap check-in, tap check-out), adjust guests, toggle add-ons
4. Tap **"Book Now"**

> *"One tap books directly to Firestore in real-time. The business owner sees this on their dashboard instantly."*

After 2 seconds, auto-redirects to Profile tab showing the new booking with "Pay Now" button.

#### Pass Tab (enhanced)
- Real QR code generated per user (scan with any QR reader)
- Encodes `islandos://pass/{uid}` — verifiable at checkpoints
- Pass ID is user-specific, not hardcoded

> *"Every tourist gets a digital pass with a verifiable QR code. Businesses and LGU can scan this at any checkpoint — no paper, no manual entry."*

#### Profile Tab
Shows user avatar, name, booking count, "Claim a Business" link.

---

### Part 3: Claim a Business (2 min)

Navigate to `http://localhost:3000/claim-business`.

1. Show directory with filter buttons: All, Accommodation, Rental, Transport
2. Each business shows type badge, location, tags
3. Select any business → tap to claim

> *"A resort owner registers themselves in 2 taps. No paperwork, no admin approval. They immediately get a full dashboard."*

Success banner appears → auto-redirects to dashboard.

---

### Part 4: Business Dashboard (2.5 min)

Navigate to `http://localhost:3000/business`.

#### Configurable by Type
- Sidebar icon and title match business type
- Only relevant modules appear:
  - **Accommodation**: Dashboard, Bookings, Inventory, Reviews, Check-In
  - **Rental**: Dashboard, Bookings, Inventory, Reviews
  - **Transport**: Dashboard, Bookings, Reviews

> *"The dashboard auto-configures based on business type."*

#### Inventory Module (new — fully persisted)
- Click **"Add New Item"** → fill out name, category, price, stock
- Toggle amenities, add guest types and inclusion pricing
- Click **"Save Inventory Item"** → writes to Firestore `inventory_items`
- Item appears immediately in the grid — **refresh the page and it persists**
- Click **"Edit Details"** on any item → modify → save
- Click **X** to delete items

> *"Inventory management with full cloud persistence. Every item, every update saves to Firestore in real-time."*

#### Settings Module (new — functional)
- **Editable fields**: Business Name, Location, Contact, Email
- **Notification toggles**: Booking Alerts, New Reviews, Check-In Alerts — all functional
- **Sidebar tabs**: Profile, Notifications, Security, Billing, Integrations
- Click **"Save Settings"** → writes to Firestore `businesses/{businessId}`
- Changes persist across page refresh

> *"Businesses control their profile, notification preferences, and visibility — all saved to the cloud."*

#### Manual Earnings (new)
- From dashboard home, click **"Add Manual Entry"**
- Enter product name and amount
- Click **"Record Sale"** → writes to Firestore `manual_earnings` collection
- Useful for walk-in sales not captured by the system

#### Bookings Module
Navigate to `/business/bookings`. The booking made in Part 2 appears in real-time.

> *"When the tourist booked from their phone 2 minutes ago, it appeared here instantly. The business can confirm, check-in, or cancel with one click."*

---

### Part 5: Real-time Notifications (1 min)

- Open the business dashboard in one browser tab
- In another tab/window, make a booking as a tourist
- **Toast notification** appears on the business dashboard:
  > "New booking from [name] for [service]"
- **Bell icon** in the header shows a numbered badge — count of pending bookings

> *"Business owners get notified in real-time when new bookings come in. No refreshing, no polling, no missed opportunities."*

---

### Part 6: Tourist Booking Management (1 min)

Navigate to `http://localhost:3000/my-bookings`.

- Shows all bookings with status filters (All, Pending, Confirmed, Cancelled)
- **Cancel Booking** button (new) — available for pending bookings
  - Click → confirmation dialog → "Cancel this booking?"
  - Confirm → status updates to "cancelled" in Firestore
  - Re-renders in real-time with cancelled badge
- **"Pay Now"** button → simulates payment → status becomes "confirmed"
- **"Write Review"** button for paid bookings — star rating + comment
- **"Re-book"** button — navigates to the relevant booking page

> *"Tourists have full self-service control — cancel with a click, pay in demo, leave reviews. Reduces support calls to zero."*

---

### Part 7: LGU Dashboard (1.5 min)

Navigate to `http://localhost:3000/gouvernment`.

#### Analytics Home
- Real-time visitor count from Firestore bookings
- Active bookings count, revenue calculation
- Visitor trends line chart, visitor origins pie chart
- Top destinations with progress bars, visitor density heatmap

> *"The LGU gets the full picture — who's visiting, where they go, how much they spend."*

#### Port Module (improved)
- Search vessels by name, type, origin, or status — filters in real-time
- "Export Log" and "Manage Berths" buttons show proper feedback
- Berth status overview, weather alert panel

#### Safety Module
- **Broadcast Alert** (new): Click → modal opens with message input
  - Type alert message → click **"Send Broadcast"**
  - Simulated send with success confirmation
  - "This will notify all registered users" warning

> *"The LGU can broadcast emergency alerts to every registered user on the platform. Built-in safety infrastructure."*

#### Sidebar improvements
- **"Back to Site"** link — navigate back to the tourist-facing site
- **"Logout"** instead of "Terminate" for clarity

---

### Part 8: AI Trip Planner (1 min)

Navigate to `http://localhost:3000/planner`.

1. 7-step chat wizard: Duration → Group size → Transport → Pace → Interests → Style → Budget
2. Gemini AI generates a day-by-day itinerary
3. Each activity has action buttons:
   - **"Save to Pass"** — adds to tourist pass
   - **"Transport"** — find transport to that activity

> *"AI-powered trip planning that adapts to each visitor's unique preferences. Generates complete, bookable itineraries in seconds."*

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
| **SOS/Emergency** | Built-in safety system with geolocation + broadcast alerts |
| **Full CRUD** | Inventory, settings, earnings — all persisted to Firestore, not mock data |
| **Notifications** | Real-time booking alerts with toast and badge count |

---

## What to Say at Each Step (Elevator Pitches)

| Moment | Pitch |
|---|---|
| Landing page | *"A unified OS for the entire island tourism economy — tourist, business, and government, one platform."* |
| Mobile booking in under 30s | *"Three taps from browse to confirmed booking. Real-time sync to the business dashboard."* |
| Real QR pass | *"Replace paper forms with a scannable digital pass. Track movements, check-ins, departures."* |
| Inventory saves to cloud | *"Every item, every update, every sale — persisted in Firestore. Businesses never lose data."* |
| Cancel booking | *"Tourists self-serve cancellations. No calls, no manual intervention."* |
| Notification toast | *"Real-time event-driven architecture. Business knows the instant a booking happens."* |
| Broadcast Alert | *"LGU can reach every registered user in seconds during emergencies. Built-in safety infrastructure."* |
| AI Itinerary | *"Gemini AI creates personalized travel plans in seconds. Booking-ready, day-by-day itineraries."* |
| 8-tab mobile nav | *"Shops, transport, and AI planner — all accessible from the bottom nav without leaving the app."* |

---

## Role Switching During Demo

The app auto-assigns roles through the Claim Business flow:

| Step | Action | Role |
|---|---|---|
| 1 | Open app, sign in with Google | Tourist (default) |
| 2 | Browse & book | Tourist |
| 3 | Go to `/claim-business`, pick a business | Gets BUSINESS role |
| 4 | Go to `/business` | Business dashboard |
| 5 | Go to `/government` | LGU dashboard |

**For the LGU demo**, you need a user with `role: 'LGU'` in Firestore `users` collection. Either:
- Manually create it in Firestore Console with your email
- Or use the user `kurtmier123@gmail.com` which has special admin access per `firestore.rules`

---

## What to Avoid

| Risk | Mitigation |
|---|---|
| Google Auth popup blocked | Tell audience "Allow popups for this site" — or pre-sign in before demo starts |
| Demo laptop loses internet | Firebase requires connectivity for Firestore. Have a hotspot ready |
| Empty inventory on business dashboard | Pre-add 2-3 items before demo (use the working Add New Item form) |
| Mobile view looks cramped on projector | Use browser zoom (Ctrl+/-) or cast from a phone to screen |
| APK crashes on phone | Test the APK on the demo phone before the meeting. Enable "Install from unknown apps" |
| Investor asks "does payment work?" | *"Payment integration is pipeline-ready. We're evaluating local gateways like GCash and PayMongo for deployment."* |
| Investor asks "where does the data come from?" | *"Seeded with Catarman's actual businesses, accommodations, and locations. Live bookings sync in real-time from Firestore."* |

---

## Quick Emergency Recovery

| If | Do |
|---|---|
| Dev server crashes | `npm run dev` — restarts in ~2s |
| Firebase goes down | The static fallback data still renders most pages. Booking won't work |
| Forgot to sign in | Most features work without auth — booking flows prompt sign-in on submit |
| APK won't install | Open `http://[YOUR-IP]:3000/mobile` in Chrome on phone — PWA prompt appears |
| Button does nothing unexpected | Say: *"That connector is live in the next sprint."* and move to the next feature |

---

## Demo Flow Quick Reference Card

```
┌──────────────────────────────────────────────────────┐
│  1. Landing Page      ───  45s  ───  /               │
│  2. Mobile Explore    ───  90s  ───  /mobile          │
│  3. Mobile Book       ───  60s  ───  /mobile          │
│  4. Claim Business    ───  60s  ───  /claim-business  │
│  5. Business Dashboard ───  90s  ───  /business       │
│     ↳ Inventory (new)  ───  30s                       │
│     ↳ Settings (new)   ───  20s                       │
│     ↳ Earnings (new)   ───  10s                       │
│  6. Real-time Toast   ───  30s  (cross-tab demo)     │
│  7. My Bookings       ───  30s  ───  /my-bookings    │
│     ↳ Cancel (new)    ───  15s                       │
│  8. LGU Dashboard     ───  90s  ───  /government     │
│     ↳ Port Search     ───  15s                       │
│     ↳ Broadcast Alert ───  20s                       │
│  9. AI Planner        ───  60s  ───  /planner        │
└──────────────────────────────────────────────────────┘
```

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
│   ├── MobileAppView.tsx   # Mobile booking flow (8-tab nav, search filters, QR pass)
│   ├── LandingView.tsx     # Hero, experiences, footer with working links
│   ├── MyBookingsView.tsx  # Cancel booking, review, re-book, pay simulation
│   ├── BusinessDashboard.tsx # Configurable dashboard with notifications
│   └── GovernmentDashboard.tsx # Analytics, port, safety, broadcast
├── components/
│   ├── mobile/             # BottomNav (8 items), SearchBar (filtering), etc.
│   └── business/           # Inventory (Firestore), Settings (Firestore), etc.
├── lib/
│   ├── incidentService.ts  # SOS reporting, real-time incident feed
│   └── reviewService.ts    # Review submit, moderate, reply
└── types/
    └── index.ts            # BusinessType, Booking, Review, Incident, etc.
```

## Package Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npx cap sync` | Sync web build to Capacitor Android |
| `cd android && ./gradlew assembleDebug` | Build APK |
| `npx tsx scripts/seed-firestore.ts` | Seed static data to Firestore |

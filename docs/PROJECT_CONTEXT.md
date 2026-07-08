# Catarman eSuroy — Project Context for AI Development

## What This Is

**Catarman eSuroy** (code-named *Island OS*) is a smart tourism platform for **Catarman, Camiguin, Philippines**. It serves three roles under one app:

- **Tourists** — browse destinations, book stays/transport/rentals, AI trip planner, digital tourist pass, SOS
- **Business Owners** — dashboard for bookings, inventory, tours, reviews, analytics
- **LGU (Local Government)** — tourist registry, port ops, incident/safety monitoring, payments, reports, settlements

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6.2 |
| Styling | Tailwind CSS 4.1 |
| Routing | react-router-dom 7 |
| Backend | Firebase Auth + Firestore |
| AI | Google Gemini (`@google/genai`) |
| Mobile | Capacitor 8 (Android) + PWA (Workbox) |
| Maps | Leaflet + react-leaflet |
| Animations | Motion (Framer Motion 12) |
| Charts | Recharts |
| QR | qrcode.react + html5-qrcode |
| Notifications | Sonner |

## Project Structure

```
src/
├── App.tsx                    # Root: auth, routing, role state
├── AppRoutes.tsx              # All route defs + layout
├── firebase.ts                # Firebase init
├── types/index.ts             # All TS types
├── context/AuthContext.tsx     # useAuth() hook
├── lib/                       # Service layer (Firestore CRUD)
│   ├── passService.ts, checkinService.ts, capacityService.ts
│   ├── reviewService.ts, refundService.ts, profileService.ts
│   ├── incidentService.ts, auditService.ts, pilotService.ts
│   └── capacitorAuth.ts
├── data/                      # Static/seed data fallbacks
│   ├── accommodations.ts, businesses.ts, locations.ts
│   ├── transport.ts, rentals.ts, pilotBusinessData.ts
├── components/
│   ├── layout/                # Navigation, MobileBottomNav, MobileHeader, RoleNavigator
│   ├── shared/                # SOSButton, QRScanner, ReviewForm, DateGuestPicker, PriceCalculator
│   ├── business/              # AnalyticsModule, BookingsModule, InventoryModule, ToursModule, ReviewsModule, SettingsModule
│   ├── lgu/                   # PaymentModule, PortModule, RegistryModule, ReportsModule, SafetyModule, SettlementModule
│   ├── mobile/                # Header, BottomNav, SearchBar, CategoryPills, CardCarousel, DestinationDetail, OnboardingHero
│   ├── modals/                # OnboardingModal
│   ├── IslandMap.tsx, ProcessFlow.tsx, SearchWidget.tsx
├── views/                     # 14 page-level views
│   ├── LandingView, StayView, TransportView, RentalsView
│   ├── LocationsView, TripPlannerView, MyBookingsView
│   ├── TouristPassView, HowItWorksView, ClaimBusinessView
│   ├── CheckInView, BusinessDashboard, GovernmentDashboard, MobileAppView
docs/                          # Documentation
scripts/                       # Seed scripts (seed-demo.ts, seedPilot.ts)
```

## Core Data Types

- **UserRole**: `TOURIST | BUSINESS | LGU`
- **UserProfile**: `uid, name, email, role, businessId?, nationality?`
- **Booking**: `id, touristUid, serviceId, businessId, dates, guests, status, paymentStatus, amount, ticketCode, checkInTimestamp, addons, refundStatus`
- **BookingStatus**: `pending | confirmed | checked_in | cancelled | departed`
- **PaymentStatus**: `UNPAID | PAID | REFUNDED`
- **ServiceType**: `stay | transport | spot | tour | dining | shop | rental`
- **TouristPass**: `id, uid, passId (CTRM-P-YYYY-XXXX), issuedAt, expiresAt, status`
- **BusinessType**: `accommodation | rental | transport | service | shop`
- **PilotConfig**: `{ enabled: boolean, businessId: string }` — restricts app to single pilot business

## Firestore Collections

`users`, `bookings`, `passes`, `reviews`, `businesses`, `incidents`, `audit_logs`, `inventory_items`, `manual_earnings`, `system/pilot`

## Auth Flow

- Google Sign-In (popup with redirect fallback)
- Anonymous auth for Capacitor native
- Auto-profile creation on first login
- Auto-tourist-pass creation for tourists
- Role-based nav and route guards
- Mobile detection (`<768px`) triggers mobile layout or redirect

## Routing Overview

| Route | View | Role |
|---|---|---|
| `/` | Landing | Public |
| `/stay` | StayView | Tourist |
| `/transport` | TransportView | Tourist |
| `/rentals` | RentalsView | Tourist |
| `/locations` | LocationsView + IslandMap | Tourist |
| `/planner` | TripPlannerView (Gemini AI) | Tourist |
| `/my-bookings` | MyBookingsView | Tourist |
| `/pass` | TouristPassView (QR) | Tourist |
| `/check-in` | CheckInView (scanner) | Tourist/LGU |
| `/how-it-works` | HowItWorksView | Public |
| `/claim-business` | ClaimBusinessView | Public |
| `/mobile` | MobileAppView (tabbed) | Tourist |
| `/business/*` | BusinessDashboard | BUSINESS |
| `/government/*` | GovernmentDashboard | LGU |

## Key Business Logic

### Booking Flow
1. User selects dates + guests → `capacityService.checkAvailability()` checks Firestore
2. `PriceCalculator` computes total with 12% tax
3. Booking created in Firestore with status `pending`
4. Simulated payment → status becomes `confirmed`
5. Business dashboard sees real-time toast via `onSnapshot`
6. LGU scans QR pass at port → `checked_in`
7. On departure → `departed`

### Refund Flow
- Tourist requests cancellation → `refundStatus: 'requested'`
- Business approves/rejects via BookingsModule → `REFUNDED` or `CANCELLED`

### Pilot Mode
- When `system/pilot.enabled === true`, all Firestore queries filter by `pilot.businessId`
- Used for controlled demos with a single business

### Tourist Pass
- Auto-generated on signup, format: `CTRM-P-YYYY-XXXX`
- QR code links to `{origin}/pass/{passId}` for verification
- LGU can scan at port for check-in/departure

## Pricing Model

All prices include 12% tax breakdown shown in `PriceCalculator`:
- Subtotal (price × guests × nights)
- 12% tax line item
- Total

## Mobile Detection Strategy

- `lib/capacitorAuth.ts`: `isNativePlatform()` checks user agent for Capacitor
- `components/layout/RoleNavigator.tsx`: auto-redirects mobile users to `/mobile`
- Mobile layout is a tabbed PWA shell (Explore, Map, Mobility, Profile)

## Development Commands

```bash
npm run dev           # Vite dev on :3000
npm run build         # Production → dist/
npm run lint          # tsc --noEmit
npm run preview       # Preview dist/
npm run cap:sync      # Sync to Capacitor Android
npx tsx scripts/seed-demo.ts         # Seed demo data
npx tsx scripts/seedPilot.ts         # Enable pilot mode with demo business
```

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FIRESTORE_DATABASE_ID=  # optional named database
```

Config can also be loaded from `firebase-applet-config.json` (gitignored).

## State & Conventions

- **State management**: React context (`AuthContext`) + local component state + Firestore real-time subscriptions
- **No global state library** (no Redux/Zustand)
- **CSS**: Tailwind v4 `@theme` tokens, glassmorphism utilities, no CSS modules
- **Icons**: `@duo-icons/react` re-exported via `src/icons.tsx` as `Uil*` components
- **Imports**: `@/` alias maps to `src/`
- **API pattern**: Each `lib/*Service.ts` exports Firestore CRUD functions, not classes
- **Real-time**: Firestore `onSnapshot` used for bookings, reviews, incidents, passes

## Current Status (July 2026)

- All major features implemented and functional
- Pilot-ready with demo seed data
- Business dashboard has some hardcoded placeholder values (revenue, counts) pending real aggregation
- No Firebase Cloud Functions deployed — all logic is client-side
- No Firebase Hosting configured
- Firestore security rules allow broad authenticated access

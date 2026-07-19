# Catarman eSuroy — Smart Tourism OS

Single-page React app serving three roles in Catarman, Camiguin, Philippines.

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node 22+ (dev), Capacitor 8 (Android APK), PWA (Workbox) |
| Language | TypeScript 5.8 |
| Framework | React 19 |
| Build | Vite 6.2 + Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Animation | `motion` (Framer Motion 12) |
| Auth | Firebase Auth (Google Sign-In, Anonymous, Capacitor native) |
| DB | Firestore (real-time `onSnapshot` subscriptions) |
| AI | Google Gemini 2.0 Flash (`@google/genai`) |
| Maps | Leaflet + react-leaflet + MarkerCluster |
| Charts | Recharts |
| QR | html5-qrcode, qrcode.react |
| Icons | `@duo-icons/react` (re-exported via `src/icons.tsx`) |
| Toast | sonner |

## Roles

| Role | Access |
|------|--------|
| **Tourist** | Browse, book (stay/transport/rentals), AI trip planner, digital tourist pass (QR), SOS |
| **Business** | Dashboard: analytics, bookings, inventory, tours, reviews, settings |
| **LGU** | Dashboard: tourist registry, port ops, safety/incidents, payments, settlements, reports |

## Routes

| Path | View | Auth |
|------|------|------|
| `/` | LandingView | Public |
| `/stay` | StayView | Public |
| `/transport` | TransportView | Public |
| `/rentals` | RentalsView | Public |
| `/locations` | LocationsView + IslandMap | Public |
| `/planner` | TripPlannerView (Gemini) | Public |
| `/pass` | TouristPassView | Auth |
| `/my-bookings` | MyBookingsView | Auth |
| `/check-in` | CheckInView | Auth |
| `/claim-business` | ClaimBusinessView | Auth |
| `/how-it-works` | HowItWorksView | Public |
| `/mobile` | MobileAppView | Public |
| `/business/*` | BusinessDashboard | BUSINESS |
| `/government/*` | GovernmentDashboard | LGU |

## Key Entities

- **UserProfile** — uid, name, email, role (`TOURIST|BUSINESS|LGU`), businessId?
- **Booking** — touristUid, serviceId, businessId, dates, guests, status (`pending|confirmed|checked_in|cancelled|departed`), amount, paymentStatus, ticketCode, addons, refundStatus
- **TouristPass** — id, uid, passId (`CTRM-P-YYYY-XXXX`), issuedAt, expiresAt, status
- **Business** — id, name, ownerUid, type, category, verified
- **Review** — bookingId, rating, comment, approved, reply
- **Incident** — type (`sos|report`), lat/lng, status (`active|resolved`)
- **InventoryItem** — businessId, name, stock, maxStock

## Firestore Collections

`users`, `bookings`, `passes`, `reviews`, `businesses`, `incidents`, `audit_logs`, `inventory_items`, `settlements`, `port_logs`, `tourist_registry`, `system/pilot`

## Auth Flow

1. Firebase `onAuthStateChanged` in `App.tsx`
2. Auto-creates user doc + tourist pass on first sign-in
3. `AuthContext` exposes `{ user, profile, loading, login, logout }`
4. Login: Google popup (web) → redirect fallback; Anonymous (Capacitor)

## Business Logic

- **Booking flow**: select dates/guests → `capacityService.checkAvailability()` → price calc (12% tax) → create booking → pending → business confirms → QR issued → LGU scans at port → checked_in → departed
- **Refund flow**: tourist cancels → auto-approve if >48h before check-in, else manual review
- **Pilot mode**: `system/pilot.enabled` filters all queries to a single business
- **Mobile detection**: `<768px` auto-redirects to `/mobile` (tabbed PWA shell)

## Architecture

- **No global state lib** (Redux/Zustand) — React context + Firestore subscriptions
- **Service layer**: `lib/*Service.ts` exports Firestore CRUD functions (not classes)
- **Static data**: `src/data/*.ts` for accommodations, transport, rentals, locations, businesses
- **Route-level code splitting**: each view is a default export
- **Scroll-aware nav**: hides on scroll down, shows on scroll up

## Styling

- Tailwind v4 `@theme` tokens: `island-*` (brand), `tropic-*` (pastel travel palette)
- Glassmorphism: `.tropic-glass`, `.glass`, `.glass-dark`
- Fonts: Satoshi (UI), Cormorant Garamond (accent)
- Imports via `@/` alias → `src/`

## Current Status (July 2026)

- All core flows working (booking, pass, AI planner, SOS, dashboards)
- Firebase Cloud Functions: NOT deployed (all client-side)
- Real payments: NOT integrated (simulated)
- Firestore rules: broad authenticated access (needs hardening)

## Commands

```
npm run dev           # Vite dev on :3000
npm run build         # Production → dist/
npm run lint          # tsc --noEmit
npm run cap:sync      # Sync Capacitor Android
```

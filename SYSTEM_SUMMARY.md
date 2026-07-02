# Catarman eSuroy — Smart Tourism OS

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node 22+ (dev), Capacitor 8 (Android) |
| Language | TypeScript 5.8 |
| Framework | React 19 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Routing | React Router DOM 7 |
| Animation | `motion` (Framer Motion 12) |
| Auth | Firebase Authentication (Google Sign-In + Anonymous) |
| Database | Firestore |
| Icons | `@duo-icons/react` (re-exported via `src/icons.tsx`) |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet + MarkerCluster |
| PWA | vite-plugin-pwa + Workbox |
| AI | `@google/genai` (Gemini API) |
| QR | html5-qrcode, qrcode.react |
| Toast | sonner |
| Utils | clsx, tailwind-merge, date-fns (via react-datepicker) |

---

## Project Structure

```
island_os/
├── index.html                    # SPA entry
├── vite.config.ts                # Vite + React + Tailwind + PWA + path alias
├── tsconfig.json                 # @/ alias → ./src
├── package.json                  # scripts: dev, build, lint (tsc --noEmit), cap:sync
├── SYSTEM_SUMMARY.md             ← this file
│
├── public/                       # static assets, icons, PWA manifest icons
│
├── src/
│   ├── main.tsx                  # mount <App /> + SW registration
│   ├── App.tsx                   # Auth state, Firebase init, Router, Toaster
│   ├── AppRoutes.tsx             # all route definitions + Navigation/MobileBottomNav layout
│   ├── index.css                 # Tailwind v4 @theme, glassmorphism, custom utilities
│   ├── firebase.ts               # Firebase init, env/JSON config, error handler
│   ├── icons.tsx                 # Re-exports @duo-icons as Uil* or Missing SVG fallback
│   │
│   ├── types/
│   │   └── index.ts              # UserProfile, Booking, TouristPass, Business, Review, etc.
│   │
│   ├── context/
│   │   └── AuthContext.tsx        # useAuth() — user, profile, loading, login, logout
│   │
│   ├── lib/
│   │   ├── auditService.ts       # logEvent(action, resource, ...) → audit_logs collection
│   │   ├── passService.ts        # createPass, getPass, subscribeToPass
│   │   ├── checkinService.ts     # verifyPass, checkIn, departTourist
│   │   ├── incidentService.ts    # reportIncident, subscribeToIncidents, resolveIncident
│   │   ├── capacityService.ts    # checkAvailability(serviceId, date, guests)
│   │   ├── reviewService.ts      # submitReview, subscribe*, moderateReview, replyToReview
│   │   └── capacitorAuth.ts      # isNativePlatform() — detect Capacitor runtime
│   │
│   ├── data/                     # static seed/mock data
│   │   ├── accommodations.ts
│   │   ├── businesses.ts
│   │   ├── locations.ts
│   │   ├── transport.ts
│   │   ├── rentals.ts
│   │   └── processFlow.ts        # steps for "How It Works" section
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx       # Desktop top navbar (fixed, scroll-hide, role-based links)
│   │   │   ├── MobileBottomNav.tsx  # Mobile bottom tab bar (fixed, pill-shaped)
│   │   │   ├── MobileHeader.tsx     # Mobile top header (logo, bell, avatar)
│   │   │   └── RoleNavigator.tsx    # Auto-redirect based on role + device
│   │   │
│   │   ├── shared/
│   │   │   ├── SOSButton.tsx        # Emergency SOS floating button
│   │   │   ├── QRScanner.tsx        # QR code scanner for pass verification
│   │   │   ├── ReviewForm.tsx       # Star rating + comment form
│   │   │   ├── DateGuestPicker.tsx  # Check-in/out date + guest count
│   │   │   ├── SidebarItem.tsx      # Dashboard sidebar nav item
│   │   │   └── StatCard.tsx         # Analytics stat card
│   │   │
│   │   ├── business/               # Business dashboard modules
│   │   │   ├── AnalyticsModule.tsx
│   │   │   ├── BookingsModule.tsx
│   │   │   ├── InventoryModule.tsx
│   │   │   ├── ReviewsModule.tsx
│   │   │   ├── ToursModule.tsx
│   │   │   └── SettingsModule.tsx
│   │   │
│   │   ├── lgu/                     # LGU (local government) modules
│   │   │   ├── PaymentModule.tsx
│   │   │   ├── PortModule.tsx       # Port arrival/departure tracking
│   │   │   ├── RegistryModule.tsx   # Tourist registry
│   │   │   ├── ReportsModule.tsx
│   │   │   ├── SafetyModule.tsx     # Incident/SOS management
│   │   │   └── SettlementModule.tsx # Business settlement tracking
│   │   │
│   │   ├── mobile/                  # Mobile-specific components
│   │   │   ├── Header.tsx           # Reusable mobile page header
│   │   │   ├── BottomNav.tsx        # Alternate bottom nav variant
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CategoryPills.tsx
│   │   │   ├── CardCarousel.tsx
│   │   │   ├── DestinationDetail.tsx
│   │   │   └── OnboardingHero.tsx
│   │   │
│   │   ├── IslandMap.tsx            # Leaflet interactive map view
│   │   ├── ProcessFlow.tsx          # Step-by-step process display
│   │   └── SearchWidget.tsx         # Combined search component
│   │
│   └── views/                       # Page-level components (14 views)
│       ├── LandingView.tsx          # Homepage (hero, rentals, highlights, destinations, testimonial)
│       ├── StayView.tsx             # Accommodation listings + booking
│       ├── TransportView.tsx        # Transport bookings (ferry, van)
│       ├── RentalsView.tsx          # Vehicle rentals (scooter, bike, tricycle)
│       ├── LocationsView.tsx        # Points of interest / attractions
│       ├── TripPlannerView.tsx      # AI-powered itinerary planner
│       ├── MyBookingsView.tsx       # User's booking list
│       ├── TouristPassView.tsx      # Digital tourist pass
│       ├── HowItWorksView.tsx       # Platform guide
│       ├── ClaimBusinessView.tsx    # Business owner signup
│       ├── CheckInView.tsx          # QR check-in flow
│       ├── BusinessDashboard.tsx    # Business owner dashboard
│       ├── GovernmentDashboard.tsx  # LGO dashboard
│       └── MobileAppView.tsx        # Mobile web-app shell (tabs: explore, map, mobility, social, profile)
```

---

## Route Map

| Path | View Component | Role | Description |
|------|---------------|------|-------------|
| `/` | LandingView | Tourist | Hero + rentals + highlights + destinations + testimonial + footer |
| `/how-it-works` | HowItWorksView | All | Platform guide |
| `/stay` | StayView | Tourist | Browse/book accommodations |
| `/transport` | TransportView | Tourist | Book ferry/van transport |
| `/rentals` | RentalsView | Tourist | Rent scooters, bikes, tricycles |
| `/locations` | LocationsView | Tourist | Points of interest / map |
| `/planner` | TripPlannerView | Tourist | AI itinerary planner |
| `/pass` | TouristPassView | Tourist | View digital tourist pass |
| `/my-bookings` | MyBookingsView | Tourist | List of bookings |
| `/claim-business` | ClaimBusinessView | Tourist→Business | Business registration |
| `/check-in` | CheckInView | Tourist/Business | QR-based check-in |
| `/mobile` | MobileAppView | Tourist | Mobile web app (tabbed: explore, map, mobility, social, profile) |
| `/business/*` | BusinessDashboard | Business | Analytics, bookings, inventory, reviews, tours, settings |
| `/government/*` | GovernmentDashboard | LGU | Incidents, registry, port, payments, settlements, reports, safety |

**Layout behavior**: Navigation (desktop top bar) and MobileBottomNav render conditionally based on `location.pathname` and `isMobile` breakpoint (768px). Pages not on `/` or `/mobile` get `pt-20` to clear the fixed nav.

---

## Data Model

```ts
type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU'
type ServiceType = 'stay' | 'transport' | 'spot' | 'tour' | 'dining' | 'shop' | 'rental'
type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'departed'
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'
type PassStatus = 'active' | 'expired' | 'revoked'
type BusinessType = 'accommodation' | 'rental' | 'transport' | 'service' | 'shop'
type BusinessCategory = 'resort' | 'inn' | 'homestay' | 'motorcycle' | ... (14 total)
```

**Key entities** (see `src/types/index.ts` for full schemas):
- `UserProfile` — uid, name, email, role, businessId?
- `Booking` — id, touristUid, serviceId, businessId, dates, guests, status, paymentStatus, amount, ticketCode
- `TouristPass` — id, uid, passId (format: `CTRM-P-YYYY-XXXX`), issuedAt, expiresAt, status
- `Business` — id, name, ownerUid, type, category, description, contact, verified
- `Review` — bookingId, rating, comment, approved, reply
- `Incident` — type ('sos'|'report'), lat/lng, status ('active'|'resolved')
- `AuditLog` — actorUid, action, resource, details, timestamp
- `InventoryItem` — businessId, name, stock, maxStock, unit, category

---

## Firebase & Auth Flow

1. **Config**: `firebase-applet-config.json` at root (gitignored). Env vars `VITE_FIREBASE_*` override in production.
2. **Init**: `src/firebase.ts` — single `initializeApp`, optional named Firestore database ID.
3. **Auth**: Google Sign-In via popup (fallback to redirect). Anonymous + Capacitor native auth on Android.
4. **Profile sync**: `App.tsx` — `onAuthStateChanged` + `onSnapshot(doc('users', uid))`. Auto-creates profile + tourist pass on first login.
5. **Error handling**: `handleFirestoreError()` — structured error logging with auth context.

**Firestore collections used**: `users`, `bookings`, `passes`, `reviews`, `businesses`, `incidents`, `audit_logs`, `inventory`, `settlements`, `port_logs`, `tourist_registry`

---

## Styling Conventions

### Tailwind v4 Theme (`@theme` in `index.css`)

| Prefix | Purpose | Example |
|--------|---------|---------|
| `island-*` | Core brand colors (dark green, emerald, volcanic black, coral, etc.) | `bg-island-volcanic`, `text-island-emerald` |
| `tropic-*` | Pastel/travel app palette (green, sage, ocean, coral, sand, cream) | `bg-tropic-cream`, `text-tropic-ocean` |

### Custom CSS Classes

| Class | Effect |
|-------|--------|
| `.tropic-glass` | `bg-white/75` + `backdrop-blur(20px)` + border |
| `.glass` | `bg-white/70` + `backdrop-blur(24px)` + border |
| `.glass-dark` | `bg-island-green/80` + `backdrop-blur(24px)` |
| `.neumorph` | Dual shadow for soft 3D effect |
| `.btn-primary` | Dark green button with shadow + hover scale |
| `.btn-secondary` | White bordered button |
| `.tropic-shadow*` | Green-tinted box shadows |
| `.premium-shadow` | Soft green shadow for cards |
| `.card-hover` | Scale + lift + shadow on hover |
| `@utility *-gradient` | Linear gradient utilities (emerald, forest, ocean, volcanic, coral, sunset, etc.) |

### Fonts
- **Satoshi** (sans-serif) — headings, body, UI
- **Cormorant Garamond** (serif) — testimonial quotes, accent text

### Navbar (home page)
- Transparent with `backdrop-blur-xl` and subtle `bg-black/10` tint
- Dark gradient overlay at top (`from-black/30 to-transparent`, `h-24`, `z-40`)
- White inactive text, white active pill with black text
- No borders or shadows

### Common patterns
- Rounded elements: `rounded-full` (pills), `rounded-2xl`/`rounded-[2.5rem]` (cards/popups), `rounded-[3.5rem]`/`rounded-[4rem]` (hero cards)
- Uppercase + tracking-widest for labels/buttons
- Conditional classes use `location.pathname === '/'` to toggle dark-bg vs light-bg variants

---

## Icons

All icons are imported from `@/icons` which re-exports `@duo-icons/react` as `Uil*` components. Missing icons use a fallback SVG `Missing` component (circle with cross). Example:

```tsx
import { UilHome, UilStar, UilArrowRight } from '@/icons';
```

---

## Key Architectural Patterns

1. **Route-level code splitting**: Each view is a default export imported in `AppRoutes.tsx`.
2. **Real-time data**: Most Firebase reads use `onSnapshot` for live updates (bookings, passes, reviews, incidents).
3. **Role-based rendering**: `UserRole` controls nav links, dashboard access, and feature visibility throughout the app.
4. **Mobile detection**: `window.innerWidth < 768` determines `isMobile` state; `isMobile` hides desktop nav and shows `MobileBottomNav`.
5. **Page transitions**: `AnimatePresence` + `motion.div` wraps route content for fade/slide transitions.
6. **Auth-optional browsing**: Unauthenticated users can browse most tourist pages; auth required for bookings, dashboard, and profile.
7. **Scroll-aware nav**: Desktop nav hides on scroll down, shows on scroll up (via `useRef` + scroll listener).

## Development Commands

```bash
npm run dev         # Vite dev server on port 3000
npm run build       # Production build
npm run lint        # TypeScript type-check (tsc --noEmit)
npm run cap:sync    # Sync Capacitor Android
npm run cap:build   # Build + Capacitor sync
```

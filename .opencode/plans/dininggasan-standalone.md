# Dininggasan Standalone Site — Implementation Plan

## Goal
Make Dininggasan feel like a dedicated site within eSuroy — show rooms & services, 
enable booking, provide a branded admin dashboard. Keep eSuroy logo + "Powered by eSuroy".

## Files to Create

### 1. `src/views/DininggasanRoomView.tsx` — New dedicated room page
- Route: `/room`
- Shows room detail (photos placeholder, description, amenities grid)
- Booking widget: date picker, guest count slider, live price calc (₱3,800 × nights)
- Book button → creates Firestore booking for `dininggasan-catarman`
- Same Apple styling as other Dininggasan pages
- Back button → `/dininggasan`

### 2. `src/views/DininggasanServicesView.tsx` — New services page
- Route: `/services`
- Lists all services: Function Room, Pickleball Court, Sound System
- Each card: icon, title, description, pricing, "Book Now" button
- Function Room → `/function-room`, others → inline inquiry
- Apple styling matching the rest

## Files to Modify

### 3. `src/components/layout/Navigation.tsx`
- Hide role switcher when `isDininggasan`: wrap lines 167-204 in `{!isDininggasan && ( ... )}`
- Hide mobile role switcher when `isDininggasan`: wrap lines 347-377
- Hide "Claim Business" link when `isDininggasan`: wrap lines 234-243
- Keep eSuroy logo image + Dininggasan text
- Dininggasan nav items: add `/room` and `/services` items

### 4. `src/components/layout/MobileBottomNav.tsx`
- Import `getPilotConfig` / `isDininggasanPilot`
- When Dininggasan active: show `[Home (/dininggasan), Room (/room), Func. Room (/function-room), My Bookings (/my-bookings)]`
- Keep the black bar style, just swap nav items
- Hide "Plan with AI" button when Dininggasan active

### 5. `src/AppRoutes.tsx`
- Add import for `DininggasanRoomView` and `DininggasanServicesView`
- Add routes: `<Route path="/room" ...>` and `<Route path="/services" ...>`

### 6. `src/views/StayView.tsx`
- When `isDininggasanPilot`: swap emerald-600/700 colors for `#1d1d1f` / `#8b7355` in booking modal
- Specifically: header colors, room selection borders, price summary total, book button gradient
- Add a note at the top: "Want a simpler booking experience? View the dedicated room page →" linking to `/room`

### 7. `src/views/BusinessDashboard.tsx`
- When `isDininggasanPilot`: show "Dininggasan Admin" / "Dininggasan Dashboard" header
- The business name already loads from Firestore as "Dininggasan"
- Add a sidebar link for "Room Bookings" and "Function Room" for quick filtering
- Keep the rest of the dashboard (stats, bookings list, etc.) as-is since it already works

### 8. `src/views/DininggasanHome.tsx`
- Update the 3 service cards to link to correct paths:
  - Accommodation → `/room` (not `/stay`)
  - Pickleball → `/services` (not `/function-room`)
- Update CTA section buttons similarly
- Keep hero + amenities + map + footer as-is

## Implementation Order

| Step | File | What |
|------|------|------|
| 1 | `DininggasanRoomView.tsx` | Create |
| 2 | `DininggasanServicesView.tsx` | Create |
| 3 | `Navigation.tsx` | Hide role switcher + Claim Business |
| 4 | `MobileBottomNav.tsx` | Dininggasan-aware nav items |
| 5 | `AppRoutes.tsx` | Add /room and /services routes |
| 6 | `StayView.tsx` | Theme modal with Dininggasan colors |
| 7 | `BusinessDashboard.tsx` | Add Dininggasan branding |
| 8 | `DininggasanHome.tsx` | Update links to /room and /services |
| 9 | Build + typecheck | Verify everything works |

## Verification
- `npx tsc --noEmit` — no type errors
- `npm run build` — build succeeds

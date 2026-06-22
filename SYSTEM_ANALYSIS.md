# Island OS — System Use Case Analysis

## Overview

A smart tourism operating system for Catarman, Camiguin. Three user roles: **Tourist**, **Business Owner**, **LGU**. Built with React 19, TypeScript, Firebase, Tailwind CSS.

---

## Role: Tourist

### Use Cases

| Use Case | Status | Notes |
|---|---|---|
| Browse & Book Stay | ✅ Complete | Calendar, guests, add-ons, promo packages toggle |
| Book Transport | ✅ Complete | To/From/Within tabs, adults/children, vehicle, roundtrip |
| Shop & Order | ✅ Complete | Product listing, quantity selector, walk-in/delivery |
| AI Trip Planner | ✅ Complete | Gemini AI generates day-by-day itinerary |
| View My Bookings | ✅ Complete | Status filters, reviewable filter, re-book button |
| Digital Pass | ✅ Complete | QR code, status, download/share |
| SOS Emergency | ✅ Complete | GPS → Firestore → LGU real-time feed |
| Write Reviews | ✅ Complete | Modal form, linked to booking |

### Gaps

| Issue | Severity |
|---|---|
| Landing page Search button, "Learn More", footer links are dead | High |
| Post-booking redirect inconsistent (only landing page → My Bookings) | Medium |
| No "Cancel Booking" button for tourists | Medium |
| Payment is demo-only simulation | Medium |
| Mobile bottom nav missing AI Planner, Shops, Transport | Medium |
| Mobile Travel Pass QR is decorative, not real pass ID | Medium |
| Mobile search bar has no filtering logic | Medium |
| Mobile favorites/hearts not persisted | Low |

---

## Role: Business Owner

### Use Cases

| Use Case | Status | Notes |
|---|---|---|
| Claim a Business | ✅ Complete | Manual ID or directory picker |
| Manage Bookings | ✅ Complete | Real-time Firestore, confirm/cancel |
| Inventory Management | ⚠️ Partial | UI complete, **no Firestore persistence** |
| Manage Reviews | ✅ Complete | Read, reply, moderate |
| Check-In Scanner | ✅ Complete | QR scan → verify pass → check-in/depart |
| Manual Earnings Entry | ⚠️ Partial | UI exists, **no persistence** |
| Update Availability Prompt | ✅ Complete | 3-day reminder banner for shop type |
| Settings | ❌ Broken | No Save button, changes discarded |

### Gaps

| Issue | Severity |
|---|---|
| Inventory "Save" button does not write to Firestore | Critical |
| Settings has no save/persistence | Critical |
| Manual Earnings toast only, no Firestore write | Critical |
| Analytics dashboard uses hardcoded mock numbers | High |
| No notification toast for new incoming bookings | High |
| Tours module defined but unreachable (no business type includes it) | Medium |
| No navigation back to tourist site from dashboard | Medium |
| "Terminate" label instead of "Logout" | Low |

---

## Role: LGU / Government

### Use Cases

| Use Case | Status | Notes |
|---|---|---|
| Visitor Analytics | ✅ Complete | Real-time from Firestore bookings |
| Tourist Registry | ✅ Complete | Real-time searchable table |
| Incident / Safety Monitoring | ✅ Complete | Real-time SOS feed, resolve incidents |
| QR Check-In / Departure | ✅ Complete | Camera scan → verify → check-in/depart |
| Port Module | ❌ Broken | All static mock data, no Firebase |
| Reports & Analytics | ❌ Broken | All static mock data, no Firebase |
| Settings | ❌ Broken | Toggles decorative, no save |

### Gaps

| Issue | Severity |
|---|---|
| Port Module entirely static — search, filter, export all decorative | High |
| Reports Module entirely static — all charts fabricated | High |
| "Broadcast Alert" button has no implementation | Medium |
| No push/SMS/email notification for new SOS | Medium |
| Settings notification toggles are visual-only | Low |
| No audit log viewer UI (logs exist in Firestore) | Low |

---

## Summary

| Area | Completeness |
|---|---|
| Tourist flows | ~85% — core works, a few dead buttons |
| Business flows | ~60% — UI is there, data persistence is missing in key areas |
| LGU flows | ~65% — live data for analytics/registry/safety, port/reports are mock |
| SOS / Safety | ~95% — most complete flow in the system |
| QR Check-In | ~95% — most complete transactional flow |
| Data persistence | ~50% — bookings and reviews are real-time; inventory, settings, earnings are not persisted |
| Notification system | ~10% — bell icons are decorative, no push/SMS/email |
| Mobile feature parity | ~60% — missing AI Planner, Shops, Transport in bottom nav |

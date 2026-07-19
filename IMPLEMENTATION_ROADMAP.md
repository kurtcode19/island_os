# Implementation Roadmap

Based on requirements analysis (`REQUIREMENTS_ANALYSIS.md`). Phases ordered by impact vs effort.

---

## Phase 1 — Foundation (Week 1-2)

### 1.1 Firestore Security Rules (`firestore.rules`)
Scope bookings/businesses/passes to owners. Replace broad `isAuthenticated()` with per-document rules. Remove hardcoded admin email. **~1 file, 2h**

### 1.2 Server-Side Booking Validation (`functions/src/bookings/bookingTriggers.ts`)
Add capacity check + price recalculation + 12% tax validation inside `onBookingCreated` trigger. **~1 file, 4h**

### 1.3 Atomic Inventory (`functions/src/bookings/bookingTriggers.ts`)
Wrap booking confirmation in `runTransaction`. Decrement `InventoryItem.stock` atomically when booking is confirmed. **~1 file, 3h**

### 1.4 Firebase Custom Claims RBAC (`functions/src/auth/`)
Add `onUserCreate` trigger for initial claims. Add `createBusiness` callable that sets `role: 'BUSINESS'` via custom claims. Guard admin operations server-side. **~2 files, 4h**

### 1.5 Wire Payment Gateways (`src/views/StayView.tsx`, `TransportView.tsx`, `RentalsView.tsx`, `MobileAppView.tsx`)
After booking creation (client writes doc), redirect to Stripe payment modal or PayMongo checkout URL instead of just setting `paymentStatus: 'UNPAID'`. Only mark `confirmed` via webhook. **~4 files, 6h**

### 1.6 Server-Side Refund Auto-Approval (`functions/src/bookings/bookingTriggers.ts`)
Move the 48h check from `refundService.ts` into the cloud function trigger on booking cancellation. **~1 file, 2h**

**Phase 1 total: ~10 files, 21h**

---

## Phase 2 — Quality of Life (Week 3-4)

### 2.1 Offline Persistence (`src/App.tsx`, `src/index.css`)
Enable Firestore `enableMultiTabIndexedDbPersistence`. Add offline banner component. **~2 files, 3h**

### 2.2 Server-Side Audit with IP (`functions/src/audit/`)
New callable function `logAuditEvent` that captures `context.rawRequest.ip`. Move critical audit logging server-side. **~2 files, 3h**

### 2.3 Business Approval Flow (`functions/src/businesses/`, `ClaimBusinessView.tsx`)
Add LGU approval UI to GovernmentDashboard. Server function sets `verified: true`. Pending banner in business dashboard. **~3 files, 5h**

### 2.4 Port Log Automation (`functions/src/checkin/`)
On `booking.checked_in` status change, write to `port_logs` collection. Bulk scan mode in CheckInView. **~2 files, 4h**

---

## Phase 3 — Trust & Retention (Week 5-6)

### 3.1 Automated Booking Reminders
FCM token registration in `main.tsx`. Scheduled function sending push notifications for upcoming check-ins. **~3 files, 6h**

### 3.2 Multilingual Support
Install `react-i18next`. Create `en/translation.json` and `fil/translation.json`. Wrap UI text. Language switcher in nav. **~20+ files (wide touch), 12h**

### 3.3 Tangible Pass Incentives
Add `discountPercent` to business doc. Show discount in TouristPassView. Business toggle. **~3 files, 4h**

---

## Phase 4 — Responsive UI (Week 7)

### 4.1 Remove /mobile Auto-Redirect
Merge MobileAppView content into main views using Tailwind responsive classes (`hidden md:block`, `block md:hidden`). Remove mobile redirect from RoleNavigator. **~5 files, 12h**

---

## Phase 5 — Scale (Week 8+)

| Requirement | Effort |
|-------------|--------|
| Full-text search (Algolia) | 8h |
| Predictive analytics (Gemini) | 8h |
| Dynamic business CMS | 12h |
| Settlement PDF/CSV reports | 6h |
| WhatsApp/Viber integration | 2h |
| Dark mode + WCAG | 8h |
| Disaster mode | 10h |
| Privacy consent flow | 3h |
| Firestore backups | 2h |
| Cost monitoring | 3h |
| Feedback widget | 3h |

---

## Critical Path

```
Phase 1.1 (rules) ─┬─ 1.2 (validation) ── 1.3 (atomic) ── 1.5 (payments)
                    └─ 1.4 (claims) ───── 1.6 (refunds)
                                          └─ 2.3 (approval)
```

Phase 1 must complete before any real-money bookings flow through the system. Phases 2-5 can partially overlap.

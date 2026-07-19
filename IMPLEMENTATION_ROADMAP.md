# Implementation Roadmap

Based on requirements analysis (`REQUIREMENTS_ANALYSIS.md`). Phases ordered by impact vs effort.

---

## Phase 1 — Foundation (Week 1-2)

### 1.1 Firestore Security Rules (`firestore.rules`)
Scope bookings/businesses/passes to owners. Replace broad `isAuthenticated()` with per-document rules. Remove hardcoded admin email. **~1 file, 2h**

### 1.2 Server-Side Booking Validation (`functions/src/bookings/bookingTriggers.ts`)
Add capacity check + price recalculation + 12% tax validation inside `onBookingCreated` trigger. **~1 file, 4h — DONE**

### 1.3 Atomic Inventory (`functions/src/bookings/bookingTriggers.ts`)
Wrap booking confirmation in `runTransaction`. Decrement `InventoryItem.stock` atomically when booking is created with `paymentStatus: 'PAID'`. Matches inventory by `businessId` and optional `roomName`. **~1 file, 3h — DONE**

### 1.4 Firebase Custom Claims RBAC (`functions/src/auth/setupClaims.ts`)
Add `onUserCreated` trigger for initial claims. Add `createBusiness` callable that sets `role: 'BUSINESS'` via custom claims and updates Firestore. Guard admin operations server-side. **~2 files, 4h — DONE**

### 1.5 Auto-Confirm Bookings (Demo Mode)
All bookings set `paymentStatus: 'PAID'` on creation. No payment gateway integration. **~8 files, 2h**

### 1.6 Server-Side Refund Auto-Approval (`functions/src/bookings/bookingTriggers.ts`)
Move the 48h check from `refundService.ts` into the cloud function trigger on booking cancellation. Auto-approves if cancelled >48h before check-in. Also restores inventory on refund approval. **~1 file, 2h — DONE**

**Phase 1 total: ~10 files, 17h — ALL DONE**

---

## Phase 2 — Quality of Life (Week 3-4)

### 2.1 Offline Persistence (`src/App.tsx`, `src/index.css`)
Enable Firestore `enableMultiTabIndexedDbPersistence`. Add offline banner component. **~2 files, 3h — DONE**

### 2.2 Server-Side Audit with IP (`functions/src/audit/logAuditEvent.ts`)
New callable function `logAuditEvent` that captures `context.rawRequest.ip` and user-agent. **~2 files, 3h — DONE**

### 2.3 Business Approval Flow (`functions/src/businesses/approveBusiness.ts`, `BusinessApprovalModule.tsx`)
Add LGU approval UI to GovernmentDashboard. Server function sets `verified: true`. Pending banner in business dashboard. **~3 files, 5h — DONE**

### 2.4 Port Log Automation (`functions/src/bookings/bookingTriggers.ts`)
On `booking.checked_in` status change, write to `port_logs` collection. **~1 file, 4h — DONE**

---

## Phase 3 — Trust & Retention (Week 5-6)

### 3.1 Automated Booking Reminders
FCM token registration in `main.tsx`. Scheduled function sending push notifications for upcoming check-ins. **~3 files, 6h**

### 3.2 Multilingual Support
Install `react-i18next`. Create `en/translation.json` and `fil/translation.json`. Wrap UI text. Language switcher in nav. **~20+ files (wide touch), 12h**

### 3.3 Tangible Pass Incentives
Add `discountPercent` to business doc. Show discount in TouristPassView. Business toggle in SettingsModule integrations tab. **~3 files, 4h — DONE**

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
| Privacy consent flow | 3h — DONE |
| Firestore backups | 2h |
| Cost monitoring | 3h |
| Feedback widget | 3h — DONE |

---

## Critical Path

```
Phase 1.1 (rules) ─┬─ 1.2 (validation) ── 1.3 (atomic) ── 1.5 (auto-confirm)
                    └─ 1.4 (claims) ───── 1.6 (refunds)
                                          └─ 2.3 (approval)
```

Phase 1 is complete — all foundation items implemented. Demo-ready. Phases 2-5 can partially overlap.

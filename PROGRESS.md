# Progress Tracker — eSuroy Tourism Platform

Last updated: July 19, 2026 | Branch: `MSMEs` | Next demo: 2 days

---

## Legend

- ✅ **DONE** — fully implemented and compiling
- 🔶 **PARTIAL** — partially implemented or needs real keys/config
- ⬜ **NOT STARTED** — not yet begun

---

## Requirements — 30 Total

### P0: Launch-Critical (10) — 8 ✅, 1 🔶, 1 ⬜

| # | Requirement | Status |
|:--|:------------|:-------|
| REQ-001 | Real Payment Gateway | 🔶 Stripe/PayMongo code dormant; demo mode auto-sets PAID |
| REQ-002 | Server-Side Booking Validation | ✅ `onBookingCreated` — capacity, conflicts, amounts |
| REQ-003 | Atomic Inventory Deduction | ✅ `runTransaction` on paid bookings; restore on refund |
| REQ-004 | Firestore Row-Level Security | ✅ Per-collection ownership scoping |
| REQ-005 | RBAC (Custom Claims) | ✅ `onUserCreated` + `createBusiness` callable |
| REQ-006 | Offline-First PWA Cache | ✅ `enableMultiTabIndexedDbPersistence` + banner |
| REQ-007 | Unified Responsive UI | ⬜ Still redirects <768px to `/mobile` |
| REQ-008 | Business Onboarding | ✅ Claim → LGU approve → verified |
| REQ-009 | Real QR Pass Utility | ✅ Generation, scanning, check-in/depart |
| REQ-010 | Audit Trail | ✅ `logAuditEvent` with IP + user-agent |

### P1: Retention & Trust (7) — 5 ✅, 0 🔶, 2 ⬜

| # | Requirement | Status |
|:--|:------------|:-------|
| REQ-011 | Multilingual (EN/FIL) | ⬜ No i18n setup |
| REQ-012 | Pass Incentives | ✅ `discountPercent` on business; badges in TouristPassView |
| REQ-013 | Booking Reminders | ⬜ No FCM push or email |
| REQ-014 | LGU Port Logs | ✅ Auto-write on check-in |
| REQ-015 | Review Moderation | ✅ Business approve/reject in ReviewsModule |
| REQ-016 | SOS Geo-Tagging | ✅ GPS + SafetyModule map |
| REQ-017 | Auto-Refund Policy | ✅ >48h auto-approve + inventory restore |

### P2: Scalability (7) — 0 ✅, 2 🔶, 5 ⬜

| # | Requirement | Status |
|:--|:------------|:-------|
| REQ-018 | Full-Text Search | ⬜ No Algolia/Firestore index |
| REQ-019 | Predictive Analytics | ⬜ No ML/Gemini forecasting |
| REQ-020 | Dynamic CMS | 🔶 SettingsModule partial; data in static files |
| REQ-021 | Settlement Reports | 🔶 Ledgers exist; no PDF/CSV export |
| REQ-022 | WhatsApp/Viber | ⬜ No deep links |
| REQ-023 | Dark Mode & WCAG | ⬜ Not started |
| REQ-024 | Disaster Mode | ⬜ Not started |

### P3: Operational (6) — 2 ✅, 0 🔶, 4 ⬜

| # | Requirement | Status |
|:--|:------------|:-------|
| REQ-025 | Privacy Consent | ✅ Onboarding checkbox + profile timestamp |
| REQ-026 | Defined SLA | ⬜ No document |
| REQ-027 | Community Training | ⬜ Not a code item |
| REQ-028 | Disaster Recovery | ⬜ No Firestore backups |
| REQ-029 | Cost Monitoring | ⬜ No billing alerts |
| REQ-030 | Feedback Loop | ✅ Floating widget with star rating |

### Totals

| | Met | Partial | Not Met |
|--|-----|---------|---------|
| Before session | 2 | 8 | 20 |
| **Now** | **15** | **3** | **12** |

---

## Implementation Roadmap — Phases

### Phase 1: Foundation ✅ ALL DONE

| Item | Status |
|:-----|:-------|
| 1.1 Firestore Security Rules | ✅ |
| 1.2 Server-Side Booking Validation | ✅ |
| 1.3 Atomic Inventory | ✅ |
| 1.4 Custom Claims RBAC | ✅ |
| 1.5 Auto-Confirm (Demo Mode) | ✅ |
| 1.6 Refund Auto-Approval | ✅ |

### Phase 2: Quality of Life ✅ ALL DONE

| Item | Status |
|:-----|:-------|
| 2.1 Offline Persistence | ✅ |
| 2.2 Server-Side Audit w/ IP | ✅ |
| 2.3 Business Approval Flow | ✅ |
| 2.4 Port Log Automation | ✅ |

### Phase 3: Trust & Retention — 1 ✅, 2 ⬜

| Item | Status |
|:-----|:-------|
| 3.1 Booking Reminders (FCM) | ⬜ |
| 3.2 Multilingual (i18n) | ⬜ |
| 3.3 Pass Incentives | ✅ |

### Phase 4: Responsive UI — ⬜

| Item | Status |
|:-----|:-------|
| 4.1 Remove /mobile redirect | ⬜ |

### Phase 5: Scale — 2 ✅, 8 ⬜

| Item | Status |
|:-----|:-------|
| Full-text search | ⬜ |
| Predictive analytics | ⬜ |
| Dynamic CMS | ⬜ |
| Settlement exports | ⬜ |
| WhatsApp/Viber | ⬜ |
| Dark mode + WCAG | ⬜ |
| Disaster mode | ⬜ |
| Privacy consent | ✅ |
| Firestore backups | ⬜ |
| Cost monitoring | ⬜ |
| Feedback widget | ✅ |

---

## Quick Start Commands

```bash
npm run dev        # Vite dev on :3000
npm run build      # Production build
npm run lint       # TypeScript type check
cd functions
npm run build      # Compile cloud functions
```

## Key Branches

- `MSMEs` — current work branch (pushed to origin)
- `origin/main` — stable production

## Demo Readiness

All 6 Phase 1 items + all 4 Phase 2 items + Phase 3.3 (Pass Incentives) + Phase 5 privacy/feedback = **core demo flow works end-to-end** without real payment keys.

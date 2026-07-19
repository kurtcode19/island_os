# Requirements Fulfillment Analysis

Analysis of 30 requirements against current system state (July 2026).

---

## Phase 0: Launch-Critical (P0) — 10 requirements

| ID | Requirement | Status | Evidence |
|:---|:---|:---|:---|
| **REQ-001** | Real Payment Gateway Integration | **PARTIAL** | Stripe + PayMongo integrations exist in `functions/src/payments/` with webhooks, but many booking flows still use simulated `paymentStatus: 'UNPAID'` directly in client-side code (`StayView.tsx:654`, `TransportView.tsx:55`, etc.). No booking enforces payment before `confirmed` status client-side. |
| **REQ-002** | Server-Side Booking Validation | **PARTIAL** | Cloud Functions exist (`bookingTriggers.ts` handles auto-cancel after 24h, auto-refund after 48h). But capacity checks, pricing, and 12% tax are calculated client-side in `capacityService.ts` and various views — **never** validated server-side. |
| **REQ-003** | Atomic Inventory Deduction | **NOT MET** | No `runTransaction` calls found anywhere. `capacityService.ts` uses simple `getDocs` — race conditions can double-book. No inventory deduction on booking confirmation. |
| **REQ-004** | Strict Firestore Row-Level Security | **NOT MET** | `firestore.rules` allows broad authenticated access: `bookings` are readable/writable by ANY authenticated user. No per-user scoping for tourists. Businesses can read all businesses. LGU is hardcoded email check (`kurtmier123@gmail.com`) rather than role-based. |
| **REQ-005** | RBAC with Firebase Custom Claims | **NOT MET** | No `setCustomUserClaims` calls. Roles are stored in Firestore `users/{uid}.role` — easily spoofed client-side. No server-side route guard. |
| **REQ-006** | Offline-First PWA Cache | **PARTIAL** | Service worker configured in `vite.config.ts` with Workbox `generateSW`, firestore-cache via `NetworkFirst` strategy (300s TTL, 50 entries). But no graceful Firestore-offline UI — `onSnapshot` errors are silently logged. |
| **REQ-007** | Unified Responsive UI (Remove /mobile redirect) | **NOT MET** | `RoleNavigator.tsx` still auto-redirects screens <768px to `/mobile`. Two separate UI codebases (`AppRoutes.tsx` desktop layout vs `MobileAppView.tsx` tabbed shell). Not a single responsive layout. |
| **REQ-008** | Business Onboarding Workflow | **PARTIAL** | `ClaimBusinessView.tsx` exists — auto-sets `role: 'BUSINESS'` and `businessId` on user doc. But no LGU approval step: `verified: false` is set but never displayed as a "Pending Verification" banner anywhere in the business dashboard. |
| **REQ-009** | Real QR Pass Utility | **MET** | `passService.ts` generates `CTRM-P-YYYY-XXXX` IDs. `checkinService.ts` has `verifyPass()`, `checkIn()`, `departTourist()`. `CheckInView.tsx` scans QR and triggers status updates. |
| **REQ-010** | Audit Trail for Monetary Actions | **PARTIAL** | `auditService.ts` logs actions to `audit_logs` collection with `actorUid`, `timestamp`, etc. But logs are created client-side (spoofable). Webhook handlers in cloud functions also write audit logs server-side. No IP address captured. |

**P0 summary: 0 fully met, 4 partial, 6 not met**

---

## Phase 1: Retention & Trust (P1) — 7 requirements

| ID | Requirement | Status | Evidence |
|:---|:---|:---|:---|
| **REQ-011** | Multilingual Support (EN & FIL) | **NOT MET** | No `react-i18next` or i18n setup found. All UI hardcoded in English. |
| **REQ-012** | Tangible Pass Incentives | **NOT MET** | No discount generation, stamp collection, or pass-perk toggle in business dashboard. Pass is purely informational. |
| **REQ-013** | Automated Booking Reminders | **NOT MET** | No FCM push notifications or email integration. No `firebase-messaging` `getToken` calls. Business dashboard has notification toggle settings but no actual send mechanism. |
| **REQ-014** | LGU Port Log Automation | **PARTIAL** | `PortModule.tsx` exists with vessel tracking. The check-in flow (`checkinService.ts`) writes to `bookings` but not to `port_logs` collection. No bulk-scan mode. |
| **REQ-015** | Review Moderation Workflow | **MET** | `ReviewsModule.tsx` shows pending reviews. `reviewService.ts`: `moderated: false`, `approved: false` by default. Business can approve/reject reviews. |
| **REQ-016** | SOS Geo-Tagging & Routing | **MET** | `incidentService.ts` captures GPS coordinates (`navigator.geolocation.getCurrentPosition`). `SafetyModule.tsx` displays incidents on a Leaflet map. Status `active`/`resolved`. |
| **REQ-017** | Automated Refund Policy | **PARTIAL** | `refundService.ts` has `processRefundEligibility()` check for >48h window (client-side). Server-side: `processCancellationWindow` scheduled function auto-approves refunds after 48h of business inactivity. But the >48h auto-approve on booking cancellation is client-only. |

**P1 summary: 2 fully met, 2 partial, 3 not met**

---

## Phase 2: Scalability (P2) — 7 requirements

| ID | Requirement | Status | Evidence |
|:---|:---|:---|:---|
| **REQ-018** | Full-Text Search | **NOT MET** | No Algolia, Elasticsearch, or Firestore search indexing. All filtering is client-side array `.filter()`. |
| **REQ-019** | Predictive Tourist Flow Analytics | **NOT MET** | No ML model or Gemini-based forecasting. `AnalyticsModule.tsx` shows historical Recharts only. |
| **REQ-020** | Dynamic Business CMS | **PARTIAL** | `SettingsModule.tsx` allows some config updates. But photos, room rates, and tour descriptions are mostly hardcoded in `src/data/*.ts` static files. Business cannot fully manage their own content. |
| **REQ-021** | Settlement Reports Generation | **PARTIAL** | `SettlementModule.tsx` shows ledgers and triggers payouts via cloud functions. But no downloadable PDF/CSV report; no automated commission/ environmental fee calculations in the UI. |
| **REQ-022** | WhatsApp / Viber Integration | **NOT MET** | No WhatsApp/Viber deep links anywhere. Contact buttons use generic phone number display. |
| **REQ-023** | Dark Mode & Accessibility | **NOT MET** | No dark mode, no `prefers-color-scheme` detection, no WCAG 2.1 AA compliance measures. |
| **REQ-024** | Disaster Mode | **NOT MET** | No LGU toggle for emergency mode. No evacuation routes or mass SOS alerts. `SafetyModule.tsx` references "emergency broadcast" in a comment but no implementation. |

**P2 summary: 0 fully met, 2 partial, 5 not met**

---

## Phase 3: Operational (P3) — 6 requirements

| ID | Requirement | Status | Evidence |
|:---|:---|:---|:---|
| **REQ-025** | Data Privacy Consent Flow | **NOT MET** | No privacy consent modal. No data collection notice displayed to users on first launch. |
| **REQ-026** | Defined SLA | **NOT MET** | No SLA document found. |
| **REQ-027** | Community Training Program | **NOT MET** | Not a code requirement — no evidence of training materials in repo. |
| **REQ-028** | Disaster Recovery Plan | **NOT MET** | No automated Firestore backup to GCS. No restoration runbook. |
| **REQ-029** | Cost Monitoring & Budget Cap | **NOT MET** | No billing alerts configured in code. No circuit breaker for cost spikes (e.g., disabling AI planner). |
| **REQ-030** | Feedback Loop Mechanism | **NOT MET** | No "Rate this feature" widget. No structured feedback collection after booking or trip plan. |

**P3 summary: 0 fully met, 0 partial, 6 not met**

---

## Overall

| Phase | Met | Partial | Not Met | Total |
|-------|-----|---------|---------|-------|
| P0 (Launch-Critical) | 0 | 4 | 6 | 10 |
| P1 (Retention & Trust) | 2 | 2 | 3 | 7 |
| P2 (Scalability) | 0 | 2 | 5 | 7 |
| P3 (Operational) | 0 | 0 | 6 | 6 |
| **Total** | **2** | **8** | **20** | **30** |

**Key gaps preventing launch (P0):**
- No server-side validation for booking capacity, pricing, or refund eligibility
- No atomic transactions for inventory — double-booking possible
- Firestore rules allow any authenticated user to read/write any booking
- No custom claims — role stored in Firestore doc, spoofable client-side
- `/mobile` redirect splits the codebase into two UIs instead of responsive design
- Payments are simulated in most booking paths; real gateway not enforced

**What works well:**
- QR pass check-in/check-out flow (REQ-009)
- Review moderation workflow (REQ-015)
- SOS geo-tagged incident reporting with map display (REQ-016)
- Cloud Functions code exists for Stripe/PayMongo webhooks, payout scheduling, auto-cancellation — but not yet deployed or integrated with client flows
- CSV export exists in BookingsModule

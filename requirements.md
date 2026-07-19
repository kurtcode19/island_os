Here is a structured, actionable list of **fulfillment requirements** for Catarman eSuroy, prioritized by what is **critical for launch (P0)**, what is **essential for retention (P1)**, and what is **nice-to-have for scaling (P2)**. 

Each requirement is written as a verifiable statement to guide your development and QA teams.

---

### Phase 0: Launch-Critical Requirements (P0 – Must work before public release)

These are non-negotiable fixes to the "Critical Gaps" identified in the previous analysis.

| ID | Requirement | Category | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-001** | **Real Payment Gateway Integration** | Functional | The system must integrate with a Philippine-accessible gateway (e.g., PayMongo, GCash API, or Stripe). Bookings must require a successful payment (deposit or full) before Firestore writes a `confirmed` status. |
| **REQ-002** | **Server-Side Booking Validation** | Technical | All capacity checks, pricing calculations (including 12% tax), and cancellation rules must be executed in Firebase Cloud Functions (or a backend API), *never* solely on the client. |
| **REQ-003** | **Atomic Inventory Deduction** | Data Integrity | When a booking is confirmed, the associated `InventoryItem.stock` must decrement atomically (using Firestore Transactions) to prevent double-booking during race conditions. |
| **REQ-004** | **Strict Firestore Row-Level Security** | Security | Firestore rules must explicitly restrict access: <br> - `Tourists`: Read only own `bookings` and `passes`. <br> - `Businesses`: Read/Write only their own `businesses` and `inventory_items`. <br> - `LGU`: Write only to `incidents` and `port_logs`; Read all non-PII aggregate data. |
| **REQ-005** | **Role-Based Access Control (RBAC)** | Security | Use Firebase Custom Claims to assign roles (`TOURIST`, `BUSINESS`, `LGU`) on the backend. The React router must reject unauthorized route access server-side (or via a secure loader) to prevent client-side role spoofing. |
| **REQ-006** | **Offline-First PWA Cache** | Technical | The service worker (Workbox) must cache the app shell, static assets, and the user’s active bookings/pass. The app must not throw a white-screen error when Firestore is unreachable. |
| **REQ-007** | **Unified Responsive UI (Remove /mobile redirect)** | UX | The app must adapt responsively down to 320px width using Tailwind breakpoints. The auto-redirect to a separate `/mobile` route must be removed to maintain a single codebase and consistent state. |
| **REQ-008** | **Business Onboarding Workflow** | Functional | A "Claim Business" flow must exist where owners submit a claim -> LGU approves via dashboard -> the `Business` document is linked to the owner's `uid`. Unverified businesses must show a "Pending Verification" banner. |
| **REQ-009** | **Real QR Pass Utility** | Functional | The Tourist Pass QR code must be scannable by LGU port officers. Upon scanning, the LGU app must display the tourist's name, booking ID, and trigger a status update (`checked_in` or `departed`) in Firestore. |
| **REQ-010** | **Audit Trail for Monetary Actions** | Compliance | Every status change (pending → confirmed → checked_in → departed) and every refund must create an immutable entry in the `audit_logs` collection with a timestamp, actor UID, and IP address (obtained via Cloud Function context). |

---

### Phase 1: Retention & Trust Requirements (P1 – Must have within 3 months of launch)

These ensure users keep coming back and the LGU derives real operational value.

| ID | Requirement | Category | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-011** | **Multilingual Support (EN & FIL)** | UX | The UI must support English and Filipino (Tagalog) using `react-i18next`. The language switcher must persist the user's preference in localStorage. Key tourism terms (e.g., "SOS", "Pass") may remain in English. |
| **REQ-012** | **Tangible Pass Incentives** | Business Logic | The Tourist Pass must unlock a functional perk (e.g., a 10% discount code generator, or a digital "stamp" collection). Businesses must have a dashboard toggle to enable/disable discounts for pass holders. |
| **REQ-013** | **Automated Booking Reminders** | Functional | The system must send automated push notifications (FCM) or emails 48 hours before check-in, and 2 hours before departure, reminding tourists of their bookings. |
| **REQ-014** | **LGU Port Log Automation** | Operational | Instead of manual typing, the LGU port dashboard must allow a "Bulk Scan" mode where scanning tourist passes automatically populates the `port_logs` collection with arrival/departure timestamps. |
| **REQ-015** | **Review Moderation Workflow** | Functional | When a tourist submits a review, it must default to `approved: false`. The Business or LGU must have a moderation queue to approve/reject reviews before they become public on the listing. |
| **REQ-016** | **SOS Geo-Tagging & Routing** | Safety | The SOS/Incident report must capture the tourist’s exact GPS coordinates. When triggered, the LGU dashboard must display the pinned location on a Leaflet map and auto-assign a `status: active` case to the nearest LGU responder (manual assignment for P1). |
| **REQ-017** | **Automated Refund Policy** | Functional | Refunds requested >48 hours before check-in must be automatically approved (server-side) and initiate a reverse-payment webhook. Requests within 48 hours must be flagged for manual LGU/Business review. |

---

### Phase 2: Scalability & Sustainability Requirements (P2 – Future roadmap)

These turn the app from a project into a long-term platform.

| ID | Requirement | Category | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-018** | **Full-Text Search Implementation** | Performance | Searching for "beachfront resort" across 100+ businesses must return results in < 500ms. Must integrate Algolia or Elasticsearch, as Firestore cannot do native full-text search. |
| **REQ-019** | **Predictive Tourist Flow Analytics** | Data Science | Using Gemini or a simple ML model, the LGU dashboard must forecast tourist arrivals for the next 7 days based on current bookings and historical port logs to allocate LGU personnel effectively. |
| **REQ-020** | **Dynamic Business CMS** | Functional | Businesses must be able to update their own photos, room rates, and tour descriptions directly via their dashboard (not relying on `src/data/*.ts` static files). Static data should only be fallbacks. |
| **REQ-021** | **Settlement Reports Generation** | Operational | The `settlements` collection must feed a finance dashboard that automatically calculates owed amounts between businesses and the LGU (e.g., environmental fees) and generates a downloadable PDF/CSV report. |
| **REQ-022** | **WhatsApp / Viber Integration** | Communication | Clicking "Contact Business" should open a pre-filled WhatsApp or Viber message with the business's registered number, reducing the need for tourists to manually dial. |
| **REQ-023** | **Dark Mode & Accessibility** | UX | The UI must support system-preference dark mode and meet WCAG 2.1 AA contrast ratios for visually impaired tourists (senior citizens). |
| **REQ-024** | **Disaster Mode** | Safety | A separate LGU toggle to switch the app into "Emergency Mode" during typhoons/volcanic activity, which disables new bookings, shows evacuation routes, and pushes mass SOS alerts to all active tourists. |

---

### Phase 3: Operational Sustainability (Business & Legal Requirements)

These are not code-based but are mandatory for the project to survive.

| ID | Requirement | Category | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-025** | **Data Privacy Consent Flow** | Legal | A mandatory consent modal must appear on first launch, explicitly detailing what data is stored, how it is used, and the user's right to be forgotten (in compliance with the Philippine Data Privacy Act). |
| **REQ-026** | **Defined Service Level Agreement (SLA)** | Operational | A publicly posted SLA guaranteeing 99.5% uptime for the booking system and a maximum 4-hour resolution time for critical bugs (to be supported by LGU budget or a local IT partner). |
| **REQ-027** | **Community Training Program** | Adoption | Before full launch, a formal 2-day workshop must be conducted for at least 15 local business owners and 5 LGU staff, with a post-training assessment to ensure they can use their respective dashboards. |
| **REQ-028** | **Disaster Recovery Plan** | Technical | An automated daily backup of Firestore must be exported to a GCS bucket. A documented runbook must exist for restoring the database in case of accidental deletion or corruption. |
| **REQ-029** | **Cost Monitoring & Budget Cap** | Financial | Firebase/Cloud billing alerts must be configured to trigger at 75% and 90% of the monthly budget. The app must have a "Circuit Breaker" pattern to degrade gracefully (e.g., turn off AI planner) if costs spike unexpectedly. |
| **REQ-030** | **Feedback Loop Mechanism** | UX | An in-app "Rate this feature" widget must collect user sentiment after a booking is completed or a trip plan is generated, feeding directly into a product backlog for iterative improvement. |

---

### Summary Checklist for the Dev Team

| Priority | Total Requirements | Focus Area |
| :--- | :--- | :--- |
| **Phase 0 (P0)** | 10 | Security, Payments, Offline, Core Logic (Gating for public launch) |
| **Phase 1 (P1)** | 7 | Trust, Communication, LGU Utility, Moderation |
| **Phase 2 (P2)** | 7 | AI Analytics, CMS, Communication, Accessibility |
| **Phase 3 (Ops)** | 6 | Legal, Training, Budgeting, Disaster Recovery |

**Actionable advice**: Create a GitHub Project board with these 30 requirements as issues. Tag them with `P0`, `P1`, `P2`. Run your QA test suite against the **Verification Criteria** column. Do not launch until all **P0** requirements pass. Pilot with real businesses only when **P1** (specifically REQ-011 and REQ-013) are completed, as these directly affect user retention and local trust.
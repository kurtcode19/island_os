# Catarman eSuroy — Business Context

*A product brief for AI-assisted development.*

## What This Is

This document frames **Catarman eSuroy** (a.k.a. Island OS) in business terms. Use it to give an AI context about who this product serves, how it makes money, what success looks like, and what tradeoffs matter. Technical implementation details are in `SYSTEM_SUMMARY.md` and `docs/implementation.md`.

## Product in One Sentence

A smart-tourism platform that connects tourists, local business owners, and the municipal government of **Catarman, Camiguin, Philippines** under one system — replacing paper-based visitor logs, word-of-mouth bookings, and manual LGU reporting with a digital end-to-end flow.

## Target Market

| Segment | Who | Scale |
|---------|-----|-------|
| **Primary** | Catarman municipality, Camiguin Island | ~1,000 tourists/month (current), 3,000+ peak season |
| **Adjacent** | Other municipalities in Camiguin (Mambajao, Mahinog, etc.) | Expandable after Catarman validation |
| **Future** | Other small-island tourism destinations in the Philippines | Siargao, Palawan islands, Siquijor — same pain points |

Camiguin receives ~300,000 domestic and ~30,000 international visitors annually. Catarman is the island's capital and primary port of entry, making it the natural first deployment.

## Stakeholders & Their Problems

### Tourists

**Before eSuroy:**
- No centralized way to discover accommodations, transport, rentals
- Bookings are manual (phone call, Facebook message, walk-in) — no confirmation, no record
- No digital identity — paper forms at every step
- No itinerary planning — everything is word-of-mouth
- No emergency/SOS while exploring

**With eSuroy:**
- One place to browse, book, and manage stays/transport/rentals
- Digital tourist pass (QR-based) replaces paper forms
- AI trip planner generates personalized itineraries
- SOS button for safety
- Booking history, reviews, refunds — all tracked

### Business Owners (accommodations, transport, rentals, tours)

**Before eSuroy:**
- Manual booking logs (notebook, Excel, or memory)
- No visibility into future occupancy
- No cancellation/refund workflow
- No analytics — "how was this month vs last?" is a guess
- Guest reviews are untracked (Facebook, Google, word-of-mouth)

**With eSuroy:**
- Dashboard with real-time bookings, occupancy calendar, revenue charts
- Inventory management (rooms, vehicles, tour slots)
- Refund request workflow (approve/reject)
- Review management (moderate, reply)
- Data export for accounting

### LGU (Local Government Unit — Catarman)

**Before eSuroy:**
- Paper tourist registry — no real-time data, hard to search
- No port arrival/departure tracking
- No centralized incident/safety monitoring
- Manual settlement reconciliation with businesses
- No visitor analytics for tourism planning

**With eSuroy:**
- Real-time tourist registry (QR scan at port → automatic check-in)
- Port operations dashboard (arrivals, departures, vessel schedules)
- Safety monitoring with GPS-tagged incident reports
- Settlement tracking (business payouts)
- Visitor trend reports (volume, origin, seasonal patterns)
- Audit log for all actions

## Revenue Model

eSuroy is currently a **platform play**, not directly monetized. The long-term revenue model is:

| Source | Mechanism | Timeline |
|--------|-----------|----------|
| **Business subscription** | Monthly fee for business dashboard access (₱500–2,000/mo depending on business size) | Post-pilot |
| **Booking commission** | 5–8% per transaction processed through the platform | Requires integrated payments |
| **LGU service contract** | Annual municipal licensing for the platform | Pilot municipality = Catarman |
| **Premium tourist pass** | Paid expedited pass (+ priority support, exclusive deals) | Future |
| **Data/analytics reports** | Anonymized visitor trend reports sold to businesses/tourism board | Future |

**Current state:** Revenue is zero — the product is being validated with a free pilot.

## Key Business Flows

### Booking Flow (money flow)
1. Tourist browses → books → status: `pending`
2. Business confirms → status: `confirmed` (tourist gets QR)
3. LGU scans QR at port → status: `checked_in`
4. Tourist departs → status: `departed` (review prompt)
5. Money: currently simulated (no real payment gateway integrated)

### Refund Flow (trust flow)
1. Tourist cancels → refund request: `pending`
2. System auto-checks: >48h before check-in? → auto-approve OR needs manual review
3. Business approves/rejects → `approved` or `rejected`
4. Tourist notified

### Tourist Pass Flow (identity flow)
1. Auto-generated on first signup (format: `CTRM-P-YYYY-XXXX`)
2. QR code on pass links to `{origin}/pass/{passId}`
3. LGU scans at port entry/exit
4. Pass status: `active` → `expired` or `revoked`

### Pilot Mode
- When `system/pilot.enabled === true`, all Firestore queries filter to a single pilot business
- Used for controlled demos with real business data before public launch

## Success Metrics

### North Star
**Number of completed booking transactions per month.** Everything else feeds into this.

### Leading indicators
- **Tourist registrations** (passes created) — indicates top-of-funnel health
- **Businesses onboarded** — supply-side growth
- **Booking conversion rate** — bookings / browse sessions
- **Time-to-confirm** (booking created → business confirms) — efficiency metric

### Quality indicators
- **Refund rate** — % of bookings cancelled (target: <15%)
- **Average rating** — review scores across businesses (target: >4.0)
- **Incident response time** — SOS alerts → LGU acknowledgment (target: <5 min)

### Business health
- **Occupancy rate** — rooms booked / total rooms (per business)
- **Revenue per available room (RevPAR)** — for accommodation partners
- **Business retention** — % active after 3 months (target: >80%)

## Current Status (July 2026)

| Area | Status |
|------|--------|
| Core booking flow | Working (stay, transport, rentals) |
| Business dashboard | Functional, some hardcoded placeholders (revenue counts) |
| LGU dashboard | Functional, all modules built |
| Tourist pass + QR | Working |
| AI Trip Planner | Working (Gemini API or mock fallback) |
| SOS / Safety | Working |
| Real payments | NOT integrated (simulated only) |
| Firebase Cloud Functions | NOT deployed (all logic is client-side) |
| Firebase Hosting | NOT configured |
| Android APK | Builds via Capacitor/Gradle |
| Pilot | Ready with demo seed data |
| Security rules | Broad authenticated access (needs tightening before public) |

## Competitive Landscape

| Competitor | Strengths | Weaknesses vs eSuroy |
|-----------|-----------|---------------------|
| **Facebook Marketplace / Groups** | Existing user base, free | No booking management, no payments, no LGU integration, no pass system |
| **Agoda / Booking.com** | Global reach, trust | High commission (15–25%), no local context, no LGU/registry features, no AI planner |
| **Klook** | Strong for tours/activities | Not built for small-island ecosystems, no business dashboard |
| **Custom spreadsheets** | Zero cost | No real-time data, no mobile, no analytics |

**eSuroy's moat:** Being the only platform that serves all three stakeholders (tourist, business, LGU) in a unified system — plus the digital tourist pass mandate via LGU adoption.

## Immediate Business Priorities

1. **Pilot validation** — Get 1–3 real businesses using the dashboard + 50 real tourists passing through the QR check-in
2. **Payment integration** — Add PayMongo or Stripe for real money movement (unlocks commission model)
3. **Security hardening** — Firestore rules, auth guards before public launch
4. **Business onboarding** — Simple onboarding flow for non-tech-savvy business owners
5. **Offline resilience** — Capacitor caching for areas with poor connectivity (common in Camiguin)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low business adoption | Empty platform | Pilot mode with guided onboarding; free first 6 months |
| Poor connectivity | App unusable | Capacitor caching + Firestore offline persistence |
| LGU bureaucracy | Slow deployment | Started with Catarman (supportive LGU); standardize for replication |
| Tourist privacy concerns | Low signup | Minimal data collection; transparent privacy notice |
| Seasonality | Feast/famine usage | Shoulder-season marketing via AI planner; LGU analytics for planning |

## Decision-Making Principles

When you (AI) make suggestions about this product, prioritize:

1. **Does this help a real booking happen?** → If not, defer.
2. **Does this work offline or degrade gracefully?** → Camiguin has unreliable internet.
3. **Is this the simplest version that proves the concept?** → No speculative features.
4. **Does this create data that helps the LGU or businesses?** → Data is the long-term value.
5. **Can this be undone if it fails?** → Prefer reversible decisions.

## Conversations You Should Be Having

Given the above, discuss with me:

- Which stakeholder's problem should we solve *first* when building a new feature?
- What is the minimum set of features needed before we can charge businesses?
- Where is the product over-engineered for the current pilot stage?
- What's the fastest path to 10 real bookings from real tourists?
- Should we focus on web (PWA) or native Android for the next 3 months?

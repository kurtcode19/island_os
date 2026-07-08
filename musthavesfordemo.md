# BOOKING SYSTEM: MUST-HAVE FUNCTIONS

**Complete Guide for Both Business & Tourist Sides**

---

## PART 1: ROOM MANAGEMENT (Business Side)

### Where Rooms Display

| Location | What Shows | Purpose |
|----------|-----------|---------|
| **Business Dashboard → Inventory** | Full room list with details | Manage all rooms |
| **Business Dashboard → Bookings** | Room assigned to each booking | Track bookings per room |
| **Tourist View → Stay** | Available rooms only | Customer booking |
| **Booking Confirmation** | Room name + details | Customer receipt |
| **Check-in Screen** | Room assignment | Front desk |

---

### Room Data Structure (Must Have)

```
┌─────────────────────────────────────────────────────────────┐
│                     ROOM RECORD                             │
├─────────────────────────────────────────────────────────────┤
│  Room ID:          auto-generated                          │
│  Room Name:        "Deluxe Sea View"                       │
│  Room Number:      "302"                                   │
│  Room Type:        "deluxe" | "standard" | "suite"        │
│  Max Occupancy:    4                                       │
│  Base Price:       3,500                                   │
│  Price Modifier:   +1,500 (added to base price)           │
│  Amenities:        ["WiFi", "AC", "TV", "Balcony"]        │
│  Images:           ["photo1.jpg", "photo2.jpg"]           │
│  Status:           "available" | "maintenance" | "blocked"│
│  Created At:       timestamp                               │
│  Updated At:       timestamp                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Where Each Room Field Appears

| Field | Displays On (Tourist Side) | Displays On (Business Side) |
|-------|---------------------------|----------------------------|
| Room Name | ✅ Stay View, Booking Form | ✅ Inventory List, Bookings |
| Room Number | ❌ Not shown to tourists | ✅ Inventory, Check-in |
| Room Type | ✅ Room cards, Filters | ✅ Inventory, Analytics |
| Max Occupancy | ✅ Room cards, Booking | ✅ Inventory |
| Base Price | ✅ Price calculator | ✅ Settings |
| Price Modifier | ✅ Price calculator (as "+₱1,500") | ✅ Inventory |
| Amenities | ✅ Room cards, Details | ✅ Inventory |
| Images | ✅ Gallery carousel | ✅ Media management |
| Status | ❌ Only "Available" shown | ✅ Inventory (full list) |

---

## PART 2: BOOKING FLOW - TOURIST SIDE

### Step-by-Step Booking Process

```
┌─────────────────────────────────────────────────────────────┐
│                    TOURIST BOOKING FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP 1: BROWSE                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stay View → See room cards with:                  │   │
│  │  • Room Name, Type, Price                          │   │
│  │  • Max Occupancy                                   │   │
│  │  • Amenities badges                                │   │
│  │  • "Book Now" button                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▼                                  │
│  STEP 2: SELECT DETAILS                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Booking Modal:                                   │   │
│  │  • Check-in Date + Time (picker)                  │   │
│  │  • Check-out Date + Time (picker)                 │   │
│  │  • Number of Guests                               │   │
│  │  • Purpose of Visit (dropdown)                    │   │
│  │  • Add-ons (checkboxes with prices)               │   │
│  │  • Live Price Calculator updates                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▼                                  │
│  STEP 3: CONFIRM                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Review Summary:                                  │   │
│  │  • Room selected                                   │   │
│  │  • Dates + Times                                   │   │
│  │  • Total Price (breakdown)                         │   │
│  │  • Guest details                                   │   │
│  │  • "Confirm Booking" button                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▼                                  │
│  STEP 4: SUCCESS                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Confirmation Screen:                              │   │
│  │  • Booking ID                                      │   │
│  │  • Booking Details (dates, room, etc.)            │   │
│  │  • QR Code for check-in                           │   │
│  │  • "View My Bookings" button                       │   │
│  │  • Toast notification: "Booking Confirmed!"       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Must-Have Booking Fields (Tourist Side)

| Field | Required? | Where Entered |
|-------|-----------|---------------|
| Check-in Date + Time | ✅ Yes | Date/Time Picker |
| Check-out Date + Time | ✅ Yes | Date/Time Picker |
| Number of Guests | ✅ Yes | Number Selector |
| Room Selection | ✅ Yes | Room Card Click |
| Purpose of Visit | ✅ Yes | Dropdown |
| Add-ons | ⬜ Optional | Checkboxes |
| Nationality | ✅ Yes (from profile) | Auto-filled from onboarding |
| Special Requests | ⬜ Optional | Textarea |

---

## PART 3: BOOKING FLOW - BUSINESS SIDE

### Where Bookings Appear

```
┌─────────────────────────────────────────────────────────────┐
│              BUSINESS BOOKING MANAGEMENT                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DASHBOARD OVERVIEW (Summary Cards)                         │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ PENDING  │ TODAY's  │ TOTAL    │ REVENUE  │            │
│  │    5     │ CHECK-IN │ BOOKINGS │ ₱45,000 │            │
│  │          │    3     │   124    │         │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                             │
│  BOOKINGS MODULE (Full List)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FILTER TABS:                                      │   │
│  │  [All] [Pending] [Confirmed] [Checked-in] [Departed]  │   │
│  │  [Cancelled] [Refund Requests] [Event Inquiries]    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  TABLE (sortable columns):                         │   │
│  │  ┌─────────────────────────────────────────────────┐│   │
│  │  │Guest   │Room   │Check-in│Status │Action       ││   │
│  │  ├─────────────────────────────────────────────────┤│   │
│  │  │Maria R │302    │Jan 15  │Pending│[Confirm]    ││   │
│  │  │John D  │Deluxe │Jan 16  │✓Check │[Check-in]   ││   │
│  │  │Anna S  │Standard│Jan 14 │✓Departed│[View]     ││   │
│  │  │Robert  │305    │Jan 20  │Pending│[Refund?]    ││   │
│  │  └─────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  BOOKING DETAIL VIEW (Click on booking)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Guest Name:       Maria Rodriguez                  │   │
│  │  Contact:          0912-345-6789                    │   │
│  │  Nationality:      Filipino                         │   │
│  │  Purpose:          Leisure                          │   │
│  │  Room:             302 - Deluxe Sea View            │   │
│  │  Check-in:         Jan 15, 2026 @ 2:00 PM          │   │
│  │  Check-out:        Jan 18, 2026 @ 11:00 AM         │   │
│  │  Guests:           2                               │   │
│  │  Add-ons:          Breakfast (₱350 x 3 days)       │   │
│  │  Total Paid:       ₱12,050                         │   │
│  │  Status:           Pending                         │   │
│  │                                                    │   │
│  │  ACTIONS: [Confirm] [Cancel] [Refund] [View Guest]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 4: BOOKING STATUS FLOW

### Status Transitions (Both Sides)

```
┌─────────────────────────────────────────────────────────────┐
│                   BOOKING STATUS FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PENDING                                                    │
│  (Tourist: "Your booking is pending confirmation")          │
│  (Business: "New booking - confirm or cancel")             │
│         │                                                   │
│         ├─── [Business Confirms] ────┐                     │
│         │                            ▼                      │
│         │                      CONFIRMED                    │
│         │                 (Tourist gets QR code)            │
│         │                  (Business: "Ready for check-in") │
│         │                            │                      │
│         │                            ├─── [Guest Arrives]  │
│         │                            ▼                      │
│         │                      CHECKED-IN                   │
│         │                (Tourist: "Checked in!")          │
│         │                 (Business: Room occupied)        │
│         │                            │                      │
│         │                            ├─── [Guest Departs]  │
│         │                            ▼                      │
│         │                      DEPARTED                     │
│         │                 (Tourist: Review prompt)         │
│         │                (Business: Room available)        │
│         │                                                   │
│         └─── [Business Cancels] ────┐                      │
│                                      ▼                      │
│                                CANCELLED                    │
│                        (Refund status applies)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 5: REFUND SYSTEM - MUST HAVE

### Refund Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      REFUND STATUS FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NONE (Default)                                             │
│  (No refund requested)                                      │
│         │                                                   │
│         ├─── [Guest requests cancellation]                 │
│         ▼                                                   │
│  PENDING                                                    │
│  (Tourist: "Refund request submitted")                     │
│  (Business: "Refund request - review")                     │
│         │                                                   │
│         ├─── [System checks: > 48h before check-in?]       │
│         │                                                   │
│         ├─── YES ───────────┐                              │
│         │                    ▼                              │
│         │              APPROVED                             │
│         │        (Auto-approve if conditions met)           │
│         │         (Tourist gets full refund)               │
│         │                                                   │
│         └─── NO ────────────┐                              │
│                              ▼                              │
│                        NEEDS REVIEW                         │
│              (Business manually reviews)                    │
│                    │                                         │
│                    ├─── [Business Approves]                 │
│                    │           ▼                            │
│                    │     APPROVED                           │
│                    │    (Partial/Full refund)               │
│                    │                                         │
│                    └─── [Business Rejects]                  │
│                                ▼                             │
│                          REJECTED                           │
│                   (Tourist gets notification)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Refund Rules (Must Implement)

| Rule | Value | Where Configured |
|------|-------|------------------|
| **Cancellation Window** | 48 hours before check-in | Business Settings |
| **Refund Eligibility** | Full refund if >48h | Auto-checked by system |
| **Late Cancellation** | Partial/No refund | Manual review |
| **Refund Processing Time** | 3-5 business days | Displayed on refund request |
| **Refund Method** | Original payment method | Displayed to guest |

---

### Refund UI Elements (Both Sides)

**Tourist Side (My Bookings):**
```
┌─────────────────────────────────────────────────────────────┐
│  Booking #BKG-2026-001                                     │
│  Room: Deluxe Sea View                                     │
│  Dates: Jan 15-18, 2026                                    │
│  Status: Confirmed                                         │
│  Total Paid: ₱12,050                                      │
│                                                             │
│  [CANCEL BOOKING]   [CONTACT SUPPORT]                      │
│                                                             │
│  ✦ Cancellation Policy: Full refund if cancelled          │
│    more than 48 hours before check-in                     │
└─────────────────────────────────────────────────────────────┘
```

**Business Side (Bookings Module):**
```
┌─────────────────────────────────────────────────────────────┐
│  REFUND REQUESTS TAB                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Request │ Booking  │ Guest    │ Amount │ Action    │   │
│  │ Jan 14  │ BKG-001  │ Maria R │ ₱12k │ [✅][❌] │   │
│  │ Jan 13  │ BKG-002  │ John D  │ ₱8k  │ [✅][❌] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  DETAIL VIEW:                                               │
│  Requested: Jan 14, 2026 @ 10:30 AM                        │
│  Booking: BKG-2026-001 (Deluxe Sea View)                   │
│  Guest: Maria Rodriguez                                    │
│  Check-in: Jan 15, 2026 @ 2:00 PM                         │
│  Time until check-in: 27 hours (within 48h window)        │
│  Refund Amount: ₱12,050 (Full refund)                     │
│                                                             │
│  Reason: "Family emergency, need to cancel"                │
│                                                             │
│  [APPROVE REFUND]   [REJECT REFUND]   [PARTIAL REFUND]    │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 6: PRICE CALCULATOR - MUST HAVE

### Price Breakdown Display (Tourist Side)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRICE BREAKDOWN                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Room:  Deluxe Sea View                                     │
│  Base Price:                    ₱3,500 x 3 nights          │
│  Subtotal:                      ₱10,500                    │
│  + Room Upgrade:                ₱1,500 x 3 nights          │
│  Room Total:                    ₱12,000                    │
│                                                             │
│  Add-ons:                                                   │
│  • Breakfast (x3):              ₱1,050                     │
│  • Airport Transfer:            ₱1,200                     │
│  Add-ons Total:                 ₱2,250                     │
│                                                             │
│  Subtotal:                      ₱14,250                    │
│  + Tax (12%):                   ₱1,710                     │
│  + Service Fee:                 ₱150                       │
│  ─────────────────────────────────────────                  │
│  TOTAL:                         ₱16,110                    │
│                                                             │
│  ✦ Free cancellation up to 48h before check-in            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 7: CALENDAR/AVAILABILITY - MUST HAVE

### Where Availability Shows

| Location | Shows | Purpose |
|----------|-------|---------|
| **Room Cards** | "Available" or "Sold Out" badge | Quick visual check |
| **Date Picker** | Blocked dates grayed out | Prevent double booking |
| **Booking Form** | Availability message | Confirm before booking |
| **Inventory (Business)** | Calendar with booked dates | Manage rooms |

---

### Availability Logic

```
┌─────────────────────────────────────────────────────────────┐
│              AVAILABILITY CHECK LOGIC                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WHEN TOURIST SELECTS DATES:                                │
│                                                             │
│  1. Check if room exists                                    │
│  2. Check if dates are in the future                        │
│  3. Check if room is not in "maintenance" status            │
│  4. Check if any booking overlaps with selected dates       │
│  5. Check if capacity matches guest count                   │
│  6. Return: Available / Not Available                       │
│                                                             │
│  BUSINESS VIEW (Calendar):                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  January 2026                                      │   │
│  │  Mo  Tu  We  Th  Fr  Sa  Su                        │   │
│  │          1   2   3   4   5                         │   │
│  │   6   7   8   9  10  11  12                        │   │
│  │  13  14  15  16  17  18  19                        │   │
│  │  20  21  22  23  24  25  26                        │   │
│  │  27  28  29  30  31                                │   │
│  │                                                    │   │
│  │  🟢 Available  🟡 Booked  🔴 Maintenance          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 8: BOOKING NOTIFICATIONS - MUST HAVE

### Notification Triggers

| Trigger | Tourist Gets | Business Gets |
|---------|--------------|---------------|
| **New Booking** | ✅ "Booking confirmed!" | ✅ "New booking from [Guest]" |
| **Booking Confirmed** | ✅ "Your booking is confirmed!" | ✅ - |
| **Check-in** | ✅ "Welcome! You're checked in" | ✅ "[Guest] checked in" |
| **Check-out** | ✅ "Thank you for staying!" | ✅ "[Guest] departed" |
| **Cancellation Request** | ✅ "Refund request submitted" | ✅ "Refund request from [Guest]" |
| **Refund Approved** | ✅ "Refund approved" | ✅ - |
| **Refund Rejected** | ✅ "Refund request declined" | ✅ - |
| **Review Request** | ✅ "Rate your stay!" | ✅ - |
| **New Review** | ✅ - | ✅ "New review from [Guest]" |

---

## PART 9: DATA EXPORT - MUST HAVE (Business)

### Export Options

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPORT BOOKINGS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Export Options:                                         │
│                                                             │
│  [ ] CSV Export                                             │
│  [ ] PDF Export                                             │
│  [ ] Excel Export                                           │
│                                                             │
│  Date Range:                                                │
│  From: [____]  To: [____]                                  │
│                                                             │
│  Filter:                                                    │
│  [ ] All                                                    │
│  [ ] Confirmed Only                                         │
│  [ ] Checked-in Only                                        │
│  [ ] Cancelled                                              │
│                                                             │
│  Include:                                                   │
│  [ ] Guest Name                                             │
│  [ ] Contact Number                                         │
│  [ ] Room Type                                              │
│  [ ] Check-in/out Dates                                     │
│  [ ] Total Amount                                           │
│  [ ] Status                                                 │
│                                                             │
│  [EXPORT]                                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 10: SUMMARY CHECKLIST

### Must Have for TOURIST Side

- [ ] Browse available rooms with images
- [ ] View room details (amenities, capacity, price)
- [ ] Select check-in/out date AND time
- [ ] Select number of guests
- [ ] Choose purpose of visit
- [ ] Add optional add-ons
- [ ] See live price calculator
- [ ] Confirm booking
- [ ] Get booking confirmation with QR code
- [ ] View all bookings in "My Bookings"
- [ ] Cancel booking and request refund
- [ ] Check refund status
- [ ] Leave review after departure
- [ ] View tourist pass with QR

### Must Have for BUSINESS Side

- [ ] View all bookings in one table
- [ ] Filter bookings by status (Pending, Confirmed, etc.)
- [ ] Change booking status (Confirm, Check-in, Depart)
- [ ] See detailed booking information
- [ ] Manage refund requests (Approve/Reject)
- [ ] View today's check-ins
- [ ] See revenue summary
- [ ] Manage room inventory
- [ ] Block dates for maintenance
- [ ] Reply to guest reviews
- [ ] Export bookings data
- [ ] Update pricing and policies
- [ ] View occupancy calendar
- [ ] Receive notifications for new bookings

### Must Have for SYSTEM

- [ ] Real-time updates (Firestore onSnapshot)
- [ ] Prevent double booking (capacity check)
- [ ] Auto-calculate refund eligibility (48h window)
- [ ] Auto-generate booking ID
- [ ] Auto-generate QR code for check-in
- [ ] Save booking history
- [ ] Audit log for all actions
- [ ] Handle cancellations gracefully
- [ ] Show appropriate messages for each status
- [ ] Work offline (Capacitor caching)

---

## PART 11: EXAMPLE BOOKING SCENARIOS

### Scenario 1: Standard Booking
```
1. Tourist views room
2. Selects dates + times
3. Adds breakfast add-on
4. Sees total price
5. Confirms booking
6. Booking goes to "PENDING"
7. Business receives notification
8. Business confirms → "CONFIRMED"
9. Tourist gets QR code
10. Check-in date arrives → Business scans QR
11. Status changes to "CHECKED_IN"
12. Departure → "DEPARTED"
13. Tourist prompted for review
14. Business receives review notification
15. Business replies to review
```

### Scenario 2: Cancellation with Refund
```
1. Tourist books room (48+ hours before check-in)
2. Tourist cancels → Refund request "PENDING"
3. System auto-checks: >48h? YES
4. Status auto-changes to "APPROVED"
5. Tourist notified: "Refund approved"
6. Booking status: "CANCELLED"
7. Room becomes available again
```

### Scenario 3: Late Cancellation
```
1. Tourist books room (24 hours before check-in)
2. Tourist cancels → Refund request "PENDING"
3. System auto-checks: >48h? NO
4. Status changes to "NEEDS REVIEW"
5. Business receives notification
6. Business reviews reason
7. Business decides: Approve or Reject
8. Tourist notified of decision
```

### Scenario 4: Event Booking
```
1. Tourist selects "Events" tab
2. Views event venues (Ballroom, Beachfront)
3. Selects venue, event type (Wedding)
4. Inputs expected pax
5. Selects date + time slot
6. Booking goes to "PENDING" (events need approval)
7. Business receives "Event Inquiry"
8. Business manually confirms pricing
9. Business confirms booking
10. Event booking confirmed
11. Business prepares for event
12. Event day arrives
13. Event checked-in (different process)
14. Event completed
15. Tourist leaves review
```

---

## PART 12: CRITICAL BUSINESS RULES

### Rules to Always Enforce

| Rule | Where Applied | What Happens |
|------|--------------|--------------|
| **No Double Booking** | Date selection | "Room not available" message |
| **48h Refund Window** | Cancellation | Auto-approve or manual review |
| **Max Occupancy** | Booking form | "Exceeds capacity" warning |
| **Check-in Time** | Booking form | "Check-in from 2:00 PM" note |
| **Check-out Time** | Booking form | "Check-out by 11:00 AM" note |
| **Minimum Stay** | Booking form | "Minimum 2 nights required" |
| **Cancellation Notice** | Booking form | "Free cancellation up to 48h" note |

---

Ready to build! This covers ALL must-have functions for your booking system.
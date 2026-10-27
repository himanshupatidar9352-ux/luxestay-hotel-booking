# 🏨 LuxeStay - Modern E-Commerce Hotel Booking Platform

A high-end, responsive luxury hotel booking and e-commerce platform built with Python 3, SQLite, and vanilla modern web technologies. **Requires zero third-party pip/npm dependencies**—it runs immediately on any system with Python 3 installed.

---

## ✨ Features

### 1. 🔍 Interactive Booking & Search Engine
- **Destination & Resort Search**: Search across world-renowned destinations (Lake Como, Maldives, Santorini, Kyoto, New York, Swiss Alps, Dubai, Paris, Bali, Utah Canyons).
- **Date Pickers with Nights Calculation**: Real-time check-in and check-out dates with automatic night count badges and price updates.
- **Guests & Rooms Popover**: Interactive steppers for Adults, Children, and Rooms count.

### 2. 🎛️ Dynamic Filtering & Sorting
- **Max Price Slider**: Real-time slider from $200 to $2,500+/night.
- **Experience Categories**: Overwater Island Villas, Historic Palaces, Cliffside Suites, Alpine Chalets, and Desert Wellness.
- **Verified Guest Score Filters**: Filter for 9.0+, 9.2+, or 9.6+ Exceptional ratings.
- **Curated Perks**: Filter by Private Pools, Thermal Spas, Butler Service, and Michelin-starred dining.
- **Multi-Currency Support**: Instant currency conversion between USD ($), EUR (€), GBP (£), and INR (₹).
- **Grid vs. List Layout**: Switch effortlessly between luxury card grid and detailed list view.
- **Dark / Light Theme Toggle**: Persistent theme preference with glassmorphism aesthetic.

### 3. 🛎️ Hotel Details & Suite Selection
- **High-Resolution Photo Gallery**: Interactive photo viewer with thumbnail carousels.
- **Tabbed Experience**: Browse Available Suites, Property Overview, Amenities Checklist, and Verified Guest Reviews.
- **Suite-Level Booking**: Select distinct room tiers (e.g., Lake View Rooms vs. Rooftop Penthouse Suites with Jacuzzis) with specs on size ($m^2$), bed types, and guest occupancy.

### 4. 💳 Complete E-Commerce Checkout Funnel
- **Guest Details**: Name, email, phone, and customizable special requests.
- **Curated Add-Ons**: Meal plan selection (Complimentary Gourmet Breakfast or Half Board Champagne Dinners).
- **Promo Coupon System**: Real-time promo validation:
  - `LUXE20`: 20% off all luxury suites
  - `SUMMER50`: $50 discount on stays over $200
  - `WELCOME10`: 10% welcome coupon
- **Interactive Card Payment Simulation**:
  - Live animated credit card preview updating in real-time.
  - **"⚡ Autofill VIP Test Card"** button for instant one-click testing.

### 5. 🎟️ Digital Confirmation Voucher & QR Code
- Generates a unique booking reference code (e.g., `LX-84920`).
- Mock QR code for front-desk check-in.
- **Print / PDF Download**: Formatted print styles to save or print official hotel confirmation vouchers.

### 6. 📂 Customer Portal ("My Bookings")
- Search and manage past and upcoming reservations by email.
- View vouchers anytime.
- **1-Click Cancellation with Refund**: Instant cancellation handling with status updates.

### 7. 📊 Hotelier & Admin Portal
- Real-time operations dashboard with key business KPIs: Gross Revenue, Total Bookings, Active Properties, and Average Guest Rating.
- Recent reservations feed.
- **"List a New Hotel" Form**: Add new luxury properties directly into the persistent SQLite database.

---

## 🚀 Quick Start

### Option A: One-Click Run (Windows)
Double-click:
```bat
run.bat
```
or in PowerShell:
```powershell
.\start.ps1
```

### Option B: Command Line
```bash
python server.py
```
Then open your browser at **http://localhost:8000**.

---

## 📁 Project Structure

```
Product/
├── server.py             # Python HTTP server, SQLite DB manager & REST API
├── hotel_booking.db      # SQLite database (auto-created and seeded)
├── test_logic.py         # Automated database & business logic test suite
├── run.bat               # Windows batch launcher
├── start.ps1             # PowerShell launcher
├── README.md             # Documentation
└── public/               # Frontend Assets
    ├── index.html        # Main luxury booking application UI & modals
    ├── css/
    │   └── styles.css    # Luxury styling, animations, responsive layouts
    └── js/
        ├── app.js        # Client state, routing, checkout logic, and UI bindings
        └── data.js       # Curated destination catalog & fallback offline data
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hotels` | Query hotels with search, filters, and sorting |
| `GET` | `/api/hotels/<id>` | Full hotel details, suite tiers, and guest reviews |
| `GET` | `/api/destinations` | Trending destination highlights |
| `GET` | `/api/coupons?code=...` | Validate promotional discount codes |
| `POST` | `/api/bookings` | Create confirmed guest reservation |
| `GET` | `/api/bookings?email=...` | Retrieve customer reservations |
| `POST` | `/api/bookings/<ref>/cancel`| Cancel booking and initiate refund |
| `POST` | `/api/reviews` | Submit verified guest review |
| `GET` | `/api/admin/stats` | Business KPI stats & recent bookings |
| `POST` | `/api/admin/hotels` | List new hotel in the catalog |

---

## 🧪 Testing Guide

1. **Search & Filter**: Select "Santorini" or filter price down to $700.
2. **Explore Rooms**: Click **"Select Rooms"** on any hotel card to inspect the photo gallery and suites.
3. **Checkout**: Click **"Book Suite"** to open checkout.
4. **Promo Code**: Enter `LUXE20` and click **"Apply"** to see an immediate 20% discount.
5. **Autofill Card**: Click the **"⚡ Autofill VIP Test Card"** button.
6. **Confirm**: Click **"Complete Reservation"** to receive your digital voucher with QR code.
7. **Manage Booking**: Click **"My Bookings"** in the top navigation to view your booking or test the cancellation refund.
8. **Admin Dashboard**: Click **"Admin Portal"** in the top right to view live platform metrics and recent reservations.


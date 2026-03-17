# IsleGO - Camiguin Island Smart Tourism Platform

IsleGO is a comprehensive smart tourism platform for Camiguin Island, designed to provide a seamless experience for tourists, business owners, and local government units (LGU).

## 🚀 Project Overview

The application is built with **React**, **TypeScript**, and **Tailwind CSS**, featuring a responsive design that adapts to both desktop and mobile devices. It uses a role-based navigation system to tailor the experience for different user types.

## 🏗️ Core Architecture

### 1. Main Entry Point (`/src/App.tsx`)
The central hub of the application. It manages:
- **Routing**: Using `react-router-dom` to handle all page transitions.
- **Global State**: Manages the current `UserRole` ('TOURIST', 'BUSINESS', 'LGU').
- **Layout Logic**: Conditionally renders the global navigation bar based on the current route (e.g., hiding it for the immersive mobile view).

### 2. Role-Based Navigation (`Navigation` component in `App.tsx`)
Dynamically generates navigation links based on the active role:
- **Tourist**: Explore, Stay, Transport, Shops, Locations, Tourist Pass.
- **Business**: Dashboard, Bookings, Analytics.
- **LGU**: Analytics, Island Map, Reports.
- **Role Switcher**: Allows users to toggle between roles (primarily for development/demo purposes).

### 3. Smart Redirection (`RoleNavigator` component in `App.tsx`)
Handles automatic navigation logic:
- **Mobile Detection**: Uses `window.innerWidth` and a resize listener to detect mobile devices.
- **Auto-Redirect**: Automatically sends mobile users to the `/mobile` app view.
- **Role Enforcement**: Ensures users are on the correct dashboard for their role (e.g., redirecting a 'BUSINESS' user to `/business`).

## 📱 Mobile Experience (`/src/views/MobileAppView.tsx`)
A specialized, immersive view designed specifically for mobile users.
- **Immersive UI**: Hides the global navigation bar to maximize screen space.
- **Responsive Frame**: On desktop, it shows a phone frame for previewing; on mobile, it expands to full-screen.
- **Features**: Explore tab, Island Services directory, and a Digital Tourist Pass with QR code.

## 🗺️ Key Views

| View | Path | Description |
| :--- | :--- | :--- |
| **Landing View** | `/` | The main entry point for tourists, featuring island highlights and a map. |
| **Business Dashboard** | `/business` | Tools for business owners to manage bookings and view analytics. |
| **Government Dashboard** | `/government` | Data-driven insights and reporting tools for the LGU. |
| **Mobile App View** | `/mobile` | The primary interface for users on mobile devices. |
| **Tourist Pass** | `/pass` | Digital identification and pass system for island visitors. |

## 🎨 Styling & UI
- **Tailwind CSS**: Utility-first styling for rapid, consistent UI development.
- **Lucide React**: A consistent set of icons used throughout the app.
- **Framer Motion**: Smooth animations for transitions and role switching.
- **Typography**:
    - **Sans-serif**: `Plus Jakarta Sans` (used for UI elements, buttons, and body text).
    - **Serif**: `Cormorant Garamond` (used for headings and elegant accents).
- **Custom Theme**: Defined in `src/index.css` using CSS variables:
    - `island-green`: `#2D4F3B` (Primary brand color)
    - `island-emerald`: `#5E8C71` (Accent green)
    - `island-coral`: `#E67E6E` (Warm accent)
    - `island-sunset`: `#D9A066` (Secondary accent)
    - `island-ocean`: `#7BA9B8` (Cool accent)
    - `island-volcanic`: `#1A1C19` (Text color)
    - `island-cream`: `#F9F8F3` (Background color)

## 🛠️ Traceability: What affects What?

- **Changing `role` state in `App.tsx`**:
    - Updates the `Navigation` links.
    - Triggers `RoleNavigator` to redirect the user to the appropriate dashboard.
- **Resizing the Browser Window**:
    - Updates the `isMobile` state in `RoleNavigator`.
    - Triggers a redirect to `/mobile` if the width drops below 768px (and vice versa).
- **Navigating to `/mobile`**:
    - The `App` component detects this path and hides the `Navigation` bar.
    - `MobileAppView` renders its own internal navigation system.

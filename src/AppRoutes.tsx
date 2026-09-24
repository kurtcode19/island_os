import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect } from 'react';
import { UserRole } from './types';

// Views
import MyBookingsView from './views/MyBookingsView';
import DininggasanHome from './views/DininggasanHome';
import DininggasanDashboard from './views/DininggasanDashboard';
import FunctionRoomView from './views/FunctionRoomView';
import StayView from './views/StayView';
import RentalsView from './views/RentalsView';
import TransportView from './views/TransportView';
import LocationsView from './views/LocationsView';
import HowItWorksView from './views/HowItWorksView';
import TripPlannerView from './views/TripPlannerView';
import MobileAppView from './views/MobileAppView';
import ClaimBusinessView from './views/ClaimBusinessView';
import BusinessDashboard from './views/BusinessDashboard';
import GovernmentDashboard from './views/GovernmentDashboard';
import TouristPassView from './views/TouristPassView';

import { Navigation } from './components/layout/Navigation';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppRoutes({ role, setRole, isMobile }: { role: UserRole, setRole: (role: UserRole) => void, isMobile: boolean }) {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="*" element={
          <>
            <Navigation />
            <main className={`${location.pathname === '/' ? "" : "pt-20"}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<DininggasanHome />} />
                    <Route path="/dininggasan" element={<Navigate to="/" replace />} />
                    <Route path="/admin/*" element={<DininggasanDashboard />} />
                    <Route path="/function-room" element={<FunctionRoomView />} />
                    <Route path="/my-bookings" element={<MyBookingsView />} />
                    <Route path="/stay" element={<StayView />} />
                    <Route path="/rentals" element={<RentalsView />} />
                    <Route path="/transport" element={<TransportView />} />
                    <Route path="/locations" element={<LocationsView />} />
                    <Route path="/how-it-works" element={<HowItWorksView />} />
                    <Route path="/planner" element={<TripPlannerView />} />
                    <Route path="/mobile" element={<MobileAppView />} />
                    <Route path="/claim-business" element={<ClaimBusinessView />} />
                    <Route path="/business/*" element={<BusinessDashboard />} />
                    <Route path="/government/*" element={<GovernmentDashboard />} />
                    <Route path="/pass" element={<TouristPassView />} />
                    <Route path="/verify-pass/:id" element={<TouristPassView />} />
                    <Route path="/services" element={<Navigate to="/function-room" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
          </>
        } />
      </Routes>
    </>
  );
}

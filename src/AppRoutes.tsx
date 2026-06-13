import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect } from 'react';
import { UserRole } from './types';

// Views
import LandingView from './views/LandingView';
import BusinessDashboard from './views/BusinessDashboard';
import GovernmentDashboard from './views/GovernmentDashboard';
import MobileAppView from './views/MobileAppView';
import StayView from './views/StayView';
import TransportView from './views/TransportView';
import TouristPassView from './views/TouristPassView';
import ShopsView from './views/ShopsView';
import LocationsView from './views/LocationsView';
import MyBookingsView from './views/MyBookingsView';
import ClaimBusinessView from './views/ClaimBusinessView';
import TripPlannerView from './views/TripPlannerView';

import { Navigation } from './components/layout/Navigation';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

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
        <Route path="/mobile" element={
          <>
            <MobileHeader />
            <main className="pt-16 pb-24">
              <MobileAppView />
            </main>
            <MobileBottomNav />
          </>
        } />
        <Route path="*" element={
          <>
            {!isMobile ? (
              <Navigation currentRole={role} onRoleChange={setRole} />
            ) : (
              <MobileHeader />
            )}
            <main className={!isMobile ? "pt-20" : "pt-16 pb-24"}>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<LandingView />} />
                    <Route path="/stay" element={<StayView />} />
                    <Route path="/transport" element={<TransportView />} />
                    <Route path="/shops" element={<ShopsView />} />
                    <Route path="/locations" element={<LocationsView />} />
                    <Route path="/planner" element={<TripPlannerView />} />
                    <Route path="/pass" element={<TouristPassView />} />
                    <Route path="/my-bookings" element={<MyBookingsView />} />
                    <Route path="/claim-business" element={<ClaimBusinessView />} />
                    <Route path="/business/*" element={<BusinessDashboard />} />
                    <Route path="/government/*" element={<GovernmentDashboard />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
            {isMobile && <MobileBottomNav />}
          </>
        } />
      </Routes>
    </>
  );
}

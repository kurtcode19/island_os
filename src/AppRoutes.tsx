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
import LocationsView from './views/LocationsView';
import MyBookingsView from './views/MyBookingsView';
import ClaimBusinessView from './views/ClaimBusinessView';
import TripPlannerView from './views/TripPlannerView';
import HowItWorksView from './views/HowItWorksView';
import RentalsView from './views/RentalsView';

import { Navigation } from './components/layout/Navigation';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import SOSButton from './components/shared/SOSButton';

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
          <main className="h-screen overflow-hidden">
            <MobileAppView />
            {/* Bottom nav is now handled inside MobileAppView for better control */}
          </main>
        } />
        <Route path="*" element={
          <>
            {!isMobile ? (
              <Navigation currentRole={role} onRoleChange={setRole} />
            ) : (
              location.pathname !== '/mobile' && <MobileHeader />
            )}
            {/* SOS Button on tourist-facing pages */}
            {role === 'TOURIST' && !location.pathname.startsWith('/business') && !location.pathname.startsWith('/government') && <SOSButton />}
            <main className={!isMobile ? "pt-20" : (location.pathname === '/mobile' ? "" : "pt-16 pb-24")}>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<LandingView />} />
                    <Route path="/how-it-works" element={<HowItWorksView />} />
                    <Route path="/stay" element={<StayView />} />
                    <Route path="/transport" element={<TransportView />} />
                    <Route path="/locations" element={<LocationsView />} />
                    <Route path="/rentals" element={<RentalsView />} />
                    <Route path="/planner" element={<TripPlannerView />} />
                    <Route path="/pass" element={<TouristPassView />} />
                    <Route path="/my-bookings" element={<MyBookingsView />} />
                    <Route path="/claim-business" element={<ClaimBusinessView />} />
                    <Route path="/business/*" element={<BusinessDashboard />} />
                    {!isMobile && <Route path="/government/*" element={<GovernmentDashboard />} />}
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
            {isMobile && location.pathname !== '/mobile' && <MobileBottomNav />}
          </>
        } />
      </Routes>
    </>
  );
}

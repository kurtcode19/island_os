import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect } from 'react';
import { UserRole } from './types';

// Views
import BusinessDashboard from './views/BusinessDashboard';
import GovernmentDashboard from './views/GovernmentDashboard';
import TransportView from './views/TransportView';
import TouristPassView from './views/TouristPassView';
import LocationsView from './views/LocationsView';
import MyBookingsView from './views/MyBookingsView';
import ClaimBusinessView from './views/ClaimBusinessView';
import TripPlannerView from './views/TripPlannerView';
import RentalsView from './views/RentalsView';
import DininggasanHome from './views/DininggasanHome';
import DininggasanDashboard from './views/DininggasanDashboard';
import FunctionRoomView from './views/FunctionRoomView';

import { Navigation } from './components/layout/Navigation';

import ChatButton from './components/shared/SOSButton';

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
        <Route path="/mobile" element={<Navigate to="/" replace />} />
        <Route path="*" element={
          <>
            {location.pathname !== '/mobile' && <Navigation />}
            {/* SOS Button on tourist-facing pages */}
            {role === 'TOURIST' && !location.pathname.startsWith('/business') && !location.pathname.startsWith('/government') && <ChatButton />}
              <main className={`${location.pathname === '/' ? "" : location.pathname === '/mobile' ? "" : "pt-20"}`}>
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
                    <Route path="/services" element={<DininggasanHome />} />
                    <Route path="/tours" element={<DininggasanHome />} />
                    <Route path="/admin/*" element={<DininggasanDashboard />} />
                    <Route path="/function-room" element={<FunctionRoomView />} />
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
          </>
        } />
      </Routes>
    </>
  );
}

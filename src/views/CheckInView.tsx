import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, User, MapPin, Calendar, Ship, ArrowLeft, RefreshCw } from 'lucide-react';
import QRScanner from '../components/shared/QRScanner';
import { verifyPass, getActiveBookingsForTourist, checkIn, departTourist } from '../lib/checkinService';
import { useAuth } from '../context/AuthContext';
import type { TouristPass, Booking } from '../types';

type ScanMode = 'checkin' | 'depart';

export default function CheckInView() {
  const { profile } = useAuth();
  const [mode, setMode] = useState<ScanMode>('checkin');
  const [scannedPass, setScannedPass] = useState<TouristPass | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const reset = () => {
    setScannedPass(null);
    setBookings([]);
    setError(null);
  };

  const handleScan = async (decodedText: string) => {
    setLoading(true);
    setError(null);

    try {
      // Extract passId from URL if it's a full URL
      const passId = decodedText.includes('/verify-pass/')
        ? decodedText.split('/verify-pass/')[1].split('?')[0]
        : decodedText;

      const result = await verifyPass(passId);
      if (!result.pass || result.error) {
        setError(result.error || 'Invalid pass');
        toast.error(result.error || 'Invalid pass');
        setLoading(false);
        return;
      }

      setScannedPass(result.pass);

      // Fetch active bookings for this tourist
      const activeBookings = await getActiveBookingsForTourist(result.pass.uid);
      setBookings(activeBookings);

      if (mode === 'checkin' && activeBookings.length === 0) {
        setError('No active bookings found for this tourist. They need to book first.');
      }
    } catch {
      setError('Failed to process pass');
      toast.error('Failed to process pass');
    }
    setLoading(false);
  };

  const handleCheckIn = async (bookingId: string) => {
    setProcessingIds(prev => new Set(prev).add(bookingId));
    const success = await checkIn(bookingId, profile?.businessId || '');
    if (success) {
      toast.success('Guest checked in successfully!');
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'checked_in' } : b
      ));
    } else {
      toast.error('Failed to check in guest');
    }
    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(bookingId);
      return next;
    });
  };

  const handleDepart = async () => {
    if (!scannedPass) return;
    setLoading(true);
    const success = await departTourist(scannedPass.uid);
    if (success) {
      toast.success('Tourist marked as departed');
      setBookings(prev => prev.map(b => ({ ...b, status: 'departed' })));
    } else {
      toast.error('Failed to mark departure');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-island-volcanic tracking-tighter mb-2">
            {mode === 'checkin' ? 'Check-In Scanner' : 'Departure Scanner'}
          </h2>
          <p className="text-slate-500 font-medium">
            {mode === 'checkin'
              ? 'Scan a tourist\'s pass to check them into their booking.'
              : 'Scan a tourist\'s pass at the port for departure.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { reset(); setMode('checkin'); }}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
              mode === 'checkin'
                ? 'bg-island-emerald text-white shadow-lg'
                : 'bg-white border border-slate-100 text-slate-500'
            }`}
          >
            Check-In
          </button>
          <button
            onClick={() => { reset(); setMode('depart'); }}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
              mode === 'depart'
                ? 'bg-island-coral text-white shadow-lg'
                : 'bg-white border border-slate-100 text-slate-500'
            }`}
          >
            Departure
          </button>
        </div>
      </div>

      {!scannedPass && (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
          <QRScanner onScan={handleScan} onError={(e) => setError(e)} />
          {error && (
            <p className="text-center text-island-coral text-sm font-medium mt-4">{error}</p>
          )}
          <p className="text-center text-slate-400 text-xs font-medium mt-4">
            Point the camera at the tourist's QR pass
          </p>
        </div>
      )}

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <RefreshCw size={32} className="animate-spin text-island-emerald" />
          </motion.div>
        )}
      </AnimatePresence>

      {scannedPass && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Pass Holder Info */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald">
                <User size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">{scannedPass.displayName}</h3>
                <p className="text-slate-400 text-sm font-medium">Pass ID: {scannedPass.passId}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-5 py-2 rounded-full text-xs font-bold ${
                  scannedPass.status === 'active'
                    ? 'bg-island-emerald/10 text-island-emerald'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {scannedPass.status}
                </span>
              </div>
            </div>

            {bookings.length > 0 && mode === 'checkin' && (
              <div className="space-y-4">
                <h4 className="text-lg font-black text-island-volcanic tracking-tight mb-6">Active Bookings</h4>
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-island-emerald shadow-sm">
                        <MapPin size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-island-volcanic tracking-tight">{booking.serviceName}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Calendar size={12} /> {booking.date}
                          </span>
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === 'confirmed' ? 'bg-island-emerald/10 text-island-emerald' :
                            booking.status === 'checked_in' ? 'bg-blue-50 text-blue-500' :
                            'bg-amber-50 text-amber-500'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-island-volcanic">₱{booking.amount?.toLocaleString()}</span>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          disabled={processingIds.has(booking.id)}
                          className="px-6 py-3 bg-island-emerald text-white rounded-2xl text-xs font-bold tracking-wider hover:bg-island-emerald/90 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {processingIds.has(booking.id) ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <><CheckCircle2 size={16} /> Check In</>
                          )}
                        </button>
                      )}
                      {booking.status === 'checked_in' && (
                        <span className="px-4 py-2 bg-blue-50 text-blue-500 rounded-2xl text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Checked In
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mode === 'depart' && (
              <div className="text-center py-8">
                {bookings.filter(b => b.status === 'checked_in' || b.status === 'confirmed').length > 0 ? (
                  <button
                    onClick={handleDepart}
                    disabled={loading}
                    className="px-10 py-5 bg-island-coral text-white rounded-[2rem] text-sm font-bold tracking-wider hover:bg-island-coral/90 transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
                  >
                    {loading ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <><Ship size={20} /> Mark as Departed</>
                    )}
                  </button>
                ) : (
                  <p className="text-slate-400 font-medium">No active bookings to depart.</p>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-6 bg-island-coral/5 rounded-[2rem] border border-island-coral/10 mt-6">
                <XCircle size={20} className="text-island-coral shrink-0" />
                <p className="text-island-coral text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={20} /> Scan Another Pass
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

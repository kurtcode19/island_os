import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Ticket,
  Hotel,
  Ship,
  Compass,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function MyBookingsView() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('touristUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSimulatePayment = async (bookingId: string) => {
    setProcessingId(bookingId);
    setTestError(null);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: 'PAID',
        status: 'confirmed' // Auto-confirm for demo purposes if paid
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      setTestError(error.message || String(error));
      try {
        handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
      } catch (e) {}
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-50 text-island-emerald border-emerald-100';
      case 'pending': return 'bg-amber-50 text-island-sunset border-amber-100';
      case 'cancelled': return 'bg-rose-50 text-island-coral border-rose-100';
      default: return 'bg-stone-50 text-slate-500 border-stone-200';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'stay': return Hotel;
      case 'transport': return Ship;
      case 'tour': return Compass;
      default: return Ticket;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFB]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 volcanic-gradient text-white rounded-2xl flex items-center justify-center shadow-2xl animate-spin">
            <RefreshCw size={32} strokeWidth={3} />
          </div>
          <p className="text-island-volcanic font-black uppercase tracking-[0.3em] text-[10px]">Retrieving Journey Manifest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F1] pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <div className="bg-white border-b-2 border-stone-100 pt-16 pb-12 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-island-volcanic transition-all mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-slate-100 group-hover:bg-island-volcanic group-hover:text-white transition-colors">
              <ArrowLeft size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Return to Operations</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-island-emerald font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">Traveler Interface</span>
              <h1 className="text-5xl font-black text-island-volcanic tracking-tighter">Active Manifest.</h1>
              <p className="text-slate-500 font-medium text-lg mt-2">Manage your verified Catarman nodes and stay assignments.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="px-8 py-4 volcanic-gradient rounded-3xl border border-white/10 shadow-2xl">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1 block">Verified Nodes</span>
                <p className="text-3xl font-black text-island-emerald tracking-tighter">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16">
        {testError && (
          <div className="mb-10 p-6 bg-rose-50 text-rose-700 rounded-3xl border-2 border-rose-100 font-black text-sm shadow-xl">
            Protocol Error: {testError}
          </div>
        )}
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-[4rem] p-20 text-center border-2 border-stone-100 shadow-2xl">
            <div className="w-24 h-24 volcanic-gradient text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl">
              <Ticket size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-4">No Nodes Registered</h2>
            <p className="text-slate-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">Initialize your island adventure by reserving a verified stay or transport node.</p>
            <Link to="/stay" className="btn-primary px-12 py-6 rounded-full inline-flex">
              Explore Available Stays <ChevronRight size={24} strokeWidth={3} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking) => {
              const Icon = getServiceIcon(booking.serviceType);
              return (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[3.5rem] p-10 border-2 border-stone-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
                >
                  <div className="flex flex-col md:flex-row gap-10">
                    {/* Left: Icon & Status */}
                    <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-stone-50 flex items-center justify-center text-island-volcanic border border-stone-100 group-hover:volcanic-gradient group-hover:text-white transition-all duration-700 shadow-inner">
                        <Icon size={40} strokeWidth={2.5} />
                      </div>
                      <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border-2 shadow-sm ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.3em] bg-island-emerald/5 px-3 py-1 rounded-lg border border-island-emerald/10">
                          {booking.serviceType}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          NODE-ID: {booking.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-4xl font-black text-island-volcanic tracking-tighter mb-8 group-hover:text-island-emerald transition-colors duration-500">{booking.serviceName}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex items-center gap-4 text-slate-500 font-bold">
                          <Calendar size={20} strokeWidth={3} className="text-island-emerald" />
                          <span className="text-sm tracking-tight">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500 font-bold">
                          <CreditCard size={20} strokeWidth={3} className="text-island-emerald" />
                          <span className="text-xl font-black text-island-volcanic tracking-tighter">₱{booking.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-center gap-4 min-w-[200px]">
                      {booking.paymentStatus === 'PAID' ? (
                        <div className="flex items-center justify-center gap-3 text-island-emerald bg-emerald-50 py-5 rounded-[2rem] border-2 border-emerald-100 shadow-sm">
                          <CheckCircle2 size={24} strokeWidth={3} />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">VERIFIED</span>
                        </div>
                      ) : booking.status === 'cancelled' ? (
                        <div className="flex items-center justify-center gap-3 text-island-coral bg-rose-50 py-5 rounded-[2rem] border-2 border-rose-100">
                          <XCircle size={24} strokeWidth={3} />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">VOID</span>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleSimulatePayment(booking.id)}
                            disabled={processingId === booking.id}
                            className="btn-primary w-full py-5 rounded-[2rem] text-[10px]"
                          >
                            {processingId === booking.id ? (
                              <RefreshCw size={20} strokeWidth={3} className="animate-spin" />
                            ) : (
                              <CreditCard size={20} strokeWidth={3} />
                            )}
                            Verify Transaction
                          </button>
                          <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-widest opacity-60">Simulate Node Payment</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Operational Note */}
                  {booking.status === 'pending' && booking.paymentStatus !== 'PAID' && (
                    <div className="mt-10 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
                        <AlertCircle size={20} strokeWidth={3} />
                      </div>
                      <div>
                        <span className="font-black text-amber-900 uppercase tracking-widest text-[9px] mb-1 block">Protocol Intelligence</span>
                        <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic">
                          Manual verification required. Post-payment status will update to "Confirmed" across the municipal node network.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

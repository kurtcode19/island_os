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
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';

export default function MyBookingsView() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('touristUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSimulatePayment = async (bookingId: string) => {
    setProcessingId(bookingId);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: 'PAID',
        status: 'confirmed' // Auto-confirm for demo purposes if paid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-island-emerald/10 text-island-emerald border-island-emerald/20';
      case 'pending': return 'bg-island-sunset/10 text-island-sunset border-island-sunset/20';
      case 'cancelled': return 'bg-island-coral/10 text-island-coral border-island-coral/20';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
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
      <div className="min-h-screen flex items-center justify-center bg-island-cream">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-island-emerald animate-spin" />
          <p className="text-island-green font-bold uppercase tracking-widest text-xs">Fetching your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-island-cream pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-island-green transition-colors mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Explore</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-island-green italic mb-2">My <span className="not-italic text-island-emerald">Bookings</span></h1>
              <p className="text-slate-500 font-light">Manage your island experiences and stays.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-island-emerald/10 rounded-xl border border-island-emerald/20">
                <span className="text-[10px] font-bold text-island-emerald uppercase tracking-widest">Active Trips</span>
                <p className="text-xl font-bold text-island-green">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-island-cream rounded-full flex items-center justify-center text-island-emerald mx-auto mb-6">
              <Ticket size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-island-green mb-4 italic">No bookings yet</h2>
            <p className="text-slate-500 font-light mb-8 max-w-xs mx-auto">Start your adventure by booking a stay or an island tour.</p>
            <Link to="/stay" className="inline-flex items-center gap-3 px-8 py-4 island-gradient text-white rounded-full font-bold shadow-lg shadow-island-emerald/20 hover:scale-105 transition-all">
              Explore Stays <ChevronRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const Icon = getServiceIcon(booking.serviceType);
              return (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Icon & Status */}
                    <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-island-cream flex items-center justify-center text-island-emerald group-hover:scale-110 transition-transform">
                        <Icon size={32} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-island-emerald uppercase tracking-widest bg-island-emerald/5 px-2 py-0.5 rounded">
                          {booking.serviceType}
                        </span>
                        <span className="text-xs text-slate-400 font-light">
                          Ref: #{booking.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-island-green mb-4">{booking.serviceName}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-slate-500">
                          <Calendar size={16} className="text-island-emerald" />
                          <span className="text-sm font-light">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <CreditCard size={16} className="text-island-emerald" />
                          <span className="text-sm font-bold text-island-green">₱{booking.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-center gap-3 min-w-[160px]">
                      {booking.paymentStatus === 'PAID' ? (
                        <div className="flex items-center justify-center gap-2 text-island-emerald bg-island-emerald/5 py-3 rounded-2xl border border-island-emerald/10">
                          <CheckCircle2 size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest">Paid</span>
                        </div>
                      ) : booking.status === 'cancelled' ? (
                        <div className="flex items-center justify-center gap-2 text-island-coral bg-island-coral/5 py-3 rounded-2xl border border-island-coral/10">
                          <XCircle size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest">Cancelled</span>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleSimulatePayment(booking.id)}
                            disabled={processingId === booking.id}
                            className="w-full py-4 island-gradient text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-island-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {processingId === booking.id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <CreditCard size={16} />
                            )}
                            Pay Now
                          </button>
                          <p className="text-[10px] text-center text-slate-400 font-light italic">Simulate transaction</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Demo Note */}
                  {booking.status === 'pending' && booking.paymentStatus !== 'PAID' && (
                    <div className="mt-6 p-4 bg-island-sunset/5 rounded-2xl border border-island-sunset/10 flex items-start gap-3">
                      <AlertCircle size={16} className="text-island-sunset mt-0.5 shrink-0" />
                      <p className="text-[11px] text-island-sunset/80 leading-relaxed italic">
                        <span className="font-bold">Demo Note:</span> Once you pay, the status will automatically change to "Confirmed" and reflect on the Business Dashboard.
                      </p>
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

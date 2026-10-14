import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UilCalendar, 
  UilMapMarker, 
  UilClock, 
  UilCreditCard, 
  UilCheckCircle, 
  UilTimesCircle, 
  UilExclamationCircle,
  UilAngleRightB,
  UilArrowLeft,
  UilRefresh,
  UilTicket,
  UilBuilding,
  UilShip,
  UilCompass,
  UilStar,
  UilSearch,
  UilRepeat,
  UilFilter,
  UilTimes
} from '@/icons';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ReviewForm from '../components/shared/ReviewForm';
import { requestCancellation, processRefundEligibility } from '../lib/refundService';
import { QRCodeSVG } from 'qrcode.react';
import { LANDBANK_DETAILS } from '../lib/paymentUtils';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function MyBookingsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
   const [cancellingBooking, setCancellingBooking] = useState<{ id: string; eligibility: string } | null>(null);
   const [cancelReason, setCancelReason] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [reviewFilter, setReviewFilter] = useState<'all' | 'reviewable'>('all');
   const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
   const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);
   const [uploadingReceiptId, setUploadingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

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
      console.error('Bookings fetch error:', error);
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [user?.uid]);

   const handleSimulatePayment = async (bookingId: string) => {
     setProcessingId(bookingId);
     setTestError(null);
     await new Promise(resolve => setTimeout(resolve, 1500));
     
     try {
       const bookingRef = doc(db, 'bookings', bookingId);
       await updateDoc(bookingRef, {
         paymentStatus: 'PAID'
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

   const handleReceiptUpload = async (bookingId: string, file: File) => {
     if (!file) return;
     
     setUploadingReceiptId(bookingId);
     try {
       const storage = getStorage();
       const timestamp = Date.now();
       const storageRef = ref(storage, `receipts/${bookingId}_${timestamp}`);
       
       await uploadBytes(storageRef, file);
       const url = await getDownloadURL(storageRef);
       
       const bookingRef = doc(db, 'bookings', bookingId);
       await updateDoc(bookingRef, {
         receiptImageUrl: url,
         receiptUploadedAt: serverTimestamp(),
         receiptUploadedBy: 'customer',
       });
       
       toast.success('Receipt uploaded successfully');
       setShowReceiptModal(null);
     } catch (error: any) {
       console.error('Receipt upload error:', error);
       toast.error(error.message || 'Failed to upload receipt');
     } finally {
       setUploadingReceiptId(null);
     }
   };

   const handleFileChange = (bookingId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       handleReceiptUpload(bookingId, file);
     }
   };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-50 text-island-emerald border-emerald-100';
      case 'pending': return 'bg-amber-50 text-island-sunset border-amber-100';
      case 'cancelled': return 'bg-rose-50 text-island-coral border-rose-100';
      case 'checked_out': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-stone-50 text-slate-500 border-stone-200';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'stay': return UilBuilding;
      case 'transport': return UilShip;
      case 'tour': return UilCompass;
      default: return UilTicket;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-40 flex items-center justify-center">
        <div className="bg-white rounded-[4rem] p-20 text-center border-2 border-stone-100 shadow-2xl max-w-md">
          <div className="w-24 h-24 volcanic-gradient text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl">
            <UilCompass size="48" />
          </div>
          <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-4">Sign In Required</h2>
          <p className="text-slate-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">Please log in to view your bookings and manage your adventures.</p>
          <Link to="/auth" className="btn-primary px-12 py-6 rounded-full inline-flex">
            Sign In <UilArrowLeft size="24" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-40">
        <div className="bg-white border-b-2 border-stone-100 pt-16 pb-12 shadow-sm">
          <div className="max-w-5xl mx-auto px-6">
            <div className="w-32 h-4 bg-slate-100 rounded animate-pulse mb-8" />
            <div className="w-64 h-10 bg-slate-100 rounded-xl animate-pulse mb-3" />
            <div className="w-48 h-5 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 mt-16 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[3.5rem] p-10 border-2 border-stone-100 shadow-xl">
              <div className="flex gap-10">
                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] animate-pulse" />
                <div className="flex-1 space-y-4">
                  <div className="w-48 h-5 bg-slate-100 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="w-24 h-8 bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <div className="bg-white border-b-2 border-stone-100 pt-16 pb-12 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-island-volcanic transition-all mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-slate-100 group-hover:bg-island-volcanic group-hover:text-white transition-colors">
              <UilArrowLeft size="16" />
            </div>
            <span className="text-xs font-semibold tracking-tight">Back to Home</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-island-emerald font-bold tracking-wider text-xs mb-3 block">My Bookings</span>
              <h1 className="text-5xl font-black text-island-volcanic tracking-tighter">Your Adventures.</h1>
              <p className="text-slate-500 font-medium text-lg mt-2">Manage your stays, transport, and tours.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="px-8 py-4 volcanic-gradient rounded-3xl border border-white/10 shadow-2xl">
                <span className="text-[10px] font-bold text-white/50 tracking-wider mb-1 block">Confirmed</span>
                <p className="text-3xl font-black text-island-emerald tracking-tighter">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16">
        {testError && (
          <div className="mb-10 p-6 bg-rose-50 text-rose-700 rounded-3xl border-2 border-rose-100 font-semibold text-sm shadow-xl">
            Error: {testError}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-12">
          <div className="flex gap-2 bg-white p-2 rounded-[2rem] border border-stone-100 shadow-sm">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                  statusFilter === f.id
                    ? 'volcanic-gradient text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 bg-white p-2 rounded-[2rem] border border-stone-100 shadow-sm">
            <button
              onClick={() => setReviewFilter(reviewFilter === 'all' ? 'reviewable' : 'all')}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold tracking-wider transition-all flex items-center gap-2 ${
                reviewFilter === 'reviewable'
                  ? 'bg-island-sunset text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UilStar size="12" />
              Reviewable
            </button>
          </div>
        </div>

        {(() => {
          if (bookings.length === 0) {
            return (
              <div className="bg-white rounded-[4rem] p-20 text-center border-2 border-stone-100 shadow-2xl">
                <div className="w-24 h-24 volcanic-gradient text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl">
                  <UilCompass size="48" />
                </div>
                <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-4">No bookings yet</h2>
                <p className="text-slate-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">Time to plan your adventure! Book a stay or transport to get started.</p>
                <Link to="/stay" className="btn-primary px-12 py-6 rounded-full inline-flex">
                  Explore Stays <UilAngleRightB size="24" />
                </Link>
              </div>
            );
          }

          const filteredBookings = bookings.filter(b => {
            if (statusFilter !== 'all' && b.status !== statusFilter) return false;
            if (reviewFilter === 'reviewable' && b.paymentStatus !== 'PAID' && b.paymentStatus !== 'VERIFIED') return false;
            return true;
          });

          if (filteredBookings.length === 0) {
            return (
              <div className="bg-white rounded-[4rem] p-20 text-center border-2 border-stone-100 shadow-2xl">
                <div className="w-24 h-24 volcanic-gradient text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl">
                  <UilSearch size="48" />
                </div>
                <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-4">No matching bookings</h2>
                <p className="text-slate-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">Try adjusting your filters to see more results.</p>
                <button onClick={() => { setStatusFilter('all'); setReviewFilter('all'); }} className="btn-primary px-12 py-6 rounded-full inline-flex">
                  Clear Filters
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-8">
              {filteredBookings.map((booking) => {
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
                          <Icon size="40" />
                        </div>
                        <div className={`px-5 py-2 rounded-full text-[10px] font-bold tracking-wider border-2 shadow-sm ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <span className="text-[10px] font-bold text-island-emerald tracking-wider bg-island-emerald/5 px-3 py-1 rounded-lg border border-island-emerald/10">
                            {booking.serviceType}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-300 tracking-tight">
                            Booking ID: {booking.id}
                          </span>
                          {booking.createdAt?.toDate && (
                            <span className="text-[10px] font-semibold text-slate-300 tracking-tight">
                              Booked: {booking.createdAt.toDate().toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-4xl font-black text-island-volcanic tracking-tighter mb-8 group-hover:text-island-emerald transition-colors duration-500">{booking.serviceName}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="flex items-center gap-4 text-slate-500 font-bold">
                            <UilCalendar size="20" className="text-island-emerald" />
                            <span className="text-sm tracking-tight">{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-500 font-bold">
                            <UilCreditCard size="20" className="text-island-emerald" />
                            <span className="text-xl font-black text-island-volcanic tracking-tighter">₱{booking.amount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                        {/* Right: Actions */}
                      <div className="flex flex-col justify-center gap-4 min-w-[200px]">
                        {(booking.status === 'confirmed' || booking.ticketCode) && (
                          <div className="flex flex-col items-center gap-1 bg-white py-4 rounded-[2rem] border-2 border-emerald-100 shadow-sm">
                            <QRCodeSVG
                              value={`${window.location.origin}/my-bookings?booking=${booking.id}`}
                              size={90}
                              level="M"
                            />
                            <span className="text-[9px] text-slate-400 font-semibold mt-1">Booking QR</span>
                          </div>
                        )}
                        {booking.ticketCode ? (
                          <>
                            <div className="flex flex-col items-center gap-2 text-island-emerald bg-emerald-50 py-5 rounded-[2rem] border-2 border-emerald-100 shadow-sm">
                              <UilCheckCircle size="24" />
                              <span className="text-xs font-bold tracking-wider">Paid</span>
                              <span className="text-2xl font-black tracking-widest text-island-volcanic select-all">{booking.ticketCode}</span>
                              <span className="text-[9px] text-slate-400 font-semibold">Present this code at the terminal</span>
                            </div>
                            <button
                              onClick={() => setReviewBookingId(booking.id)}
                              className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-island-sunset/20 text-island-sunset rounded-[2rem] text-[10px] font-bold tracking-wider hover:bg-island-sunset/5 transition-all"
                            >
                              <UilStar size="16" />
                              Write Review
                            </button>
                            <button
                              onClick={() => {
                                const route = booking.serviceType === 'stay' ? '/stay' : booking.serviceType === 'transport' ? '/transport' : '/';
                                navigate(route);
                              }}
                              className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-island-emerald/20 text-island-emerald rounded-[2rem] text-[10px] font-bold tracking-wider hover:bg-island-emerald/5 transition-all"
                            >
                              <UilRepeat size="16" />
                              Re-book
                            </button>
                          </>
                        ) : booking.paymentStatus === 'VERIFIED' ? (
                          <div className="flex items-center justify-center gap-3 text-island-emerald bg-emerald-50 py-5 rounded-[2rem] border-2 border-emerald-100 shadow-sm">
                            <UilCheckCircle size="24" />
                            <span className="text-xs font-bold tracking-wider">Payment Verified</span>
                          </div>
                        ) : booking.paymentStatus === 'PAID' ? (
                          <>
                            <div className="flex items-center justify-center gap-3 text-amber-600 bg-amber-50 py-5 rounded-[2rem] border-2 border-amber-100 shadow-sm">
                              <UilClock size="24" />
                              <span className="text-xs font-bold tracking-wider">Awaiting LGU Confirmation</span>
                            </div>
                          </>
                        ) : booking.status === 'cancelled' ? (
                          <div className="flex items-center justify-center gap-3 text-island-coral bg-rose-50 py-5 rounded-[2rem] border-2 border-rose-100">
                            <UilTimesCircle size="24" />
                            <span className="text-xs font-bold tracking-wider">Cancelled</span>
                          </div>
                        ) : (
                           <>
                             <button 
                               onClick={() => handleSimulatePayment(booking.id)}
                               disabled={processingId === booking.id}
                               className="btn-primary w-full py-5 rounded-[2rem] text-[10px]"
                             >
                               {processingId === booking.id ? (
                                 <UilRefresh size="20" className="animate-spin" />
                               ) : (
                                 <UilCreditCard size="20" />
                               )}
                               Mark Payment Complete
                             </button>
                             <button
                               onClick={() => {
                                 const eligibility = processRefundEligibility(booking, new Date());
                                 setCancellingBooking({ id: booking.id, eligibility });
                                 setCancelReason('');
                               }}
                               className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-rose-200 text-island-coral rounded-[2rem] text-[10px] font-bold tracking-wider hover:bg-rose-50 transition-all"
                             >
                               <UilTimesCircle size="16" />
                               Cancel Booking
                             </button>
                             <p className="text-[10px] text-center text-slate-400 font-semibold tracking-tight opacity-60">Transfer payment details shown above</p>
                           </>
                         )}
                      </div>
                    </div>

                    {/* Payment Details & Instructions */}
                    {booking.status === 'pending' && booking.paymentStatus !== 'PAID' && booking.paymentStatus !== 'VERIFIED' && (
                      <div className="mt-10 p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
                        <h4 className="font-bold text-blue-900 tracking-wider text-[10px] mb-4 block">BANK TRANSFER PAYMENT DETAILS</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                          <div>
                            <span className="text-blue-700 font-semibold block text-[9px] mb-1">Account Name</span>
                            <span className="text-blue-900 font-bold">{LANDBANK_DETAILS.accountName}</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-semibold block text-[9px] mb-1">Account Number</span>
                            <span className="text-blue-900 font-bold font-mono">{LANDBANK_DETAILS.accountNumber}</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-semibold block text-[9px] mb-1">Bank</span>
                            <span className="text-blue-900 font-bold">{LANDBANK_DETAILS.bankName}</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-semibold block text-[9px] mb-1">Amount</span>
                            <span className="text-blue-900 font-bold">₱{booking.amount?.toLocaleString()}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-blue-700 font-semibold block text-[9px] mb-1">Contact for Confirmation</span>
                            <p className="text-blue-900 font-bold">{LANDBANK_DETAILS.email} | {LANDBANK_DETAILS.phone}</p>
                          </div>
                        </div>
                      </div>
                     )}

                    {/* Receipt Upload Section - Show when payment status is PAID */}
                    {booking.paymentStatus === 'PAID' && booking.status === 'pending' && (
                      <div className="mt-10 p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-emerald-900 tracking-wider text-[10px]">
                            PAYMENT RECEIPT UPLOAD
                          </h4>
                          {booking.receiptImageUrl ? (
                            <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full text-[9px] font-bold">
                              ✓ Uploaded
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-[9px] font-bold">
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                        
                        <p className="text-emerald-700 text-[11px] font-semibold mb-4">
                          Upload a screenshot or photo of your bank transfer to complete the payment verification.
                        </p>

                        <div className="flex gap-3">
                          {booking.receiptImageUrl ? (
                            <>
                              <a
                                href={booking.receiptImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[10px] font-bold text-center hover:bg-emerald-700 transition-all"
                              >
                                📷 View Receipt
                              </a>
                              <button
                                onClick={() => setShowReceiptModal(booking.id)}
                                className="flex-1 px-4 py-3 bg-white text-emerald-600 rounded-lg text-[10px] font-bold border-2 border-emerald-600 hover:bg-emerald-50 transition-all"
                              >
                                📎 Change Receipt
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowReceiptModal(booking.id)}
                              disabled={uploadingReceiptId === booking.id}
                              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {uploadingReceiptId === booking.id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                <>📎 Upload Receipt</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Receipt Upload Modal */}
                    {showReceiptModal === booking.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-island-volcanic">Upload Receipt</h3>
                            <button
                              onClick={() => setShowReceiptModal(null)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <UilTimes size="20" />
                            </button>
                          </div>
                          
                          <div className="mb-6 p-6 bg-slate-50 rounded-2xl text-center border border-slate-200">
                            <p className="text-sm text-slate-600 mb-2">Service: <span className="font-bold">{booking.serviceName}</span></p>
                            <p className="text-sm text-slate-600 mb-2">Amount Paid: <span className="font-bold text-island-green">₱{booking.amount?.toLocaleString()}</span></p>
                            <p className="text-xs text-slate-500">Please upload proof of your bank transfer</p>
                          </div>

                          <label className="flex flex-col items-center justify-center p-8 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all">
                            <div className="text-3xl mb-2">📷</div>
                            <span className="text-sm font-bold text-emerald-600">Click to upload receipt</span>
                            <span className="text-xs text-slate-500 mt-1">PNG, JPG or PDF (Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,application/pdf"
                              onChange={handleFileChange(booking.id)}
                              disabled={uploadingReceiptId === booking.id}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {booking.status === 'pending' && booking.paymentStatus !== 'PAID' && booking.paymentStatus !== 'VERIFIED' && (
                      <div className="mt-10 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
                          <UilExclamationCircle size="20" />
                        </div>
                        <div>
                          <span className="font-bold text-amber-900 tracking-wider text-[10px] mb-1 block">Reminder</span>
                          <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic">
                            Transfer the payment to the account above, then contact us to confirm. Your booking will be confirmed once payment is verified.
                          </p>
                        </div>
                      </div>
                    )}
                    {booking.paymentStatus === 'PAID' && booking.status === 'pending' && !booking.ticketCode && (
                      <div className="mt-10 p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                          <UilClock size="20" />
                        </div>
                        <div>
                          <span className="font-bold text-blue-900 tracking-wider text-[10px] mb-1 block">LGU Processing</span>
                          <p className="text-[11px] text-blue-800 font-bold leading-relaxed italic">
                            Payment received. The LGU is processing your ticket — this usually takes a few minutes during office hours.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewBookingId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => setReviewBookingId(null)} />
            <div className="relative w-full max-w-lg">
              {(() => {
                const booking = bookings.find(b => b.id === reviewBookingId);
                if (!booking) return null;
                return (
                  <ReviewForm
                    bookingId={reviewBookingId}
                    businessId={booking.businessId || 'catarman_lgu'}
                    serviceId={booking.serviceId}
                    serviceName={booking.serviceName}
                    onClose={() => setReviewBookingId(null)}
                  />
                );
              })()}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <StripePaymentModal
            key="payment-modal"
            bookingId={showPaymentModal}
            bookingName={bookings.find(b => b.id === showPaymentModal)?.serviceName || 'Booking'}
            amount={bookings.find(b => b.id === showPaymentModal)?.amount || 0}
            onClose={() => setShowPaymentModal(null)}
            onSuccess={(id) => {
              setShowPaymentModal(null);
              toast.success('Payment successful!');
            }}
          />
        )}
      </AnimatePresence>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {cancellingBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => setCancellingBooking(null)} />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-island-volcanic">Cancel Booking</h3>
                <button onClick={() => setCancellingBooking(null)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-island-coral transition-all">
                  <UilTimes size="16" />
                </button>
              </div>

              {/* Refund Eligibility Info */}
              {cancellingBooking.eligibility === 'eligible' && (
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100 mb-6">
                  <UilCheckCircle size="24" className="text-island-emerald mb-2" />
                  <p className="text-sm font-bold text-island-emerald">Full Refund Available</p>
                  <p className="text-xs text-emerald-700 mt-1">Cancelled more than 48 hours before check-in. You're eligible for a full refund.</p>
                </div>
              )}
              {cancellingBooking.eligibility === 'pending' && (
                <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-100 mb-6">
                  <UilExclamationCircle size="24" className="text-amber-600 mb-2" />
                  <p className="text-sm font-bold text-amber-800">Partial/No Refund</p>
                  <p className="text-xs text-amber-700 mt-1">Cancelled less than 48 hours before check-in. Refund will be reviewed by the business.</p>
                </div>
              )}
              {cancellingBooking.eligibility === 'ineligible' && (
                <div className="p-5 bg-rose-50 rounded-2xl border-2 border-rose-100 mb-6">
                  <UilTimesCircle size="24" className="text-island-coral mb-2" />
                  <p className="text-sm font-bold text-island-coral">No Refund</p>
                  <p className="text-xs text-rose-700 mt-1">Unable to determine refund eligibility. The business will review your request.</p>
                </div>
              )}

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 rounded-xl border-2 border-stone-100 outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800 resize-none"
                  rows={3}
                  placeholder="Tell us why you're cancelling..."
                />
              </div>

              <button
                onClick={async () => {
                  try {
                    await requestCancellation(cancellingBooking.id, cancelReason || 'No reason provided');
                    setCancellingBooking(null);
                    toast.success('Booking cancelled');
                  } catch (error) {
                    handleFirestoreError(error, OperationType.UPDATE, `bookings/${cancellingBooking.id}`);
                  }
                }}
                disabled={processingId === cancellingBooking.id}
                className="w-full bg-island-coral text-white py-5 rounded-2xl font-bold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {processingId === cancellingBooking.id ? (
                  <UilRefresh size="20" className="animate-spin" />
                ) : (
                  <UilTimesCircle size="20" />
                )}
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

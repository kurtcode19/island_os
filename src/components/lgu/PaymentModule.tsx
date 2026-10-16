import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UilCreditCard as CreditCard, UilCheckCircle as CheckCircle, UilSearch as Search, UilClock as Clock, UilUser as User, UilCalendar as Calendar, UilMapPin as MapPin, UilDownloadAlt as Upload, UilFileAlt as Image, UilTimes as X } from '@/icons';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { LANDBANK_DETAILS } from '../../lib/paymentUtils';

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function PaymentModule() {
   const [pendingPayments, setPendingPayments] = useState<any[]>([]);
   const [confirmedPayments, setConfirmedPayments] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [processingId, setProcessingId] = useState<string | null>(null);
   const [showReceiptVerifyModal, setShowReceiptVerifyModal] = useState<string | null>(null);
   const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(
        collection(db, 'bookings'),
        where('paymentStatus', '==', 'UNPAID'),
        where('status', '==', 'pending')
      ),
      (snapshot) => {
        const payments = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((d: any) => d.receiptImageUrl);
        setPendingPayments(payments);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')
    );

    const unsub2 = onSnapshot(
      query(collection(db, 'bookings'), where('status', '==', 'confirmed')),
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setConfirmedPayments(docs.filter((d: any) => d.ticketCode));
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'bookings');
      }
    );

    return () => { unsub1(); unsub2(); };
  }, []);

     const handleConfirmPayment = async (booking: any) => {
       setProcessingId(booking.id);
       const ticketCode = generateTicketCode();
       try {
         await updateDoc(doc(db, 'bookings', booking.id), {
           status: 'confirmed',
           paymentStatus: 'VERIFIED',
           receiptVerifiedAt: serverTimestamp(),
           receiptVerifiedBy: 'operator',
           ticketCode,
           confirmedAt: serverTimestamp(),
         });
         toast.success(`Receipt verified! Ticket ${ticketCode} issued`);
       } catch (error) {
         handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
       } finally {
         setProcessingId(null);
       }
     };

    const handleVerifyReceipt = async (bookingId: string) => {
      setVerifyingId(bookingId);
      const ticketCode = generateTicketCode();
      try {
        await updateDoc(doc(db, 'bookings', bookingId), {
          status: 'confirmed',
          paymentStatus: 'VERIFIED',
          receiptVerifiedAt: serverTimestamp(),
          receiptVerifiedBy: 'operator',
          ticketCode,
          confirmedAt: serverTimestamp(),
        });
        toast.success(`Receipt verified! Ticket ${ticketCode} issued`);
        setShowReceiptVerifyModal(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
      } finally {
        setVerifyingId(null);
      }
    };

     const handleRejectReceipt = async (bookingId: string) => {
       setVerifyingId(bookingId);
       try {
         await updateDoc(doc(db, 'bookings', bookingId), {
           receiptImageUrl: null,
           receiptUploadedAt: null,
           receiptUploadedBy: null,
           receiptRejectedReason: 'Rejected by operator',
           receiptRejectedAt: serverTimestamp(),
         });
         toast.success('Receipt rejected. Customer needs to resubmit.');
         setShowReceiptVerifyModal(null);
       } catch (error) {
         handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
       } finally {
         setVerifyingId(null);
       }
     };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-island-emerald"></div>
      </div>
    );
  }

  const paymentsWithReceipts = confirmedPayments.filter(p => p.receiptImageUrl);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div>
        <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Payment <span className="not-italic text-island-emerald">Processing</span></h2>
        <p className="text-slate-500 font-light">Confirm tourist payments, issue tickets, and track receipt uploads.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100">
        <h4 className="text-lg font-bold text-island-volcanic mb-4 flex items-center gap-2">
          <CreditCard size="20" className="text-island-emerald" />
          Bank Account Details for Customer Transfers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Name</p>
            <p className="text-lg font-bold text-island-volcanic">{LANDBANK_DETAILS.accountName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
            <p className="text-lg font-bold text-island-volcanic font-mono">{LANDBANK_DETAILS.accountNumber}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bank</p>
            <p className="text-lg font-bold text-island-volcanic">{LANDBANK_DETAILS.bankName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Email</p>
            <p className="text-sm font-semibold text-island-green break-all">{LANDBANK_DETAILS.email}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
            <p className="text-lg font-bold text-island-volcanic">{LANDBANK_DETAILS.phone}</p>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-10 border-b border-slate-50 flex items-center gap-4">
           <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
             <Clock size="24" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Awaiting Receipt Verification</h3>
             <p className="text-sm text-slate-400 font-medium">{pendingPayments.length} receipt(s) uploaded</p>
           </div>
         </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tourist</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {pendingPayments.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-10 py-12 text-center text-slate-400 italic">No receipts awaiting verification.</td>
                 </tr>
              ) : (
                pendingPayments.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                     <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold">
                           {booking.touristName?.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-island-green">{booking.touristName}</p>
                           <p className="text-xs text-slate-400">{booking.touristEmail}</p>
                         </div>
                       </div>
                     </td>
                     <td className="px-10 py-6">
                       <p className="text-sm font-bold text-island-green">{booking.serviceName}</p>
                       <p className="text-xs text-slate-400 capitalize">{booking.serviceType}</p>
                     </td>
                     <td className="px-10 py-6">
                       <div className="flex items-center gap-2 text-sm text-slate-600">
                         <Calendar size="14" className="text-island-emerald" />
                         {booking.date}
                       </div>
                     </td>
                     <td className="px-10 py-6">
                       <p className="text-sm font-bold text-island-green">₱{booking.amount?.toLocaleString()}</p>
                     </td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() => setShowReceiptVerifyModal(booking.id)}
                          disabled={verifyingId === booking.id}
                          className="px-6 py-3 bg-island-emerald text-white rounded-2xl text-[10px] font-bold tracking-wider hover:bg-island-emerald/90 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                        >
                         {verifyingId === booking.id ? (
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                         ) : (
                           <Image size="16" />
                         )}
                         View & Verify Receipt
                       </button>
                     </td>
                   </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmed Tickets */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-10 border-b border-slate-50 flex items-center gap-4">
           <div className="p-3 rounded-2xl bg-emerald-50 text-island-emerald">
             <CreditCard size="24" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Verified & Confirmed</h3>
             <p className="text-sm text-slate-400 font-medium">{confirmedPayments.length} booking(s) confirmed</p>
           </div>
         </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket Code</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tourist</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receipt</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {confirmedPayments.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-10 py-12 text-center text-slate-400 italic">No confirmed bookings yet.</td>
                 </tr>
              ) : (
                confirmedPayments.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <span className="text-lg font-black tracking-widest text-island-volcanic select-all">{booking.ticketCode}</span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-bold text-island-green">{booking.touristName}</p>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-bold text-island-green">{booking.serviceName}</p>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-bold text-island-green">₱{booking.amount?.toLocaleString()}</p>
                    </td>
                     <td className="px-10 py-6">
                       {booking.receiptImageUrl ? (
                         <button
                           onClick={() => setShowReceiptVerifyModal(booking.id)}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-island-emerald rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-all"
                         >
                           <Image size="14" />
                           View Receipt
                         </button>
                       ) : (
                         <span className="text-slate-400 text-[10px] font-semibold">—</span>
                       )}
                     </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-island-emerald/10 text-island-emerald">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Verification Modal */}
      {showReceiptVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-island-volcanic">Verify Receipt & Confirm Booking</h3>
              <button
                onClick={() => setShowReceiptVerifyModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size="20" />
              </button>
            </div>

             {showReceiptVerifyModal && pendingPayments.find(b => b.id === showReceiptVerifyModal) && (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   {/* Receipt Image */}
                   <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                     {pendingPayments.find(b => b.id === showReceiptVerifyModal)?.receiptImageUrl && (
                       <img
                         src={pendingPayments.find(b => b.id === showReceiptVerifyModal)?.receiptImageUrl}
                         alt="Receipt"
                         className="w-full h-auto object-cover max-h-96"
                       />
                     )}
                   </div>

                   {/* Booking Details */}
                   <div className="space-y-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tourist Name</p>
                       <p className="text-lg font-bold text-island-volcanic">{pendingPayments.find(b => b.id === showReceiptVerifyModal)?.touristName}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service</p>
                       <p className="text-lg font-bold text-island-volcanic">{pendingPayments.find(b => b.id === showReceiptVerifyModal)?.serviceName}</p>
                     </div>
                     <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                       <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Amount to Verify</p>
                       <p className="text-2xl font-black text-island-green">₱{pendingPayments.find(b => b.id === showReceiptVerifyModal)?.amount?.toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                       <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">Payment Account</p>
                       <p className="text-sm font-bold text-blue-900">{LANDBANK_DETAILS.accountName}</p>
                       <p className="text-sm font-bold text-blue-900 font-mono">{LANDBANK_DETAILS.accountNumber}</p>
                     </div>
                   </div>
                 </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerifyReceipt(showReceiptVerifyModal)}
                    disabled={verifyingId === showReceiptVerifyModal}
                    className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verifyingId === showReceiptVerifyModal ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      '✓'
                    )}
                    Verify & Confirm Booking
                  </button>
                  <button
                    onClick={() => handleRejectReceipt(showReceiptVerifyModal)}
                    disabled={verifyingId === showReceiptVerifyModal}
                    className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-all disabled:opacity-50"
                  >
                    ✕ Reject Receipt
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

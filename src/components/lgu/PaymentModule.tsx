import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UilCreditCard as CreditCard, UilCheckCircle as CheckCircle, UilSearch as Search, UilClock as Clock, UilUser as User, UilCalendar as Calendar, UilMapPin as MapPin } from '@/icons';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, 'bookings'), where('paymentStatus', '==', 'PAID'), where('status', '==', 'pending')),
      (snapshot) => {
        setPendingPayments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
        ticketCode,
        confirmedAt: serverTimestamp(),
      });
      toast.success(`Ticket ${ticketCode} issued`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-island-emerald"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div>
        <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Payment <span className="not-italic text-island-emerald">Processing</span></h2>
        <p className="text-slate-500 font-light">Confirm tourist payments and issue ferry tickets.</p>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Clock size="24" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Awaiting Confirmation</h3>
            <p className="text-sm text-slate-400 font-medium">{pendingPayments.length} pending payment(s)</p>
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
                  <td colSpan={5} className="px-10 py-12 text-center text-slate-400 italic">No pending payments.</td>
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
                        onClick={() => handleConfirmPayment(booking)}
                        disabled={processingId === booking.id}
                        className="px-6 py-3 bg-island-emerald text-white rounded-2xl text-[10px] font-bold tracking-wider hover:bg-island-emerald/90 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                      >
                        {processingId === booking.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                          <CheckCircle size="16" />
                        )}
                        Confirm & Issue Ticket
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
            <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Issued Tickets</h3>
            <p className="text-sm text-slate-400 font-medium">{confirmedPayments.length} ticket(s) issued</p>
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
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {confirmedPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-12 text-center text-slate-400 italic">No tickets issued yet.</td>
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
    </motion.div>
  );
}

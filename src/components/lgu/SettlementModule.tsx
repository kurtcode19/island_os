import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UilExchange as Exchange, UilCheckCircle as CheckCircle, UilBuilding as Building, UilClock as Clock, UilRefresh as RefreshCw } from '@/icons';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { manualPayout as triggerPayout } from '../../lib/paymentUtils';

export default function SettlementModule() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingBusiness, setSettlingBusiness] = useState<string | null>(null);
  const [processingPayout, setProcessingPayout] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      where('paymentStatus', '==', 'PAID'),
      where('status', '==', 'confirmed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, []);

  const unsettledByBusiness = bookings
    .filter(b => !b.settledAt)
    .reduce<Record<string, { bookings: any[], total: number }>>((acc, b) => {
      const bid = b.businessId || 'unknown';
      if (!acc[bid]) acc[bid] = { bookings: [], total: 0 };
      acc[bid].bookings.push(b);
      acc[bid].total += b.amount || 0;
      return acc;
    }, {});

  const settledByBusiness = bookings
    .filter(b => b.settledAt)
    .reduce<Record<string, { bookings: any[], total: number }>>((acc, b) => {
      const bid = b.businessId || 'unknown';
      if (!acc[bid]) acc[bid] = { bookings: [], total: 0 };
      acc[bid].bookings.push(b);
      acc[bid].total += b.amount || 0;
      return acc;
    }, {});

  const handleMarkSettled = async (businessId: string) => {
    setSettlingBusiness(businessId);
    const batch = writeBatch(db);
    const toSettle = unsettledByBusiness[businessId]?.bookings || [];
    toSettle.forEach(b => {
      batch.update(doc(db, 'bookings', b.id), { settledAt: serverTimestamp() });
    });
    try {
      await batch.commit();
      toast.success(`${toSettle.length} booking(s) settled for ${businessId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bookings/batch');
    } finally {
      setSettlingBusiness(null);
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Settlement <span className="not-italic text-island-emerald">Ledger</span></h2>
          <p className="text-slate-500 font-light">Track and settle payments owed to service providers.</p>
        </div>
        <button
          onClick={async () => {
            setProcessingPayout(true);
            try {
              const result = await triggerPayout();
              toast.success(`Payouts created: ${result.businessCount} business(es), ${result.bookingCount} booking(s)`);
            } catch (err: any) {
              toast.error(err.message || 'Payout processing failed');
            } finally {
              setProcessingPayout(false);
            }
          }}
          disabled={processingPayout}
          className="px-8 py-4 bg-island-emerald text-white rounded-2xl text-xs font-bold tracking-wider hover:bg-island-green transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg"
        >
          {processingPayout ? <RefreshCw size="16" className="animate-spin" /> : <Exchange size="16" />}
          {processingPayout ? 'Processing...' : 'Process Payouts'}
        </button>
      </div>

      {/* Unsettled */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Clock size="24" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Unsettled</h3>
            <p className="text-sm text-slate-400 font-medium">Amounts owed to providers</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provider</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bookings</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Owed</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.keys(unsettledByBusiness).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-12 text-center text-slate-400 italic">All bookings are settled.</td>
                </tr>
              ) : (
                Object.entries(unsettledByBusiness).map(([businessId, data]) => (
                  <tr key={businessId} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald">
                          <Building size="18" />
                        </div>
                        <span className="text-sm font-bold text-island-green capitalize">{businessId.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-island-green">{data.bookings.length}</td>
                    <td className="px-10 py-6">
                      <span className="text-lg font-black text-island-volcanic">₱{data.total.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => handleMarkSettled(businessId)}
                        disabled={settlingBusiness === businessId}
                        className="px-6 py-3 bg-island-emerald text-white rounded-2xl text-[10px] font-bold tracking-wider hover:bg-island-emerald/90 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                      >
                        {settlingBusiness === businessId ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                          <CheckCircle size="16" />
                        )}
                        Mark as Settled
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Settled */}
      {Object.keys(settledByBusiness).length > 0 && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-island-emerald">
              <Exchange size="24" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Settled</h3>
              <p className="text-sm text-slate-400 font-medium">Completed settlements</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provider</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bookings</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.entries(settledByBusiness).map(([businessId, data]) => (
                  <tr key={businessId} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-island-emerald">
                          <Building size="18" />
                        </div>
                        <span className="text-sm font-bold text-island-green capitalize">{businessId.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-island-green">{data.bookings.length}</td>
                    <td className="px-10 py-6">
                      <span className="text-lg font-black text-island-volcanic">₱{data.total.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

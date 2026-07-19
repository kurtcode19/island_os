import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';
import { UilCheckCircle, UilTimesCircle, UilBuilding, UilSearch, UilRefresh, UilArrowRight } from '@/icons';

interface BusinessEntry {
  id: string;
  name: string;
  ownerUid?: string;
  businessType: string;
  category?: string;
  description?: string;
  address?: string;
  contact?: string;
  verified?: boolean;
}

export default function BusinessApprovalModule() {
  const [businesses, setBusinesses] = useState<BusinessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'businesses'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessEntry));
      setBusinesses(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'businesses');
    }
    setLoading(false);
  };

  const handleApprove = async (businessId: string) => {
    setApproving(businessId);
    try {
      await updateDoc(doc(db, 'businesses', businessId), { verified: true });
      setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, verified: true } : b));
      toast.success('Business approved');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${businessId}`);
    }
    setApproving(null);
  };

  const unverified = businesses.filter(b => !b.verified);
  const verified = businesses.filter(b => b.verified);

  const filteredUnverified = unverified.filter(b =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-island-emerald" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-island-volcanic tracking-tighter">Business Approvals</h2>
          <p className="text-sm text-slate-500 font-medium">{unverified.length} pending, {verified.length} approved</p>
        </div>
        <button
          onClick={loadBusinesses}
          className="p-3 bg-stone-50 rounded-xl text-slate-400 hover:text-island-emerald transition-all"
        >
          <UilRefresh size="18" />
        </button>
      </div>

      <div className="relative">
        <UilSearch size="16" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search businesses..."
          className="w-full pl-10 pr-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-xl outline-none focus:border-island-emerald/30 text-sm font-semibold"
        />
      </div>

      {filteredUnverified.length === 0 ? (
        <div className="text-center py-16">
          <UilCheckCircle size="48" className="mx-auto text-island-emerald mb-4" />
          <p className="text-slate-500 font-semibold">All businesses are approved!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUnverified.map(biz => (
            <motion.div
              key={biz.id}
              layout
              className="p-6 bg-white rounded-3xl border-2 border-amber-100 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <UilBuilding size="20" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-island-volcanic">{biz.name}</h3>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">{biz.businessType}</span>
                    </div>
                  </div>
                  {biz.address && (
                    <p className="text-xs text-slate-500 font-medium ml-[52px]">{biz.address}</p>
                  )}
                  {biz.ownerUid && (
                    <p className="text-[10px] text-slate-400 font-mono ml-[52px] mt-1">Owner: {biz.ownerUid}</p>
                  )}
                </div>
                <button
                  onClick={() => handleApprove(biz.id)}
                  disabled={approving === biz.id}
                  className="shrink-0 px-6 py-3 bg-island-emerald text-white rounded-2xl text-xs font-bold hover:bg-island-green transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {approving === biz.id ? (
                    <UilRefresh size="14" className="animate-spin" />
                  ) : (
                    <UilCheckCircle size="14" />
                  )}
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {verified.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-bold text-slate-400 hover:text-island-volcanic transition-colors">
            Approved Businesses ({verified.length})
          </summary>
          <div className="mt-4 space-y-2">
            {verified.map(biz => (
              <div key={biz.id} className="p-4 bg-stone-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UilCheckCircle size="16" className="text-island-emerald" />
                  <span className="text-sm font-semibold text-island-volcanic">{biz.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">({biz.businessType})</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </motion.div>
  );
}

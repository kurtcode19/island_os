import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const demoBusinesses = [
  { id: 'biz-resort-1', name: 'Blue Lagoon Resort & Spa', type: 'Stay' },
  { id: 'biz-lodge-1', name: 'Volcanic Eco-Lodge', type: 'Stay' },
  { id: 'biz-homestay-1', name: 'White Island Homestay', type: 'Stay' },
  { id: 'island_hopping_co', name: 'White Island Sandbar', type: 'Experience' },
  { id: 'camiguin_divers', name: 'Sunken Cemetery Diving', type: 'Experience' },
  { id: 'ferry_co', name: 'Fast Craft Ferry', type: 'Transport' },
  { id: 'van_rentals_inc', name: 'Private Van Rental', type: 'Transport' },
];

export default function ClaimBusinessView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [customId, setCustomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClaim = async (businessId: string) => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...profile,
        role: 'BUSINESS',
        businessId: businessId
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/business');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-island-cream pt-12 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-island-emerald/10 rounded-full flex items-center justify-center text-island-emerald mx-auto mb-6">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-island-green italic mb-4">Claim Your <span className="not-italic text-island-emerald">Business</span></h1>
          <p className="text-slate-500 font-light max-w-lg mx-auto">
            Associate your account with a business ID to access the Business Dashboard and manage your bookings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Custom ID Entry */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-island-green mb-6 italic">Enter Business ID</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Business ID</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="e.g. biz-resort-1"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-island-green font-bold outline-none focus:border-island-emerald transition-all"
                  />
                  <Search size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
              <button 
                onClick={() => handleClaim(customId)}
                disabled={!customId || loading || success}
                className="w-full py-4 island-gradient text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-island-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : success ? 'Success!' : 'Claim Business'}
              </button>
            </div>
          </div>

          {/* Demo Businesses */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-island-green mb-6 italic">Demo Businesses</h2>
            <div className="space-y-3">
              {demoBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleClaim(biz.id)}
                  disabled={loading || success}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-island-emerald/5 border border-slate-100 hover:border-island-emerald/20 transition-all group"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-island-green">{biz.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{biz.type} • {biz.id}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-island-emerald transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 bg-island-emerald/10 border border-island-emerald/20 rounded-[2.5rem] flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-island-emerald rounded-full flex items-center justify-center text-white mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-island-green mb-2 italic">Business Claimed!</h3>
            <p className="text-island-emerald font-bold uppercase tracking-widest text-xs mb-6">Redirecting to your dashboard...</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-island-green font-bold text-sm">
                <ShieldCheck size={20} className="text-island-emerald" />
                Role: BUSINESS
              </div>
              <div className="w-px h-4 bg-island-emerald/20"></div>
              <div className="flex items-center gap-2 text-island-green font-bold text-sm">
                <LayoutDashboard size={20} className="text-island-emerald" />
                Dashboard: Active
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

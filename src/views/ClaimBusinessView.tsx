import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, LayoutDashboard, Search, Sparkles, RefreshCw, Hotel, MapPin, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { accommodations } from '../data/accommodations';

const activeBusinesses = accommodations
  .filter((a, idx, self) => self.findIndex(b => b.businessId === a.businessId) === idx)
  .map(a => ({
    id: a.businessId,
    name: a.name,
    type: a.type,
    tags: a.tags.slice(0, 2)
  }));

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
    <div className="min-h-screen bg-[#F0FDF4] pt-20 pb-32 selection:bg-island-emerald/20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 forest-gradient rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl border border-white/10">
            <Building2 size={48} strokeWidth={2} />
          </div>
          <h1 className="text-5xl font-black text-island-volcanic tracking-tighter mb-4">Claim a <span className="text-island-emerald">Business.</span></h1>
          <p className="text-island-green/60 font-medium text-lg max-w-lg mx-auto">
            Register your business to manage bookings, reviews, and analytics on the Catarman platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Custom ID Entry */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
            <h2 className="text-2xl font-black text-island-volcanic tracking-tighter mb-8">Manual Entry</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 tracking-tight block mb-3 px-2">Business ID</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="e.g. biz-olympia-1"
                    className="w-full px-8 py-5 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl text-island-green font-bold outline-none focus:border-island-emerald transition-all shadow-inner"
                  />
                  <Search size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-200" strokeWidth={3} />
                </div>
              </div>
              <button 
                onClick={() => handleClaim(customId)}
                disabled={!customId || loading || success}
                className="btn-primary w-full py-6 rounded-2xl text-sm"
              >
                {loading ? (
                   <RefreshCw size={22} className="animate-spin" />
                ) : success ? (
                   <CheckCircle2 size={22} />
                ) : (
                  <>Claim Business <ArrowRight size={20} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>

          {/* Active Businesses */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
            <h2 className="text-2xl font-black text-island-volcanic tracking-tighter mb-2">Active Directory</h2>
            <p className="text-island-green/60 font-medium text-sm mb-8">Select a business to claim and manage its bookings.</p>
            <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
              {activeBusinesses.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-10">No businesses available yet.</p>
              )}
              {activeBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleClaim(biz.id)}
                  disabled={loading || success}
                  className="w-full flex items-center justify-between p-6 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border-2 border-transparent hover:border-island-emerald/20 transition-all group shadow-sm active:scale-[0.98]"
                >
                  <div className="text-left">
                    <p className="text-sm font-black text-island-volcanic leading-none mb-1">{biz.name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">{biz.type}</p>
                    <div className="flex gap-2">
                      {biz.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-bold text-island-emerald bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-200 group-hover:text-island-emerald shadow-sm group-hover:shadow-md transition-all shrink-0">
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-16 p-10 forest-gradient text-white rounded-[4rem] flex flex-col items-center text-center shadow-3xl border border-white/10 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <Sparkles size={200} className="translate-x-10 -translate-y-10 rotate-12" />
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl border border-white/20">
              <CheckCircle2 size={40} strokeWidth={3} />
            </div>
            <h3 className="text-4xl font-black tracking-tighter mb-3 leading-none">Business Registered!</h3>
            <p className="text-emerald-100/60 font-medium text-sm mb-10">Redirecting to your dashboard...</p>
            <div className="flex items-center gap-8 py-6 px-10 bg-black/20 rounded-[2rem] border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} strokeWidth={2.5} className="text-island-emerald" />
                <span className="text-sm font-semibold tracking-tight">Business Account</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-3">
                <LayoutDashboard size={24} strokeWidth={2.5} className="text-island-emerald" />
                <span className="text-sm font-semibold tracking-tight">Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, LayoutDashboard, Search, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const demoBusinesses = [
  { id: 'biz-resort-1', name: 'Blue Lagoon Resort & Spa', type: 'Stay' },
  { id: 'biz-lodge-1', name: 'Volcanic Eco-Lodge', type: 'Stay' },
  { id: 'biz-homestay-1', name: 'White Island Homestay', type: 'Stay' },
  { id: 'biz-glamping-1', name: 'Hibok-Hibok Glamping', type: 'Stay' },
  { id: 'island_hopping_co', name: 'White Island Sandbar', type: 'Experience' },
  { id: 'camiguin_divers', name: 'Sunken Cemetery Diving', type: 'Experience' },
  { id: 'mountain_guides', name: 'Hibok-Hibok Volcano Hike', type: 'Experience' },
  { id: 'nature_parks', name: 'Katibawasan Falls', type: 'Experience' },
  { id: 'ferry_co', name: 'Fast Craft Ferry', type: 'Transport' },
  { id: 'van_rentals_inc', name: 'Private Van Rental', type: 'Transport' },
  { id: 'local_bikes', name: 'Scooter Rental', type: 'Transport' },
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
          <h1 className="text-5xl font-black text-island-volcanic tracking-tighter mb-4">Node <span className="text-island-emerald">Registration.</span></h1>
          <p className="text-island-green/60 font-semibold text-lg max-w-lg mx-auto">
            Associate your digital identity with a municipal business node to access operational telemetry and manifests.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Custom ID Entry */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
            <h2 className="text-2xl font-black text-island-volcanic tracking-tighter mb-8">Manual Entry</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-2">Assigned Business ID</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="e.g. biz-resort-1"
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
                  <>Manifest Node <ArrowRight size={20} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>

          {/* Demo Businesses */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
            <h2 className="text-2xl font-black text-island-volcanic tracking-tighter mb-8">Active Directory</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {demoBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleClaim(biz.id)}
                  disabled={loading || success}
                  className="w-full flex items-center justify-between p-6 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border-2 border-transparent hover:border-island-emerald/20 transition-all group shadow-sm active:scale-[0.98]"
                >
                  <div className="text-left">
                    <p className="text-sm font-black text-island-volcanic leading-none mb-1">{biz.name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{biz.type} • {biz.id}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-200 group-hover:text-island-emerald shadow-sm group-hover:shadow-md transition-all">
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
            <h3 className="text-4xl font-black tracking-tighter mb-3 leading-none">Node Sync Active.</h3>
            <p className="text-emerald-100/60 font-bold uppercase tracking-[0.2em] text-xs mb-10">Initializing operational interface...</p>
            <div className="flex items-center gap-8 py-6 px-10 bg-black/20 rounded-[2rem] border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} strokeWidth={2.5} className="text-island-emerald" />
                <span className="text-sm font-black uppercase tracking-widest">BUSINESS</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-3">
                <LayoutDashboard size={24} strokeWidth={2.5} className="text-island-emerald" />
                <span className="text-sm font-black uppercase tracking-widest">LIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UilBuilding, UilCheckCircle, UilArrowRight, UilShieldCheck, UilDashboard, UilSearch, UilStar, UilRefresh, UilCar, UilShip, UilBell, UilShoppingBag } from '@/icons';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { businesses, BusinessEntry } from '../data/businesses';
import { BusinessType, BUSINESS_TYPE_CONFIGS } from '../types';

const typeIcons: Record<BusinessType, any> = {
  accommodation: UilBuilding,
  rental: UilCar,
  transport: UilShip,
  service: UilBell,
  shop: UilShoppingBag,
};

export default function ClaimBusinessView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [customId, setCustomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState<BusinessType | 'all'>('all');

  const filteredBusinesses = selectedType === 'all'
    ? businesses
    : businesses.filter(b => b.businessType === selectedType);

  const handleClaim = async (biz: BusinessEntry) => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...profile,
        role: 'BUSINESS',
        businessId: biz.id,
      }, { merge: true });

      const businessRef = doc(db, 'businesses', biz.id);
      await setDoc(businessRef, {
        id: biz.id,
        name: biz.name,
        ownerUid: user.uid,
        businessType: biz.businessType,
        category: biz.category,
        description: biz.description,
        address: biz.location,
        contact: biz.contact,
        verified: false,
        images: [biz.image],
        createdAt: serverTimestamp(),
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

  const typeBadge = (type: BusinessType) => (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
      type === 'accommodation' ? 'text-purple-600 bg-purple-50 border-purple-100' :
      type === 'rental' ? 'text-blue-600 bg-blue-50 border-blue-100' :
      type === 'transport' ? 'text-cyan-600 bg-cyan-50 border-cyan-100' :
      type === 'shop' ? 'text-orange-600 bg-orange-50 border-orange-100' :
      'text-green-600 bg-green-50 border-green-100'
    }`}>
      {BUSINESS_TYPE_CONFIGS[type]?.label || type}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F0FDF4] pt-20 pb-32 selection:bg-island-emerald/20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-24 h-24 forest-gradient rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl border border-white/10">
            <UilBuilding size="48" />
          </div>
          <h1 className="text-5xl font-black text-island-volcanic tracking-tighter mb-4">Claim a <span className="text-island-emerald">Business.</span></h1>
          <p className="text-island-green/60 font-medium text-lg max-w-lg mx-auto">
            Register your business to manage bookings, reviews, and analytics on the Catarman platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Custom ID Entry */}
          <div className="md:col-span-2 bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
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
                  <UilSearch size="22" className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-200" />
                </div>
              </div>
              <button 
                onClick={() => {
                  const biz = businesses.find(b => b.id === customId);
                  if (biz) handleClaim(biz);
                }}
                disabled={!customId || loading || success || !businesses.find(b => b.id === customId)}
                className="btn-primary w-full py-6 rounded-2xl text-sm"
              >
                {loading ? (
                   <UilRefresh size="22" className="animate-spin" />
                ) : success ? (
                   <UilCheckCircle size="22" />
                ) : (
                  <>Claim Business <UilArrowRight size="20" /></>
                )}
              </button>
              {customId && !businesses.find(b => b.id === customId) && (
                <p className="text-[10px] text-island-coral font-medium text-center">Business ID not found in directory</p>
              )}
            </div>
          </div>

          {/* Active Businesses Directory */}
          <div className="md:col-span-3 bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
            <h2 className="text-2xl font-black text-island-volcanic tracking-tighter mb-2">Active Directory</h2>
            <p className="text-island-green/60 font-medium text-sm mb-4">Select a business to claim and manage.</p>

            {/* Type filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedType === 'all' ? 'bg-island-emerald text-white' : 'bg-emerald-50 text-island-green/60 hover:bg-emerald-100'
                }`}
              >
                All
              </button>
              {(['accommodation', 'rental', 'transport'] as BusinessType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedType === type ? 'bg-island-emerald text-white' : 'bg-emerald-50 text-island-green/60 hover:bg-emerald-100'
                  }`}
                >
                  {React.createElement(typeIcons[type], { size: "14" })}
                  {BUSINESS_TYPE_CONFIGS[type]?.label || type}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
              {filteredBusinesses.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-10">No businesses available in this category.</p>
              )}
              {filteredBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleClaim(biz)}
                  disabled={loading || success}
                  className="w-full flex items-center justify-between p-6 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border-2 border-transparent hover:border-island-emerald/20 transition-all group shadow-sm active:scale-[0.98]"
                >
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-black text-island-volcanic leading-none truncate">{biz.name}</p>
                      {typeBadge(biz.businessType)}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium mb-2">{biz.location}</p>
                    <div className="flex gap-2 flex-wrap">
                      {biz.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[8px] font-bold text-island-emerald bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-200 group-hover:text-island-emerald shadow-sm group-hover:shadow-md transition-all shrink-0 ml-4">
                    <UilArrowRight size="16" />
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
              <UilStar size="200" className="translate-x-10 -translate-y-10 rotate-12" />
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl border border-white/20">
              <UilCheckCircle size="40" />
            </div>
            <h3 className="text-4xl font-black tracking-tighter mb-3 leading-none">Business Registered!</h3>
            <p className="text-emerald-100/60 font-medium text-sm mb-10">Redirecting to your dashboard...</p>
            <div className="flex items-center gap-8 py-6 px-10 bg-black/20 rounded-[2rem] border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <UilShieldCheck size="24" className="text-island-emerald" />
                <span className="text-sm font-semibold tracking-tight">Business Account</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-3">
                <UilDashboard size="24" className="text-island-emerald" />
                <span className="text-sm font-semibold tracking-tight">Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

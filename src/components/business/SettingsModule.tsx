import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, CreditCard, Globe, Save, Camera, ChevronRight, Building2, MapPin, Phone, Mail, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { businesses as staticBusinesses } from '../../data/businesses';
import { BusinessType, BUSINESS_TYPE_CONFIGS } from '../../types';

export default function SettingsModule() {
  const { profile } = useAuth();
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('Business');
  const [businessLocation, setBusinessLocation] = useState('');
  const [businessContact, setBusinessContact] = useState('');

  useEffect(() => {
    if (!profile?.businessId) return;
    const load = async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', profile.businessId!));
        if (bizDoc.exists()) {
          const data = bizDoc.data();
          setBusinessType(data.businessType as BusinessType);
          setBusinessName(data.name || 'Business');
          setBusinessLocation(data.address || '');
          setBusinessContact(data.contact || '');
          return;
        }
      } catch {}
      const staticBiz = staticBusinesses.find(b => b.id === profile.businessId);
      if (staticBiz) {
        setBusinessType(staticBiz.businessType);
        setBusinessName(staticBiz.name);
        setBusinessLocation(staticBiz.location);
        setBusinessContact(staticBiz.contact);
      }
    };
    load();
  }, [profile?.businessId]);

  const config = businessType ? BUSINESS_TYPE_CONFIGS[businessType] : null;
  const initials = businessName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-island-volcanic tracking-tighter">{config?.label || 'Business'} <span className="text-island-emerald">Settings.</span></h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Configure your {config?.label?.toLowerCase() || 'business'} profile and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          {[
            { label: 'Profile', icon: User, active: true },
            { label: 'Notifications', icon: Bell, active: false },
            { label: 'Security', icon: Shield, active: false },
            { label: 'Billing', icon: CreditCard, active: false },
            { label: 'Integrations', icon: Globe, active: false },
          ].map((item, idx) => (
            <button 
              key={idx}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${item.active ? 'emerald-gradient text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-emerald-50/50 border-2 border-slate-100'}`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} strokeWidth={2.5} />
                {item.label}
              </div>
              <ChevronRight size={16} strokeWidth={3} className={item.active ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-8">Business Profile</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold text-2xl border-4 border-white shadow-lg">
                    {initials}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2.5 bg-island-emerald text-white rounded-xl shadow-md border-2 border-white hover:scale-110 transition-all">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h4 className="text-lg font-black text-island-volcanic tracking-tighter">{businessName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {businessType && (
                      <span className="text-[10px] font-bold text-island-emerald bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        {config?.label || businessType}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Since 2026</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Building2 size={12} /> Business Name
                  </label>
                  <input type="text" defaultValue={businessName} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Tag size={12} /> Business Type
                  </label>
                  <input type="text" defaultValue={config?.label || businessType || 'Business'} disabled
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-island-green font-bold opacity-60 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <MapPin size={12} /> Location
                  </label>
                  <input type="text" defaultValue={businessLocation} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Phone size={12} /> Contact
                  </label>
                  <input type="text" defaultValue={businessContact} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Mail size={12} /> Contact Email
                  </label>
                  <input type="email" defaultValue={profile?.email || ''} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-4">Dashboard Modules</h3>
            <p className="text-slate-500 font-medium text-sm mb-8">Active modules for your {config?.label?.toLowerCase() || 'business'} type</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {config?.modules.map(mod => (
                <div key={mod} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-island-emerald shadow-sm" />
                  <span className="text-xs font-bold text-island-green capitalize">{mod}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-8">Location Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-island-emerald shadow-sm">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-island-green text-sm">Public Visibility</h4>
                    <p className="text-xs text-slate-400">Show your business on the island map.</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-island-emerald rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

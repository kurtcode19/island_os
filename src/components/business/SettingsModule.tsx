import { motion } from 'motion/react';
import { User, Bell, Shield, CreditCard, Globe, Save, Camera, ChevronRight } from 'lucide-react';

export default function SettingsModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-island-green italic">Business <span className="not-italic text-island-emerald">Settings</span></h2>
        <button className="px-8 py-3 island-gradient text-white rounded-2xl font-bold text-sm shadow-lg shadow-island-emerald/20 transition-all flex items-center gap-2">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar */}
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
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-bold text-sm ${item.active ? 'bg-island-emerald text-white shadow-lg shadow-island-emerald/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                {item.label}
              </div>
              <ChevronRight size={16} className={item.active ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-island-green mb-8">Business Profile</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold text-2xl border-4 border-white shadow-lg">
                    BR
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2.5 bg-island-emerald text-white rounded-xl shadow-md border-2 border-white hover:scale-110 transition-all">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h4 className="text-lg font-serif font-bold text-island-green">Beachfront Resort</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Premium Partner • Since 2024</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                  <input type="text" defaultValue="Beachfront Resort" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                  <input type="email" defaultValue="hello@beachfront.com" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea rows={4} defaultValue="The most beautiful beachfront resort on the island, offering premium services and unforgettable experiences." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green resize-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-island-green mb-8">Location Settings</h3>
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

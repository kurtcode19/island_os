import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bed, 
  Plane, 
  Car, 
  Package, 
  Camera, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  Search,
  ChevronDown
} from 'lucide-react';

export function SearchWidget({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [activeTab, setActiveTab] = useState('stays');
  
  const tabs = [
    { id: 'stays', label: 'Stays', icon: Bed },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'things', label: 'Things to do', icon: Camera },
  ];

  if (variant === 'mobile') {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-6 border border-slate-100 w-full">
        <div className="flex gap-6 overflow-x-auto no-scrollbar mb-8 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-2 min-w-fit transition-all ${
                activeTab === tab.id ? 'text-island-emerald' : 'text-slate-400'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === tab.id ? 'bg-island-emerald/10 scale-110' : 'bg-slate-50'
              }`}>
                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <MapPin size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Where to?" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-island-emerald/20 transition-all outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <CalendarIcon size={18} />
              </div>
              <div className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold flex flex-col justify-center">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">Dates</span>
                <span>Jun 15 - 18</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Users size={18} />
              </div>
              <div className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold flex flex-col justify-center">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">Travelers</span>
                <span>2 Guests</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-island-volcanic text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
            <Search size={18} />
            Search Experiences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-10 border border-slate-100 w-full max-w-6xl">
      <div className="flex gap-12 border-b border-slate-100 mb-10 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex flex-col items-center gap-4 group min-w-fit pb-6"
          >
            <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${
              activeTab === tab.id ? 'bg-island-volcanic text-white scale-110 shadow-xl' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
            }`}>
              <tab.icon size={26} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            </div>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
              activeTab === tab.id ? 'text-island-volcanic' : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="searchActiveTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-island-volcanic rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-island-emerald transition-colors">
              <MapPin size={22} />
            </div>
            <div className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl transition-all focus-within:ring-4 focus-within:ring-island-emerald/5 focus-within:bg-white focus-within:border-island-emerald/20">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Destination</label>
              <input 
                type="text" 
                placeholder="Where to?" 
                className="w-full bg-transparent text-sm font-bold text-island-volcanic outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="relative group cursor-pointer">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors">
              <CalendarIcon size={22} />
            </div>
            <div className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-slate-100 transition-all">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 text-left">Check-in / Out</label>
              <div className="text-sm font-bold text-island-volcanic flex items-center justify-between">
                <span>Jun 15 - Jun 18</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="relative group cursor-pointer">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors">
              <Users size={22} />
            </div>
            <div className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-slate-100 transition-all">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 text-left">Travelers</label>
              <div className="text-sm font-bold text-island-volcanic flex items-center justify-between">
                <span>2 travelers, 1 room</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <button className="w-full lg:w-auto px-12 py-8 bg-island-volcanic text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-island-volcanic/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
          <Search size={22} />
          Search
        </button>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-island-emerald focus:ring-island-emerald/20 transition-all cursor-pointer" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600">Add a flight</span>
        </label>
      </div>
    </div>
  );
}

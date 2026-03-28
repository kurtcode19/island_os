import { motion } from 'motion/react';
import { Anchor, Ship, Search, Filter, Download, ArrowUpRight, ArrowDownRight, Clock, MapPin, AlertCircle } from 'lucide-react';

const vessels = [
  { id: 'VS-102', name: 'Island Express', type: 'Fast Craft', arrival: '09:30 AM', departure: '10:30 AM', status: 'Docked', capacity: '120/150', origin: 'Balingoan' },
  { id: 'VS-103', name: 'Ocean Queen', type: 'RoRo', arrival: '11:00 AM', departure: '12:30 PM', status: 'Approaching', capacity: '240/300', origin: 'Cagayan de Oro' },
  { id: 'VS-104', name: 'Sea Breeze', type: 'Fast Craft', arrival: '01:15 PM', departure: '02:00 PM', status: 'Scheduled', capacity: '0/150', origin: 'Balingoan' },
  { id: 'VS-105', name: 'Island Spirit', type: 'RoRo', arrival: '03:30 PM', departure: '05:00 PM', status: 'Scheduled', capacity: '0/300', origin: 'Jagna' },
];

export default function PortModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Port <span className="not-italic text-island-emerald">Authority</span></h2>
          <p className="text-slate-500 font-light">Management of vessel arrivals, departures, and port operations.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Export Log
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 island-gradient text-white rounded-2xl font-bold text-sm shadow-lg shadow-island-emerald/20 transition-all flex items-center justify-center gap-2">
            <Anchor size={18} /> Manage Berths
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Vessels Today', value: '18', change: '+2', isPositive: true, icon: Ship, color: 'emerald' },
          { label: 'Avg. Turnaround', value: '45m', change: '-5m', isPositive: true, icon: Clock, color: 'ocean' },
          { label: 'Total Passengers', value: '2,450', change: '+12%', isPositive: true, icon: ArrowUpRight, color: 'purple' },
          { label: 'Port Capacity', value: '64%', change: 'Normal', isPositive: true, icon: AlertCircle, color: 'coral' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-island-${stat.color}/10 text-island-${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full ${stat.isPositive ? 'bg-island-emerald/10 text-island-emerald' : 'bg-island-coral/10 text-island-coral'}`}>
                {stat.change}
              </div>
            </div>
            <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</h4>
            <p className="text-3xl font-bold text-island-green">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Vessel Schedule */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green italic">Vessel <span className="not-italic text-island-emerald">Schedule</span></h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search vessel..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-island-green"
                />
              </div>
              <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {vessels.map((vessel, idx) => (
              <div key={vessel.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-50 hover:border-island-emerald/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                  <div className={`w-14 h-14 rounded-2xl bg-island-ocean/10 flex items-center justify-center text-island-ocean group-hover:bg-island-emerald/10 group-hover:text-island-emerald transition-colors`}>
                    <Ship size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-island-green text-lg">{vessel.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{vessel.type} • {vessel.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrival</p>
                    <p className="text-sm font-bold text-island-green">{vessel.arrival}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                    <p className="text-sm font-bold text-island-green">{vessel.capacity}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center md:justify-end">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      vessel.status === 'Docked' ? 'bg-island-emerald/10 text-island-emerald' : 
                      vessel.status === 'Approaching' ? 'bg-island-ocean/10 text-island-ocean' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {vessel.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Port Map / Quick Actions */}
        <div className="space-y-10">
          <div className="bg-island-green p-10 rounded-[3rem] text-white shadow-xl shadow-island-green/20 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-2xl font-serif font-bold mb-6 relative z-10">Port <span className="italic text-island-emerald">Status</span></h3>
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Berth 1</span>
                <span className="text-sm font-bold text-island-emerald">Occupied</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Berth 2</span>
                <span className="text-sm font-bold text-island-emerald">Occupied</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Berth 3</span>
                <span className="text-sm font-bold text-white/40">Available</span>
              </div>
              <div className="pt-6 border-t border-white/10">
                <button className="w-full py-4 bg-island-emerald text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center justify-center gap-3">
                  <MapPin size={18} /> View Port Map
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-island-green mb-8">Weather Alert</h3>
            <div className="p-6 bg-island-ocean/5 rounded-2xl border border-island-ocean/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-island-ocean/10 text-island-ocean rounded-xl">
                  <AlertCircle size={20} />
                </div>
                <h4 className="font-bold text-island-green text-sm">Sea Condition</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Moderate waves expected in the afternoon. All vessels advised to maintain standard safety protocols.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility</span>
                <span className="text-xs font-bold text-island-green">Good (12km)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

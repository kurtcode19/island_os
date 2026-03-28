import { motion } from 'motion/react';
import { ShieldCheck, HeartPulse, Search, Filter, Download, AlertCircle, CheckCircle2, Clock, Activity, ShieldAlert } from 'lucide-react';

const reports = [
  { id: 'HS-201', location: 'White Island', type: 'Sanitary Inspection', status: 'Passed', date: 'Oct 24, 2026', inspector: 'Dr. Santos' },
  { id: 'HS-202', location: 'Sunken Cemetery', type: 'Water Quality', status: 'Pending', date: 'Oct 25, 2026', inspector: 'Engr. Reyes' },
  { id: 'HS-203', location: 'Blue Lagoon Resort', type: 'Safety Audit', status: 'Passed', date: 'Oct 23, 2026', inspector: 'Officer Cruz' },
  { id: 'HS-204', location: 'Hibok-Hibok Trail', type: 'Trail Safety', status: 'Alert', date: 'Oct 25, 2026', inspector: 'Officer Luna' },
];

export default function SafetyModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Health & <span className="not-italic text-island-emerald">Safety</span></h2>
          <p className="text-slate-500 font-light">Monitoring island health standards and safety protocols.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Export Reports
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 island-gradient text-white rounded-2xl font-bold text-sm shadow-lg shadow-island-emerald/20 transition-all flex items-center justify-center gap-2">
            <ShieldCheck size={18} /> New Inspection
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Safety Score', value: '98.4%', change: '+0.5%', isPositive: true, icon: ShieldCheck, color: 'emerald' },
          { label: 'Active Alerts', value: '2', change: '-1', isPositive: true, icon: ShieldAlert, color: 'coral' },
          { label: 'Inspections', value: '42', change: '+12', isPositive: true, icon: Activity, color: 'ocean' },
          { label: 'Health Index', value: 'A+', change: 'Stable', isPositive: true, icon: HeartPulse, color: 'purple' },
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
        {/* Inspection Reports */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green italic">Inspection <span className="not-italic text-island-emerald">Reports</span></h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-island-green"
                />
              </div>
              <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {reports.map((report, idx) => (
              <div key={report.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-50 hover:border-island-emerald/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                  <div className={`w-14 h-14 rounded-2xl bg-island-emerald/10 flex items-center justify-center text-island-emerald group-hover:bg-island-emerald/20 transition-colors`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-island-green text-lg">{report.location}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{report.type} • {report.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inspector</p>
                    <p className="text-sm font-bold text-island-green">{report.inspector}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold text-island-green">{report.date}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center md:justify-end">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      report.status === 'Passed' ? 'bg-island-emerald/10 text-island-emerald' : 
                      report.status === 'Pending' ? 'bg-island-ocean/10 text-island-ocean' : 
                      'bg-island-coral/10 text-island-coral'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Protocols / Emergency */}
        <div className="space-y-10">
          <div className="bg-island-coral p-10 rounded-[3rem] text-white shadow-xl shadow-island-coral/20 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-2xl font-serif font-bold mb-6 relative z-10">Emergency <span className="italic text-white/80">Alert</span></h3>
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-bold text-sm">Active Alert</span>
                </div>
                <p className="text-xs text-white/80 font-light">Strong currents reported at White Island. All swimming activities suspended until further notice.</p>
              </div>
              <button className="w-full py-4 bg-white text-island-coral rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center justify-center gap-3">
                <ShieldAlert size={18} /> Broadcast Alert
              </button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-island-green mb-8">Health Resources</h3>
            <div className="space-y-6">
              {[
                { label: 'Island Hospital', status: 'Operational', color: 'emerald' },
                { label: 'Emergency Response', status: 'Ready', color: 'ocean' },
                { label: 'Water Testing Lab', status: 'Active', color: 'purple' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-island-${item.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                    <span className="text-sm font-bold text-island-green">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

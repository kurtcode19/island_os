import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilShieldCheck as ShieldCheck, UilHeartbeat as HeartPulse, UilSearch as Search, UilFilter as Filter, UilDownloadAlt as Download, UilExclamationCircle as AlertCircle, UilCheckCircle as CheckCircle2, UilClock as Clock, UilHeartbeat as Activity, UilShieldExclamation as ShieldAlert, UilMapMarker as MapPin, UilUser as User, UilTimes as X, UilMessage as Send } from '@/icons';
import { subscribeToIncidents, resolveIncident } from '../../lib/incidentService';
import type { Incident } from '../../types';
import { toast } from 'sonner';

const reports = [
  { id: 'HS-201', location: 'White Island', type: 'Sanitary Inspection', status: 'Passed', date: 'Oct 24, 2026', inspector: 'Dr. Santos' },
  { id: 'HS-202', location: 'Sunken Cemetery', type: 'Water Quality', status: 'Pending', date: 'Oct 25, 2026', inspector: 'Engr. Reyes' },
  { id: 'HS-203', location: 'Blue Lagoon Resort', type: 'Safety Audit', status: 'Passed', date: 'Oct 23, 2026', inspector: 'Officer Cruz' },
  { id: 'HS-204', location: 'Hibok-Hibok Trail', type: 'Trail Safety', status: 'Alert', date: 'Oct 25, 2026', inspector: 'Officer Luna' },
];

export default function SafetyModule() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
    });
    return () => unsubscribe();
  }, []);

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const sosIncidents = activeIncidents.filter(i => i.type === 'sos');
  const reportIncidents = activeIncidents.filter(i => i.type === 'report');

  const handleResolve = async (id: string) => {
    await resolveIncident(id);
  };

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
            <Download size="18" /> Export Reports
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 btn-primary">
            <ShieldCheck size="18" /> New Inspection
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Safety Score', value: '98.4%', change: '+0.5%', isPositive: true, icon: ShieldCheck, color: 'emerald' },
          { label: 'Active Incidents', value: String(activeIncidents.length), change: activeIncidents.length > 0 ? `${activeIncidents.length} pending` : '0', isPositive: activeIncidents.length === 0, icon: ShieldAlert, color: 'coral' },
          { label: 'SOS Alerts', value: String(sosIncidents.length), change: sosIncidents.length > 0 ? 'URGENT' : 'None', isPositive: sosIncidents.length === 0, icon: AlertCircle, color: 'rose' },
          { label: 'Health Index', value: 'A+', change: 'Stable', isPositive: true, icon: HeartPulse, color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-island-${stat.color}/10 text-island-${stat.color}`}>
                <stat.icon size="24" />
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

      {/* Live Incident Feed */}
      {incidents.length > 0 && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-serif font-bold text-island-green italic">
                Live <span className="not-italic text-island-emerald">Incidents</span>
              </h3>
              {activeIncidents.length > 0 && (
                <span className="px-3 py-1 bg-island-coral/10 text-island-coral rounded-full text-[10px] font-bold animate-pulse">
                  {activeIncidents.length} Active
                </span>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {incidents.slice(0, 10).map((incident) => (
              <div
                key={incident.id}
                className={`flex items-start gap-5 p-6 rounded-2xl border transition-all ${
                  incident.status === 'active'
                    ? incident.type === 'sos'
                      ? 'bg-rose-50 border-rose-100'
                      : 'bg-amber-50 border-amber-100'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  incident.type === 'sos' ? 'bg-island-coral/20 text-island-coral' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {incident.type === 'sos' ? <AlertCircle size="24" /> : <ShieldAlert size="24" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-island-volcanic text-sm">{incident.touristName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      incident.type === 'sos' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {incident.type === 'sos' ? 'SOS' : 'Report'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      incident.status === 'active' ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-400 bg-slate-100'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  {incident.message && (
                    <p className="text-sm text-slate-600 font-medium mb-2">"{incident.message}"</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {incident.lat !== 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin size="12" /> {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User size="12" /> {incident.touristUid?.substring(0, 8)}...
                    </span>
                  </div>
                </div>
                {incident.status === 'active' && (
                  <button
                    onClick={() => handleResolve(incident.id!)}
                    className="px-5 py-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-island-emerald/10 hover:text-island-emerald hover:border-island-emerald/20 transition-all shrink-0"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Inspection Reports */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green italic">Inspection <span className="not-italic text-island-emerald">Reports</span></h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="16" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-island-green"
                />
              </div>
              <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                <Filter size="18" />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {reports.map((report, idx) => (
              <div key={report.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-50 hover:border-island-emerald/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                  <div className={`w-14 h-14 rounded-2xl bg-island-emerald/10 flex items-center justify-center text-island-emerald group-hover:bg-island-emerald/20 transition-colors`}>
                    <ShieldCheck size="24" />
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

        {/* Emergency + Health Resources */}
        <div className="space-y-10">
          {activeIncidents.length > 0 && (
            <div className="bg-island-coral p-10 rounded-[3rem] text-white shadow-xl shadow-island-coral/20 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-2xl font-serif font-bold mb-6 relative z-10">Emergency <span className="italic text-white/80">Alert</span></h3>
              <div className="space-y-4 relative z-10">
                {activeIncidents.slice(0, 3).map((inc) => (
                  <div key={inc.id} className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      {inc.type === 'sos' ? <AlertCircle size="18" /> : <ShieldAlert size="18" />}
                      <span className="font-bold text-sm">{inc.type === 'sos' ? 'SOS Alert' : 'Report'}</span>
                      <span className="ml-auto text-[10px] text-white/60">{inc.touristName}</span>
                    </div>
                    <p className="text-xs text-white/80 font-light">{inc.message || 'No details provided'}</p>
                    {inc.lat !== 0 && (
                      <p className="text-[10px] text-white/50 mt-1 font-mono">{inc.lat.toFixed(4)}, {inc.lng.toFixed(4)}</p>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setShowBroadcast(true)}
                  className="w-full py-4 bg-white text-island-coral rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  <ShieldAlert size="18" /> Broadcast Alert
                </button>
              </div>
            </div>
          )}

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
      {/* Broadcast Alert Modal */}
      <AnimatePresence>
        {showBroadcast && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => { setShowBroadcast(false); setBroadcastMessage(''); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-island-green flex items-center gap-3">
                  <ShieldAlert size="20" className="text-island-coral" />
                  Broadcast Alert
                </h3>
                <button
                  onClick={() => { setShowBroadcast(false); setBroadcastMessage(''); }}
                  className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-island-coral transition-all"
                >
                  <X size="16" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                Send an emergency broadcast to all registered tourists and businesses on the island.
              </p>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Alert Message</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800 resize-none h-28"
                    placeholder="e.g., Typhoon warning: All tourists are advised to stay indoors..."
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertCircle size="16" className="text-amber-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-amber-700">This will notify all registered users on the platform.</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!broadcastMessage.trim()) {
                    toast.error('Please enter an alert message');
                    return;
                  }
                  setSendingBroadcast(true);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  toast.success('Alert broadcast to all registered users');
                  setBroadcastMessage('');
                  setShowBroadcast(false);
                  setSendingBroadcast(false);
                }}
                disabled={sendingBroadcast}
                className="w-full bg-island-coral text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-coral/20 hover:shadow-island-coral/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {sendingBroadcast ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Send size="20" />
                )}
                {sendingBroadcast ? 'Broadcasting...' : 'Send Broadcast'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

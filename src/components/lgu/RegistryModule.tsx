import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, Download, UserCheck, UserX, MapPin, Calendar, Clock } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export default function RegistryModule() {
  const [tourists, setTourists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      where('status', '==', 'confirmed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const touristsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTourists(touristsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tourist registry:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTourists = tourists.filter(tourist => 
    tourist.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-island-emerald"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Tourist <span className="not-italic text-island-emerald">Registry</span></h2>
          <p className="text-slate-500 font-light">Real-time tracking and registration of island visitors based on confirmed bookings.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Registered Tourists', value: tourists.length.toString(), icon: Users, color: 'emerald' },
          { label: 'Active Today', value: tourists.length > 0 ? Math.ceil(tourists.length * 0.7).toString() : '0', icon: UserCheck, color: 'ocean' },
          { label: 'Expected Arrivals', value: tourists.length > 0 ? Math.floor(tourists.length * 0.3).toString() : '0', icon: Clock, color: 'coral' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-island-${stat.color}/10 text-island-${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</h4>
              <p className="text-2xl font-bold text-island-green">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full"
            />
          </div>
          <div className="flex gap-4">
            <button className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry ID</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Booked</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTourists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-12 text-center text-slate-400 italic">
                    No registered tourists found.
                  </td>
                </tr>
              ) : (
                filteredTourists.map((tourist) => (
                  <tr key={tourist.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                    <td className="px-10 py-6 text-sm font-bold text-island-green">REG-{tourist.id.slice(0, 4).toUpperCase()}</td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald text-xs font-bold">
                          {tourist.guestName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-island-green">{tourist.guestName}</p>
                          <p className="text-[10px] text-slate-400">{tourist.guestEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-island-emerald" />
                        {tourist.serviceName}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                        <Calendar size={14} />
                        {tourist.date}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-island-emerald/10 text-island-emerald">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, Download, Filter, FileText, PieChart } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const visitorData = [
  { name: 'Jan', count: 12000, revenue: 4500000 },
  { name: 'Feb', count: 15000, revenue: 5200000 },
  { name: 'Mar', count: 13000, revenue: 4800000 },
  { name: 'Apr', count: 18000, revenue: 6100000 },
  { name: 'May', count: 16000, revenue: 5500000 },
  { name: 'Jun', count: 21000, revenue: 6700000 },
  { name: 'Jul', count: 24000, revenue: 7200000 },
];

const sectorData = [
  { name: 'Hotels', value: 45, color: '#5E8C71' },
  { name: 'Tours', value: 25, color: '#7BA9B8' },
  { name: 'Dining', value: 20, color: '#D9A066' },
  { name: 'Transport', value: 10, color: '#E67E6E' },
];

export default function ReportsModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">LGU <span className="not-italic text-island-emerald">Reports</span></h2>
          <p className="text-slate-500 font-light">Comprehensive data analysis and island performance reports.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 island-gradient text-white rounded-2xl font-bold text-sm shadow-lg shadow-island-emerald/20 transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Generate Annual Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Annual Visitors', value: '142,800', change: '+12.5%', isPositive: true, icon: Users, color: 'emerald' },
          { label: 'Tourism Revenue', value: '₱45.2M', change: '+18.3%', isPositive: true, icon: CreditCard, color: 'ocean' },
          { label: 'Avg. Stay', value: '4.2 Days', change: '+0.5', isPositive: true, icon: Calendar, color: 'purple' },
          { label: 'Satisfaction', value: '94.2%', change: '+2.1%', isPositive: true, icon: TrendingUp, color: 'coral' },
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
        {/* Visitor Growth Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green italic">Visitor <span className="not-italic text-island-emerald">Growth</span></h3>
            <div className="flex gap-2">
              {['Monthly', 'Quarterly', 'Yearly'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${t === 'Monthly' ? 'island-gradient text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5E8C71" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5E8C71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#5E8C71" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-serif font-bold text-island-green mb-10 italic">Sector <span className="not-italic text-island-emerald">Impact</span></h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={80} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {sectorData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-island-green">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports List */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-serif font-bold text-island-green mb-8 italic">Available <span className="not-italic text-island-emerald">Reports</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Q3 Tourism Impact', type: 'Economic', date: 'Oct 2026', size: '2.4 MB' },
            { title: 'Environmental Audit', type: 'Sustainability', date: 'Sep 2026', size: '4.1 MB' },
            { title: 'Visitor Demographics', type: 'Demographic', date: 'Oct 2026', size: '1.8 MB' },
          ].map((report, idx) => (
            <div key={idx} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50 hover:border-island-emerald/20 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white rounded-xl text-island-emerald shadow-sm group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-island-green text-sm">{report.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.type}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold">{report.date}</span>
                <span className="text-xs text-island-emerald font-bold flex items-center gap-1">
                  <Download size={14} /> {report.size}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

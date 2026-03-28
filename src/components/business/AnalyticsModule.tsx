import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, Download, Filter } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 45000, bookings: 120 },
  { name: 'Feb', revenue: 52000, bookings: 145 },
  { name: 'Mar', revenue: 48000, bookings: 130 },
  { name: 'Apr', revenue: 61000, bookings: 180 },
  { name: 'May', revenue: 55000, bookings: 160 },
  { name: 'Jun', revenue: 67000, bookings: 210 },
  { name: 'Jul', revenue: 72000, bookings: 240 },
];

const categoryData = [
  { name: 'Rooms', value: 65, color: '#5E8C71' },
  { name: 'Tours', value: 20, color: '#7BA9B8' },
  { name: 'Dining', value: 10, color: '#D9A066' },
  { name: 'Spa', value: 5, color: '#E67E6E' },
];

export default function AnalyticsModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Business <span className="not-italic text-island-emerald">Insights</span></h2>
          <p className="text-slate-500 font-light">Detailed performance metrics for your island business.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 island-gradient text-white rounded-2xl font-bold text-sm shadow-lg shadow-island-emerald/20 transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Revenue', value: '₱452,800', change: '+12.5%', isPositive: true, icon: CreditCard, color: 'emerald' },
          { label: 'Avg. Occupancy', value: '82.4%', change: '+4.3%', isPositive: true, icon: TrendingUp, color: 'ocean' },
          { label: 'Guest Count', value: '1,284', change: '-2.1%', isPositive: false, icon: Users, color: 'purple' },
          { label: 'Booking Rate', value: '14.2%', change: '+5.1%', isPositive: true, icon: BarChart3, color: 'coral' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-island-${stat.color}/10 text-island-${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full ${stat.isPositive ? 'bg-island-emerald/10 text-island-emerald' : 'bg-island-coral/10 text-island-coral'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</h4>
            <p className="text-3xl font-bold text-island-green">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green">Revenue Growth</h3>
            <div className="flex gap-2">
              {['7D', '30D', '1Y'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${t === '30D' ? 'island-gradient text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" stroke="#5E8C71" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-serif font-bold text-island-green mb-10">Revenue by Category</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-island-green">65%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rooms</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {categoryData.map((item, idx) => (
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
    </motion.div>
  );
}

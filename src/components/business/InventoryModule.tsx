import { motion } from 'motion/react';
import { Package, Plus, Search, Filter, ChevronRight, LayoutGrid, List, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

const inventory = [
  { id: 'RM-101', name: 'Deluxe Ocean Suite', category: 'Accommodation', stock: 5, total: 8, price: '₱12,500', status: 'Available' },
  { id: 'RM-102', name: 'Standard Mountain View', category: 'Accommodation', stock: 12, total: 15, price: '₱8,000', status: 'Available' },
  { id: 'TR-201', name: 'Volcano Hike Equipment', category: 'Equipment', stock: 0, total: 10, price: '₱500', status: 'Out of Stock' },
  { id: 'TR-202', name: 'Diving Gear Set', category: 'Equipment', stock: 15, total: 20, price: '₱1,200', status: 'Available' },
  { id: 'SR-301', name: 'Spa Treatment Session', category: 'Service', stock: 4, total: 10, price: '₱2,500', status: 'Limited' },
];

export default function InventoryModule() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 island-gradient text-white rounded-2xl font-bold shadow-lg shadow-island-emerald/20 transition-all hover:scale-105">
          <Plus size={20} /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {inventory.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-island-emerald/10 text-island-emerald">
                <Package size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                item.status === 'Available' ? 'bg-island-emerald/10 text-island-emerald' : 
                item.status === 'Limited' ? 'bg-island-sunset/10 text-island-sunset' : 
                'bg-island-coral/10 text-island-coral'
              }`}>
                {item.status}
              </span>
            </div>
            <h4 className="text-xl font-serif font-bold text-island-green mb-2 group-hover:text-island-emerald transition-colors">{item.name}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{item.category} • {item.id}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Availability</span>
                <span className="text-island-green font-bold">{item.stock} / {item.total}</span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.stock === 0 ? 'bg-island-coral' : 
                    item.stock < 5 ? 'bg-island-sunset' : 
                    'bg-island-emerald'
                  }`}
                  style={{ width: `${(item.stock / item.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
              <span className="text-lg font-bold text-island-green">{item.price}</span>
              <button className="text-island-emerald text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Edit Details <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

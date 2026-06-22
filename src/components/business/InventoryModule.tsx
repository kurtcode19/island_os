import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Filter, ChevronRight, LayoutGrid, List, CheckCircle2, XCircle, Clock, X, Users, Utensils, Wifi, Wind, ShowerHead, Snowflake, Refrigerator, Tv } from 'lucide-react';
import { useState } from 'react';

const inventory = [
  { id: 'RM-101', name: 'Deluxe Ocean Suite', category: 'Accommodation', stock: 5, total: 8, price: '₱12,500', status: 'Available', guests: [{ name: 'Adult', price: 2500 }], inclusions: [{ name: 'Breakfast', price: 250, forPeople: 2 }], descriptionChecklist: ['Wi-Fi', 'Air conditioning', 'Refrigerator', 'Shower', '1 Bathroom'], descriptionText: 'Spacious oceanfront suite with panoramic views.' },
  { id: 'RM-102', name: 'Standard Mountain View', category: 'Accommodation', stock: 12, total: 15, price: '₱8,000', status: 'Available', guests: [{ name: 'Adult', price: 1500 }], inclusions: [{ name: 'Breakfast', price: 200, forPeople: 2 }], descriptionChecklist: ['Wi-Fi', 'Shower', '1 Bathroom'], descriptionText: 'Cozy room with mountain views.' },
  { id: 'TR-201', name: 'Volcano Hike Equipment', category: 'Equipment', stock: 0, total: 10, price: '₱500', status: 'Out of Stock', guests: [], inclusions: [], descriptionChecklist: [], descriptionText: '' },
  { id: 'TR-202', name: 'Diving Gear Set', category: 'Equipment', stock: 15, total: 20, price: '₱1,200', status: 'Available', guests: [], inclusions: [], descriptionChecklist: [], descriptionText: '' },
  { id: 'SR-301', name: 'Spa Treatment Session', category: 'Service', stock: 4, total: 10, price: '₱2,500', status: 'Limited', guests: [{ name: 'Adult', price: 2500 }], inclusions: [{ name: 'Towel Service', price: 0, forPeople: 1 }], descriptionChecklist: ['Private Room'], descriptionText: 'Full body massage session.' },
];

const amenityOptions = ['Wi-Fi', 'Air conditioning', 'Refrigerator', 'Shower', 'Bathtub', '1 Bathroom', '2 Bathrooms', 'TV', 'Balcony', 'Ocean View', 'Mountain View', 'Kitchen', 'Dining Area', 'Sofa Bed'];

export default function InventoryModule() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Accommodation',
    price: '',
    total: 10,
    guests: [] as { name: string; price: number }[],
    inclusions: [] as { name: string; price: number; forPeople: number }[],
    descriptionChecklist: [] as string[],
    descriptionText: '',
  });
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPrice, setNewGuestPrice] = useState('');
  const [newInclusionName, setNewInclusionName] = useState('');
  const [newInclusionPrice, setNewInclusionPrice] = useState('');
  const [newInclusionPeople, setNewInclusionPeople] = useState(1);

  const addGuest = () => {
    if (!newGuestName || !newGuestPrice) return;
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { name: newGuestName, price: Number(newGuestPrice) }]
    }));
    setNewGuestName('');
    setNewGuestPrice('');
  };

  const removeGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const addInclusion = () => {
    if (!newInclusionName) return;
    setFormData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, { name: newInclusionName, price: Number(newInclusionPrice) || 0, forPeople: newInclusionPeople }]
    }));
    setNewInclusionName('');
    setNewInclusionPrice('');
    setNewInclusionPeople(1);
  };

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      descriptionChecklist: prev.descriptionChecklist.includes(amenity)
        ? prev.descriptionChecklist.filter(a => a !== amenity)
        : [...prev.descriptionChecklist, amenity]
    }));
  };

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
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-8 py-4 btn-primary">
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
            
            {item.guests.length > 0 && (
              <div className="mb-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Guests Catered</span>
                <div className="space-y-1.5">
                  {item.guests.map((g, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{g.name}</span>
                      <span className="text-island-green font-bold">₱{g.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.inclusions.length > 0 && (
              <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-island-emerald uppercase tracking-wider mb-2 block">Inclusions</span>
                <div className="space-y-1.5">
                  {item.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-island-emerald" />
                        <span className="font-semibold text-slate-700">{inc.name}</span>
                        {inc.forPeople > 1 && <span className="text-slate-400">(for {inc.forPeople})</span>}
                      </div>
                      {inc.price > 0 && <span className="text-island-green font-bold">+₱{inc.price}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.descriptionChecklist.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {item.descriptionChecklist.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-stone-50 rounded-full text-[10px] font-semibold text-slate-500 border border-stone-100">
                    {d}
                  </span>
                ))}
              </div>
            )}

            {item.descriptionText && (
              <p className="text-xs text-slate-500 font-medium mb-4 italic">{item.descriptionText}</p>
            )}

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

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white z-10 px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-island-green">Add New Inventory Item</h3>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="px-8 pt-6 pb-10 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Item Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800"
                      placeholder="e.g. Deluxe Ocean Suite" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Category</label>
                    <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800">
                      <option>Accommodation</option>
                      <option>Equipment</option>
                      <option>Service</option>
                      <option>Food & Beverage</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Price</label>
                    <input type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800"
                      placeholder="₱0" />
                  </div>
                </div>

                {/* Guests to Cater Section */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                  <h4 className="text-sm font-bold text-island-green mb-4 flex items-center gap-2">
                    <Users size={16} className="text-island-emerald" /> Guests to Cater
                  </h4>
                  <div className="space-y-2 mb-4">
                    {formData.guests.map((g, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">{g.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-island-green">₱{g.price.toLocaleString()}</span>
                          <button onClick={() => removeGuest(i)} className="text-island-coral hover:text-red-600 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="text" value={newGuestName} onChange={e => setNewGuestName(e.target.value)}
                      placeholder="Guest type (e.g. Adult)" 
                      className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-xs font-semibold text-slate-800" />
                    <input type="number" value={newGuestPrice} onChange={e => setNewGuestPrice(e.target.value)}
                      placeholder="Price" 
                      className="w-24 px-4 py-2.5 bg-white rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-xs font-semibold text-slate-800" />
                    <button onClick={addGuest} className="px-5 py-2.5 bg-island-emerald text-white rounded-xl text-xs font-bold hover:bg-island-green transition-all">
                      Add
                    </button>
                  </div>
                </div>

                {/* Inclusions Section */}
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h4 className="text-sm font-bold text-island-green mb-4 flex items-center gap-2">
                    <Utensils size={16} className="text-island-emerald" /> Inclusions
                  </h4>
                  <div className="space-y-2 mb-4">
                    {formData.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={14} className="text-island-emerald" />
                          <span className="text-sm font-semibold text-slate-700">{inc.name}</span>
                          {inc.forPeople > 1 && <span className="text-[10px] text-slate-400 font-medium">for {inc.forPeople} pax</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          {inc.price > 0 && <span className="text-sm font-bold text-island-green">+₱{inc.price}</span>}
                          <button onClick={() => removeInclusion(i)} className="text-island-coral hover:text-red-600 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="text" value={newInclusionName} onChange={e => setNewInclusionName(e.target.value)}
                      placeholder="Inclusion name" 
                      className="flex-1 min-w-[140px] px-4 py-2.5 bg-white rounded-xl border border-emerald-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-xs font-semibold text-slate-800" />
                    <input type="number" value={newInclusionPrice} onChange={e => setNewInclusionPrice(e.target.value)}
                      placeholder="Price" 
                      className="w-20 px-4 py-2.5 bg-white rounded-xl border border-emerald-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-xs font-semibold text-slate-800" />
                    <input type="number" value={newInclusionPeople} onChange={e => setNewInclusionPeople(Number(e.target.value))}
                      placeholder="For how many?" 
                      className="w-24 px-4 py-2.5 bg-white rounded-xl border border-emerald-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-xs font-semibold text-slate-800" />
                    <button onClick={addInclusion} className="px-5 py-2.5 bg-island-emerald text-white rounded-xl text-xs font-bold hover:bg-island-green transition-all">
                      Add
                    </button>
                  </div>
                </div>

                {/* Description Checklist */}
                <div className="p-6 bg-white rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-bold text-island-green mb-4">Description Checklist</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {amenityOptions.map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider border-2 transition-all ${
                          formData.descriptionChecklist.includes(a)
                            ? 'bg-island-emerald text-white border-island-emerald'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-island-emerald/30'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Additional Description</label>
                    <textarea value={formData.descriptionText} onChange={e => setFormData(prev => ({ ...prev, descriptionText: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800 resize-none h-24"
                      placeholder="Enter a sentence description for this room/item..." />
                  </div>
                </div>

                <button className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all">
                  Save Inventory Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

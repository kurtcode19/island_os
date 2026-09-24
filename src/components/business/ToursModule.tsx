import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilCompass as Compass, UilPlus as Plus, UilSearch as Search, UilFilter as Filter, UilAngleRightB as ChevronRight, UilUsersAlt as Users, UilClock as Clock, UilMapMarker as MapPin, UilStar as Star, UilArrowRight as ArrowRight, UilTimes as X } from '@/icons';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function ToursModule() {
  const { profile } = useAuth();
  const [tours, setTours] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Nature', duration: '2h', maxGuests: 10, price: '' });

  useEffect(() => {
    const businessId = profile?.businessId || 'dininggasan-catarman';
    const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(t => !t.businessId || t.businessId === businessId);
      // ponytail: static seed tours shown until Firestore has entries
      if (data.length === 0) {
        setTours([
          { id: 'TR-101', name: 'Sunken Cemetery Dive', category: 'Diving', duration: '3h', guests: 4, maxGuests: 8, price: '₱2,500', rating: 4.9, status: 'Active', image: '/images/hero-sunken.png', static: true },
          { id: 'TR-104', name: 'Katibawasan Falls Tour', category: 'Nature', duration: '2h', guests: 0, maxGuests: 10, price: '₱500', rating: 4.9, status: 'Draft', image: '/images/Katibawasan Falls – the tallest waterfall on Camiguin.jpg', static: true },
        ]);
      } else {
        setTours(data);
      }
    }, err => console.error('tours load error:', err));
    return () => unsub();
  }, [profile?.businessId]);

  const filteredTours = tours.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createTour = async () => {
    const priceNum = parseFloat(form.price);
    if (!form.name.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Enter a tour name and valid price');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'tours'), {
        businessId: profile?.businessId || 'dininggasan-catarman',
        name: form.name.trim(),
        category: form.category,
        duration: form.duration,
        guests: 0,
        maxGuests: Number(form.maxGuests) || 10,
        price: `₱${priceNum.toLocaleString()}`,
        rating: 0,
        status: 'Active',
        image: '/images/hero-sunken.png',
        createdAt: serverTimestamp(),
      });
      toast.success('Tour created');
      setShowCreate(false);
      setForm({ name: '', category: 'Nature', duration: '2h', maxGuests: 10, price: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'tours');
    } finally { setSaving(false); }
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="18" />
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
            />
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-8 py-4 btn-primary">
          <Plus size="20" /> Create New Tour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {filteredTours.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-[3rem] border border-slate-100 text-slate-400 font-medium">
            No tours match your search.
          </div>
        ) : filteredTours.map((tour, idx) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col md:flex-row group"
          >
            <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-island-green flex items-center gap-1">
                <Star size="12" className="text-island-sunset fill-island-sunset" /> {tour.rating || '—'}
              </div>
            </div>
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {tour.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    tour.status === 'Active' ? 'bg-island-emerald/10 text-island-emerald' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {tour.status}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-island-green mb-4 group-hover:text-island-emerald transition-colors">{tour.name}</h3>
                <div className="flex flex-wrap gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Clock size="14" /> {tour.duration}</div>
                  <div className="flex items-center gap-2"><Users size="14" /> {tour.guests ?? 0} / {tour.maxGuests} guests</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price per person</span>
                  <span className="text-xl font-bold text-island-green">{tour.price}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-island-green">Create Tour</h3>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X size="18" /></button>
              </div>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Tour name" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:ring-4 focus:ring-island-emerald/5" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none">
                  {['Nature', 'Diving', 'Heritage', 'Adventure', 'Relax'].map(c => <option key={c}>{c}</option>)}
                </select>
                <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="Duration (2h)" className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" value={form.maxGuests} onChange={e => setForm(f => ({ ...f, maxGuests: Number(e.target.value) }))}
                  placeholder="Max guests" className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none" />
                <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="Price (₱)" className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none" />
              </div>
              <button onClick={createTour} disabled={saving}
                className="w-full py-4 btn-primary rounded-xl text-sm font-bold disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Tour'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

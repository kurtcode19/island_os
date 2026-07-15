import { motion, AnimatePresence } from 'motion/react';
import { UilCar as Car, UilPlus as Plus, UilSearch as Search, UilGrid as LayoutGrid, UilListUl as List, UilCheckCircle as CheckCircle2, UilTimes as X, UilUsersAlt as Users, UilClock as Clock, UilCamera as Camera, UilAngleRightB as ChevronRight } from '@/icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const typeOptions = ['Motorcycle', 'Bicycle', 'Car', 'Van', 'Tricycle', 'Scooter', 'SUV', 'Other'];
const transmissionOptions = ['Automatic', 'Manual', 'N/A'];
const rateUnitOptions = ['hour', 'day', 'week'];

export default function RentalModule() {
  const { profile } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Motorcycle',
    transmission: 'Automatic',
    capacity: 2,
    rate: 0,
    rateUnit: 'day' as 'hour' | 'day' | 'week',
    image: '',
    stock: 1,
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const img = new Image();
    img.onload = () => {
      const max = 800;
      let { width, height } = img;
      if (width > max || height > max) {
        const ratio = Math.min(max / width, max / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      setFormData(prev => ({ ...prev, image: c.toDataURL('image/jpeg', 0.7) }));
    };
    img.src = URL.createObjectURL(file);
  }, []);

  useEffect(() => {
    if (!profile?.businessId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'rental_vehicles'),
      where('businessId', '==', profile.businessId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(data);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.businessId]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Motorcycle',
      transmission: 'Automatic',
      capacity: 2,
      rate: 0,
      rateUnit: 'day',
      image: '',
      stock: 1,
      features: [],
    });
    setEditingVehicle(null);
    setNewFeature('');
  };

  const openEdit = (v: any) => {
    setFormData({
      name: v.name || '',
      type: v.type || 'Motorcycle',
      transmission: v.transmission || 'Automatic',
      capacity: v.capacity || 2,
      rate: v.rate || 0,
      rateUnit: v.rateUnit || 'day',
      image: v.image || '',
      stock: v.stock ?? 1,
      features: v.features || [],
    });
    setEditingVehicle(v);
    setShowForm(true);
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const removeFeature = (i: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!profile?.businessId) {
      toast.error('No business ID found');
      return;
    }
    if (!formData.name) {
      toast.error('Please enter a vehicle name');
      return;
    }

    const status = formData.stock === 0 ? 'out_of_stock' : formData.stock < 5 ? 'limited' : 'available';

    const payload = {
      businessId: profile.businessId,
      name: formData.name,
      type: formData.type,
      transmission: formData.transmission,
      capacity: Number(formData.capacity) || 2,
      rate: Number(formData.rate) || 0,
      rateUnit: formData.rateUnit,
      image: formData.image,
      stock: Number(formData.stock) || 1,
      features: formData.features,
      status,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingVehicle?.id) {
        await updateDoc(doc(db, 'rental_vehicles', editingVehicle.id), payload);
        toast.success('Vehicle updated');
      } else {
        await addDoc(collection(db, 'rental_vehicles'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('Vehicle added to fleet');
      }
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save vehicle');
      handleFirestoreError(error, OperationType.CREATE, 'rental_vehicles');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'rental_vehicles', id));
      toast.success('Vehicle removed from fleet');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rental_vehicles/${id}`);
    }
  };

  const statusBadge = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-island-coral/10 text-island-coral' };
    if (stock < 5) return { label: 'Limited', color: 'bg-island-sunset/10 text-island-sunset' };
    return { label: 'Available', color: 'bg-island-emerald/10 text-island-emerald' };
  };

  const totalStock = vehicles.reduce((s, v) => s + (v.stock ?? 0), 0);
  const availableCount = vehicles.filter(v => (v.stock ?? 0) > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-island-emerald"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="18" />
            <input type="text" placeholder="Search fleet..." className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm" />
          </div>
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button onClick={() => setView('grid')} className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid size="20" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-400 hover:text-slate-600'}`}>
              <List size="20" />
            </button>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-8 py-4 btn-primary">
          <Plus size="20" /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
          <Car size="64" className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-2xl font-bold text-slate-400 mb-2">No vehicles yet</h3>
          <p className="text-slate-300 mb-8">Add your first vehicle to start managing your fleet.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary px-8 py-4 rounded-2xl inline-flex items-center gap-2">
            <Plus size="20" /> Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v, idx) => {
            const status = statusBadge(v.stock ?? 0);
            return (
              <motion.div key={v.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-island-emerald/10 text-island-emerald">
                    <Car size="24" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                {v.image && (
                  <div className="mb-4 -mx-8 -mt-2">
                    <img src={v.image} alt={v.name} className="w-full h-48 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                <h4 className="text-xl font-serif font-bold text-island-green mb-2 group-hover:text-island-emerald transition-colors">{v.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{v.type} • {v.transmission}</p>
                <div className="flex gap-4 text-xs text-slate-500 font-medium mb-4">
                  <span className="flex items-center gap-1.5"><Users size="14" /> {v.capacity} seats</span>
                  <span className="flex items-center gap-1.5"><Clock size="14" /> per {v.rateUnit}</span>
                </div>
                {v.features?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {v.features.slice(0, 3).map((f: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-semibold text-slate-500">{f}</span>
                    ))}
                    {v.features.length > 3 && <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-semibold text-slate-500">+{v.features.length - 3}</span>}
                  </div>
                )}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Stock</span>
                    <span className="text-island-green font-bold">{v.stock ?? 0} units</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (v.stock ?? 0) === 0 ? 'bg-island-coral' :
                        (v.stock ?? 0) < 5 ? 'bg-island-sunset' :
                        'bg-island-emerald'
                      }`}
                      style={{ width: `${Math.min(100, ((v.stock ?? 0) / 10) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Rate</span>
                    <span className="text-lg font-bold text-island-green">₱{(v.rate || 0).toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/{v.rateUnit}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="text-island-emerald text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                      Edit <ChevronRight size="16" />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="text-island-coral text-sm font-bold hover:opacity-70 transition-all">
                      <X size="16" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Fleet</span>
          <span className="text-3xl font-black text-island-volcanic">{vehicles.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Available Units</span>
          <span className="text-3xl font-black text-island-emerald">{totalStock}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vehicle Types</span>
          <span className="text-3xl font-black text-island-sunset">{new Set(vehicles.map(v => v.type)).size}</span>
        </div>
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
                <h3 className="text-xl font-bold text-island-green">{editingVehicle ? 'Edit' : 'Add'} Vehicle</h3>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <X size="18" />
                </button>
              </div>

              <div className="px-8 pt-6 pb-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Vehicle Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800"
                      placeholder="e.g. Honda Scooter" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Photo</label>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                        dragOver ? 'border-island-emerald bg-island-emerald/5' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }} />
                      {formData.image ? (
                        <div className="w-full">
                          <img src={formData.image} alt="" className="w-full h-48 object-cover rounded-xl" />
                          <button onClick={e => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: '' })); }}
                            className="mt-2 text-[10px] font-bold text-island-coral hover:text-red-600 transition-colors">Remove photo</button>
                        </div>
                      ) : (
                        <><Camera size="28" className="text-slate-300 mb-2" />
                          <p className="text-xs font-semibold text-slate-400">Drop an image here or click to browse</p>
                          <p className="text-[10px] text-slate-300 mt-1">or paste a URL below</p>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <input type="text" value={formData.image} onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-xs font-semibold text-slate-800"
                        placeholder="Or paste image URL (e.g. https://example.com/vehicle.jpg)" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Type</label>
                    <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800">
                      {typeOptions.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Transmission</label>
                    <select value={formData.transmission} onChange={e => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800">
                      {transmissionOptions.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Capacity (seats)</label>
                    <input type="number" value={formData.capacity} onChange={e => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Stock (units)</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Rate (₱)</label>
                    <input type="number" value={formData.rate} onChange={e => setFormData(prev => ({ ...prev, rate: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Rate Unit</label>
                    <select value={formData.rateUnit} onChange={e => setFormData(prev => ({ ...prev, rateUnit: e.target.value as 'hour' | 'day' | 'week' }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800">
                      {rateUnitOptions.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Features</label>
                    <div className="flex items-center gap-2 mb-3">
                      <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                        placeholder="e.g. Helmet included"
                        className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all text-sm font-semibold text-slate-800" />
                      <button onClick={addFeature} className="px-5 py-2.5 bg-island-emerald text-white rounded-xl text-xs font-bold hover:bg-island-green transition-all">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-island-emerald rounded-full text-[10px] font-semibold">
                          {f}
                          <button onClick={() => removeFeature(i)} className="hover:text-island-coral transition-colors"><X size="12" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleSave} className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all">
                  {editingVehicle ? 'Update' : 'Save'} Vehicle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

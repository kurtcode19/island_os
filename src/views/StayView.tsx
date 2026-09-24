import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { accommodations } from '../data/accommodations';
import { UilStar, UilMapMarker, UilUsersAlt } from '@/icons';

export default function StayView() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return accommodations;
    return accommodations.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">Accommodations</span>
        <h1 className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tighter mt-1 mb-2">
          Places to Stay
        </h1>
        <p className="text-stone-500 mb-8">
          {filtered.length} stay{filtered.length !== 1 ? 's' : ''} found{q && ` for "${params.get('q')}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center text-stone-400 font-medium">
            No stays match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => (
              <div key={a.id} className="bg-white rounded-[24px] border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{a.type}</span>
                      <h3 className="text-lg font-black text-stone-800 tracking-tighter leading-tight">{a.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <UilStar size="14" className="text-amber-500" />
                      <span className="text-sm font-bold text-stone-700">{a.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-stone-500 font-semibold">
                    <span className="flex items-center gap-1"><UilUsersAlt size="14" /> up to {a.maxAdults}</span>
                    <span className="flex items-center gap-1"><UilMapMarker size="14" /> Camiguin</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {a.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-stone-100 rounded-full text-[10px] font-semibold text-stone-500">{t}</span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex items-end justify-between">
                    <div>
                      <span className="text-xl font-black text-stone-800">₱{a.price.toLocaleString()}</span>
                      <span className="text-xs text-stone-400 font-semibold ml-1">/night</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold">{a.reviews} reviews</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

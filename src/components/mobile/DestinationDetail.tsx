import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ArrowLeft, MapPin, Clock, NavigationArrow, WifiHigh, Wind, Coffee, Sun } from '@phosphor-icons/react';

interface DetailSpot {
  id: number;
  name: string;
  category?: string;
  rating?: number;
  price?: number;
  image: string;
  distance?: string;
  description?: string;
}

interface DestinationDetailProps {
  spot: DetailSpot;
  images: string[];
  onBack: () => void;
  onStartTrip: () => void;
}

export function DestinationDetail({ spot, images, onBack, onStartTrip }: DestinationDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [detailTab, setDetailTab] = useState('Details');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar"
    >
      {/* Hero Image */}
      <div className="relative h-[42vh] shrink-0 rounded-[24px] mx-4 mt-4 overflow-hidden">
        <img
          src={images[selectedImage]}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            aria-label="Go back"
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-lg"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Save to favorites"
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-rose-400/50 transition-colors"
          >
            <Heart size={18} />
          </motion.button>
        </div>

        <div className="absolute bottom-5 left-5">
          <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-semibold uppercase tracking-widest mb-1">
            <MapPin size={12} />
            <span>{spot.category || 'Destination'}</span>
          </div>
          <h2 className="text-[28px] font-black text-white tracking-tighter leading-tight">{spot.name}</h2>
          <p className="text-white/60 text-xs font-medium mt-0.5">Tropical Island, Philippines</p>
        </div>

        <div className="absolute bottom-5 right-5">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
            <span className="text-xl font-black text-[var(--text)]">₱{spot.price || 0}</span>
            <span className="text-[10px] text-[var(--muted)] font-semibold ml-1">/night</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 flex-1 flex flex-col py-5">
        {/* Stats Row */}
        <div className="flex gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7F8] rounded-2xl">
            <Clock size={14} className="text-[var(--accent-start)]" />
            <span className="text-[10px] font-semibold text-[var(--text)]">2-3 hrs</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7F8] rounded-2xl">
            <NavigationArrow size={14} className="text-[var(--accent-end)]" />
            <span className="text-[10px] font-semibold text-[var(--text)]">{spot.distance || '1.2 km'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7F8] rounded-2xl">
            <Star size={14} className="text-amber-400" />
            <span className="text-[10px] font-semibold text-[var(--text)]">{spot.rating || '4.9'} (245)</span>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex gap-1 mb-6 bg-[#F3F5F7] p-1 rounded-2xl">
          {['Details', 'Route', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-all ${
                detailTab === tab
                  ? 'bg-white text-[var(--text)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {detailTab === 'Details' && (
          <>
            <div className="mb-6">
              <h4 className="text-base font-bold text-[var(--text)] tracking-tight mb-3">About this place</h4>
              <p className="text-[var(--muted)] text-sm font-medium leading-relaxed">
                {spot.description || 'Experience the beauty of this tropical destination. A unique blend of nature, culture, and breathtaking landscapes waiting to be explored.'}
              </p>
            </div>
            <div className="mb-6">
              <h4 className="text-base font-bold text-[var(--text)] tracking-tight mb-4">Amenities</h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: WifiHigh, label: 'Wi-Fi' },
                  { icon: Wind, label: 'AC' },
                  { icon: Coffee, label: 'Breakfast' },
                  { icon: Sun, label: 'Pool' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-[#F6F7F8] rounded-2xl">
                    <item.icon size={16} className="text-[var(--accent-start)]" />
                    <span className="text-[9px] font-semibold text-[var(--muted)]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {detailTab === 'Route' && (
          <div className="mb-6 space-y-5">
            <h4 className="text-base font-bold text-[var(--text)] tracking-tight mb-3">Getting There</h4>
            {[
              { step: '01', title: 'Start from Town Center', desc: 'Take a local ride heading towards the landmark.', time: '5 min' },
              { step: '02', title: 'Follow the Coastal Road', desc: 'Enjoy scenic views along the shoreline drive.', time: '15 min' },
              { step: '03', title: 'Arrive at Destination', desc: 'Follow signs to the main entrance.', time: '5 min' },
            ].map((route, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-start)]/10 text-[var(--accent-start)] flex items-center justify-center text-[10px] font-black shrink-0">
                  {route.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--text)]">{route.title}</span>
                    <span className="text-[10px] font-semibold text-[var(--accent-start)]">{route.time}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{route.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {detailTab === 'Reviews' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-base font-bold text-[var(--text)] tracking-tight">Guest Reviews</h4>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star size={14} fill="#FFD166" />
                <span className="text-sm font-bold text-[var(--text)]">4.9</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md">
                    <img src="/images/logo.png" alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-[var(--text)] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-md">2K+</div>
              </div>
              <div>
                <span className="text-sm font-bold text-[var(--text)]">Excellent</span>
                <span className="text-xs text-[var(--muted)] ml-2">· 245 reviews</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Maria S.', text: 'Breathtaking views! A must-visit destination.', rating: 5 },
                { name: 'James T.', text: 'Rich history and stunning architecture. Loved it!', rating: 5 },
              ].map((review, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[var(--text)]">{review.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, si) => (
                        <Star key={si} size={10} fill="#FFD166" className="text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery Preview */}
        <div className="mb-6">
          <h4 className="text-base font-bold text-[var(--text)] tracking-tight mb-4">Gallery</h4>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                  idx === selectedImage ? 'border-[var(--accent-start)] ring-2 ring-[var(--accent-start)]/30 scale-110' : 'border-gray-100 opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Trip CTA */}
      <div className="sticky bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-xs text-[var(--muted)] font-semibold">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[var(--text)]">₱{spot.price || 0}</span>
              <span className="text-[10px] font-semibold text-[var(--muted)]">/ person</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onStartTrip}
            className="flex-1 h-14 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white rounded-[28px] font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Start Trip
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

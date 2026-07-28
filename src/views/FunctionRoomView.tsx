import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { UilBuilding, UilCheckCircle, UilUsersAlt, UilClock, UilSun, UilMoon, UilMusic, UilTennisBall, UilArrowLeft } from '@/icons';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType, Timestamp } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { getPilotConfig, isDininggasanPilot, type PilotConfig } from '../lib/pilotService';
import type { Business } from '../types';

export default function FunctionRoomView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [eventType, setEventType] = useState('celebration');
  const [expectedPax, setExpectedPax] = useState(30);
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    getPilotConfig().then(async (config) => {
      setPilotConfig(config);
      if (isDininggasanPilot(config)) {
        try {
          const bizDoc = await getDoc(doc(db, 'businesses', config.businessId));
          if (bizDoc.exists()) {
            setBusiness({ id: bizDoc.id, ...bizDoc.data() } as Business);
          }
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const fRoom = business?.functionRoom;

  const inferredSlot = useMemo(() => {
    if (!startTime) return null;
    const hour = parseInt(startTime.split(':')[0]);
    return hour < 12 ? 'morning' : 'night';
  }, [startTime]);

  const slotConfig = useMemo(() => {
    if (!fRoom || !inferredSlot) return null;
    return fRoom.timeSlots.find(s => s.id === inferredSlot) || null;
  }, [fRoom, inferredSlot]);

  const isMorning = inferredSlot === 'morning';

  const computeDurationHours = () => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (endMins <= startMins) return 0;
    return (endMins - startMins) / 60;
  };

  const durationHours = computeDurationHours();

  const priceBreakdown = useMemo(() => {
    if (!slotConfig || durationHours <= 0) return null;
    const baseHrs = slotConfig.baseHours;
    const baseCost = slotConfig.basePrice;
    const extraHrs = Math.max(0, durationHours - baseHrs);
    const extraCost = extraHrs * slotConfig.succeedingRate;
    const totalBase = baseCost + extraCost;

    let addonTotal = 0;
    if (fRoom?.addons) {
      for (const addon of fRoom.addons) {
        if (selectedAddons.includes(addon.id)) {
          if (addon.priceType === 'flat') {
            addonTotal += addon.price;
          } else {
            addonTotal += addon.price * durationHours;
          }
        }
      }
    }

    return {
      baseHours: baseHrs,
      baseCost,
      extraHrs,
      extraCost,
      totalBase,
      addonTotal,
      grandTotal: totalBase + addonTotal,
    };
  }, [slotConfig, durationHours, selectedAddons, fRoom?.addons]);

  const handleBook = async () => {
    if (!user) { login(); return; }
    if (!business || !priceBreakdown || durationHours <= 0) return;
    setBookingStatus('loading');

    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const endDateTime = new Date(`${selectedDate}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      setBookingStatus('idle');
      return;
    }

    try {
      const addonDetails = fRoom?.addons?.filter(a => selectedAddons.includes(a.id)) || [];
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceName: fRoom?.name || 'Function Room',
        serviceType: 'stay',
        businessId: business.id,
        bookingCategory: 'event',
        eventVenueId: 'function-room',
        eventType,
        expectedPax,
        eventStartTimestamp: Timestamp.fromDate(startDateTime),
        eventEndTimestamp: Timestamp.fromDate(endDateTime),
        timeSlot: inferredSlot,
        durationHours,
        baseAmount: priceBreakdown.totalBase,
        addons: addonDetails.map(a => ({ id: a.id, name: a.name, price: a.priceType === 'flat' ? a.price : a.price * durationHours })),
        amount: priceBreakdown.grandTotal,
        specialRequests,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      });
      setBookingStatus('success');
      toast.success('Function room inquiry submitted!');
    } catch (error) {
      setBookingStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-white border border-[#d2d2d7] rounded-xl outline-none text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355]/20 transition-all";
  const labelClass = "block text-xs font-semibold text-[#6e6e73] tracking-[-0.01em] mb-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#d2d2d7] border-t-[#8b7355]" />
      </div>
    );
  }

  if (!fRoom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <UilBuilding className="mx-auto text-[#d2d2d7] mb-4" size="48" />
          <h2 className="text-xl font-semibold text-[#6e6e73]">Function room information not available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        {bookingStatus === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-6">
              <UilCheckCircle className="text-[#8b7355]" size="32" />
            </div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-[-0.02em] mb-2">Inquiry Submitted</h2>
            <p className="text-[#6e6e73] mb-10">We'll get back to you shortly to confirm your booking.</p>
            <button onClick={() => { window.location.href = '/dininggasan'; }}
              className="px-7 py-3.5 rounded-xl bg-[#1d1d1f] text-white text-sm font-semibold hover:bg-[#2d2d2f] transition-all">
              Back to Dininggasan
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/dininggasan')}
                  className="w-9 h-9 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] transition-all">
                  <UilArrowLeft size="18" />
                </button>
                <span className="text-xs font-semibold text-[#8b7355] uppercase tracking-[0.15em]">Dininggasan</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-[#1d1d1f] tracking-[-0.03em]">
                Function Room
              </h1>
              <p className="text-[#6e6e73] mt-2 max-w-2xl">{fRoom.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
                  <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-8">Book the Function Room</h2>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Date</label>
                      <input type="date" value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Start Time</label>
                        <input type="time" value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End Time</label>
                        <input type="time" value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          className={inputClass} />
                      </div>
                    </div>

                    {inferredSlot && (
                      <div className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold ${
                        isMorning ? 'bg-[#f5f5f7] text-[#8b7355]' : 'bg-[#f5f5f7] text-[#6e6e73]'
                      }`}>
                        {isMorning ? <UilSun size="13" /> : <UilMoon size="13" />}
                        {isMorning ? 'Morning session' : 'Night session'}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Event Type</label>
                        <select value={eventType} onChange={e => setEventType(e.target.value)}
                          className={inputClass}>
                          <option value="celebration">Celebration</option>
                          <option value="meeting">Meeting</option>
                          <option value="seminar">Seminar</option>
                          <option value="party">Party</option>
                          <option value="reunion">Reunion</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Expected Pax</label>
                        <input type="number" value={expectedPax} min={1} max={fRoom.capacity}
                          onChange={e => setExpectedPax(Math.min(fRoom.capacity, Math.max(1, Number(e.target.value))))}
                          className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Duration</label>
                      <div className="flex items-center gap-2 text-sm text-[#1d1d1f] font-medium bg-[#f5f5f7] rounded-xl px-4 py-3.5">
                        <UilClock size="16" className="text-[#8b7355] shrink-0" />
                        {durationHours > 0 ? `${durationHours.toFixed(1)} hours` : 'Select start & end time'}
                        {slotConfig && durationHours > 0 && (
                          <span className="text-[#86868b] font-normal ml-1">
                            ({slotConfig.baseHours}h base + {Math.max(0, durationHours - slotConfig.baseHours).toFixed(1)}h extra)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Special Requests</label>
                      <textarea value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                        rows={2} placeholder="Any special requests or setup requirements..."
                        className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </motion.div>

                {fRoom.addons && fRoom.addons.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
                    <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-6">Add-ons</h2>
                    <div className="space-y-2">
                      {fRoom.addons.map(addon => (
                        <label key={addon.id}
                          className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all ${
                            selectedAddons.includes(addon.id) ? 'border-[#8b7355] bg-[#fafafa]' : 'border-[#e8e8ed] bg-white hover:bg-[#fafafa]'
                          }`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            selectedAddons.includes(addon.id) ? 'bg-[#8b7355] border-[#8b7355]' : 'border-[#d2d2d7]'
                          }`}>
                            {selectedAddons.includes(addon.id) && <UilCheckCircle size="12" className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {addon.id === 'addon-sound' && <UilMusic className="text-[#8b7355]" size="15" />}
                              {addon.id === 'addon-pickleball' && <UilTennisBall className="text-[#8b7355]" size="15" />}
                              <span className="text-sm font-semibold text-[#1d1d1f]">{addon.name}</span>
                            </div>
                            {addon.description && (
                              <p className="text-xs text-[#86868b] mt-0.5">{addon.description}</p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-[#1d1d1f]">
                            ₱{addon.price.toLocaleString()}{addon.priceType === 'per_hour' ? '/hr' : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                  className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
                  <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-6">Pricing</h2>
                  <div className="space-y-3">
                    {fRoom.timeSlots.map(slot => (
                      <div key={slot.id} className={`px-5 py-4 rounded-xl border transition-all ${
                        inferredSlot === slot.id ? 'border-[#8b7355] bg-[#fafafa]' : 'border-[#e8e8ed] bg-white'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {slot.id === 'morning' ? <UilSun className="text-[#8b7355]" size="14" /> : <UilMoon className="text-[#6e6e73]" size="14" />}
                          <span className="font-semibold text-sm text-[#1d1d1f]">{slot.label}</span>
                        </div>
                        <p className="text-xs text-[#6e6e73]">₱{slot.basePrice.toLocaleString()} for first {slot.baseHours}h</p>
                        <p className="text-xs text-[#6e6e73]">₱{slot.succeedingRate.toLocaleString()}/hr succeeding</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                  className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
                  <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-6">Total Estimate</h2>

                  {priceBreakdown && durationHours > 0 ? (
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6e6e73]">Base ({priceBreakdown.baseHours}h)</span>
                        <span className="font-medium text-[#1d1d1f]">₱{priceBreakdown.baseCost.toLocaleString()}</span>
                      </div>
                      {priceBreakdown.extraHrs > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#6e6e73]">Extra ({priceBreakdown.extraHrs.toFixed(1)}h)</span>
                          <span className="font-medium text-[#1d1d1f]">₱{priceBreakdown.extraCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2.5 border-t border-[#e8e8ed]">
                        <span className="font-semibold text-[#1d1d1f]">Venue Total</span>
                        <span className="font-semibold text-[#1d1d1f]">₱{priceBreakdown.totalBase.toLocaleString()}</span>
                      </div>
                      {priceBreakdown.addonTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#6e6e73]">Add-ons</span>
                          <span className="font-medium text-[#8b7355]">+ ₱{priceBreakdown.addonTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2.5 border-t-2 border-[#1d1d1f]">
                        <span className="font-semibold text-[#1d1d1f]">Estimated Total</span>
                        <span className="font-bold text-lg text-[#1d1d1f]">₱{priceBreakdown.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#86868b]">Select date, start and end time to see pricing</p>
                  )}

                  <motion.button whileTap={{ scale: 0.98 }}
                    onClick={handleBook}
                    disabled={!user || durationHours <= 0 || bookingStatus === 'loading'}
                    className="w-full mt-8 bg-[#1d1d1f] text-white py-4 rounded-xl font-semibold text-sm hover:bg-[#2d2d2f] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {user ? (bookingStatus === 'loading' ? 'Submitting...' : 'Submit Inquiry') : 'Sign in to Book'}
                  </motion.button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
                  <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {fRoom.amenities.map((amenity, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#f5f5f7] rounded-lg text-xs font-medium text-[#6e6e73]">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

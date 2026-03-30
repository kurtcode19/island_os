import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  Compass, 
  Wallet, 
  ArrowRight, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  ChevronRight,
  Star,
  Info
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey });

interface DayPlan {
  day: number;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    price: number;
  }[];
}

export default function TripPlannerView() {
  const { user, login } = useAuth();
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState('Adventure');
  const [budget, setBudget] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});

  const generateTrip = async () => {
    setLoading(true);
    try {
      const prompt = `Create a ${days}-day itinerary for a ${style} trip to Camiguin Island with a ${budget} budget. 
      Return the response as a JSON array of objects, where each object represents a day and has a 'day' number and an 'activities' array. 
      Each activity should have 'time', 'activity', 'location', 'description', and an estimated 'price' in PHP.`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are a 'Camiguin Island Local Expert.' Your goal is to create a highly detailed, realistic travel itinerary for Camiguin Island, Philippines. Use real spots like White Island, Sunken Cemetery, Katibawasan Falls, Hibok-Hibok Volcano, Ardent Hot Springs, etc. Ensure the activities match the user's travel style and budget.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      location: { type: Type.STRING },
                      description: { type: Type.STRING },
                      price: { type: Type.NUMBER }
                    },
                    required: ["time", "activity", "location", "description", "price"]
                  }
                }
              },
              required: ["day", "activities"]
            }
          }
        }
      });

      const responseText = result.text;
      const data = JSON.parse(responseText);
      setItinerary(data);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookActivity = async (activity: any, dayNum: number) => {
    if (!user) {
      login();
      return;
    }

    const activityKey = `${dayNum}-${activity.activity}`;
    setBookingStatus(prev => ({ ...prev, [activityKey]: 'loading' }));

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceName: activity.activity,
        serviceType: 'experience',
        location: activity.location,
        date: `Day ${dayNum}`,
        amount: activity.price,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
        isVipBooking: true
      });

      setBookingStatus(prev => ({ ...prev, [activityKey]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [activityKey]: 'idle' }));
      }, 3000);
    } catch (error) {
      setBookingStatus(prev => ({ ...prev, [activityKey]: 'idle' }));
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="bg-island-cream min-h-screen pb-20">
      {/* Header */}
      <section className="relative h-[40vh] flex items-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/camiguin-aerial/2000/1000" 
          alt="Camiguin Aerial" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 italic">
              Smart <span className="not-italic text-island-emerald">Trip Planner</span>
            </h1>
            <p className="text-xl text-slate-200 font-light max-w-2xl">
              Let our AI Local Expert craft your perfect Camiguin adventure in seconds.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* Form Card */}
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-island-green uppercase tracking-widest">
                <Calendar size={16} className="text-island-emerald" /> Duration
              </label>
              <select 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-island-emerald font-bold text-island-green"
              >
                {[1, 2, 3, 4, 5].map(d => (
                  <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-island-green uppercase tracking-widest">
                <Compass size={16} className="text-island-emerald" /> Travel Style
              </label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-island-emerald font-bold text-island-green"
              >
                <option value="Adventure">Adventure</option>
                <option value="Relax">Relax</option>
                <option value="Foodie">Foodie</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-island-green uppercase tracking-widest">
                <Wallet size={16} className="text-island-emerald" /> Budget
              </label>
              <select 
                value={budget} 
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-island-emerald font-bold text-island-green"
              >
                <option value="Budget">Budget Friendly</option>
                <option value="Moderate">Moderate</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
          </div>

          <button 
            onClick={generateTrip}
            disabled={loading}
            className="w-full py-6 island-gradient text-white rounded-[2.5rem] font-bold text-lg shadow-xl shadow-island-emerald/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? (
              <><RefreshCw size={24} className="animate-spin" /> Crafting your itinerary...</>
            ) : (
              <><Sparkles size={24} /> Generate My Smart Itinerary</>
            )}
          </button>
        </div>

        {/* Itinerary Display */}
        <AnimatePresence>
          {itinerary && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <span className="text-island-coral font-bold uppercase tracking-[0.3em] text-xs mb-2 block">Your Custom Plan</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-island-green italic">
                  Camiguin <span className="not-italic text-island-emerald">Island Escape</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {itinerary.map((day, idx) => (
                  <motion.div 
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <div className="bg-island-green p-6 text-white flex justify-between items-center">
                      <h3 className="text-2xl font-serif font-bold italic">Day {day.day}</h3>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Star size={20} />
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-8">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-island-emerald border-4 border-white shadow-sm"></div>
                          
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-island-emerald uppercase tracking-widest flex items-center gap-1">
                              <Clock size={12} /> {act.time}
                            </span>
                            <span className="text-xs font-bold text-island-green">₱{act.price.toLocaleString()}</span>
                          </div>
                          
                          <h4 className="text-lg font-bold text-island-green mb-1">{act.activity}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <MapPin size={10} /> {act.location}
                          </p>
                          <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
                            {act.description}
                          </p>

                          <button 
                            onClick={() => handleBookActivity(act, day.day)}
                            disabled={bookingStatus[`${day.day}-${act.activity}`] === 'loading' || bookingStatus[`${day.day}-${act.activity}`] === 'success'}
                            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                              bookingStatus[`${day.day}-${act.activity}`] === 'success' 
                                ? 'bg-green-500 text-white' 
                                : bookingStatus[`${day.day}-${act.activity}`] === 'loading'
                                ? 'bg-slate-100 text-slate-400'
                                : 'border-2 border-island-emerald text-island-emerald hover:bg-island-emerald hover:text-white'
                            }`}
                          >
                            {bookingStatus[`${day.day}-${act.activity}`] === 'success' ? (
                              <><CheckCircle2 size={16} /> Booked with VIP Pass</>
                            ) : bookingStatus[`${day.day}-${act.activity}`] === 'loading' ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <>Book with VIP Pass</>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-island-green p-12 rounded-[4rem] text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <Sparkles size={400} className="absolute -top-20 -left-20 rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6 italic">Ready for <span className="not-italic text-island-emerald">Camiguin?</span></h3>
                  <p className="text-emerald-100/70 font-light text-lg mb-10">
                    Your smart itinerary is ready. You can manage all your VIP bookings in your profile dashboard.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button className="px-10 py-5 bg-white text-island-green rounded-[2rem] font-bold shadow-2xl hover:scale-105 transition-all">
                      Save Itinerary
                    </button>
                    <button className="px-10 py-5 border-2 border-island-emerald text-island-emerald rounded-[2rem] font-bold hover:bg-island-emerald hover:text-white transition-all">
                      Share with Friends
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!itinerary && !loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-island-emerald/10 rounded-[2rem] flex items-center justify-center text-island-emerald mx-auto mb-6">
              <Info size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-island-green mb-2 italic">No itinerary yet</h3>
            <p className="text-slate-400 font-light">Adjust the settings above and click generate to start your journey.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Compass, 
  Wallet, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Star,
  Info,
  Waves,
  Palmtree,
  Anchor,
  ArrowLeft
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
  const navigate = useNavigate();
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState('Adventure');
  const [budget, setBudget] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-600 pb-20 selection:bg-teal-400 selection:text-blue-900">
      {/* Header */}
      <section className="relative h-[35vh] md:h-[45vh] flex items-center overflow-hidden">
        {/* Mobile Back Button */}
        {isMobile && (
          <button 
            onClick={() => navigate('/mobile')}
            className="absolute top-6 left-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-2xl"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/camiguin-paradise/2000/1000" 
            alt="Camiguin Paradise" 
            className="w-full h-full object-cover brightness-50 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/80" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-4 italic text-balance leading-tight">
              Smart <span className="not-italic text-teal-300">Trip Planner</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-50/80 font-light max-w-2xl text-balance">
              Experience Camiguin through the eyes of a local. Our AI crafts your perfect island escape in seconds.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-20 relative z-20">
        {/* Form Card - Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-white/20 shadow-2xl mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-teal-300 uppercase tracking-[0.2em]">
                <Calendar size={14} /> Trip Duration
              </label>
              <div className="relative">
                <select 
                  value={days} 
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-14 pl-4 pr-10 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white font-medium appearance-none transition-all"
                >
                  {[1, 2, 3, 4, 5].map(d => (
                    <option key={d} value={d} className="bg-blue-900">{d} {d === 1 ? 'Day' : 'Days'}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-teal-300 uppercase tracking-[0.2em]">
                <Compass size={14} /> Travel Style
              </label>
              <div className="relative">
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full h-14 pl-4 pr-10 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white font-medium appearance-none transition-all"
                >
                  <option value="Adventure" className="bg-blue-900">Adventure</option>
                  <option value="Relax" className="bg-blue-900">Relax</option>
                  <option value="Foodie" className="bg-blue-900">Foodie</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-teal-300 uppercase tracking-[0.2em]">
                <Wallet size={14} /> Budget Level
              </label>
              <div className="relative">
                <select 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-14 pl-4 pr-10 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white font-medium appearance-none transition-all"
                >
                  <option value="Budget" className="bg-blue-900">Budget Friendly</option>
                  <option value="Moderate" className="bg-blue-900">Moderate</option>
                  <option value="Luxury" className="bg-blue-900">Luxury</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={generateTrip}
            disabled={loading}
            className="w-full h-16 bg-teal-400 hover:bg-teal-300 text-blue-950 rounded-2xl font-bold text-lg shadow-lg shadow-teal-400/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <RefreshCw size={24} className="animate-spin" />
                <span className="animate-pulse">Thinking...</span>
              </div>
            ) : (
              <><Sparkles size={24} /> Generate My Smart Itinerary</>
            )}
          </button>
        </motion.div>

        {/* Categories Icons Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 px-4">
          {[
            { icon: Waves, label: 'Waterfalls', color: 'text-blue-300' },
            { icon: Palmtree, label: 'Beaches', color: 'text-teal-300' },
            { icon: Anchor, label: 'Diving', color: 'text-cyan-300' },
            { icon: Compass, label: 'Hiking', color: 'text-emerald-300' }
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center ${cat.color} shadow-lg`}>
                <cat.icon size={28} />
              </div>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Itinerary Display */}
        <AnimatePresence mode="wait">
          {itinerary ? (
            <motion.div 
              key="itinerary"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <span className="text-teal-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-3 block">Personalized Journey</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white italic text-balance">
                  Your Camiguin <span className="not-italic text-teal-300">Island Escape</span>
                </h2>
              </div>

              {/* Responsive Layout: Stacked on Mobile, Grid on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                {itinerary.map((day, idx) => (
                  <motion.div 
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden group"
                  >
                    <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-6 border-b border-white/10 flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-white italic">Day {day.day}</h3>
                        <p className="text-[10px] text-teal-300 font-bold uppercase tracking-widest mt-1">Daily Adventure</p>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-300 border border-white/10">
                        <Star size={24} />
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-10">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className="relative pl-8 border-l border-white/10 last:border-0 pb-10 last:pb-0">
                          {/* Timeline Dot */}
                          <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                          
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest flex items-center gap-1.5 bg-teal-400/10 px-2 py-1 rounded-md">
                              <Clock size={12} /> {act.time}
                            </span>
                            <span className="text-xs font-bold text-white/80">₱{act.price.toLocaleString()}</span>
                          </div>
                          
                          <h4 className="text-lg font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">{act.activity}</h4>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <MapPin size={12} /> {act.location}
                          </p>
                          <p className="text-sm text-white/60 font-light leading-relaxed mb-6 text-balance">
                            {act.description}
                          </p>

                          <button 
                            onClick={() => handleBookActivity(act, day.day)}
                            disabled={bookingStatus[`${day.day}-${act.activity}`] === 'loading' || bookingStatus[`${day.day}-${act.activity}`] === 'success'}
                            className={`w-full h-12 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                              bookingStatus[`${day.day}-${act.activity}`] === 'success' 
                                ? 'bg-emerald-500 text-white' 
                                : bookingStatus[`${day.day}-${act.activity}`] === 'loading'
                                ? 'bg-white/5 text-white/30'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-teal-400 hover:text-blue-900 hover:border-transparent'
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

              {/* Call to Action Footer */}
              <div className="bg-white/5 backdrop-blur-2xl p-10 md:p-16 rounded-[3rem] border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                  <Sparkles size={400} className="absolute -top-20 -left-20 rotate-12 text-teal-300" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 italic">Ready for <span className="not-italic text-teal-300">Camiguin?</span></h3>
                  <p className="text-teal-50/60 font-light text-lg mb-10 text-balance">
                    Your smart itinerary is locked and loaded. Manage all your VIP bookings in your profile dashboard anytime.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                    <button className="w-full sm:w-auto h-14 px-10 bg-white text-blue-900 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                      Save Itinerary
                    </button>
                    <button className="w-full sm:w-auto h-14 px-10 border border-teal-400/50 text-teal-300 rounded-2xl font-bold hover:bg-teal-400/10 active:scale-95 transition-all">
                      Share Journey
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center text-teal-300 border border-white/10 mx-auto mb-8 shadow-2xl">
                  <Info size={48} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3 italic">No itinerary yet</h3>
                <p className="text-teal-50/40 font-light max-w-sm mx-auto text-balance">Adjust the settings above and let the AI craft your perfect island journey.</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

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
  ArrowLeft,
  ChevronRight,
  Mountain,
  Coffee,
  Sun,
  Coins,
  Gem,
  ArrowRight
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

type Step = 'duration' | 'style' | 'budget' | 'result';

export default function TripPlannerView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Form State
  const [step, setStep] = useState<Step>('duration');
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState('Adventure');
  const [budget, setBudget] = useState('Moderate');
  
  // UI State
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
    setStep('result');
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
      setStep('budget'); // Go back on error
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

  const steps: Step[] = ['duration', 'style', 'budget', 'result'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (step) {
      case 'duration':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2 text-balance">How long is your escape?</h2>
              <p className="text-slate-500 text-balance">Select the number of days for your Camiguin journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => { setDays(d); setStep('style'); }}
                  className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 shadow-sm ${
                    days === d 
                      ? 'border-island-emerald bg-island-emerald/5 text-island-green shadow-md' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl font-bold">{d}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{d === 1 ? 'Day' : 'Days'}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'style':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2 text-balance">What's your vibe?</h2>
              <p className="text-slate-500 text-balance">We'll tailor activities to match your travel personality.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'Adventure', icon: Mountain, label: 'Adventure', desc: 'Hiking, diving, and exploring hidden spots.' },
                { id: 'Relax', icon: Sun, label: 'Relaxation', desc: 'Hot springs, beaches, and slow island life.' },
                { id: 'Foodie', icon: Coffee, label: 'Foodie', desc: 'Local delicacies, markets, and best eats.' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setStyle(s.id); setStep('budget'); }}
                  className={`p-8 rounded-[2.5rem] border text-left transition-all group shadow-sm ${
                    style === s.id 
                      ? 'border-island-emerald bg-island-emerald/5 shadow-lg' 
                      : 'border-slate-100 bg-white hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    style === s.id ? 'bg-island-emerald text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-island-emerald/10 group-hover:text-island-emerald'
                  }`}>
                    <s.icon size={28} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${style === s.id ? 'text-island-green' : 'text-island-green'}`}>{s.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('duration')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
              <ArrowLeft size={14} /> Back to Duration
            </button>
          </div>
        );
      case 'budget':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2 text-balance">Plan your spending</h2>
              <p className="text-slate-500 text-balance">Choose a budget level that fits your wallet.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'Budget', icon: Coins, label: 'Budget Friendly', desc: 'Smart choices, local prices, maximum value.' },
                { id: 'Moderate', icon: Wallet, label: 'Moderate', desc: 'Comfortable stays and premium experiences.' },
                { id: 'Luxury', icon: Gem, label: 'Luxury', desc: 'The finest resorts and exclusive private tours.' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBudget(b.id)}
                  className={`p-8 rounded-[2.5rem] border text-left transition-all group shadow-sm ${
                    budget === b.id 
                      ? 'border-island-emerald bg-island-emerald/5 shadow-lg' 
                      : 'border-slate-100 bg-white hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    budget === b.id ? 'bg-island-emerald text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-island-emerald/10 group-hover:text-island-emerald'
                  }`}>
                    <b.icon size={28} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${budget === b.id ? 'text-island-green' : 'text-island-green'}`}>{b.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={generateTrip}
                className="w-full h-16 island-gradient text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={24} /> Generate My Smart Itinerary
              </button>
              <button onClick={() => setStep('style')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
                <ArrowLeft size={14} /> Back to Style
              </button>
            </div>
          </div>
        );
      case 'result':
        if (loading) return <ShimmerLoader />;
        return <ItineraryResult itinerary={itinerary} bookingStatus={bookingStatus} onBook={handleBookActivity} onReset={() => setStep('duration')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => navigate('/mobile')} className="p-2 text-slate-400 hover:text-[#0A2540]">
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-white shadow-lg">
                <Compass size={20} />
              </div>
              <h1 className="text-xl font-serif font-bold text-[#0A2540] tracking-tight italic">
                Isle<span className="not-italic text-island-emerald">GO</span> <span className="not-italic text-slate-300 font-light mx-2">|</span> Planner
              </h1>
            </div>
          </div>
          
          {/* Progress Bar */}
          {step !== 'result' && (
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-12">
              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-teal-500"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Step {currentStepIndex + 1} of 3
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by</span>
              <span className="text-xs font-bold text-teal-600">Gemini 3 Flash</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function ShimmerLoader() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="h-10 w-64 bg-slate-200 rounded-full mx-auto animate-pulse" />
        <div className="h-4 w-48 bg-slate-100 rounded-full mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 space-y-6 shadow-sm">
            <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
            <div className="space-y-8">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-1 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-20 w-full bg-slate-50 rounded-2xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItineraryResult({ itinerary, bookingStatus, onBook, onReset }: any) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-teal-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-2 block">Your Custom Journey</span>
          <h2 className="text-4xl font-bold text-[#0A2540] text-balance">Camiguin Island Escape</h2>
        </div>
        <button 
          onClick={onReset}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} /> Plan New Trip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {itinerary?.map((day: any, idx: number) => (
          <motion.div 
            key={day.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="bg-[#0A2540] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Day {day.day}</h3>
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">Daily Adventure</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400">
                <Star size={24} />
              </div>
            </div>
            
            <div className="p-6 space-y-10">
              {day.activities.map((act: any, aIdx: number) => (
                <div key={aIdx} className="relative pl-8 border-l-2 border-slate-50 last:border-0 pb-10 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-island-emerald uppercase tracking-widest flex items-center gap-1.5 bg-island-emerald/10 px-2 py-1 rounded-md">
                      <Clock size={12} /> {act.time}
                    </span>
                    <span className="text-xs font-bold text-island-green">₱{act.price.toLocaleString()}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-island-green mb-1">{act.activity}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <MapPin size={12} /> {act.location}
                  </p>
                  <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
                    {act.description}
                  </p>

                  <button 
                    onClick={() => onBook(act, day.day)}
                    disabled={bookingStatus[`${day.day}-${act.activity}`] === 'loading' || bookingStatus[`${day.day}-${act.activity}`] === 'success'}
                    className={`w-full h-12 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      bookingStatus[`${day.day}-${act.activity}`] === 'success' 
                        ? 'bg-emerald-500 text-white' 
                        : bookingStatus[`${day.day}-${act.activity}`] === 'loading'
                        ? 'bg-slate-50 text-slate-300'
                        : 'bg-island-emerald text-white shadow-lg shadow-island-emerald/20 hover:bg-island-emerald/90'
                    }`}
                  >
                    {bookingStatus[`${day.day}-${act.activity}`] === 'success' ? (
                      <><CheckCircle2 size={16} /> Added to Pass</>
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

      {/* CTA Footer */}
      <div className="bg-[#0A2540] p-10 md:p-16 rounded-[3rem] text-center relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <Sparkles size={400} className="absolute -top-20 -left-20 rotate-12 text-teal-400" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready for Camiguin?</h3>
          <p className="text-slate-300 font-light text-lg mb-10 text-balance">
            Your smart itinerary is ready. You can manage all your VIP bookings in your profile dashboard anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto h-14 px-10 bg-white text-[#0A2540] rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
              Save Itinerary
            </button>
            <button className="w-full sm:w-auto h-14 px-10 border border-teal-400 text-teal-400 rounded-2xl font-bold hover:bg-teal-400/10 active:scale-95 transition-all">
              Share Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

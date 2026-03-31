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
  ArrowRight,
  Users,
  Car,
  Zap,
  Camera,
  Utensils,
  Map as MapIcon,
  Heart,
  CloudRain,
  ShieldCheck,
  Ticket
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
    timeSlot: string;
    activity: string;
    location: string;
    description: string;
    whyGo: string;
    price: number;
  }[];
}

type Step = 'duration' | 'group' | 'transport' | 'pace' | 'interests' | 'style' | 'budget' | 'result';

const LOADING_QUOTES = [
  "Packing your virtual bags...",
  "Checking the tides at White Island...",
  "Consulting the Lanzones oracle...",
  "Mapping out the best sunset at Sunken Cemetery...",
  "Finding the coldest spring in Camiguin...",
  "Clustering spots by municipality for efficiency...",
  "Finding the freshest Lanzones ice cream..."
];

export default function TripPlannerView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Form State
  const [step, setStep] = useState<Step>('duration');
  const [days, setDays] = useState(3);
  const [groupType, setGroupType] = useState('Solo');
  const [transport, setTransport] = useState('No Vehicle');
  const [pace, setPace] = useState('Moderate');
  const [interests, setInterests] = useState<string[]>([]);
  const [style, setStyle] = useState('Adventure');
  const [budget, setBudget] = useState('Moderate');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const generateTrip = async () => {
    setLoading(true);
    setStep('result');
    try {
      const prompt = `Create a ${days}-day itinerary for a ${groupType} trip to Camiguin Island.
      Transportation: ${transport}.
      Pace: ${pace}.
      Special Interests: ${interests.join(', ') || 'General'}.
      Travel Style: ${style}.
      Budget: ${budget}.
      
      Return the response as a JSON array of objects, where each object represents a day and has a 'day' number and an 'activities' array. 
      Each activity MUST have:
      - 'timeSlot': (e.g., '8:00 AM - 10:00 AM')
      - 'activity': (Name of the activity)
      - 'location': (Specific spot name)
      - 'description': (Brief details)
      - 'whyGo': (A single compelling sentence explaining why this spot is a must-visit for this specific user)
      - 'price': (Estimated price in PHP as a number)`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are a 'Senior Camiguin Concierge' and local expert. Your goal is to create a highly detailed, realistic, and optimized travel itinerary for Camiguin Island, Philippines.
          
          CRITICAL LOGIC:
          1. Geographic Clustering: Organise activities by municipality (Mambajao, Catarman, Mahinog, Sagay, Guinsiliban) to minimize travel time. Do not jump between distant towns in one day.
          2. Timing: Always suggest 'White Island' for early morning (sunrise) to avoid crowds and heat. Suggest 'Sunken Cemetery' for sunset views.
          3. Local MSME Integration: Include specific local experiences like 'Try the Lanzones ice cream', 'Rent a clear kayak at Mantigue', or 'Eat at J&A Fishpen'.
          4. Personalization: Adjust the density of activities based on the 'Pace' (Relaxed: 2 spots, Moderate: 3-4 spots, Packed: Max adventure).
          5. Accuracy: Use real spots and realistic travel times.`,
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
                      timeSlot: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      location: { type: Type.STRING },
                      description: { type: Type.STRING },
                      whyGo: { type: Type.STRING },
                      price: { type: Type.NUMBER }
                    },
                    required: ["timeSlot", "activity", "location", "description", "whyGo", "price"]
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

  const handleAction = async (activity: any, dayNum: number, actionType: 'transport' | 'pass') => {
    if (!user) {
      login();
      return;
    }

    const activityKey = `${dayNum}-${activity.activity}-${actionType}`;
    setBookingStatus(prev => ({ ...prev, [activityKey]: 'loading' }));

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceName: activity.activity,
        serviceType: actionType === 'transport' ? 'transport' : 'experience',
        location: activity.location,
        date: `Day ${dayNum}`,
        amount: actionType === 'transport' ? 500 : activity.price, // Mock transport price
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

  const steps: Step[] = ['duration', 'group', 'transport', 'pace', 'interests', 'style', 'budget', 'result'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / (steps.length - 1)) * 100;

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'duration':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">How long is your escape?</h2>
              <p className="text-slate-500">Select the number of days for your Camiguin journey.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => { setDays(d); setStep('group'); }}
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
      case 'group':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">Who are you traveling with?</h2>
              <p className="text-slate-500">We'll suggest spots that fit your group's dynamic.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'Solo', icon: Compass, label: 'Solo', desc: 'Me, myself, and the island.' },
                { id: 'Couple', icon: Heart, label: 'Couple', desc: 'Romantic getaways and sunsets.' },
                { id: 'Family', icon: Users, label: 'Family', desc: 'Kid-friendly and safe spots.' },
                { id: 'Friends', icon: Users, label: 'Friends', desc: 'Barkada adventure and fun.' }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGroupType(g.id); setStep('transport'); }}
                  className={`p-6 rounded-3xl border text-left transition-all group shadow-sm ${
                    groupType === g.id 
                      ? 'border-island-emerald bg-island-emerald/5 shadow-md' 
                      : 'border-slate-100 bg-white hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    groupType === g.id ? 'bg-island-emerald text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-island-emerald/10 group-hover:text-island-emerald'
                  }`}>
                    <g.icon size={24} />
                  </div>
                  <h3 className="font-bold text-island-green mb-1">{g.label}</h3>
                  <p className="text-xs text-slate-500">{g.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('duration')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );
      case 'transport':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">How will you get around?</h2>
              <p className="text-slate-500">Choose your preferred mode of island transport.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'No Vehicle', icon: MapPin, label: 'No Vehicle', desc: 'Needs Tricycle or Van rentals.' },
                { id: 'Self-Drive', icon: Car, label: 'Self-Drive', desc: 'Motorbike or Car rental.' },
                { id: 'Private Tour', icon: ShieldCheck, label: 'Private Tour', desc: 'All-inclusive guided tour.' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTransport(t.id); setStep('pace'); }}
                  className={`p-8 rounded-[2.5rem] border text-left transition-all group shadow-sm ${
                    transport === t.id 
                      ? 'border-island-emerald bg-island-emerald/5 shadow-lg' 
                      : 'border-slate-100 bg-white hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    transport === t.id ? 'bg-island-emerald text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-island-emerald/10 group-hover:text-island-emerald'
                  }`}>
                    <t.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-island-green">{t.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('group')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );
      case 'pace':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">What's your pace?</h2>
              <p className="text-slate-500">How many spots do you want to hit per day?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'Relaxed', icon: Sun, label: 'Relaxed', desc: '2 spots/day. Slow and steady.' },
                { id: 'Moderate', icon: Clock, label: 'Moderate', desc: '3-4 spots/day. The sweet spot.' },
                { id: 'Packed', icon: Zap, label: 'Packed', desc: 'Max adventure. See it all!' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPace(p.id); setStep('interests'); }}
                  className={`p-8 rounded-[2.5rem] border text-left transition-all group shadow-sm ${
                    pace === p.id 
                      ? 'border-island-emerald bg-island-emerald/5 shadow-lg' 
                      : 'border-slate-100 bg-white hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    pace === p.id ? 'bg-island-emerald text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-island-emerald/10 group-hover:text-island-emerald'
                  }`}>
                    <p.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-island-green">{p.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('transport')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );
      case 'interests':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">Special Interests</h2>
              <p className="text-slate-500">Select any specific areas you're interested in.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'Photography', icon: Camera, label: 'Photography' },
                { id: 'Hidden Gems', icon: Gem, label: 'Hidden Gems' },
                { id: 'Local Food', icon: Utensils, label: 'Local Food' },
                { id: 'Extreme Hiking', icon: Mountain, label: 'Extreme Hiking' }
              ].map((i) => (
                <button
                  key={i.id}
                  onClick={() => toggleInterest(i.id)}
                  className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 shadow-sm ${
                    interests.includes(i.id) 
                      ? 'border-island-emerald bg-island-emerald/5 text-island-green shadow-md' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-island-emerald/30 hover:bg-slate-50'
                  }`}
                >
                  <i.icon size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">{i.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setStep('style')}
                className="w-full h-14 island-gradient text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
              <button onClick={() => setStep('pace')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        );
      case 'style':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">What's your vibe?</h2>
              <p className="text-slate-500">We'll tailor activities to match your travel personality.</p>
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
                  <h3 className="text-xl font-bold mb-2 text-island-green">{s.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('interests')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto hover:text-island-emerald transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );
      case 'budget':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">Plan your spending</h2>
              <p className="text-slate-500">Choose a budget level that fits your wallet.</p>
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
                  <h3 className="text-xl font-bold mb-2 text-island-green">{b.label}</h3>
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
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        );
      case 'result':
        if (loading) return <ShimmerLoader quote={LOADING_QUOTES[quoteIndex]} />;
        return <ItineraryResult itinerary={itinerary} bookingStatus={bookingStatus} onAction={handleAction} onReset={() => setStep('duration')} />;
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
                Step {currentStepIndex + 1} of {steps.length - 1}
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

function ShimmerLoader({ quote }: { quote: string }) {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-island-emerald/10 text-island-emerald rounded-3xl flex items-center justify-center mx-auto animate-bounce">
          <Sparkles size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0A2540]">Crafting your island story...</h2>
          <motion.p 
            key={quote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-island-emerald font-medium italic"
          >
            "{quote}"
          </motion.p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 space-y-6 shadow-sm">
            <div className="h-8 w-24 bg-slate-200/50 rounded-xl animate-pulse" />
            <div className="space-y-8">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-1 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-200/50 rounded-full animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-100/50 rounded-full animate-pulse" />
                    <div className="h-20 w-full bg-slate-50/50 rounded-2xl animate-pulse" />
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

function ItineraryResult({ itinerary, bookingStatus, onAction, onReset }: any) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-teal-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-2 block">Your Smart Concierge Itinerary</span>
          <h2 className="text-4xl font-bold text-[#0A2540] text-balance">Camiguin Island Journey</h2>
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
            className="bg-white/60 backdrop-blur-lg rounded-[2.5rem] border border-white/80 shadow-xl overflow-hidden"
          >
            <div className="bg-[#0A2540] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold italic font-serif">Day {day.day}</h3>
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">Daily Adventure</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400">
                <MapIcon size={24} />
              </div>
            </div>
            
            <div className="p-6 space-y-10">
              {day.activities.map((act: any, aIdx: number) => (
                <div key={aIdx} className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-10 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-island-emerald uppercase tracking-widest flex items-center gap-1.5 bg-island-emerald/10 px-2 py-1 rounded-md">
                      <Clock size={12} /> {act.timeSlot}
                    </span>
                    <span className="text-xs font-bold text-island-green">₱{act.price.toLocaleString()}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-island-green mb-1">{act.activity}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MapPin size={12} /> {act.location}
                  </p>
                  
                  <div className="p-3 bg-island-emerald/5 rounded-xl border border-island-emerald/10 mb-4">
                    <p className="text-xs font-bold text-island-emerald mb-1 flex items-center gap-1.5">
                      <Sparkles size={12} /> Why go?
                    </p>
                    <p className="text-xs text-island-green font-medium leading-relaxed">
                      {act.whyGo}
                    </p>
                  </div>

                  <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
                    {act.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => onAction(act, day.day, 'transport')}
                      disabled={bookingStatus[`${day.day}-${act.activity}-transport`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-transport`] === 'success'}
                      className={`h-10 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        bookingStatus[`${day.day}-${act.activity}-transport`] === 'success' 
                          ? 'bg-green-500 text-white' 
                          : bookingStatus[`${day.day}-${act.activity}-transport`] === 'loading'
                          ? 'bg-slate-50 text-slate-300'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {bookingStatus[`${day.day}-${act.activity}-transport`] === 'success' ? (
                        <><CheckCircle2 size={14} /> Booked</>
                      ) : (
                        <><Car size={14} /> Transport</>
                      )}
                    </button>
                    <button 
                      onClick={() => onAction(act, day.day, 'pass')}
                      disabled={bookingStatus[`${day.day}-${act.activity}-pass`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'}
                      className={`h-10 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' 
                          ? 'bg-island-emerald text-white' 
                          : bookingStatus[`${day.day}-${act.activity}-pass`] === 'loading'
                          ? 'bg-slate-50 text-slate-300'
                          : 'bg-island-emerald/10 text-island-emerald hover:bg-island-emerald/20'
                      }`}
                    >
                      {bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' ? (
                        <><CheckCircle2 size={14} /> Added</>
                      ) : (
                        <><Ticket size={14} /> Add to Pass</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weather Warning & Footer */}
      <div className="space-y-8">
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CloudRain size={20} />
          </div>
          <div>
            <h4 className="font-bold text-orange-800 text-sm mb-1">Local Travel Tip</h4>
            <p className="text-orange-700 text-xs leading-relaxed">
              Tip: Always bring a dry bag for boat trips to White Island. Weather can change quickly, and keeping your gear dry is essential for a great experience!
            </p>
          </div>
        </div>

        <div className="bg-[#0A2540] p-10 md:p-16 rounded-[3rem] text-center relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <Sparkles size={400} className="absolute -top-20 -left-20 rotate-12 text-teal-400" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready for Camiguin?</h3>
            <p className="text-slate-300 font-light text-lg mb-10 text-balance">
              Your smart itinerary is ready. You can manage all your VIP bookings and transport in your profile dashboard anytime.
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
    </div>
  );
}

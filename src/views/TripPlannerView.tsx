import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  UilCalendar, 
  UilCompass, 
  UilWallet, 
  UilMapMarker, 
  UilClock, 
  UilCheckCircle, 
  UilRefresh,
  UilStar,
  UilInfoCircle,
  UilWater,
  UilMap,
  UilAnchor,
  UilArrowLeft,
  UilAngleRightB,
  UilMountains,
  UilCoffee,
  UilSun,
  UilCoins,
  UilDollarAlt,
  UilArrowRight,
  UilUsersAlt,
  UilCar,
  UilBolt,
  UilCamera,
  UilUtensils,
  UilMapPin,
  UilHeart,
  UilCloudRain,
  UilShieldCheck,
  UilTicket,
  UilShareAlt,
  UilUser,
  UilTimes,
  UilCreditCard,
  UilArrowUpRight,
  UilBoltSlash,
  UilDna
} from '@/icons';
import { GoogleGenAI, Type } from "@google/genai";
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

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
    category?: string;
  }[];
}

type Step = 'duration' | 'group' | 'transport' | 'pace' | 'interests' | 'style' | 'budget' | 'result';

const LOADING_QUOTES = [
  "Consulting the Catarman digital concierge...",
  "Mapping the tides at Sunken Cemetery...",
  "Sourcing fresh local delicacies...",
  "Optimizing your heritage trail...",
  "Crafting your bespoke island story..."
];

const CAMIGUIN_IMAGES = [
  "/images/hero-sunken.png",
  "/images/old-spanish-church-ruins-big-tree.jpg",
  "/images/tuasan.jpg",
  "/images/borasoda.png",
  "/images/explore-bg.jpg"
];

export default function TripPlannerView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (loading || step === 'result') {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % CAMIGUIN_IMAGES.length);
        if (loading) setQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [loading, step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step, interests]);

  const generateTrip = async () => {
    setLoading(true);
    setStep('result');

    // Fallback Mock Data
    const sortByTimeSlot = (a: { timeSlot: string }, b: { timeSlot: string }) => {
      const toMinutes = (t: string) => {
        const [, h, m, ap] = t.match(/^(\d+):(\d+)\s*(AM|PM)/i) || [];
        const hours = (parseInt(h) % 12) + (ap?.toUpperCase() === 'PM' ? 12 : 0);
        return hours * 60 + parseInt(m);
      };
      return toMinutes(a.timeSlot) - toMinutes(b.timeSlot);
    };

    const getMockItinerary = (numDays: number) => {
      const allActivities = [
        { timeSlot: "7:00 AM", activity: "Sto. Niño Cold Spring Dip", location: "Catarman", description: "Start your day with an invigorating swim in the cold spring.", whyGo: "Perfect morning ritual to wake up surrounded by lush greenery.", price: 50, category: 'Nature' },
        { timeSlot: "9:00 AM", activity: "Sunken Cemetery Expedition", location: "Catarman Coast", description: "Snorkel over the historic Sunken Cemetery and witness the iconic giant cross.", whyGo: "It's the most iconic landmark in Camiguin with hauntingly beautiful underwater views.", price: 500, category: 'Heritage' },
        { timeSlot: "11:30 AM", activity: "Tuasan Falls Refresh", location: "Mainit, Catarman", description: "Swim in the crystal clear, cold waters of one of the island's most pristine falls.", whyGo: "Less crowded than other falls, offering a serene jungle atmosphere.", price: 50, category: 'Nature' },
        { timeSlot: "12:00 PM", activity: "Lunch at a Local Eatery", location: "Poblacion, Catarman", description: "Enjoy a traditional Camiguin lunch with fresh seafood and local specialties.", whyGo: "Refuel with authentic flavors that reflect the island's culinary heritage.", price: 200, category: 'Relax' },
        { timeSlot: "2:00 PM", activity: "Old Church Ruins Walk", location: "Bonbon, Catarman", description: "Explore the coral stone walls of the 16th-century Gui-ob Church.", whyGo: "Feel the weight of history in these beautifully preserved Spanish-era ruins.", price: 0, category: 'Heritage' },
        { timeSlot: "3:30 PM", activity: "Catarman Public Market Tour", location: "Poblacion, Catarman", description: "Wander through the bustling market and sample fresh local produce.", whyGo: "The best place to experience daily island life and find unique souvenirs.", price: 200, category: 'Heritage' },
        { timeSlot: "5:00 PM", activity: "Sunset at Bura Soda Water", location: "Catarman", description: "Relax in the only soda water pool in the Philippines as the sun dips low.", whyGo: "The unique effervescent water is incredibly refreshing after a day of exploring.", price: 100, category: 'Relax' },
        { timeSlot: "7:00 PM", activity: "Night Swim at Soda Water Park", location: "Catarman", description: "Experience the unique sensation of swimming in naturally carbonated water under the stars.", whyGo: "The bubbles make you feel weightless — a truly one-of-a-kind experience.", price: 100, category: 'Relax' },
        { timeSlot: "8:00 AM", activity: "Coffee at a Local Cafe", location: "Poblacion, Catarman", description: "Enjoy freshly brewed Camiguin arabica coffee at a neighborhood cafe.", whyGo: "Camiguin's volcanic soil produces some of the best coffee in the country.", price: 120, category: 'Relax' },
        { timeSlot: "10:00 AM", activity: "Lanzones Plantation Visit", location: "Catarman Highlands", description: "Tour a local lanzones farm and learn about the island's famous fruit.", whyGo: "Taste the sweetest lanzones straight from the tree during harvest season.", price: 250, category: 'Heritage' },
        { timeSlot: "1:30 PM", activity: "Catarman Food Trip", location: "Poblacion, Catarman", description: "Sample local delicacies including pastel, dried squid, and fresh seafood.", whyGo: "Catarman's food scene is an underrated gem with bold local flavors.", price: 350, category: 'Relax' },
        { timeSlot: "4:00 PM", activity: "Bura Soda Water Park Swim", location: "Catarman", description: "Enjoy a refreshing afternoon at the unique soda water pool.", whyGo: "The naturally carbonated water is a one-of-a-kind swimming experience.", price: 100, category: 'Nature' },
      ];

      const shuffled = [...allActivities].sort(() => Math.random() - 0.5);

      return Array.from({ length: numDays }, (_, i) => ({
        day: i + 1,
        activities: shuffled.slice(i * 4, i * 4 + 3 + (i % 2)).sort(sortByTimeSlot)
      }));
    };

    if (!apiKey || apiKey === '') {
      setTimeout(() => {
        setItinerary(getMockItinerary(days));
        setLoading(false);
      }, 4000);
      return;
    }

    try {
      const prompt = `Create a ${days}-day itinerary for a ${groupType} trip to Catarman Island.
      Transportation: ${transport}.
      Pace: ${pace}.
      Special Interests: ${interests.join(', ') || 'General'}.
      Travel Style: ${style}.
      Budget: ${budget}.
      
      Return the response as a JSON array of objects, where each object represents a day and has a 'day' number and an 'activities' array. 
      Each activity MUST have:
      - 'timeSlot': (e.g., '8:30 AM')
      - 'activity': (Name of the activity)
      - 'location': (Specific spot name)
      - 'description': (Brief details)
      - 'whyGo': (A single compelling sentence explaining why this spot is a must-visit for this specific user)
      - 'price': (Estimated price in PHP as a number)
      - 'category': (One of: Heritage, Nature, Relax, Adventure)

      Ensure all times within each day are in chronological order (earliest to latest) and include realistic breaks between activities. Never output out-of-order times.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are the 'Senior Catarman Concierge' and a local expert for the municipality of Catarman, Catarman. Your goal is to create a highly detailed, realistic, and optimized travel itinerary EXCLUSIVELY for the municipality of Catarman.
          
          CRITICAL LOGIC:
          1. Strictly Catarman: Only suggest activities, spots, and experiences located within Catarman. Do not suggest spots in Mambajao, Mahinog, Sagay, or Guinsiliban.
          2. Mandatory Spots: Always try to include Sunken Cemetery, Gui-ob Church Ruins, Tuasan Falls, Bura Soda Water Park, Sto. Niño Cold Spring.
          3. Timing: Suggest 'Sunken Cemetery' for sunset views. 
          4. Local MSME Integration: Include specific local eateries.
          5. Chronological Order: Activities in each day MUST be sorted from earliest to latest by timeSlot. Never output out-of-order times.
          6. Realistic Breaks: Include a 1-hour lunch break at a local eatery (around 12:00-1:00 PM) each day. Space activities 1-2 hours apart for travel and enjoyment time.
          7. Pace-Appropriate Schedule:
             - Relaxed: start around 9:00 AM, end around 4:00 PM, 3-4 activities per day
             - Moderate: start around 8:00 AM, end around 6:00 PM, 4-5 activities per day
             - Packed: start around 6:00 AM, end around 8:00 PM, 5-6 activities per day
          8. Time Sanity Check: Verify every day's timeSlot sequence is ascending. A valid sequence looks like: 7:00 AM, 9:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM. Never repeat the same timeSlot twice.`,
          responseMimeType: "application/json",
          responseJsonSchema: {
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
                      price: { type: Type.NUMBER },
                      category: { type: Type.STRING }
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
      const data: DayPlan[] = JSON.parse(responseText);
      data.forEach(day => day.activities.sort(sortByTimeSlot));
      setItinerary(data);
    } catch (error) {
      console.error("Gemini Error:", error);
      setItinerary(getMockItinerary(days));
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
        amount: actionType === 'transport' ? 500 : activity.price,
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

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const ChatBubble = ({ role, children }: { role: 'ai' | 'user', children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-6 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`shrink-0 ${
        role === 'ai' ? '' : 'w-14 h-14 rounded-3xl flex items-center justify-center bg-white text-island-emerald border-slate-50 shadow-2xl border-4'
      }`}>
        {role === 'ai' ? <img src="/images/mascot.png" alt="" className="w-20 h-20 object-contain" /> : <UilUser size="26" />}
      </div>
      <div className={`max-w-[80%] p-8 rounded-[3rem] text-sm font-bold leading-relaxed shadow-2xl relative ${
        role === 'ai' 
          ? 'bg-white text-island-volcanic border border-slate-100 rounded-tl-none' 
          : 'bg-island-volcanic text-white rounded-tr-none'
      }`}>
        {children}
      </div>
    </motion.div>
  );

  // ── Step 1: Duration Slider ──
  const DurationSlider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
    const dots = [1, 2, 3, 4, 5];
    return (
      <div className="mt-8 md:px-14">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Length of stay</h5>
        <div className="relative pt-6 pb-16">
          <div className="absolute left-3 right-3 top-10 h-2 bg-slate-100 rounded-full" />
          <motion.div
            className="absolute left-3 top-10 h-2 bg-island-emerald rounded-full"
            animate={{ width: `${((value - 1) / 4) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
          <div className="flex justify-between relative">
            {dots.map(d => (
              <button key={d} onClick={() => onChange(d)} className="flex flex-col items-center gap-3 group">
                <motion.div
                  animate={{ scale: d === value ? 1.4 : 1 }}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${
                    d <= value ? 'bg-island-emerald border-island-emerald shadow-lg shadow-island-emerald/30' : 'bg-white border-slate-200 group-hover:border-slate-300'
                  }`}
                />
                <span className={`text-xs font-black tracking-wider transition-colors ${d <= value ? 'text-island-emerald' : 'text-slate-400'}`}>{d}</span>
              </button>
            ))}
          </div>
          <motion.div key={value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 text-center">
            <span className="text-6xl font-black text-island-volcanic tracking-tighter">{value}</span>
            <span className="block text-xs font-bold text-slate-400 tracking-widest uppercase mt-2">{value === 1 ? 'Day' : 'Days'} in Catarman</span>
          </motion.div>
        </div>
      </div>
    );
  };

  // ── Step 2: Group Avatar Cluster Cards ──
  const GroupCard = ({ option, onClick }: { option: { id: string; label: string; desc: string; count: number }; onClick: () => void }) => {
    const colors = ['bg-island-emerald', 'bg-island-ocean', 'bg-island-coral', 'bg-island-sunset'];
    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="p-6 md:p-8 rounded-[2rem] border-4 border-slate-100 bg-white hover:border-slate-200 shadow-xl text-left transition-all duration-500 group"
      >
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3 relative">
            {Array.from({ length: option.count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white ${colors[i % colors.length]} relative`}
                style={{ zIndex: option.count - i }}
              >
                {i === 0 ? <UilCompass size="20" /> : <UilUser size="18" />}
              </motion.div>
            ))}
          </div>
          <div>
            <span className="block font-black text-xs uppercase tracking-[0.2em] text-island-volcanic">{option.label}</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">{option.desc}</span>
          </div>
        </div>
      </motion.button>
    );
  };

  // ── Step 3: Transport Tiered Comparison ──
  const TransportCard = ({ option, onClick }: { option: { id: string; label: string; desc: string; speed: number; cost: number; freedom: number }; onClick: () => void }) => {
    const ratings = [
      { label: 'Speed', val: option.speed },
      { label: 'Cost Eff.', val: option.cost },
      { label: 'Freedom', val: option.freedom },
    ];
    const icon = option.id === 'No Vehicle' ? UilMapMarker : option.id === 'Self-Drive' ? UilCar : UilShieldCheck;
    return (
      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full p-5 md:p-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 shadow-lg text-left transition-all duration-300 group"
      >
        <div className="flex items-center gap-5 md:gap-8">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-island-volcanic group-hover:text-white transition-all shrink-0">
            {React.createElement(icon, { size: 24 })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="font-black text-xs uppercase tracking-[0.15em] text-island-volcanic">{option.label}</span>
              <span className="text-[10px] text-slate-400 font-bold">{option.desc}</span>
            </div>
            <div className="space-y-1.5">
              {ratings.map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 w-14 uppercase tracking-wider">{r.label}</span>
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= r.val ? 'bg-island-emerald' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  // ── Step 4: Pace Slider ──
  const PaceSelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const paces = [
      { id: 'Relaxed', icon: UilSun, label: 'Relaxed', desc: 'At our own pace' },
      { id: 'Moderate', icon: UilClock, label: 'Moderate', desc: 'A good mix' },
      { id: 'Packed', icon: UilBolt, label: 'Packed', desc: 'See it all' },
    ];
    const current = paces.findIndex(p => p.id === value);
    return (
      <div className="mt-8 md:px-14">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Trip Pace</h5>
        <div className="relative pt-8 pb-4">
          <div className="absolute left-0 right-0 top-12 h-2 bg-slate-100 rounded-full" />
          <motion.div
            className="absolute left-0 top-12 h-2 bg-island-emerald rounded-full"
            animate={{ width: `${(current / 2) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
          <div className="flex justify-between">
            {paces.map((p, i) => (
              <button key={p.id} onClick={() => onChange(p.id)} className="flex flex-col items-center gap-3 group">
                <motion.div
                  animate={{ scale: i === current ? 1.15 : 1 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    i <= current ? 'bg-island-emerald text-white shadow-lg shadow-island-emerald/30' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                  }`}
                >
                  {React.createElement(p.icon, { size: 22 })}
                </motion.div>
                <span className={`text-xs font-black tracking-wider transition-colors ${i <= current ? 'text-island-volcanic' : 'text-slate-400'}`}>{p.label}</span>
                <span className="text-[9px] font-bold text-slate-400">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Step 5: Interest Badge Cloud ──
  const InterestBadge = ({ interest, selected, onToggle }: { interest: { id: string; label: string }; selected: boolean; onToggle: () => void }) => (
    <motion.button
      layout
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className={`px-8 py-5 md:py-6 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all border-2 ${
        selected
          ? 'bg-island-volcanic text-white border-island-volcanic shadow-2xl'
          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 shadow-lg'
      }`}
    >
      <motion.span
        animate={selected ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        {selected && <UilCheckCircle size="18" className="text-island-emerald" />}
        {interest.label}
      </motion.span>
    </motion.button>
  );

  // ── Step 6: Style Vibe Cards ──
  const VibeCard = ({ option, onClick }: { option: { id: string; label: string; desc: string; gradient: string; emoji: string }; onClick: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative p-8 md:p-10 rounded-[2rem] border-4 border-transparent hover:border-white/30 shadow-2xl text-left overflow-hidden group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 text-white space-y-4">
        <span className="text-5xl block mb-4">{option.emoji}</span>
        <span className="block font-black text-lg md:text-xl uppercase tracking-tighter">{option.label}</span>
        <span className="block text-sm text-white/70 font-bold">{option.desc}</span>
      </div>
    </motion.button>
  );

  // ── Step 7: Budget Tier Cards ──
  const TierCard = ({ option, active, onClick }: { option: { id: string; label: string; tier: string; color: string; bg: string; border: string; accent: string; perks: string[] }; active: boolean; onClick: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 md:p-8 rounded-[2rem] border-4 text-left transition-all duration-500 relative overflow-hidden ${
        active
          ? `${option.border} ${option.bg} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]`
          : 'border-slate-100 bg-white hover:border-slate-200 shadow-xl'
      }`}
    >
      {active && (
        <div className={`absolute top-0 right-0 w-32 h-32 ${option.color} opacity-10 rounded-bl-full`} />
      )}
      <div className="relative z-10 space-y-4">
        <div className={`text-4xl font-black tracking-tighter ${active ? option.accent : 'text-slate-300'}`}>{option.tier}</div>
        <span className={`block font-black text-xs uppercase tracking-[0.2em] ${active ? 'text-island-volcanic' : 'text-slate-400'}`}>{option.label}</span>
        <div className="space-y-2 pt-2">
          {option.perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-3">
              <UilCheckCircle size="14" className={active ? option.accent : 'text-slate-300'} />
              <span className={`text-[10px] font-bold ${active ? 'text-slate-500' : 'text-slate-400'}`}>{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.button>
  );

  const renderChatFlow = () => {
    const steps_rendered: React.ReactNode[] = [];

    steps_rendered.push(
      <div key="q-duration" className="space-y-6">
        <ChatBubble role="ai">Mabuhay! Welcome to Catarman. How many days will you be staying?</ChatBubble>
        {step === 'duration' && (
          <DurationSlider value={days} onChange={(d) => { setDays(d); setTimeout(() => setStep('group'), 300); }} />
        )}
      </div>
    );

    if (steps.indexOf(step) >= steps.indexOf('group')) {
      steps_rendered.push(
        <div key="a-duration" className="space-y-6">
          <ChatBubble role="user">{days} days sounds great!</ChatBubble>
          <ChatBubble role="ai">Who will be joining you on this adventure?</ChatBubble>
          {step === 'group' && (
            <div className="mt-8 md:px-14 space-y-5">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Exploration Unit</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { id: 'Solo', label: 'Solo', desc: 'Traveling alone', count: 1 },
                  { id: 'Couple', label: 'Couple', desc: 'Romantic getaway', count: 2 },
                  { id: 'Family', label: 'Family', desc: 'Fun for everyone', count: 3 },
                  { id: 'Friends', label: 'Friends', desc: 'Travel with friends', count: 4 },
                ].map(g => (
                  <GroupCard key={g.id} option={g} onClick={() => { setGroupType(g.id); setStep('transport'); }} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (steps.indexOf(step) >= steps.indexOf('transport')) {
      steps_rendered.push(
        <div key="a-group" className="space-y-6">
          <ChatBubble role="user">Traveling as a {groupType.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">How would you like to get around Catarman?</ChatBubble>
          {step === 'transport' && (
            <div className="mt-8 md:px-14 space-y-5">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Mobility Method</h5>
              <div className="space-y-3">
                {[
                  { id: 'No Vehicle', label: 'Public Transport', desc: 'Tricycles & jeepneys', speed: 2, cost: 5, freedom: 2 },
                  { id: 'Self-Drive', label: 'Self-Drive', desc: 'Scooter or van rental', speed: 4, cost: 3, freedom: 5 },
                  { id: 'Private Tour', label: 'Guided Tour', desc: 'Local expert guide', speed: 3, cost: 2, freedom: 3 },
                ].map(t => (
                  <TransportCard key={t.id} option={t} onClick={() => { setTransport(t.id); setStep('pace'); }} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (steps.indexOf(step) >= steps.indexOf('pace')) {
      steps_rendered.push(
        <div key="a-transport" className="space-y-6">
          <ChatBubble role="user">Using {transport === 'No Vehicle' ? 'public transport' : transport.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">What pace do you prefer for your trip?</ChatBubble>
          {step === 'pace' && (
            <PaceSelector value={pace} onChange={(p) => { setPace(p); setTimeout(() => setStep('interests'), 300); }} />
          )}
        </div>
      );
    }

    if (steps.indexOf(step) >= steps.indexOf('interests')) {
      steps_rendered.push(
        <div key="a-pace" className="space-y-6">
          <ChatBubble role="user">Setting a {pace.toLowerCase()} pace.</ChatBubble>
          <ChatBubble role="ai">Any particular interests? Pick as many as you'd like.</ChatBubble>
          {step === 'interests' && (
            <div className="mt-8 md:px-14 space-y-8">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Interest Tags</h5>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'Photography', label: 'Photography' },
                  { id: 'Hidden Gems', label: 'Hidden Gems' },
                  { id: 'Local Food', label: 'Local Food' },
                  { id: 'Extreme Hiking', label: 'Hiking' },
                  { id: 'Beach Life', label: 'Beach Life' },
                  { id: 'Culture', label: 'Culture' },
                ].map(i => (
                  <InterestBadge key={i.id} interest={i} selected={interests.includes(i.id)} onToggle={() => toggleInterest(i.id)} />
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('style')}
                className="w-full bg-island-volcanic text-white py-6 rounded-full font-bold tracking-wider text-xs shadow-2xl flex items-center justify-center gap-3 hover:bg-island-emerald transition-all"
              >
                {interests.length > 0 ? `${interests.length} Selected — Continue` : 'Skip — Continue'} <UilArrowRight size="20" />
              </motion.button>
            </div>
          )}
        </div>
      );
    }

    if (steps.indexOf(step) >= steps.indexOf('style')) {
      steps_rendered.push(
        <div key="a-interests" className="space-y-6">
          <ChatBubble role="user">Prioritize {interests.length > 0 ? interests.join(' and ') : 'all the vibes'}.</ChatBubble>
          <ChatBubble role="ai">What kind of experience are you looking for?</ChatBubble>
          {step === 'style' && (
            <div className="mt-8 md:px-14 space-y-5">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Vibe</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { id: 'Adventure', label: 'Adventure', desc: 'Thrills & exploration', gradient: 'from-amber-500 to-orange-600', emoji: '🏔️' },
                  { id: 'Relax', label: 'Relaxation', desc: 'Rest & recharge', gradient: 'from-teal-400 to-emerald-600', emoji: '🧘' },
                  { id: 'Foodie', label: 'Foodie', desc: 'Local flavors', gradient: 'from-red-400 to-rose-600', emoji: '🍜' },
                ].map(s => (
                  <VibeCard key={s.id} option={s} onClick={() => { setStyle(s.id); setStep('budget'); }} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (steps.indexOf(step) >= steps.indexOf('budget')) {
      steps_rendered.push(
        <div key="a-style" className="space-y-6">
          <ChatBubble role="user">Going for the {style.toLowerCase()} experience.</ChatBubble>
          <ChatBubble role="ai">What's your budget range?</ChatBubble>
          {step === 'budget' && (
            <div className="mt-8 md:px-14 space-y-5">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Budget Tier</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { id: 'Budget', label: 'Budget-Friendly', tier: 'Bronze', color: 'from-amber-700 to-amber-900', bg: 'bg-amber-50', border: 'border-amber-300', accent: 'text-amber-700', perks: ['Local eateries', 'Public transpo', 'Free attractions'] },
                  { id: 'Moderate', label: 'Mid-Range', tier: 'Silver', color: 'from-slate-400 to-slate-600', bg: 'bg-slate-50', border: 'border-slate-300', accent: 'text-slate-600', perks: ['Mix of dining', 'Scooter rental', 'Paid spots'] },
                  { id: 'Luxury', label: 'Premium', tier: 'Gold', color: 'from-yellow-500 to-amber-600', bg: 'bg-amber-50', border: 'border-yellow-400', accent: 'text-amber-700', perks: ['Fine dining', 'Private guide', 'All inclusions'] },
                ].map(b => (
                  <TierCard key={b.id} option={b} active={budget === b.id} onClick={() => setBudget(b.id)} />
                ))}
              </div>
            </div>
          )}
          {step === 'budget' && (
            <div className="md:px-14 mt-8 pb-24">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateTrip}
                className="w-full bg-island-emerald text-white py-10 rounded-[4rem] font-bold tracking-wider text-sm shadow-[0_40px_80px_-20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-6"
              >
                <img src="/images/mascot.png" alt="" className="w-14 h-14 object-contain" /> Build My Itinerary
              </motion.button>
            </div>
          )}
        </div>
      );
    }

    return steps_rendered;
  };

  const steps: Step[] = ['duration', 'group', 'transport', 'pace', 'interests', 'style', 'budget', 'result'];

  return (
    <div className="flex h-screen bg-white overflow-hidden selection:bg-island-emerald/20 selection:text-island-emerald font-sans">
      
      {/* Left Panel: Chat & Itinerary */}
      <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-[600px] lg:w-[850px]'} bg-white relative z-20 shadow-[0_0_100px_-20px_rgba(0,0,0,0.1)] border-r border-slate-100`}>
        
        {!isMobile && (
        <header className="px-10 py-10 flex items-center justify-between bg-white/95 backdrop-blur-3xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(isMobile ? '/mobile' : '/')} className="w-14 h-14 bg-slate-50 hover:bg-slate-100 text-island-volcanic transition-all rounded-2xl flex items-center justify-center border-2 border-slate-100 active:scale-90">
              <UilArrowLeft size="24" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-island-volcanic tracking-tighter uppercase italic italic-no leading-none">AI Planner</h1>
              <p className="text-xs font-semibold text-slate-400 tracking-tight mt-2">AI Travel Planner</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 bg-island-volcanic px-6 py-3 rounded-full border border-white/10 shadow-xl">
            <div className="w-2 h-2 bg-island-emerald rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wider">Generating your itinerary...</span>
          </div>
        </header>
        )}

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-14 space-y-16 no-scrollbar bg-[#FAFAFA]">
          {step !== 'result' ? (
            <div className="space-y-16">
              {renderChatFlow()}
              <div ref={chatEndRef} />
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-12 px-12">
              <div className="relative">
                <div className="w-40 h-40 bg-island-volcanic text-island-emerald rounded-[4rem] flex items-center justify-center animate-pulse shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-4 border-white/10">
                  <UilDna size="80" className="animate-spin-slow" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-island-emerald rounded-3xl flex items-center justify-center text-white shadow-2xl">
                  <img src="/images/mascot.png" alt="" className="w-16 h-16 object-contain" />
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-black text-island-volcanic tracking-tighter uppercase leading-none">Synthesizing <br /> Journey Data</h2>
                <p className="text-slate-400 text-sm font-medium italic leading-relaxed">"{LOADING_QUOTES[quoteIndex]}"</p>
              </div>
              <div className="w-full max-w-sm h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 12, ease: "linear" }}
                  className="h-full bg-island-emerald shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          ) : itinerary ? (
            <div className="space-y-16 pb-40 animate-in fade-in slide-in-from-bottom-20 duration-1000">
              {/* Result Header */}
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-island-emerald tracking-wider block">Itinerary Complete</span>
                  <h2 className="text-5xl md:text-7xl font-black text-island-volcanic tracking-tighter uppercase leading-[0.85] italic">Catarman <br /> <span className="not-italic text-island-emerald">Explorer</span></h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-2 bg-island-volcanic text-white px-4 py-1.5 rounded-full border border-white/10 shadow-lg text-[10px] font-bold tracking-wider">
                      <UilCalendar size="12" className="text-island-emerald" /> {days} Days
                    </span>
                    <span className="flex items-center gap-2 bg-white text-island-volcanic px-4 py-1.5 rounded-full border border-slate-100 shadow-lg text-[10px] font-bold tracking-wider">
                      <UilUsersAlt size="12" /> {groupType}
                    </span>
                    <span className="flex items-center gap-2 bg-white text-island-volcanic px-4 py-1.5 rounded-full border border-slate-100 shadow-lg text-[10px] font-bold tracking-wider">
                      <UilMapMarker size="12" className="text-island-emerald" /> {itinerary.reduce((s, d) => s + d.activities.length, 0)} activities
                    </span>
                  </div>
                </div>
                <button onClick={() => setStep('duration')} className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-island-volcanic hover:bg-island-volcanic hover:text-white transition-all shadow-lg active:scale-90 shrink-0">
                  <UilRefresh size="22" />
                </button>
              </div>

              {/* Trip Summary Bar */}
              {(() => {
                const totalActivities = itinerary.reduce((s, d) => s + d.activities.length, 0);
                const totalCost = itinerary.reduce((s, d) => s + d.activities.reduce((a, act) => a + (act.price || 0), 0), 0);
                const categories = [...new Set(itinerary.flatMap(d => d.activities.map(a => a.category || 'Experience')))];
                return (
                  <div className="flex flex-wrap gap-3 p-5 bg-white rounded-2xl border border-slate-50 shadow-lg">
                    {[
                      { label: 'Total Cost', value: `₱${totalCost}`, icon: UilWallet },
                      { label: 'Activities', value: totalActivities, icon: UilTicket },
                      { label: 'Categories', value: categories.length, icon: UilStar },
                    ].map(stat => (
                      <div key={stat.label} className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                        <stat.icon size="16" className="text-island-emerald" />
                        <div>
                          <span className="text-sm font-black text-island-volcanic">{stat.value}</span>
                          <span className="text-[9px] font-bold text-slate-400 ml-1.5 uppercase tracking-wider">{stat.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Itinerary Timeline */}
              <div className="space-y-12 relative">
                {itinerary.map((day, idx) => {
                  const dayCost = day.activities.reduce((s, a) => s + (a.price || 0), 0);
                  const categoryColor = (cat: string) => {
                    const colors: Record<string, string> = { Heritage: 'bg-amber-500', Nature: 'bg-emerald-500', Relax: 'bg-blue-500', Adventure: 'bg-orange-500' };
                    return colors[cat] || 'bg-slate-400';
                  };
                  return (
                  <div key={day.day} className="relative">
                    {/* Day Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-island-volcanic text-white flex items-center justify-center text-xl md:text-2xl font-black shadow-xl border-4 border-white shrink-0">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-black text-island-volcanic uppercase tracking-tighter leading-none">Day {day.day}</h3>
                        <p className="text-[10px] font-semibold text-slate-400 tracking-tight mt-1">{idx === 0 ? 'Discovery' : idx === 1 ? 'Immersion' : 'Integration'} · ₱{dayCost} total</p>
                      </div>
                    </div>

                    {/* Activity Cards */}
                    <div className="space-y-4">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className="relative flex gap-4 md:gap-6 group">
                          {/* Timeline line + node */}
                          <div className="flex flex-col items-center shrink-0 pt-1">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-island-volcanic border-2 border-white shadow-md group-hover:bg-island-emerald transition-colors z-10" />
                            {aIdx < day.activities.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-1" />}
                          </div>

                          {/* Card */}
                          <div className="flex-1 bg-white rounded-2xl border border-slate-50 shadow-lg p-4 md:p-6 hover:shadow-xl transition-all min-w-0">
                            {/* Top row: time + category + price */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-sm md:text-base font-black text-island-volcanic tracking-tighter">{act.timeSlot}</span>
                              <span className="h-3 w-px bg-slate-100" />
                              <span className={`text-[9px] font-bold text-white tracking-wider px-2 py-0.5 rounded-full ${categoryColor(act.category || '')}`}>
                                {act.category || 'Experience'}
                              </span>
                              <span className="ml-auto text-sm font-black text-island-emerald tracking-tighter">₱{act.price}</span>
                            </div>

                            {/* Activity name + location */}
                            <h4 className="text-xl md:text-2xl font-black text-island-volcanic tracking-tighter uppercase leading-tight mb-1">{act.activity}</h4>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-3">
                              <UilMapPin size="12" />
                              <span className="text-[11px] font-semibold">{act.location}</span>
                            </div>

                            {/* Description */}
                            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mb-3">{act.description}</p>

                            {/* Why this works — compact */}
                            <div className="flex items-start gap-2 p-3 bg-island-volcanic/5 rounded-xl mb-3">
                              <UilBolt size="14" className="text-island-emerald shrink-0 mt-0.5" />
                              <p className="text-[11px] font-bold italic text-slate-500 leading-snug">"{act.whyGo}"</p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAction(act, day.day, 'pass')}
                                disabled={bookingStatus[`${day.day}-${act.activity}-pass`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'}
                                className={`flex-1 py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[9px] flex items-center justify-center gap-2 transition-all shadow-md ${
                                  bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'
                                    ? 'bg-island-emerald text-white'
                                    : 'bg-island-volcanic text-white hover:bg-island-emerald'
                                }`}
                              >
                                {bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' ? <><UilCheckCircle size="16" /> Saved</> : <><UilTicket size="16" /> Save to Pass</>}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAction(act, day.day, 'transport')}
                                disabled={bookingStatus[`${day.day}-${act.activity}-transport`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-transport`] === 'success'}
                                className="px-4 py-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:border-island-volcanic transition-all shadow-md"
                              >
                                {bookingStatus[`${day.day}-${act.activity}-transport`] === 'success' ? <UilCheckCircle size="16" className="text-island-emerald" /> : <UilCar size="18" />}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}

                {/* Final CTA */}
                <div className="pt-6">
                  {(() => {
                    const grandTotal = itinerary.reduce((s, d) => s + d.activities.reduce((a, act) => a + (act.price || 0), 0), 0);
                    return (
                    <div className="bg-island-emerald p-8 md:p-12 rounded-[2.5rem] text-white shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
                      <div className="relative z-10 text-center space-y-4">
                        <UilShieldCheck size="48" className="mx-auto text-white/30" />
                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Review & Confirm</h3>
                        <p className="text-white/70 font-medium text-xs max-w-sm mx-auto">
                          {itinerary.length} days · {itinerary.reduce((s, d) => s + d.activities.length, 0)} activities · ₱{grandTotal} total
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-island-emerald px-8 md:px-12 py-4 md:py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] md:text-xs shadow-2xl hover:bg-island-volcanic hover:text-white transition-all"
                        >
                          Confirm All
                        </motion.button>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Panel: Immersive Visuals */}
      <div className={`flex-1 relative bg-island-volcanic overflow-hidden ${isMobile ? 'hidden' : 'block'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
            transition={{ duration: 4, ease: [0.2, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={CAMIGUIN_IMAGES[currentImageIndex]} 
              alt="Catarman" 
              className="w-full h-full object-cover opacity-50 contrast-125 saturate-[0.6]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-island-volcanic via-transparent to-island-volcanic/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

        {/* Floating Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-24 text-white">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="max-w-4xl space-y-12"
          >
            <div className="w-1.5 h-32 bg-island-emerald/40 rounded-full" />
            <div className="space-y-8">
              <h2 className="text-[10rem] font-black leading-[0.75] tracking-tighter uppercase italic drop-shadow-3xl">Bespoke <br /><span className="text-island-emerald not-italic">Catarman.</span></h2>
              <p className="text-3xl text-emerald-50/60 font-medium leading-relaxed max-w-2xl">Your journey is being computed against local heritage vectors and real-time municipality data.</p>
            </div>
          </motion.div>
        </div>

        {/* Minimal Actions */}
        <div className="absolute top-16 right-16 flex items-center gap-6 z-50">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'white', color: '#0a0a0a' }}
            onClick={() => navigate('/')}
            className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white shadow-3xl transition-all"
          >
            <UilTimes size="32" />
          </motion.button>
        </div>

        {/* Progress Timeline */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 px-10">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div 
              key={i} 
              animate={{ 
                height: i === currentImageIndex ? 64 : 16,
                backgroundColor: i === currentImageIndex ? '#10b981' : 'rgba(255,255,255,0.2)',
                width: i === currentImageIndex ? 6 : 4
              }}
              className="rounded-full shadow-2xl" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, count, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-8 bg-white rounded-[3rem] border-2 border-emerald-50 flex items-center justify-between group hover:bg-emerald-50/30 hover:border-island-emerald/20 transition-all shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-emerald-50/50 text-island-green rounded-2xl flex items-center justify-center group-hover:emerald-gradient group-hover:text-white transition-all duration-500 border border-emerald-100">
          <Icon size="26" />
        </div>
        <span className="text-lg font-black text-island-green tracking-tighter">{label}</span>
      </div>
      {count ? (
        <span className="px-4 py-1.5 bg-island-emerald text-white rounded-full text-[10px] font-black shadow-xl">{count}</span>
      ) : (
        <UilAngleRightB size="22" className="text-emerald-100 group-hover:text-island-emerald group-hover:translate-x-1 transition-all" />
      )}
    </button>
  );
}

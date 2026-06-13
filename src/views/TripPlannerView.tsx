import React, { useState, useEffect, useRef } from 'react';
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
  Ticket,
  Send,
  User as UserIcon,
  X,
  CreditCard
} from 'lucide-react';
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
  "https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg",
  "https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg",
  "https://thefroggyadventures.com/wp-content/uploads/2024/10/tuasan-falls-camiguin.jpg",
  "https://www.lanzonescabana.com/custom/domain_4/image_files/sitemgr_photo_21.png",
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

    // Fallback Mock Data in case of missing API key or failure
    const getMockItinerary = (numDays: number) => {
      const activities = [
        { timeSlot: "8:00 AM - 10:00 AM", activity: "Sunken Cemetery Expedition", location: "Catarman Coast", description: "Snorkel over the historic Sunken Cemetery and witness the iconic giant cross.", whyGo: "It's the most iconic landmark in Camiguin with hauntingly beautiful underwater views.", price: 500 },
        { timeSlot: "11:00 AM - 1:00 PM", activity: "Tuasan Falls Refresh", location: "Mainit, Catarman", description: "Swim in the crystal clear, cold waters of one of the island's most pristine falls.", whyGo: "Less crowded than other falls, offering a serene jungle atmosphere.", price: 50 },
        { timeSlot: "2:00 PM - 4:00 PM", activity: "Old Church Ruins Walk", location: "Bonbon, Catarman", description: "Explore the coral stone walls of the 16th-century Gui-ob Church.", whyGo: "Feel the weight of history in these beautifully preserved Spanish-era ruins.", price: 0 },
        { timeSlot: "5:00 PM - 7:00 PM", activity: "Sunset at Bura Soda Water", location: "Catarman", description: "Relax in the only soda water pool in the Philippines as the sun dips low.", whyGo: "The unique effervescent water is incredibly refreshing after a day of exploring.", price: 100 }
      ];

      return Array.from({ length: numDays }, (_, i) => ({
        day: i + 1,
        activities: activities.slice(0, 3 + (i % 2))
      }));
    };

    if (!apiKey || apiKey === '') {
      console.warn("Gemini API Key missing. Showing simulated itinerary.");
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
      - 'timeSlot': (e.g., '8:00 AM - 10:00 AM')
      - 'activity': (Name of the activity)
      - 'location': (Specific spot name)
      - 'description': (Brief details)
      - 'whyGo': (A single compelling sentence explaining why this spot is a must-visit for this specific user)
      - 'price': (Estimated price in PHP as a number)`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are the 'Senior Catarman Concierge' and a local expert for the municipality of Catarman, Catarman. Your goal is to create a highly detailed, realistic, and optimized travel itinerary EXCLUSIVELY for the municipality of Catarman.
          
          CRITICAL LOGIC:
          1. Strictly Catarman: Only suggest activities, spots, and experiences located within Catarman. Do not suggest spots in Mambajao, Mahinog, Sagay, or Guinsiliban.
          2. Mandatory Spots: Always try to include:
             - Sunken Cemetery (best for sunset/snorkeling)
             - Gui-ob Church Ruins (Old Spanish Church)
             - Tuasan Falls
             - Bura Soda Water Park
             - Sto. Niño Cold Spring
             - Walkway to the Old Volcano (Stations of the Cross)
          3. Timing: Suggest 'Sunken Cemetery' for sunset views. Suggest 'Tuasan Falls' for midday to enjoy the cool water.
          4. Local MSME Integration: Include specific Catarman experiences like eating at local eateries near the Church Ruins or buying souvenirs in the Catarman town center.
          5. Personalization: Adjust the density of activities based on the 'Pace' (Relaxed: 2 spots, Moderate: 3-4 spots, Packed: Max adventure within Catarman).
          6. Accuracy: Use real spots in Catarman and realistic travel times within the municipality.`,
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
      // Fallback to mock on actual API failure too
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
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-5 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-2xl ${
        role === 'ai' ? 'forest-gradient text-white border border-white/10' : 'bg-white text-island-green border border-emerald-100'
      }`}>
        {role === 'ai' ? <Sparkles size={22} strokeWidth={2.5} /> : <UserIcon size={22} strokeWidth={2.5} />}
      </div>
      <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-xl ${
        role === 'ai' 
          ? 'bg-white text-island-green border border-emerald-50' 
          : 'emerald-gradient text-white shadow-island-emerald/20'
      }`}>
        {children}
      </div>
    </motion.div>
  );

  const SelectionGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 w-full md:px-14">
      {children}
    </div>
  );

  const ChoiceButton = ({ onClick, active, label, icon: Icon, description }: any) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-4 ${
        active 
          ? 'border-island-emerald bg-emerald-50 shadow-xl' 
          : 'border-emerald-100 bg-white hover:border-island-emerald/40 hover:bg-emerald-50/50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
          active ? 'emerald-gradient text-white shadow-lg' : 'bg-emerald-50 text-island-green'
        }`}>
          {Icon && <Icon size={28} strokeWidth={3} />}
        </div>
        <div>
          <span className={`block font-black text-xs uppercase tracking-widest ${active ? 'text-island-emerald' : 'text-island-green'}`}>{label}</span>
          {description && <p className="text-[10px] text-island-green/60 font-bold uppercase tracking-wider mt-1">{description}</p>}
        </div>
      </div>
    </motion.button>
  );

  const renderChatFlow = () => {
    const steps_rendered = [];

    // Duration Step
    steps_rendered.push(
      <div key="q-duration" className="space-y-4">
        <ChatBubble role="ai">Welcome to Catarman. I'm your AI travel concierge. To begin crafting your journey, how many days will you be staying with us?</ChatBubble>
        {step === 'duration' && (
          <SelectionGrid>
            {[1, 2, 3, 4, 5].map(d => (
              <ChoiceButton 
                key={d} 
                onClick={() => { setDays(d); setStep('group'); }} 
                label={`${d} ${d === 1 ? 'Day' : 'Days'}`}
                icon={Calendar}
              />
            ))}
          </SelectionGrid>
        )}
      </div>
    );

    // Group Step
    if (steps.indexOf(step) >= steps.indexOf('group')) {
      steps_rendered.push(
        <div key="a-duration" className="space-y-4">
          <ChatBubble role="user">{days} days in Catarman sounds perfect.</ChatBubble>
          <ChatBubble role="ai">Splendid. And who will be joining you on this Catarman adventure?</ChatBubble>
          {step === 'group' && (
            <SelectionGrid>
              {[
                { id: 'Solo', icon: Compass, label: 'Solo Traveler', desc: 'Personal Discovery' },
                { id: 'Couple', icon: Heart, label: 'Couple', desc: 'Romantic Heritage' },
                { id: 'Family', icon: Users, label: 'Family', desc: 'Safe & Educational' },
                { id: 'Friends', icon: Users, label: 'Friends', desc: 'Shared Adventure' }
              ].map(g => (
                <ChoiceButton 
                  key={g.id} 
                  onClick={() => { setGroupType(g.id); setStep('transport'); }} 
                  label={g.label} 
                  icon={g.icon} 
                  description={g.desc}
                />
              ))}
            </SelectionGrid>
          )}
        </div>
      );
    }

    // Transport Step
    if (steps.indexOf(step) >= steps.indexOf('transport')) {
      steps_rendered.push(
        <div key="a-group" className="space-y-4">
          <ChatBubble role="user">I'm traveling {groupType.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">Excellent choice for Catarman's terrain. How do you intend to navigate the municipality?</ChatBubble>
          {step === 'transport' && (
            <SelectionGrid>
              {[
                { id: 'No Vehicle', icon: MapPin, label: 'Public Loop', desc: 'Local Tricycles' },
                { id: 'Self-Drive', icon: Car, label: 'Self-Drive', desc: 'Motorbike Rental' },
                { id: 'Private Tour', icon: ShieldCheck, label: 'VIP Tour', desc: 'Guided Experience' }
              ].map(t => (
                <ChoiceButton 
                  key={t.id} 
                  onClick={() => { setTransport(t.id); setStep('pace'); }} 
                  label={t.label} 
                  icon={t.icon} 
                  description={t.desc}
                />
              ))}
            </SelectionGrid>
          )}
        </div>
      );
    }

    // Pace Step
    if (steps.indexOf(step) >= steps.indexOf('pace')) {
      steps_rendered.push(
        <div key="a-transport" className="space-y-4">
          <ChatBubble role="user">I'll use {transport.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">Understood. What is the preferred rhythm of your exploration?</ChatBubble>
          {step === 'pace' && (
            <SelectionGrid>
              {[
                { id: 'Relaxed', icon: Sun, label: 'Unchecked', desc: 'Leisurely Pace' },
                { id: 'Moderate', icon: Clock, label: 'Balanced', desc: 'The Gold Standard' },
                { id: 'Packed', icon: Zap, label: 'Intensive', desc: 'Full Immersion' }
              ].map(p => (
                <ChoiceButton 
                  key={p.id} 
                  onClick={() => { setPace(p.id); setStep('interests'); }} 
                  label={p.label} 
                  icon={p.icon} 
                  description={p.desc}
                />
              ))}
            </SelectionGrid>
          )}
        </div>
      );
    }

    // Interests Step
    if (steps.indexOf(step) >= steps.indexOf('interests')) {
      steps_rendered.push(
        <div key="a-pace" className="space-y-4">
          <ChatBubble role="user">Let's keep it {pace.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">Perfect. Are there specific Catarman landmarks or interests I should prioritize?</ChatBubble>
          {step === 'interests' && (
            <div className="space-y-6 md:px-14">
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { id: 'Photography', icon: Camera, label: 'Visuals' },
                  { id: 'Hidden Gems', icon: Gem, label: 'Heritage' },
                  { id: 'Local Food', icon: Utensils, label: 'Cuisine' },
                  { id: 'Extreme Hiking', icon: Mountain, label: 'Nature' }
                ].map(i => (
                  <ChoiceButton 
                    key={i.id} 
                    onClick={() => toggleInterest(i.id)} 
                    active={interests.includes(i.id)} 
                    label={i.label} 
                    icon={i.icon}
                  />
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('style')}
                className="btn-volcanic w-full py-6 rounded-[2rem] text-sm shadow-emerald-900/20"
              >
                Continue Exploration <ArrowRight size={20} strokeWidth={3} />
              </motion.button>
            </div>
          )}
        </div>
      );
    }

    // Style Step
    if (steps.indexOf(step) >= steps.indexOf('style')) {
      steps_rendered.push(
        <div key="a-interests" className="space-y-4">
          <ChatBubble role="user">{interests.length > 0 ? `I'm interested in ${interests.join(' and ')}.` : "Show me the heart of Catarman."}</ChatBubble>
          <ChatBubble role="ai">Noted. What is the overarching aesthetic of your Catarman stay?</ChatBubble>
          {step === 'style' && (
            <SelectionGrid>
              {[
                { id: 'Adventure', icon: Mountain, label: 'Exploration', desc: 'Deep Discovery' },
                { id: 'Relax', icon: Sun, label: 'Serenity', desc: 'Slow Living' },
                { id: 'Foodie', icon: Coffee, label: 'Authentic', desc: 'Local Flavor' }
              ].map(s => (
                <ChoiceButton 
                  key={s.id} 
                  onClick={() => { setStyle(s.id); setStep('budget'); }} 
                  label={s.label} 
                  icon={s.icon} 
                  description={s.desc}
                />
              ))}
            </SelectionGrid>
          )}
        </div>
      );
    }

    // Budget Step
    if (steps.indexOf(step) >= steps.indexOf('budget')) {
      steps_rendered.push(
        <div key="a-style" className="space-y-4">
          <ChatBubble role="user">I'm looking for {style.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">Final requirement. How would you like to allocate your Catarman resources?</ChatBubble>
          {step === 'budget' && (
            <SelectionGrid>
              {[
                { id: 'Budget', icon: Coins, label: 'Essential', desc: 'Smart Value' },
                { id: 'Moderate', icon: Wallet, label: 'Premium', desc: 'Elevated Comfort' },
                { id: 'Luxury', icon: Gem, label: 'Elite', desc: 'Bespoke Luxury' }
              ].map(b => (
                <ChoiceButton 
                  key={b.id} 
                  onClick={() => setBudget(b.id)} 
                  active={budget === b.id} 
                  label={b.label} 
                  icon={b.icon} 
                  description={b.desc}
                />
              ))}
            </SelectionGrid>
          )}
          {step === 'budget' && (
            <div className="md:px-14 mt-10">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateTrip}
                className="btn-primary w-full py-7 rounded-[2.5rem] text-base"
              >
                <Sparkles size={24} strokeWidth={3} /> Build Smart Manifest
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
    <div className="flex h-screen bg-island-cream overflow-hidden selection:bg-island-emerald/20 selection:text-island-emerald">
      {/* Left Panel: Chat/Flow/Itinerary */}
      <div className={`flex flex-col ${isMobile && step === 'result' && !itinerary ? 'w-full' : isMobile ? 'w-full' : 'w-[550px] lg:w-[720px]'} border-r border-emerald-100 bg-white relative z-20 shadow-2xl`}>
        {/* Chat Header */}
        <header className="px-10 py-8 border-b border-emerald-100 flex items-center justify-between bg-white/95 backdrop-blur-3xl sticky top-0 z-30">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(isMobile ? '/mobile' : '/')} className="p-3 text-island-green bg-emerald-50 hover:bg-emerald-100 transition-all rounded-2xl shadow-sm active:scale-90">
              <ArrowLeft size={22} strokeWidth={3.5} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-island-green tracking-tighter leading-none">Trip Planner</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-emerald-50 px-5 py-2.5 rounded-[1.5rem] border border-emerald-100">
            <span className="text-[10px] font-black text-island-emerald uppercase tracking-widest">Active Session</span>
          </div>
        </header>

        {/* Scrollable Chat/Result Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar bg-island-cream/30 [background-image:radial-gradient(#d1fae5_1px,transparent_1px)] [background-size:32px_32px]">
          {step !== 'result' ? (
            <div className="space-y-12 pb-24">
              {renderChatFlow()}
              <div ref={chatEndRef} />
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 px-12">
              <div className="relative">
                <div className="w-28 h-24 forest-gradient text-white rounded-[3rem] flex items-center justify-center animate-bounce shadow-2xl">
                  <Sparkles size={56} strokeWidth={2.5} />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-island-emerald/40 rounded-[3rem]"
                />
              </div>
              <div>
                <h2 className="text-4xl font-black text-island-green tracking-tighter mb-5">Engineering your manifest...</h2>
                <p className="text-island-green/60 text-sm font-black uppercase tracking-widest italic leading-relaxed">"{LOADING_QUOTES[quoteIndex]}"</p>
              </div>
              <div className="w-full max-w-sm h-2.5 bg-emerald-50 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full emerald-gradient shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                />
              </div>
            </div>
          ) : itinerary ? (
            <div className="space-y-12 pb-40 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-island-green tracking-tighter">Your Catarman Trip</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-island-green px-4 py-1.5 rounded-full">{days} Days</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-island-green px-4 py-1.5 rounded-full">{groupType}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-island-emerald px-4 py-1.5 rounded-full shadow-lg shadow-island-emerald/20">{budget}</span>
                  </div>
                </div>
                <button onClick={() => setStep('duration')} className="p-4 text-island-green bg-emerald-50 hover:bg-emerald-100 rounded-[1.5rem] transition-all border-2 border-emerald-100 shadow-md active:scale-90">
                  <RefreshCw size={24} strokeWidth={3} />
                </button>
              </div>

              {itinerary.map((day, idx) => (
                <div key={day.day} className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl forest-gradient text-white flex items-center justify-center text-xl font-black shadow-2xl border border-white/10">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-black text-island-green uppercase tracking-[0.3em] text-xs">Phase {day.day} Timeline</h3>
                      <span className="text-[10px] text-island-green/40 font-black uppercase tracking-widest italic">Catarman Pilot Explorer</span>
                    </div>
                  </div>
                  
                  <div className="space-y-12 border-l-4 border-emerald-100 ml-7 pl-12 py-6 relative">
                    {day.activities.map((act, aIdx) => (
                      <div key={aIdx} className="relative group">
                        <div className="absolute -left-[54px] top-2.5 w-4 h-4 rounded-full bg-white border-[5px] border-island-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 group-hover:scale-125 transition-transform" />
                        
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.25em] bg-island-emerald/10 px-4 py-2 rounded-full border-2 border-island-emerald/10">
                              {act.timeSlot}
                            </span>
                            <span className="text-[10px] font-black text-island-green/40 uppercase tracking-[0.25em]">Est. ₱{act.price}</span>
                          </div>
                        </div>
                        
                        <h4 className="text-3xl font-black text-island-green mb-3 tracking-tighter group-hover:text-island-emerald transition-colors">{act.activity}</h4>
                        <div className="flex items-center gap-2.5 mb-8">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-island-emerald shadow-sm">
                            <MapPin size={14} strokeWidth={4} />
                          </div>
                          <p className="text-[10px] text-island-green/40 font-black uppercase tracking-[0.2em] italic">{act.location}</p>
                        </div>
                        
                        <div className="p-10 bg-white rounded-[3rem] border-2 border-emerald-50 shadow-2xl mb-8 transition-all hover:scale-[1.02] hover:border-island-emerald/30 group-hover:shadow-3xl">
                          <p className="text-base text-island-green/70 font-medium leading-relaxed mb-10">{act.description}</p>
                          
                          <div className="flex items-center gap-5 p-6 bg-island-emerald/[0.05] rounded-[2rem] border-2 border-island-emerald/10 mb-10">
                            <div className="w-12 h-12 rounded-2xl emerald-gradient text-white flex items-center justify-center shrink-0 shadow-lg">
                              <Sparkles size={22} strokeWidth={3} />
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-island-emerald uppercase tracking-[0.3em] block mb-1">Catarman Intelligence</span>
                              <p className="text-xs text-island-green font-black italic leading-snug">"{act.whyGo}"</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-5">
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(act, day.day, 'pass')}
                              disabled={bookingStatus[`${day.day}-${act.activity}-pass`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'}
                              className={`btn-primary flex-1 h-16 rounded-[1.75rem] ${
                                bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' 
                                  ? 'bg-green-700 shadow-none border border-green-800' 
                                  : ''
                              }`}
                            >
                              {bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' ? <><CheckCircle2 size={22} strokeWidth={3} /> Manifested</> : <><Ticket size={22} strokeWidth={3} /> Add to Pass</>}
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(act, day.day, 'transport')}
                              disabled={bookingStatus[`${day.day}-${act.activity}-transport`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-transport`] === 'success'}
                              className="w-20 h-16 rounded-[1.75rem] bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-island-green/40 hover:text-island-emerald hover:border-island-emerald/30 transition-all shadow-md active:bg-emerald-100"
                            >
                              {bookingStatus[`${day.day}-${act.activity}-transport`] === 'success' ? <CheckCircle2 size={28} className="text-island-emerald" strokeWidth={4} /> : <Car size={28} strokeWidth={3} />}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Weather Intelligence */}
              <div className="p-10 bg-emerald-50 rounded-[3.5rem] border-2 border-emerald-100 flex gap-8 items-center shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-island-emerald text-white flex items-center justify-center shrink-0 shadow-lg border-2 border-emerald-200">
                  <CloudRain size={32} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-black text-island-green uppercase tracking-[0.2em] text-[10px] mb-2 block">Catarman Climate Node</h4>
                  <p className="text-island-green/80 text-base font-black leading-relaxed italic">"Maintain waterproof containment for island transitions. The microclimate remains beautifully unpredictable."</p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-16 pb-24 space-y-5">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-volcanic w-full py-8 rounded-[2.5rem] text-sm shadow-emerald-900/40"
                >
                  <CreditCard size={24} strokeWidth={3} /> Finalize & Verify All Nodes
                </motion.button>
                <button className="btn-secondary w-full py-8 rounded-[2.5rem] text-xs">
                  Export Journey Manifest
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Input Bar Placeholder */}
        {step !== 'result' && (
          <div className="p-10 bg-white border-t border-emerald-100 sticky bottom-0 z-40 shadow-[0_-10px_40px_-10px_rgba(6,78,59,0.05)]">
            <div className="bg-emerald-50 rounded-[2.5rem] p-6 flex items-center gap-5 border-2 border-emerald-100 shadow-inner">
              <div className="w-12 h-12 rounded-2xl emerald-gradient text-white flex items-center justify-center shadow-lg">
                <Sparkles size={24} strokeWidth={3} />
              </div>
              <input 
                disabled 
                placeholder="Securely awaiting manifest nodes..." 
                className="bg-transparent border-none flex-1 text-xs font-black uppercase tracking-[0.3em] text-emerald-900/30 focus:outline-none"
              />
              <button disabled className="w-12 h-12 rounded-2xl bg-emerald-100 text-white flex items-center justify-center shadow-md">
                <Send size={22} strokeWidth={3.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Immersive Visuals */}
      <div className={`flex-1 relative bg-island-volcanic overflow-hidden ${isMobile ? 'hidden' : 'block'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 3, ease: [0.2, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={CAMIGUIN_IMAGES[currentImageIndex]} 
              alt="Catarman" 
              className="w-full h-full object-cover opacity-60 contrast-125 saturate-[0.8]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-island-volcanic via-island-volcanic/20 to-island-volcanic/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,44,34,0.5)_100%)]" />

        {/* Floating Media Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-24 text-white">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="max-w-3xl space-y-12"
          >
            <div className="flex items-center gap-5 bg-white/10 backdrop-blur-3xl px-8 py-4 rounded-full border-2 border-white/20 w-fit shadow-2xl">
              <MapIcon size={22} className="text-island-emerald" strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Node: 9.2014° N, 124.6675° E</span>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-8xl lg:text-9xl font-bold leading-[0.8] tracking-tighter">Bespoke <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-emerald-100">Catarman.</span></h2>
              <p className="text-3xl text-emerald-100/70 font-semibold leading-relaxed max-w-xl">Advanced neural concierge meets volcanic heritage. Welcome to the pilot experience.</p>
            </div>
            
            <div className="flex items-center gap-16 pt-12 border-t-2 border-white/10">
              <div className="space-y-3">
                <span className="block text-5xl font-serif italic text-island-emerald font-light">Heritage</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Ancestral Core</span>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="space-y-3">
                <span className="block text-5xl font-serif italic text-island-emerald font-light">Lush</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Island Energy</span>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="space-y-3">
                <span className="block text-5xl font-serif italic text-island-emerald font-light">Infinite</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Digital Node</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Minimal Nav for Right Side */}
        <div className="absolute top-16 right-16 flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
            className="w-16 h-16 rounded-[1.75rem] bg-white/10 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white shadow-3xl transition-all"
          >
            <Heart size={28} strokeWidth={3} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
            onClick={() => navigate('/')}
            className="w-16 h-16 rounded-[1.75rem] bg-white/10 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white shadow-3xl transition-all"
          >
            <X size={28} strokeWidth={3} />
          </motion.button>
        </div>
        
        {/* Progress Nodes */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-5 px-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-1.5 h-10 rounded-full transition-all duration-1000 ${i === currentImageIndex ? 'bg-island-emerald h-24 shadow-[0_0_20px_rgba(16,185,129,1)]' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

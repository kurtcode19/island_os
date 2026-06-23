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
  CreditCard,
  ArrowUpRight,
  ZapOff,
  Dna
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
    const getMockItinerary = (numDays: number) => {
      const allActivities = [
        { timeSlot: "8:00 AM", activity: "Sunken Cemetery Expedition", location: "Catarman Coast", description: "Snorkel over the historic Sunken Cemetery and witness the iconic giant cross.", whyGo: "It's the most iconic landmark in Camiguin with hauntingly beautiful underwater views.", price: 500, category: 'Heritage' },
        { timeSlot: "11:30 AM", activity: "Tuasan Falls Refresh", location: "Mainit, Catarman", description: "Swim in the crystal clear, cold waters of one of the island's most pristine falls.", whyGo: "Less crowded than other falls, offering a serene jungle atmosphere.", price: 50, category: 'Nature' },
        { timeSlot: "2:30 PM", activity: "Old Church Ruins Walk", location: "Bonbon, Catarman", description: "Explore the coral stone walls of the 16th-century Gui-ob Church.", whyGo: "Feel the weight of history in these beautifully preserved Spanish-era ruins.", price: 0, category: 'Heritage' },
        { timeSlot: "5:30 PM", activity: "Sunset at Bura Soda Water", location: "Catarman", description: "Relax in the only soda water pool in the Philippines as the sun dips low.", whyGo: "The unique effervescent water is incredibly refreshing after a day of exploring.", price: 100, category: 'Relax' },
        { timeSlot: "7:00 AM", activity: "Sto. Niño Cold Spring Dip", location: "Catarman", description: "Start your day with an invigorating swim in the cold spring.", whyGo: "Perfect morning ritual to wake up surrounded by lush greenery.", price: 50, category: 'Nature' },
        { timeSlot: "10:00 AM", activity: "Catarman Public Market Tour", location: "Poblacion, Catarman", description: "Wander through the bustling market and sample fresh local produce.", whyGo: "The best place to experience daily island life and find unique souvenirs.", price: 200, category: 'Heritage' },
        { timeSlot: "1:00 PM", activity: "Mantigue Island Snorkeling", location: "Mahinog Coast", description: "Hop on a boat to this pristine sandbar with crystal clear waters.", whyGo: "The marine sanctuary teems with colorful fish and vibrant corals.", price: 800, category: 'Adventure' },
        { timeSlot: "4:00 PM", activity: "Catarman Food Trip", location: "Poblacion, Catarman", description: "Sample local delicacies including pastel, dried squid, and fresh seafood.", whyGo: "Catarman's food scene is an underrated gem with bold local flavors.", price: 350, category: 'Relax' },
        { timeSlot: "6:00 AM", activity: "Sunrise at Katibawasan Falls", location: "Mambajao, Catarman", description: "Witness the morning light filtering through the towering cliff faces.", whyGo: "Early morning means fewer crowds and a magical mist over the water.", price: 50, category: 'Nature' },
        { timeSlot: "9:30 AM", activity: "Coffee at a Local Cafe", location: "Poblacion, Catarman", description: "Enjoy freshly brewed Camiguin arabica coffee at a neighborhood cafe.", whyGo: "Camiguin's volcanic soil produces some of the best coffee in the country.", price: 120, category: 'Relax' },
        { timeSlot: "3:00 PM", activity: "Lanzones Plantation Visit", location: "Catarman Highlands", description: "Tour a local lanzones farm and learn about the island's famous fruit.", whyGo: "Taste the sweetest lanzones straight from the tree during harvest season.", price: 250, category: 'Heritage' },
        { timeSlot: "7:00 PM", activity: "Night Swim at Soda Water Park", location: "Catarman", description: "Experience the unique sensation of swimming in naturally carbonated water under the stars.", whyGo: "The bubbles make you feel weightless — a truly one-of-a-kind experience.", price: 100, category: 'Relax' },
      ];

      const shuffled = [...allActivities].sort(() => Math.random() - 0.5);

      return Array.from({ length: numDays }, (_, i) => ({
        day: i + 1,
        activities: shuffled.slice(i * 4, i * 4 + 3 + (i % 2))
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
      - 'category': (One of: Heritage, Nature, Relax, Adventure)`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are the 'Senior Catarman Concierge' and a local expert for the municipality of Catarman, Catarman. Your goal is to create a highly detailed, realistic, and optimized travel itinerary EXCLUSIVELY for the municipality of Catarman.
          
          CRITICAL LOGIC:
          1. Strictly Catarman: Only suggest activities, spots, and experiences located within Catarman. Do not suggest spots in Mambajao, Mahinog, Sagay, or Guinsiliban.
          2. Mandatory Spots: Always try to include Sunken Cemetery, Gui-ob Church Ruins, Tuasan Falls, Bura Soda Water Park, Sto. Niño Cold Spring.
          3. Timing: Suggest 'Sunken Cemetery' for sunset views. 
          4. Local MSME Integration: Include specific local eateries.`,
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
      const data = JSON.parse(responseText);
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
      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border-4 ${
        role === 'ai' ? 'bg-island-volcanic text-white border-island-emerald/20' : 'bg-white text-island-emerald border-slate-50'
      }`}>
        {role === 'ai' ? <Sparkles size={26} strokeWidth={2.5} /> : <UserIcon size={26} strokeWidth={2.5} />}
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

  const SelectionGrid = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div className="mt-8 space-y-6 md:px-14">
      {title && <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">{title}</h5>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );

  const ChoiceButton = ({ onClick, active, label, icon: Icon, description }: any) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 text-left transition-all duration-500 group relative overflow-hidden ${
        active 
          ? 'border-island-emerald bg-emerald-50/50 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.2)]' 
          : 'border-slate-100 bg-white hover:border-slate-200 shadow-xl'
      }`}
    >
      {active && <div className="absolute top-0 right-0 w-24 h-24 bg-island-emerald/5 rounded-bl-full animate-pulse" />}
      <div className="flex flex-col gap-4 md:gap-6 relative z-10">
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 ${
          active ? 'bg-island-emerald text-white scale-110 shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-island-volcanic group-hover:text-white'
        }`}>
          {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />}
        </div>
        <div>
          <span className={`block font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 md:mb-2 transition-colors ${active ? 'text-island-emerald' : 'text-island-volcanic'}`}>{label}</span>
          {description && <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">{description}</p>}
        </div>
      </div>
    </motion.button>
  );

  const renderChatFlow = () => {
    const steps_rendered = [];

    // Duration Step
    steps_rendered.push(
      <div key="q-duration" className="space-y-6">
        <ChatBubble role="ai">Mabuhay! Welcome to Catarman. How many days will you be staying?</ChatBubble>
        {step === 'duration' && (
          <SelectionGrid title="Select Duration">
            {[1, 2, 3, 4, 5].map(d => (
              <ChoiceButton 
                key={d} 
                onClick={() => { setDays(d); setStep('group'); }} 
                label={`${d} ${d === 1 ? 'Cycle' : 'Cycles'}`}
                icon={Calendar}
                description={`${d} ${d === 1 ? 'Day' : 'Days'} in Catarman`}
              />
            ))}
          </SelectionGrid>
        )}
      </div>
    );

    // Group Step
    if (steps.indexOf(step) >= steps.indexOf('group')) {
      steps_rendered.push(
        <div key="a-duration" className="space-y-6">
          <ChatBubble role="user">{days} days sounds great!</ChatBubble>
          <ChatBubble role="ai">Great, {days} days! Who will be joining you?</ChatBubble>
          {step === 'group' && (
            <SelectionGrid title="Exploration Unit">
              {[
                { id: 'Solo', icon: Compass, label: 'Solo', desc: 'Traveling alone' },
                { id: 'Couple', icon: Heart, label: 'Couple', desc: 'Romantic getaway' },
                { id: 'Family', icon: Users, label: 'Family', desc: 'Fun for everyone' },
                { id: 'Friends', icon: Users, label: 'Friends', desc: 'Travel with friends' }
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
        <div key="a-group" className="space-y-6">
          <ChatBubble role="user">Traveling as a {groupType.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">How would you like to get around Catarman?</ChatBubble>
          {step === 'transport' && (
            <SelectionGrid title="Mobility Method">
              {[
                { id: 'No Vehicle', icon: MapPin, label: 'Public Transport', desc: 'Tricycles & jeepneys' },
                { id: 'Self-Drive', icon: Car, label: 'Self-Drive', desc: 'Scooter or van rental' },
                { id: 'Private Tour', icon: ShieldCheck, label: 'Guided Tour', desc: 'Local expert guide' }
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
        <div key="a-transport" className="space-y-6">
          <ChatBubble role="user">Using the {transport.toLowerCase()} mode.</ChatBubble>
          <ChatBubble role="ai">What pace do you prefer for your trip?</ChatBubble>
          {step === 'pace' && (
            <SelectionGrid title="Pace">
              {[
                { id: 'Relaxed', icon: Sun, label: 'Relaxed', desc: 'At our own pace' },
                { id: 'Moderate', icon: Clock, label: 'Moderate', desc: 'A good mix' },
                { id: 'Packed', icon: Zap, label: 'Packed', desc: 'See it all' }
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
        <div key="a-pace" className="space-y-6">
          <ChatBubble role="user">Setting pace to {pace.toLowerCase()}.</ChatBubble>
          <ChatBubble role="ai">Any particular interests or things you'd love to experience?</ChatBubble>
          {step === 'interests' && (
            <div className="space-y-8 md:px-14">
              <div className="grid grid-cols-2 gap-5 mt-6">
                {[
                  { id: 'Photography', icon: Camera, label: 'Photography' },
                  { id: 'Hidden Gems', icon: Gem, label: 'Hidden Gems' },
                  { id: 'Local Food', icon: Utensils, label: 'Local Food' },
                  { id: 'Extreme Hiking', icon: Mountain, label: 'Hiking' }
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
                className="w-full bg-island-volcanic text-white py-8 rounded-[3rem] font-bold tracking-wider text-xs shadow-2xl flex items-center justify-center gap-5 hover:bg-island-emerald transition-all"
              >
                Continue <ArrowRight size={22} strokeWidth={3} />
              </motion.button>
            </div>
          )}
        </div>
      );
    }

    // Style Step
    if (steps.indexOf(step) >= steps.indexOf('style')) {
      steps_rendered.push(
        <div key="a-interests" className="space-y-6">
          <ChatBubble role="user">Prioritize {interests.length > 0 ? interests.join(' and ') : "all nodes"}.</ChatBubble>
          <ChatBubble role="ai">Great choices! What kind of experience are you looking for?</ChatBubble>
          {step === 'style' && (
            <SelectionGrid title="Travel Style">
              {[
                { id: 'Adventure', icon: Mountain, label: 'Adventure', desc: 'Thrills & exploration' },
                { id: 'Relax', icon: Sun, label: 'Relaxation', desc: 'Rest & recharge' },
                { id: 'Foodie', icon: Coffee, label: 'Foodie', desc: 'Local flavors' }
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
        <div key="a-style" className="space-y-6">
          <ChatBubble role="user">Looking for a {style.toLowerCase()} trip.</ChatBubble>
          <ChatBubble role="ai">What's your budget range?</ChatBubble>
          {step === 'budget' && (
            <SelectionGrid title="Budget">
              {[
                { id: 'Budget', icon: Coins, label: 'Budget-Friendly', desc: 'Great value' },
                { id: 'Moderate', icon: Wallet, label: 'Mid-Range', desc: 'Comfortable' },
                { id: 'Luxury', icon: Gem, label: 'Premium', desc: 'No limit' }
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
            <div className="md:px-14 mt-12 pb-24">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateTrip}
                className="w-full bg-island-emerald text-white py-10 rounded-[4rem] font-bold tracking-wider text-sm shadow-[0_40px_80px_-20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-6"
              >
                <Sparkles size={28} strokeWidth={3} /> Build My Itinerary
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
    <div className="flex h-screen bg-slate-50 overflow-hidden selection:bg-island-emerald/20 selection:text-island-emerald font-sans">
      
      {/* Left Panel: Chat & Itinerary */}
      <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-[600px] lg:w-[850px]'} bg-white relative z-20 shadow-[0_0_100px_-20px_rgba(0,0,0,0.1)] border-r border-slate-100`}>
        
        {/* Planner Header */}
        <header className="px-10 py-10 flex items-center justify-between bg-white/95 backdrop-blur-3xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(isMobile ? '/mobile' : '/')} className="w-14 h-14 bg-slate-50 hover:bg-slate-100 text-island-volcanic transition-all rounded-2xl flex items-center justify-center border-2 border-slate-100 active:scale-90">
              <ArrowLeft size={24} strokeWidth={3} />
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
                  <Dna size={80} strokeWidth={2} className="animate-spin-slow" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-island-emerald rounded-3xl flex items-center justify-center text-white shadow-2xl">
                  <Sparkles size={32} />
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
            <div className="space-y-24 pb-40 animate-in fade-in slide-in-from-bottom-20 duration-1000">
              {/* Result Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-6">
                  <span className="text-[10px] font-bold text-island-emerald tracking-wider block">Itinerary Complete</span>
                  <h2 className="text-6xl lg:text-8xl font-black text-island-volcanic tracking-tighter uppercase leading-[0.85] italic">Catarman <br /> <span className="not-italic text-island-emerald">Explorer</span></h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-island-volcanic text-white px-6 py-2.5 rounded-full border border-white/10 shadow-xl">
                      <Calendar size={14} className="text-island-emerald" />
                      <span className="text-xs font-bold tracking-wider">{days} Days</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white text-island-volcanic px-6 py-2.5 rounded-full border border-slate-100 shadow-xl text-xs font-bold tracking-wider">
                      <Users size={14} /> {groupType}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep('duration')} className="w-20 h-20 rounded-3xl bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-island-volcanic hover:bg-island-volcanic hover:text-white transition-all shadow-xl active:scale-90">
                  <RefreshCw size={32} strokeWidth={2.5} />
                </button>
              </div>

              {/* Itinerary Timeline */}
              <div className="space-y-16 md:space-y-32 relative">
                {itinerary.map((day, idx) => (
                  <div key={day.day} className="relative">
                    <div className="flex items-center gap-6 md:gap-10 mb-10 md:mb-16">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] bg-island-volcanic text-white flex items-center justify-center text-2xl md:text-4xl font-black shadow-2xl border-4 md:border-8 border-slate-50 shrink-0">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-4xl font-black text-island-volcanic uppercase tracking-tighter leading-none italic">Day {day.day}</h3>
                        <p className="text-[10px] font-semibold text-slate-400 tracking-tight mt-2 md:mt-3">Theme: {idx === 0 ? 'Discovery' : idx === 1 ? 'Immersion' : 'Integration'}</p>
                      </div>
                    </div>

                    <div className="space-y-10 md:space-y-16 border-l-4 md:border-l-8 border-slate-50 ml-8 md:ml-12 pl-8 md:pl-20 relative py-2">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className="relative group">
                          {/* Timeline Node */}
                          <div className="absolute -left-[42px] md:-left-[108px] top-4 w-6 h-6 md:w-14 md:h-14 bg-white border-4 md:border-8 border-island-volcanic rounded-full shadow-3xl z-10 group-hover:scale-110 group-hover:border-island-emerald transition-all" />
                          
                          {/* Activity Card */}
                          <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                              <span className="text-lg md:text-xl font-black text-island-volcanic tracking-tighter">{act.timeSlot}</span>
                              <div className="hidden md:block h-px bg-slate-100 flex-1" />
                              <span className="text-[10px] font-bold text-island-emerald tracking-wider bg-emerald-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-island-emerald/10 w-fit">
                                {act.category || 'Experience'}
                              </span>
                            </div>

                            <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border-4 md:border-8 border-slate-50 shadow-2xl p-6 md:p-12 transition-all duration-700 hover:-translate-y-2 md:hover:-translate-y-4 group/card overflow-hidden relative">
                              <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-slate-50/50 rounded-full translate-x-16 -translate-y-16 md:translate-x-32 md:-translate-y-32 -z-10 group-hover/card:scale-150 transition-transform duration-1000" />
                              
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-10 mb-6 md:mb-10">
                                <div className="space-y-2 md:space-y-4">
                                  <h4 className="text-3xl md:text-5xl font-black text-island-volcanic tracking-tighter uppercase leading-[0.9] group-hover/card:text-island-emerald transition-colors italic">{act.activity}</h4>
                                  <div className="flex items-center gap-2 md:gap-4 text-slate-400">
                                    <MapPin size={14} className="text-island-emerald" />
                                    <span className="text-xs md:text-sm font-semibold tracking-tight">{act.location}</span>
                                  </div>
                                </div>
                                <div className="text-left md:text-right shrink-0">
                                  <span className="text-2xl md:text-4xl font-black text-island-volcanic tracking-tighter">₱{act.price}</span>
                                  <span className="block text-[10px] font-semibold text-slate-400 tracking-tight mt-1">Estimated cost</span>
                                </div>
                              </div>

                              <p className="text-sm md:text-xl text-slate-500 font-medium leading-relaxed mb-6 md:mb-12 max-w-2xl">{act.description}</p>

                              {/* Intelligence Node */}
                              <div className="bg-island-volcanic text-white p-5 md:p-8 rounded-2xl md:rounded-[3rem] mb-6 md:mb-12 flex flex-col md:flex-row gap-4 md:gap-8 md:items-center shadow-2xl relative overflow-hidden group/intel">
                                <div className="absolute inset-0 bg-gradient-to-r from-island-emerald/20 to-transparent opacity-0 group-hover/intel:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-island-emerald text-white flex items-center justify-center shrink-0 shadow-lg relative z-10">
                                  <Zap size={24} strokeWidth={2.5} />
                                </div>
                                <div className="relative z-10">
                                  <span className="text-[10px] font-semibold text-island-emerald tracking-tight mb-1 block">Why this works</span>
                                  <p className="text-xs md:text-lg font-black italic leading-tight text-white/90">"{act.whyGo}"</p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 md:gap-6">
                                <motion.button 
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleAction(act, day.day, 'pass')}
                                  disabled={bookingStatus[`${day.day}-${act.activity}-pass`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'}
                                  className={`flex-[2] py-5 md:py-8 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs flex items-center justify-center gap-3 md:gap-5 transition-all shadow-2xl ${
                                    bookingStatus[`${day.day}-${act.activity}-pass`] === 'success'
                                      ? 'bg-island-emerald text-white shadow-none'
                                      : 'bg-island-volcanic text-white hover:bg-island-emerald'
                                  }`}
                                >
                                  {bookingStatus[`${day.day}-${act.activity}-pass`] === 'success' ? <><CheckCircle2 size={24} /> Saved!</> : <><Ticket size={24} /> Save to Pass</>}
                                </motion.button>
                                <motion.button 
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleAction(act, day.day, 'transport')}
                                  disabled={bookingStatus[`${day.day}-${act.activity}-transport`] === 'loading' || bookingStatus[`${day.day}-${act.activity}-transport`] === 'success'}
                                  className="flex-1 bg-white border-2 md:border-4 border-slate-50 text-island-volcanic rounded-2xl md:rounded-[2rem] py-5 md:py-0 flex items-center justify-center gap-3 md:gap-4 hover:border-island-volcanic transition-all shadow-xl"
                                >
                                  {bookingStatus[`${day.day}-${act.activity}-transport`] === 'success' ? <CheckCircle2 size={24} className="text-island-emerald" /> : <Car size={28} />}
                                  <span className="sm:hidden font-black uppercase tracking-widest text-[10px]">Transport</span>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Final Verification Section */}
                <div className="pt-10 md:pt-20 space-y-10">
                  <div className="bg-island-emerald p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] text-white shadow-[0_50px_100px_-20px_rgba(16,185,129,0.3)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full translate-x-16 -translate-y-16 md:translate-x-32 md:-translate-y-32 animate-pulse" />
                    <div className="relative z-10 text-center space-y-6 md:space-y-8">
                      <ShieldCheck size={80} className="mx-auto text-white/40 mb-6 md:mb-10" />
                      <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic">Review Your <br /> Itinerary</h3>
                      <p className="text-white/80 font-medium text-xs md:text-sm max-w-md mx-auto">Save all activities to your pass and finalize your Catarman adventure.</p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto bg-white text-island-emerald px-10 md:px-16 py-6 md:py-8 rounded-full font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm shadow-3xl hover:bg-island-volcanic hover:text-white transition-all"
                      >
                        Confirm All
                      </motion.button>
                    </div>
                  </div>
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
            <X size={32} strokeWidth={3} />
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
          <Icon size={26} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-black text-island-green tracking-tighter">{label}</span>
      </div>
      {count ? (
        <span className="px-4 py-1.5 bg-island-emerald text-white rounded-full text-[10px] font-black shadow-xl">{count}</span>
      ) : (
        <ChevronRight size={22} strokeWidth={3} className="text-emerald-100 group-hover:text-island-emerald group-hover:translate-x-1 transition-all" />
      )}
    </button>
  );
}

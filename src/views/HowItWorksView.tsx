import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { UilArrowLeft, UilStar } from '@/icons';
import { ProcessFlow, CompactProcessFlow } from '../components/ProcessFlow';
import { bookingFlow, tripPlannerFlow } from '../data/processFlow';

export default function HowItWorksView() {
  const [activeFlow, setActiveFlow] = useState<'booking' | 'planner'>('booking');

  const currentFlow = activeFlow === 'booking' ? bookingFlow : tripPlannerFlow;

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-island-emerald/5 to-transparent" />
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-slate-400 hover:text-island-volcanic transition-all mb-12 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-island-volcanic group-hover:text-white transition-colors shadow-sm">
              <UilArrowLeft size="18" />
            </div>
            <span className="text-xs font-semibold tracking-tight">Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">/ How It Works</span>
            <h1 className="text-6xl md:text-8xl font-black text-island-volcanic tracking-tighter leading-[0.9] mb-6 uppercase italic">
              Your journey <br />
              <span className="text-island-emerald not-italic">starts here.</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-2xl">
              eSuroy makes it easy to discover, book, and explore everything our platform has to offer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Flow Tabs */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="flex gap-4 mb-16">
          <button
            onClick={() => setActiveFlow('booking')}
            className={`px-8 py-4 rounded-full text-sm font-bold tracking-wider transition-all ${
              activeFlow === 'booking'
                ? 'bg-island-volcanic text-white shadow-xl shadow-island-volcanic/20'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-island-emerald/30'
            }`}
          >
            Book an Experience
          </button>
          <button
            onClick={() => setActiveFlow('planner')}
            className={`px-8 py-4 rounded-full text-sm font-bold tracking-wider transition-all ${
              activeFlow === 'planner'
                ? 'bg-island-volcanic text-white shadow-xl shadow-island-volcanic/20'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-island-emerald/30'
            }`}
          >
            Plan with AI
          </button>
        </div>

        {/* Desktop Flow */}
        <div className="hidden md:block">
          <motion.div
            key={activeFlow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[4rem] p-16 shadow-xl border border-slate-100"
          >
            <ProcessFlow steps={currentFlow.steps} variant="full" />
          </motion.div>
        </div>

        {/* Mobile Flow */}
        <div className="md:hidden">
          <motion.div
            key={activeFlow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100"
          >
            <CompactProcessFlow steps={currentFlow.steps} />
          </motion.div>
        </div>
      </section>

      {/* Role Flow Section */}
      <section className="max-w-[1600px] mx-auto px-6 mt-32">
        <div className="bg-volcanic-gradient rounded-[4rem] p-16 text-white relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 opacity-5">
            <UilStar size="300" className="translate-x-20 -translate-y-20" />
          </div>
          <div className="relative z-10">
            <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">/ Three in One</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10 uppercase italic">
              More than a <br />
              <span className="text-island-emerald not-italic">tourist app.</span>
            </h2>
            <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-2xl mb-16">
              eSuroy serves everyone — tourists exploring the island, businesses managing bookings,
              and the LGU monitoring municipal data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  role: 'Tourist',
                  desc: 'Discover destinations, book stays and transport, get AI-powered trip plans, and use your digital pass.',
                  color: 'from-island-emerald to-emerald-600',
                },
                {
                  role: 'Business',
                  desc: 'Manage bookings, track inventory, respond to reviews, and view real-time analytics.',
                  color: 'from-island-ocean to-cyan-600',
                },
                {
                  role: 'LGU',
                  desc: 'Monitor visitor data, oversee port activity, manage safety, and generate reports.',
                  color: 'from-island-sunset to-amber-600',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-8`}>
                    <span className="text-xl font-black">{item.role[0]}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">{item.role}</h3>
                  <p className="text-slate-300 font-medium leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1600px] mx-auto px-6 mt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">/ Ready to Explore?</span>
          <h2 className="text-5xl md:text-7xl font-black text-island-volcanic tracking-tighter leading-[0.9] mb-8 uppercase italic">
            Start your <span className="text-island-emerald not-italic">adventure.</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto mb-12">
            Browse destinations, plan with AI, or book your stay — your adventure is waiting.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/stay"
              className="bg-island-volcanic text-white px-12 py-6 rounded-full text-sm font-bold tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Browse Stays
            </Link>
            <Link
              to="/planner"
              className="bg-white text-island-volcanic border-2 border-slate-100 px-12 py-6 rounded-full text-sm font-bold tracking-wider hover:border-island-emerald/30 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Plan with AI
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

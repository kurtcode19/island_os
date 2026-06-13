import { motion } from 'motion/react';
import { QrCode, ShieldCheck, Ticket, MapPin, Calendar, User, Info, CheckCircle2, ArrowRight, Smartphone, Download, Sparkles } from 'lucide-react';

export default function TouristPassView() {
  return (
    <div className="bg-[#F0FDF4] min-h-screen pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <section className="relative h-[35vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 volcanic-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">Verified Digital Node</span>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
              Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-white">Pass.</span>
            </h1>
            <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
              Your all-in-one digital manifest for seamless access to Catarman's heritage nodes and transport loops.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-14 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Pass Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-[4rem] shadow-3xl overflow-hidden border-2 border-slate-100 sticky top-28 p-5"
            >
              <div className="volcanic-gradient rounded-[3rem] p-12 text-white text-center relative overflow-hidden mb-10 border border-white/10">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                  <Sparkles size={150} className="translate-x-10 -translate-y-10 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-3xl border border-white/20 shadow-2xl">
                    <QrCode size={48} strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter">Catarman <br /> <span className="text-island-emerald">Pass.</span></h3>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mt-3">Verified Pilot Agent</p>
                </div>
              </div>
              
              <div className="px-5 pb-5 space-y-10">
                <div className="flex justify-center">
                  <div className="p-8 bg-stone-50 rounded-[3rem] border-2 border-slate-100 relative shadow-inner">
                    <QrCode size={200} className="text-island-volcanic" strokeWidth={1} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                      <ShieldCheck size={120} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center py-5 border-b-2 border-stone-50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-island-emerald">
                        <User size={18} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-black text-island-volcanic">Kurt Mier</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Operator</span>
                  </div>
                  <div className="flex justify-between items-center py-5 border-b-2 border-stone-50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-island-emerald">
                        <Calendar size={18} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-black text-island-volcanic">JUN 2026</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Node Expiry</span>
                  </div>
                </div>

                <button className="btn-volcanic w-full py-6 rounded-[2rem]">
                  <Download size={20} strokeWidth={3} /> Export Manifest PDF
                </button>
              </div>
            </motion.div>
          </div>

          {/* Benefits & Info */}
          <div className="lg:col-span-2 space-y-16 py-14">
            <div>
              <span className="text-island-coral font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Operational Protocol</span>
              <h2 className="text-5xl md:text-7xl font-black text-island-volcanic mb-10 tracking-tighter leading-[0.95]">Universal <br /><span className="text-island-emerald">Interface.</span></h2>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed mb-16 max-w-2xl">
                The Digital Pass is your secure key to the Catarman pilot network, eliminating friction at every node transition.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { title: 'Node Entry', desc: 'Secure verification at all major heritage and nature nodes.', icon: CheckCircle2, color: 'bg-emerald-50 text-island-emerald' },
                  { title: 'Transit Priority', desc: 'Link your transit manifest for accelerated loop entry.', icon: Ticket, color: 'bg-blue-50 text-blue-500' },
                  { title: 'Protocol Safety', desc: 'Integrated health node and emergency telemetry.', icon: ShieldCheck, color: 'bg-rose-50 text-island-coral' },
                  { title: 'Economic Perks', desc: 'Exclusive node rewards at partner retail marketplaces.', icon: MapPin, color: 'bg-amber-50 text-island-sunset' },
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl flex flex-col gap-8 group hover:shadow-2xl transition-all duration-500">
                    <div className={`w-16 h-16 rounded-2xl ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <benefit.icon size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-island-volcanic mb-3 tracking-tight">{benefit.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                <Smartphone size={300} className="translate-x-10 -translate-y-10" />
              </div>
              <h3 className="text-4xl font-black text-island-volcanic mb-12 tracking-tighter">System Architecture.</h3>
              <div className="space-y-12">
                {[
                  { step: '01', title: 'Node Registration', desc: 'Complete the digital tourism manifest prior to municipal entry.' },
                  { step: '02', title: 'Node Verification', desc: 'Manifest is automatically processed and verified by the LGU node.' },
                  { step: '03', title: 'Interface Access', desc: 'Active QR code allows seamless node and transit transitions.' },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-10 relative group">
                    {idx < 2 && <div className="absolute left-8 top-16 bottom-0 w-1 bg-stone-50 group-hover:bg-island-emerald/20 transition-colors"></div>}
                    <div className="w-16 h-16 rounded-2xl volcanic-gradient text-white flex items-center justify-center text-xl font-black shrink-0 relative z-10 shadow-2xl">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-island-volcanic mb-2 tracking-tight">{step.title}</h4>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="emerald-gradient p-16 rounded-[4.5rem] text-white shadow-3xl border border-white/10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-3xl flex items-center justify-center text-white shrink-0 shadow-2xl border border-white/20">
                <Smartphone size={48} strokeWidth={2} />
              </div>
              <div className="flex-1 text-center md:text-left relative z-10">
                <h3 className="text-4xl font-black mb-3 tracking-tighter leading-none">Mobile First.</h3>
                <p className="text-white/70 font-medium text-xl mb-10 leading-relaxed">
                  Download the Catarman eLaag interface for offline node access and real-time protocol updates.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-5">
                  <button className="btn-volcanic px-8 py-4 rounded-2xl">App Store</button>
                  <button className="btn-volcanic px-8 py-4 rounded-2xl">Google Play</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { QrCode, ShieldCheck, Ticket, MapPin, Calendar, User, Info, CheckCircle2, ArrowRight, Smartphone, Download } from 'lucide-react';

export default function TouristPassView() {
  return (
    <div className="bg-island-cream min-h-screen pb-20">
      {/* Header */}
      <section className="relative h-[30vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 island-gradient opacity-90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 italic">
              Digital <span className="not-italic">Tourist Pass</span>
            </h1>
            <p className="text-xl text-emerald-50/80 font-light max-w-2xl mx-auto">
              Your all-in-one digital ID for seamless access to Camiguin's attractions, transport, and services.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Pass Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 sticky top-28"
            >
              <div className="island-gradient p-10 text-white text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
                    <QrCode size={40} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold italic">Camiguin <span className="not-italic">Pass</span></h3>
                  <p className="text-emerald-100/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Verified Tourist</p>
                </div>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="flex justify-center">
                  <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                    <QrCode size={180} className="text-island-green" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <ShieldCheck size={100} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-island-emerald" />
                      <span className="text-sm font-bold text-island-green">Kurt Mier</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-island-emerald" />
                      <span className="text-sm font-bold text-island-green">Mar 25, 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Until</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-island-emerald" />
                      <span className="text-sm font-bold text-island-green">Verified</span>
                    </div>
                    <div className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold uppercase tracking-widest">Active</div>
                  </div>
                </div>

                <button className="w-full py-5 bg-island-volcanic text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all">
                  <Download size={20} /> Download PDF Pass
                </button>
              </div>
            </motion.div>
          </div>

          {/* Benefits & Info */}
          <div className="lg:col-span-2 space-y-12 py-10">
            <div>
              <h2 className="text-4xl font-serif font-bold text-island-green mb-6 italic">Why use the <span className="not-italic text-island-emerald">Digital Pass?</span></h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed mb-10">
                The Digital Tourist Pass is designed to make your visit to Camiguin as smooth as possible, reducing paperwork and wait times at every stop.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Contactless Entry', desc: 'Scan and enter at all major springs, falls, and heritage sites.', icon: CheckCircle2 },
                  { title: 'Ferry Priority', desc: 'Link your ferry tickets to your pass for faster boarding at the port.', icon: Ticket },
                  { title: 'Health & Safety', desc: 'Integrated health declaration and emergency contact system.', icon: ShieldCheck },
                  { title: 'Local Discounts', desc: 'Exclusive rewards at partner restaurants and souvenir shops.', icon: MapPin },
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-island-emerald/10 flex items-center justify-center text-island-emerald shrink-0">
                      <benefit.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-island-green mb-2">{benefit.title}</h4>
                      <p className="text-sm text-slate-500 font-light leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-island-green mb-8 italic">How it <span className="not-italic text-island-emerald">Works</span></h3>
              <div className="space-y-10">
                {[
                  { step: '01', title: 'Register Online', desc: 'Fill out the basic tourist registration form before your arrival.' },
                  { step: '02', title: 'Get Verified', desc: 'Your pass is automatically generated and verified by the LGU.' },
                  { step: '03', title: 'Scan & Enjoy', desc: 'Show your QR code at checkpoints, resorts, and attractions.' },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-8 relative">
                    {idx < 2 && <div className="absolute left-6 top-12 bottom-0 w-px bg-slate-100"></div>}
                    <div className="w-12 h-12 rounded-full bg-island-green text-white flex items-center justify-center font-bold shrink-0 relative z-10">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-island-green mb-2">{step.title}</h4>
                      <p className="text-slate-500 font-light">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-island-coral/5 p-12 rounded-[3.5rem] border border-island-coral/10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 rounded-3xl bg-island-coral/10 flex items-center justify-center text-island-coral shrink-0">
                <Smartphone size={40} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-serif font-bold text-island-green mb-2">Better on Mobile</h3>
                <p className="text-slate-500 font-light mb-6">
                  Download the IsleGO app to keep your pass offline and get real-time notifications.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button className="px-6 py-3 bg-island-volcanic text-white rounded-xl font-bold text-sm">App Store</button>
                  <button className="px-6 py-3 bg-island-volcanic text-white rounded-xl font-bold text-sm">Google Play</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

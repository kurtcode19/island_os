import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilMessage, UilTimes, UilPhone, UilEnvelopeAlt, UilCheckCircle } from '@/icons';

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); }, 3000);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-6 z-50 w-16 h-16 bg-gradient-to-r from-[#8b7355] to-[#a0865f] text-white rounded-full shadow-2xl shadow-[#8b7355]/40 flex items-center justify-center hover:scale-110 transition-all"
      >
        <UilMessage size="24" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-3xl border-2 border-slate-100"
            >
              {submitted ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UilCheckCircle size="48" className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-2">Message Sent</h3>
                  <p className="text-[#6e6e73] font-medium">We'll get back to you soon.</p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-[#8b7355] to-[#a0865f] p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <button onClick={() => setOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/40">
                      <UilTimes size="20" className="text-white" />
                    </button>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/30 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/40">
                        <UilMessage size="32" className="text-white" />
                      </div>
                      <h3 className="text-3xl font-light tracking-tight mb-2">Chat with Us</h3>
                      <p className="text-white/70 font-medium text-sm">We'd love to hear from you!</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <input type="text" placeholder="Your Name" required
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#8b7355]/10 text-sm font-medium" />
                    <input type="email" placeholder="Your Email" required
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#8b7355]/10 text-sm font-medium" />
                    <textarea rows={3} placeholder="Your Message..." required
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#8b7355]/10 text-sm font-medium resize-none" />
                    <button type="submit"
                      className="w-full py-5 bg-gradient-to-r from-[#8b7355] to-[#a0865f] text-white rounded-2xl font-semibold text-sm tracking-wider transition-all shadow-lg shadow-[#8b7355]/20">
                      Send Message
                    </button>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <UilPhone size="20" className="text-slate-400 shrink-0" />
                      <p className="text-xs font-medium text-slate-500">Call us: <span className="font-bold text-[#8b7355]">0917-000-0000</span></p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <UilEnvelopeAlt size="20" className="text-slate-400 shrink-0" />
                      <p className="text-xs font-medium text-slate-500">Email: <span className="font-bold text-[#8b7355]">hello@dininggasan.com</span></p>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

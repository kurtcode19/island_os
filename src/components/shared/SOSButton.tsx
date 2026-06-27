import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilExclamationTriangle, UilTimes, UilMessage, UilMapMarker, UilPhone, UilCheckCircle, UilSpinnerAlt } from '@/icons';
import { useAuth } from '../../context/AuthContext';
import { reportIncident } from '../../lib/incidentService';

export default function SOSButton() {
  const { user, profile, login } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSOS = async (type: 'sos' | 'report') => {
    if (!user) { login(); return; }
    setSubmitting(true);
    const id = await reportIncident(user.uid, profile?.name || user.displayName || 'Guest', type, message);
    setSubmitting(false);
    if (id) {
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); setMessage(''); }, 3000);
    }
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-6 z-50 w-16 h-16 bg-island-coral text-white rounded-full shadow-2xl shadow-island-coral/40 flex items-center justify-center border-4 border-white hover:scale-110 transition-all"
      >
        <UilExclamationTriangle size="28" className="animate-pulse" />
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-island-volcanic/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-3xl border-2 border-slate-100"
            >
              {submitted ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-island-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UilCheckCircle size="48" className="text-island-emerald" />
                  </div>
                  <h3 className="text-2xl font-black text-island-volcanic tracking-tighter mb-2">Alert Sent</h3>
                  <p className="text-slate-500 font-medium">LGU has been notified. Help is on the way.</p>
                </div>
              ) : (
                <>
                  <div className="bg-island-coral p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <button onClick={() => setOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <UilTimes size="20" />
                    </button>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                        <UilExclamationTriangle size="36" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tighter mb-2">Emergency</h3>
                      <p className="text-white/70 font-medium text-sm">Your location will be shared with LGU response team.</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <UilMapMarker size="20" className="text-amber-500 shrink-0" />
                      <p className="text-xs font-medium text-amber-700">GPS location will be captured and sent with your alert.</p>
                    </div>

                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your emergency (optional)..."
                      rows={3}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-medium resize-none"
                    />

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleSOS('sos')}
                        disabled={submitting}
                        className="flex-1 py-5 bg-island-coral text-white rounded-2xl font-bold text-sm tracking-wider hover:bg-island-coral/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-island-coral/20"
                      >
                        {submitting ? <UilSpinnerAlt size="20" className="animate-spin" /> : <UilExclamationTriangle size="20" />}
                        SOS Emergency
                      </button>
                      <button
                        onClick={() => handleSOS('report')}
                        disabled={submitting}
                        className="flex-1 py-5 bg-island-volcanic text-white rounded-2xl font-bold text-sm tracking-wider hover:bg-island-volcanic/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {submitting ? <UilSpinnerAlt size="20" className="animate-spin" /> : <UilMessage size="20" />}
                        Report Issue
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <UilPhone size="20" className="text-slate-400 shrink-0" />
                      <p className="text-xs font-medium text-slate-500">Emergency hotline: <span className="font-bold text-island-volcanic">(088) 555-0911</span></p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

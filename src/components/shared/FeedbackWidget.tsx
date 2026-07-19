import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilMessage, UilTimes, UilStar, UilCheckCircle } from '@/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const ratings = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Great' },
  { value: 5, label: 'Excellent' },
];

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous',
        rating,
        comment,
        url: window.location.pathname,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-island-green text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
        title="Give feedback"
      >
        <UilMessage size="22" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-3xl shadow-3xl border-2 border-slate-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-island-volcanic">Feedback</h3>
                <button onClick={() => setOpen(false)} className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-island-coral transition-all">
                  <UilTimes size="14" />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-6">
                  <UilCheckCircle size="40" className="text-island-emerald mx-auto mb-3" />
                  <p className="text-sm font-bold text-island-volcanic">Thank you!</p>
                  <p className="text-xs text-slate-500">Your feedback helps us improve.</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-1 mb-4 justify-center">
                    {ratings.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRating(r.value)}
                        className={`p-1.5 rounded-xl transition-all ${
                          rating >= r.value ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-300'
                        }`}
                      >
                        <UilStar size="28" />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      {ratings.find(r => r.value === rating)?.label}
                    </p>
                  )}

                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us more (optional)..."
                    rows={3}
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-island-emerald/30 text-sm font-medium text-slate-800 resize-none mb-4"
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting}
                    className="w-full bg-island-green text-white py-4 rounded-2xl font-bold text-xs tracking-wider hover:bg-island-emerald active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

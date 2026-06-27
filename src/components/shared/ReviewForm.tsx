import { useState } from 'react';
import { motion } from 'motion/react';
import { UilStar, UilMessage, UilSpinnerAlt, UilCheckCircle, UilTimes } from '@/icons';
import { toast } from 'sonner';
import { submitReview } from '../../lib/reviewService';
import { useAuth } from '../../context/AuthContext';

interface ReviewFormProps {
  bookingId: string;
  businessId: string;
  serviceId: string | number;
  serviceName: string;
  onClose: () => void;
}

export default function ReviewForm({ bookingId, businessId, serviceId, serviceName, onClose }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!user) return;

    setSubmitting(true);
    const success = await submitReview(
      bookingId,
      user.uid,
      profile?.name || user.displayName || 'Guest',
      businessId,
      serviceId,
      serviceName,
      rating,
      comment
    );
    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      toast.success('Review submitted!');
      setTimeout(onClose, 2000);
    } else {
      toast.error('Failed to submit review');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl"
    >
      {submitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-island-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UilCheckCircle size="36" className="text-island-emerald" />
          </div>
          <h3 className="text-2xl font-black text-island-volcanic tracking-tighter mb-2">Thank You!</h3>
          <p className="text-slate-500 font-medium">Your review helps other travelers.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Rate Your Experience</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">{serviceName}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-island-coral transition-all">
              <UilTimes size="20" />
            </button>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-all hover:scale-110"
              >
                <UilStar
                  size="40"
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'text-island-sunset fill-island-sunset'
                      : 'text-slate-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={4}
            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-medium resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="btn-primary w-full py-6 rounded-2xl text-sm disabled:opacity-50"
          >
            {submitting ? (
              <UilSpinnerAlt size="20" className="animate-spin" />
            ) : (
              <UilMessage size="20" />
            )}
            Submit Review
          </button>
        </div>
      )}
    </motion.div>
  );
}

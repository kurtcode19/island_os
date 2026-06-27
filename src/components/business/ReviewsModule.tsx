import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UilStar as Star, UilMessage as MessageSquare, UilCornerUpRight as Reply, UilThumbsUp as ThumbsUp, UilSearch as Search, UilFilter as Filter, UilAngleRightB as ChevronRight, UilUser as User, UilCheckCircle as CheckCircle2, UilTimesCircle as XCircle } from '@/icons';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { subscribeToBusinessReviews, moderateReview, replyToReview } from '../../lib/reviewService';
import type { Review } from '../../types';

export default function ReviewsModule() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!profile?.businessId) return;
    const unsubscribe = subscribeToBusinessReviews(profile.businessId, (data) => {
      setReviews(data);
    });
    return () => unsubscribe();
  }, [profile?.businessId]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const filteredReviews = reviews.filter(r =>
    r.touristName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModerate = async (id: string, approved: boolean) => {
    const success = await moderateReview(id, approved);
    if (success) {
      toast.success(approved ? 'Review approved' : 'Review rejected');
    }
  };

  const handleReply = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text?.trim()) { toast.error('Please enter a reply'); return; }
    const success = await replyToReview(reviewId, text);
    if (success) {
      toast.success('Reply posted');
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="18" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter size="20" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-island-sunset font-bold">
              <Star size="20" className="fill-island-sunset" />
              <span className="text-2xl">{averageRating}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[3rem] border border-slate-100">
            <MessageSquare size="48" className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">No reviews yet</p>
          </div>
        ) : (
          filteredReviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold text-lg">
                    {review.touristName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-island-green">{review.touristName}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{review.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size="18" 
                        className={`${i < review.rating ? 'text-island-sunset fill-island-sunset' : 'text-slate-100'}`} 
                      />
                    ))}
                  </div>
                  {!review.moderated && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-500 rounded-full text-[10px] font-bold">Pending</span>
                  )}
                </div>
              </div>
              
              <p className="text-slate-600 leading-relaxed font-light text-lg mb-8">"{review.comment}"</p>

              {review.reply && (
                <div className="mb-8 p-6 bg-island-emerald/5 rounded-[2rem] border border-island-emerald/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply size="16" className="text-island-emerald" />
                    <span className="text-xs font-bold text-island-emerald uppercase tracking-widest">Your Reply</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{review.reply}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50 flex-wrap">
                {!review.moderated && (
                  <>
                    <button
                      onClick={() => handleModerate(review.id!, true)}
                      className="flex items-center gap-2 px-6 py-3 bg-island-emerald/5 text-island-emerald rounded-xl font-bold text-xs hover:bg-island-emerald/10 transition-all"
                    >
                      <CheckCircle2 size="16" /> Approve
                    </button>
                    <button
                      onClick={() => handleModerate(review.id!, false)}
                      className="flex items-center gap-2 px-6 py-3 bg-island-coral/5 text-island-coral rounded-xl font-bold text-xs hover:bg-island-coral/10 transition-all"
                    >
                      <XCircle size="16" /> Reject
                    </button>
                  </>
                )}
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                  <input
                    value={replyText[review.id!] || ''}
                    onChange={(e) => setReplyText(prev => ({ ...prev, [review.id!]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm w-48 focus:ring-4 focus:ring-island-emerald/5"
                  />
                  <button
                    onClick={() => handleReply(review.id!)}
                    disabled={!replyText[review.id!]?.trim()}
                    className="px-4 py-3 bg-island-emerald text-white rounded-xl font-bold text-xs hover:bg-island-emerald/90 transition-all disabled:opacity-50"
                  >
                    <Reply size="16" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

import { motion } from 'motion/react';
import { Star, MessageSquare, Reply, ThumbsUp, Search, Filter, ChevronRight, User } from 'lucide-react';

const reviews = [
  { id: 1, user: 'John Doe', rating: 5, date: 'Oct 24, 2026', comment: 'Amazing experience! The resort was beautiful and the staff were so helpful. Highly recommend the volcano hike.', service: 'Deluxe Suite', avatar: 'JD' },
  { id: 2, user: 'Jane Smith', rating: 4, date: 'Oct 22, 2026', comment: 'Great stay, but the Wi-Fi could be better in the mountain view rooms. The diving tour was the highlight of my trip.', service: 'Standard Room', avatar: 'JS' },
  { id: 3, user: 'Mike Ross', rating: 5, date: 'Oct 20, 2026', comment: 'The island hopping tour was perfectly organized. Saw so many turtles!', service: 'Island Hopping', avatar: 'MR' },
  { id: 4, user: 'Sarah Connor', rating: 3, date: 'Oct 18, 2026', comment: 'The room was clean but a bit noisy due to construction nearby. Hopefully it will be finished soon.', service: 'Standard Room', avatar: 'SC' },
];

export default function ReviewsModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter size={20} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-island-sunset font-bold">
              <Star size={20} className="fill-island-sunset" />
              <span className="text-2xl">4.8</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Rating</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review, idx) => (
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
                  {review.avatar}
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-island-green">{review.user}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{review.service} • {review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={`${i < review.rating ? 'text-island-sunset fill-island-sunset' : 'text-slate-100'}`} 
                  />
                ))}
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed font-light text-lg mb-8">"{review.comment}"</p>
            
            <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
              <button className="flex items-center gap-2 px-6 py-3 bg-island-emerald/5 text-island-emerald rounded-xl font-bold text-xs hover:bg-island-emerald/10 transition-all">
                <Reply size={16} /> Reply to Review
              </button>
              <button className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-island-emerald rounded-xl font-bold text-xs transition-all">
                <ThumbsUp size={16} /> Helpful (12)
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

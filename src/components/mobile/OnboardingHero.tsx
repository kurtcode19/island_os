import { motion } from 'motion/react';
import { ArrowLeft } from '@phosphor-icons/react';

interface OnboardingHeroProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  onExplore: () => void;
  onBack?: () => void;
}

export function OnboardingHero({ imageUrl, title, subtitle, onExplore, onBack }: OnboardingHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,68,62,0.7)] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 px-6 pb-12 space-y-6">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-3"
        >
          <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-white/90 text-[10px] font-bold uppercase tracking-[0.3em]">
            Explore
          </span>
          <h1 className="text-[34px] font-black text-white tracking-tighter leading-[0.95]">
            {title}
          </h1>
          <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[85%]">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button
            onClick={onExplore}
            aria-label="Get started"
            className="flex-1 h-14 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white font-black rounded-[28px] text-sm shadow-lg active:scale-95 transition-all"
          >
            Explore Now
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

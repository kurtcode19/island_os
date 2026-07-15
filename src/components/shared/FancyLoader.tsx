import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i * 30) * Math.PI / 180,
  size: 3 + (i % 3) * 2,
  delay: i * 0.15,
}));

const RINGS = [
  { size: 160, border: 2, opacity: 0.15, speed: 25 },
  { size: 130, border: 1.5, opacity: 0.1, speed: 35 },
  { size: 190, border: 1, opacity: 0.08, speed: 20 },
];

interface FancyLoaderProps {
  quote?: string;
  subtitle?: string;
}

export default function FancyLoader({ quote, subtitle = 'Loading' }: FancyLoaderProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const EMOJIS = ['🌴', '🏝️', '🌊', '☀️', '🌺', '🐠', '🦋', '🌅'];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setQuoteIndex(prev => prev + 1);
      setEmojiIndex(prev => (prev + 1) % EMOJIS.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
      {/* animation canvas */}
      <div className="relative w-[200px] h-[200px] mb-10 flex items-center justify-center">
        {/* orbiting particles */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-400"
            style={{
              width: p.size,
              height: p.size,
              opacity: 0.5,
            }}
            animate={{
              rotate: [0, 360],
              x: [0, Math.cos(p.angle) * 70, 0],
              y: [0, Math.sin(p.angle) * 70, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}

        {/* rotating rings */}
        {RINGS.map((ring, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-emerald-500"
            style={{ width: ring.size, height: ring.size, borderWidth: ring.border, opacity: ring.opacity }}
            animate={{ rotate: 360 }}
            transition={{ duration: ring.speed, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* inner pulse */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              '0 0 30px rgba(16,185,129,0.3)',
              '0 0 60px rgba(16,185,129,0.5)',
              '0 0 30px rgba(16,185,129,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={emojiIndex}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                {EMOJIS[emojiIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        </motion.div>
      </div>

      {/* subtitle */}
      <motion.p
        className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] mb-3"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {subtitle}
      </motion.p>

      {/* quote */}
      {quote && (
        <motion.p
          key={quoteIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm text-stone-400 font-medium italic leading-relaxed max-w-xs"
        >
          &ldquo;{quote}&rdquo;
        </motion.p>
      )}

      {/* progress bar */}
      <div className="w-full max-w-[200px] h-1.5 bg-stone-100 rounded-full overflow-hidden mt-8 border border-stone-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

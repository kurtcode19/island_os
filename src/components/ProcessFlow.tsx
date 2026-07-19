import { useState } from 'react';
import { motion } from 'motion/react';
import type { FlowStep } from '../data/processFlow';

interface ProcessFlowProps {
  steps: FlowStep[];
  variant?: 'teaser' | 'full';
}

function StepCard({ step, index, isLast, variant }: { step: FlowStep; index: number; isLast: boolean; variant?: 'teaser' | 'full' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex flex-col items-center text-center relative flex-1"
    >
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-[1.75rem] ${variant === 'teaser' ? 'bg-island-volcanic' : `bg-gradient-to-br ${step.gradient}`} flex items-center justify-center text-white shadow-xl shadow-black/10 relative z-10`}>
          <step.icon size={32} strokeWidth={2.5} />
        </div>
        {!isLast && (
          <div className="hidden sm:block absolute left-20 top-1/2 w-[calc(100%-1rem)] h-0.5">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
              className={`h-full origin-left ${variant === 'teaser' ? 'bg-gradient-to-r from-black/20 to-transparent' : 'bg-gradient-to-r from-island-emerald/40 to-island-emerald/10'}`}
              style={{ transformOrigin: 'left' }}
            />
          </div>
        )}
      </div>
      <h3 className="text-lg font-black text-island-volcanic tracking-tight mb-2">{step.title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[200px]">{step.description}</p>
    </motion.div>
  );
}

export function ProcessFlow({ steps, variant = 'full' }: ProcessFlowProps) {
  const isTeaser = variant === 'teaser';

  return (
    <div className={`grid ${isTeaser ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-4'} gap-8 md:gap-12`}>
      {steps.map((step, idx) => (
        <StepCard key={idx} step={step} index={idx} isLast={idx === steps.length - 1} variant={variant} />
      ))}
    </div>
  );
}

export function CompactProcessFlow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="flex items-start gap-6"
        >
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <step.icon size={24} strokeWidth={2.5} />
            </div>
            {idx < steps.length - 1 && (
              <div className="w-0.5 h-8 bg-gradient-to-b from-island-emerald/30 to-transparent mt-2" />
            )}
          </div>
          <div className="pt-2">
            <h3 className="text-base font-black text-island-volcanic tracking-tight mb-1">{step.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

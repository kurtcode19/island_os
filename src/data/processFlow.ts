import { UilSearch, UilCalendar, UilCreditCard, UilStar, UilMessage, UilBrain, UilMapMarker } from '@/icons';

export interface FlowStep {
  icon: any;
  title: string;
  description: string;
  gradient: string;
}

export interface ProcessFlowData {
  id: string;
  label: string;
  title: string;
  description: string;
  steps: FlowStep[];
}

export const bookingFlow: ProcessFlowData = {
  id: 'booking',
  label: 'Book an Experience',
  title: 'Your journey starts here.',
  description: 'From discovery to exploration in four simple steps.',
  steps: [
    {
      icon: UilSearch,
      title: 'Discover',
      description: 'Browse verified destinations, stays, and experiences across Catarman.',
      gradient: 'from-island-emerald to-emerald-600',
    },
    {
      icon: UilCalendar,
      title: 'Book',
      description: 'Select your dates and reserve your spot with a single click.',
      gradient: 'from-island-ocean to-cyan-600',
    },
    {
      icon: UilCreditCard,
      title: 'Pay',
      description: 'Complete your booking securely. Your pass is activated instantly.',
      gradient: 'from-island-sunset to-amber-600',
    },
    {
      icon: UilStar,
      title: 'Explore',
      description: 'Show your digital pass at any entry point and enjoy Catarman.',
      gradient: 'from-island-coral to-rose-600',
    },
  ],
};

export const tripPlannerFlow: ProcessFlowData = {
  id: 'planner',
  label: 'Plan with AI',
  title: 'Let AI build your perfect trip.',
  description: 'Answer a few questions and get a personalized itinerary in seconds.',
  steps: [
    {
      icon: UilMessage,
      title: 'Tell us your preferences',
      description: 'Duration, group size, budget, and interests — we\'ll handle the rest.',
      gradient: 'from-island-emerald to-emerald-600',
    },
    {
      icon: UilBrain,
      title: 'AI generates your itinerary',
      description: 'Our Catarman AI creates a day-by-day plan with activities and transport.',
      gradient: 'from-island-ocean to-cyan-600',
    },
    {
      icon: UilMapMarker,
      title: 'Sync and explore',
      description: 'Book activities directly from your itinerary and start your adventure.',
      gradient: 'from-island-sunset to-amber-600',
    },
  ],
};

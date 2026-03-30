import { motion } from 'motion/react';
import IslandMap from '../components/IslandMap';

export default function LocationsView() {
  return (
    <div className="min-h-screen bg-island-cream">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-80px)] w-full"
      >
        <IslandMap />
      </motion.div>
    </div>
  );
}

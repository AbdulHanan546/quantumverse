import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface ShortAnimationProps {
  title: string;
  gif: string;
  description: string;
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function ShortAnimation({ title, gif, description, onNext }: ShortAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-[#0a0a0f]/70 to-[#141422]/70 rounded-2xl p-4 md:p-6 border border-purple-500/30 backdrop-blur-xl shadow-xl max-w-3xl mx-auto space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="bg-purple-500/20 p-2 rounded-lg"
        >
          <Play className="w-6 h-6 text-purple-300" />
        </motion.div>
        <h3 className="text-xl md:text-2xl font-bold text-purple-200 drop-shadow-md">{title}</h3>
      </div>

      {/* GIF */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900/50 aspect-video border border-purple-500/30 shadow-inner">
        <ImageWithFallback
          src={gif}
          alt={title}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 right-2 bg-purple-500/80 px-2 py-0.5 rounded-full text-xs font-semibold">
          <span className="text-white">ANIMATION</span>
        </div>
      </div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-sm md:text-base text-purple-200 leading-relaxed"
      >
        {description}
      </motion.p>

      {/* Tap to Continue Text */}
      {onNext && (
        <motion.div
          className="flex justify-center mt-2 text-purple-300 text-sm font-semibold cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation(); // ensure only this triggers onNext
            onNext();
          }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to Continue
        </motion.div>
      )}
    </motion.div>
  );
}

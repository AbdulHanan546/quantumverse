import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { calculateReadingTime } from '../../utils/timeCalculation';
import ProgressBar from '../ProgressBar';

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

export default function ShortAnimation({ 
  title, 
  gif, 
  description, 
  onNext,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: ShortAnimationProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Calculate total duration
  const totalDuration = calculateReadingTime({
    text: `${title} ${description}`,
    componentType: "ShortAnimation",
  });

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || isPaused || elapsedTime >= totalDuration) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 50;
        if (next >= totalDuration) {
          setShowContinueButton(true);
          return totalDuration;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, elapsedTime, totalDuration]);

  const handleTap = () => {
    if (autoPlay) {
      togglePause?.();
    } else {
      onNext?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`bg-gradient-to-br from-[#0a0a0f]/70 to-[#141422]/70 rounded-2xl border border-purple-500/30 backdrop-blur-xl shadow-xl max-w-3xl mx-auto space-y-4 ${marginX} ${marginY}`}
      onClick={handleTap}
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
      {!autoPlay && onNext && (
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

      {/* Pause indicator */}
      {autoPlay && isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-full p-6 border border-white/20"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </motion.div>
        </div>
      )}

      {/* Progress bar for autoPlay mode */}
      {autoPlay && (
        <ProgressBar
          duration={totalDuration}
          isActive={true}
          isPaused={isPaused}
          elapsedTime={elapsedTime}
        />
      )}

      {/* Continue button when progress completes */}
      {autoPlay && showContinueButton && (
        <motion.button
          data-continue="true"
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="absolute right-6 bottom-6 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue
        </motion.button>
      )}
    </motion.div>
  );
}

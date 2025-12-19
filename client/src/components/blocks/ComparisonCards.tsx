import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface ComparisonItem {
  label: string;
  image: string;
  description: string;
}

interface ComparisonCardsProps {
  title: string;
  left: ComparisonItem;
  right: ComparisonItem;
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function ComparisonCards({ 
  title, 
  left, 
  right, 
  onNext,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: ComparisonCardsProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Calculate total duration
  const totalDuration = calculateReadingTime({
    text: `${title} ${left.label} ${left.description} ${right.label} ${right.description}`,
    componentType: "ComparisonCards",
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
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
        className={`
    relative
    w-full
    h-full
    flex
    flex-col
    justify-start
    pt-16
    space-y-10 ${marginX} ${marginY}
  `}

      onClick={handleTap}
    >
      {/* Title */}
      <h3 className="text-3xl md:text-4xl text-cyan-200 text-center font-bold drop-shadow-md tracking-wide">
        {title}
      </h3>

      {/* Cards Wrapper */}
      <div className="grid md:grid-cols-2 gap-10 items-stretch relative">
        {/* Left Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative rounded-2xl p-6 backdrop-blur-xl 
          bg-gradient-to-br from-[#1f1b33]/70 to-[#291f4a]/60 
          border border-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,0.25)] 
          hover:shadow-[0_0_35px_rgba(34,211,238,0.45)] 
          transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black/40 shadow-inner">
            <ImageWithFallback
              src={left.image}
              alt={left.label}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="text-xl text-cyan-200 mb-2 font-semibold drop-shadow-sm">
            {left.label}
          </h4>

          <p className="text-slate-300 leading-relaxed">{left.description}</p>

          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.03, 0.1, 0.03] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              background: "linear-gradient(to bottom right, transparent 0%, rgba(255,255,255,0.12) 100%)",
            }}
          />
        </motion.div>

        {/* Right Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative rounded-2xl p-6 backdrop-blur-xl 
          bg-gradient-to-br from-[#291f4a]/60 to-[#1f1b33]/70
          border border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]
          hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]
          transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black/40 shadow-inner">
            <ImageWithFallback
              src={right.image}
              alt={right.label}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="text-xl text-purple-200 mb-2 font-semibold drop-shadow-sm">
            {right.label}
          </h4>

          <p className="text-purple-200/90 leading-relaxed">
            {right.description}
          </p>

          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.03, 0.1, 0.03] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              background: "linear-gradient(to bottom right, transparent 0%, rgba(255,255,255,0.12) 100%)",
            }}
          />
        </motion.div>
      </div>

     {/* Tap to Continue Text */}
{!autoPlay && onNext && (
  <motion.div
    className="flex justify-center mt-6 text-cyan-300 text-sm font-semibold cursor-pointer select-none"
    onClick={onNext}
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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoPlay } from "../../hooks/useAutoPlay";
import { calculateReadingTime } from "../../utils/timeCalculation";

interface TrueFalseProps {
  statement: string;
  isTrue: boolean;
  negativeReason?: string;
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function TrueFalse({
  statement,
  isTrue,
  negativeReason,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: TrueFalseProps) {
  const [selected, setSelected] = useState<null | boolean>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  // Disable global taps when component mounts
  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleSelect = (val: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected !== null) return;
    setSelected(val);
    setShowFeedback(true);
    setTimeout(() => setShowTapHint(true), 1000);
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (showFeedback && !completed) {
      setCompleted(true);
      enableGlobalTap?.();
      onNext?.();
    }
  };

  const correct = selected === isTrue;
  const feedbackColor = correct ? "bg-green-600" : "bg-red-600";

  return (
    <div
      className={`relative w-full h-screen flex flex-col justify-center items-center 
      text-white bg-gradient-to-b from-[#0a0a0f] via-[#0d0d18] to-[#12122a] cursor-pointer select-none ${marginX} ${marginY}`}
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Question */}
      <motion.h2
        className="text-3xl font-semibold mb-12 text-center text-purple-300 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {statement}
      </motion.h2>

      {/* Options */}
      <div className="flex gap-10 z-10">
        {["True", "False"].map((label) => {
          const val = label === "True";
          const isSelected = selected === val;

          return (
            <motion.div
              key={label}
              className={`rounded-2xl w-40 h-20 flex justify-center items-center text-xl font-semibold cursor-pointer transition-all duration-300 ${
                selected
                  ? isSelected
                    ? feedbackColor
                    : "bg-[#1a1a2a] opacity-60"
                  : "bg-[#1a1a2a] hover:bg-[#22223b]"
              }`}
              whileHover={{ scale: selected ? 1 : 1.05 }}
              onClick={(e) => handleSelect(val, e)}
            >
              {label}
            </motion.div>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            key="feedback"
            className="mt-8 text-center max-w-md text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {selected === isTrue ? (
              <p className="text-green-400 font-medium">Correct! 🎉</p>
            ) : (
              <div>
                <p className="text-red-400 font-medium mb-2">Not quite.</p>
                {negativeReason && (
                  <p className="text-gray-300 text-base">{negativeReason}</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      {showTapHint && (
        <motion.div
          className="absolute bottom-10 text-sm text-gray-400 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue
        </motion.div>
      )}
    </div>
  );
}

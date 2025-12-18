import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoPlay } from "../../hooks/useAutoPlay";
import { calculateReadingTime } from "../../utils/timeCalculation";

interface Option {
  option: string;
  reason: string;
}

interface MCQProps {
  question: string;
  a: Option;
  b: Option;
  c: Option;
  d: Option;
  correctOption: "a" | "b" | "c" | "d";
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function MCQ({
  question,
  a,
  b,
  c,
  d,
  correctOption,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: MCQProps) {
  const [selected, setSelected] = useState<"a" | "b" | "c" | "d" | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  const options: Record<"a" | "b" | "c" | "d", Option> = { a, b, c, d };

  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleSelect = (key: "a" | "b" | "c" | "d") => {
    if (selected) return; // prevent multiple selections
    setSelected(key);
    setShowReason(true);
    setTimeout(() => setShowTapHint(true), 1200);
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    // only allow advancing once question is complete
    if (showReason && selected && !completed) {
      setCompleted(true);
      enableGlobalTap?.();
      onNext?.();
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center text-white 
      bg-gradient-to-b from-[#0a0a0f] via-[#0d0d18] to-[#12122a] px-6 select-none overflow-hidden cursor-pointer"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Title */}
      <motion.h2
        className="text-3xl font-semibold mb-10 text-center text-indigo-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {question}
      </motion.h2>

      {/* Options */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-2xl relative z-10">
        {(Object.entries(options) as [keyof typeof options, Option][]).map(([key, value]) => {
          const isCorrect = key === correctOption;
          const isSelected = selected === key;

          const bg = isSelected
            ? isCorrect
              ? "bg-green-600"
              : "bg-red-600"
            : "bg-[#1a1a2a] hover:bg-[#22223b]";

          return (
            <motion.div
              key={key}
              className={`rounded-xl py-4 px-6 text-lg cursor-pointer transition-all duration-300 ${bg}`}
              whileHover={{ scale: selected ? 1 : 1.03 }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(key);
              }}
            >
              {value?.option}
            </motion.div>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showReason && selected && (
          <motion.div
            key="reason"
            className="mt-6 text-center text-gray-300 max-w-lg text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {options[selected]?.reason}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap hint after reason */}
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

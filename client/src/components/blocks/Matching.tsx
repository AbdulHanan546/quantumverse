import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MatchOption {
  left: string;
  right: string;
}

interface MatchingProps {
  statement: string;
  illustration?: string;
  options: MatchOption[];
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function Matching({
  statement,
  illustration,
  options,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
}: MatchingProps) {
  const shuffledLeft = [...options].map((o) => o.left);
  const shuffledRight = [...options].map((o) => o.right).sort(() => Math.random() - 0.5);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ left: string; right: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  // Disable global tap during matching
  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleLeftSelect = (left: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (showResults) return;
    setSelectedLeft(left);
  };

  const handleRightSelect = (right: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedLeft || showResults) return;

    // prevent duplicate matching
    if (matches.find((m) => m.left === selectedLeft || m.right === right)) return;

    const newMatch = { left: selectedLeft, right };
    setMatches((prev) => [...prev, newMatch]);
    setSelectedLeft(null);
  };

  const isCorrect = (pair: { left: string; right: string }) =>
    options.some((opt) => opt.left === pair.left && opt.right === pair.right);

  // When all matched, show result and unlock after tap
  useEffect(() => {
    if (matches.length === options.length && !showResults) {
      setShowResults(true);
      setTimeout(() => setShowTapHint(true), 1200);
    }
  }, [matches, options.length, showResults]);

  const handleTapContinue = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (showResults) {
      enableGlobalTap?.();
      onNext?.();
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center 
      bg-gradient-to-b from-[#0a0a0f] via-[#0e0e18] to-[#121225] text-white px-8 select-none cursor-pointer"
      onClick={handleTapContinue}
      onTouchStart={handleTapContinue}
    >
      {illustration && (
        <motion.img
          src={illustration}
          alt="Illustration"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        />
      )}

      {/* Statement */}
      <motion.h2
        className="text-3xl font-semibold text-blue-300 mb-12 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {statement}
      </motion.h2>

      {/* Matching Columns */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl z-10">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {shuffledLeft.map((left) => {
            const isSelected = selectedLeft === left;
            const matched = matches.find((m) => m.left === left);

            let bg = "bg-[#1a1a2a]";
            if (isSelected) bg = "bg-blue-700";
            if (matched) bg = "bg-[#222240] opacity-70";

            return (
              <motion.div
                key={left}
                className={`py-4 px-6 rounded-xl text-lg cursor-pointer transition-all ${bg}`}
                whileHover={{ scale: matched || showResults ? 1 : 1.03 }}
                onClick={(e) => handleLeftSelect(left, e)}
              >
                {left}
              </motion.div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {shuffledRight.map((right) => {
            const matched = matches.find((m) => m.right === right);
            let bg = "bg-[#1a1a2a]";
            if (matched) {
              bg = showResults
                ? isCorrect(matched)
                  ? "bg-green-600"
                  : "bg-red-600"
                : "bg-[#222240] opacity-70";
            }

            return (
              <motion.div
                key={right}
                className={`py-4 px-6 rounded-xl text-lg cursor-pointer transition-all ${bg}`}
                whileHover={{ scale: matched || showResults ? 1 : 1.03 }}
                onClick={(e) => handleRightSelect(right, e)}
              >
                {right}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Result Message */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            key="results"
            className="mt-12 text-center text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gray-300">
              Matching complete! Review your answers below.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap Hint */}
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

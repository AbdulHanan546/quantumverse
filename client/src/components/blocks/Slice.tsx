import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface SliceProps {
  title: string;
  content: string;
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function Slice({
  title,
  content,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: SliceProps) {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Calculate total duration based on all lines
  const totalDuration = calculateReadingTime({
    text: content,
    componentType: "Slice",
    itemCount: lines.length,
  });

  // Time per line
  const timePerLine = totalDuration / Math.max(lines.length, 1);

  // Derive focusIndex and visibleLines from elapsedTime
  const focusIndex = Math.floor(elapsedTime / timePerLine);
  const visibleLines = Math.min(Math.max(focusIndex + 2, 2), lines.length);

  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  // Auto-play timer: continuous elapsed time for whole component
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

  const handleTap = (e: React.PointerEvent) => {
    e.stopPropagation();

    if (autoPlay) {
      const targetEl = e.target as HTMLElement;
      if (targetEl && targetEl.closest('[data-continue="true"]')) {
        return; // let the button handler manage
      }
      togglePause?.();
      return;
    }

    // Manual mode: advance through lines
    if (focusIndex < lines.length - 1) {
      setElapsedTime((prev) => prev + timePerLine);
    } else {
      enableGlobalTap?.();
      onNext?.();
    }
  };

  // tap hint - only show in manual mode
  useEffect(() => {
    if (autoPlay) return;
    const t = setTimeout(() => setShowTapHint(true), 1000);
    return () => clearTimeout(t);
  }, [autoPlay]);

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center text-center text-white select-none overflow-hidden cursor-pointer"
      data-child-interactive="true"
      onPointerDown={(e) => {
        e.stopPropagation();
        handleTap(e);
      }}
    >
      {/* 🎨 Background (same as Heading) */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="w-full h-full bg-gradient-to-b from-[#0a0a0f] via-[#0d0d18] to-[#12122a]" />
      </motion.div>

      {/* 🧭 Content */}
      <div className={`relative z-10 max-w-4xl ${marginX} flex flex-col items-center`}>
        {/* Title */}
        <motion.h2
          className="text-4xl font-bold text-indigo-300 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {title}
        </motion.h2>

        {/* Lines with focus transitions */}
        <div className="space-y-6 w-full text-center">
          <AnimatePresence mode="sync">
            {lines.slice(0, visibleLines).map((line, i) => {
              const isFocused = i === focusIndex;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: isFocused ? 1 : 0.4,
                    y: 0,
                    scale: isFocused ? 1.1 : 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`${
                    isFocused
                      ? "text-3xl text-white font-semibold"
                      : "text-2xl text-gray-400 font-light"
                  } leading-relaxed`}
                >
                  <ReactMarkdown>{line}</ReactMarkdown>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Tap hint */}
      {showTapHint && !autoPlay && (
        <motion.div
          className="absolute bottom-10 text-sm text-gray-400 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue
        </motion.div>
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

      {/* Continue button when progress completes */}
      {autoPlay && showContinueButton && (
        <motion.button
          data-continue="true"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="absolute right-6 bottom-6 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

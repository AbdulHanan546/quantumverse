import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface HeadingProps {
  title: string;
  description: string;
  background: string;
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function Heading({
  title,
  description,
  background,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: HeadingProps) {
  const lines = (description ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const [phase, setPhase] = useState<"title" | "description">("title");
  const [lineIndex, setLineIndex] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Calculate reading times using algorithm
  const titleTime = calculateReadingTime({ text: title, componentType: "Heading" });
  const descriptionText = lines.join(" ");
  const descriptionTime = calculateReadingTime({ 
    text: descriptionText, 
    componentType: "Heading" 
  });
  const timePerLine = lines.length > 0 ? descriptionTime / lines.length : descriptionTime;
  const totalDuration = titleTime + descriptionTime;

  // Reset elapsed time when component mounts
  useEffect(() => {
    setElapsedTime(0);
    setShowContinueButton(false);
  }, []);

  // Handle global tap control
  useEffect(() => {
    if (autoPlay) {
      // In autoPlay: enable global tap for pause/resume
      enableGlobalTap?.();
    } else {
      // In manual mode: disable global tap, we handle it locally
      disableGlobalTap?.();
    }
    return () => enableGlobalTap?.();
  }, [autoPlay, disableGlobalTap, enableGlobalTap]);

  // Auto-advance in autoPlay mode with pause support
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 50;
        // Show continue button when progress completes
        if (newTime >= totalDuration) {
          setShowContinueButton(true);
        }
        return newTime;
      });
    }, 50);

    if (phase === "title") {
      const timer = setTimeout(() => setPhase("description"), titleTime);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    if (phase === "description" && lineIndex < lines.length - 1) {
      const timer = setTimeout(() => setLineIndex((i) => i + 1), timePerLine);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    if (phase === "description" && lineIndex === lines.length - 1) {
      // Last line - don't auto-advance, wait for user to click continue button
      return () => clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, phase, lineIndex, lines.length, titleTime, timePerLine, onNext]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    // In autoPlay mode, toggle pause/resume
    if (autoPlay) {
      togglePause();
      return;
    }

    // Manual mode only
    if (phase === "title") {
      setPhase("description");
      setShowTapHint(false);
      return;
    }

    if (lineIndex < lines.length - 1) {
      setLineIndex((prev) => prev + 1);
    } else {
      enableGlobalTap?.();
      onNext?.();
    }
  };

  // Subtle "tap" hint for first phase (manual mode only)
  useEffect(() => {
    if (!autoPlay && phase === "title") {
      const t = setTimeout(() => setShowTapHint(true), 1000);
      return () => clearTimeout(t);
    }
  }, [autoPlay, phase]);

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center text-center text-white select-none overflow-hidden"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* 🎨 Background image only during title phase */}
      <AnimatePresence>
        {phase === "title" && (
          <motion.div
            key="bg"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <img
              src={background}
              alt="background"
              className="w-full h-full object-cover brightness-[0.45] saturate-[1.3] blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/50 via-[#0d0d18]/70 to-[#12122a]/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 Content */}
      <div className={`relative z-10 max-w-4xl ${marginX}`}>
        <AnimatePresence mode="wait">
          {phase === "title" ? (
            <motion.h1
              key="title"
              className="text-6xl font-extrabold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1 }}
            >
              {title}
            </motion.h1>
          ) : (
            <motion.div
              key={lineIndex}
              className="text-3xl leading-relaxed text-gray-200 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <ReactMarkdown>{lines[lineIndex]}</ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap hint - manual mode only */}
      {showTapHint && !autoPlay && phase === "title" && (
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

      {/* Continue button when progress completes */}
      {autoPlay && showContinueButton && (
        <motion.button
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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface SliceProps {
  title: string;
  content: string; // markdown text split by lines
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
}

export default function Slice({
  title,
  content,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
}: SliceProps) {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  const [focusIndex, setFocusIndex] = useState(0); // which line is in focus
  const [visibleLines, setVisibleLines] = useState(2); // show 2 lines at a time
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    if (focusIndex < lines.length - 1) {
      // Shift focus and possibly reveal new line
      setFocusIndex((prev) => prev + 1);
      if (focusIndex + 2 > visibleLines && visibleLines < lines.length) {
        setVisibleLines((v) => v + 1);
      }
    } else {
      enableGlobalTap?.();
      onNext?.();
    }
  };

  // tap hint
  useEffect(() => {
    const t = setTimeout(() => setShowTapHint(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center text-center text-white select-none overflow-hidden cursor-pointer"
      onClick={handleTap}
      onTouchStart={handleTap}
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
      <div className="relative z-10 max-w-4xl px-8 flex flex-col items-center">
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

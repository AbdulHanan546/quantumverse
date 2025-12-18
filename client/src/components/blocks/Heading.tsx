import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

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
}: HeadingProps) {
  const lines = (description ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const [phase, setPhase] = useState<"title" | "description">("title");
  const [lineIndex, setLineIndex] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);

  // Disable global tap while local tap is active
  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

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

  // Subtle “tap” hint for first phase
  useEffect(() => {
    if (phase === "title") {
      const t = setTimeout(() => setShowTapHint(true), 1000);
      return () => clearTimeout(t);
    }
  }, [phase]);

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
      <div className="relative z-10 max-w-4xl px-8">
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

      {/* Tap hint */}
      {showTapHint && phase === "title" && (
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

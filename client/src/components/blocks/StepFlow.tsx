import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface StepFlowProps {
  title: string;
  steps: string[];
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
}

export default function StepFlow({
  title,
  steps,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
}: StepFlowProps) {
  const [visibleSteps, setVisibleSteps] = useState(1);
  const [showContinueHint, setShowContinueHint] = useState(false);

  // Track pointer movement to detect scrolling vs tapping
  const pointerStartY = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  // TAP HANDLER (pointer-based, not click)
  const handlePointerDown = (e: any) => {
    pointerStartY.current = e.clientY || e.touches?.[0]?.clientY || 0;
    moved.current = false;
  };

  const handlePointerMove = (e: any) => {
    const y = e.clientY || e.touches?.[0]?.clientY || 0;
    if (Math.abs(y - pointerStartY.current) > 10) moved.current = true; // scrolling happened
  };

  const handlePointerUp = () => {
    if (moved.current) return; // do NOT trigger tap on scroll

    // Reveal next step
    if (visibleSteps < steps.length) {
      setVisibleSteps(v => v + 1);
      return;
    }

    // All steps shown
    setShowContinueHint(false);
    enableGlobalTap?.();
    onNext?.();
  };

  useEffect(() => {
    if (visibleSteps === steps.length) {
      const t = setTimeout(() => setShowContinueHint(true), 800);
      return () => clearTimeout(t);
    }
  }, [visibleSteps]);

  return (
    <div
      className="relative w-full h-screen flex flex-col bg-gradient-to-b from-[#0a0a16] via-[#0f0f24] to-[#151530] text-white select-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Fixed Title */}
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 drop-shadow-xl p-6 z-10 sticky top-0 bg-[#0a0a16] text-center"
      >
        {title}
      </motion.h3>

      {/* Scrollable steps container */}
      <div className="relative flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-12">
        {/* Background pulse */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-indigo-700/20 via-transparent to-black"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Vertical timeline */}
        <motion.div
          className="absolute left-10 top-0 bottom-0 w-[3px] rounded-full hidden md:block bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {steps.map((step, i) => (
  <AnimatePresence key={i}>
    {i < visibleSteps && (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative flex items-start gap-6 pl-4 md:pl-20"
      >
        {/* Step Number (static now) */}
        <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_18px_rgba(99,102,241,0.7)] flex items-center justify-center text-xl font-bold text-white">
          {i + 1}
        </div>

        <motion.div
          className="flex-1 relative rounded-2xl p-6 bg-gradient-to-br from-[#1c1a33]/70 to-[#2a2347]/70 border border-purple-300/20 shadow-lg backdrop-blur-md"
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <p className="text-lg leading-relaxed text-gray-100 drop-shadow-md">{step}</p>
        </motion.div>

        {i < visibleSteps - 1 && (
          <motion.div
            className="absolute -bottom-6 left-16 hidden md:block"
            animate={{ opacity: [0.4, 1, 0.4], y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="w-6 h-6 text-cyan-400" />
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
))}

      </div>

      {showContinueHint && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-400 tracking-widest"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue
        </motion.div>
      )}
    </div>
  );
}

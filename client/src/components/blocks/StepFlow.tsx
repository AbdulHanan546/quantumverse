import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface StepFlowProps {
  title: string;
  steps: string[];
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function StepFlow({
  title,
  steps,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: StepFlowProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Track pointer movement to detect scrolling vs tapping
  const pointerStartY = useRef(0);
  const moved = useRef(false);

  // Ref for auto-scrolling to latest step
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const lastVisibleStepsRef = useRef(0);

  // Calculate total duration for all steps
  const totalDuration = calculateReadingTime({
    text: steps.join(" "),
    componentType: "StepFlow",
    itemCount: steps.length,
  });

  // Time per step
  const timePerStep = totalDuration / Math.max(steps.length, 1);

  // Derive visibleSteps from elapsedTime
  const visibleSteps = Math.min(Math.max(Math.floor(elapsedTime / timePerStep) + 1, autoPlay ? 0 : 1), steps.length);

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

  // Auto-scroll to latest visible step
  useEffect(() => {
    if (!autoPlay || !stepsContainerRef.current) return;

    if (visibleSteps > lastVisibleStepsRef.current) {
      lastVisibleStepsRef.current = visibleSteps;
      
      // Scroll to the newest step smoothly
      setTimeout(() => {
        const parent = stepsContainerRef.current?.parentElement;
        if (parent) {
          const stepElements = parent.querySelectorAll('[data-step-index]');
          const latestStep = stepElements[visibleSteps - 1];
          if (latestStep) {
            latestStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [visibleSteps, autoPlay]);

  // TAP HANDLER (pointer-based, not click)
  const handlePointerDown = (e: any) => {
    pointerStartY.current = e.clientY || e.touches?.[0]?.clientY || 0;
    moved.current = false;
  };

  const handlePointerMove = (e: any) => {
    const y = e.clientY || e.touches?.[0]?.clientY || 0;
    if (Math.abs(y - pointerStartY.current) > 10) moved.current = true; // scrolling happened
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (moved.current) return; // do NOT trigger tap on scroll

    if (autoPlay) {
      const targetEl = e.target as HTMLElement;
      if (targetEl && targetEl.closest('[data-continue="true"]')) {
        return; // let the button handler manage
      }
      togglePause?.();
      return;
    }

    // Manual mode: reveal next step
    if (visibleSteps < steps.length) {
      setElapsedTime((prev) => prev + timePerStep);
      return;
    }

    // All steps shown
    enableGlobalTap?.();
    onNext?.();
  };

  return (
    <div
      className={`relative w-full h-screen bg-gradient-to-b from-[#0a0a16] via-[#0f0f24] to-[#151530] flex flex-col text-white select-none overflow-hidden ${marginX} ${marginY}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Fixed Title */}
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 drop-shadow-xl p-6 z-20 flex-shrink-0 text-center"
      >
        {title}
      </motion.h3>

      {/* Scrollable steps container */}
      <div
        ref={stepsContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative w-full px-4 sm:px-8 py-8 space-y-12 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Background pulse */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-indigo-700/20 via-transparent to-black"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Vertical timeline */}
        <motion.div
          className="absolute left-10 top-0 w-[3px] rounded-full md:block bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"
          style={{ height: `${visibleSteps * 7.7}rem` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {steps.map((step, i) => (
          <AnimatePresence key={i}>
            {i < visibleSteps && (
              <motion.div
                data-step-index={i}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative flex items-start gap-6 pl-4 md:pl-20"
              >
                {/* Step Number */}
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

      {/* Tap hint in manual mode */}
      {!autoPlay && visibleSteps === steps.length && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-400 tracking-widest z-40"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {!autoPlay && "Tap to continue"}
        </motion.div>
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
    </div>
  );
}

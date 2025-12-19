import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";
import { useRef } from "react";

interface CharacterExpression {
  image?: string;
  emotionType?: string;
}

interface Character {
  name: string;
  expressions?: CharacterExpression[];
  image?: string; // Direct image URL from Strapi
}

interface Scene {
  dialogue: string;
  character?: Character;  // Resolved from Strapi
  emotion?: string;       // Scene emotion
  orientation?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  background?: string;    // Media URL
}

interface StoryProps {
  scenes: Scene[];
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function Story({
  scenes,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: StoryProps) {
  const [index, setIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const current = scenes[index];
  const completedRef = useRef(false);

  // Calculate time for current scene
 const sceneDurations = scenes.map((scene) =>
  calculateReadingTime({
    text: scene.dialogue,
    hasImage: !!scene.background,
    componentType: "Story",
    itemCount: scenes.length,
  })
);

const totalDuration = sceneDurations.reduce((a, b) => a + b, 0);

  
 const accumulatedRef = useRef(0); // time already elapsed before current session



  // Auto-play timer with progress tracking
useEffect(() => {
  if (!autoPlay) return;

  let rafId: number;
  let start = performance.now();

  const tick = (now: number) => {
    const elapsedSinceStart = now - start;
    const totalElapsed = accumulatedRef.current + elapsedSinceStart;

    setElapsedTime(totalElapsed);

    let accumulated = 0;
    for (let i = 0; i < sceneDurations.length; i++) {
      accumulated += sceneDurations[i];
      if (totalElapsed < accumulated) {
        setIndex(i);
        break;
      }
    }

    if (totalElapsed >= totalDuration) {
      setElapsedTime(totalDuration);
      setShowContinueButton(true);
      completedRef.current = true;
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  if (!isPaused) {
    start = performance.now();
    rafId = requestAnimationFrame(tick);
  } else {
    // store elapsed when paused
    accumulatedRef.current = elapsedTime;
  }

  return () => cancelAnimationFrame(rafId);
}, [autoPlay, isPaused]);


  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleAnimationComplete = () => {
    enableGlobalTap?.();
  };

  const handleNext = (opts?: { force?: boolean }) => {
    const force = opts?.force;

    if (!force && autoPlay && isPaused) return; // if paused globally, don't auto-advance

    if (index < scenes.length - 1) {
      setIndex((i) => i + 1);
      disableGlobalTap?.();
    } else {
      onNext?.();
    }
  };

  // Handle tap/click
  const handleInteraction = (e?: React.PointerEvent) => {
    if (autoPlay) {
      // If Continue button is visible and target is the button, do not toggle pause
      const targetEl = (e?.target as HTMLElement) || null;
      if (showContinueButton && targetEl && targetEl.closest('[data-continue="true"]')) {
        return;
      }
      togglePause?.();
    } else {
      handleNext();
    }
  };

 const handleContinue = (e: React.MouseEvent) => {
  e.stopPropagation();
  completedRef.current = false;
  setShowContinueButton(false);
  onNext?.(); // move to next TopicRenderer component
};


  const getCharacterPosition = (orientation?: string) => {
    switch (orientation) {
      case "top-left":
        return "top-10 left-10";
      case "top-right":
        return "top-10 right-10";
      case "bottom-left":
        return "bottom-10 left-10";
      case "bottom-right":
      default:
        return "bottom-10 right-10";
    }
  };

  const normalizedOrientation = current.orientation
    ?.toLowerCase()
    .replace(" ", "-") as
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

  // Pick character image based on scene emotion or fallback to first expression
  const getCharacterImage = (char?: Character, emotion?: string) => {
    if (!char) return undefined;

    // 1) If Strapi gives a direct image, use it
    if (char.image) return char.image;

    // 2) Old system: expressions array
    if (char.expressions?.length) {
      return (
        char.expressions.find((exp) => exp.emotionType === emotion)?.image ||
        char.expressions[0].image
      );
    }

    return undefined;
  };

  const characterImage = getCharacterImage(current.character, current.emotion);

  return (
    <div
      className="relative w-full h-screen overflow-hidden text-white select-none"
      data-child-interactive="true"
      onPointerDown={(e) => {
        e.stopPropagation();
        handleInteraction(e);
      }}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        {current.background && (
          <motion.div
            key={current.background + index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${current.background})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />

      {/* Character */}
      {characterImage && (
        <motion.img
          key={characterImage + index}
          src={characterImage}
          alt={current.character?.name || "Character"}
          className={`absolute w-64 h-auto object-contain ${getCharacterPosition(
            normalizedOrientation
          )}`}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Dialogue box */}
      <div className={`absolute bottom-10 w-full ${marginX} flex justify-center`}>
        <motion.div
          key={index}
          className="bg-black/40 backdrop-blur-md rounded-2xl p-6 max-w-3xl border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={handleAnimationComplete}
        >
          <h4 className="text-xl font-semibold text-purple-300 mb-2">
            {current.character?.name}
            {current.emotion && (
              <span className="ml-2 text-sm text-gray-400">({current.emotion})</span>
            )}
          </h4>
          <div className="text-lg leading-relaxed text-gray-200">
            <ReactMarkdown>{current.dialogue}</ReactMarkdown>
          </div>
        </motion.div>
      </div>

      {/* Pause indicator in auto-play */}
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
  elapsedTime={elapsedTime}
  isActive={autoPlay}
  isPaused={isPaused}
/>

      )}

      {/* Continue button when progress completes */}
      {autoPlay && showContinueButton && (
        <motion.button
          data-continue="true"
          onClick={handleContinue}
          onPointerDown={(e) => {
            // Prevent root handler from toggling pause before click
            e.stopPropagation();
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

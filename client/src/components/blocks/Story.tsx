import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAutoPlay } from "../../hooks/useAutoPlay";
import { calculateReadingTime } from "../../utils/timeCalculation";

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
  const [canTap, setCanTap] = useState(false);
  const current = scenes[index];

  // Calculate time for current scene
  const sceneTime = current
    ? calculateReadingTime({
        text: current.dialogue,
        hasImage: !!current.background,
        componentType: "Story",
        itemCount: 1,
      })
    : 3000;

  // Auto-play for current scene
  const { isPaused: _scenePausedState } = useAutoPlay({
    duration: sceneTime,
    enabled: autoPlay && !isPaused,
    onComplete: () => {
      handleNext();
    },
  });

  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleAnimationComplete = () => {
    setCanTap(true);
    enableGlobalTap?.();
  };

  const handleNext = () => {
    if (!canTap && autoPlay) return; // ignore early taps in auto-play
    if (autoPlay && isPaused) return; // if paused globally, don't auto-advance

    if (index < scenes.length - 1) {
      setIndex((i) => i + 1);
      setCanTap(false); // reset for next scene
      disableGlobalTap?.();
    } else {
      onNext?.();
    }
  };

  // Handle tap/click
  const handleInteraction = () => {
    if (autoPlay) {
      togglePause?.();
    } else {
      handleNext();
    }
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
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
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
    </div>
  );
}

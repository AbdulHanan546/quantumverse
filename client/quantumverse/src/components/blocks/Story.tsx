import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Scene {
  dialogue: string;
  character: {
    name: string;
    image?: string;
  };
  background: string;
  emotion?: string;
  orientation?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

interface StoryProps {
  scenes: Scene[];
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
}

export default function Story({
  scenes,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
}: StoryProps) {
  const [index, setIndex] = useState(0);
  const current = scenes[index];

 const [canTap, setCanTap] = useState(false);

const handleAnimationComplete = () => {
  // Only allow tap after background, character, and dialogue animations finish
  setCanTap(true);
  enableGlobalTap?.();
};

const handleNext = () => {
  if (!canTap) return; // ignore early taps

  if (index < scenes.length - 1) {
    setIndex(i => i + 1);
    setCanTap(false); // reset for next scene
    disableGlobalTap?.();
  } else {
    onNext?.();
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

  return (
    <div
      className="relative w-full h-screen overflow-hidden text-white select-none"
      onClick={handleNext}
      onTouchStart={handleNext}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.background}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${current.background})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />

      {/* Character */}
      {current.character?.image && (
        <motion.img
          key={current.character.image + index}
          src={current.character.image}
          alt={current.character.name}
          className={`absolute w-64 h-auto object-contain ${getCharacterPosition(
            current.orientation
          )}`}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Dialogue box */}
      <div className="absolute bottom-10 w-full px-8 flex justify-center">
       <motion.div
  key={index}
  className="bg-black/40 backdrop-blur-md rounded-2xl p-6 max-w-3xl border border-white/10 shadow-lg"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -40 }}
  transition={{ duration: 0.6 }}
  onAnimationComplete={handleAnimationComplete} // <-- here
>

          <h4 className="text-xl font-semibold text-purple-300 mb-2">
            {current.character.name}
            {current.emotion && (
              <span className="ml-2 text-sm text-gray-400">
               
              </span>
            )}
          </h4>
          <div className="text-lg leading-relaxed text-gray-200">
            <ReactMarkdown>{current.dialogue}</ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

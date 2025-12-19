import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface Character {
  name: string;
  expressions?: { image?: string; emotionType?: string }[];
  image?: string;
}

interface PointToPonderProps {
  point: string;
  character: Character;
  characterOrientation?: "left" | "right";
  characterEmotion?: "thinking" | "curious" | "sad" | "neutral" | "happy";
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function PointToPonder({
  point,
  character,
  characterOrientation = "right",
  characterEmotion,
  onNext,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: PointToPonderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const totalDuration = calculateReadingTime({
    text: point,
    componentType: "PointToPonder",
  });

  // Reset elapsed time and button state when component mounts
  useEffect(() => {
    setElapsedTime(0);
    setShowContinueButton(false);
  }, []);

  // Auto-play timer with progress tracking
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 50;
        if (newTime >= totalDuration) {
          setShowContinueButton(true);
        }
        return newTime;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, totalDuration]);
  
  const characterImage =
    character?.expressions?.find((exp) => exp?.emotionType === characterEmotion)?.image ||
    character.image ||
    character?.expressions?.[0]?.image;

  const isLeft = characterOrientation === "left";

  const handleTap = () => {
    if (autoPlay) {
      togglePause?.();
    } else {
      onNext?.();
    }
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext?.();
  };

  return (
    <div
      className={`relative w-full h-screen flex flex-col justify-end items-center 
        bg-gradient-to-b from-[#08080f] via-[#0d0d1a] to-[#141422]
        overflow-hidden text-white select-none ${marginX} ${marginY}`}
      data-child-interactive="true"
      onPointerDown={(e) => {
        e.stopPropagation();
        handleTap();
      }}
    >
      {/* Soft Background Glow Layers */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-800/20 via-transparent to-black"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a2e]/20 to-black/60"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Character Reserved Space (prevents overlap) */}
      <div className="relative w-full flex justify-center items-end h-[35vh] sm:h-[40vh] z-20">
        {characterImage && (
          <motion.img
            src={characterImage}
            alt={character?.name}
            className={`w-40 sm:w-48 md:w-56 lg:w-64 object-contain 
              ${isLeft ? "self-start ml-4 sm:ml-10" : "self-end mr-4 sm:mr-10"}`}
            initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.6 },
              x: { duration: 0.6 },
              y: { duration: 3, repeat: Infinity },
            }}
          />
        )}
      </div>

      {/* Dialogue Box */}
      <motion.div
        className="relative z-30 max-w-3xl w-full bg-white/10 backdrop-blur-xl 
          border border-white/10 rounded-2xl shadow-xl px-5 sm:px-8 py-6
          flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 drop-shadow">
          Point to Ponder 💡
        </h3>

        <h4 className="text-lg sm:text-xl text-purple-300 font-semibold">
          {character?.name}{" "}
          {characterEmotion && <span className="opacity-80">({characterEmotion})</span>}
        </h4>

        <p className="text-gray-200 text-base sm:text-lg md:text-xl leading-relaxed">
          {point}
        </p>
      </motion.div>

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
          onPointerDown={(e) => {
            // Prevent root handler from toggling pause before click
            e.stopPropagation();
          }}
          onClick={handleContinue}
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

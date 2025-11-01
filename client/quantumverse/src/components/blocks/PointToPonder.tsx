import { motion, AnimatePresence } from "framer-motion";

interface Character {
  name: string;
  image?: string;
  orientation?: "left" | "right" | "center";
}

interface PointToPonderProps {
  point: string;
  character: Character;
  characterEmotion?: "thinking" | "curious" | "sad" | "neutral" | "happy";
  onNext?: () => void;
}

export default function PointToPonder({ point, character, characterEmotion, onNext }: PointToPonderProps) {
  const orientation = character.orientation || "right";

  const getCharacterPosition = () => {
    switch (orientation) {
      case "left":
        return "bottom-0 left-10";
      case "center":
        return "bottom-0 left-1/2 -translate-x-1/2";
      case "right":
      default:
        return "bottom-0 right-10";
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-end items-center bg-gradient-to-b from-[#0a0a0f] to-[#141422] text-white overflow-hidden cursor-pointer select-none px-6 pb-20"
      onClick={onNext}
      onTouchStart={onNext}
    >
      {/* Animated Glow Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-900/30 via-transparent to-black"
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.9, 0.7] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {/* Character Image */}
      {character.image && (
        <motion.img
          key={character.image}
          src={character.image}
          alt={character.name}
          className={`absolute w-72 h-auto object-contain ${getCharacterPosition()}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />
      )}

      {/* Dialogue Box / Point */}
      <motion.div
        className="relative z-10 max-w-3xl bg-black/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Heading */}
        <h3 className="text-2xl font-bold text-yellow-400 mb-3">Point to Ponder 💡</h3>

        {/* Character Name + Emotion */}
        <h4 className="text-lg text-purple-300 font-semibold mb-2">
          {character.name}
          {characterEmotion && (
            <span className="ml-2 text-sm text-gray-400"></span>
          )}
        </h4>

        {/* Point Text */}
        <p className="text-gray-200 text-lg text-center">{point}</p>
      </motion.div>
    </div>
  );
}

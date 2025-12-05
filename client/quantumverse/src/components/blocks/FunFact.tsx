import { motion } from "framer-motion";

// Character type from Strapi
interface Character {
  name: string;
  description?: string;
  expressions?: { image?: string; emotionType?: string }[]; // from Emotion component
  image?: string; // frontend-only, mapped from expressions
}

interface FunFactProps {
  fact: string;
  illustration?: string; // media URL from Strapi
  character: Character; // must come fully populated from Strapi
  characterOrientation?: "left" | "right" | "center"; // frontend-only
  characterEmotion?: "happy" | "surprised" | "curious" | "neutral"; // optional
  characterDialogue?: string; // optional
  onNext?: () => void;
}

export default function FunFact({
  fact,
  illustration,
  character,
  characterOrientation = "right",
  characterEmotion,
  characterDialogue,
  onNext,
}: FunFactProps) {
  // Map character image from expressions if image not already provided
  const characterImage =
   // character.image ||
    character.expressions?.find((exp) => exp.emotionType === characterEmotion)
      ?.image ||
    character.expressions?.[0]?.image;

  const getCharacterPosition = () => {
    switch (characterOrientation) {
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
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#080812] to-[#111122] text-white flex flex-col justify-end cursor-pointer select-none px-6 pb-20"
      onClick={onNext}
      onTouchStart={onNext}
    >
      {/* Animated Glow Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-900/30 via-transparent to-black"
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* Illustration */}
      {illustration && (
        <motion.img
          src={illustration}
          alt="Fun Fact Illustration"
          className="w-64 h-64 object-contain mb-4 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Fact Box */}
      <motion.div
        className="relative z-10 max-w-3xl bg-black/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-2xl font-bold text-yellow-400 mb-3">Fun Fact 🌟</h3>

        {characterDialogue && (
          <h4 className="text-lg text-purple-300 font-semibold mb-2">
            {character.name} {characterEmotion && `(${characterEmotion})`}
          </h4>
        )}

        <p className="text-gray-200 text-lg text-center">{fact}</p>
      </motion.div>

      {/* Character Image */}
      {characterImage && (
        <motion.img
          key={characterImage}
          src={characterImage}
          alt={character.name}
          className={`absolute w-48 h-auto object-contain ${getCharacterPosition()} z-20`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      )}
    </div>
  );
}

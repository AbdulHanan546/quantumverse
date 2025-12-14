import { motion } from "framer-motion";

interface Character {
  name: string;
  expressions?: { image?: string; emotionType?: string }[];
  image?: string;
}

interface FunFactProps {
  fact: string;
  illustration?: string;
  character: Character;
  characterOrientation?: "left" | "right"; // screen side
  characterEmotion?: "happy" | "surprised" | "curious" | "neutral";
  characterDialogue?: string;
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
  const characterImage =
    character.image ||
    character?.expressions?.find((exp) => exp?.emotionType === characterEmotion)?.image ||
    character?.expressions?.[0]?.image;

  const getCharacterPosition = () => {
    return characterOrientation === "left"
      ? "absolute left-10 bottom-20"
      : "absolute right-10 bottom-20";
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-end items-center bg-gradient-to-b from-[#080812] to-[#111122] text-white cursor-pointer select-none px-6 pb-20"
      onClick={onNext}
      onTouchStart={onNext}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-900/30 via-transparent to-black"
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* Illustration (optional, above dialogue box) */}
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

      {/* Dialogue Box */}
      <motion.div
        className="relative z-10 max-w-3xl bg-black/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-2xl font-bold text-yellow-400 mb-3">Fun Fact 🌟</h3>

        {characterDialogue && (
          <h4 className="text-lg text-purple-300 font-semibold mb-2">
            {character?.name} 
          </h4>
        )}

        <p className="text-gray-200 text-lg text-center">{fact}</p>
      </motion.div>

      {/* Character floating to the side */}
      {characterImage && (
        <motion.img
          key={characterImage}
          src={characterImage}
          alt={character?.name}
          className={`${getCharacterPosition()} w-48 h-auto object-contain z-20`}
          initial={{ opacity: 0, x: characterOrientation === "left" ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}
    </div>
  );
}

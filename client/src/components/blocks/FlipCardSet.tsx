import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Card {
  front: string;
  back: string;
}

interface FlipCardSetProps {
  title: string;
  cards: Card[];
  onNext?: () => void; // called when user taps after all cards flipped
}

function FlipCard({
  front,
  back,
  isFlipped,
  onFlip,
}: {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bubbling
    onFlip();
  };

  return (
    <motion.div
      className="relative h-60 sm:h-72 md:h-80 perspective-1500 select-none cursor-pointer"
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0f0f24] via-[#151530] to-[#0a0a16] border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center justify-center shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] backdrop-blur-md"
          style={{ backfaceVisibility: "hidden" }}
        >
          <h4 className="text-xl sm:text-2xl font-semibold text-cyan-300 drop-shadow-md text-center">
            {front}
          </h4>
          <RotateCcw className="w-6 h-6 text-purple-300/60 mt-4" />
          <motion.div
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/5"
          />
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#12122a] via-[#1b1935] to-[#0a0a16] border border-blue-400/20 rounded-2xl p-6 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(96,165,250,0.3)] backdrop-blur-xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-blue-200 text-center text-lg sm:text-xl leading-relaxed drop-shadow-md">
            {back}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FlipCardSet({ title, cards, onNext }: FlipCardSetProps) {
  const [flippedStates, setFlippedStates] = useState<boolean[]>(() =>
    new Array(cards.length).fill(false)
  );
  const [allFlipped, setAllFlipped] = useState(false);

  const handleFlip = (index: number) => {
    setFlippedStates((prev) => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });
  };

  useEffect(() => {
    if (flippedStates.every((f) => f)) setAllFlipped(true);
  }, [flippedStates]);

  // Block tap until all cards flipped
  const handleGlobalTap = (e: React.MouseEvent) => {
    if (!allFlipped) {
      e.stopPropagation();
      return;
    }
    onNext?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="relative w-full min-h-screen flex flex-col items-center justify-start space-y-8 p-6 select-none
                   bg-gradient-to-b from-[#0a0a16] via-[#0f0f24] to-[#151530] overflow-hidden"
        onClick={handleGlobalTap}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.8 }}
      >
        {/* Cosmic pulse background */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-indigo-700/20 via-transparent to-black"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.03, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <h3 className="text-3xl md:text-4xl font-bold text-cyan-300 drop-shadow tracking-wide z-10">
          {title}
        </h3>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl z-10">
          {cards.map((card, idx) => (
            <FlipCard
              key={idx}
              front={card.front}
              back={card.back}
              isFlipped={flippedStates[idx]}
              onFlip={() => handleFlip(idx)}
            />
          ))}
        </div>

        {/* Hint appears only after all flipped */}
        <AnimatePresence>
          {allFlipped && (
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm text-gray-400 tracking-wider z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap anywhere to continue
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAutoPlay } from "../../hooks/useAutoPlay";
import { calculateReadingTime } from "../../utils/timeCalculation";

interface DiagramProps {
  illustration: string;
  text: string;
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function Diagram({
  illustration,
  text,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: DiagramProps) {
  // Calculate time for diagram
  const diagramTime = calculateReadingTime({
    text,
    hasImage: true,
    componentType: "Diagram",
  });

  // Auto-play hook
  const { isPaused: _diagramPausedState } = useAutoPlay({
    duration: diagramTime,
    enabled: autoPlay && !isPaused,
    onComplete: () => {
      onNext?.();
    },
  });

  useEffect(() => {
    disableGlobalTap?.();
    const timer = setTimeout(() => {
      enableGlobalTap?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleInteraction = () => {
    if (autoPlay) {
      togglePause?.();
    } else {
      onNext?.();
    }
  };

  return (
    <div
      className="relative w-full min-h-screen bg-gradient-to-b from-[#090913] to-[#111122] text-white select-none cursor-pointer flex flex-col justify-center items-center"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Subtle glowing aura */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-800/20 via-transparent to-black"
        animate={{ opacity: [0.6, 0.8, 0.6], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      <div className={`relative flex flex-col justify-center items-center min-h-screen p-6 z-10 ${marginX} ${marginY}`}>
        {/* Diagram Illustration */}
        <motion.img
          src={illustration}
          alt="Diagram Illustration"
          className="max-w-3xl w-full max-h-[50vh] object-contain mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />

        {/* Markdown Explanation */}
        <motion.div
          className="max-w-2xl text-center text-gray-300 text-lg leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <ReactMarkdown>{text}</ReactMarkdown>
        </motion.div>
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
    </div>
  );
}

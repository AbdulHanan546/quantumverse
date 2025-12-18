import { motion } from "framer-motion";

interface ProgressBarProps {
  duration: number; // in milliseconds
  isActive: boolean; // paused or running
  isPaused?: boolean;
  elapsedTime?: number; // current elapsed time in milliseconds
}

export default function ProgressBar({
  duration,
  isActive,
  isPaused = false,
  elapsedTime = 0,
}: ProgressBarProps) {
  const progressPercent = duration > 0 ? (elapsedTime / duration) * 100 : 0;

  return (
    <motion.div
      className="fixed bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-lg"
      style={{
        width: `${Math.min(progressPercent, 100)}%`,
      }}
      transition={{
        duration: 0.1,
        ease: "linear",
      }}
    />
  );
}

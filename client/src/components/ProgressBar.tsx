import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface ProgressBarProps {
  duration: number; // in milliseconds
  isActive: boolean; // paused or running (unused)
  isPaused?: boolean; // (unused)
  elapsedTime?: number; // current elapsed time in milliseconds
}

export default function ProgressBar({
  duration,
  isActive: _isActive,
  isPaused: _isPaused = false,
  elapsedTime = 0,
}: ProgressBarProps) {
  const progressPercent = duration > 0 ? (elapsedTime / duration) * 100 : 0;

  // Render into body to avoid ancestor transforms affecting position:fixed
  const bar = (
    <motion.div
      className="fixed bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-lg z-50 pointer-events-none"
      animate={{ width: `${Math.min(progressPercent, 100)}%` }}
      transition={{ duration: 0.1, ease: "linear" }}
    />
  );

  if (typeof document === "undefined") return bar;
  return createPortal(bar, document.body);
}

import { useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface DiagramProps {
  illustration: string;
  text: string;
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
}

export default function Diagram({
  illustration,
  text,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
}: DiagramProps) {
  // 🔒 Temporarily disable global tap on mount
  useEffect(() => {
    disableGlobalTap?.();
    const timer = setTimeout(() => {
      enableGlobalTap?.();
    }, 1200); // Wait 1.2s before allowing next tap
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#090913] to-[#111122] text-white overflow-hidden select-none cursor-pointer"
      onClick={onNext}
      onTouchStart={onNext}
    >
      {/* Subtle glowing aura */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-800/20 via-transparent to-black"
        animate={{ opacity: [0.6, 0.8, 0.6], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* Diagram Illustration */}
      <motion.img
        src={illustration}
        alt="Diagram Illustration"
        className="max-w-3xl w-full h-auto object-contain mb-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      />

      {/* Markdown Explanation */}
      <motion.div
        className="max-w-2xl text-center px-6 text-gray-300 text-lg leading-relaxed z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <ReactMarkdown>{text}</ReactMarkdown>
      </motion.div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface ConceptMapProps {
  title: string;
  center: string;
  links: string[];
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function ConceptMap({ 
  title, 
  center, 
  links, 
  onNext,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: ConceptMapProps) {
  const [visibleNodes, setVisibleNodes] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const radius = 180; // distance from center

  // Calculate total duration
  const totalDuration = calculateReadingTime({
    text: `${title} ${center} ${links.join(" ")}`,
    componentType: "ConceptMap",
    itemCount: links.length,
  });

  const timePerNode = totalDuration / Math.max(links.length, 1);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || isPaused || elapsedTime >= totalDuration) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 50;
        if (next >= totalDuration) {
          setShowContinueButton(true);
          return totalDuration;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, elapsedTime, totalDuration]);

  // Update visible nodes based on elapsed time in auto mode
  useEffect(() => {
    if (autoPlay) {
      const newVisibleNodes = Math.min(Math.floor(elapsedTime / timePerNode) + 1, links.length);
      setVisibleNodes(newVisibleNodes);
    }
  }, [elapsedTime, timePerNode, links.length, autoPlay]);

  const handleCenterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoPlay) {
      togglePause?.();
    } else if (visibleNodes < links.length) {
      setVisibleNodes((v) => v + 1);
    }
  };

  useEffect(() => {
    if (visibleNodes === links.length) {
      const t = setTimeout(() => setShowContinue(true), 500);
      return () => clearTimeout(t);
    }
  }, [visibleNodes]);

  // Update SVG dimensions on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        setSvgSize({
          width: svgRef.current.clientWidth,
          height: svgRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Compute node positions
  const nodePositions = links.map((_, index) => {
    const angle = (index * 2 * Math.PI) / links.length - Math.PI / 2;
    const cx = svgSize.width / 2;
    const cy = svgSize.height / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-screen flex flex-col items-center bg-gradient-to-b from-[#0a0a16] via-[#0f0f24] to-[#151530] text-white select-none overflow-auto ${marginY} ${marginX}`}
    >
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-3xl md:text-4xl text-center text-emerald-100 font-bold drop-shadow-md mb-6"
      >
        {title}
      </motion.h3>

      {/* Map */}
      <div className="relative w-full max-w-4xl flex justify-center items-start min-h-[400px]">
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {svgSize.width > 0 &&
            nodePositions.slice(0, visibleNodes).map((pos, index) => (
              <motion.line
                key={index}
                x1={svgSize.width / 2}
                y1={svgSize.height / 2}
                x2={pos.x}
                y2={pos.y}
                stroke="url(#gradient)"
                strokeWidth={2}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
              />
            ))}
        </svg>

        {/* Center Node */}
        <motion.div
          className="absolute cursor-pointer"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          onClick={handleCenterClick}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="bg-emerald-500/30 rounded-full blur-xl p-6"
          />
          <div className="relative bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full px-6 py-3 shadow-2xl border-4 border-[#1c1a33]">
            <span className="text-white font-semibold">{center}</span>
          </div>
        </motion.div>

        {/* Link Nodes */}
        {svgSize.width > 0 &&
          nodePositions.map((pos, index) => (
            <AnimatePresence key={index}>
              {index < visibleNodes && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 * index }}
                  className="absolute"
                  style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
                >
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg px-4 py-2 shadow-lg border border-blue-400/30 transition-shadow">
                    <span className="text-white text-sm whitespace-nowrap">{links[index]}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
      </div>

      {/* Tap to Continue */}
      {!autoPlay && showContinue && onNext && (
        <motion.div
          className="flex justify-center mt-6 text-emerald-300 text-sm font-semibold cursor-pointer select-none"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          Tap to Continue
        </motion.div>
      )}

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
          data-continue="true"
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="absolute right-6 bottom-6 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 z-40"
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

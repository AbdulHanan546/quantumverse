import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { calculateReadingTime } from "../../utils/timeCalculation";
import ProgressBar from "../ProgressBar";

interface AnalogyProps {
  analogy: string;
  point: string;
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function Analogy({ 
  analogy, 
  point, 
  onNext,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: AnalogyProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate total duration
  const totalDuration = calculateReadingTime({
    text: `${analogy} ${point}`,
    componentType: "Analogy",
  });

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

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const drawConnections = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const topBolds = container.querySelectorAll(".top strong");
      const bottomBolds = container.querySelectorAll(".bottom strong");
      const contRect = container.getBoundingClientRect();

      const pairCount = Math.min(topBolds.length, bottomBolds.length);
      const arrows = [];

      for (let i = 0; i < pairCount; i++) {
        const top = topBolds[i] as HTMLElement;
        const bottom = bottomBolds[i] as HTMLElement;

        const topRect = top.getBoundingClientRect();
        const bottomRect = bottom.getBoundingClientRect();

        const startX = topRect.left - contRect.left + topRect.width / 2;
        const startY = topRect.bottom - contRect.top + 16;
        const endX = bottomRect.left - contRect.left + bottomRect.width / 2;
        const endY = bottomRect.top - contRect.top - 16;

        arrows.push({ startX, startY, endX, endY });
      }

      // animate drawing each arrow
      arrows.forEach((arrow, index) => {
        animateArrow(ctx, arrow.startX, arrow.startY, arrow.endX, arrow.endY, index * 600);
      });
    };

    const animateArrow = (
      ctx: CanvasRenderingContext2D,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      delay: number
    ) => {
      const headLength = 10;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      const totalLength = Math.sqrt(dx * dx + dy * dy);

      const startTime = performance.now();

      const drawFrame = (time: number) => {
        const elapsed = time - startTime - delay;
        if (elapsed < 0) {
          requestAnimationFrame(drawFrame);
          return;
        }

        const progress = Math.min(elapsed / 1000, 1);
        const length = totalLength * progress;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(0,255,120,0.85)";
        ctx.lineCap = "round";

        // main line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(fromX + Math.cos(angle) * length, fromY + Math.sin(angle) * length);
        ctx.stroke();

        // draw arrowhead when complete
        if (progress >= 1) {
          const headX = toX;
          const headY = toY;

          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(
            headX - headLength * Math.cos(angle - Math.PI / 6),
            headY - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            headX - headLength * Math.cos(angle + Math.PI / 6),
            headY - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = "rgba(0,255,120,0.85)";
          ctx.fill();
        }

        if (progress < 1) requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
    };

    // Delay arrow drawing until motion animations settle
    const timeout = setTimeout(() => drawConnections(), 1200);

    window.addEventListener("resize", drawConnections);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", drawConnections);
    };
  }, []);

  const handleTap = () => {
    if (autoPlay) {
      togglePause?.();
    } else {
      onNext?.();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      className={`relative w-full h-screen flex flex-col justify-center items-center text-white
                 bg-gradient-to-b from-[#090910] via-[#0e0e1a] to-[#121225] overflow-hidden cursor-pointer ${marginX} ${marginY}`}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-emerald-800/30 via-transparent to-black"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Canvas for arrows */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Analogy section */}
      <motion.div
        className="top w-full max-w-4xl text-center text-xl leading-relaxed text-gray-200 mb-20 px-4"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl font-bold text-blue-400 mb-3">Analogy 🧩</h2>
        <ReactMarkdown>{analogy}</ReactMarkdown>
      </motion.div>

      {/* Concept section */}
      <motion.div
        className="bottom w-full max-w-4xl text-center text-xl leading-relaxed text-gray-200 mt-10 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-purple-400 mb-3">Concept ⚛️</h2>
        <ReactMarkdown>{point}</ReactMarkdown>
      </motion.div>

      {/* Tap hint */}
      {!autoPlay && (
        <motion.div
          className="absolute bottom-8 text-gray-400 text-sm tracking-widest"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue
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

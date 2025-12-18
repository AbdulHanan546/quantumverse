import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";

interface AnalogyProps {
  analogy: string;
  point: string;
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  _isPaused?: boolean;
  togglePause?: () => void;
}

export default function Analogy({ 
  analogy, 
  point, 
  onNext,
  autoPlay = false,
  _isPaused = false,
  togglePause = () => {},
}: AnalogyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      className="relative w-full h-screen flex flex-col justify-center items-center text-white
                 bg-gradient-to-b from-[#090910] via-[#0e0e1a] to-[#121225] overflow-hidden cursor-pointer"
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
      <motion.div
        className="absolute bottom-8 text-gray-400 text-sm tracking-widest"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tap to continue
      </motion.div>
    </div>
  );
}

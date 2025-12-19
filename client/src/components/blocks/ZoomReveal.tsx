import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { calculateReadingTime } from '../../utils/timeCalculation';
import ProgressBar from '../ProgressBar';

interface Label {
  text: string;
  x: number;
  y: number;
}

interface ZoomRevealProps {
  title: string;
  image: string;
  labels: Label[];
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function ZoomReveal({ 
  title, 
  image, 
  labels, 
  onNext,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: ZoomRevealProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [visibleLabels, setVisibleLabels] = useState(autoPlay ? 0 : labels.length);

  // Calculate total duration
  const totalDuration = calculateReadingTime({
    text: `${title} ${labels.map(l => l.text).join(" ")}`,
    componentType: "ZoomReveal",
    itemCount: labels.length,
  });

  const timePerLabel = labels.length > 0 ? totalDuration / (labels.length + 2) : totalDuration / 3; // +2 for zoom in/out phases

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

  // Auto mode: progressively show labels and control zoom
  useEffect(() => {
    if (!autoPlay) return;

    // Show labels one by one
    const newVisibleLabels = Math.min(Math.floor(elapsedTime / timePerLabel), labels.length);
    setVisibleLabels(newVisibleLabels);

    // Zoom in when all labels are visible
    if (newVisibleLabels >= labels.length && elapsedTime >= timePerLabel * labels.length) {
      setIsZoomed(true);
      
      // Zoom out after a delay (extend zoom-in by +2000ms)
      const zoomOutTime = timePerLabel * (labels.length + 1) + 2000;
      if (elapsedTime >= zoomOutTime) {
        setIsZoomed(false);
      }
    }
  }, [elapsedTime, timePerLabel, labels.length, autoPlay]);

  const handleTap = () => {
    if (autoPlay) {
      togglePause?.();
    } else {
      onNext?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className={`space-y-6 bg-[#0a0a16] rounded-2xl border border-[#2c2649]/50 shadow-xl ${marginX} ${marginY}`}
      onClick={handleTap}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl md:text-4xl font-bold text-cyan-200 drop-shadow-md">{title}</h3>
        {!autoPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // ensure click doesn't propagate to parent
              setIsZoomed(!isZoomed);
            }}
            className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded-lg border border-cyan-500/30 transition-colors"
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300">Zoom Out</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300">Zoom In</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Image Container */}
      <div className="relative rounded-2xl overflow-visible mx-auto max-h-[400px] w-full md:w-3/4">
        {/* Image scales independently */}
        <motion.div
          animate={{ scale: isZoomed ? 1.5 : 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full h-full rounded-2xl"
        >
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-2xl shadow-inner"
          />
        </motion.div>

        {/* Labels */}
        {labels.map((label, index) => {
          const isVisible = autoPlay ? index < visibleLabels : true;
          return isVisible && (
            <div
              key={index}
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{
                left: `${label.x}%`,
                top: `${label.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Dot */}
              <div className="relative group">
                <div className="bg-cyan-500 w-4 h-4 rounded-full border-2 border-white shadow-lg z-10" />

                {/* Tooltip / Label */}
                {autoPlay ? (
                  <motion.div
                    className="absolute bottom-full mb-2 opacity-100 bg-cyan-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {label.text}
                  </motion.div>
                ) : (
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                    {label.text}
                  </div>
                )}

                {/* Halo animation */}
                {isZoomed && (
                  <motion.div
                    className="absolute inset-0 bg-cyan-400 rounded-full blur-md"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tap to Continue */}
      {!autoPlay && onNext && (
        <motion.div
          className="flex justify-center mt-4 text-cyan-300 text-sm font-semibold cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
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
    </motion.div>
  );
}

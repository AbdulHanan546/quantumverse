import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

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

export default function ZoomReveal({ title, image, labels, onNext }: ZoomRevealProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="space-y-6 bg-[#0a0a16] rounded-2xl p-6 border border-[#2c2649]/50 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl md:text-4xl font-bold text-cyan-200 drop-shadow-md">{title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation(); // ensure click doesn’t propagate to parent
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
        {labels.map((label, index) => (
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
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                {label.text}
              </div>

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
        ))}
      </div>

      {/* Tap to Continue */}
      {onNext && (
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
    </motion.div>
  );
}

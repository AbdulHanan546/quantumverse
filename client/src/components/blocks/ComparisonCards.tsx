import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "framer-motion";

interface ComparisonItem {
  label: string;
  image: string;
  description: string;
}

interface ComparisonCardsProps {
  title: string;
  left: ComparisonItem;
  right: ComparisonItem;
  onNext?: () => void;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}

export default function ComparisonCards({ title, left, right, onNext }: ComparisonCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative space-y-10"
    >
      {/* Title */}
      <h3 className="text-3xl md:text-4xl text-cyan-200 text-center font-bold drop-shadow-md tracking-wide">
        {title}
      </h3>

      {/* Cards Wrapper */}
      <div className="grid md:grid-cols-2 gap-10 items-stretch relative">
        {/* Left Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative rounded-2xl p-6 backdrop-blur-xl 
          bg-gradient-to-br from-[#1f1b33]/70 to-[#291f4a]/60 
          border border-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,0.25)] 
          hover:shadow-[0_0_35px_rgba(34,211,238,0.45)] 
          transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black/40 shadow-inner">
            <ImageWithFallback
              src={left.image}
              alt={left.label}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="text-xl text-cyan-200 mb-2 font-semibold drop-shadow-sm">
            {left.label}
          </h4>

          <p className="text-slate-300 leading-relaxed">{left.description}</p>

          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.03, 0.1, 0.03] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              background: "linear-gradient(to bottom right, transparent 0%, rgba(255,255,255,0.12) 100%)",
            }}
          />
        </motion.div>

        {/* Right Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative rounded-2xl p-6 backdrop-blur-xl 
          bg-gradient-to-br from-[#291f4a]/60 to-[#1f1b33]/70
          border border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]
          hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]
          transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black/40 shadow-inner">
            <ImageWithFallback
              src={right.image}
              alt={right.label}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="text-xl text-purple-200 mb-2 font-semibold drop-shadow-sm">
            {right.label}
          </h4>

          <p className="text-purple-200/90 leading-relaxed">
            {right.description}
          </p>

          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.03, 0.1, 0.03] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              background: "linear-gradient(to bottom right, transparent 0%, rgba(255,255,255,0.12) 100%)",
            }}
          />
        </motion.div>
      </div>

     {/* Tap to Continue Text */}
{onNext && (
  <motion.div
    className="flex justify-center mt-6 text-cyan-300 text-sm font-semibold cursor-pointer select-none"
    onClick={onNext}
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    Tap to Continue
  </motion.div>
)}

    </motion.div>
  );
}

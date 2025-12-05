import { useState } from "react";
import TapOverlay from "./TapOverlay";
import { motion, AnimatePresence } from "framer-motion";

export default function ScreenManager({ slides }: { slides: any[] }) {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    if (index < slides.length - 1) setIndex(index + 1);
  };

  const Component = slides[index].component;
  const props = slides[index].props;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6 }}
          className="absolute w-full h-full flex items-center justify-center"
        >
          <Component {...props} />
        </motion.div>
      </AnimatePresence>

      <TapOverlay onTap={nextSlide} />
    </div>
  );
}

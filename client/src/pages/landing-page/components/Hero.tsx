import { ArrowRight, Atom } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenAuth: () => void;
}

export function Hero({ onOpenAuth }: HeroProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          className="absolute inset-0 w-full h-full object-cover scale-150 md:scale-100"
          src="/hero_video.mp4"
          title="Background Video"
          autoPlay={true}
          muted
          loop
          style={{ pointerEvents: 'none' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-[oklch(79.2%_0.209_151.711)] rounded-lg flex items-center justify-center">
              <Atom className="w-6 h-6 text-gray-900" />
            </div>
            <span className="text-white text-xl font-heading tracking-widest">Quantumverse</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#features" className="text-gray-300 hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">How It Works</a>
            <a href="#method" className="text-gray-300 hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Our Method</a>
            <button
              onClick={onOpenAuth}
              className="px-6 py-2 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 rounded-lg hover:bg-[oklch(82%_0.22_151.711)] transition-colors"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Content - Centered */}
      <div className="relative z-10 px-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-8 tracking-widest">
              Learn Quantum<br />Mechanics Visually
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-300 text-lg md:text-xl mb-12 max-w-3xl mx-auto"
          >
            Master quantum physics from fundamentals to advanced concepts through interactive simulations. 
            Experience the Feynman technique in action.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={onOpenAuth}
              className="px-10 py-4 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 rounded-lg hover:bg-[oklch(82%_0.22_151.711)] transition-all hover:scale-105 flex items-center gap-2 shadow-xl shadow-[oklch(79.2%_0.209_151.711)]/30"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-10 py-4 bg-transparent text-white border-2 border-white/30 backdrop-blur-sm rounded-lg hover:bg-white/10 hover:border-white/50 transition-all"
            >
              Explore Simulations
            </button>
          </motion.div>
        </div>
      </div>

      {/* Stats Section at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-12 left-0 right-0 z-10 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left">
              <div className="text-4xl md:text-5xl text-white mb-2">50+</div>
              <div className="text-gray-400 text-sm md:text-base">Interactive simulations covering quantum concepts</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl md:text-5xl text-white mb-2">500+</div>
              <div className="text-gray-400 text-sm md:text-base">Students mastering quantum mechanics</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl md:text-5xl text-white mb-2">100%</div>
              <div className="text-gray-400 text-sm md:text-base">Interactive learning experience</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl md:text-5xl text-white mb-2">A-Z</div>
              <div className="text-gray-400 text-sm md:text-base">From beginner to advanced topics</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
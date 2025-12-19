import { ArrowRight, Sparkles, Zap, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

interface CTAProps {
  onOpenAuth: () => void;
}

export function CTA({ onOpenAuth }: CTAProps) {
  return (
    <section className="py-24 px-6 bg-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-[oklch(79.2%_0.209_151.711)] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[oklch(79.2%_0.209_151.711)] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Main card with glass effect */}
          <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[oklch(79.2%_0.209_151.711)] to-transparent"></div>
            
            {/* Floating particles decoration */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[oklch(79.2%_0.209_151.711)] rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-12 md:p-16">
              <div className="text-center max-w-3xl mx-auto">
                {/* Icon cluster */}
                <div className="flex justify-center gap-4 mb-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 bg-[oklch(79.2%_0.209_151.711)]/10 border border-[oklch(79.2%_0.209_151.711)]/30 rounded-xl flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 text-[oklch(79.2%_0.209_151.711)]" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="w-12 h-12 bg-[oklch(79.2%_0.209_151.711)]/10 border border-[oklch(79.2%_0.209_151.711)]/30 rounded-xl flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 text-[oklch(79.2%_0.209_151.711)]" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    className="w-12 h-12 bg-[oklch(79.2%_0.209_151.711)]/10 border border-[oklch(79.2%_0.209_151.711)]/30 rounded-xl flex items-center justify-center"
                  >
                    <Rocket className="w-6 h-6 text-[oklch(79.2%_0.209_151.711)]" />
                  </motion.div>
                </div>

                <h2 className="text-white mb-6">
                  Begin Your Quantum Journey Today
                </h2>
                <p className="text-gray-400 mb-10 text-lg">
                  Join hundreds of students mastering quantum mechanics through interactive simulations. 
                  Start exploring complex concepts in a simple, visual way.
                </p>
                
                <motion.button
                  onClick={onOpenAuth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 rounded-xl hover:bg-[oklch(82%_0.22_151.711)] transition-colors shadow-lg shadow-[oklch(79.2%_0.209_151.711)]/20 group"
                >
                  <span>Start Exploring</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                {/* Stats or features */}
                <div className="grid sm:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-800">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-[oklch(79.2%_0.209_151.711)] mb-2">Instant Access</div>
                    <p className="text-gray-500 text-sm">Begin learning immediately</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-[oklch(79.2%_0.209_151.711)] mb-2">Always Free Tier</div>
                    <p className="text-gray-500 text-sm">Core features at no cost</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-[oklch(79.2%_0.209_151.711)] mb-2">No Credit Card</div>
                    <p className="text-gray-500 text-sm">Required to get started</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute -top-2 -left-2 w-20 h-20 border-l-2 border-t-2 border-[oklch(79.2%_0.209_151.711)]/30 rounded-tl-3xl"></div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 border-r-2 border-b-2 border-[oklch(79.2%_0.209_151.711)]/30 rounded-br-3xl"></div>
        </motion.div>
      </div>
    </section>
  );
}

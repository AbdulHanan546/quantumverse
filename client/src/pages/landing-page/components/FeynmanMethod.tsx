import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export function FeynmanMethod() {
  return (
    <section id="method" className="py-24 px-6 bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-[oklch(79.2%_0.209_151.711)] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 rounded-full mb-6">
              Our Teaching Philosophy
            </div>
            <h2 className="text-white mb-6">
              The Feynman Technique: Learn by Teaching
            </h2>
            <p className="text-gray-400 mb-6 text-lg">
              Named after Nobel Prize-winning physicist Richard Feynman, this powerful learning method is built into every simulation on Quantumverse.
            </p>
            
            <div className="space-y-6">
              {[
                { num: 1, title: 'Identify the Concept', desc: 'Choose a quantum mechanics topic you want to understand deeply.' },
                { num: 2, title: 'Explain It Simply', desc: 'Use our simulations to break down complex ideas into simple, visual components.' },
                { num: 3, title: 'Identify Gaps', desc: 'Interactive feedback reveals what you don\'t understand yet.' },
                { num: 4, title: 'Review & Simplify', desc: 'Experiment until you can explain the concept in your own words.' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 rounded-full flex items-center justify-center">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800 relative">
              <Quote className="w-12 h-12 text-[oklch(79.2%_0.209_151.711)] mb-4" />
              <blockquote className="text-white text-xl mb-6">
                "If you can't explain it simply, you don't understand it well enough."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[oklch(79.2%_0.209_151.711)] to-emerald-600 rounded-full flex items-center justify-center text-gray-900 text-2xl">
                  RF
                </div>
                <div>
                  <div className="text-white">Richard Feynman</div>
                  <div className="text-gray-400 text-sm">Nobel Prize in Physics, 1965</div>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[oklch(79.2%_0.209_151.711)] rounded-full opacity-20 blur-xl -z-10"></div>
            </div>
            
            {/* Additional decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[oklch(79.2%_0.209_151.711)] rounded-full opacity-20 blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
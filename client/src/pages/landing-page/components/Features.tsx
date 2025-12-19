import { Zap, Target, Sparkles, Users, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Zap,
    title: 'Interactive Simulations',
    description: 'Visualize complex quantum phenomena through real-time interactive simulations that respond to your inputs.',
  },
  {
    icon: Target,
    title: 'Beginner to Advanced',
    description: 'Progress at your own pace from fundamental concepts to advanced quantum mechanics theories.',
  },
  {
    icon: Sparkles,
    title: 'Hands-On Learning',
    description: 'Learn by doing with our simulation-first approach that makes abstract concepts tangible.',
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Topics',
    description: 'Choose from 50+ topics covering everything from wave functions to quantum entanglement.',
  },
  {
    icon: Users,
    title: 'Student-Focused',
    description: 'Designed specifically for students with clear explanations and guided learning paths.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor your learning journey and master concepts one simulation at a time.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-[oklch(79.2%_0.209_151.711)]/10 text-[oklch(79.2%_0.209_151.711)] rounded-full mb-4 border border-[oklch(79.2%_0.209_151.711)]/20">
            Why Choose Quantumverse
          </div>
          <h2 className="text-white mb-4">
            Everything You Need to Master Quantum Mechanics
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our platform combines cutting-edge simulations with proven learning techniques to make quantum mechanics accessible and engaging.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-[oklch(79.2%_0.209_151.711)]/50 transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-12 h-12 bg-[oklch(79.2%_0.209_151.711)] rounded-lg flex items-center justify-center mb-4"
                >
                  <Icon className="w-6 h-6 text-gray-900" />
                </motion.div>
                <h3 className="text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
import { Search, Play, Lightbulb, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Choose Your Topic',
    description: 'Browse our comprehensive library of quantum mechanics topics from basic principles to advanced theories.',
  },
  {
    icon: Play,
    number: '02',
    title: 'Launch Simulation',
    description: 'Start an interactive simulation tailored to your chosen topic with customizable parameters.',
  },
  {
    icon: Lightbulb,
    number: '03',
    title: 'Experiment & Learn',
    description: 'Manipulate variables, observe outcomes, and develop intuition through hands-on experimentation.',
  },
  {
    icon: Trophy,
    number: '04',
    title: 'Master the Concept',
    description: 'Reinforce your understanding through guided exercises and move on to more advanced topics.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[oklch(79.2%_0.209_151.711)] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[oklch(79.2%_0.209_151.711)] rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-[oklch(79.2%_0.209_151.711)]/10 text-[oklch(79.2%_0.209_151.711)] rounded-full mb-4 border border-[oklch(79.2%_0.209_151.711)]/20">
            Simple Process
          </div>
          <h2 className="text-white mb-4">
            How Quantumverse Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Four simple steps to transform your understanding of quantum mechanics through interactive learning.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[oklch(79.2%_0.209_151.711)] to-transparent -z-0" />
                )}
                
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-4 mb-4"
                  >
                    <div className="w-14 h-14 bg-[oklch(79.2%_0.209_151.711)] rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-gray-900" />
                    </div>
                    <span className="text-[oklch(79.2%_0.209_151.711)]/40 text-4xl">{step.number}</span>
                  </motion.div>
                  <h3 className="text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
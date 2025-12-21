import React from 'react';
// Fixed the type-only import here
import type { SlideData } from '../../components/TopicRenderer'; 
import { MapPin, Zap, Target, Activity } from 'lucide-react';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * SIM 1: The "Hazy Cloud" Simulation
 * Shows a cloud of dots. The dots are denser in the middle.
 */
const runCloudSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let particles: { x: number; y: number; opacity: number }[] = [];
  
  const createParticles = () => {
    particles = [];
    for (let i = 0; i < 300; i++) {
      // Gaussian distribution to create a "dense center"
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      
      particles.push({
        x: canvas.width / 2 + z0 * 50,
        y: canvas.height / 2 + z1 * 50,
        opacity: Math.random() * 0.6
      });
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(render);
  };

  createParticles();
  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * SIM 2: Squaring the Wave
 * Visualizes how a wave (which goes negative) becomes a 
 * Probability Density (which is always positive).
 */
const runWaveToDensitySim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let time = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    time += 0.03;
    ctx.clearRect(0, 0, w, h);

    // Wave (Blue - can go below zero)
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([5, 5]);
    for (let x = 0; x < w; x++) {
      const y = cy - 40 + Math.sin(x * 0.02 + time) * 50;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Probability (Green - always above zero)
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    for (let x = 0; x < w; x++) {
      const val = Math.sin(x * 0.02 + time);
      const prob = val * val; // Squaring it!
      const y = h - 60 - (prob * 120);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    animId = requestAnimationFrame(render);
  };

  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_34: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Map of Maybe",
    subtitle: "Understanding Probability Density: Why electrons look like clouds.",
    icon: <Target size={80} className="text-green-400" />,
    meta: "Quantum Physics"
  },
  {
    id: 2,
    type: "concept-split",
    title: "The Problem with Tiny Things",
    leftContent: "In our world, a ball is either in your hand or it isn't. But in the quantum world, things are 'blurry' until we look at them.",
    rightPoints: [
      "No fixed 'dots' or 'marbles'",
      "Everything acts like a wave",
      "We use 'Probability' to track them"
    ]
  },
  {
    id: 3,
    type: "comparison",
    title: "Analogy: The Spinning Fan",
    leftTitle: "Fan is Stopped",
    leftPoints: [
      "You see exactly where the blades are.",
      "100% certainty of location.",
      "Like a normal baseball."
    ],
    rightTitle: "Fan is Spinning Fast",
    rightPoints: [
      "You see a blurry 'cloud' circle.",
      "Blades are 'somewhere' in the blur.",
      "Like a quantum electron."
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "Visualizing the 'Blur'",
    description: "This isn't many particles. This is ONE particle, showing you all the places it might be. The center is 'denser' because it's more likely to be there.",
    run: runCloudSim
  },
  {
    id: 5,
    type: "concept-list",
    title: "What is 'Density' here?",
    context: "In a city, high population density means more people in one spot. In physics:",
    items: [
      "High Density = 'Very likely to find me here!'",
      "Low Density = 'I'm rarely in this spot.'",
      "Zero Density = 'I can never be here!'"
    ]
  },
  {
    id: 6,
    type: "equation",
    latex: "Chance = |Ψ|²",
    description: "The 'Wavefunction' (Psi) describes the wave. To get the actual map of chances, we just square it!",
    variables: [
      { symbol: "Ψ", meaning: "The Wave of Possibilities" },
      { symbol: "²", meaning: "Squares make negative waves positive" }
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "Why Square the Wave?",
    description: "Waves go up and down (Blue). But a 'chance' can't be negative! By squaring the wave, we get the Green path: The Probability Density Map.",
    run: runWaveToDensitySim
  },
  {
    id: 8,
    type: "quiz",
    question: "If the Probability Density is zero at a certain spot, what does that mean?",
    options: [
      "The particle is invisible there.",
      "The particle is moving too fast to see.",
      "The particle can NEVER be found there.",
      "The particle is sleeping."
    ],
    correctIndex: 2,
    explanation: "Zero density means zero chance. Even if the 'wave' is there, if the square is zero, the particle is forbidden from that spot!"
  },
  {
    id: 9,
    type: "process",
    title: "From Cloud to Point",
    steps: [
      { label: "The Blur", desc: "The electron exists as a 'Probability Density' cloud." },
      { label: "The Check", desc: "A scientist takes a measurement (looks at it)." },
      { label: "The Pop", desc: "The cloud 'collapses' instantly into one tiny dot." },
      { label: "The Reset", desc: "The moment we stop looking, it becomes a cloud again." }
    ]
  },
  {
    id: 10,
    type: "true-false",
    statement: "Probability Density allows us to know the exact path an electron takes around an atom.",
    isTrue: false,
    explanation: "False! We only know where it is likely to be found. We can't see the path because it doesn't have a single path—it's a cloud!"
  },
  {
    id: 11,
    type: "summary",
    title: "Summary: The Map of Maybe",
    recap: [
      "Quantum objects are 'blurry' clouds of chance.",
      "Probability Density = How thick that cloud is.",
      "We calculate it by squaring the wave (|Ψ|²).",
      "It only turns into a 'particle' when we measure it."
    ]
  },
  {
    id: 12,
    type: "outro",
    title: "Quantum Master!",
    text: "You've mastered the concept of Probability Density. You now know that the universe is built on 'Maybes' and 'Chances'!"
  }
];
import React from 'react';
// Fixed import: replaced Waveform with AudioWaveform
import { AudioWaveform, Zap, Brain, Timer, Activity, Sparkles } from 'lucide-react';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. The Dancing Wave (Visualizing the Wavefunction)
const runWaveDanceSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let t = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    t += 0.03;

    ctx.clearRect(0, 0, w, h);

    // Draw background grid
    ctx.strokeStyle = '#18181b';
    ctx.beginPath();
    for(let i=0; i<w; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, h); }
    for(let i=0; i<h; i+=40) { ctx.moveTo(0, i); ctx.lineTo(w, i); }
    ctx.stroke();

    // Wave 1 (Real part - Blue)
    ctx.beginPath();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    for (let x = 0; x < w; x++) {
      const amplitude = 80 * Math.sin(x * 0.01); 
      const y = cy + Math.sin(x * 0.05 - t * 2) * amplitude;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wave 2 (Imaginary part - Green)
    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let x = 0; x < w; x++) {
      const amplitude = 80 * Math.sin(x * 0.01);
      const y = cy + Math.cos(x * 0.05 - t * 2) * amplitude;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

// 2. The Spreading Cloud (Time Evolution)
const runSpreadingCloudSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let time = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    const cy = h / 2;
    time += 0.01;

    ctx.clearRect(0, 0, w, h);

    const spread = 40 + (Math.sin(time) + 1) * 100;
    const opacity = 1 / (spread * 0.02);

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, spread);
    gradient.addColorStop(0, `rgba(74, 222, 128, ${opacity})`);
    gradient.addColorStop(1, 'rgba(74, 222, 128, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_38 = [
  {
    id: 1,
    type: "intro",
    title: "The Recipe of Reality",
    subtitle: "How the Schrödinger Equation tells tiny things how to move.",
    icon: <AudioWaveform size={80} className="text-green-400" />,
    meta: "Quantum Physics 101"
  },
  {
    id: 2,
    type: "concept-split",
    title: "The Quantum Secret",
    leftContent: "In the normal world, things are like marbles. In the quantum world, things are like waves in a bathtub.",
    rightPoints: [
      "Particles don't sit still",
      "They are 'Waves of Maybe'",
      "We need a rule for the wiggle"
    ]
  },
  {
    id: 3,
    type: "quote",
    text: "The Schrödinger Equation tells you how the 'Wave of Maybe' changes as the clock ticks.",
    author: "Brian Greene."
  },
  {
    id: 4,
    type: "simulation",
    title: "Watch the Wiggle",
    description: "This isn't a string. It's a map of where a particle might be. Notice how it dances over time!",
    run: runWaveDanceSim
  },
  {
    id: 5,
    type: "concept-list",
    title: "The Big Players",
    context: "To understand the equation, we just need to know who is in the room:",
    items: [
      "The Wave (Psi): The shape of the particle's 'vibe'",
      "The Energy (H): What makes the wave move",
      "The Clock (t): How the shape changes every second",
      "The Magic 'i': A math trick that keeps the wave spinning"
    ]
  },
  {
    id: 6,
    type: "equation",
    latex: "Hψ = iℏ (Δψ / Δt)",
    description: "Don't panic! It just says: (Energy) x (Wave) = (Magic) x (Change over Time)",
    variables: [
      { symbol: "H", meaning: "Total Energy (The Engine)" },
      { symbol: "ψ", meaning: "The Wave (The Shape)" },
      { symbol: "Δt", meaning: "Passing Time" },
      { symbol: "i", meaning: "The 'Secret' that causes rotation" }
    ]
  },
  {
    id: 7,
    type: "comparison",
    title: "Newton vs. Schrödinger",
    leftTitle: "Newton (Big Things)",
    leftPoints: [
      "Tells us where a ball IS",
      "Forces push things",
      "Predicts a clear path"
    ],
    rightTitle: "Schrödinger (Tiny Things)",
    rightPoints: [
      "Tells us where a wave MIGHT be",
      "Energy shapes the wave",
      "Predicts a blurry cloud"
    ]
  },
  {
    id: 8,
    type: "simulation",
    title: "The Blur Effect",
    description: "The equation shows that if we don't watch a particle, its 'Wave of Maybe' spreads out like smoke.",
    run: runSpreadingCloudSim
  },
  {
    id: 9,
    type: "quiz",
    question: "What does the Schrödinger Equation actually track?",
    options: [
      "The exact speed of a car", 
      "How a quantum wave changes over time", 
      "The color of an atom", 
      "How much a particle weighs"
    ],
    correctIndex: 1,
    explanation: "Exactly! It's like a movie script for a wave, telling it how to change shape from one second to the next."
  },
  {
    id: 10,
    type: "process",
    title: "How to use the 'Recipe'",
    steps: [
      { label: "Check the Room", desc: "See what forces (like magnets or walls) are nearby." },
      { label: "Add Energy", desc: "Figure out how much energy the particle has (The 'H')." },
      { label: "Crunch the Math", desc: "The equation tells the wave to twist and wiggle." },
      { label: "Find the Answer", desc: "The new shape shows where the particle is likely to be now." }
    ]
  },
  {
    id: 11,
    type: "true-false",
    statement: "If we know the energy and the starting wave, we can predict exactly how the wave will look in the future.",
    isTrue: true,
    explanation: "True! The equation is deterministic. It's the 'wave' itself that represents probability."
  },
  {
    id: 12,
    type: "summary",
    title: "Quantum Master Checklist",
    recap: [
      "Quantum things move like waves, not marbles.",
      "The Schrödinger Equation is the master rulebook.",
      "It links Energy to how the wave wiggles over time.",
      "Without it, we couldn't build computers or lasers!"
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "You're a Quantum Chef!",
    text: "You now know the 'Recipe' that runs the entire universe at its smallest level. Keep exploring!"
  }
];
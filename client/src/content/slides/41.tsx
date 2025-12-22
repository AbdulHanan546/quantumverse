import React from "react";
import { Atom, Zap, Maximize2, MoveHorizontal, Music } from "lucide-react";
import type { SlideData } from "../../components/TopicRenderer"; // Assuming types are in the same directory

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. Particle vs Wave Simulation
// Shows a ball bouncing, then reveals it's actually a "standing wave"
const runWaveParticleSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    const padding = 100;
    const boxWidth = w - padding * 2;
    t += 0.03;

    ctx.clearRect(0, 0, w, h);

    // Draw Walls
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padding, cy - 80); ctx.lineTo(padding, cy + 80);
    ctx.moveTo(w - padding, cy - 80); ctx.lineTo(w - padding, cy + 80);
    ctx.stroke();

    // Draw Wave (The Quantum Particle)
    ctx.beginPath();
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 3;
    for (let x = 0; x <= boxWidth; x++) {
      // Equation: sin(pi * x / L) * sin(t)
      const wiggle = Math.sin(t * 2) * 60;
      const y = cy + Math.sin((Math.PI * x) / boxWidth) * wiggle;
      if (x === 0) ctx.moveTo(padding + x, y);
      else ctx.lineTo(padding + x, y);
    }
    ctx.stroke();

    // Draw the "Center" particle dot
    const ballX = padding + (boxWidth / 2);
    const ballY = cy + Math.sin(t * 2) * 60;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

// 2. Energy Levels Simulation
// Shows different "harmonics" (n=1, n=2, n=3)
const runEnergyLevelsSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  let animId = 0;
  let n = 1;

  // Change N every 2 seconds
  const interval = setInterval(() => {
    n = (n % 3) + 1;
  }, 2000);

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    const padding = 100;
    const boxWidth = w - padding * 2;
    t += 0.05;

    ctx.clearRect(0, 0, w, h);

    // Box
    ctx.strokeStyle = "#27272a";
    ctx.strokeRect(padding, cy - 100, boxWidth, 200);

    // Label
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Energy Level (n) = ${n}`, w / 2, cy - 120);

    // Draw Wiggle
    ctx.beginPath();
    ctx.strokeStyle = n === 1 ? "#4ade80" : n === 2 ? "#60a5fa" : "#f472b6";
    ctx.lineWidth = 4;
    for (let x = 0; x <= boxWidth; x++) {
      const amplitude = 60 * Math.sin(t);
      const y = cy + Math.sin((n * Math.PI * x) / boxWidth) * amplitude;
      if (x === 0) ctx.moveTo(padding + x, y);
      else ctx.lineTo(padding + x, y);
    }
    ctx.stroke();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => {
    cancelAnimationFrame(animId);
    clearInterval(interval);
  };
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_41: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Trapped Particle",
    subtitle: "What happens when you put a tiny atom in a tiny box?",
    icon: <Maximize2 size={80} className="text-blue-400" />,
    meta: "Quantum Mechanics"
  },
  {
    id: 2,
    type: "quote",
    text: "In the quantum world, things don't just sit still. They wiggle like music.",
    author: "Simplified Physics"
  },
  {
    id: 3,
    type: "concept-split",
    title: "The Invisible Box",
    leftContent: "Imagine a tiny marble inside a box. In our world, the marble can sit anywhere. But in the 'Quantum World', things behave like waves!",
    rightPoints: [
      "The particle is 'trapped' by walls",
      "It cannot escape the box",
      "It must act like a vibrating string"
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "Particle or Wave?",
    description: "Look at the white dot. It looks like a particle, but it's actually riding a wave that fits perfectly between the walls.",
    run: runWaveParticleSim
  },
  {
    id: 5,
    type: "concept-list",
    title: "The Golden Rule: Fitting In",
    context: "Because the particle is a wave, it has to 'fit' its wiggles between the walls. Just like a guitar string is tied at both ends.",
    items: [
      "No half-wiggles allowed at the walls!",
      "The wave must be zero at the edges",
      "This creates specific 'Shapes' of wiggles",
      "These shapes determine where the particle lives"
    ]
  },
  {
    id: 6,
    type: "comparison",
    title: "Normal vs. Quantum",
    leftTitle: "Bouncy Ball (Normal)",
    leftPoints: [
      "Can have ANY speed",
      "Can sit perfectly still",
      "Energy can be anything (0.1, 0.2, 0.3...)"
    ],
    rightTitle: "Quantum Particle",
    rightPoints: [
      "Only specific speeds allowed",
      "CANNOT sit still (must wiggle)",
      "Energy comes in 'Steps' (1, 4, 9...)"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "The Energy Ladder",
    description: "As energy increases, the number of 'wiggles' increases. Notice how they always touch the corners!",
    run: runEnergyLevelsSim
  },
  {
    id: 8,
    type: "equation",
    latex: "E_n = n^2 \times \text{Base Energy}",
    description: "The energy of our particle is like a ladder. You can be on Step 1 or Step 2, but never in between!",
    variables: [
      { symbol: "E", meaning: "Total Energy" },
      { symbol: "n", meaning: "The Step Number (1, 2, 3...)" },
      { symbol: "n squared", meaning: "Energy grows fast! (1, 4, 9, 16)" }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "Why can't the particle sit perfectly still in the box?",
    options: [
      "Because it's bored",
      "The walls are too hot",
      "Waves must wiggle to exist",
      "Gravity pulls it up"
    ],
    correctIndex: 2,
    explanation: "In quantum mechanics, if a particle is trapped, it must have a 'wavelength'. No wiggle means no wavelength, which is impossible for a trapped particle!"
  },
  {
    id: 10,
    type: "process",
    title: "How to 'Level Up'",
    steps: [
      { label: "Ground State (n=1)", desc: "The simplest wiggle. One big hump in the middle." },
      { label: "Add Energy", desc: "A photon (light) hits the particle." },
      { label: "Excited State (n=2)", desc: "The wave jumps to two wiggles! It now has 4x the energy." },
      { label: "The Jump", desc: "The particle 'disappears' from n=1 and 'appears' in n=2 instantly." }
    ]
  },
  {
    id: 11,
    type: "true-false",
    statement: "At n=2, there is a spot in the exact middle of the box where the particle is NEVER found.",
    isTrue: true,
    explanation: "Correct! This is called a 'Node'. The wave is zero there, so the particle's chance of being there is zero!"
  },
  {
    id: 12,
    type: "summary",
    title: "What did we learn?",
    recap: [
      "Tiny particles act like waves when trapped",
      "They only wiggle in specific patterns (n=1, 2, 3...)",
      "They can never have ZERO energy (they always wiggle)",
      "Energy jumps in steps, not a smooth slide"
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Quantum Master!",
    text: "You just understood the basics of how atoms store energy. You're thinking like a quantum physicist now!"
  }
];
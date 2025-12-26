import React from "react";
import { Atom, Music, Zap, Activity } from "lucide-react";
import  type { SlideData } from "../../components/TopicRenderer"; // Assuming types are in the same directory

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * 1. Standing Wave Simulation
 * Shows a string vibrating in a fixed shape (The "Stationary" look).
 */
const runStandingWaveSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    t += 0.05;

    ctx.clearRect(0, 0, w, h);

    // Draw the "Ghost" envelope
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#27272a";
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const envelope = Math.sin((x / w) * Math.PI) * 100;
      if (x === 0) ctx.moveTo(x, cy + envelope); else ctx.lineTo(x, cy + envelope);
    }
    for (let x = w; x >= 0; x--) {
      const envelope = Math.sin((x / w) * Math.PI) * -100;
      ctx.lineTo(x, cy + envelope);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the vibrating string
    ctx.beginPath();
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 4;
    for (let x = 0; x < w; x++) {
      // The "Stationary State" formula: Shape(x) * Wobble(t)
      const shape = Math.sin((x / w) * Math.PI);
      const wobble = Math.cos(t);
      const y = cy + shape * wobble * 100;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Nodes (endpoints)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, cy, 6, 0, Math.PI * 2);
    ctx.arc(w, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * 2. Energy Levels Simulation
 * Particles jumping between "allowed" steps.
 */
const runEnergyLevelsSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  let animId = 0;
  let particles = [{ y: 0, targetY: 3, color: "#4ade80" }];

  const levels = [0.8, 0.6, 0.4, 0.2]; // Y percentages

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    // Draw "Steps" (Levels)
    levels.forEach((lvl, i) => {
      ctx.strokeStyle = "#3f3f46";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * lvl);
      ctx.lineTo(w * 0.8, h * lvl);
      ctx.stroke();
      ctx.fillStyle = "#71717a";
      ctx.font = "12px monospace";
      ctx.fillText(`LEVEL ${4 - i}`, w * 0.1, h * lvl + 5);
    });

    // Draw Particle
    particles.forEach(p => {
      const currentY = h * levels[p.targetY];
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(w / 2, currentY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if (Math.random() > 0.98) {
        particles[0].targetY = Math.floor(Math.random() * levels.length);
    }

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_39: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "Stationary States",
    subtitle: "Why things in the tiny world don't just fall apart.",
    icon: <Activity size={80} className="text-blue-400" />,
    meta: "Quantum Physics 101"
  },
  {
    id: 2,
    type: "quote",
    text: "Energy is not a continuous fluid, but comes in little packets, like money comes in coins.",
    author: "Simplified Physics"
  },
  {
    id: 3,
    type: "concept-split",
    title: "What does 'Stationary' mean?",
    leftContent: "In everyday life, stationary means 'not moving'. But in the quantum world, things are ALWAYS moving. Here, it means something different.",
    rightPoints: [
      "The 'Shape' stays the same",
      "The energy is locked in",
      "Like a spinning fan that looks like a blurry circle"
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Standing Wave",
    description: "Think of a guitar string. Even though it's vibrating fast, the 'wave' itself isn't traveling left or right. It's staying in one place. This is a stationary state.",
    run: runStandingWaveSim
  },
  {
    id: 5,
    type: "comparison",
    title: "Parked Car vs. Quantum Note",
    leftTitle: "Normal 'Stationary'",
    leftPoints: [
      "Zero movement",
      "Zero energy",
      "Can stay anywhere on the road"
    ],
    rightTitle: "Quantum 'Stationary'",
    rightPoints: [
      "Vibrating intensely",
      "High energy",
      "Can only exist in specific patterns"
    ]
  },
  {
    id: 6,
    type: "concept-list",
    title: "The Rule of the Ladder",
    context: "Quantum particles can't have 'any' amount of energy. They follow the Ladder Rule:",
    items: [
      "You can stand on Rung 1 or Rung 2",
      "You CANNOT stand in the air between them",
      "Each rung is a 'Stationary State'",
      "To move, you must 'jump' instantly"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "Energy Levels",
    description: "The particle (green dot) can only exist exactly on the lines. It never 'slides' between them. It disappears from one and appears on the other.",
    run: runEnergyLevelsSim
  },
  {
    id: 8,
    type: "equation",
    latex: "E_n = n \\times h \\times f",
    description: "This is a simple way to look at it: Energy depends on which 'step' (n) you are on.",
    variables: [
      { symbol: "E", meaning: "Energy of the state" },
      { symbol: "n", meaning: "The step number (1, 2, 3...)" },
      { symbol: "h", meaning: "A tiny cosmic constant" },
      { symbol: "f", meaning: "How fast it's vibrating" }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "If a particle is in a 'Stationary State', what is staying the same?",
    options: [
      "It is frozen and not moving at all",
      "Its energy and 'vibration pattern' are constant",
      "It is moving in a straight line forever",
      "It is slowly losing energy like a battery"
    ],
    correctIndex: 1,
    explanation: "Stationary states have a constant energy level. Even though the particle 'wiggles', the pattern of that wiggle doesn't change over time."
  },
  {
    id: 10,
    type: "process",
    title: "Why atoms don't collapse",
    steps: [
      { label: "The Problem", desc: "Classic physics says electrons should spiral into the center and explode." },
      { label: "The Solution", desc: "Quantum mechanics says the electron is in a 'Stationary State'." },
      { label: "The Ground Floor", desc: "There is a 'lowest' possible step. The electron can't go lower than that." },
      { label: "Stability", desc: "Because it's stuck on the bottom step, the atom stays together forever!" }
    ]
  },
  {
    id: 11,
    type: "true-false",
    statement: "An electron can lose a tiny bit of energy to sit between two levels.",
    isTrue: false,
    explanation: "Incorrect! Quantum energy is 'all or nothing'. You either jump the whole way to the next level or stay exactly where you are."
  },
  {
    id: 12,
    type: "summary",
    title: "Stationary State Summary",
    recap: [
      "It's like a musical note: a stable vibration.",
      "Energy is locked into specific 'steps' or levels.",
      "The particle doesn't move across space; it 'exists' in a pattern.",
      "This is why atoms are stable and don't collapse."
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Level Up!",
    text: "You now understand why the universe is stable. Everything is just a series of perfectly timed vibrations."
  }
];
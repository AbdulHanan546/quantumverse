import React from 'react';
import { Atom, Ghost, Box, Target, Zap, HelpCircle } from 'lucide-react';
import type { SlideData } from '../../components/TopicRenderer'; // Adjust path as needed

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. Particle in a Box Simulation
const runWaveInWellSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let t = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    const cy = h / 2;
    const wellWidth = w * 0.4;
    const wellHeight = 150;
    t += 0.05;

    ctx.clearRect(0, 0, w, h);

    // Draw the "Well" (The Bucket)
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - wellWidth / 2 - 50, cy - wellHeight);
    ctx.lineTo(cx - wellWidth / 2, cy - wellHeight);
    ctx.lineTo(cx - wellWidth / 2, cy + 50);
    ctx.lineTo(cx + wellWidth / 2, cy + 50);
    ctx.lineTo(cx + wellWidth / 2, cy - wellHeight);
    ctx.lineTo(cx + wellWidth / 2 + 50, cy - wellHeight);
    ctx.stroke();

    // Draw the Quantum Wave (The "Ghostly Particle")
    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    for (let x = cx - wellWidth / 2 - 40; x <= cx + wellWidth / 2 + 40; x++) {
      // Logic: Wave is strong inside, decays quickly outside (the "leak")
      let envelope = 1;
      const distFromCenter = Math.abs(x - cx);
      const halfWidth = wellWidth / 2;
      
      if (distFromCenter > halfWidth) {
        envelope = Math.exp(-(distFromCenter - halfWidth) * 0.1);
      }

      const y = (cy + 20) + Math.sin(x * 0.05 - t * 2) * 40 * envelope;
      if (x === cx - wellWidth / 2 - 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#71717a';
    ctx.font = '12px Inter';
    ctx.fillText("The 'Wall'", cx - wellWidth / 2 - 60, cy - wellHeight - 10);
    ctx.fillText("The 'Forbidden' Zone", cx + wellWidth / 2 + 20, cy + 20);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

// 2. Energy Levels Simulation (The Ladder)
const runEnergyLevelsSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let t = 0;
  let animId = 0;
  let selectedLevel = 1;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    t += 0.02;

    ctx.clearRect(0, 0, w, h);

    const levels = [h * 0.7, h * 0.5, h * 0.35];
    const wellL = cx - 150;
    const wellR = cx + 150;

    // Draw ground
    ctx.strokeStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.85); ctx.lineTo(w, h * 0.85);
    ctx.stroke();

    levels.forEach((y, i) => {
      const isSelected = Math.floor(t % 3) === i;
      ctx.strokeStyle = isSelected ? '#4ade80' : '#18181b';
      ctx.lineWidth = isSelected ? 4 : 2;
      
      // Draw level line
      ctx.beginPath();
      ctx.moveTo(wellL, y);
      ctx.lineTo(wellR, y);
      ctx.stroke();

      if (isSelected) {
        // Draw bouncing ball on this level
        const ballX = cx + Math.sin(t * 5) * 100;
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(ballX, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Inter';
        ctx.fillText(`Energy Level ${i + 1}`, wellR + 20, y + 5);
      }
    });

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_43: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Quantum Trap",
    subtitle: "Understanding Finite Potential Wells without the scary math.",
    icon: <Box size={80} className="text-green-400" />,
    meta: "Quantum Physics"
  },
  {
    id: 2,
    type: "quote",
    text: "If you think you understand quantum mechanics, you don't understand quantum mechanics.",
    author: "Richard Feynman"
  },
  {
    id: 3,
    type: "concept-split",
    title: "What is a 'Well'?",
    leftContent: "In physics, a 'well' is just a place where a particle is trapped. Think of it like a ball at the bottom of a cereal bowl.",
    rightPoints: [
      "Low energy inside the bowl",
      "High energy needed to get out",
      "The 'Walls' are the edges of the bowl",
      "If the walls are short, the ball can escape!"
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Sloshing Wave",
    description: "In the quantum world, particles act like waves. See how the wave stays mostly inside the bucket, but 'leaks' slightly into the walls?",
    run: runWaveInWellSim
  },
  {
    id: 5,
    type: "comparison",
    title: "Classical vs. Quantum",
    leftTitle: "Classical (A Marble)",
    leftPoints: [
      "Hits the wall and bounces back",
      "Never enters the wall",
      "Can stay still at the bottom",
      "Needs 100% energy to jump out"
    ],
    rightTitle: "Quantum (An Electron)",
    rightPoints: [
      "Slightly 'ghosts' into the wall",
      "Always moving (vibrating)",
      "Can only exist at specific 'steps'",
      "Might 'tunnel' through if the wall is thin"
    ]
  },
  {
    id: 6,
    type: "concept-list",
    title: "Why 'Finite'?",
    context: "In early science classes, we imagine walls are infinitely tall. But in the real world, walls have a limit.",
    items: [
      "Finite = Limited height",
      "Infinite = Impossible to escape",
      "In a Finite Well, the particle isn't 100% trapped",
      "This explains how electronics and atoms work!"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "The Energy Ladder",
    description: "Quantum particles can't just have 'any' energy. They must sit on specific 'rungs' of a ladder.",
    run: runEnergyLevelsSim
  },
  {
    id: 8,
    type: "equation",
    latex: "E \approx \frac{n^2 h^2}{8mL^2}",
    description: "Even though the math looks messy, it tells us something simple: If the box (L) gets smaller, the energy (E) shoots up!",
    variables: [
      { symbol: "E", meaning: "Energy of the particle" },
      { symbol: "L", meaning: "Width of the box/well" },
      { symbol: "n", meaning: "The step number (1, 2, 3...)" },
      { symbol: "m", meaning: "Mass of the particle" }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "What happens to a quantum particle when it hits a wall in a finite well?",
    options: [
      "It stops completely",
      "It bounces back perfectly like a ball",
      "It 'leaks' slightly into the wall like a ghost",
      "It disappears forever"
    ],
    correctIndex: 2,
    explanation: "This is called 'Wave Penetration.' Quantum particles don't have hard edges, so they can exist slightly inside 'forbidden' areas!"
  },
  {
    id: 10,
    type: "process",
    title: "How to Escape the Well",
    steps: [
      { label: "Be Small", desc: "You need to be a quantum particle (like an electron)." },
      { label: "Energy Boost", desc: "Gain enough energy to match the 'wall height'." },
      { label: "The Leak", desc: "Even without enough energy, if the wall is thin, you can 'tunnel' to the other side." },
      { label: "Freedom", desc: "Once outside, you become a 'Free Particle' and fly away!" }
    ]
  },
  {
    id: 11,
    type: "true-false",
    statement: "In a quantum well, a particle can sit perfectly still at the very bottom.",
    isTrue: false,
    explanation: "False! This is the 'Zero-Point Energy' rule. Quantum particles are always 'shaking' at least a little bit."
  },
  {
    id: 12,
    type: "summary",
    title: "The Big Takeaway",
    recap: [
      "A Finite Well is a trap with walls of a certain height.",
      "Particles inside act like waves, not solid marbles.",
      "They can only live on specific energy 'steps'.",
      "They 'leak' into walls, allowing for cool things like tunneling.",
      "Smaller boxes lead to much higher energy levels."
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Quantum Master!",
    text: "You've just learned one of the core secrets of how atoms hold onto electrons. You're thinking like a physicist now!"
  }
];
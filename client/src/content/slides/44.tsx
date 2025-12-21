import React from 'react';
import { Atom, Scale, Zap, Camera, Eye, Ghost } from 'lucide-react';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * SIMULATION 1: The Jumpy Particle
 * Shows that as we narrow the horizontal "Zone" (Position), 
 * the particle's "Speed" (Vertical/Horizontal jitter) becomes wild.
 */
const runUncertaintySim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let frame = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    const cy = h / 2;
    frame++;

    // The "Measurement Zone" narrows and widens over time
    const cycle = (Math.sin(frame * 0.02) + 1) / 2; // 0 to 1
    const zoneWidth = 20 + cycle * 200; // From 20px to 220px
    
    // As zoneWidth gets smaller, jitter gets bigger
    const jitterAmount = (1 - cycle) * 50; 

    ctx.clearRect(0, 0, w, h);

    // Draw the "Measurement Zone" (The Box)
    ctx.strokeStyle = '#3f3f46';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cx - zoneWidth / 2, cy - 100, zoneWidth, 200);
    ctx.setLineDash([]);

    // Draw the Particle
    const px = cx + (Math.random() - 0.5) * jitterAmount;
    const py = cy + (Math.random() - 0.5) * jitterAmount;

    // Outer Glow
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, 20);
    gradient.addColorStop(0, 'rgba(74, 222, 128, 0.8)');
    gradient.addColorStop(1, 'rgba(74, 222, 128, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zoneWidth < 50 ? "High Certainty of WHERE" : "Searching for Position...", cx, cy + 130);
    ctx.fillText(zoneWidth < 50 ? "Speed is CRAZY (Uncertain)" : "Speed is CALM (Certain)", cx, cy + 150);

    animId = requestAnimationFrame(render);
  };

  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * SIMULATION 2: The Camera Analogy
 * Visualizes a "Frozen Photo" vs "Motion Blur"
 */
const runCameraSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let t = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    t += 0.02;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Split Screen Line
    ctx.strokeStyle = '#27272a';
    ctx.beginPath(); ctx.moveTo(w/2, 50); ctx.lineTo(w/2, h-50); ctx.stroke();

    // LEFT SIDE: High Shutter Speed (Certain Position)
    // We see exactly where it is, but no clue how fast it's going
    const posX = w/4;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath(); ctx.arc(posX, cy, 10, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText("FAST SHUTTER", w/4, 40);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText("Know Where, Not How Fast", w/4, 60);

    // RIGHT SIDE: Long Exposure (Certain Speed/Direction)
    // We see the path/speed, but it's just a blur
    const startX = w * 0.6;
    const endX = w * 0.9;
    const grad = ctx.createLinearGradient(startX, cy, endX, cy);
    grad.addColorStop(0, 'rgba(96, 165, 250, 0)');
    grad.addColorStop(0.5, 'rgba(96, 165, 250, 0.8)');
    grad.addColorStop(1, 'rgba(96, 165, 250, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(startX, cy - 5, endX - startX, 10);

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText("LONG EXPOSURE", w * 0.75, 40);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText("Know Speed, Not Where", w * 0.75, 60);

    animId = requestAnimationFrame(render);
  };

  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_44 = [
  {
    id: 1,
    type: "intro",
    title: "The Cosmic Secret",
    subtitle: "Understanding why you can't know everything at once.",
    icon: <Ghost size={80} className="text-purple-400" />,
    meta: "Quantum Mechanics"
  },
  {
    id: 2,
    type: "concept-list",
    title: "The Fast Pigeon Problem",
    context: "Imagine trying to take a photo of a pigeon flying past you.",
    items: [
      "Use a fast shutter: The bird is sharp (you know WHERE it is), but it looks frozen (you don't know its SPEED).",
      "Use a slow shutter: You see a beautiful blur (you know its SPEED), but you can't tell exactly WHERE it is in the blur.",
      "The universe has a built-in 'Blur' that we can't escape!"
    ]
  },
  {
    id: 3,
    type: "simulation",
    title: "The Position/Speed Trade-off",
    description: "Watch what happens when we try to squeeze a particle into a smaller space (The Dotted Box).",
    run: runUncertaintySim
  },
  {
    id: 4,
    type: "concept-split",
    title: "What is it?",
    leftContent: "Heisenberg's Principle says that for tiny things like electrons, you cannot measure their Position and their Speed perfectly at the same time.",
    rightPoints: [
      "Small Zone = Wild Speed",
      "Exact Speed = Huge Zone",
      "It's not about bad tools!",
      "It's just how the universe works."
    ]
  },
  {
    id: 5,
    type: "simulation",
    title: "Visualizing the Shutter",
    description: "In the quantum world, every measurement is like picking a shutter speed on a camera.",
    run: runCameraSim
  },
  {
    id: 6,
    type: "comparison",
    title: "Big vs. Tiny",
    leftTitle: "Big Stuff (Soccer Ball)",
    leftPoints: [
      "We can see where it is and how fast it moves easily.",
      "The 'Blur' is so tiny we don't notice it.",
      "Predictable paths."
    ],
    rightTitle: "Tiny Stuff (Electron)",
    rightPoints: [
      "Looking at it actually 'kicks' it.",
      "The 'Blur' is huge compared to the particle.",
      "Random and wiggly."
    ]
  },
  {
    id: 7,
    type: "equation",
    latex: "Δx × Δp ≥ h / 4π",
    description: "Don't let the math scare you! It's just a recipe for a trade-off.",
    variables: [
      { symbol: "Δx", meaning: "Wiggle room in Position (The 'Where')" },
      { symbol: "Δp", meaning: "Wiggle room in Speed (The 'How Fast')" },
      { symbol: "h", meaning: "A tiny constant (The universe's limit)" }
    ]
  },
  {
    id: 8,
    type: "quiz",
    question: "If I measure an electron's position so accurately that I know exactly where it is, what happens to its speed?",
    options: [
      "Its speed becomes zero.",
      "Its speed becomes perfectly known too.",
      "Its speed becomes completely unpredictable and 'wild'.",
      "Nothing happens."
    ],
    correctIndex: 2,
    explanation: "Because of the trade-off, the more you 'squeeze' the position (make Δx small), the 'wilder' the speed becomes (Δp gets huge)."
  },
  {
    id: 9,
    type: "process",
    title: "Why does this happen?",
    steps: [
      { label: "The Tiny Target", desc: "To 'see' an electron, you must bounce light (a photon) off it." },
      { label: "The Kick", desc: "Light carries energy. When it hits the tiny electron, it kicks it like a bowling ball hitting a marble." },
      { label: "The Change", desc: "By the time the light reaches your eye, the electron has already zoomed off in a new direction!" },
      { label: "The Rule", desc: "You saw where it was, but you changed its speed to do it." }
    ]
  },
  {
    id: 10,
    type: "true-false",
    statement: "Heisenberg's principle only exists because our microscopes aren't good enough yet.",
    isTrue: false,
    explanation: "Even with a 'perfect' microscope, the uncertainty would still be there. It's a fundamental property of matter, not a tool problem!"
  },
  {
    id: 11,
    type: "summary",
    title: "The Uncertainty Recap",
    recap: [
      "The universe has a limit on what we can know at once.",
      "Knowing 'Where' makes 'How Fast' a mystery.",
      "Knowing 'How Fast' makes 'Where' a mystery.",
      "This only really matters for the ultra-tiny world of atoms."
    ]
  },
  {
    id: 12,
    type: "outro",
    title: "Mind Blown?",
    text: "You've just touched the weirdest part of reality. Electrons are less like tiny balls and more like fuzzy clouds of 'maybe'. Great job!"
  }
];
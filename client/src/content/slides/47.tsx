import React from 'react';
import { Layers, Zap, Eye, Ghost, Play, Search } from 'lucide-react';
import  type { SlideData } from '../../components/TopicRenderer'; // Assuming types are in a separate file or same file

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * 1. Time Evolution Simulation (The "Ghostly Cloud")
 * Shows a wave-like cloud spreading out smoothly over time.
 */
const runEvolutionSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let t = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    const cx = w / 2;
    t += 0.02;

    ctx.clearRect(0, 0, w, h);

    // Draw the "Ghostly Cloud" (Wave Function)
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150 + Math.sin(t) * 20);
    gradient.addColorStop(0, 'rgba(74, 222, 128, 0.4)');
    gradient.addColorStop(1, 'rgba(74, 222, 128, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 200, 0, Math.PI * 2);
    ctx.fill();

    // Draw ripples moving outward smoothly
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const radius = ((t * 50 + i * 50) % 150);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("The 'Cloud' spreads out smoothly (Evolution)", cx, h - 30);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * 2. Collapse Simulation (The "Observation")
 * A cloud of possibilities that turns into one point when the user "looks" (clicks).
 */
const runCollapseSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let isCollapsed = false;
  let finalPos = { x: 0, y: 0 };
  const particles = Array.from({ length: 40 }).map(() => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.01 + Math.random() * 0.02
  }));

  const handleClick = (e: MouseEvent) => {
    if (!isCollapsed) {
      const rect = canvas.getBoundingClientRect();
      finalPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      isCollapsed = true;
      // Reset after 2 seconds to show again
      setTimeout(() => { isCollapsed = false; }, 2000);
    }
  };

  canvas.addEventListener('mousedown', handleClick);

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    if (!isCollapsed) {
      // Show many possible locations
      particles.forEach((p, i) => {
        const x = (w / 2) + Math.cos(Date.now() * p.speed + i) * 100;
        const y = (h / 2) + Math.sin(Date.now() * p.speed + i) * 80;
        ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText("Click anywhere to 'Look' (Measure)", w / 2, h - 30);
    } else {
      // The Collapse
      ctx.fillStyle = '#4ade80';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4ade80';
      ctx.beginPath();
      ctx.arc(finalPos.x, finalPos.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("COLLAPSED! It picked this spot.", w / 2, h / 2);
    }

    animId = requestAnimationFrame(render);
  };
  render();
  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener('mousedown', handleClick);
  };
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_47: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Quantum Peek-a-Boo",
    subtitle: "Understanding how things change when we look at them.",
    icon: <Ghost size={80} className="text-green-400" />,
    meta: "Quantum Mechanics"
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
    title: "The Two Modes of Nature",
    leftContent: "In our everyday world, things just move. But in the tiny world of atoms, particles have two completely different ways of behaving.",
    rightPoints: [
      "Mode 1: Moving like a 'Ghostly Cloud'",
      "Mode 2: Snapping into a 'Solid Point'",
      "The switch happens when we look!"
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "Mode 1: Time Evolution",
    description: "When nobody is looking, a particle doesn't sit still. It spreads out like a ripple in a pond. This smooth spreading is called 'Time Evolution'.",
    run: runEvolutionSim
  },
  {
    id: 5,
    type: "concept-list",
    title: "The 'Ghostly Cloud' Rules",
    context: "While the particle is 'evolving' (spreading out), it follows some weird rules:",
    items: [
      "It doesn't have a single exact location.",
      "It acts like a wave, not a marble.",
      "It moves smoothly and predictably (mathematically).",
      "It can be in many places at once!"
    ]
  },
  {
    id: 6,
    type: "comparison",
    title: "The Spinning Coin Analogy",
    leftTitle: "Time Evolution (The Spin)",
    leftPoints: [
      "The coin is spinning on the table.",
      "Is it Heads or Tails? It's both!",
      "A blur of possibilities.",
      "Changes smoothly as it spins."
    ],
    rightTitle: "Collapse (The Slap)",
    rightPoints: [
      "You slap your hand down on the coin.",
      "It's now definitely Heads OR Tails.",
      "The blur disappears instantly.",
      "One reality is chosen."
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "Mode 2: The Collapse",
    description: "The moment we measure or 'look' at the particle, the cloud vanishes. The particle instantly 'picks' one spot to be in. Try clicking below!",
    run: runCollapseSim
  },
  {
    id: 8,
    type: "process",
    title: "The Life of an Electron",
    steps: [
      { label: "Quiet Time", desc: "The electron moves as a wave (Time Evolution)." },
      { label: "The Interaction", desc: "A camera or sensor tries to see where it is." },
      { label: "The Snap", desc: "The wave instantly shrinks to a point (Collapse)." },
      { label: "The Result", desc: "We see the electron in one specific place." }
    ]
  },
  {
    id: 9,
    type: "equation",
    latex: "Ψ(t) → Click! → Particle",
    description: "The 'Wavefunction' (Psi) describes the cloud. Looking at it forces it to stop being a wave and start being a particle.",
    variables: [
      { symbol: "Ψ", meaning: "The 'Cloud' of possibilities" },
      { symbol: "t", meaning: "Time (as it spreads out)" }
    ]
  },
  {
    id: 10,
    type: "quiz",
    question: "In Quantum Physics, what causes the 'Ghostly Cloud' to collapse into a single point?",
    options: [
      "Gravity pulling it down",
      "Waiting a long time",
      "An observation or measurement",
      "The particle getting tired"
    ],
    correctIndex: 2,
    explanation: "Correct! The 'Collapse' is triggered when the quantum system interacts with a measuring device (like us looking at it)."
  },
  {
    id: 11,
    type: "true-false",
    statement: "During 'Time Evolution', the particle moves in a jerky, unpredictable way.",
    isTrue: false,
    explanation: "False! Surprisingly, Time Evolution is very smooth and follows a strict math equation (Schrödinger's). It's the Collapse that is sudden and random!"
  },
  {
    id: 12,
    type: "summary",
    title: "The Big Takeaway",
    recap: [
      "Time Evolution = Smoothly spreading like a wave.",
      "Collapse = Suddenly snapping into one spot.",
      "Looking at things changes how they behave.",
      "Quantum particles are 'clouds' until they are 'caught'."
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Mastered the Mystery!",
    text: "You now understand one of the weirdest secrets of the universe: things exist as waves of possibility until we decide to check on them!"
  }
];
import React from 'react';
import { Layers, Zap, Star, Activity, Target } from 'lucide-react';
import { type SlideData } from '../../components/TopicRenderer'; // Assuming the types are in this file

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. Ramp vs Ladder Simulation
// This shows a ball on a ramp (Classical) vs a ball that can only exist on steps (Quantum)
const runLedgeSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let mouseX = 0;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
  };
  canvas.addEventListener('mousemove', handleMouseMove);

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    const midX = w / 2;
    const centerY = h / 2;

    // --- LEFT SIDE: THE RAMP (Classical) ---
    ctx.strokeStyle = '#3f3f46';
    ctx.beginPath();
    ctx.moveTo(50, h - 50);
    ctx.lineTo(midX - 50, 50);
    ctx.stroke();
    
    // Ball on ramp follows mouse X exactly
    const rampX = Math.max(60, Math.min(midX - 60, mouseX));
    const rampPct = (rampX - 50) / (midX - 100);
    const rampY = (h - 50) - rampPct * (h - 100);

    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(rampX, rampY - 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText("Classical: Any Energy", 50, h - 20);

    // --- RIGHT SIDE: THE LADDER (Quantum Eigenvalues) ---
    const steps = 4;
    const stepHeight = (h - 100) / steps;
    
    ctx.strokeStyle = '#3f3f46';
    for(let i=0; i<=steps; i++) {
        const sy = (h - 50) - (i * stepHeight);
        ctx.beginPath();
        ctx.moveTo(midX + 50, sy);
        ctx.lineTo(w - 50, sy);
        ctx.stroke();
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`Level ${i} (Eigenvalue)`, w - 140, sy - 5);
    }

    // Ball on ladder "snaps" to the nearest step
    const qX = Math.max(midX + 60, Math.min(w - 60, mouseX));
    const rawPct = 1 - ( (h - 50) - ((h-50) - rampPct * (h-100)) ) / (h-100); // reuse ramp logic for simplicity
    const snappedStep = Math.round(rampPct * steps);
    const snappedY = (h - 50) - (snappedStep * stepHeight);

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(qX, snappedY - 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4ade80';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.fillText("Quantum: Specific Energy", midX + 50, h - 20);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener('mousemove', handleMouseMove);
  };
};

// 2. The Jumping Electron Sim
// Shows how an electron absorbs a packet of energy to jump levels
const runJumpSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let animId = 0;
  let level = 0;
  let photonX = -50;
  let isFiring = false;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const cx = w/2;
    const cy = h/2;

    // Draw orbits
    ctx.strokeStyle = '#27272a';
    for(let i=1; i<=3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, i * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Photon
    if (isFiring) {
      photonX += 5;
      ctx.beginPath();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      for(let i=0; i<20; i++) {
        ctx.lineTo(photonX - i, cy + Math.sin((photonX - i) * 0.2) * 10);
      }
      ctx.stroke();

      // Collision
      if (Math.abs(photonX - (cx - (level + 1) * 40)) < 10) {
        if (level < 2) level++;
        else level = 0;
        isFiring = false;
        photonX = -50;
      }
    } else {
      if (Math.random() > 0.98) isFiring = true;
    }

    // Draw Electron
    const radius = (level + 1) * 40;
    const angle = Date.now() * 0.002;
    const ex = cx + Math.cos(angle) * radius;
    const ey = cy + Math.sin(angle) * radius;

    ctx.fillStyle = '#4ade80';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#4ade80';
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`Current Energy Level: E${level}`, cx, h - 30);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_40: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "Energy Eigenvalues",
    subtitle: "Why atoms are the pickiest eaters in the universe.",
    icon: <Layers size={80} className="text-green-400" />,
    meta: "Quantum Physics"
  },
  {
    id: 2,
    type: "quote",
    text: "I think I can safely say that nobody understands quantum mechanics.",
    author: "Richard Feynman"
  },
  {
    id: 3,
    type: "concept-split",
    title: "What does 'Eigen' mean?",
    leftContent: "In German, 'Eigen' means 'Special' or 'Own.' In physics, an Eigenvalue is just a 'Special Number' that a system is allowed to have.",
    rightPoints: [
      "It's like a 'Fixed Menu' vs a Buffet",
      "No 'in-between' values allowed",
      "The universe has a speed dial for energy"
    ]
  },
  {
    id: 4,
    type: "comparison",
    title: "Ramp vs. Ladder",
    leftTitle: "Classical World (Ramp)",
    leftPoints: [
      "You can slide to any height",
      "Energy can be 1.1, 1.11, or 1.112",
      "Infinite possibilities"
    ],
    rightTitle: "Quantum World (Ladder)",
    rightPoints: [
      "You can only stand on rungs",
      "Energy is either 1 or 2, never 1.5",
      "Only specific 'Eigenvalues'"
    ]
  },
  {
    id: 5,
    type: "simulation",
    title: "The Snapping Universe",
    description: "Move your mouse. On the left, the ball follows you smoothly. On the right, it 'snaps' to allowed energy levels (Eigenvalues).",
    run: runLedgeSim
  },
  {
    id: 6,
    type: "concept-list",
    title: "Where do we find them?",
    context: "Eigenvalues appear whenever something is 'trapped' or 'vibrating' at a tiny scale.",
    items: [
      "Electrons orbiting an atom",
      "Light colors in a neon sign",
      "The vibration of molecules",
      "The strength of magnetic fields"
    ]
  },
  {
    id: 7,
    type: "equation",
    latex: "Hψ = Eψ",
    description: "This is the 'Rule Book' (Schrödinger Equation). 'E' is the Eigenvalue—the actual energy we can measure.",
    variables: [
      { symbol: "H", meaning: "The setup (The 'Machine')" },
      { symbol: "ψ", meaning: "The State (The 'Object')" },
      { symbol: "E", meaning: "Energy Eigenvalue (The 'Result')" }
    ]
  },
  {
    id: 8,
    type: "process",
    title: "How Electrons use Eigenvalues",
    steps: [
      { label: "The Ground State", desc: "The electron sits on the lowest rung (lowest Eigenvalue)." },
      { label: "The Energy Hit", desc: "A packet of light (photon) hits the electron." },
      { label: "The Quantum Leap", desc: "If the packet is exactly the right size, the electron 'teleports' to the next rung." },
      { label: "No Middle Ground", desc: "If the packet is the wrong size, the electron ignores it completely!" }
    ]
  },
  {
    id: 9,
    type: "simulation",
    title: "The Energy Eater",
    description: "Watch the yellow light hits the electron. It only jumps if the energy matches the difference between levels.",
    run: runJumpSim
  },
  {
    id: 10,
    type: "true-false",
    statement: "An electron can exist halfway between two energy eigenvalues.",
    isTrue: false,
    explanation: "Nope! That's the 'Quantum' in Quantum Mechanics. It's either on one rung or the other. Never in the air."
  },
  {
    id: 11,
    type: "quiz",
    question: "If an atom has energy levels (Eigenvalues) at 10 and 20, what happens if you give it 15 units of energy?",
    options: ["It goes to level 15", "It goes to level 20", "Nothing happens", "It explodes"],
    correctIndex: 2,
    explanation: "Atoms are picky! Since 15 isn't an allowed Eigenvalue and doesn't get it exactly to the next rung, it won't absorb the energy."
  },
  {
    id: 12,
    type: "summary",
    title: "Thinking like a Physicist",
    recap: [
      "Eigenvalue = An 'Allowed' value for a system.",
      "Quantum systems are like ladders, not ramps.",
      "Energy is 'Quantized' into these specific steps.",
      "Without Eigenvalues, atoms wouldn't be stable!"
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "You're a Quantum Master!",
    text: "You now understand why the universe isn't a smooth slide, but a series of tiny, perfect steps."
  }
];
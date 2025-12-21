import React from 'react';
import { Atom, Eye, Layers, Zap, Ghost, Shapes } from 'lucide-react';
import { type SlideData } from '../../components/TopicRenderer';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * SIM 1: The Cylinder Analogy
 * Shows a cylinder casting two different shadows. 
 * This explains how one thing can look like two different things depending on the angle.
 */
const runCylinderSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let angle = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    const cy = h / 2;
    angle += 0.02;

    ctx.clearRect(0, 0, w, h);

    // Draw the "Object" in the middle (A 3D-ish cylinder)
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const osc = Math.sin(angle) * 20;
    ctx.ellipse(cx, cy, 30, 60 + osc, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Shadow 1: The Circle Side
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(cx - 200, cy - 50, 100, 100);
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(cx - 150, cy, 30 + (osc/2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText("View A: It's a Circle!", cx - 200, cy + 70);

    // Shadow 2: The Square Side
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(cx + 100, cy - 50, 100, 100);
    ctx.fillStyle = '#60a5fa';
    const rectH = 60 + osc;
    ctx.fillRect(cx + 125, cy - rectH/2, 50, rectH);
    ctx.fillStyle = '#fff';
    ctx.fillText("View B: It's a Rectangle!", cx + 100, cy + 70);

    // Labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#71717a';
    ctx.fillText("The object is ONE thing, but looks different based on how you look.", cx, h - 20);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * SIM 2: The Shy Electron
 * A ball that behaves like a particle when you "watch" it (mouse over) 
 * and like a wave when you don't.
 */
const runWaveParticleSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let t = 0;
  let animId = 0;
  let isWatching = false;

  const handleMouseMove = () => { isWatching = true; };
  const handleMouseOut = () => { isWatching = false; };
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseOut);

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    t += 0.05;

    ctx.clearRect(0, 0, w, h);

    if (isWatching) {
      // Particle Mode: A single defined dot
      const x = (t * 50) % w;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(x, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText("PARTICLE MODE: I'm a tiny ball!", 20, 40);
    } else {
      // Wave Mode: Spread out ripples
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = cy + Math.sin(x * 0.05 - t * 2) * 40;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText("WAVE MODE: I'm everywhere at once!", 20, 40);
    }

    ctx.fillStyle = '#71717a';
    ctx.font = '14px sans-serif';
    ctx.fillText("Move your mouse over the screen to 'WATCH' the electron", w/2, h - 20);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseleave', handleMouseOut);
  };
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_45: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Complementarity Principle",
    subtitle: "Why Nature is a master of disguise.",
    icon: <Shapes size={80} className="text-green-400" />,
    meta: "Quantum Secrets"
  },
  {
    id: 2,
    type: "quote",
    text: "The opposite of a correct statement is a false statement. But the opposite of a profound truth may well be another profound truth.",
    author: "Niels Bohr"
  },
  {
    id: 3,
    type: "concept-list",
    title: "The Big Mystery",
    context: "In our everyday world, things are simple. A baseball is a ball, and a ripple in a pond is a wave. But in the tiny world of atoms:",
    items: [
      "Light can act like a shower of tiny bullets (Particles).",
      "But Light can also act like wiggling ripples (Waves).",
      "Electrons do the same thing!",
      "They are BOTH, but never at the SAME TIME."
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Cylinder Analogy",
    description: "Look at the shadows. Is the object a circle or a rectangle? It depends on which shadow you look at!",
    run: runCylinderSim
  },
  {
    id: 5,
    type: "concept-split",
    title: "What is Complementarity?",
    leftContent: "It's a fancy word that means: 'To see the whole picture, you need two different views that seem to contradict each other.'",
    rightPoints: [
      "You can see the Particle face.",
      "You can see the Wave face.",
      "But you cannot see both faces at once.",
      "The way you set up your experiment DECIDES what you see."
    ]
  },
  {
    id: 6,
    type: "comparison",
    title: "The Two Faces of Nature",
    leftTitle: "Face 1: The Particle",
    leftPoints: [
      "Acts like a tiny marble",
      "Has a specific 'Spot' it stays in",
      "Hits things like a bullet",
      "Shows up when we 'Watch' closely"
    ],
    rightTitle: "Face 2: The Wave",
    rightPoints: [
      "Acts like a wiggle in water",
      "Is spread out in many places",
      "Can overlap with other waves",
      "Shows up when we let it go free"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "Interactive: The Shy Electron",
    description: "Try to 'catch' the electron by moving your mouse over the box. Watch how it changes its nature!",
    run: runWaveParticleSim
  },
  {
    id: 8,
    type: "process",
    title: "How to 'Choose' a Face",
    steps: [
      { label: "Step 1: The Setup", desc: "Decide what experiment to run. Do you want to find where it is, or where it's going?" },
      { label: "Step 2: The Measurement", desc: "The moment you use a tool to 'see' the object, it chooses a face." },
      { label: "Step 3: The Result", desc: "If you measure position, it looks like a particle. If you measure movement patterns, it looks like a wave." },
      { label: "The Rule", desc: "Nature won't let you cheat and see both details perfectly at once." }
    ]
  },
  {
    id: 9,
    type: "equation",
    latex: "Wave + Particle = Reality",
    description: "This isn't a math formula, but a rule of the universe. To describe an atom, you need BOTH descriptions.",
    variables: [
      { symbol: "Wave", meaning: "Describes how things move and interfere." },
      { symbol: "Particle", meaning: "Describes how things hit and stay in spots." }
    ]
  },
  {
    id: 10,
    type: "quiz",
    question: "According to this principle, why can't we see an electron as a wave and particle at the exact same time?",
    options: [
      "Our eyes are too slow.",
      "The electron is actually just a particle and the wave is a lie.",
      "The act of looking 'forces' it to show only one face.",
      "We don't have a powerful enough microscope yet."
    ],
    correctIndex: 2,
    explanation: "Correct! The 'Complementarity Principle' says the setup of our experiment determines which property is revealed."
  },
  {
    id: 11,
    type: "true-false",
    statement: "In the quantum world, something can be two different things depending on how you measure it.",
    isTrue: true,
    explanation: "Exactly! Just like the cylinder's shadow, truth depends on your point of view."
  },
  {
    id: 12,
    type: "summary",
    title: "The 'Complementary' Recap",
    recap: [
      "Quantum objects have a 'Double Identity'.",
      "They can be Waves or Particles.",
      "These two views 'Complement' (complete) each other.",
      "You need both to understand the full story of atoms.",
      "You can't catch them in both 'costumes' at the same time!"
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Mind Blown!",
    text: "You now understand one of the deepest secrets of the universe. Nature isn't just one thing—it's whatever you choose to see."
  }
];
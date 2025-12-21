import React from "react";
import { Activity, Beaker, Scissors, Wand2, Calculator, Settings2 } from "lucide-react";

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * SIM 1: The Machine Analogy
 * A "Wave" enters a machine (The Operator), and a "Number" (The Measurement) pops out.
 */
const runMachineSim = (canvas) => {
  const ctx = canvas.getContext("2d");
  let t = 0;
  let animId;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    t += 0.05;

    const centerX = w / 2;
    const centerY = h / 2;

    // 1. Draw "Input" Waveform
    ctx.strokeStyle = "#4ade80";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let x = 0; x < centerX - 60; x++) {
      const y = centerY + Math.sin(x * 0.05 + t) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw the "Operator Machine" (The Box)
    ctx.fillStyle = "#18181b";
    ctx.strokeStyle = "#facc15"; // Gold color for the "Operator"
    ctx.lineWidth = 3;
    const boxSize = 120;
    ctx.fillRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);
    ctx.strokeRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);

    // Label inside box
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OPERATOR", centerX, centerY - 10);
    ctx.font = "10px monospace";
    ctx.fillText("(The Action)", centerX, centerY + 10);

    // 3. Draw "Output" Measurement
    const resultValue = (10 + Math.sin(t * 0.5) * 2).toFixed(2);
    ctx.fillStyle = "#60a5fa";
    ctx.font = "bold 24px monospace";
    ctx.fillText(resultValue, centerX + 150, centerY + 10);
    
    ctx.font = "12px sans-serif";
    ctx.fillText("Observable Result", centerX + 150, centerY + 35);

    // Arrow pointing out
    ctx.strokeStyle = "#60a5fa";
    ctx.beginPath();
    ctx.moveTo(centerX + 65, centerY);
    ctx.lineTo(centerX + 110, centerY);
    ctx.lineTo(centerX + 100, centerY - 5);
    ctx.moveTo(centerX + 110, centerY);
    ctx.lineTo(centerX + 100, centerY + 5);
    ctx.stroke();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * SIM 2: Momentum Operator (The "Bumpiness" Detector)
 * Higher frequency wave = higher "action" result.
 */
const runMomentumSim = (canvas) => {
  const ctx = canvas.getContext("2d");
  let t = 0;
  let animId;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    t += 0.02;

    const frequency = 2 + Math.sin(t) * 1.5; // Wave gets more/less "bumpy"
    const cy = h / 2;

    // Draw Wave
    ctx.beginPath();
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 3;
    for (let x = 50; x < w - 50; x++) {
      const y = cy + Math.sin(x * 0.02 * frequency) * 40;
      if (x === 50) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bar representing "Momentum Measurement"
    const barHeight = frequency * 30;
    ctx.fillStyle = "#27272a";
    ctx.fillRect(w - 40, h - 50, 20, -150);
    ctx.fillStyle = "#f87171";
    ctx.fillRect(w - 40, h - 50, 20, -barHeight);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    ctx.fillText("Bumpiness (Momentum)", w - 50, h - 30);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_35 = [
  {
    id: 1,
    type: "intro",
    title: "Observables as Operators",
    subtitle: "In the quantum world, to measure is to 'act'.",
    icon: <Wand2 size={80} className="text-yellow-400" />,
    meta: "Quantum Mechanics: Chapter 35"
  },
  {
    id: 2,
    type: "quote",
    text: "In physics, we don't just look at things. We ask them a question, and the math 'operates' on the particle to give us the answer.",
    author: "Feynman-style Logic"
  },
  {
    id: 3,
    type: "concept-list",
    title: "What is an 'Observable'?",
    context: "In plain English, an 'Observable' is just anything you can actually measure with a tool.",
    items: [
      "Position (Where is it?)",
      "Momentum (How fast is it going?)",
      "Energy (How much punch does it have?)",
      "Spin (Which way is it turning?)"
    ]
  },
  {
    id: 4,
    type: "comparison",
    title: "Normal World vs. Quantum World",
    leftTitle: "Normal Physics",
    leftPoints: [
      "Properties are like 'labels'",
      "A ball 'has' a speed of 10mph",
      "Just look at it to see the speed"
    ],
    rightTitle: "Quantum Physics",
    rightPoints: [
      "Properties are 'hidden' in waves",
      "A particle is a blurry cloud",
      "You must 'act' on the cloud to get a number"
    ]
  },
  {
    id: 5,
    type: "concept-split",
    title: "The Chef Analogy",
    leftContent: "Think of a Quantum Operator like a Chef's Tool. The particle is the raw dough. To find out 'how thin' the dough is, you have to use a rolling pin.",
    rightPoints: [
      "Dough = Wavefunction (The State)",
      "Rolling Pin = Operator (The Action)",
      "Thickness = Observable (The Result)"
    ]
  },
  {
    id: 6,
    type: "simulation",
    title: "The Measurement Machine",
    description: "Watch how the 'Wave' (input) goes through the 'Operator' (the action) to produce a 'Number' (the result).",
    run: runMachineSim
  },
  {
    id: 7,
    type: "process",
    title: "The 3 Steps of Measuring",
    steps: [
      { label: "The State", desc: "You start with a fuzzy wave representing the particle." },
      { label: "The Action", desc: "You apply a mathematical 'Operator' (like a filter or a transform)." },
      { label: "The Answer", desc: "The math spits out a real-world number you can write down." }
    ]
  },
  {
    id: 8,
    type: "equation",
    latex: "Â ψ = a ψ",
    description: "This is the most famous 'recipe' in Quantum Math. Don't let the symbols scare you!",
    variables: [
      { symbol: "Â", meaning: "The Operator (The Action/Question)" },
      { symbol: "ψ", meaning: "The Wavefunction (The Particle)" },
      { symbol: "a", meaning: "The Result (The Measurement Value)" }
    ]
  },
  {
    id: 9,
    type: "true-false",
    statement: "In Quantum Mechanics, an 'Operator' is basically a mathematical instruction to 'do something' to a wave.",
    isTrue: true,
    explanation: "Exactly! Whether it's finding energy or position, an operator acts on the wave to extract the info we want."
  },
  {
    id: 10,
    type: "simulation",
    title: "Detecting 'Bumpiness'",
    description: "Momentum is an operator that measures how 'wiggly' or 'bumpy' a wave is. More wiggles = More momentum!",
    run: runMomentumSim
  },
  {
    id: 11,
    type: "quiz",
    question: "If the 'Particle' is a song, what would the 'Operator' be?",
    options: [
      "The volume knob (changing the loudness)",
      "A software that calculates the 'BPM' or tempo of the song",
      "The speakers playing the song",
      "The person listening to the song"
    ],
    correctIndex: 1,
    explanation: "An operator 'acts' on the data (the song) to extract a specific piece of information (the tempo/BPM)."
  },
  {
    id: 12,
    type: "concept-list",
    title: "Key Takeaways",
    items: [
      "Particles don't 'carry' numbers; they carry waves.",
      "Operators are math tools used to 'squeeze' numbers out of waves.",
      "Every thing you can measure (Observable) has its own unique Operator.",
      "No Operator = No Measurement."
    ]
  },
  {
    id: 13,
    type: "summary",
    title: "Mastery Check",
    recap: [
      "Observables are things we measure (Speed, Energy).",
      "Operators are the math 'actions' we perform to get those measurements.",
      "Analogies: Cookie cutters, Vending machines, or Chef tools.",
      "Measuring changes the wave into a specific result."
    ]
  },
  {
    id: 14,
    type: "outro",
    title: "Quantum Lab Complete!",
    text: "You now understand that in the tiny world of atoms, measuring isn't just looking—it's performing a mathematical operation!"
  }
];
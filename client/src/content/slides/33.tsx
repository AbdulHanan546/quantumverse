import React from 'react';
import { Atom, Map, Eye, Target, Cloud } from 'lucide-react';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. The "Possibility Cloud" Simulation
// Shows a particle not as a dot, but as a glowing, pulsing wave-cloud.
const runWaveCloudSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let frame = 0;
  let animId;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    const cy = h / 2;
    frame += 0.05;

    ctx.clearRect(0, 0, w, h);

    // Draw the "Possibility Cloud"
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
    const pulse = Math.sin(frame) * 20;
    
    gradient.addColorStop(0, `rgba(74, 222, 128, ${0.6 + Math.sin(frame) * 0.2})`);
    gradient.addColorStop(0.5, `rgba(74, 222, 128, 0.2)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 200 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Draw the "Wave" lines inside
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -200; i < 200; i += 10) {
      const x = cx + i;
      const waveY = cy + Math.sin(i * 0.05 + frame) * 30 * Math.exp(-(i*i)/10000);
      if (i === -200) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

// 2. The "Catch the Particle" Simulation
// Demonstrates that the Wavefunction tells us WHERE we might find it.
const runProbabilitySim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let animId;
  let particles = [];
  
  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Draw the Probability Hill (The Wavefunction squared)
    ctx.strokeStyle = '#4ade80';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for(let x=0; x<w; x++) {
        const dist = Math.abs(x - w/2);
        const y = cy - 150 * Math.exp(-(dist * dist) / 10000);
        if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Occasionally "measure" a particle
    if (Math.random() > 0.95) {
      // Box-Muller transform for normal distribution (simple version)
      const u = Math.random();
      const v = Math.random();
      const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      const x = w/2 + standardNormal * 50; 
      particles.push({ x, y: cy - 150 * Math.exp(-( (x-w/2)**2 ) / 10000), age: 1 });
    }

    particles.forEach((p, i) => {
      ctx.fillStyle = `rgba(74, 222, 128, ${p.age})`;
      ctx.beginPath();
      ctx.arc(p.x, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      p.age -= 0.02;
      if (p.age <= 0) particles.splice(i, 1);
    });

    ctx.fillStyle = "#fff";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("High Hill = Likely to find it here", w/2, cy - 180);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_33 = [
  {
    id: 1,
    type: "intro",
    title: "The Wavefunction",
    subtitle: "The Invisible Map of the Tiny World",
    icon: <Cloud size={80} className="text-green-400" />,
    meta: "Quantum Physics Lesson 33"
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
    title: "The Problem with Atoms",
    leftContent: "In the normal world, a ball is always at one specific spot. But in the tiny world of atoms, things are 'blurry'.",
    rightPoints: [
      "Particles act like waves",
      "They don't have a fixed address",
      "They are spread out like a cloud"
    ]
  },
  {
    id: 4,
    type: "concept-list",
    title: "Meet the 'Psi' (ψ)",
    context: "Scientists use a mathematical tool called a 'Wavefunction', written as the Greek letter ψ (pronounced 'sigh').",
    items: [
      "It is NOT the particle itself",
      "It is a 'Map of Possibilities'",
      "It tells us everywhere the particle COULD be",
      "It looks like a wave moving through space"
    ]
  },
  {
    id: 5,
    type: "simulation",
    title: "The Possibility Cloud",
    description: "Instead of a tiny dot, imagine an electron is this glowing cloud. This cloud is the Wavefunction (ψ).",
    run: runWaveCloudSim
  },
  {
    id: 6,
    type: "comparison",
    title: "The Hidden Meaning",
    leftTitle: "The Wave (ψ)",
    leftPoints: [
      "Calculated by math",
      "Can be positive or negative",
      "Just a 'vibration' of chance"
    ],
    rightTitle: "The Meaning (ψ²)",
    rightPoints: [
      "Squaring the wave gives reality",
      "Always positive",
      "Tells us the probability of finding it"
    ]
  },
  {
    id: 7,
    type: "equation",
    latex: "Probability = |ψ|²",
    description: "This is the most important rule in Quantum Physics. The higher the wave, the more likely you are to find the particle there.",
    variables: [
      { symbol: "ψ", meaning: "The Wavefunction (The Cloud)" },
      { symbol: "²", meaning: "Squaring it makes it a real chance" }
    ]
  },
  {
    id: 8,
    type: "simulation",
    title: "Where is the Particle?",
    description: "The dotted line is the Wavefunction. Notice how most dots (particles) appear where the 'hill' is highest.",
    run: runProbabilitySim
  },
  {
    id: 9,
    type: "process",
    title: "The Peek-a-Boo Rule",
    steps: [
      { label: "The Cloud", desc: "Before you look, the particle is a spread-out Wavefunction (ψ)." },
      { label: "The Measurement", desc: "You use a sensor or light to 'look' at the particle." },
      { label: "The Collapse", desc: "The cloud instantly vanishes and the particle appears in ONE spot." },
      { label: "The Result", desc: "The Wavefunction is 'reset' based on where you found it." }
    ]
  },
  {
    id: 10,
    type: "quiz",
    question: "If the Wavefunction (ψ) is very tall in the center and very short at the edges, where will you likely find the electron?",
    options: [
      "At the edges", 
      "In the center", 
      "It is impossible to find it", 
      "Everywhere equally"
    ],
    correctIndex: 1,
    explanation: "Exactly! The 'height' of the wavefunction (when squared) represents the probability. Higher hill = higher chance."
  },
  {
    id: 11,
    type: "true-false",
    statement: "The Wavefunction tells us exactly where the particle is moving at all times.",
    isTrue: false,
    explanation: "False! It only tells us the 'odds' or 'probabilities'. In quantum land, there is no 'exact' until you look."
  },
  {
    id: 12,
    type: "summary",
    title: "Quantum Takeaways",
    recap: [
      "ψ (Psi) is a wave that represents a particle's possibility.",
      "The particle doesn't live in one spot; it's spread out.",
      "|ψ|² tells us the percentage chance of finding it.",
      "Looking at the particle 'collapses' the wave into a point."
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Mind Blown!",
    text: "You've just learned the core secret of the universe: Reality is built on waves of chance. Great job!"
  }
];
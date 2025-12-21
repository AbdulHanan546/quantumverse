import React from "react";
import { Atom, Zap, Ghost, Eye, Sparkles } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Quantum Coin Simulation (Superposition)
const runQuantumCoinSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let animId;
  let frame = 0;
  let state = "spinning"; // spinning, heads, or tails
  
  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    
    if (state === "spinning") {
      frame++;
      // Draw a "blurry" coin that flickers between H and T
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${0.3 + Math.sin(frame * 0.2) * 0.2})`;
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.fillStyle = "white";
      ctx.font = "bold 40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(frame % 2 === 0 ? "H" : "T", cx, cy + 15);
      
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "14px sans-serif";
      ctx.fillText("Quantum State: Both & Neither", cx, cy + 100);
    } else {
      // Draw the "fixed" state after observation
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = state === "H" ? '#60a5fa' : '#f87171';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.fillStyle = "white";
      ctx.font = "bold 40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(state, cx, cy + 15);
      
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "14px sans-serif";
      ctx.fillText("State 'Collapsed' to one reality", cx, cy + 100);
    }
    
    animId = requestAnimationFrame(render);
  };

  const handleClick = () => {
    if (state === "spinning") {
      state = Math.random() > 0.5 ? "H" : "T";
    } else {
      state = "spinning";
    }
  };

  canvas.addEventListener('click', handleClick);
  render();
  
  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener('click', handleClick);
  };
};

// 2. Probability Cloud Simulation
const runCloudSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let animId;
  let particles = Array.from({ length: 50 }, () => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.01 + Math.random() * 0.02
  }));

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    
    const time = Date.now() * 0.002;

    // Draw a fuzzy cloud of "where the particle might be"
    particles.forEach((p, i) => {
      const offsetX = Math.sin(time + i) * 100;
      const offsetY = Math.cos(time * 0.8 + i) * 50;
      
      ctx.beginPath();
      ctx.arc(w/2 + offsetX, h/2 + offsetY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(74, 222, 128, 0.4)";
      ctx.fill();
    });

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "14px sans-serif";
    ctx.fillText("The 'State' is this whole cloud of possibilities", w/2, h - 30);

    animId = requestAnimationFrame(render);
  };
  
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_32 = [
  {
    id: 1,
    type: "intro",
    title: "Quantum State",
    subtitle: "Understanding why tiny particles don't like to pick a side.",
    icon: <Ghost size={80} className="text-green-400" />,
    meta: "Quantum Physics Chapter 1"
  },
  {
    id: 2,
    type: "quote",
    text: "If you think you understand quantum mechanics, you don't understand quantum mechanics.",
    author: "Richard Feynman"
  },
  {
    id: 3,
    type: "concept-list",
    title: "What is a 'State'?",
    context: "In normal life, a 'state' is just the condition of something right now.",
    items: [
      "A light switch is in the 'ON' state",
      "A door is in the 'CLOSED' state",
      "A ball is in the 'STILL' state",
      "But tiny atoms play by different rules..."
    ]
  },
  {
    id: 4,
    type: "comparison",
    title: "Normal vs. Quantum",
    leftTitle: "Classic (Big Stuff)",
    leftPoints: [
      "Things are in one place",
      "A coin is either Heads or Tails",
      "The 'State' is a single fact"
    ],
    rightTitle: "Quantum (Tiny Stuff)",
    rightPoints: [
      "Things are a 'cloud' of places",
      "A coin can be a 'mix' of H and T",
      "The 'State' is a list of chances"
    ]
  },
  {
    id: 5,
    type: "simulation",
    title: "The Spinning Coin",
    description: "Click the 'Quantum Coin'. While it's spinning (the Quantum State), it hasn't decided yet. Only when you 'click' (observe it) does it pick a side.",
    run: runQuantumCoinSim
  },
  {
    id: 6,
    type: "concept-split",
    title: "The Identity Card",
    leftContent: "Think of a Quantum State as a particle's ID card. Instead of saying 'I am at Point A', the card says:",
    rightPoints: [
      "30% chance I'm at the Door",
      "50% chance I'm on the Couch",
      "20% chance I'm in the Kitchen",
      "The 'State' is the WHOLE card!"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "Where is the Particle?",
    description: "In the quantum world, the particle exists in this whole fuzzy cloud at once. This cloud is its 'State'.",
    run: runCloudSim
  },
  {
    id: 8,
    type: "process",
    title: "How to 'Break' a State",
    steps: [
      { label: "The Cloud", desc: "The particle exists as a list of many possibilities (The Quantum State)." },
      { label: "The Look", desc: "A scientist tries to measure or look at the particle." },
      { label: "The Choice", desc: "The particle 'snaps' into one single reality instantly." },
      { label: "New State", desc: "The 'Cloud' is gone. Now it has a simple, boring state like a normal ball." }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "In the quantum world, what is a 'State'?",
    options: [
      "A fixed position like a map coordinate", 
      "A list of all possible things a particle could be doing", 
      "The country where the atom lives", 
      "When a particle is frozen"
    ],
    correctIndex: 1,
    explanation: "Bingo! A quantum state isn't one result; it's the collection of all possible results and their chances."
  },
  {
    id: 10,
    type: "true-false",
    statement: "Observing a quantum particle (looking at it) changes its state.",
    isTrue: true,
    explanation: "Correct! The act of looking 'collapses' the cloud of possibilities into one single fact."
  },
  {
    id: 11,
    type: "summary",
    title: "What we learned",
    recap: [
      "Quantum State = A cloud of possibilities",
      "It's like a spinning coin that is both H and T",
      "Nature doesn't pick a side until we look",
      "Tiny particles live in multiple 'states' at once"
    ]
  },
  {
    id: 12,
    type: "outro",
    title: "Quantum Master!",
    text: "You've just grasped one of the weirdest ideas in science. Particles are like ghosts—they only become 'solid' when you catch them looking!"
  }
];
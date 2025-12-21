import React from 'react';
import { Eye, Zap, Sparkles, Box, Search } from 'lucide-react';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

const runQuantumCoinSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let animId;
  let isMeasured = false;
  let result = null; 
  let rotation = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2;
    const cy = h * 0.40; // Positioned higher to leave room for text
    ctx.clearRect(0, 0, w, h);

    if (!isMeasured) {
      rotation += 0.2;
      const wave = Math.sin(rotation) * 80;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(wave), 80, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#71717a';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("(Click the blur to measure it)", cx, h - 40);
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 45px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result === 0 ? "HEADS" : "TAILS", cx, cy + 15);
      
      ctx.fillStyle = '#71717a';
      ctx.font = '16px sans-serif';
      ctx.fillText("(Click to reset the blur)", cx, h - 40);
    }
    animId = requestAnimationFrame(render);
  };

  const handlePointerDown = () => {
    if (!isMeasured) {
      isMeasured = true;
      result = Math.random() > 0.5 ? 0 : 1;
    } else {
      isMeasured = false;
    }
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
  render();
  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener('pointerdown', handlePointerDown);
  };
};

const runMistSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let animId;
  let time = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    time += 0.02;
    const cx = w/2;
    const cy = h/2;

    for(let i=0; i<60; i++) {
        const angle = i * 0.8;
        const dist = (Math.sin(time + i) * 15) + 80;
        const px = cx + Math.cos(angle) * dist * Math.sin(time);
        const py = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
        ctx.fill();
    }
    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_37 = [
  {
    id: 1,
    type: "intro",
    title: "The Magic of Watching",
    subtitle: "In the quantum world, things only 'happen' when you look.",
    icon: <Eye size={80} className="text-green-400" />,
    meta: "Quantum Physics Lesson"
  },
  {
    id: 2,
    type: "quote",
    text: "I like to think that the moon is there even if I am not looking at it.",
    author: "Albert Einstein (Who found this topic very spooky!)"
  },
  {
    id: 3,
    type: "concept-split",
    title: "The Shy Universe",
    leftContent: "Before you look, a particle is like a spinning fan—it's not in one spot, it's a 'blur' of many spots at once.",
    rightPoints: [
      "This blur is called 'Superposition'",
      "The particle is everywhere at once",
      "It stays a blur until someone checks"
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Quantum Coin",
    description: "The coin is both Heads and Tails while spinning. Looking at it forces it to choose.",
    run: runQuantumCoinSim
  },
  {
    id: 5,
    type: "comparison",
    title: "How Rules Change",
    leftTitle: "Normal World",
    leftPoints: ["Checking doesn't change reality", "The object is always in one spot", "Predictable results"],
    rightTitle: "Quantum World",
    rightPoints: ["Checking CREATES the reality", "The object 'snaps' into a spot", "Random results"],
  },
  {
    id: 6,
    type: "concept-list",
    title: "The 'Snap' Rule",
    context: "The Measurement Postulate says that looking at a quantum system forces it to change.",
    items: [
      "The 'Maybe Blur' is destroyed instantly",
      "The system 'Collapses' into one choice",
      "You can't go back to the blur after looking",
      "Nature picks the result randomly"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "The Probability Cloud",
    description: "This blue mist represents where a particle *could* be. It lives as this mist until we measure it.",
    run: runMistSim
  },
  {
    id: 8,
    type: "process",
    title: "The Path to Realit",
    steps: [
      { label: "The Blur", desc: "The atom exists as a ghost-like cloud of possibilities." },
      { label: "The Glance", desc: "A measurement tool interacts with the cloud." },
      { label: "The Choice", desc: "The universe picks one single outcome randomly." },
      { label: "The Fix", desc: "The blur vanishes. Now you have a solid, real particle." }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "What happens to the 'Maybe Cloud' when we measure a particle?",
    options: [
      "It stays exactly the same", 
      "It becomes a permanent ghost", 
      "It collapses into one solid reality", 
      "It doubles in size"
    ],
    correctIndex: 2,
    explanation: "Measurement 'collapses' the many possibilities into just one definite thing."
  },
  {
    id: 10,
    type: "true-false",
    statement: "In Quantum Physics, we can predict exactly which result we will get before we measure.",
    isTrue: false,
    explanation: "False! We only know the *odds*. The final choice is a surprise by nature!"
  },
  {
    id: 11,
    type: "summary",
    title: "Lesson Summary",
    recap: [
      "Particles are blurs of possibility first.",
      "Measurement forces a 'Snapshot' of reality.",
      "The 'Blur' collapses into a single 'Point'.",
      "The act of looking changes the universe."
    ]
  },
  {
    id: 12,
    type: "outro",
    title: "Reality Mastered!",
    text: "You've learned the Measurement Postulate. You now know more about reality than most adults!"
  }
];
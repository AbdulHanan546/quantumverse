import React from "react";
import { Atom, Zap, Eye, Ghost, Sparkles, HelpCircle } from "lucide-react";
import type { SlideData } from "../../components/TopicRenderer"; // Assuming types are in the same directory

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. Spinning Coin Simulation (Superposition Analogy)
const runCoinSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  let frame = 0;
  let isStopped = false;
  let result = "";
  let animId: number;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);

    if (!isStopped) {
      frame++;
      // Draw a "blurry" coin
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${0.3 + Math.sin(frame * 0.2) * 0.2})`;
      ctx.fill();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(frame % 2 === 0 ? "HEADS" : "TAILS", cx, cy + 8);
      ctx.font = "14px sans-serif";
      ctx.fillText("(Spinning: It's BOTH right now!)", cx, cy + 100);
    } else {
      // Result state
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = "#18181b";
      ctx.fill();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(result, cx, cy + 12);
      ctx.fillStyle = "white";
      ctx.font = "14px sans-serif";
      ctx.fillText("The 'Choice' is made!", cx, cy + 100);
    }

    animId = requestAnimationFrame(render);
  };

  const handlePointerDown = () => {
    if (!isStopped) {
      isStopped = true;
      result = Math.random() > 0.5 ? "HEADS" : "TAILS";
      setTimeout(() => { isStopped = false; }, 2000); // Reset after 2s
    }
  };

  canvas.addEventListener("pointerdown", handlePointerDown);
  render();

  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener("pointerdown", handlePointerDown);
  };
};

// 2. The Probability Cloud (Where is the electron?)
const runCloudSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  let particles: { x: number; y: number; alpha: number }[] = [];
  let animId: number;
  let measured = false;
  let finalPos = { x: 0, y: 0 };

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      alpha: Math.random()
    });
  }

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    if (!measured) {
      particles.forEach(p => {
        const x = (w * 0.3) + (p.x * w * 0.4) + Math.sin(Date.now() * 0.001 + p.x) * 20;
        const y = (h * 0.3) + (p.y * h * 0.4) + Math.cos(Date.now() * 0.001 + p.y) * 20;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
        ctx.fill();
      });
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("The electron is in all these places at once!", w/2, h - 50);
    } else {
      ctx.beginPath();
      ctx.arc(finalPos.x, finalPos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#4ade80";
      ctx.fill();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#4ade80";
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Found it! It's right here now.", w/2, h - 50);
    }
    animId = requestAnimationFrame(render);
  };

  const handleClick = (e: MouseEvent) => {
    if (!measured) {
      measured = true;
      finalPos = { x: e.offsetX, y: e.offsetY };
      setTimeout(() => { measured = false; }, 2000);
    }
  };

  canvas.addEventListener("mousedown", handleClick);
  render();
  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener("mousedown", handleClick);
  };
};

/* -------------------------------------------------------------------------- /
/                             SLIDES DEFINITION                              /
/ -------------------------------------------------------------------------- */

export const SLIDES_46: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Magic of Superposition",
    subtitle: "How tiny particles can do two things at the same time.",
    icon: <Ghost size={80} className="text-blue-400" />,
    meta: "Quantum Physics 101"
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
    title: "The Big World vs. The Tiny World",
    leftContent: "In our everyday world, things are simple. Your phone is either in your pocket or on the table. It can't be both.",
    rightPoints: [
      "Big things follow 'Common Sense' rules.",
      "Small things (atoms) follow 'Quantum' rules.",
      "Quantum rules allow for 'Blurry' states."
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Spinning Coin Analogy",
    description: "Click the canvas to 'Measure' the coin. While it's spinning, is it Heads or Tails? It's actually a mix of both!",
    run: runCoinSim
  },
  {
    id: 5,
    type: "concept-list",
    title: "What is Superposition?",
    context: "It's a fancy word for a simple (but weird) idea:",
    items: [
      "A particle can be in many states at once.",
      "It stays 'blurry' until we look at it.",
      "Looking at it forces it to 'choose' one state.",
      "It's not just that we don't know—it's actually both!"
    ]
  },
  {
    id: 6,
    type: "comparison",
    title: "A Regular Switch vs. A Quantum Switch",
    leftTitle: "Classic Switch",
    leftPoints: [
      "Only ON or OFF",
      "No middle ground",
      "Very predictable"
    ],
    rightTitle: "Quantum Switch",
    rightPoints: [
      "ON and OFF at the same time",
      "A 'Superposition' of both",
      "Only chooses ON or OFF when flipped"
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "The Probability Cloud",
    description: "Imagine an electron. It's not a tiny ball; it's more like a ghost cloud. Click to 'Look' and see it appear!",
    run: runCloudSim
  },
  {
    id: 8,
    type: "equation",
    latex: "Ψ = α|0⟩ + β|1⟩",
    description: "This looks scary, but it's just a recipe! It says the state (Ψ) is a bit of Option A plus a bit of Option B.",
    variables: [
      { symbol: "Ψ", meaning: "The Quantum State (The 'Blurry' particle)" },
      { symbol: "α / β", meaning: "The odds of finding it in that state" },
      { symbol: "|0⟩ / |1⟩", meaning: "The two possible results (like Heads or Tails)" }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "When does a quantum particle 'choose' to be in just one specific state?",
    options: [
      "When it gets tired",
      "When we measure or observe it",
      "Only at night",
      "It never chooses"
    ],
    correctIndex: 1,
    explanation: "This is called 'Measurement.' Before we look, it's a mix. After we look, the superposition collapses into one reality."
  },
  {
    id: 10,
    type: "process",
    title: "How to 'Break' Superposition",
    steps: [
      { label: "Prepare", desc: "Isolate a tiny particle like an electron so nothing touches it." },
      { label: "Mix", desc: "The particle enters superposition (it's here AND there)." },
      { label: "Interact", desc: "A light beam or sensor touches the particle to 'see' it." },
      { label: "Collapse", desc: "The 'blurry' state disappears instantly. The particle is now in just one spot." }
    ]
  },
  {
    id: 11,
    type: "true-false",
    statement: "Superposition means a particle is just moving back and forth really fast.",
    isTrue: false,
    explanation: "Nope! It's actually existing in those states simultaneously. It's a fundamental property of nature, not just fast motion."
  },
  {
    id: 12,
    type: "summary",
    title: "Quantum Recap",
    recap: [
      "Superposition = Being in multiple states at once.",
      "It only happens at the tiny scale (atoms/electrons).",
      "Observing the particle forces it to choose one state.",
      "This 'weirdness' is what makes Quantum Computers so powerful!"
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "You're a Quantum Master!",
    text: "The next time you see a coin spinning, remember: until it stops, it's living in a world of infinite possibilities."
  }
];
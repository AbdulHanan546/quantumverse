import React from 'react';
import { Atom, Zap, Ghost, Sparkles, HelpCircle, Sun } from 'lucide-react';
import { type SlideData } from '../../components/TopicRenderer';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. Classic World Simulation: The Ball and the Hill
const runClassicHillSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let t = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2 + 50;
    t += 0.02;

    ctx.clearRect(0, 0, w, h);

    // Draw the Hill
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.bezierCurveTo(w * 0.3, cy, w * 0.4, cy - 150, w * 0.5, cy - 150);
    ctx.bezierCurveTo(w * 0.6, cy - 150, w * 0.7, cy, w, cy);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 5;
    ctx.stroke();

    // The Ball (Not enough energy to cross)
    // Moves back and forth on the left slope
    const xRange = w * 0.45;
    const x = (Math.sin(t) + 1) * 0.5 * xRange; 
    
    // Calculate y based on a simple hill shape for the ball to follow
    let y = cy;
    if (x > w * 0.2) {
        y = cy - (x - w * 0.2) * 1.2; // Simulating going up the slope
    }

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(x, y - 15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4ade80';

    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#71717a';
    ctx.font = '14px sans-serif';
    ctx.fillText("Not enough speed to get over!", 50, cy + 40);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

// 2. Quantum Tunneling Simulation: The "Ghost" Particle
const runTunnelingSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let particles: {x: number, alpha: number}[] = [];
  let waveOffset = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    const wallX = w / 2;
    const wallWidth = 30;
    
    waveOffset += 0.1;
    ctx.clearRect(0, 0, w, h);

    // Draw the Wall (The Barrier)
    ctx.fillStyle = '#27272a';
    ctx.fillRect(wallX, cy - 100, wallWidth, 200);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(wallX, cy - 100, wallWidth, 200);

    // Draw Incoming Probability Wave (The "Cloud")
    ctx.beginPath();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    for(let i = 0; i < wallX; i++) {
        const amplitude = 40;
        const y = cy + Math.sin(i * 0.05 - waveOffset) * amplitude;
        if(i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Draw Tunneling Wave (Smaller on the other side)
    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.setLineDash([5, 5]);
    for(let i = wallX + wallWidth; i < w; i++) {
        const amplitude = 10; // Much smaller
        const y = cy + Math.sin(i * 0.05 - waveOffset) * amplitude;
        if(i === wallX + wallWidth) ctx.moveTo(i, y); else ctx.lineTo(i, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Logic for individual "Ghost" particles appearing
    if (Math.random() > 0.98) {
        particles.push({ x: wallX + wallWidth, alpha: 1 });
    }

    particles.forEach((p, index) => {
        ctx.fillStyle = `rgba(74, 222, 128, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        p.x += 2;
        p.alpha -= 0.01;
        if (p.alpha <= 0) particles.splice(index, 1);
    });

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText("Most bounce back", wallX - 80, cy + 130);
    ctx.fillText("A few 'leak' through!", wallX + 100, cy + 130);

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_42: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "Quantum Tunneling",
    subtitle: "How particles 'ghost' through solid walls.",
    icon: <Ghost size={80} className="text-blue-400" />,
    meta: "Quantum Physics 101"
  },
  {
    id: 2,
    type: "concept-split",
    title: "The Rules of the 'Big World'",
    leftContent: "In our everyday life, if you throw a ball at a wall, it bounces back. If you try to roll a ball over a hill but don't push it hard enough, it rolls back down.",
    rightPoints: [
      "Walls are solid",
      "No energy = No crossing",
      "Everything has a fixed spot"
    ]
  },
  {
    id: 3,
    type: "simulation",
    title: "The Classic Hill",
    description: "In the normal world, if you don't have enough energy (speed), you are trapped on one side.",
    run: runClassicHillSim
  },
  {
    id: 4,
    type: "quote",
    text: "I think I can safely say that nobody understands quantum mechanics.",
    author: "Richard Feynman"
  },
  {
    id: 5,
    type: "concept-list",
    title: "The Rules of the 'Tiny World'",
    context: "Down at the level of atoms, things get weird. Particles don't act like hard marbles; they act like fuzzy clouds.",
    items: [
      "Particles are 'spread out'",
      "They don't have one exact position",
      "They are a 'cloud of possibilities'"
    ]
  },
  {
    id: 6,
    type: "comparison",
    title: "Marble vs. Cloud",
    leftTitle: "Classic Particle",
    leftPoints: ["Like a solid marble", "Always at one spot", "Stopped by any wall"],
    rightTitle: "Quantum Particle",
    rightPoints: ["Like a fuzzy cloud", "In many spots at once", "Can 'leak' through walls"]
  },
  {
    id: 7,
    type: "simulation",
    title: "The Quantum Escape",
    description: "Because the particle is a 'fuzzy cloud', a tiny bit of that cloud exists on the other side of the wall!",
    run: runTunnelingSim
  },
  {
    id: 8,
    type: "process",
    title: "How it happens",
    steps: [
      { label: "The Approach", desc: "A tiny particle (like an electron) heads toward a barrier." },
      { label: "The Cloud Hits", desc: "The particle's 'fuzziness' spreads out against the wall." },
      { label: "The Leak", desc: "A tiny piece of the fuzzy cloud actually reaches the other side." },
      { label: "Poof!", desc: "Occasionally, the whole particle 're-forms' on the other side and continues." }
    ]
  },
  {
    id: 9,
    type: "quiz",
    question: "Why can quantum particles get through walls that should stop them?",
    options: [
      "They are moving faster than light",
      "They find tiny holes in the wall",
      "Their 'position cloud' overlaps with the other side",
      "They turn into ghosts"
    ],
    correctIndex: 2,
    explanation: "Correct! Because they are 'fuzzy' (probabilistic), there is a small chance they exist on the other side, and sometimes that chance becomes reality!"
  },
  {
    id: 10,
    type: "equation",
    latex: "T \\approx e^{-2wL}",
    description: "This is a simplified way to see how likely 'tunneling' is. Don't worry about the math, just look at what matters!",
    variables: [
      { symbol: "T", meaning: "Chance of getting through" },
      { symbol: "w", meaning: "How heavy the particle is" },
      { symbol: "L", meaning: "Width of the wall" }
    ]
  },
  {
    id: 11,
    type: "true-false",
    statement: "The thicker the wall, the harder it is for a particle to tunnel through.",
    isTrue: true,
    explanation: "Exactly! As the wall (L) gets wider, the 'fuzziness' fades away before it can reach the other side."
  },
  {
    id: 12,
    type: "concept-split",
    title: "Is this useful?",
    leftContent: "Quantum tunneling isn't just a lab trick. Without it, life wouldn't exist and your phone wouldn't work!",
    rightPoints: [
      "The Sun: Atoms tunnel together to create light!",
      "USB Sticks: Electrons tunnel to store your photos.",
      "Microscopes: We use tunneling to see single atoms."
    ]
  },
  {
    id: 13,
    type: "summary",
    title: "Quantum Tunneling Recap",
    recap: [
      "In the tiny world, particles are 'fuzzy' waves.",
      "Walls aren't 100% solid to these waves.",
      "Particles can 'leak' through barriers they shouldn't cross.",
      "This makes the Sun shine and our electronics work!"
    ]
  },
  {
    id: 14,
    type: "outro",
    title: "Wall Walker!",
    text: "You've mastered the basics of Quantum Tunneling. You're now thinking like a true particle physicist!"
  }
];
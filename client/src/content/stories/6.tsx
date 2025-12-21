import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawMedium: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, cy);
  ctx.lineTo(W - 50, cy);
  ctx.stroke();
  
  ctx.fillStyle = '#666';
  ctx.font = "12px monospace";
  ctx.fillText("MEDIUM: A VERY LAZY ROPE", W / 2 - 80, cy + 30);
};

const drawLoosePluck: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    // Slow, sloppy wave
    const y = cy + Math.sin(x * 0.01 - time * 1.5) * 40;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#ef4444';
  ctx.fillText("SPEED: SLOW & SAD", W / 2 - 50, cy - 60);
};

const drawHookeTension: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  // High Tension = High Speed
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const y = cy + Math.sin(x * 0.02 - time * 8) * 20;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw "Pulling" arrows
  ctx.fillStyle = '#fbbf24';
  ctx.fillText("HOOKE PULLING TIGHTER →", W - 180, cy - 40);
  ctx.fillText("← HOOKE PULLING TIGHTER", 50, cy - 40);
};

const drawNewtonChain: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  // High Mass = Slow Speed
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8; // Heavy chain look
  
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const y = cy + Math.sin(x * 0.01 - time * 1.2) * 30;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.fillText("NEWTON'S HEAVY CHAIN", W / 2 - 70, cy + 60);
};

const drawTheFormula: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const y = cy + Math.sin(x * 0.015 - time * 4) * 30;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Balance scale visualization
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(W/2 - 60, H - 100, 50, 10); // Tension side
  ctx.fillText("TENSION", W/2 - 60, H - 110);
  
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(W/2 + 10, H - 100, 50, 20); // Mass side
  ctx.fillText("HEAVINESS", W/2 + 10, H - 110);
};

const drawInteractiveSpeed: DrawFunction = (ctx, W, H, time, mouseX) => {
  const tension = map(mouseX, 0, 1, 1, 20);
  const mass = 5; // constant for simplicity
  const speed = Math.sqrt(tension / mass) * 10;
  
  const cy = H / 2;
  ctx.strokeStyle = `hsl(${map(tension, 1, 20, 200, 0)}, 80%, 60%)`;
  ctx.lineWidth = 4;
  
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + Math.sin(x * 0.02 - time * speed) * 50;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Tension Level: ${tension.toFixed(1)}`, 50, 50);
  ctx.fillText(`Wave Speed: ${speed.toFixed(2)} units/sec`, 50, 80);
  ctx.fillStyle = "#888";
  ctx.fillText("Move mouse to pull the rope tighter", 50, 110);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_6: StoryStep[] = [
  {
    speaker: "System",
    text: "Imagine a rope. If you wiggle it, the wiggle moves. But how fast? Is it always the same speed?",
    mathTitle: "Wave Speed",
    mathSub: "The 'How Fast' Question",
    draw: drawMedium
  },
  {
    speaker: "Hooke",
    text: "It's all about how much I pull! Look, if this rope is loose and floppy, the wave takes its sweet time. It's lazy!",
    mathTitle: "Loose Medium",
    mathSub: "Low Tension = Low Speed",
    draw: drawLoosePluck
  },
  {
    speaker: "Hooke",
    text: "But if I pull it tight—REALLY tight—the wave snaps across the room. Tension is the 'speed juice' of the wave world!",
    mathTitle: "Hooke's Pull",
    mathSub: "High Tension (T) → Faster Speed (v)",
    draw: drawHookeTension
  },
  {
    speaker: "Newton",
    text: "Not so fast, Robert. You're forgetting about the 'stuff.' What if the rope is actually a heavy metal chain? It's much harder to get that moving.",
    mathTitle: "Newton's Objection",
    mathSub: "Heaviness (μ) fights the motion",
    draw: drawNewtonChain
  },
  {
    speaker: "Newton",
    text: "Even if you pull hard, the chain's massive ego (inertia) keeps it from moving fast. Heavy things are just... sluggish.",
    mathTitle: "The Inertia Factor",
    mathSub: "More Mass = Lower Speed",
    draw: drawNewtonChain
  },
  {
    speaker: "System",
    text: "So the speed of a wave is just a tug-of-war. Tension wants it to be fast, but Heaviness wants it to be slow.",
    mathTitle: "The Compromise",
    mathSub: "v = √(T / μ)",
    draw: drawTheFormula
  },
  {
    speaker: "Newton",
    text: "Fine. So to go fast, you need a very tight, very light string. Like a violin string!",
    speaker: "Hooke",
    text: "And to go slow, you need a loose, heavy anchor chain. Simple.",
    mathTitle: "Conclusion",
    mathSub: "The medium defines the speed.",
    draw: drawTheFormula
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to change the Tension. Watch how the 'vibe speed' changes as the rope gets tighter.",
    mathTitle: "Interactive Speed Lab",
    mathSub: "Mouse X: Tension Control",
    draw: drawInteractiveSpeed
  }
];
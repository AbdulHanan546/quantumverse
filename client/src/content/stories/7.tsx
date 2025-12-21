import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions for specific scenes ---

const drawBilliardCrash: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const speed = 2;
  const cycle = (time * 50) % (W + 200);
  let x1 = cycle - 100;
  let x2 = W - (cycle - 100);

  // Collision logic
  if (x1 > x2) {
    const overlap = x1 - x2;
    x1 -= overlap;
    x2 += overlap;
  }

  // Draw "Particles" (Newton's view)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(x1, cy, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath(); ctx.arc(x2, cy, 20, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#888';
  ctx.font = "14px monospace";
  ctx.fillText("PARTICLES: CRASH AND BOUNCE", W / 2 - 100, H - 50);
};

const drawWaveMeeting: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const pulse1Pos = (time * 60) % (W + 400) - 200;
  const pulse2Pos = W - ((time * 60) % (W + 400) - 200);

  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    // Pulse 1
    const d1 = x - pulse1Pos;
    const y1 = 60 * Math.exp(-(d1 * d1) / 1000);
    
    // Pulse 2
    const d2 = x - pulse2Pos;
    const y2 = 60 * Math.exp(-(d2 * d2) / 1000);

    // Superposition: Just add them!
    const yTotal = cy - (y1 + y2);
    
    if (x === 0) ctx.moveTo(x, yTotal);
    else ctx.lineTo(x, yTotal);
  }
  ctx.strokeStyle = '#4ade80';
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.fillText("WAVES: PASS THROUGH LIKE GHOSTS", W / 2 - 100, H - 50);
};

const drawConstructive: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  // Hold them at the center for a moment to show the "Mega-Pulse"
  const offset = Math.max(0, 150 - (time % 10) * 40);
  const p1 = W/2 - offset;
  const p2 = W/2 + offset;

  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y1 = 70 * Math.exp(-((x - p1) * (x - p1)) / 1200);
    const y2 = 70 * Math.exp(-((x - p2) * (x - p2)) / 1200);
    const yTotal = cy - (y1 + y2);
    if (x === 0) ctx.moveTo(x, yTotal);
    else ctx.lineTo(x, yTotal);
  }
  ctx.strokeStyle = '#fbbf24';
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.fillText("CONSTRUCTIVE: 1 + 1 = 2", W / 2 - 60, cy - 120);
};

const drawDestructive: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const offset = Math.max(0, 150 - (time % 10) * 40);
  const p1 = W/2 - offset;
  const p2 = W/2 + offset;

  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y1 = 70 * Math.exp(-((x - p1) * (x - p1)) / 1200);
    const y2 = -70 * Math.exp(-((x - p2) * (x - p2)) / 1200); // Inverse pulse
    const yTotal = cy - (y1 + y2);
    if (x === 0) ctx.moveTo(x, yTotal);
    else ctx.lineTo(x, yTotal);
  }
  ctx.strokeStyle = '#ef4444';
  ctx.stroke();

  ctx.fillStyle = '#ef4444';
  ctx.fillText("DESTRUCTIVE: 1 - 1 = 0", W / 2 - 60, cy - 120);
};

const drawInteractiveInterference: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const phase = map(mouseX, 0, 1, 0, Math.PI * 2);
  
  // Wave 1 (Static)
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + Math.sin(x * 0.02 + time) * 40;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Wave 2 (Mouse Controlled)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + Math.sin(x * 0.02 + time + phase) * 40;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Resulting Wave (The Superposition)
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y1 = Math.sin(x * 0.02 + time) * 40;
    const y2 = Math.sin(x * 0.02 + time + phase) * 40;
    const yTotal = cy + (y1 + y2);
    if (x === 0) ctx.moveTo(x, yTotal); else ctx.lineTo(x, yTotal);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "14px monospace";
  ctx.fillText("GREEN = THE SUM OF BLUE AND YELLOW", 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Slide waves to align them", 50, 75);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_7: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Physics is simple. If two things meet, they crash. Two balls cannot occupy the same space. Boom! Logic.",
    mathTitle: "Particle Collision",
    mathSub: "Solid vs Solid",
    draw: drawBilliardCrash
  },
  {
    speaker: "Huygens",
    text: "But Isaac, have you ever watched ripples in a pond? They don't bounce off each other. They slide right through like ghosts in a hallway.",
    mathTitle: "Wave Nature",
    mathSub: "Non-interacting energy",
    draw: drawWaveMeeting
  },
  {
    speaker: "Young",
    text: "Actually, they DO interact, but they are very polite. They just add their heights together for a moment, then go back to being themselves.",
    mathTitle: "Superposition",
    mathSub: "y_total = y1 + y2",
    draw: drawWaveMeeting
  },
  {
    speaker: "Young",
    text: "If two peaks meet, they team up to make a 'Super-Peak'. This is Constructive Interference. It's like two people lifting a heavy box together.",
    mathTitle: "Constructive",
    mathSub: "Amplitude builds up",
    draw: drawConstructive
  },
  {
    speaker: "Young",
    text: "But if a peak meets a valley... they cancel out. 1 plus -1 is zero. For one split second, the wave literally vanishes.",
    mathTitle: "Destructive",
    mathSub: "Amplitude vanishes",
    draw: drawDestructive
  },
  {
    speaker: "System",
    text: "This is the 'Principle of Superposition.' It means waves don't fight; they just do simple addition.",
    mathTitle: "The Rule",
    mathSub: "The Net displacement is the Sum",
    draw: drawWaveMeeting
  },
  {
    speaker: "Newton",
    text: "So you're saying I can have light + light = darkness? That sounds like witchcraft, Thomas.",
    mathTitle: "The Skeptic",
    mathSub: "Destructive Paradox",
    draw: drawDestructive
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to slide one wave over the other. Watch how the Green line (the result) builds up or disappears.",
    mathTitle: "Wave Mixer",
    mathSub: "Mouse X: Phase Shift",
    draw: drawInteractiveInterference
  }
];
import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions for specific scenes ---

const drawBilliardCrash: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const cycle = (time * 50) % (W + 200);
  let x1 = cycle - 100;
  let x2 = W - (cycle - 100);

  // Simple bounce logic
  if (x1 > x2) {
    const temp = x1;
    x1 = x2;
    x2 = temp;
  }

  ctx.fillStyle = '#ef4444'; // Newton Red
  ctx.beginPath(); ctx.arc(x1, cy, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3b82f6'; // Logic Blue
  ctx.beginPath(); ctx.arc(x2, cy, 20, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#666';
  ctx.font = "14px monospace";
  ctx.fillText("PARTICLES: CRASH AND BOUNCE", W / 2 - 100, H - 50);
};

const drawGhostPass: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const p1 = (time * 60) % (W + 400) - 200;
  const p2 = W - ((time * 60) % (W + 400) - 200);

  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const d1 = x - p1;
    const y1 = 50 * Math.exp(-(d1 * d1) / 1000);
    const d2 = x - p2;
    const y2 = 50 * Math.exp(-(d2 * d2) / 1000);

    // Principle of Superposition: Just add them
    const yTotal = cy - (y1 + y2);
    
    if (x === 0) ctx.moveTo(x, yTotal);
    else ctx.lineTo(x, yTotal);
  }
  ctx.strokeStyle = '#4ade80';
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.fillText("WAVES: THE GHOST SLIDE", W / 2 - 80, H - 50);
};

const drawDoublePeak: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  // Hold them at center
  const offset = Math.abs(Math.sin(time) * 150);
  const p1 = W/2 - offset;
  const p2 = W/2 + offset;

  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y1 = 60 * Math.exp(-((x - p1)**2) / 1200);
    const y2 = 60 * Math.exp(-((x - p2)**2) / 1200);
    const yTotal = cy - (y1 + y2);
    if (x === 0) ctx.moveTo(x, yTotal);
    else ctx.lineTo(x, yTotal);
  }
  ctx.strokeStyle = '#fbbf24';
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.fillText("CONSTRUCTIVE: 1 + 1 = 2", W / 2 - 80, cy - 130);
};

const drawTheEraser: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const offset = Math.abs(Math.sin(time) * 150);
  const p1 = W/2 - offset;
  const p2 = W/2 + offset;

  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y1 = 60 * Math.exp(-((x - p1)**2) / 1200);
    const y2 = -60 * Math.exp(-((x - p2)**2) / 1200); // One is inverted
    const yTotal = cy - (y1 + y2);
    if (x === 0) ctx.moveTo(x, yTotal);
    else ctx.lineTo(x, yTotal);
  }
  ctx.strokeStyle = '#f87171';
  ctx.stroke();

  ctx.fillStyle = '#f87171';
  ctx.fillText("DESTRUCTIVE: 1 - 1 = 0", W / 2 - 80, cy - 130);
};

const drawHeadphones: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  // External Noise (Red)
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
  ctx.beginPath();
  for (let x = 0; x < W/2; x++) {
    const y = cy + Math.sin(x * 0.05 + time * 5) * 30;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Headphone Barrier
  ctx.fillStyle = '#27272a';
  ctx.fillRect(W/2 - 20, cy - 80, 40, 160);
  
  // Anti-Noise (The Silence)
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W/2 + 20, cy);
  ctx.lineTo(W - 50, cy);
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.fillText("NOISE-CANCELING MAGIC", W/2 + 40, cy - 20);
};

const drawInteractiveInterference: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const phase = map(mouseX, 0, 1, 0, Math.PI * 2);
  
  // Source Waves (Ghosted)
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + Math.sin(x * 0.03 + time * 2) * 40;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + Math.sin(x * 0.03 + time * 2 + phase) * 40;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // The Result (The Reality)
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y1 = Math.sin(x * 0.03 + time * 2) * 40;
    const y2 = Math.sin(x * 0.03 + time * 2 + phase) * 40;
    const yTotal = cy + (y1 + y2);
    if (x === 0) ctx.moveTo(x, yTotal); else ctx.lineTo(x, yTotal);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "14px monospace";
  const alignment = Math.cos(phase) > 0.9 ? "CONSTRUCTIVE (Sync!)" : (Math.cos(phase) < -0.9 ? "DESTRUCTIVE (Eraser!)" : "Mixed Vibe");
  ctx.fillText(`STATUS: ${alignment}`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Move mouse to align the ghosts", 50, 75);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_8: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Listen to me, Thomas. If two things meet, they hit. They crash. They bounce. It's common sense!",
    mathTitle: "Particle Logic",
    mathSub: "Solid objects crash",
    draw: drawBilliardCrash
  },
  {
    speaker: "Young",
    text: "Isaac, my dear friend, you are thinking too... solidly. Have you never watched two ripples meet in a pond?",
    mathTitle: "The Observation",
    mathSub: "Waves meet differently",
    draw: drawGhostPass
  },
  {
    speaker: "Young",
    text: "They don't bounce. They slide through each other like polite ghosts. But for the split second they are together, they do a little math.",
    mathTitle: "Superposition",
    mathSub: "y_total = y1 + y2",
    draw: drawGhostPass
  },
  {
    speaker: "Young",
    text: "If their peaks meet, they team up. One plus one equals TWO. This is Constructive Interference—a wave party!",
    mathTitle: "Constructive",
    mathSub: "Peak + Peak = SuperPeak",
    draw: drawDoublePeak
  },
  {
    speaker: "Young",
    text: "But here is the brain-melter: if a peak meets a valley, they cancel out. One minus one equals ZERO.",
    mathTitle: "Destructive",
    mathSub: "Peak + Valley = Flatline",
    draw: drawTheEraser
  },
  {
    speaker: "Newton",
    text: "So you're telling me I can add two lights together and get... darkness? That is the most ridiculous thing I've ever heard.",
    mathTitle: "Newton's Skepticism",
    mathSub: "The Paradox of Zero",
    draw: drawTheEraser
  },
  {
    speaker: "System",
    text: "Actually, Sir Isaac, that 'darkness' is exactly how your noise-canceling headphones work. They play a 'valley' to erase the outside 'peak.'",
    mathTitle: "Modern Tech",
    mathSub: "Active Noise Cancellation",
    draw: drawHeadphones
  },
  {
    speaker: "System",
    text: "Simulation Active. Adjust the phase of the second ghost wave with your mouse. Can you make them team up or disappear?",
    mathTitle: "The Interference Lab",
    mathSub: "Mouse X: Phase Offset",
    draw: drawInteractiveInterference
  }
];
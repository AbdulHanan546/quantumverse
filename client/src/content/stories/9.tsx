import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions ---

const drawPureNotes: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.lineWidth = 2;

  // Wave 1 - Blue
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy - 60 + Math.sin(x * 0.05 + time * 2) * 30;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Wave 2 - Yellow
  ctx.strokeStyle = '#fbbf24';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + 60 + Math.sin(x * 0.05 + time * 2) * 30;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#888';
  ctx.font = "14px monospace";
  ctx.fillText("TWO PERFECT, IDENTICAL NOTES", W / 2 - 100, H - 40);
};

const drawTheThrob: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const f1 = 0.05;
  const f2 = 0.055; // Slightly different frequency

  // Summation (The Beat)
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const s1 = Math.sin(x * f1 + time * 3);
    const s2 = Math.sin(x * f2 + time * 3);
    const y = cy + (s1 + s2) * 60;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // The Envelope (Ghost line)
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const env = Math.cos(x * (f1 - f2) / 2) * 120;
    ctx.lineTo(x, cy + env);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#4ade80';
  ctx.fillText("THE 'THROB' (BEATS)", W / 2 - 60, cy - 140);
};

const drawCarrierPigeon: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  
  // The "Message" (Slow)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const msg = Math.sin(x * 0.01 + time) * 80;
    if (x === 0) ctx.moveTo(x, cy + msg); else ctx.lineTo(x, cy + msg);
  }
  ctx.stroke();

  // The "Carrier" (Fast) carrying the message
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const modulation = (1 + Math.sin(x * 0.01 + time) * 0.5);
    const y = cy + Math.sin(x * 0.2 + time * 10) * 50 * modulation;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#60a5fa';
  ctx.fillText("CARRIER WAVE (PIGEON)", 50, cy - 100);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText("MESSAGE (THE NOTE)", 50, cy + 120);
};

const drawInteractiveAM: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const modDepth = mouseX; // How much the message affects the carrier
  
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    // Standard AM Equation: (1 + m*sin(Wm*t)) * sin(Wc*t)
    const message = Math.sin(x * 0.01 + time * 2);
    const carrier = Math.sin(x * 0.15 + time * 15);
    const y = cy + (1 + message * modDepth) * 60 * carrier;
    
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw the "Envelope" limits
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const env = cy + (1 + Math.sin(x * 0.01 + time * 2) * modDepth) * 60;
    ctx.lineTo(x, env);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Modulation Strength: ${(modDepth * 100).toFixed(0)}%`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Adjust Signal Strength", 50, 75);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_9: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Everything in my universe must be precise. Two tuning forks, both vibrating at exactly 440 wiggles per second. Perfect harmony!",
    mathTitle: "In Sync",
    mathSub: "f1 = f2",
    draw: drawPureNotes
  },
  {
    speaker: "Rayleigh",
    text: "But Isaac, look. If I gently tap the second fork so it wiggles just a tiny bit faster... say 441 wiggles... the sound changes.",
    mathTitle: "The Mismatch",
    mathSub: "f1 ≈ f2",
    draw: drawPureNotes
  },
  {
    speaker: "Newton",
    text: "What is that annoying 'wa-wa-wa' sound? It's like the air is breathing. Is my ear broken?",
    mathTitle: "Beats",
    mathSub: "Interference over time",
    draw: drawTheThrob
  },
  {
    speaker: "System",
    text: "Those are Beats. Because the waves aren't perfectly aligned, they spend half their time helping each other (LOUD) and half their time fighting (QUIET).",
    mathTitle: "Beat Frequency",
    mathSub: "f_beat = |f1 - f2|",
    draw: drawTheThrob
  },
  {
    speaker: "Rayleigh",
    text: "If we can control this 'getting bigger and smaller,' couldn't we use a fast wave to carry a slow message? Like a carrier pigeon?",
    mathTitle: "The Carrier Concept",
    mathSub: "Fast wave + Slow information",
    draw: drawCarrierPigeon
  },
  {
    speaker: "System",
    text: "This is Amplitude Modulation. AM Radio. We take a high-frequency carrier and change its 'strength' (Amplitude) to match your voice.",
    mathTitle: "Amplitude Modulation",
    mathSub: "Shaping the strength",
    draw: drawCarrierPigeon
  },
  {
    speaker: "Newton",
    text: "So your music is just a very fast wave getting 'fat' and 'thin' repeatedly? My eyes hurt just thinking about it.",
    mathTitle: "The Logic",
    mathSub: "y = [1 + m*f(t)] * sin(wt)",
    draw: drawInteractiveAM
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to increase the 'Modulation'. Watch how the message (the slow shape) forces the fast wave to change its size.",
    mathTitle: "Radio Station Lab",
    mathSub: "Mouse X: Modulation Depth (m)",
    draw: drawInteractiveAM
  }
];
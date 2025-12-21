import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawWaveAxes = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.strokeStyle = '#333';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(50, H / 2);
  ctx.lineTo(W - 50, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
};

// --- Scene Draw Functions ---

const drawTravelingWave: DrawFunction = (ctx, W, H, time) => {
  drawWaveAxes(ctx, W, H);
  ctx.strokeStyle = '#06b6d4'; // Cyan
  ctx.lineWidth = 4;
  ctx.beginPath();
  
  for (let x = 50; x < W - 50; x++) {
    // Traveling wave formula: sin(kx - wt)
    const y = Math.sin((x * 0.02) - (time * 2)) * 60;
    if (x === 50) ctx.moveTo(x, H / 2 + y);
    else ctx.lineTo(x, H / 2 + y);
  }
  ctx.stroke();

  // Energy arrow
  ctx.fillStyle = '#06b6d4';
  ctx.font = "14px monospace";
  ctx.fillText("ENERGY MOVING →→→", W / 2 - 50, H / 2 + 100);
};

const drawReflection: DrawFunction = (ctx, W, H, time) => {
  drawWaveAxes(ctx, W, H);
  
  // The "Wall"
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(W - 60, H / 2 - 100, 10, 200);

  // Incoming Wave
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 50; x < W - 60; x++) {
    const y = Math.sin((x * 0.02) - (time * 2)) * 40;
    if (x === 50) ctx.moveTo(x, H / 2 + y);
    else ctx.lineTo(x, H / 2 + y);
  }
  ctx.stroke();

  // Reflected Wave (Coming back)
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.beginPath();
  for (let x = 50; x < W - 60; x++) {
    // Phase flip on reflection (simplified)
    const y = Math.sin((x * 0.02) + (time * 2) + Math.PI) * 40;
    if (x === 50) ctx.moveTo(x, H / 2 + y);
    else ctx.lineTo(x, H / 2 + y);
  }
  ctx.stroke();
};

const drawStandingWave: DrawFunction = (ctx, W, H, time) => {
  drawWaveAxes(ctx, W, H);
  const centerX = W / 2;
  const centerY = H / 2;

  // Standing Wave: sin(kx) * cos(wt)
  ctx.strokeStyle = '#a855f7'; // Purple
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const k = (Math.PI * 4) / (W - 100); // 2 full wiggles
    const y = Math.sin((x - 50) * k) * Math.cos(time * 2) * 80;
    if (x === 50) ctx.moveTo(x, centerY + y);
    else ctx.lineTo(x, centerY + y);
  }
  ctx.stroke();

  // Highlight Nodes
  ctx.fillStyle = '#ef4444';
  const nodeGap = (W - 100) / 4;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(50 + i * nodeGap, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    if (time % 4 < 1) {
        ctx.font = "10px monospace";
        ctx.fillText("NODE (STILL)", 50 + i * nodeGap - 30, centerY - 20);
    }
  }
};

const drawInteractiveResonance: DrawFunction = (ctx, W, H, time, mouseX) => {
  drawWaveAxes(ctx, W, H);
  // User controls the number of "humps" (Harmonics)
  const humps = Math.round(map(mouseX, 0, 1, 1, 6));
  
  ctx.strokeStyle = `hsl(${humps * 40}, 70%, 50%)`;
  ctx.lineWidth = 4;
  
  // Draw the "Envelope" (The ghost limits of the wiggle)
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const k = (Math.PI * humps) / (W - 100);
    const y = Math.sin((x - 50) * k) * 80;
    if (x === 50) ctx.moveTo(x, H / 2 + y);
    else ctx.lineTo(x, H / 2 + y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const k = (Math.PI * humps) / (W - 100);
    const y = -Math.sin((x - 50) * k) * 80;
    if (x === 50) ctx.moveTo(x, H / 2 + y);
    else ctx.lineTo(x, H / 2 + y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Draw the actual moving string
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const k = (Math.PI * humps) / (W - 100);
    const y = Math.sin((x - 50) * k) * Math.sin(time * 3) * 80;
    if (x === 50) ctx.moveTo(x, H / 2 + y);
    else ctx.lineTo(x, H / 2 + y);
  }
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText(`GUITAR MODE: ${humps}`, 60, 60);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#888';
  ctx.fillText("Move mouse to change the note", 60, 85);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_4: StoryStep[] = [
  {
    speaker: "Huygens",
    text: "Look at this wave! It’s magnificent. It starts here and travels across the world to deliver energy somewhere else. It's a traveler!",
    mathTitle: "Travelling Waves",
    mathSub: "Energy moves from A to B",
    draw: drawTravelingWave
  },
  {
    speaker: "Newton",
    text: "Travelling waves are easy, Christiaan. They move, they carry stuff, they're predictable. Boring! What happens if the wave is trapped?",
    mathTitle: "The Skeptic",
    mathSub: "v = f * λ",
    draw: drawTravelingWave
  },
  {
    speaker: "Young",
    text: "Actually, watch what happens when my travelling wave hits a wall. It bounces back, but the new wave crashes into its own reflection!",
    mathTitle: "The Collision",
    mathSub: "Reflection & Interference",
    draw: drawReflection
  },
  {
    speaker: "System",
    text: "When the outgoing wave and the reflected wave perfectly overlap, something weird happens. The energy stops moving left or right.",
    mathTitle: "The Standing Wave",
    mathSub: "Net Energy Flow = 0",
    draw: drawStandingWave
  },
  {
    speaker: "Huygens",
    text: "Wait... it's wiggling as hard as it can, but it's not going anywhere? It's like a jogger on a treadmill!",
    mathTitle: "Dancing in Place",
    mathSub: "Nodes stay still, Antinodes wiggle max.",
    draw: drawStandingWave
  },
  {
    speaker: "Young",
    text: "Exactly. Look at those red dots. Those are 'Nodes.' You could touch the string there and it wouldn't even feel like it's moving. It’s a ghost spot.",
    mathTitle: "Nodes and Antinodes",
    mathSub: "Destructive vs Constructive Interference",
    draw: drawStandingWave
  },
  {
    speaker: "Newton",
    text: "So a guitar string doesn't 'travel'? It just creates these... humps?",
    mathTitle: "Resonance",
    mathSub: "The trapped energy pattern",
    draw: drawStandingWave
  },
  {
    speaker: "System",
    text: "Exactly. Simulation Active. Move your mouse to change the 'Frequency'. See how many humps you can fit on the string. This is how we make different notes!",
    mathTitle: "Interactive Harmonics",
    mathSub: "Mouse X = Frequency / Harmonic Number",
    draw: drawInteractiveResonance
  }
];
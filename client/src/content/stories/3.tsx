import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Assets & Draw Helpers ---

const drawPendulum = (ctx: CanvasRenderingContext2D, cx: number, cy: number, length: number, angle: number) => {
  const x = cx + Math.sin(angle) * length;
  const y = cy + Math.cos(angle) * length;

  // String
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Bob
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  
  return { x, y };
};

const drawEnergyBars = (ctx: CanvasRenderingContext2D, W: number, H: number, ke: number, pe: number) => {
  const barW = 40;
  const maxH = 150;
  const xBase = W - 120;
  const yBase = H - 100;

  // Potential (Blue)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(xBase, yBase, barW, -pe * maxH);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(xBase, yBase, barW, -maxH);
  
  // Kinetic (Red/Orange)
  ctx.fillStyle = '#f97316';
  ctx.fillRect(xBase + 50, yBase, barW, -ke * maxH);
  ctx.strokeRect(xBase + 50, yBase, barW, -maxH);

  ctx.fillStyle = '#888';
  ctx.font = '10px monospace';
  ctx.fillText("STORED", xBase, yBase + 15);
  ctx.fillText("MOTION", xBase + 50, yBase + 15);
};

// --- Draw Functions for specific scenes ---

const drawObservation: DrawFunction = (ctx, W, H, time) => {
  const angle = Math.sin(time * 2) * 0.8;
  drawPendulum(ctx, W / 2, 50, 200, angle);
  
  ctx.fillStyle = '#444';
  ctx.textAlign = 'center';
  ctx.fillText("THE MYSTERY OF THE MID-AIR STOP", W / 2, H - 50);
};

const drawStoredWork: DrawFunction = (ctx, W, H, time) => {
  // We freeze the pendulum at the peak to show "Stored" energy
  const angle = 0.8; 
  const { x, y } = drawPendulum(ctx, W / 2, 50, 200, angle);

  // Height line
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(W / 2, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#3b82f6';
  ctx.fillText("POTENTIAL: 'I'M ABOUT TO FALL!'", x + 20, y);
  drawEnergyBars(ctx, W, H, 0, 1);
};

const drawTheRush: DrawFunction = (ctx, W, H, time) => {
  // Pendulum at the bottom (fastest)
  const angle = 0; 
  drawPendulum(ctx, W / 2, 50, 200, angle);

  // Speed lines
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  for(let i=0; i<3; i++) {
    ctx.beginPath();
    ctx.moveTo(W/2 - 40 + i*40, 250 + 20);
    ctx.lineTo(W/2 - 60 + i*40, 250 + 20);
    ctx.stroke();
  }

  ctx.fillStyle = '#f97316';
  ctx.fillText("KINETIC: 'WWWWEEEEE!'", W / 2 + 30, 265);
  drawEnergyBars(ctx, W, H, 1, 0);
};

const drawTheSwap: DrawFunction = (ctx, W, H, time) => {
  const angle = Math.sin(time * 2.5) * 0.8;
  const { x, y } = drawPendulum(ctx, W / 2, 50, 200, angle);

  // Calculated energy levels
  const pe = map(Math.cos(angle), Math.cos(0.8), 1, 1, 0);
  const ke = 1 - pe;

  drawEnergyBars(ctx, W, H, ke, pe);

  ctx.fillStyle = '#fff';
  ctx.fillText("THE CONSTANT TRADE", W / 2, 300);
};

const drawInteractiveBudget: DrawFunction = (ctx, W, H, time, mouseX) => {
  // Mouse X defines the "Starting Height" (Energy Budget)
  const maxAngle = map(mouseX, 0, 1, 0.1, 1.4);
  const angle = Math.sin(time * 3) * maxAngle;
  
  const { x, y } = drawPendulum(ctx, W / 2, 50, 220, angle);
  
  const pe = map(Math.cos(angle), Math.cos(maxAngle), 1, 1, 0);
  const ke = 1 - pe;

  // Scale bars by total budget
  drawEnergyBars(ctx, W, H, ke * maxAngle, pe * maxAngle);

  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText(`TOTAL SYSTEM ENERGY: ${(maxAngle * 100).toFixed(0)}`, 50, 50);
  ctx.fillStyle = '#888';
  ctx.fillText("Move mouse to give the system a bigger budget", 50, 70);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_3: StoryStep[] = [
  {
    speaker: "Newton",
    text: "I've been watching this ball swing for three hours. It stops at the top, then rushes to the bottom. Where does the 'oomph' go when it stops?",
    mathTitle: "The Pendulum Observation",
    mathSub: "Velocity = 0 at the peaks?",
    draw: drawObservation
  },
  {
    speaker: "Hooke",
    text: "It doesn't vanish, Isaac! It's like a bank account. When you lift it, you're 'depositing' energy. It's just sitting there, waiting.",
    mathTitle: "Potential Energy",
    mathSub: "Energy of Position (Stored)",
    draw: drawStoredWork
  },
  {
    speaker: "Newton",
    text: "So at the very top, it's 'rich' with potential, but it's completely broke in terms of motion?",
    mathTitle: "The Peak",
    mathSub: "PE = Max, KE = 0",
    draw: drawStoredWork
  },
  {
    speaker: "Hooke",
    text: "Exactly. But as it falls, it 'spends' that height to buy speed! At the bottom, it's out of height, but it's never been faster.",
    mathTitle: "Kinetic Energy",
    mathSub: "Energy of Motion",
    draw: drawTheRush
  },
  {
    speaker: "System",
    text: "This is the Great Cosmic Trade. In a perfect world, the sum of 'Stored' and 'Motion' energy never changes. They just swap hats.",
    mathTitle: "Conservation of Energy",
    mathSub: "Total E = KE + PE = Constant",
    draw: drawTheSwap
  },
  {
    speaker: "Newton",
    text: "But in my house, the pendulum eventually stops. Does the energy just... quit?",
    mathTitle: "The Reality Check",
    mathSub: "Where does it go?",
    draw: drawTheSwap
  },
  {
    speaker: "Hooke",
    text: "That's just Friction stealing a little bit every swing and turning it into Heat. The universe is a very strict accountant.",
    mathTitle: "Damping",
    mathSub: "Energy lost to the environment",
    draw: drawTheSwap
  },
  {
    speaker: "System",
    text: "Simulation Active. Adjust the 'Energy Budget' using your mouse. Watch how the trading bars keep the total sum balanced.",
    mathTitle: "Interactive Accountant",
    mathSub: "Mouse X: Amplitude (Energy)",
    draw: drawInteractiveBudget
  }
];
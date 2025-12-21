import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Shared Drawing Helpers ---
const drawSpring = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, coils: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  const step = length / coils;
  for (let i = 0; i < coils; i++) {
    const currY = y + i * step;
    ctx.lineTo(x + width, currY + step * 0.25);
    ctx.lineTo(x - width, currY + step * 0.75);
  }
  ctx.lineTo(x, y + length);
  ctx.stroke();
};

const drawWeight = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 30) => {
  ctx.fillStyle = '#3b82f6';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.fillRect(x - size/2, y, size, size);
  ctx.strokeRect(x - size/2, y, size, size);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x - size/2, y, size/4, size);
};

// --- Scene Draw Functions ---

const drawHookeObsession: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const startY = 100;
  const extension = Math.sin(time * 2) * 50 + 100;
  
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  drawSpring(ctx, centerX, startY, extension, 20, 15);
  drawWeight(ctx, centerX, startY + extension);
  
  // Floor
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(centerX - 100, startY);
  ctx.lineTo(centerX + 100, startY);
  ctx.stroke();

  ctx.fillStyle = '#60a5fa';
  ctx.font = '14px monospace';
  ctx.fillText("HOOKE'S LAW IN ACTION", centerX + 40, startY + extension + 15);
};

const drawTheEquilibrium: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const centerY = H / 2;
  const offset = Math.sin(time * 3) * 150;

  // Equilibrium Line
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(centerX - 200, centerY);
  ctx.lineTo(centerX + 200, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Restoring Force Arrow
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  if (Math.abs(offset) > 10) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + offset);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText("RESTORING FORCE (GET BACK HERE!)", centerX + 20, centerY + offset / 2);
  }

  drawWeight(ctx, centerX, centerY + offset - 15, 40);
};

const drawCircleToWave: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 3;
  const centerY = H / 2;
  const radius = 80;
  
  // 1. Draw Circle
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  const dotX = centerX + Math.cos(time * 2) * radius;
  const dotY = centerY + Math.sin(time * 2) * radius;

  // 2. Draw Moving Dot
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw Projection Line
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#444';
  ctx.beginPath();
  ctx.moveTo(dotX, dotY);
  ctx.lineTo(W - 100, dotY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Draw Sine Wave
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < 400; x++) {
    const tOffset = x * 0.05;
    const y = centerY + Math.sin(time * 2 - tOffset) * radius;
    if (x === 0) ctx.moveTo(centerX + radius + 50 + x, y);
    else ctx.lineTo(centerX + radius + 50 + x, y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.fillText("UP/DOWN IS JUST CIRCLE MOTION", centerX - 50, centerY + radius + 40);
};

const drawPendulumStory: DrawFunction = (ctx, W, H, time) => {
    const centerX = W / 2;
    const startY = 50;
    const length = 250;
    const angle = Math.sin(time * 2) * 0.8;

    const bobX = centerX + Math.sin(angle) * length;
    const bobY = startY + Math.cos(angle) * length;

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.fillText("ENERGY TUG-OF-WAR", centerX - 60, H - 100);
};

const drawInteractiveSHM: DrawFunction = (ctx, W, H, time, mouseX) => {
  const stiffness = map(mouseX, 0, 1, 1, 15);
  const centerX = W / 2;
  const startY = 100;
  
  // Physics Sim-ish
  const freq = Math.sqrt(stiffness);
  const extension = Math.sin(time * freq) * 100 + 150;
  
  ctx.strokeStyle = `hsl(${map(stiffness, 1, 15, 200, 0)}, 70%, 50%)`;
  ctx.lineWidth = map(stiffness, 1, 15, 2, 8);
  drawSpring(ctx, centerX, startY, extension, 20, 20);
  drawWeight(ctx, centerX, startY + extension, 50);

  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText(`Spring Stiffness: ${stiffness.toFixed(1)}`, 50, 80);
  ctx.fillText(`Frequency: ${freq.toFixed(2)} Hz`, 50, 110);
  ctx.fillStyle = '#888';
  ctx.fillText("Move mouse to change 'The Vibe'", 50, H - 50);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_1: StoryStep[] = [
  {
    speaker: "System",
    text: "Meet Robert Hooke. He didn't like Newton much, and he really, REALLY liked springs.",
    mathTitle: "Hooke's Curiosity",
    mathSub: "The Birth of Elasticity",
    draw: drawHookeObsession
  },
  {
    speaker: "Hooke",
    text: "It's simple, really. 'Ut tensio, sic vis.' As the extension, so the force. You pull a spring, it pulls back. The harder you pull, the angrier it gets.",
    mathTitle: "Hooke's Law",
    mathSub: "F = -kx",
    draw: drawHookeObsession
  },
  {
    speaker: "System",
    text: "This 'pulling back' is the soul of Simple Harmonic Motion. We call it the Restoring Force. It just wants to go home to Equilibrium.",
    mathTitle: "Equilibrium",
    mathSub: "The 'Happy' Place",
    draw: drawTheEquilibrium
  },
  {
    speaker: "Newton",
    text: "Robert, stop playing with toys. Look at the stars! Look at a pendulum! It is all the same. Motion that repeats is just the universe vibrating.",
    mathTitle: "Universal Vibration",
    mathSub: "Oscillation is everywhere.",
    draw: drawPendulumStory
  },
  {
    speaker: "System",
    text: "But here is the trick: If you track an object bouncing up and down over time... it draws a perfect Wave. Every bounce is just a circle unfolded.",
    mathTitle: "The Secret Connection",
    mathSub: "SHM = Circular Motion (Side View)",
    draw: drawCircleToWave
  },
  {
    speaker: "Hooke",
    text: "So a clock, a guitar string, and a bridge wobbling in the wind are all just... springs?",
    mathTitle: "The Realization",
    mathSub: "Everything is a spring if you're brave enough.",
    draw: drawTheEquilibrium
  },
  {
    speaker: "System",
    text: "Exactly. Simulation Active. Change the stiffness of the world. Notice how a 'tighter' world vibrates faster.",
    mathTitle: "Interactive Mode",
    mathSub: "Mouse X: Stiffness (k)",
    draw: drawInteractiveSHM
  }
];
import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const planckLaw = (lambda: number, T: number) => {
  const c1 = 1;
  const c2 = 0.2;
  if (lambda <= 0) return 0;
  return (c1 / Math.pow(lambda, 5)) * (1 / (Math.exp(c2 / (lambda * T)) - 1));
};

const rayleighJeans = (lambda: number, T: number) => {
  if (lambda <= 0) return 0;
  return (T * 0.05) / Math.pow(lambda, 4);
};

const drawAxes = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(50, H - 50);
  ctx.lineTo(W - 50, H - 50);
  ctx.stroke();
  ctx.fillStyle = '#888';
  ctx.font = "12px monospace";
  ctx.fillText("Frequency (UV →)", W - 150, H - 30);
  ctx.fillText("Intensity", 60, 60);
};

// --- Draw Functions for specific scenes ---

const drawFurnace: DrawFunction = (ctx, W, H, time) => {
  const pulse = Math.sin(time) * 0.1 + 0.9;
  const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W / 2);
  grad.addColorStop(0, `rgba(245, 158, 11, ${0.4 * pulse})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(W / 2 - 100, H / 2 - 100, 200, 200);
};

const drawWaves: DrawFunction = (ctx, W, H, time) => {
  ctx.strokeStyle = '#444';
  ctx.strokeRect(W / 2 - 150, H / 2 - 100, 300, 200);
  ctx.lineWidth = 2;
  const modes = [1, 2, 3, 5, 8];
  modes.forEach((m, i) => {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(245, 158, 11, ${1 - i * 0.15})`;
    const yBase = (H / 2 - 80) + i * 35;
    for (let x = 0; x <= 300; x++) {
      const y = Math.sin(x * m * 0.02) * Math.sin(time * m * 0.5) * 15;
      ctx.lineTo((W / 2 - 150) + x, yBase + y);
    }
    ctx.stroke();
  });
};

const drawCatastrophe: DrawFunction = (ctx, W, H) => {
  drawAxes(ctx, W, H);
  const T = 0.5;
  
  // Rayleigh (Red)
  ctx.beginPath();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  for (let x = 0; x < W - 100; x += 5) {
    const lambda = map(x, 0, W, 0.1, 2.0);
    const yVal = rayleighJeans(lambda, T);
    const plotY = (H - 50) - yVal * 200;
    if (x === 0) ctx.moveTo(50 + x, plotY);
    else ctx.lineTo(50 + x, plotY);
  }
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.fillText("Classical Theory (Infinity)", W - 250, 100);
};

const drawComparison: DrawFunction = (ctx, W, H) => {
  // Draw red line first
  drawCatastrophe(ctx, W, H, 0, 0); // Reuse previous logic
  const T = 0.5;

  // Draw Planck (Green)
  ctx.beginPath();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  for (let x = 0; x < W - 100; x += 5) {
    const lambda = map(x, 0, W, 0.1, 2.0);
    const yVal = planckLaw(lambda, T);
    const plotY = (H - 50) - yVal * 8000;
    if (x === 0) ctx.moveTo(50 + x, plotY);
    else ctx.lineTo(50 + x, plotY);
  }
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.fillText("Reality (Planck)", W - 250, 150);
};

const drawPackets: DrawFunction = (ctx, W, H) => {
  const startX = W / 2 - 100;
  const startY = H - 100;
  
  // Continuous
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX - 100, startY);
  ctx.lineTo(startX - 50, startY - 100);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.fillText("Continuous", startX - 120, startY + 20);

  // Discrete
  ctx.fillStyle = '#10b981';
  for (let i = 0; i < 5; i++) {
    const size = 20;
    ctx.fillRect(startX + 50, startY - i * size * 1.5 - size, size, size);
    ctx.fillStyle = '#fff';
    ctx.font = "10px monospace";
    ctx.fillText("hf", startX + 80, startY - i * size * 1.5 - 5);
    ctx.fillStyle = '#10b981';
  }
  ctx.fillText("Discrete (n*hf)", startX + 50, startY + 20);
};

const drawInteractive: DrawFunction = (ctx, W, H, _, mouseX) => {
  drawAxes(ctx, W, H);
  const T = Math.max(0.1, mouseX + 0.1); 

  const hue = 60 * (T * 2);
  ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
  ctx.lineWidth = 4;

  ctx.beginPath();
  const points = [];
  for (let x = 0; x < W - 100; x += 5) {
    const lambda = map(x, 0, W, 0.1, 2.0);
    const yVal = planckLaw(lambda, T);
    const plotY = (H - 50) - yVal * 6000;
    points.push({ x: 50 + x, y: plotY });
  }

  if (points.length > 0) {
    ctx.moveTo(points[0].x, H - 50);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H - 50);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Temperature: ${(T * 5000).toFixed(0)} K`, 60, 60);
};


// --- THE SCRIPT ARRAY ---

export const planckScript: StoryStep[] = [
  {
    speaker: "System",
    text: "The year is 1900. Physics is perfect. Except for one small problem with 'The Furnace'.",
    mathTitle: "Blackbody Radiation",
    mathSub: "Object Temperature: T",
    draw: drawFurnace
  },
  {
    speaker: "Rayleigh",
    text: "Consider a hot oven. The walls vibrate. These vibrations produce light waves (modes).",
    mathTitle: "Standing Waves",
    mathSub: "Modes inside a cavity",
    draw: drawWaves
  },
  {
    speaker: "System",
    text: "According to Classical Physics, opening your oven should blast you with infinite Ultraviolet radiation. This is the UV Catastrophe.",
    mathTitle: "The UV Catastrophe",
    mathSub: "Intensity → ∞ as Freq → ∞",
    draw: drawCatastrophe
  },
  {
    speaker: "Planck",
    text: "This is unacceptable. Nature does not explode. The curve MUST come back down.",
    mathTitle: "Experimental Data",
    mathSub: "The Bell Curve",
    draw: drawComparison
  },
  {
    speaker: "Planck",
    text: "I must make a desperate assumption. What if energy is not continuous? What if it comes in packets?",
    mathTitle: "Quantization",
    mathSub: "E = n h f",
    draw: drawPackets
  },
  {
    speaker: "System",
    text: "Simulation Active. Adjust the Temperature using your mouse. Observe how the peak shifts (Wien's Law).",
    mathTitle: "Interactive Mode",
    mathSub: "Mouse X: Temperature",
    draw: drawInteractive
  }
];
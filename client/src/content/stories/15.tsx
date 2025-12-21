import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawCandle: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2 + 50;
  
  // Flicker logic
  const flicker = Math.sin(time * 10) * 2 + Math.random() * 2;
  
  // Candle Body
  ctx.fillStyle = '#d4d4d8';
  ctx.fillRect(cx - 10, cy, 20, 60);
  
  // Flame Glow
  const grad = ctx.createRadialGradient(cx, cy - 20, 5, cx, cy - 20, 50 + flicker);
  grad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy - 20, 60 + flicker, 0, Math.PI * 2); ctx.fill();
  
  // Flame
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40 - flicker);
  ctx.quadraticCurveTo(cx + 10, cy - 10, cx, cy);
  ctx.quadraticCurveTo(cx - 10, cy - 10, cx, cy - 40 - flicker);
  ctx.fill();

  ctx.fillStyle = '#666';
  ctx.font = "14px monospace";
  ctx.fillText("ONE SOURCE: FINITE ENERGY", cx - 80, H - 40);
};

const drawEnergyDelivery: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const sourceX = 100;
  const targetX = W - 100;

  // Draw Wave
  ctx.strokeStyle = '#3f3f46';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(sourceX, cy);
  ctx.lineTo(targetX, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  // Energy Packets (The "Mail")
  for (let i = 0; i < 8; i++) {
    const x = (sourceX + (i * 100 + time * 150)) % (targetX + 50);
    if (x < sourceX) continue;
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, cy + Math.sin(x * 0.05 + time * 5) * 20, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#fbbf24';
  ctx.fillText("ENERGY FLOW: DELIVERY IN PROGRESS", W / 2 - 100, cy + 60);
};

const drawSpreadingBubble: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;
  const radius = (time * 60) % (W / 2 + 100);
  
  // The Source
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();

  // The Expanding Bubble (The same energy spreading out)
  ctx.strokeStyle = `rgba(251, 191, 36, ${map(radius, 0, W/2, 1, 0)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // "Butter" analogy text
  if (radius > 100) {
      ctx.fillStyle = '#888';
      ctx.font = "10px monospace";
      ctx.fillText("SAME ENERGY", cx + radius, cy);
      ctx.fillText("BIGGER AREA", cx + radius, cy + 15);
  }
};

const drawTheThinning: DrawFunction = (ctx, W, H, time) => {
  const cx = 100;
  const cy = H / 2;
  
  // Rays spreading
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
  for(let i = -5; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(W, cy + i * 100);
    ctx.stroke();
  }

  // Two "Detector" Windows
  const d1 = 200;
  const d2 = 500;
  
  ctx.lineWidth = 3;
  // Window 1: Close (Bright)
  ctx.strokeStyle = '#4ade80';
  ctx.strokeRect(d1, cy - 30, 10, 60);
  ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
  ctx.fillRect(d1, cy - 30, 10, 60);
  
  // Window 2: Far (Dim)
  ctx.strokeStyle = '#ef4444';
  ctx.strokeRect(d2, cy - 30, 10, 60);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
  ctx.fillRect(d2, cy - 30, 10, 60);

  ctx.fillStyle = '#fff';
  ctx.fillText("DENSE ENERGY", d1 - 30, cy + 50);
  ctx.fillText("THIN ENERGY", d2 - 30, cy + 50);
};

const drawInteractiveIntensity: DrawFunction = (ctx, W, H, time, mouseX) => {
  const sourceX = 100;
  const cy = H / 2;
  const observerX = map(mouseX, 0, 1, 150, W - 50);
  
  // Distance
  const dist = observerX - sourceX;
  // Intensity Law: 1/d^2
  const intensity = 10000 / (dist * dist);
  
  // Draw Source (Light Bulb)
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(sourceX, cy, 20, 0, Math.PI * 2); ctx.fill();
  
  // Light Glow
  const glow = ctx.createRadialGradient(sourceX, cy, 10, sourceX, cy, dist);
  glow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(sourceX, cy, dist, -Math.PI/4, Math.PI/4); 
  ctx.lineTo(sourceX, cy); ctx.fill();

  // Draw Observer (The Book)
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  const brightness = Math.min(255, intensity * 200);
  ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness * 0.5})`;
  ctx.fillRect(observerX, cy - 40, 10, 80);
  ctx.strokeRect(observerX, cy - 40, 10, 80);

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Distance: ${dist.toFixed(0)} units`, 50, 50);
  ctx.fillText(`Intensity: ${(intensity * 100).toFixed(1)}%`, 50, 80);
  
  if (intensity < 0.1) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText("NEWTON CAN'T READ! TOO DIM!", 50, 110);
  } else if (intensity > 1.5) {
      ctx.fillStyle = '#4ade80';
      ctx.fillText("PERFECT BRIGHTNESS", 50, 110);
  }

  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Move the book away from the source", 50, H - 30);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_15: StoryStep[] = [
  {
    speaker: "System",
    text: "Isaac Newton is trying to save money on his electric bill. Unfortunately, light bulbs haven't been invented yet. He's stuck with a candle.",
    mathTitle: "The Source",
    mathSub: "Power (P) = Energy per second",
    draw: drawCandle
  },
  {
    speaker: "Newton",
    text: "I can't see a thing! I'm sitting right here, and the words are blurry. Christiaan, did you steal my glasses again?",
    mathTitle: "The Complaint",
    mathSub: "Low light levels",
    draw: drawCandle
  },
  {
    speaker: "Huygens",
    text: "Isaac, energy is like a delivery service. The candle is sending out 'mail' in every direction at once. But it only has so many stamps.",
    mathTitle: "Energy Flow",
    mathSub: "Energy Transport",
    draw: drawEnergyDelivery
  },
  {
    speaker: "Huygens",
    text: "Think of it like spreading a tiny bit of butter over a giant piece of bread. The further you go, the thinner the butter gets.",
    mathTitle: "Intensity",
    mathSub: "I = Power / Area",
    draw: drawSpreadingBubble
  },
  {
    speaker: "Newton",
    text: "So the candle sends out the same amount of 'oomph,' but because the 'bubble' of light grows, I only catch a tiny fraction of it?",
    mathTitle: "The Realization",
    mathSub: "Surface Area of Sphere = 4πr²",
    draw: drawTheThinning
  },
  {
    speaker: "System",
    text: "Exactly. If you double your distance, the light has to cover four times the area. The 'thickness' of the light—the Intensity—drops like a stone.",
    mathTitle: "Inverse Square Law",
    mathSub: "Intensity ∝ 1 / Distance²",
    draw: drawTheThinning
  },
  {
    speaker: "Newton",
    text: "This is why stars look like dots! They are giant furnaces, but the 'butter' has been spread across the entire galaxy by the time it reaches my eye.",
    mathTitle: "Cosmic Scale",
    mathSub: "Distance is the enemy of Intensity",
    draw: drawTheThinning
  },
  {
    speaker: "System",
    text: "Simulation Active. Move the 'Book' using your mouse. Watch how the intensity crashes as you move away. Physics is harsh on cheap readers.",
    mathTitle: "Intensity Lab",
    mathSub: "Mouse X: Distance (r)",
    draw: drawInteractiveIntensity
  }
];
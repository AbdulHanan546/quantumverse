import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawHeavyEnergy: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const pulseX = (time * 150) % (W + 200) - 100;
  
  // The "Power" wave - thick and chaotic
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const dist = x - pulseX;
    const envelope = Math.exp(-(dist * dist) / 2000);
    const y = cy + (Math.sin(x * 0.05 + time * 10) * 80 * envelope);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // A heavy block at the end that gets "hit"
  const targetX = W - 100;
  const isHit = Math.abs(pulseX - targetX) < 50;
  ctx.fillStyle = isHit ? '#ef4444' : '#27272a';
  ctx.fillRect(targetX, cy - 40 - (isHit ? 20 : 0), 60, 80);
  
  ctx.fillStyle = '#666';
  ctx.font = "14px monospace";
  ctx.fillText("ENERGY: THE PHYSICAL PUSH", W / 2 - 100, H - 40);
};

const drawBinaryInfo: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const bits = [1, 0, 1, 1, 0, 1];
  
  ctx.lineWidth = 2;
  bits.forEach((bit, i) => {
    const xBase = (i * 100 + time * 100) % (W + 200) - 100;
    if (xBase < -50 || xBase > W + 50) return;

    if (bit === 1) {
      ctx.strokeStyle = '#4ade80';
      ctx.beginPath();
      for (let dx = -40; dx < 40; dx++) {
        const y = cy - Math.cos(dx * 0.1) * 30 * Math.exp(-(dx * dx) / 400);
        ctx.lineTo(xBase + dx, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.fillText("1", xBase - 5, cy - 50);
    } else {
      ctx.strokeStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(xBase - 40, cy);
      ctx.lineTo(xBase + 40, cy);
      ctx.stroke();
      ctx.fillStyle = '#166534';
      ctx.fillText("0", xBase - 5, cy - 20);
    }
  });

  ctx.fillStyle = '#4ade80';
  ctx.fillText("INFORMATION: THE ORGANIZED PATTERN", W / 2 - 120, H - 40);
};

const drawTruckLetter: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;
  
  // The "Truck" (Carrier/Energy)
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.lineWidth = 40;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  // The "Letter" (The Envelope/Info)
  const x = (time * 120) % (W + 200) - 100;
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 30, cy - 20, 60, 40);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(x - 30, cy - 20, 60, 40);
  ctx.beginPath();
  ctx.moveTo(x - 30, cy - 20); ctx.lineTo(x, cy); ctx.lineTo(x + 30, cy - 20);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.fillText("ENERGY IS THE VEHICLE. INFO IS THE PASSENGER.", cx - 180, cy + 80);
};

const drawInteractiveSignal: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  
  // Mouse X controls the "Quality" of the message
  const noise = map(mouseX, 0, 1, 0, 50);
  
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    // Pure info pattern + random noise
    const signal = Math.sin(x * 0.05 + time * 5) > 0 ? 40 : -40;
    const randomness = (Math.random() - 0.5) * noise;
    const y = cy + signal + randomness;
    
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Signal-to-Noise Ratio: ${(100 - mouseX * 100).toFixed(0)}%`, 50, 50);
  
  if (mouseX > 0.8) {
    ctx.fillStyle = '#ef4444';
    ctx.fillText("CRITICAL ERROR: MESSAGE LOST IN THE MUSCLE", 50, 80);
  } else {
    ctx.fillStyle = '#4ade80';
    ctx.fillText("MESSAGE CLEAR", 50, 80);
  }

  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Add 'Noise' (Useless Energy)", 50, H - 30);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_16: StoryStep[] = [
  {
    speaker: "Newton",
    text: "I love energy! It's so... physical. You push a rock, the rock moves. You send a wave, it smashes a boat. It's about 'The Big Oomph.'",
    mathTitle: "Energy Transport",
    mathSub: "Doing work over distance",
    draw: drawHeavyEnergy
  },
  {
    speaker: "System",
    text: "But Isaac, if I just scream at you for ten hours, I'm sending lots of energy, but I'm not actually *saying* anything. That's just noise.",
    mathTitle: "The Difference",
    mathSub: "Raw Energy vs. Data",
    draw: drawHeavyEnergy
  },
  {
    speaker: "Einstein",
    text: "Exactly! To send a message, the energy needs a 'shape.' Information is the *order* of the wiggles. It's the difference between a random puddle and Morse Code.",
    mathTitle: "Information",
    mathSub: "Patterns in the medium",
    draw: drawBinaryInfo
  },
  {
    speaker: "System",
    text: "Think of it like this: Energy is the Truck. Information is the Letter inside the truck. You can't send the letter without a truck, but the truck isn't the reason you're writing.",
    mathTitle: "The Analogy",
    mathSub: "Carrier vs. Content",
    draw: drawTruckLetter
  },
  {
    speaker: "Einstein",
    text: "And here is the law: the truck has a speed limit. Nothing—not even the most important gossip in the universe—can travel faster than light.",
    mathTitle: "The Speed Limit",
    mathSub: "Signal speed ≤ c",
    draw: drawTruckLetter
  },
  {
    speaker: "Newton",
    text: "Wait, so if I wiggle a 1,000-mile long rope, doesn't the other end move instantly? Doesn't the 'Information' win?",
    mathTitle: "The Rope Paradox",
    mathSub: "Rigidity vs Speed of Light",
    draw: drawHeavyEnergy
  },
  {
    speaker: "Einstein",
    text: "No, Isaac. The 'wiggle' itself is a wave of energy. It has to travel through the atoms of the rope. Information is always a slave to the speed of the energy carrying it.",
    mathTitle: "Physical Limits",
    mathSub: "Causality",
    draw: drawBinaryInfo
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to add 'Noise' to the signal. See how using too much messy energy can actually destroy the information you're trying to send.",
    mathTitle: "Signal Lab",
    mathSub: "Mouse X: Energy Noise Level",
    draw: drawInteractiveSignal
  }
];
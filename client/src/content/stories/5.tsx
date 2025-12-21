import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions for specific scenes ---

const drawLazyRope: DrawFunction = (ctx, W, H, time) => {
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, H / 2);
  ctx.lineTo(W - 100, H / 2);
  ctx.stroke();
  
  ctx.fillStyle = '#888';
  ctx.font = "14px monospace";
  ctx.fillText("ROPE AT REST: NO GOSSIP", W / 2 - 80, H / 2 + 30);
};

const drawTheBump: DrawFunction = (ctx, W, H, time) => {
  const speed = 5;
  const pulseCenter = (time * 100) % (W + 200) - 100;
  
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const dist = x - pulseCenter;
    const y = H / 2 - 80 * Math.exp(-(dist * dist) / 1000);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#06b6d4';
  ctx.fillText("THE 'GHOST' OF MOTION", pulseCenter - 50, H / 2 - 100);
};

const drawConnectedSprings: DrawFunction = (ctx, W, H, time) => {
  const nodes = 15;
  const spacing = (W - 200) / nodes;
  
  for (let i = 0; i <= nodes; i++) {
    const x = 100 + i * spacing;
    const yOffset = Math.sin(time * 2 - i * 0.5) * 40;
    const y = H / 2 + yOffset;

    // Neighbor pull lines
    if (i < nodes) {
      const nextY = H / 2 + Math.sin(time * 2 - (i + 1) * 0.5) * 40;
      ctx.strokeStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(100 + (i + 1) * spacing, nextY);
      ctx.stroke();
    }

    // The "Neighbor" dots
    ctx.fillStyle = i === 7 ? '#4ade80' : '#1e40af';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    if (i === 7) {
      ctx.fillStyle = '#4ade80';
      ctx.font = "10px monospace";
      ctx.fillText("PULLED BY FRIENDS", x - 40, y - 15);
    }
  }
};

const drawCurvature: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  for (let x = 100; x < W - 100; x++) {
    const y = cy + Math.sin(x * 0.02 - time * 3) * 60;
    if (x === 100) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    
    // Draw "Acceleration" vectors at peaks
    if (x % 40 === 0) {
      const accel = -Math.sin(x * 0.02 - time * 3) * 30;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - 1, y, 2, accel);
    }
  }
  ctx.stroke();
  
  ctx.fillStyle = '#ef4444';
  ctx.fillText("BENT ROPE = FORCE", W / 2 - 50, 80);
};

const drawInteractiveWave: DrawFunction = (ctx, W, H, time, mouseX) => {
  const speed = map(mouseX, 0, 1, 1, 10);
  const freq = 0.02;
  
  ctx.strokeStyle = `hsl(${map(speed, 1, 10, 200, 0)}, 80%, 60%)`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    // The solution to the wave equation: f(x - vt)
    const y = H / 2 + Math.sin((x - time * speed * 20) * freq) * 80;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Wave Speed (v): ${speed.toFixed(2)}`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Adjust Tension / Speed", 50, 75);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_5: StoryStep[] = [
  {
    speaker: "System",
    text: "This is a rope. Left to itself, it does nothing. It is perfectly content being a straight line.",
    mathTitle: "Equilibrium",
    mathSub: "y(x,t) = 0",
    draw: drawLazyRope
  },
  {
    speaker: "Huygens",
    text: "But watch! If I flick one end, a 'bump' travels to the other side. The rope doesn't move across the room, but the information does.",
    mathTitle: "Traveling Pulse",
    mathSub: "Energy on the move",
    draw: drawTheBump
  },
  {
    speaker: "Newton",
    text: "This is just a collection of particles. If I pull one up, it pulls its neighbor. It's just my Second Law applied over and over!",
    mathTitle: "Peer Pressure",
    mathSub: "F = ma (Neighbor Edition)",
    draw: drawConnectedSprings
  },
  {
    speaker: "Hooke",
    text: "Exactly, Isaac! Every tiny piece of the rope is like a little spring connected to its friends. If the rope is 'bent', it wants to snap back.",
    mathTitle: "Restoring Force",
    mathSub: "Force proportional to 'Bend'",
    draw: drawCurvature
  },
  {
    speaker: "System",
    text: "So here's the secret: The 'Bounciness' (Acceleration) of a spot is perfectly tied to the 'Curviness' of that spot. That's the Wave Equation.",
    mathTitle: "The Master Rule",
    mathSub: "∂²y/∂t² = v² ∂²y/∂x²",
    draw: drawCurvature
  },
  {
    speaker: "Newton",
    text: "Wait, so you're saying the 'Curviness' tells the rope how fast to accelerate? That's... surprisingly elegant. Even for you, Hooke.",
    mathTitle: "The Insight",
    mathSub: "Acceleration ∝ Curvature",
    draw: drawCurvature
  },
  {
    speaker: "System",
    text: "And the 'v' in that equation? That's the speed. If the rope is tighter, the gossip travels faster. If it's heavy and lazy, the wave slows down.",
    mathTitle: "Wave Speed",
    mathSub: "v = √(Tension / Heaviness)",
    draw: drawInteractiveWave
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to adjust the tension of the universe. Watch how the 'Rulebook' handles faster waves.",
    mathTitle: "Interactive Wave",
    mathSub: "v² is the control variable",
    draw: drawInteractiveWave
  }
];
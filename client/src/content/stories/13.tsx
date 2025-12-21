import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Functions ---

const drawHardWall: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const wallX = W - 100;
  
  // Draw the wall
  ctx.fillStyle = '#444';
  ctx.fillRect(wallX, cy - 100, 20, 200);

  // Pulse logic
  const x = (time * 150) % (wallX * 2);
  let pulseX = x;
  let isReflected = false;

  if (x > wallX) {
    pulseX = wallX - (x - wallX);
    isReflected = true;
  }

  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let dx = -100; dx < 100; dx++) {
    const worldX = pulseX + dx;
    if (worldX > wallX) continue;
    const envelope = Math.exp(-(dx * dx) / 800);
    // Hard wall reflection flips the wave!
    const y = cy + (isReflected ? 1 : -1) * 60 * envelope;
    if (dx === -100) ctx.moveTo(worldX, y);
    else ctx.lineTo(worldX, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#ef4444';
  ctx.font = "14px monospace";
  ctx.fillText("FIXED END: THE 'UP-SIDE-DOWN' KICK", W / 2 - 100, H - 40);
};

const drawFreeEnd: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const endX = W - 100;
  
  // Draw the ring/pole
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(endX, cy - 100); ctx.lineTo(endX, cy + 100); ctx.stroke();
  
  const x = (time * 150) % (endX * 2);
  let pulseX = x;
  let isReflected = false;

  if (x > endX) {
    pulseX = endX - (x - endX);
    isReflected = true;
  }

  // Draw a little ring
  const ringY = cy - 60 * Math.exp(-( (isReflected ? endX - pulseX : pulseX - endX)**2 ) / 800);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(endX, ringY, 8, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let dx = -100; dx < 100; dx++) {
    const worldX = pulseX + dx;
    if (worldX > endX) continue;
    const envelope = Math.exp(-(dx * dx) / 800);
    // Free end stays upright
    const y = cy - 60 * envelope;
    if (dx === -100) ctx.moveTo(worldX, y);
    else ctx.lineTo(worldX, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.fillText("FREE END: THE 'STAY-RIGHT-UP' SLIDE", W / 2 - 100, H - 40);
};

const drawTransition: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const boundaryX = W / 2;

  // Draw two ropes
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#3b82f6'; // Thin rope
  ctx.beginPath(); ctx.moveTo(50, cy); ctx.lineTo(boundaryX, cy); ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#94a3b8'; // Thick rope
  ctx.beginPath(); ctx.moveTo(boundaryX, cy); ctx.lineTo(W - 50, cy); ctx.stroke();

  const cycle = (time * 100) % (W + 200);
  const pulsePos = cycle - 100;

  ctx.beginPath();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;

  for (let x = 50; x < W - 50; x++) {
    let y = cy;
    if (pulsePos < boundaryX) {
      // Before hit
      const d = x - pulsePos;
      y -= 50 * Math.exp(-(d * d) / 600);
    } else {
      // After hit: Split into Reflected and Transmitted
      if (x < boundaryX) {
        const dRef = x - (2 * boundaryX - pulsePos);
        y += 20 * Math.exp(-(dRef * dRef) / 600); // Bounced (flipped)
      } else {
        const dTrans = (x - boundaryX) * 2 + (boundaryX - pulsePos);
        y -= 30 * Math.exp(-(dTrans * dTrans) / 600); // Transmitted (upright, slower)
      }
    }
    if (x === 50) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.fillText("THIN ROPE → THICK ROPE", 50, cy + 60);
};

const drawInteractiveBoundary: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const boundaryX = W / 2;
  
  // Mouse controls the weight of the second rope
  const thickness = map(mouseX, 0, 1, 2, 20);
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(boundaryX, cy); ctx.stroke();
  ctx.lineWidth = thickness;
  ctx.strokeStyle = '#666';
  ctx.beginPath(); ctx.moveTo(boundaryX, cy); ctx.lineTo(W, cy); ctx.stroke();

  const cycle = (time * 120) % (W + 200);
  const pulsePos = cycle - 100;

  ctx.beginPath();
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 4;

  for (let x = 0; x < W; x++) {
    let y = cy;
    if (pulsePos < boundaryX) {
      y -= 50 * Math.exp(-( (x-pulsePos)**2 ) / 600);
    } else {
      if (x < boundaryX) {
        const reflAmp = map(thickness, 2, 20, 0, 50);
        const dRef = x - (2 * boundaryX - pulsePos);
        y += reflAmp * Math.exp(-(dRef * dRef) / 600);
      } else {
        const transAmp = map(thickness, 2, 20, 50, 10);
        const stretch = map(thickness, 2, 20, 1, 3);
        const dTrans = (x - boundaryX) * stretch + (boundaryX - pulsePos);
        y -= transAmp * Math.exp(-(dTrans * dTrans) / 600);
      }
    }
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Medium Density: ${(mouseX * 100).toFixed(0)}%`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Make the second rope heavier", 50, 75);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_13: StoryStep[] = [
  {
    speaker: "System",
    text: "Imagine a wave is like a polite runner. It’s moving along its path, perfectly happy, until it hits... THE END.",
    mathTitle: "Boundary Encounter",
    mathSub: "The Edge of the World",
    draw: drawHardWall
  },
  {
    speaker: "Newton",
    text: "It hits a wall! It should just stop. Newton’s Laws! An object hits a wall, it stays at the wall. End of story.",
    mathTitle: "The Brick Wall",
    mathSub: "Fixed Boundary",
    draw: drawHardWall
  },
  {
    speaker: "Huygens",
    text: "No, Isaac! The wave is energy. It can't just 'stop.' The wall doesn't want it, so the wall kicks it back. But because the wall is so stiff, it flips the wave upside down on its way out!",
    mathTitle: "Reflection",
    mathSub: "Phase inversion (180° flip)",
    draw: drawHardWall
  },
  {
    speaker: "Newton",
    text: "Fine. It flips. But what if the end isn't a wall? What if it's just a loose ring on a pole? It has nothing to kick against!",
    mathTitle: "Free Boundary",
    mathSub: "The Loose End",
    draw: drawFreeEnd
  },
  {
    speaker: "Huygens",
    text: "Then the wave just slides up and comes back exactly as it arrived. No flip, no attitude. Just a happy return journey.",
    mathTitle: "Reflection",
    mathSub: "In-phase reflection",
    draw: drawFreeEnd
  },
  {
    speaker: "System",
    text: "But life isn't always walls and rings. Sometimes, the 'neighborhood' just gets tougher. Like moving from a thin string to a heavy chain.",
    mathTitle: "Transmission",
    mathSub: "Changing the Medium",
    draw: drawTransition
  },
  {
    speaker: "Huygens",
    text: "Look! When it hits the heavy chain, the wave has a mid-life crisis. Some energy bounces back (Reflection), but some energy struggles forward into the new material (Transmission).",
    mathTitle: "Energy Splitting",
    mathSub: "Part Reflected, Part Transmitted",
    draw: drawTransition
  },
  {
    speaker: "Newton",
    text: "It slowed down! The wave in the heavy chain is shorter and more sluggish. It's like trying to run through mud.",
    mathTitle: "Conservation",
    mathSub: "v = fλ (Frequency stays same!)",
    draw: drawTransition
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to change the weight of the second rope. See how much of the wave survives the transition!",
    mathTitle: "Transmission Lab",
    mathSub: "Mouse X: Second Rope Density",
    draw: drawInteractiveBoundary
  }
];
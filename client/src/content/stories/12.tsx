import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Functions ---

const drawWaveGroup: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const x = (time * 100) % (W + 200) - 100;
  
  // Draw a tight packet
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let dx = -100; dx < 100; dx++) {
    const worldX = x + dx;
    const envelope = Math.exp(-(dx * dx) / 1000);
    const y = cy + Math.sin(dx * 0.2) * 60 * envelope;
    if (dx === -100) ctx.moveTo(worldX, y);
    else ctx.lineTo(worldX, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#666';
  ctx.font = "14px monospace";
  ctx.fillText("THE PACKET: A BUNDLE OF ENERGY", W / 2 - 100, H - 40);
};

const drawVacuumRace: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const x = (time * 150) % (W + 200) - 100;
  
  // In vacuum, all frequencies stay together
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let dx = -100; dx < 100; dx++) {
    const worldX = x + dx;
    const envelope = Math.exp(-(dx * dx) / 1000);
    const y = cy + Math.sin(dx * 0.2) * 60 * envelope;
    if (dx === -100) ctx.moveTo(worldX, y);
    else ctx.lineTo(worldX, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#60a5fa';
  ctx.fillText("VACUUM: EVERYONE STAYS IN FORMATION", 50, 50);
};

const drawDispersionRace: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const t = (time % 10);
  const centerX = t * 100;
  
  // Dispersion means width increases with time
  const width = 100 + t * 50; 
  const amplitude = 80 * (100 / width); // Energy spreads out, so height drops

  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const dx = x - centerX;
    const envelope = Math.exp(-(dx * dx) / (width * 10));
    // wiggles inside move at different speed than the pack
    const y = cy + Math.sin(dx * 0.15 - t * 10) * amplitude * envelope;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#f87171';
  ctx.fillText("DISPERSION: THE GROUP IS SPLITTING UP!", 50, 50);
};

const drawPrismLogic: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;

  // Prism triangle
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 80);
  ctx.lineTo(cx - 100, cy + 80);
  ctx.lineTo(cx + 100, cy + 80);
  ctx.closePath();
  ctx.stroke();

  // White light in
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, cy + 20);
  ctx.lineTo(cx - 40, cy + 20);
  ctx.stroke();

  // Rainbow out (Simplified dispersion)
  const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#4ade80', '#3b82f6', '#8b5cf6'];
  colors.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(W, cy + i * 20 - 40);
    ctx.stroke();
  });

  ctx.fillStyle = '#fff';
  ctx.fillText("NEWTON'S PRISM: RED IS FAST, BLUE IS SLOW", 50, H - 40);
};

const drawInteractiveDispersion: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const t = time % 8;
  const centerX = t * 100;
  
  // Mouse X controls how "thick" the material is (Dispersion constant)
  const thickness = map(mouseX, 0, 1, 0, 150);
  const currentWidth = 40 + t * thickness;
  const currentAmp = 100 * (40 / currentWidth);

  ctx.strokeStyle = `hsl(${map(mouseX, 0, 1, 120, 0)}, 80%, 60%)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const dx = x - centerX;
    const envelope = Math.exp(-(dx * dx) / (currentWidth * 10));
    const y = cy + Math.sin(dx * 0.2 - t * 20) * currentAmp * envelope;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Material Thickness: ${(mouseX * 100).toFixed(0)}%`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Adjust how much the 'Road' slows down different waves", 50, 75);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_12: StoryStep[] = [
  {
    speaker: "System",
    text: "Imagine a wave packet is a school bus full of kids. In empty space, the bus drives perfectly. Everyone arrives at the same time.",
    mathTitle: "The Vacuum",
    mathSub: "No Dispersion",
    draw: drawVacuumRace
  },
  {
    speaker: "Newton",
    text: "But put that bus in a prism or a pool of water, and things get messy. I noticed this with my prisms—light isn't just one thing; it's a team.",
    mathTitle: "The Spectrum",
    mathSub: "Refraction Index n(λ)",
    draw: drawPrismLogic
  },
  {
    speaker: "Huygens",
    text: "Exactly, Isaac! A wave packet is made of many different frequencies. And in a material, the blue kids want to run at one speed, and the red kids at another.",
    mathTitle: "Speed Mismatch",
    mathSub: "Velocity depends on Frequency",
    draw: drawWaveGroup
  },
  {
    speaker: "System",
    text: "This is Dispersion. Because the 'kids' move at different speeds, the bus starts to stretch. The tight group of waves begins to spread out across the road.",
    mathTitle: "Dispersion",
    mathSub: "Packet Spreading over Time",
    draw: drawDispersionRace
  },
  {
    speaker: "Huygens",
    text: "As it spreads, the packet gets flatter and wider. It’s losing its 'identity' as a single spot of energy and becoming a blurry mess.",
    mathTitle: "The Blur",
    mathSub: "Energy density drops",
    draw: drawDispersionRace
  },
  {
    speaker: "Newton",
    text: "So if I wait long enough, my 'particle' of light will be spread across the whole room? That sounds like a very unorganized universe.",
    mathTitle: "Consequence",
    mathSub: "Localization is temporary",
    draw: drawDispersionRace
  },
  {
    speaker: "System",
    text: "Precisely. This is why fiber-optic cables have to be so special. If the signal disperses too much, the internet 'bits' crash into each other!",
    mathTitle: "Real World",
    mathSub: "Signal Integrity",
    draw: drawInteractiveDispersion
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to change the material's 'stretching power.' Watch how a tight packet becomes a long smear as you increase the thickness.",
    mathTitle: "Dispersion Lab",
    mathSub: "Mouse X: Group Velocity Dispersion",
    draw: drawInteractiveDispersion
  }
];
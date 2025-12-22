import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// Gaussian function for Wave Packets
const gaussian = (x: number, center: number, sigma: number) => {
  return Math.exp(-Math.pow(x - center, 2) / (2 * Math.pow(sigma, 2)));
};

// --- Draw Functions ---

// Scene 1: Classical Determinism (Newton's Clockwork)
const drawNewtonOrbit: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2 - 50;
  const radius = 100;

  // Sun
  ctx.fillStyle = '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#f59e0b';
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Orbit Path
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Planet (Predictable)
  const angle = time * 2;
  const px = cx + Math.cos(angle) * radius;
  const py = cy + Math.sin(angle) * radius;

  ctx.fillStyle = '#3b82f6'; // Newton Blue
  ctx.beginPath();
  ctx.arc(px, py, 10, 0, Math.PI * 2);
  ctx.fill();

  // Prediction Line (Tangent)
  ctx.strokeStyle = '#3b82f6';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px - Math.sin(angle) * 100, py + Math.cos(angle) * 100);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = '#888';
  ctx.font = "12px monospace";
  ctx.fillText("Position: KNOWN", 50, 50);
  ctx.fillText("Velocity: KNOWN", 50, 70);
};

// Scene 2 & 3: The Measurement Problem (Microscope)
const drawMicroscope: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2 - 20;

  // The Electron (Dark until hit)
  ctx.fillStyle = '#06b6d4'; // Cyan
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText("Electron", cx - 20, cy + 25);

  // The Photon (Incoming)
  const loopTime = time % 4; // 0 to 4
  
  if (loopTime < 2) {
    // Incoming
    const px = map(loopTime, 0, 2, 50, cx);
    const py = map(loopTime, 0, 2, cy - 100, cy);
    
    ctx.fillStyle = '#eab308'; // Yellow Photon
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Light Trail
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 10, py - 10);
    ctx.lineTo(px + 10, py + 10); // Wave squiggle roughly
    ctx.stroke();
  } else {
    // Impact!
    // Explosion graphic
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    for(let i=0; i<8; i++) {
        const ang = i * (Math.PI/4);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang)*10, cy + Math.sin(ang)*10);
        ctx.lineTo(cx + Math.cos(ang)*30, cy + Math.sin(ang)*30);
        ctx.stroke();
    }
    
    // Electron flies off randomly
    const flyTime = loopTime - 2;
    const ex = cx + flyTime * 100;
    const ey = cy + flyTime * 50; // Down and right
    
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("???", ex + 10, ey);
  }
};

// Scene 4: Wave Packet Logic
const drawWavePacket: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2 - 50;
  
  ctx.strokeStyle = '#d946ef'; // Fuchsia for Heisenberg
  ctx.lineWidth = 2;
  ctx.beginPath();

  // Draw a static Gaussian packet to show "Location"
  for (let x = 0; x < W; x+=2) {
    const packet = gaussian(x, W/2, 60); // Medium width
    const wave = Math.cos((x - time * 50) * 0.1); // Carrier wave
    const y = cy + packet * wave * 80;
    
    if (x===0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#fff';
  ctx.font = "14px monospace";
  ctx.fillText("Particle is a WAVE PACKET", W/2 - 100, cy - 100);
  
  // Arrows indicating spread
  ctx.strokeStyle = '#888';
  ctx.beginPath();
  ctx.moveTo(W/2 - 60, cy + 100);
  ctx.lineTo(W/2 + 60, cy + 100);
  ctx.stroke();
  ctx.fillText("Δx (Position Uncertainty)", W/2 - 80, cy + 120);
};

// Scene 5: Interactive Uncertainty
const drawUncertaintyInteractive: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2 - 50; // Center Y of the wave
  const cx = W / 2;

  // Map mouse to Delta X (Width of the trap)
  // Mouse Left = Very precise position (Small Delta X)
  // Mouse Right = Very vague position (Large Delta X)
  const deltaX = map(mouseX, 0, 1, 10, 200); 
  
  // Calculate Delta P (Momentum Uncertainty) inversely proportional
  // We simulate this by making the wave oscillate faster/chaotically if Delta X is small
  const deltaP = 500 / deltaX; 

  // Visualizing the "Trap" or the Window of Possibility
  ctx.fillStyle = 'rgba(217, 70, 239, 0.1)';
  // Adjusted height to not go too deep into the bottom
  ctx.fillRect(cx - deltaX, 50, deltaX * 2, H / 2 + 50); 
  
  ctx.strokeStyle = '#d946ef';
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(cx - deltaX, 50, deltaX * 2, H / 2 + 50);
  ctx.setLineDash([]);

  // Draw the Quantum Wave function inside
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let x = cx - deltaX - 50; x < cx + deltaX + 50; x += 2) {
    // The envelope is the position
    const envelope = gaussian(x, cx, deltaX * 0.6);
    
    // The frequency (Momentum) gets chaotic if deltaP is high
    const jitter = (deltaP > 20) ? Math.sin(time * deltaP * 0.2) : 1;
    const freq = 0.1 + (deltaP * 0.005); 
    
    const wave = Math.cos((x - cx) * freq - time * 5 * jitter);
    
    const y = cy - envelope * wave * 80;
    
    if (x === cx - deltaX - 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Text Info
  ctx.fillStyle = '#fff';
  ctx.font = "16px monospace";
  ctx.fillText(`Δx (Position): ${deltaX.toFixed(0)}`, 50, 50);
  
  ctx.fillStyle = deltaP > 20 ? '#ef4444' : '#10b981'; // Red if dangerous, Green if calm
  ctx.fillText(`Δp (Momentum): ${deltaP.toFixed(1)}`, 50, 80);
  
  // --- FIX: Positioned at cy + 130 to be lower than before, but above the box ---
  if(deltaX < 30) {
    ctx.textAlign = "center";
    ctx.fillStyle = '#ef4444';
    ctx.font = "bold 16px monospace";
    ctx.fillText("⚠ WARNING: MOMENTUM UNKNOWN! ⚠", cx, cy + 130);
    ctx.textAlign = "left"; // Reset alignment
  }
};


// --- THE SCRIPT ---

export const SCRIPT_44: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Welcome to my clockwork universe. Here, if I know where a planet is and how fast it's moving, I know its entire future. It is absolute.",
    mathTitle: "Classical Mechanics",
    mathSub: "Future = Present + Physics",
    draw: drawNewtonOrbit
  },
  {
    speaker: "Heisenberg",
    text: "That's cute, Isaac. Really. But that only works for big, clunky things like planets. Down here in the quantum basement, things get... fuzzy.",
    mathTitle: "The Quantum Realm",
    mathSub: "Scale: 10⁻³⁴ meters",
    draw: drawNewtonOrbit // Keep same drawing to show the contrast coming next
  },
  {
    speaker: "Heisenberg",
    text: "Let's try to find an electron. To 'see' it, you need to bounce light off it. Like using a flashlight in a dark room.",
    mathTitle: "The Measurement",
    mathSub: "Observation requires Interaction",
    draw: drawMicroscope
  },
  {
    speaker: "Heisenberg",
    text: "But light carries a punch! If I use a high-energy photon to see exactly WHERE the electron is... SMACK! I launch it into oblivion.",
    mathTitle: "The Trade-off",
    mathSub: "High Precision = High Impact",
    draw: drawMicroscope
  },
  {
    speaker: "Schrödinger",
    text: "It is not just a clumsy tool, Werner. It is the nature of the beast. The particle is not a dot. It is a wave.",
    mathTitle: "Wave-Particle Duality",
    mathSub: "ψ(x, t)",
    draw: drawWavePacket
  },
  {
    speaker: "Heisenberg",
    text: "Exactly. A localized wave (a blip) has no single wavelength. No wavelength means no defined momentum. You can't know both.",
    mathTitle: "Uncertainty Principle",
    mathSub: "Δx · Δp ≥ ħ/2",
    draw: drawWavePacket
  },
  {
    speaker: "System",
    text: "INTERACTIVE: Move your mouse Left/Right. Squeeze the position (Left) and watch the Momentum (Energy/Speed) go chaotic.",
    mathTitle: "Squeeze the Wave",
    mathSub: "Mouse X determines Δx",
    draw: drawUncertaintyInteractive
  },
  {
    speaker: "Heisenberg",
    text: "So, you can know where you are, or where you're going. But never both. Nature keeps her secrets.",
    mathTitle: "The End",
    mathSub: "Probability rules all",
    draw: drawUncertaintyInteractive
  }
];
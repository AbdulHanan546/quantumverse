import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const drawBox = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  const margin = 100;
  const bottom = H - 150; // Keep space for dialogue box
  const top = 100;
  const left = 100;
  const right = W - 100;

  // The Box Walls
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left, top - 50);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, top - 50);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#888';
  ctx.font = "12px monospace";
  ctx.fillText("x = 0", left - 20, bottom + 20);
  ctx.fillText("x = L", right - 20, bottom + 20);
  
  return { left, right, top, bottom, width: right - left, height: bottom - top };
};

// --- Draw Functions ---

const drawQuantumLow: DrawFunction = (ctx, W, H, time) => {
  const box = drawBox(ctx, W, H);
  
  // Quantum Wave n=2
  const n = 2;
  ctx.beginPath();
  ctx.strokeStyle = '#a78bfa'; // Schrödinger Violet
  ctx.lineWidth = 4;

  for (let x = 0; x <= box.width; x++) {
    // Wave function psi
    const psi = Math.sin((n * Math.PI * x) / box.width);
    // Time evolution (phasor rotation real part)
    const wave = psi * Math.sin(time * 2); 
    
    const px = box.left + x;
    const py = box.bottom - (wave * 100) - 50; // Lifted up a bit

    if (x === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.fillStyle = '#a78bfa';
  ctx.fillText(`Quantum State (n=${n})`, box.left + 20, box.top);
  ctx.fillText("Distinct peaks and valleys", box.left + 20, box.top + 20);
};

const drawNewtonBall: DrawFunction = (ctx, W, H, time) => {
  const box = drawBox(ctx, W, H);
  
  // Classical Particle Physics
  // It just bounces back and forth at constant speed
  const period = 100; // frames for one trip
  const progress = (time * 50) % (box.width * 2);
  let xPos = 0;
  
  if (progress < box.width) {
    xPos = progress;
  } else {
    xPos = box.width - (progress - box.width);
  }

  // Draw Path (Trail)
  ctx.fillStyle = 'rgba(96, 165, 250, 0.2)'; // Blue trail
  ctx.fillRect(box.left, box.bottom - 60, box.width, 20);
  
  // The Ball
  ctx.beginPath();
  ctx.fillStyle = '#60a5fa'; // Newton Blue
  ctx.arc(box.left + xPos, box.bottom - 50, 15, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#60a5fa';
  ctx.fillText("Classical Particle", box.left + 20, box.top);
  ctx.fillText("Probability is equal everywhere (Uniform)", box.left + 20, box.top + 20);
};

const drawConflict: DrawFunction = (ctx, W, H, time) => {
  const box = drawBox(ctx, W, H);
  
  // Draw Classical (Flat Line representation of probability)
  ctx.strokeStyle = '#60a5fa'; // Blue
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(box.left, box.bottom - 100);
  ctx.lineTo(box.right, box.bottom - 100);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#60a5fa';
  ctx.fillText("Newton: Flat Line (50%)", box.left + 10, box.bottom - 110);

  // Draw Quantum (Probability Density |psi|^2)
  const n = 3;
  ctx.strokeStyle = '#a78bfa'; // Violet
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= box.width; x++) {
    const psi = Math.sin((n * Math.PI * x) / box.width);
    const prob = psi * psi; // Squared!
    
    const px = box.left + x;
    const py = box.bottom - (prob * 180); 

    if (x === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  
  // Highlight the gap
  ctx.fillStyle = '#ef4444';
  ctx.fillText("GAP! Zero probability here!", box.left + box.width/3, box.bottom - 10);
};

const drawRisingN: DrawFunction = (ctx, W, H, time) => {
  const box = drawBox(ctx, W, H);
  
  // Animate n increasing
  const n = 1 + Math.floor(time * 2) % 20; 

  ctx.strokeStyle = '#22d3ee'; // Cyan (Bohr/Matter Waves)
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x <= box.width; x++) {
    const psi = Math.sin((n * Math.PI * x) / box.width);
    const prob = psi * psi; 
    
    const px = box.left + x;
    const py = box.bottom - (prob * 150); 

    if (x === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  
  // Fill it to show "density"
  ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
  ctx.lineTo(box.right, box.bottom);
  ctx.lineTo(box.left, box.bottom);
  ctx.fill();

  ctx.fillStyle = '#22d3ee';
  ctx.font = "24px monospace";
  ctx.fillText(`Energy Level: n = ${n}`, W/2 - 100, box.top);
};

const drawInteractiveLimit: DrawFunction = (ctx, W, H, time, mouseX) => {
  const box = drawBox(ctx, W, H);
  
  // Map mouse to n (1 to 100)
  const n = Math.floor(map(mouseX, 0, 1, 1, 100));
  
  // Classical Average Line
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(box.left, box.bottom - 75); // Average height
  ctx.lineTo(box.right, box.bottom - 75);
  ctx.stroke();
  ctx.setLineDash([]);

  // Quantum Draw
  ctx.strokeStyle = n > 50 ? '#fff' : '#22d3ee'; // Turn white as it matches classical
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x <= box.width; x+=2) { // Step 2 for performance on high n
    const psi = Math.sin((n * Math.PI * x) / box.width);
    const prob = psi * psi; 
    
    const px = box.left + x;
    const py = box.bottom - (prob * 150); 

    if (x === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Instructions
  ctx.fillStyle = '#fff';
  ctx.font = "20px monospace";
  ctx.fillText(`n = ${n}`, W - 100, 110);
  
  if (n > 80) {
    ctx.fillStyle = '#10b981';
    ctx.fillText("CORRESPONDENCE REACHED", W/2 - 120, box.top + 30);
  }
};

// --- THE SCRIPT ---

export const SCRIPT_48: StoryStep[] = [
  {
    speaker: "System",
    text: "Welcome to the border control. We are checking the boundary between the Quantum Realm and the Real World.",
    mathTitle: "The Quantum Box",
    mathSub: "Low Energy State",
    draw: drawQuantumLow
  },
  {
    speaker: "Schrödinger",
    text: "Look at this beauty. A particle trapped in a box. It's not a dot, it's a standing wave. It has peaks where it exists, and nodes where it doesn't.",
    mathTitle: "Wave Function",
    mathSub: "ψ(x) = sin(nπx/L)",
    draw: drawQuantumLow
  },
  {
    speaker: "Newton",
    text: "Excuse me? That's ridiculous. If I throw a ball in a box, it bounces back and forth. It doesn't magically vanish in the middle.",
    mathTitle: "Classical Mechanics",
    mathSub: "F = ma",
    draw: drawNewtonBall
  },
  {
    speaker: "Newton",
    text: "In my world, if you take a photo of the ball, it has an EQUAL chance of being anywhere in the box. A flat line of probability. Not these lumps.",
    mathTitle: "Uniform Probability",
    mathSub: "P(x) = constant",
    draw: drawNewtonBall
  },
  {
    speaker: "System",
    text: "He has a point. Quantum mechanics says there are 'forbidden' spots in the box. Classical mechanics says the ball flows smoothly. Who is lying?",
    mathTitle: " The Conflict",
    mathSub: "Discrete vs Continuous",
    draw: drawConflict
  },
  {
    speaker: "Bohr",
    text: "Neither. Don't fight, gentlemen. Niels Bohr here. We just need to scale up. Schrödinger, crank up the energy level 'n'.",
    mathTitle: "Raising Energy",
    mathSub: "n → ∞",
    draw: drawRisingN
  },
  {
    speaker: "Schrödinger",
    text: "Increasing quantum number... n=5... n=10... The waves are getting squeezed tighter together.",
    mathTitle: "High Frequency",
    mathSub: "More nodes, more peaks",
    draw: drawRisingN
  },
  {
    speaker: "Heisenberg",
    text: "Look what's happening! The peaks are so close together, your clumsy human eyes can't tell them apart anymore. It's blurring!",
    mathTitle: "The Blur Effect",
    mathSub: "Uncertainty in measurement",
    draw: drawRisingN
  },
  {
    speaker: "Bohr",
    text: "Exactly. The Correspondence Principle. When quantum numbers get huge (like in a baseball), the quantum weirdness averages out to Classical Physics.",
    mathTitle: "Correspondence Principle",
    mathSub: "Quantum Limit = Classical",
    draw: drawInteractiveLimit
  },
  {
    speaker: "System",
    text: "Use your mouse to increase 'n'. Watch the jagged quantum peaks blend into Newton's flat line.",
    mathTitle: "Interactive Limit",
    mathSub: "Slide Mouse Right →",
    draw: drawInteractiveLimit
  }
];
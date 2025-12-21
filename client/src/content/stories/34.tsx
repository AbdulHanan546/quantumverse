import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---

// A simple wave packet function: sin(kx) * gaussian envelope
const psi = (x: number, offset: number, width: number) => {
  const k = 10; // Wavenumber
  const envelope = Math.exp(-0.5 * Math.pow((x - offset) / width, 2));
  return Math.sin(x * k) * envelope;
};

// --- Draw Functions ---

// Scene 1: Newton's Particle (Deterministic)
const drawNewton: DrawFunction = (ctx, W, H, time) => {
  ctx.clearRect(0, 0, W, H);
  
  // Grid
  ctx.strokeStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(0, H/2);
  ctx.lineTo(W, H/2);
  ctx.stroke();

  // The Particle
  const x = (time * 100) % W;
  const y = H / 2;

  // Trajectory Line
  ctx.strokeStyle = '#3b82f6'; // Blue
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, H/2);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.setLineDash([]);

  // The Ball
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Label
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText(`x = ${x.toFixed(0)} (Precisely here)`, x - 60, y - 20);
};

// Scene 2: Schrödinger's Wave (The Smear)
const drawWaveFunction: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2;
  ctx.strokeStyle = '#8b5cf6'; // Violet
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let px = 0; px < W; px++) {
    // Map pixel to logical x (-5 to 5)
    const logicalX = (px - W/2) / 50;
    const val = psi(logicalX, Math.sin(time) * 2, 1.5); // Oscillating center
    
    const py = centerY - val * 100;
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.fillStyle = '#a78bfa';
  ctx.fillText("Ψ (The Wave Function)", W/2 - 50, H/2 - 120);
};

// Scene 3: The Conflict (The Smeared Electron)
const drawSmear: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2 + Math.sin(time) * 100;
  const centerY = H / 2;

  // Draw the "Ghostly" smear
  const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 100);
  grad.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Violet center
  grad.addColorStop(1, 'rgba(139, 92, 246, 0)');   // Transparent edge

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Question marks
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.fillText("Is the electron chopped up?", centerX - 100, centerY + 120);
};

// Scene 4: Born's Rule (Squaring the Wave)
const drawBornRule: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2;
  
  // 1. Draw Axis
  ctx.strokeStyle = '#444';
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(W, centerY);
  ctx.stroke();

  // 2. Draw Ψ (Violet, Faint)
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let px = 0; px < W; px++) {
    const logicalX = (px - W/2) / 60;
    const val = psi(logicalX, 0, 1.0);
    const py = centerY - val * 100;
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // 3. Draw |Ψ|² (Purple/Pink, Bold, Filled)
  ctx.fillStyle = 'rgba(192, 38, 211, 0.2)'; // Fuchsia fill
  ctx.strokeStyle = '#c026d3'; // Fuchsia line
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  for (let px = 0; px < W; px++) {
    const logicalX = (px - W/2) / 60;
    const val = psi(logicalX, 0, 1.0);
    // SQUARE IT!
    const prob = val * val; 
    
    const py = centerY - prob * 200; // Scale up for visibility
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.lineTo(W, centerY); // Close shape
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c026d3';
  ctx.font = '24px monospace';
  ctx.fillText("|Ψ|² = Probability", W/2 - 80, centerY - 220);
  ctx.font = '14px monospace';
  ctx.fillText("No negative numbers allowed.", W/2 - 80, centerY - 190);
};

// Scene 5: Interactive Probability Cloud
const drawCloud: DrawFunction = (ctx, W, H, time, mouseX) => {
  const centerY = H / 2;
  
  // Mouse X controls the "Spread" (Uncertainty)
  // Low mouse X = Sharp peak (Newton-ish)
  // High mouse X = Wide spread (Quantum)
  const width = 0.2 + mouseX * 2.5; 
  
  // Draw the Probability Curve (Guide)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  for (let px = 0; px < W; px++) {
    const logicalX = (px - W/2) / 100;
    // Simple Gaussian for the "Likelihood"
    const val = Math.exp(-0.5 * Math.pow(logicalX / width, 2));
    const py = centerY - val * 150;
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Draw Random "Hits" (The Electron being found)
  // We simulate "measuring" the electron 100 times per frame
  ctx.fillStyle = '#4ade80'; // Green (Measurement found)
  
  for(let i=0; i<50; i++) {
    // Rejection sampling to find a random X based on the curve
    let randomX = (Math.random() - 0.5) * 10; // -5 to 5
    let probabilityAtX = Math.exp(-0.5 * Math.pow(randomX / width, 2));
    
    // If dice roll is lower than probability, draw a dot there
    if (Math.random() < probabilityAtX) {
      const screenX = W/2 + randomX * 100;
      // Random Y scatter for visual "Cloud" effect, though physics is 1D here
      const screenY = centerY + (Math.random() - 0.5) * 100 * probabilityAtX; 
      
      ctx.fillRect(screenX, screenY, 2, 2);
    }
  }

  // Label
  ctx.fillStyle = '#fff';
  ctx.fillText(`Uncertainty Width: ${width.toFixed(2)}`, 20, 30);
  ctx.fillStyle = '#4ade80';
  ctx.fillText("dots = where the electron MIGHT be", 20, 50);
};


// --- THE SCRIPT ---

export const SCRIPT_34: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Welcome to the good old days. Look at this particle. I know exactly where it is (x) and where it is going (v). Simple. Clean. Perfect.",
    mathTitle: "Classical Determinism",
    mathSub: "x(t) = x₀ + vt",
    draw: drawNewton
  },
  {
    speaker: "Schrödinger",
    text: "Isaac, that is archaic. Experiments show matter behaves like a wave. It ripples. It oscillates.",
    mathTitle: "Wave Mechanics",
    mathSub: "Ψ(x, t)",
    draw: drawWaveFunction
  },
  {
    speaker: "Schrödinger",
    text: "My equation describes this wave perfectly! The electron isn't a point... it's physically smeared out across space. Like butter on toast.",
    mathTitle: "Charge Density?",
    mathSub: "electron = blob?",
    draw: drawSmear
  },
  {
    speaker: "System",
    text: "Error: Measurement failed. When we put a detector in the room, we don't catch 'half an electron'. We catch one whole electron, or nothing.",
    mathTitle: "The Measurement Problem",
    mathSub: "Observation ≠ Smear",
    draw: drawSmear // Re-use smear but maybe flash it in future iterations
  },
  {
    speaker: "Born",
    text: "Erwin, my friend, you are taking it too literally. It's not a physical wave of butter. It's a wave of INFORMATION.",
    mathTitle: "The Born Rule",
    mathSub: "P(x) = |Ψ|²",
    draw: drawBornRule
  },
  {
    speaker: "Born",
    text: "The wave (Ψ) can be negative. Probabilities cannot. So we square it. Where the wave is tall, the electron is LIKELY to be found.",
    mathTitle: "Probability Density",
    mathSub: "Height = Luck",
    draw: drawBornRule
  },
  {
    speaker: "Heisenberg",
    text: "Exactly. You don't know where it IS. You only know where it MIGHT be. Nature is a casino.",
    mathTitle: "Uncertainty",
    mathSub: "Δx Δp ≥ ħ/2",
    draw: drawCloud
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse left/right to change the wave's spread. The green dots are where we actually find the electron when we look.",
    mathTitle: "Interactive Cloud",
    mathSub: "Mouse X: Uncertainty Spread",
    draw: drawCloud
  }
];
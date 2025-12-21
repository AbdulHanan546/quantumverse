import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math / Canvas Helpers ---

const drawGrid = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < W; x += 40) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = 0; y < H; y += 40) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();
};

const drawParticle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;
};

// --- Scene Drawing Functions ---

// 1. Classical State: Predictable trajectory
const drawClassicalState: DrawFunction = (ctx, W, H, time) => {
  drawGrid(ctx, W, H);
  
  // A projectile motion path
  const speed = 100;
  const t = (time * speed) % W; 
  const startY = H - 50;
  
  // Trajectory calculation
  const x = t;
  const y = startY - (1.5 * x) + (0.003 * x * x); // Parabola

  // Draw Path history
  ctx.beginPath();
  ctx.strokeStyle = '#60a5fa'; // Blue-400
  ctx.lineWidth = 2;
  for (let i = 0; i < x; i+=5) {
    const py = startY - (1.5 * i) + (0.003 * i * i);
    if (py < H) ctx.lineTo(i, py);
  }
  ctx.stroke();

  if (y < H) drawParticle(ctx, x, y, '#60a5fa');
  
  // Label
  ctx.fillStyle = '#60a5fa';
  ctx.font = '14px monospace';
  ctx.fillText(`State = { x: ${x.toFixed(0)}, v: 100 }`, x + 15, y);
};

// 2. The Bohr Atom: Discrete States
const drawBohrOrbit: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;
  
  // Nucleus
  drawParticle(ctx, cx, cy, '#f59e0b');

  // Orbits
  [60, 100, 140].forEach((r, i) => {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; // Cyan
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Electron jumping
  const jumpSpeed = 2;
  const stage = Math.floor(time * 0.5) % 3; // 0, 1, 2
  const radii = [60, 100, 140];
  const currentR = radii[stage];
  
  const angle = time * 2;
  const ex = cx + Math.cos(angle) * currentR;
  const ey = cy + Math.sin(angle) * currentR;

  drawParticle(ctx, ex, ey, '#22d3ee');
  
  ctx.fillStyle = '#22d3ee';
  ctx.fillText(`n = ${stage + 1}`, ex + 15, ey - 15);
};

// 3. De Broglie: The Standing Wave
const drawStandingWave: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;
  const rBase = 120;
  
  drawParticle(ctx, cx, cy, '#f59e0b'); // Nucleus

  ctx.beginPath();
  ctx.strokeStyle = '#22d3ee'; // Cyan
  ctx.lineWidth = 3;

  // Draw sine wave wrapped around circle
  // n=4 mode
  const n = 4; 
  for (let a = 0; a <= Math.PI * 2.05; a += 0.05) {
    const waveHeight = Math.sin(a * n + time * 3) * 20;
    const r = rBase + waveHeight;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#22d3ee';
  ctx.fillText("Orbit is not a path.", cx - 60, cy + 180);
  ctx.fillText("It is a frequency.", cx - 55, cy + 200);
};

// 4. Heisenberg: The Blur
const drawUncertainty: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cx = W / 2;
  const cy = H / 2;

  // Mouse creates "Measurement" which tightens position but scrambles momentum (color)
  const focus = mouseX; // 0 to 1
  const spread = 150 * (1 - focus) + 10; // Large spread if no focus
  
  // Draw random dots (probability cloud)
  for (let i = 0; i < 200; i++) {
    // Random gaussian-ish
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.random() * spread; 
    const x = cx + Math.cos(ang) * rad + Math.sin(time * 5 + i) * 5; // Jitter
    const y = cy + Math.sin(ang) * rad + Math.cos(time * 3 + i) * 5;

    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random momentum colors
    ctx.fillRect(x, y, 2, 2);
  }

  // Draw "Measurement" Box
  if (focus > 0.8) {
    ctx.strokeStyle = '#e879f9'; // Fuchsia
    ctx.strokeRect(cx - 20, cy - 20, 40, 40);
    ctx.fillStyle = '#e879f9';
    ctx.fillText("Position Known!", cx + 30, cy);
    ctx.fillText("Velocity: ???", cx + 30, cy + 20);
  } else {
    ctx.fillStyle = '#e879f9';
    ctx.fillText("Where is it?", cx - 40, cy + 180);
  }
};

// 5. Schrödinger: The Wave Function
const drawWaveFunction: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;

  // Draw 3D-ish grid floor
  ctx.strokeStyle = '#555';
  ctx.beginPath();
  for(let i=-200; i<=200; i+=50) {
      ctx.moveTo(cx - 200, cy + 100 + i/4);
      ctx.lineTo(cx + 200, cy + 100 + i/4);
  }
  ctx.stroke();

  // Draw the PSI function (complex wave)
  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6'; // Violet
  ctx.lineWidth = 3;
  
  let prevX = cx - 200;
  let prevY = cy;

  for (let x = -200; x <= 200; x += 5) {
    // Gaussian envelope * Sine wave
    const envelope = Math.exp(-(x * x) / 5000); 
    const wave = Math.sin(x * 0.1 - time * 4);
    const yOffset = envelope * wave * 80;
    
    const screenX = cx + x;
    const screenY = cy - yOffset; // y is up

    if (x === -200) ctx.moveTo(screenX, screenY);
    else ctx.lineTo(screenX, screenY);
    
    prevX = screenX;
    prevY = screenY;
  }
  ctx.stroke();

  // Label
  ctx.fillStyle = '#8b5cf6';
  ctx.font = '24px serif';
  ctx.fillText("Ψ(x, t)", cx + 50, cy - 100);
};

// 6. Born: The Probability Density (Interactive)
const drawProbability: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cx = W / 2;
  const cy = H / 2;
  
  // Mouse X controls the "Superposition" balance between two states
  const mix = mouseX; // 0 = State A, 1 = State B

  // Draw axis
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, cy + 100);
  ctx.lineTo(W, cy + 100);
  ctx.stroke();

  // Draw probability curve |Psi|^2
  ctx.beginPath();
  ctx.fillStyle = 'rgba(192, 132, 252, 0.4)'; // Purple transparent
  ctx.strokeStyle = '#c084fc'; // Purple

  for (let x = 0; x < W; x += 5) {
    const relativeX = (x - cx) / 100;
    
    // State A: Peak on left
    const psiA = Math.exp(-Math.pow(relativeX + 1.5, 2));
    // State B: Peak on right
    const psiB = Math.exp(-Math.pow(relativeX - 1.5, 2));
    
    // Superposition
    const psiTotal = (1 - mix) * psiA + (mix) * psiB;
    const prob = psiTotal * psiTotal; // Born rule: Square it!

    const plotY = (cy + 100) - prob * 200;

    if (x === 0) ctx.moveTo(x, plotY);
    else ctx.lineTo(x, plotY);
  }
  ctx.lineTo(W, cy + 100);
  ctx.fill();
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#fff';
  ctx.fillText("Move Mouse: Change State Mix", 20, 40);
  
  if (mix < 0.2) ctx.fillText("State: Mostly Left", cx - 50, cy - 120);
  else if (mix > 0.8) ctx.fillText("State: Mostly Right", cx - 50, cy - 120);
  else ctx.fillText("State: SUPERPOSITION", cx - 60, cy - 120);
};


// --- SCRIPT ---

export const SCRIPT_32: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Welcome to the good old days. Physics is easy. If I know where this ball is, and how fast it's going, I know its future forever.",
    mathTitle: "Classical State",
    mathSub: "State = (Position, Momentum)",
    draw: drawClassicalState
  },
  {
    speaker: "Newton",
    text: "It is deterministic. It is logical. There is no guessing. The 'State' is just coordinates on a map.",
    mathTitle: "Determinism",
    mathSub: "F = ma",
    draw: drawClassicalState
  },
  {
    speaker: "Bohr",
    text: "Excuse me, Isaac. That doesn't work for atoms. Electrons don't glide; they teleport between fixed tracks. The state is an integer.",
    mathTitle: "Quantum Jump",
    mathSub: "n = 1, 2, 3...",
    draw: drawBohrOrbit
  },
  {
    speaker: "de Broglie",
    text: "Why integers, Bohr? Because it's not a particle. It's a vibrating guitar string wrapped in a circle. The 'State' is a standing wave.",
    mathTitle: "Matter Waves",
    mathSub: "λ = h / p",
    draw: drawStandingWave
  },
  {
    speaker: "Heisenberg",
    text: "If it is a wave, Isaac, your map is useless. A wave has no exact position. The more you focus on 'where', the less you know 'how fast'.",
    mathTitle: "Uncertainty Principle",
    mathSub: "Δx · Δp ≥ h/4π\n(Try to measure with mouse)",
    draw: drawUncertainty
  },
  {
    speaker: "Newton",
    text: "This is madness! If you cannot give me coordinates, what is the object? What is its state?! Is it a ghost?",
    mathTitle: "Classical Panic",
    mathSub: "Error: Coordinates not found",
    draw: drawUncertainty
  },
  {
    speaker: "Schrödinger",
    text: "Calm down. It is not a ghost. It is a Wave Function, Psi (Ψ). It evolves smoothly in time, just like your ball, but in a different space.",
    mathTitle: "The Wave Function",
    mathSub: "iℏ ∂Ψ/∂t = ĤΨ",
    draw: drawWaveFunction
  },
  {
    speaker: "Born",
    text: "But Isaac asks a fair question: What is this wave made of? It is not matter. It is a wave of *Information*.",
    mathTitle: "The Born Rule",
    mathSub: "Probability = |Ψ|²",
    draw: drawProbability
  },
  {
    speaker: "System",
    text: "A Quantum State is not 'where you are'. It is a list of 'where you might be'. Drag the mouse to mix the possibilities (Superposition).",
    mathTitle: "Superposition",
    mathSub: "State = a|1⟩ + b|2⟩",
    draw: drawProbability
  }
];
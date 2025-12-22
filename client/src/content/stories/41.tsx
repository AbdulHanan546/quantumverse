import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math & Draw Helpers ---

// Helper to draw the physical "Box" walls
// UPDATED: Adjusted dimensions to prevent overlap with the dialogue box
const drawBoxWalls = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  // Reserve space at the bottom for the UI (Dialogue Box)
  const uiBuffer = 180; 
  
  const boxWidth = W * 0.6;
  const left = (W - boxWidth) / 2;
  const right = left + boxWidth;
  
  // Lift the floor up so it sits above the dialogue box
  const bottom = H - uiBuffer; 
  const top = 80; // Push top down slightly for balance

  // Walls (Infinite Potential)
  ctx.fillStyle = '#222'; // Slightly lighter than background for visibility
  ctx.fillRect(left - 20, top, 20, bottom - top); // Left Wall
  ctx.fillRect(right, top, 20, bottom - top); // Right Wall
  
  // Floor
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#888';
  ctx.font = "12px monospace";
  ctx.fillText("V = ∞", left - 45, (top + bottom) / 2);
  ctx.fillText("V = ∞", right + 10, (top + bottom) / 2);
  ctx.fillText("x = 0", left, bottom + 20);
  ctx.fillText("x = L", right - 30, bottom + 20);

  return { left, right, top, bottom, width: boxWidth };
};

// --- Draw Functions ---

// 1. Classical Physics: The Bouncing Ball
const drawClassical: DrawFunction = (ctx, W, H, time) => {
  const { left, width, bottom } = drawBoxWalls(ctx, W, H);
  
  // Physics simulation based on time
  const speed = 300; // pixels per second unit
  const totalDist = (time * speed) % (width * 2);
  let x = totalDist;
  
  if (x > width) {
    x = width - (x - width); // Moving left
  }

  // Draw Particle
  ctx.beginPath();
  ctx.arc(left + x, bottom - 20, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa'; // Newton Blue
  ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Trail
  ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
  ctx.fillRect(left, bottom - 35, width, 30);
  
  // Text moved to top area to avoid overlap
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText("Energy = Any Amount (Continuous)", W/2, 50);
  ctx.textAlign = 'left'; // Reset
};

// 2. The Matter Wave Transition
const drawMatterWave: DrawFunction = (ctx, W, H, time) => {
  const { left, width, bottom, top } = drawBoxWalls(ctx, W, H);
  const midY = (bottom + top) / 2;

  ctx.beginPath();
  ctx.strokeStyle = '#22d3ee'; // de Broglie Cyan
  ctx.lineWidth = 3;

  // A wave that doesn't quite fit yet
  for (let i = 0; i <= width; i++) {
    const x = left + i;
    const lambda = 100 + Math.sin(time) * 20; 
    const y = Math.sin((i / lambda) * Math.PI * 2 - time * 5) * 40;
    
    if (i === 0) ctx.moveTo(x, midY + y);
    else ctx.lineTo(x, midY + y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#22d3ee';
  ctx.textAlign = 'center';
  ctx.fillText("λ = h / p", W/2, midY - 60);
  ctx.textAlign = 'left';
};

// 3. Standing Waves (Quantization)
const drawStandingWave: DrawFunction = (ctx, W, H, time) => {
  const { left, width, bottom, top } = drawBoxWalls(ctx, W, H);
  const midY = (bottom + top) / 2;

  // Show n=1, n=2, n=3 ghosted
  [1, 2, 3].forEach(n => {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * n})`; 
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i++) {
      const x = left + i;
      const y = Math.sin((n * Math.PI * i) / width) * 30;
      // Offset ghosts slightly so they are visible separate from main wave
      if (i === 0) ctx.moveTo(x, midY + y - 50 - (n * 10));
      else ctx.lineTo(x, midY + y - 50 - (n * 10));
    }
    ctx.stroke();
  });

  // Main active wave (n=2 cycling)
  const n = 2;
  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6'; // Schrödinger Violet
  ctx.lineWidth = 4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#8b5cf6';

  for (let i = 0; i <= width; i++) {
    const x = left + i;
    const y = Math.sin((n * Math.PI * i) / width) * Math.cos(time * 3) * 60;
    
    if (i === 0) ctx.moveTo(x, midY + y);
    else ctx.lineTo(x, midY + y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Nodes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(left + width/2, midY, 4, 0, Math.PI*2); 
  ctx.fill();
  ctx.fillText("Node", left + width/2 - 15, midY + 20);
};

// 4. Probability Density
const drawProbability: DrawFunction = (ctx, W, H, time) => {
  const { left, width, bottom, top } = drawBoxWalls(ctx, W, H);
  const midY = (bottom + top) / 2 + 20; // Adjusted vertical center

  const n = 3; 
  
  // Wave Function (Ghost)
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= width; i++) {
    const y = Math.sin((n * Math.PI * i) / width) * 40;
    ctx.lineTo(left + i, midY - 60 + y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.fillText("ψ (Wave Function)", left + 10, midY - 80);

  // Probability Density
  ctx.strokeStyle = '#c084fc'; 
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, midY);
  
  for (let i = 0; i <= width; i++) {
    const x = left + i;
    const val = Math.pow(Math.sin((n * Math.PI * i) / width), 2); 
    const y = val * -100; // Go up
    ctx.lineTo(x, midY + y);
  }
  ctx.stroke();

  // Fill area
  ctx.lineTo(left + width, midY);
  ctx.lineTo(left, midY);
  ctx.fillStyle = 'rgba(192, 132, 252, 0.2)';
  ctx.fill();

  ctx.fillStyle = '#c084fc'; 
  ctx.fillText("|ψ|² (Probability)", left + 10, midY + 20);
  
  // Random "measurements"
  if (Math.random() > 0.8) {
    const randX = Math.random() * width;
    const prob = Math.pow(Math.sin((n * Math.PI * randX) / width), 2);
    if (Math.random() < prob) {
       ctx.fillStyle = '#fff';
       ctx.fillRect(left + randX, midY - 5, 4, 4);
    }
  }
};

// 5. Interactive
const drawInteractive: DrawFunction = (ctx, W, H, time, mouseX) => {
  const { left, width, bottom, top } = drawBoxWalls(ctx, W, H);
  const midY = (bottom + top) / 2;

  // Map mouse to n (1 to 5)
  const n = Math.floor(mouseX * 4.99) + 1;
  
  // Display Energy Level (Moved to Top Left)
  ctx.fillStyle = '#f59e0b';
  ctx.font = "20px monospace";
  ctx.fillText(`n = ${n}`, 50, 60);
  ctx.font = "14px monospace";
  ctx.fillText(`Energy ∝ n² = ${n*n}`, 50, 80);

  // Draw Wave
  ctx.beginPath();
  ctx.strokeStyle = `hsl(${260 - n*20}, 100%, 60%)`;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = ctx.strokeStyle;

  for (let i = 0; i <= width; i++) {
    const x = left + i;
    const y = Math.sin((n * Math.PI * i) / width) * Math.cos(time * (1 + n*0.5)) * 60;
    if (i === 0) ctx.moveTo(x, midY + y);
    else ctx.lineTo(x, midY + y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Instruction Text moved inside the play area
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText("Move Mouse to change Quantum State", W/2, top - 20);
  ctx.textAlign = 'left';
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_41: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Picture a box. Perfectly rigid walls. Inside, a single particle. Like a marble in a shoe box.",
    mathTitle: "Classical Mechanics",
    mathSub: "F = ma",
    draw: drawClassical
  },
  {
    speaker: "Newton",
    text: "I can throw this marble at any speed I want. Fast, slow, somewhere in between. Its energy is continuous. Simple.",
    mathTitle: "Continuous Energy",
    mathSub: "E = ½mv²",
    draw: drawClassical
  },
  {
    speaker: "de Broglie",
    text: "Sorry to ruin the fun, Isaac, but that's not a marble. At this scale, matter behaves like a wave.",
    mathTitle: "Wave-Particle Duality",
    mathSub: "λ = h/p",
    draw: drawMatterWave
  },
  {
    speaker: "Schrödinger",
    text: "Precisely. And since it is a wave trapped in a box, it cannot just wiggle however it pleases. It must fit.",
    mathTitle: "Boundary Conditions",
    mathSub: "ψ(0) = 0, ψ(L) = 0",
    draw: drawMatterWave
  },
  {
    speaker: "Schrödinger",
    text: "The wave must be zero at the walls. If it doesn't fit perfectly, it destroys itself. It creates a 'Standing Wave'.",
    mathTitle: "The Wave Function",
    mathSub: "ψₙ(x) = A sin(nπx/L)",
    draw: drawStandingWave
  },
  {
    speaker: "System",
    text: "This implies something strange. Since only integer numbers of waves fit (1 hump, 2 humps...), energy cannot be continuous.",
    mathTitle: "Quantization",
    mathSub: "Integer 'n' only",
    draw: drawStandingWave
  },
  {
    speaker: "Bohr",
    text: "Energy is quantized! You can have Energy Level 1, or Level 4. But you can never have Energy 1.5. The math forbids it.",
    mathTitle: "Energy Levels",
    mathSub: "Eₙ ∝ n²",
    draw: drawStandingWave
  },
  {
    speaker: "Heisenberg",
    text: "But wait, if it's a wave... where is the particle? Is it on the left? The right?",
    mathTitle: "Uncertainty",
    mathSub: "Δx Δp ≥ ħ/2",
    draw: drawProbability
  },
  {
    speaker: "Born",
    text: "It is nowhere and everywhere. The height of the wave squared tells us the *probability* of finding it there.",
    mathTitle: "Born Rule",
    mathSub: "P(x) = |ψ(x)|²",
    draw: drawProbability
  },
  {
    speaker: "System",
    text: "Notice how for n=2, the probability in the exact center is ZERO. The particle can be on the left or right, but never in the middle. Magic.",
    mathTitle: "Nodes",
    mathSub: "P(L/2) = 0",
    draw: drawProbability
  },
  {
    speaker: "System",
    text: "Simulation Unlocked. Use your mouse to change the Quantum Number 'n'. Watch how the energy and probability distribution change.",
    mathTitle: "Interactive Mode",
    mathSub: "Mouse X: Change 'n'",
    draw: drawInteractive
  }
];
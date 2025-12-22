import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Helpers ---

// Helper to draw a coin
const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, scaleY: number = 1) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, scaleY);
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  
  // Undo scale for text so it doesn't look squished
  ctx.scale(1, 1 / scaleY);
  ctx.fillStyle = '#fff';
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 0);
  ctx.restore();
};

// Helper to draw the "Cat" (Simplified abstraction)
const drawCat = (ctx: CanvasRenderingContext2D, x: number, y: number, state: 'ALIVE' | 'DEAD' | 'BOTH', opacity: number = 1) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);

  // Face
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fillStyle = state === 'DEAD' ? '#ef4444' : (state === 'ALIVE' ? '#10b981' : '#a855f7');
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.moveTo(-20, -20);
  ctx.lineTo(-30, -50);
  ctx.lineTo(-5, -28);
  ctx.moveTo(20, -20);
  ctx.lineTo(30, -50);
  ctx.lineTo(5, -28);
  ctx.fillStyle = ctx.fillStyle;
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "center";
  if (state === 'DEAD') {
    ctx.fillText("X  X", 0, 5);
  } else if (state === 'ALIVE') {
    ctx.fillText("O  O", 0, 5);
  } else {
    ctx.fillText("?  ?", 0, 5);
  }

  ctx.restore();
};

// --- Draw Functions ---

const drawClassicalCertainty: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2 - 50;
  
  // Left Coin (Heads)
  drawCoin(ctx, W / 3, centerY, "H", "#3b82f6");
  
  // Right Coin (Tails)
  drawCoin(ctx, (W / 3) * 2, centerY, "T", "#ef4444");

  // Text
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Classical Physics: It is this OR that.", W / 2, centerY + 80);
};

const drawSpinningCoin: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2 - 50;
  const centerX = W / 2;

  // Simulate spin using sine for scaleY
  const speed = 10;
  const scale = Math.cos(time * speed);
  
  // If scale is near 0, we can't see the face, but let's just flash colors
  const isHeads = Math.sin(time * speed) > 0;
  const color = isHeads ? "#3b82f6" : "#ef4444";
  const label = Math.abs(scale) < 0.2 ? "" : (isHeads ? "H" : "T");

  // Draw blurry 'ghost' trail
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 45, 45, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#a855f7"; // Purple (Blue + Red mixed)
  ctx.fill();
  ctx.globalAlpha = 1.0;

  drawCoin(ctx, centerX, centerY, label, color, Math.abs(scale));

  ctx.fillStyle = "#a855f7";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("While spinning, is it Heads or Tails?", centerX, centerY + 80);
};

const drawWaveSuperposition: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2 - 50;
  
  // Draw State A (Blue Wave)
  ctx.beginPath();
  ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"; // Blue low opacity
  ctx.lineWidth = 4;
  for (let x = 0; x < W; x+=5) {
    const y = Math.sin(x * 0.05 + time) * 30;
    x === 0 ? ctx.moveTo(x, centerY + y) : ctx.lineTo(x, centerY + y);
  }
  ctx.stroke();

  // Draw State B (Red Wave)
  ctx.beginPath();
  ctx.strokeStyle = "rgba(239, 68, 68, 0.3)"; // Red low opacity
  for (let x = 0; x < W; x+=5) {
    const y = Math.cos(x * 0.05 + time) * 30; // Cosine offset
    x === 0 ? ctx.moveTo(x, centerY + y) : ctx.lineTo(x, centerY + y);
  }
  ctx.stroke();

  // Draw Superposition (Purple Sum)
  ctx.beginPath();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#a855f7";
  ctx.strokeStyle = "#a855f7"; // Purple
  ctx.lineWidth = 6;
  for (let x = 0; x < W; x+=5) {
    const y1 = Math.sin(x * 0.05 + time) * 30;
    const y2 = Math.cos(x * 0.05 + time) * 30;
    const ySum = y1 + y2;
    x === 0 ? ctx.moveTo(x, centerY + ySum) : ctx.lineTo(x, centerY + ySum);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("Equation: ψ = (State A) + (State B)", W/2, centerY + 100);
};

const drawTheBox: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2 - 50;
  
  // Draw Box
  ctx.strokeStyle = "#fbbf24"; // Amber
  ctx.lineWidth = 5;
  ctx.strokeRect(cx - 100, cy - 80, 200, 160);
  
  // Calculate flicker for "Both" state
  // We draw two cats overlapping rapidly
  const flicker = Math.sin(time * 20);
  
  // Dead Cat Ghost
  drawCat(ctx, cx - 20, cy, 'DEAD', 0.5 + flicker * 0.1);
  
  // Alive Cat Ghost
  drawCat(ctx, cx + 20, cy, 'ALIVE', 0.5 - flicker * 0.1);

  // Question Mark
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px monospace";
  ctx.fillText("?", cx, cy - 100);
};

const drawCollapse: DrawFunction = (ctx, W, H, _, mouseX) => {
  const cx = W / 2;
  const cy = H / 2 - 50;

  // Guide Line
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 100);
  ctx.lineTo(cx, cy + 100);
  ctx.stroke();
  
  // Mouse interaction determines reality
  // 0.0 -> 0.45 (Alive), 0.45 -> 0.55 (Superposition), 0.55 -> 1.0 (Dead)
  
  if (mouseX < 0.45) {
    // ALIVE
    drawCat(ctx, cx, cy, 'ALIVE', 1);
    ctx.fillStyle = "#10b981";
    ctx.fillText("OBSERVED: ALIVE", cx, cy + 100);
  } else if (mouseX > 0.55) {
    // DEAD
    drawCat(ctx, cx, cy, 'DEAD', 1);
    ctx.fillStyle = "#ef4444";
    ctx.fillText("OBSERVED: DEAD", cx, cy + 100);
  } else {
    // SUPERPOSITION (Blurry middle)
    drawCat(ctx, cx, cy, 'BOTH', 0.6);
    ctx.fillStyle = "#a855f7";
    ctx.fillText("UNOBSERVED", cx, cy + 100);
  }

  // Mouse Indicator
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(mouseX * W, H - 20, 5, 0, Math.PI*2);
  ctx.fill();
  ctx.font = "12px monospace";
  ctx.fillText("Your Eye (Mouse)", mouseX * W, H - 35);
};

// --- SCRIPT 46: Quantum Superposition ---

export const SCRIPT_46: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Welcome to the sensible world. A coin is either Heads OR Tails. A door is Open OR Closed. Things are definite.",
    mathTitle: "Binary States",
    mathSub: "State = 0 OR 1",
    draw: drawClassicalCertainty
  },
  {
    speaker: "System",
    text: "Newton likes logic. But subatomic particles don't care about Newton's feelings. Let's spin a coin.",
    mathTitle: "Kinetic State",
    mathSub: "Spinning...",
    draw: drawSpinningCoin
  },
  {
    speaker: "Bohr",
    text: "While it spins, it is not Heads. It is not Tails. It is a mixture of both probability states at once.",
    mathTitle: "The Blur",
    mathSub: "Heads + Tails",
    draw: drawSpinningCoin
  },
  {
    speaker: "Schrödinger",
    text: "Exactly! Mathematically, particles behave like waves. We can add two waves together to make a new one. This is Superposition.",
    mathTitle: "Wave Function",
    mathSub: "|ψ⟩ = α|0⟩ + β|1⟩",
    draw: drawWaveSuperposition
  },
  {
    speaker: "Einstein",
    text: "This is nonsense. You are telling me a particle exists in two places at once? God does not play dice with the universe, Erwin.",
    mathTitle: "Objection!",
    mathSub: "Realism vs. Probability",
    draw: drawWaveSuperposition
  },
  {
    speaker: "Schrödinger",
    text: "I agree, Albert! It's absurd. Imagine I put a cat in a box with poison triggered by a quantum event...",
    mathTitle: "The Thought Experiment",
    mathSub: "Schrödinger's Cat",
    draw: drawTheBox
  },
  {
    speaker: "Schrödinger",
    text: "Until we open the box, the math says the cat is both Dead AND Alive simultaneously. A zombie ghost cat!",
    mathTitle: "Superposition",
    mathSub: "50% Dead | 50% Alive",
    draw: drawTheBox
  },
  {
    speaker: "Heisenberg",
    text: "It is not a ghost, Erwin. It is a probability cloud. It only 'chooses' a state when we force it to reveal itself.",
    mathTitle: "The Copenhagen Interpretation",
    mathSub: "Don't look, don't know.",
    draw: drawTheBox
  },
  {
    speaker: "System",
    text: "You are the observer. Move your mouse left or right to 'measure' the system and collapse the wave function.",
    mathTitle: "Wave Function Collapse",
    mathSub: "Mouse X = Measurement",
    draw: drawCollapse
  }
];
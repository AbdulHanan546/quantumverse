import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const drawGrid = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
};

const drawWavePacket = (ctx: CanvasRenderingContext2D, center: number, width: number, amplitude: number, H: number) => {
  ctx.beginPath();
  for (let x = 0; x < ctx.canvas.width; x += 2) {
    const k = (x - center) / width;
    const env = Math.exp(-k * k);
    const y = H / 2 - env * amplitude * Math.cos(0.2 * x); // Wave packet
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
};

// --- Draw Functions ---

// Scene 1: Classical Billiards (Newton's World) - UPDATED
const drawClassical: DrawFunction = (ctx, W, H, time) => {
  drawGrid(ctx, W, H);
  
  // 1. Slower Speed: Reduced multiplier from 100 to 50
  const t = (time * 50) % (W + 100); 
  const x = t - 50; // Start slightly off-screen left
  
  // 2. Higher Position: Changed baseline from H-100 to H/2 + 100
  // This keeps it more centered vertically
  const y = (H / 2 + 100) - Math.abs(Math.sin(t * 0.015) * 200);

  // Draw The Particle
  ctx.fillStyle = '#60a5fa'; // Blue for Newton
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2); // Slightly larger ball
  ctx.fill();
  
  // Draw Data Tag - Improved Readability
  ctx.fillStyle = '#fff';
  ctx.font = "bold 16px monospace"; // Bold font
  ctx.fillText(`x: ${x.toFixed(0)}`, x + 30, y - 25);
  ctx.fillText(`p: ${(10).toFixed(0)}`, x + 30, y - 5);
};

// Scene 2: The Ghost (Schrödinger's World)
const drawQuantumFog: DrawFunction = (ctx, W, H, time) => {
  // Draw the probability cloud
  const centerX = (W / 2) + Math.sin(time) * 100;
  
  // Gradient Fog
  const grad = ctx.createRadialGradient(centerX, H/2, 10, centerX, H/2, 200);
  grad.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Violet
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // The Wave Function Line
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 3;
  drawWavePacket(ctx, centerX, 50, 100, H);
  
  // Confused Labels
  ctx.fillStyle = '#fff';
  ctx.font = "20px monospace";
  ctx.fillText("x = ???", centerX - 30, H/2 - 120);
};

// Scene 3: The Machine (The Operator)
const drawOperatorBox: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const centerY = H / 2;

  // The Wave entering
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  drawWavePacket(ctx, centerX, 100 + Math.sin(time)*20, 50, H);

  // The Operator Box
  ctx.fillStyle = '#222';
  ctx.strokeStyle = '#f0abfc'; // Fuchsia for Heisenberg
  ctx.lineWidth = 4;
  ctx.fillRect(centerX - 100, centerY - 80, 200, 160);
  ctx.strokeRect(centerX - 100, centerY - 80, 200, 160);

  // Label
  ctx.fillStyle = '#f0abfc';
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.fillText("OPERATOR (Â)", centerX, centerY);
  
  ctx.font = "14px monospace";
  ctx.fillStyle = "#aaa";
  ctx.fillText("Input: State |ψ>", centerX, centerY + 30);
  ctx.fillText("Output: Value (a)", centerX, centerY + 50);
  ctx.textAlign = "left"; // Reset
};

// Scene 4: The Collapse (Extraction)
const drawEigenvalue: DrawFunction = (ctx, W, H, time) => {
  const t = time % 5; // Loop every 5 seconds
  const centerX = W / 2;

  if (t < 2) {
    // Stage 1: The Cloud
    drawWavePacket(ctx, centerX, 80, 100, H);
    ctx.fillStyle = '#fff';
    ctx.fillText("Scanning...", centerX - 40, H/2 - 120);
  } else if (t < 2.5) {
    // Stage 2: The Crunch
    ctx.strokeStyle = '#f0abfc';
    drawWavePacket(ctx, centerX, 80 * (2.5 - t), 150, H); // Shrinking width
  } else {
    // Stage 3: The Eigenvalue (Spike)
    ctx.strokeStyle = '#10b981'; // Green for success
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(centerX, H/2 + 100);
    ctx.lineTo(centerX, H/2 - 100);
    ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.font = "bold 30px monospace";
    ctx.fillText("5.00 m/s", centerX + 20, H/2);
    ctx.font = "16px monospace";
    ctx.fillStyle = '#fff';
    ctx.fillText("Eigenvalue Found", centerX + 20, H/2 + 30);
  }
};

// Scene 5: Interactive Commutator
const drawCommutator: DrawFunction = (ctx, W, H, time, mouseX) => {
  // Split screen
  const order = mouseX > 0.5;
  
  ctx.fillStyle = order ? '#1e1b4b' : '#312e81'; // Bg change based on order
  ctx.fillRect(0,0,W,H);

  const centerX = W/2;
  const centerY = H/2;

  // Visualizing A then B vs B then A
  // We represent "Position Measure" as squeezing width
  // We represent "Momentum Measure" as changing color/freq
  
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  
  if (!order) {
    // Case 1: Position then Momentum
    ctx.fillText("ORDER: Position (X) -> Momentum (P)", centerX, 50);
    
    // Result: We know where it is, but frequency is messy
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    // A tight spike (known position) but messy waves around it
    ctx.beginPath();
    for(let x = centerX - 100; x < centerX + 100; x++){
        const dist = Math.abs(x - centerX);
        const y = centerY + Math.sin(x * x * 0.1 + time * 10) * (dist < 10 ? 100 : 20); 
        if(x===centerX-100) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.fillText("Result: Defined Location, Unknown Speed", centerX, H - 50);
    
  } else {
    // Case 2: Momentum then Position
    ctx.fillText("ORDER: Momentum (P) -> Position (X)", centerX, 50);
    
    // Result: Perfect sine wave (known speed), but spread out everywhere
    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let x = 0; x < W; x++){
        const y = centerY + Math.sin(x * 0.1 - time * 5) * 50; 
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.fillText("Result: Defined Speed, Unknown Location", centerX, H - 50);
  }
  
  ctx.textAlign = "left";
};

// --- THE SCRIPT ---

export const SCRIPT_35: StoryStep[] = [
  {
    speaker: "Newton",
    text: "I love my world. Look at this ball. It has a position (x) and a momentum (p). I can write them on a piece of paper. x=5, p=10. Done.",
    mathTitle: "Classical State",
    mathSub: "State = { x, p }",
    draw: drawClassical
  },
  {
    speaker: "Schrödinger",
    text: "Sorry, Isaac. In my world, your ball is just a probability cloud. A wave function. It doesn't 'have' a position. It is smeared across the universe.",
    mathTitle: "The Wave Function",
    mathSub: "ψ(x, t)",
    draw: drawQuantumFog
  },
  {
    speaker: "Newton",
    text: "This is useless! I need a number! If I ask 'Where is it?', I expect an answer, not a fog! How do I get the number out?",
    mathTitle: "The Measurement Problem",
    mathSub: "How to get 'x' from ψ?",
    draw: drawQuantumFog
  },
  {
    speaker: "Heisenberg",
    text: "You cannot just 'look'. You must ACT. In Quantum Mechanics, a variable isn't a number... it's a Machine. An Operator.",
    mathTitle: "Operators",
    mathSub: "Â (The Machine)",
    draw: drawOperatorBox
  },
  {
    speaker: "System",
    text: "Think of an Operator like a meat grinder. You feed the wave function into the 'Position Operator', and it crunches the math to spit out a value.",
    mathTitle: "The Operation",
    mathSub: "Â |ψ> = a |ψ>",
    draw: drawOperatorBox
  },
  {
    speaker: "Born",
    text: "And here is the magic: When the machine spits out a number (an Eigenvalue), the wave SNAPS into that shape. The fog collapses.",
    mathTitle: "Eigenvalue Equation",
    mathSub: "Collapse to Eigenstate",
    draw: drawEigenvalue
  },
  {
    speaker: "Heisenberg",
    text: "But be careful. The order matters. Move your mouse left/right. If you measure Position first, you destroy the Momentum info. If you measure Momentum first, you lose the Position.",
    mathTitle: "Non-Commutation",
    mathSub: "[x, p] ≠ 0",
    draw: drawCommutator
  },
  {
    speaker: "Newton",
    text: "So I can't know everything at once? My precious numbers depend on which machine I use first?",
    mathTitle: "Uncertainty",
    mathSub: "Δx Δp ≥ ħ/2",
    draw: drawCommutator
  },
  {
    speaker: "System",
    text: "Exactly. In Quantum Mechanics, we don't 'observe' reality. We 'operate' on it. And the operation changes the reality itself.",
    mathTitle: "Observables as Operators",
    mathSub: "Simulation Complete",
    draw: drawOperatorBox
  }
];
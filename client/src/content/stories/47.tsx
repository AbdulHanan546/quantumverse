import React from 'react';
import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math & Graphics Helpers ---

const gaussian = (x: number, mu: number, sigma: number) => {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
};

const drawAxis = (ctx: CanvasRenderingContext2D, W: number, H: number, label: string) => {
  const floorY = H - 180; // Keep clear of the dialogue box
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, floorY);
  ctx.lineTo(W - 50, floorY); // X axis
  ctx.stroke();
  
  ctx.fillStyle = '#666';
  ctx.font = "12px monospace";
  ctx.fillText("Position (x)", W - 100, floorY + 20);
  ctx.fillText(label, 50, floorY - 150);
};

// --- Draw Functions ---

// 1. The Smooth Evolution (Schrödinger's realm)
const drawSmoothEvolution: DrawFunction = (ctx, W, H, time) => {
  const floorY = H - 180;
  drawAxis(ctx, W, H, "Probability Amplitude");

  // A wave packet moving and spreading
  const speed = 2;
  const t = time * 20;
  const mu = (t % (W + 200)) - 100; // Loops across screen
  
  // As it moves, it spreads (sigma increases)
  // We simulate "dispersion" - the wave gets fatter and shorter
  const spreadFactor = 1 + (mu / W) * 2; 
  const sigma = 30 * spreadFactor; 

  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6'; // Violet for Schrödinger
  ctx.lineWidth = 4;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#8b5cf6';

  for (let x = 0; x < W; x+=4) {
    const yVal = gaussian(x, mu, sigma);
    // Scale height based on spread to keep area roughly const (conservation of probability)
    const heightScale = 8000; 
    const y = floorY - yVal * heightScale;
    
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = '#ddd';
  ctx.font = "16px monospace";
  ctx.fillText("Schrödinger Equation: ψ(t)", W/2 - 100, 100);
  ctx.fillStyle = '#8b5cf6';
  ctx.fillText("Smooth. Deterministic. Predictable.", W/2 - 140, 130);
};

// 2. The Superposition (The Ghostly State)
const drawSuperposition: DrawFunction = (ctx, W, H, time) => {
  const floorY = H - 180;
  drawAxis(ctx, W, H, "Probability");

  // Two peaks representing being in two places
  const center = W / 2;
  const separation = 150 * Math.sin(time * 0.5); // Oscillating separation
  
  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]); // Dashed to show "ghostly" nature

  for (let x = 0; x < W; x+=4) {
    // Superposition of two states
    const g1 = gaussian(x, center - 150, 40);
    const g2 = gaussian(x, center + 150, 40);
    const y = floorY - (g1 + g2) * 6000;
    
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Question marks
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "20px monospace";
  ctx.fillText("Here?", center - 160, floorY - 50);
  ctx.fillText("Or Here?", center + 140, floorY - 50);
};

// 3. The Act of Measurement (The Eye)
const drawMeasurementPrep: DrawFunction = (ctx, W, H, time) => {
  drawSuperposition(ctx, W, H, time); // Draw background wave

  // Draw a giant stylized "Eye" or Detector
  const cx = W / 2;
  const cy = H / 2 - 50;
  
  ctx.strokeStyle = '#c084fc'; // Purple (Born)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.stroke();
  
  // Pupil moving around looking for the particle
  const lookX = Math.sin(time * 3) * 30;
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(cx + lookX, cy, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.textAlign = "center";
  ctx.fillText("OBSERVER DETECTED", cx, cy - 80);
  ctx.textAlign = "left";
};

// 4. The Collapse (Spike)
const drawCollapse: DrawFunction = (ctx, W, H) => {
  const floorY = H - 180;
  drawAxis(ctx, W, H, "Measured Position");

  // A single sharp spike (Dirac Delta approximation)
  const spikeX = W / 2 + 50; // Randomly picked spot

  ctx.beginPath();
  ctx.strokeStyle = '#c084fc'; // Born's Color
  ctx.lineWidth = 2;
  // The ghost wave fading
  for (let x = 0; x < W; x+=5) {
      const g1 = gaussian(x, W/2 - 150, 40);
      const g2 = gaussian(x, W/2 + 150, 40);
      const y = floorY - (g1 + g2) * 6000;
      ctx.lineTo(x, y);
  }
  ctx.globalAlpha = 0.2;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // The SPIKE
  ctx.beginPath();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#fff';
  ctx.moveTo(spikeX, floorY);
  ctx.lineTo(spikeX, floorY - 300);
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.font = "bold 20px monospace";
  ctx.fillText("CLICK!", spikeX + 10, floorY - 280);
  ctx.shadowBlur = 0;
};

// 5. Interactive Collapse
const drawInteractiveCollapse: DrawFunction = (ctx, W, H, time, mouseX) => {
  const floorY = H - 180;
  drawAxis(ctx, W, H, "Reality");

  // If mouse is moving (simulated by checking if we are "observing"), collapse to mouse
  // We'll use a threshold. In this story, the user is the observer.
  
  const targetX = mouseX * W;
  
  // Draw the "Potential" wave (Schrodinger) constantly shifting
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'; // Faint Violet
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x+=5) {
      const y = floorY - (Math.sin(x * 0.05 + time) * 50 + 50);
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();

  // Draw the "Observed" Reality (Born) at mouse cursor
  ctx.beginPath();
  ctx.strokeStyle = '#c084fc'; // Purple
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#c084fc';
  
  // A narrow gaussian following the mouse
  for (let x = 0; x < W; x+=2) {
      const val = gaussian(x, targetX, 15); // Very narrow sigma
      const y = floorY - val * 4000;
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = "14px monospace";
  ctx.fillText(`Observer Location: ${targetX.toFixed(0)}`, targetX + 20, floorY - 200);
  ctx.fillText("Move mouse to 'force' the particle position", 50, 50);
};


// --- THE SCRIPT ---

export const SCRIPT_47: StoryStep[] = [
  {
    speaker: "System",
    text: "Welcome to the biggest fight in physics history. In the blue corner: The Wave. In the red corner: The Measurement.",
    mathTitle: "The Great Divide",
    mathSub: "Unitary vs Non-Unitary",
    draw: drawSmoothEvolution
  },
  {
    speaker: "Schrödinger",
    text: "Behold, my beautiful Equation. Look how the wave flows! It is smooth. It is continuous. It tells us exactly how the future unfolds.",
    mathTitle: "Time Evolution (U)",
    mathSub: "iℏ ∂ψ/∂t = Hψ",
    draw: drawSmoothEvolution
  },
  {
    speaker: "Schrödinger",
    text: "The particle isn't here or there. It is a cloud of possibility, spreading out like ripples in a pond. It's elegant determinism.",
    mathTitle: "Dispersion",
    mathSub: "The wave spreads out",
    draw: drawSmoothEvolution
  },
  {
    speaker: "Born",
    text: "That's very poetic, Erwin. But I have a question. What happens if I actually... look at it?",
    mathTitle: "The Observer Enters",
    mathSub: "|ψ|² = Probability",
    draw: drawMeasurementPrep
  },
  {
    speaker: "Schrödinger",
    text: "Don't you dare! If you look, you'll ruin the superposition! Let it dance!",
    mathTitle: "Superposition",
    mathSub: "State A + State B",
    draw: drawSuperposition
  },
  {
    speaker: "Born",
    text: "Too late. I built a detector. I am going to ask the wave: 'Where are you roughly?'",
    mathTitle: "Measurement",
    mathSub: "Preparing to observe...",
    draw: drawMeasurementPrep
  },
  {
    speaker: "Born",
    text: "*CLICK*. There it is. It's not a wave anymore. It's a dot. Right there.",
    mathTitle: "Wavefunction Collapse",
    mathSub: "The wave vanishes instantly",
    draw: drawCollapse
  },
  {
    speaker: "Schrödinger",
    text: "WHAT DID YOU DO?! Where did the rest of my wave go? It just... vanished? That breaks the math! My equation doesn't allow instant vanishing!",
    mathTitle: "The Discontinuity",
    mathSub: "The Math Broke",
    draw: drawCollapse
  },
  {
    speaker: "Heisenberg",
    text: "Relax, you two. Erwin handles the 'While Nobody is Looking' part. Max handles the 'When We Look' part. We just switch rules.",
    mathTitle: "Two Sets of Rules",
    mathSub: "Evolution vs Collapse",
    draw: drawCollapse
  },
  {
    speaker: "System",
    text: "This is the Measurement Problem. Rule 1: Waves spread smoothly. Rule 2: Waves snap instantly when seen. Why? Nobody knows.",
    mathTitle: "The Paradox",
    mathSub: "U-Process vs R-Process",
    draw: drawSuperposition
  },
  {
    speaker: "System",
    text: "You try. You are the observer now. The purple wave is the collapse. Wherever you point your mouse, you force nature to make a choice.",
    mathTitle: "Interactive Mode",
    mathSub: "Mouse X forces position",
    draw: drawInteractiveCollapse
  }
];
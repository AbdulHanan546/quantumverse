import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const gaussian = (x: number, mu: number, sigma: number) => {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
};

// --- Draw Functions ---

// 1. The Smooth Wave (Schrödinger's Dream)
const drawWaveFunction: DrawFunction = (ctx, W, H, time) => {
  ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'; // Violet tint
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6'; // Violet
  ctx.lineWidth = 3;
  
  const cy = H / 2;
  const amplitude = 80;
  
  for (let x = 0; x < W; x++) {
    // A complex looking wave composed of two sines
    const y = Math.sin(x * 0.02 + time) * amplitude + Math.sin(x * 0.05 - time * 1.5) * (amplitude * 0.5);
    if (x === 0) ctx.moveTo(x, cy + y);
    else ctx.lineTo(x, cy + y);
  }
  ctx.stroke();

  // Draw "Ghostly" fill
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
  ctx.fill();
};

// 2. The Probability Cloud (Born's Interpretation)
const drawCloud: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  
  // Draw the potential axis
  ctx.strokeStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  // Draw the "Probability Density" (Wave squared)
  ctx.beginPath();
  ctx.strokeStyle = '#c084fc'; // Purple
  ctx.lineWidth = 2;
  
  for (let x = 0; x < W; x++) {
    const waveVal = Math.sin(x * 0.03 + time) + Math.sin(x * 0.07 - time);
    const prob = waveVal * waveVal * 40; // Squaring it makes it positive
    const y = cy - prob;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineTo(W, cy);
  ctx.lineTo(0, cy);
  ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
  ctx.fill();

  // Text
  ctx.fillStyle = '#fff';
  ctx.font = "14px monospace";
  ctx.fillText("Ψ² (Probability Density)", 20, cy - 120);
};

// 3. The Detector Setup
const drawDetectorSetup: DrawFunction = (ctx, W, H, time) => {
  drawCloud(ctx, W, H, time * 0.2); // Slow motion cloud background

  // Draw a "Screen" or "Eye"
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.strokeRect(W/2 - 50, H/2 - 50, 100, 100);
  
  ctx.fillStyle = '#fff';
  ctx.fillText("DETECTOR", W/2 - 35, H/2 - 60);

  // Blinking ?
  if (Math.floor(time * 5) % 2 === 0) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillText("NO PARTICLE FOUND YET", W/2 - 80, H/2 + 70);
  }
};

// 4. The Collapse (Instant Spike)
const drawCollapse: DrawFunction = (ctx, W, H) => {
  // Flat line
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H/2);
  ctx.lineTo(W, H/2);
  ctx.stroke();

  // The Spike
  const spikeX = W * 0.7; // Fixed position for story
  ctx.strokeStyle = '#10b981'; // Green for "Reality"
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(spikeX, H/2);
  ctx.lineTo(spikeX, H/2 - 200);
  ctx.stroke();

  // The Particle
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(spikeX, H/2 - 200, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.fillText("100% Here", spikeX + 15, H/2 - 100);
  ctx.fillText("0% Everywhere else", spikeX + 15, H/2 - 80);
};

// 5. Interactive Collapse (God Mode)
const drawInteractiveCollapse: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H/2;
  const targetX = mouseX * W;

  // Draw faint "possibilities" in background
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < W; x+=5) {
     const y = Math.sin(x * 0.05 + time) * 50;
     ctx.moveTo(x, cy);
     ctx.lineTo(x, cy + y);
  }
  ctx.stroke();

  // Draw the Wave Function Collapsing toward mouse
  ctx.beginPath();
  ctx.strokeStyle = '#facc15'; // Gold/Yellow
  ctx.lineWidth = 3;
  
  // Create a gaussian spike at mouseX
  for (let x = 0; x < W; x++) {
    // Sigma is small (sharp spike)
    const yVal = gaussian(x, targetX, 15) * 6000; 
    const plotY = cy - yVal;
    if (x===0) ctx.moveTo(x, plotY);
    else ctx.lineTo(x, plotY);
  }
  ctx.stroke();

  // Draw the particle
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(targetX, cy - gaussian(targetX, targetX, 15) * 6000, 6, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#facc15';
  ctx.fillText("OBSERVER DETECTED", 20, 50);
  ctx.fillStyle = '#888';
  ctx.fillText("Move mouse to 'force' the universe to decide", 20, 70);
};


// --- THE SCRIPT ---

export const SCRIPT_37: StoryStep[] = [
  {
    speaker: "Schrödinger",
    text: "Welcome to my world. It is a beautiful world. A smooth world. Look at this equation flow.",
    mathTitle: "The Wave Function",
    mathSub: "Ψ(x, t)",
    draw: drawWaveFunction
  },
  {
    speaker: "Schrödinger",
    text: "In my math, the electron isn't a hard little ball. It's a wave. It is everywhere at once. It flows like water.",
    mathTitle: "Superposition",
    mathSub: "The particle is 'smeared' out",
    draw: drawWaveFunction
  },
  {
    speaker: "Born",
    text: "Erwin, you're being dramatic. It's not actually 'smeared' matter. It's a map of probability.",
    mathTitle: "Born Rule",
    mathSub: "P = |Ψ|²",
    draw: drawCloud
  },
  {
    speaker: "Born",
    text: "Where the wave is high, the particle MIGHT be. Where it's low, it probably isn't. But until we look? It's nowhere.",
    mathTitle: "The Probability Cloud",
    mathSub: "Potentiality, not Reality",
    draw: drawCloud
  },
  {
    speaker: "System",
    text: "So we have a ghost. A cloud of 'maybe'. But we are humans. We have bulky, clumsy machines.",
    mathTitle: "The Experiment",
    mathSub: "Preparing to measure...",
    draw: drawDetectorSetup
  },
  {
    speaker: "Heisenberg",
    text: "Let's catch it. Put a detector right there. We are going to ask the universe: 'Where are you?'",
    mathTitle: "The Question",
    mathSub: "Waiting for impact...",
    draw: drawDetectorSetup
  },
  {
    speaker: "System",
    text: "And this is where Physics breaks. The moment we look...",
    mathTitle: "...",
    mathSub: "...",
    draw: drawDetectorSetup
  },
  {
    speaker: "System",
    text: "SNAP! The wave is gone. The cloud is gone. The probability is gone. There is only a DOT.",
    mathTitle: "Wave Function Collapse",
    mathSub: "Ψ → δ(x - x0)",
    draw: drawCollapse
  },
  {
    speaker: "Einstein",
    text: "This is ridiculous! You're telling me the electron was everywhere, and just because we LOOKED, it decided to be HERE?",
    mathTitle: "The Conflict",
    mathSub: "Deterministic Wave vs Random Dot",
    draw: drawCollapse
  },
  {
    speaker: "Bohr",
    text: "Stop telling God what to do, Albert. The measurement forces the universe to choose. Before the choice, the location didn't exist.",
    mathTitle: "Copenhagen Interpretation",
    mathSub: "Measurement creates Reality",
    draw: drawCollapse
  },
  {
    speaker: "System",
    text: "This is the Measurement Postulate. The act of measuring collapses the infinite possibilities into a single reality.",
    mathTitle: "Interactive Mode",
    mathSub: "You are the Observer. Move the mouse.",
    draw: drawInteractiveCollapse
  },
  {
    speaker: "System",
    text: "Wherever you look (move your mouse), the wave spikes. You are deciding where the particle is, simply by observing it.",
    mathTitle: "You hold the collapse",
    mathSub: "Control the particle location",
    draw: drawInteractiveCollapse
  }
];
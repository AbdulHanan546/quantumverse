import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---

const gaussian = (x: number, center: number, sigma: number) => {
  return Math.exp(-Math.pow(x - center, 2) / (2 * sigma * sigma));
};

const drawGrid = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < W; x += 50) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  ctx.stroke();
};

// --- Draw Functions ---

// 1. Classical Particle (Bullet) - SLOWED DOWN
const drawClassical: DrawFunction = (ctx, W, H, time) => {
  drawGrid(ctx, W, H);
  
  // Reduced speed from 200 to 80 for better readability
  const speed = 80; 
  const x = (time * speed) % (W - 100) + 50;
  
  ctx.fillStyle = '#60a5fa'; // Blue (Newton/Classical)
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#60a5fa';
  ctx.beginPath();
  ctx.arc(x, H / 2, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = "14px monospace";
  // Text follows the ball
  ctx.fillText("Position: DEFINITE", x - 50, H / 2 - 30);
  ctx.fillText("Velocity: DEFINITE", x - 50, H / 2 - 50);
};

// 2. The Schrödinger Wave (Smooth, undulating)
const drawSchrodingerWave: DrawFunction = (ctx, W, H, time) => {
  ctx.strokeStyle = '#8b5cf6'; // Violet (Schrödinger)
  ctx.lineWidth = 3;
  ctx.beginPath();

  const centerY = H / 2;
  
  // Draw the wave
  for (let x = 0; x < W; x++) {
    // A wave packet moving across
    const phase = x * 0.05 - time * 5;
    const envelope = Math.sin(x * 0.01 + time); // Slowly shifting envelope
    const y = Math.sin(phase) * 50 * envelope; 
    
    if (x === 0) ctx.moveTo(x, centerY + y);
    else ctx.lineTo(x, centerY + y);
  }
  ctx.stroke();

  // "Ghostly" fill
  ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
};

// 3. The Smear (Schrödinger's Wrong Interpretation)
const drawElectronSmear: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const centerY = H / 2;
  
  // Pulsing cloud
  const radius = 100 + Math.sin(time * 3) * 10;
  
  const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
  grad.addColorStop(0, 'rgba(139, 92, 246, 1)'); // Core
  grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = "16px monospace";
  ctx.fillText("Interpretation: Electron is melted butter?", centerX, centerY + 140);
  ctx.fillText("Charge Density smeared out over space", centerX, centerY + 160);
};

// 4. The Born Rule (Wave vs Probability) - UPDATED TEXT POSITION
const drawBornRule: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2;
  const scale = 80;

  // Draw Axis
  ctx.strokeStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(0, centerY); ctx.lineTo(W, centerY);
  ctx.stroke();

  // Calculate Wave
  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6'; // Violet (Psi)
  ctx.lineWidth = 2;
  
  // Moving wave packet
  const packetCenter = (time * 50) % (W + 200) - 100;
  
  for (let x = 0; x < W; x+=2) {
    const k = 0.1;
    const env = gaussian(x, packetCenter, 60);
    const psi = Math.cos(k * x - time * 5) * env; // Real part of psi
    
    const y = centerY - psi * scale;
    if (x===0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // UPDATED: Moved x from 20 to 60
  ctx.fillStyle = '#8b5cf6';
  ctx.fillText("Wavefunction (ψ)", 80, centerY - 100);

  // Draw Probability (Psi Squared)
  ctx.beginPath();
  ctx.strokeStyle = '#c084fc'; // Purple (Born)
  ctx.lineWidth = 3;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#c084fc';

  for (let x = 0; x < W; x+=2) {
    const k = 0.1;
    const env = gaussian(x, packetCenter, 60);
    const psi = Math.cos(k * x - time * 5) * env; 
    
    // BORN RULE: |ψ|^2 (Always positive)
    const prob = psi * psi; 
    
    const y = centerY + 50 - prob * scale; // Offset down
    if (x===0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // UPDATED: Moved x from 20 to 60
  ctx.fillStyle = '#c084fc';
  ctx.fillText("Probability (|ψ|²)", 80, centerY + 100);
};

// 5. Interactive Measurement (Stabilized & Improved Visuals)
const drawMeasurement: DrawFunction = (ctx, W, H, time, mouseX) => {
  // Baseline moved up to avoid overlapping with dialogue
  const baselineY = H - 200; 
  const targetX = mouseX * W;

  // --- Draw Probability Mountains ---
  ctx.beginPath();
  ctx.fillStyle = 'rgba(192, 132, 252, 0.2)';
  ctx.strokeStyle = '#c084fc';
  
  ctx.moveTo(0, baselineY);
  for (let x = 0; x <= W; x+=4) {
    const env1 = gaussian(x, W * 0.3, 50);
    const env2 = gaussian(x, W * 0.7, 70);
    const prob = (env1 + env2) * 150;
    
    const y = baselineY - prob;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, baselineY);
  ctx.lineTo(0, baselineY);
  ctx.fill();
  ctx.stroke();

  // --- Mouse Cursor / Detector Line ---
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(targetX, 0); ctx.lineTo(targetX, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // --- Stabilized Detection Logic ---
  const env1 = gaussian(targetX, W * 0.3, 50);
  const env2 = gaussian(targetX, W * 0.7, 70);
  const probAtMouse = (env1 + env2); 

  // Time snap to prevent flickering
  const tickSpeed = 6.0; 
  const timeBlock = Math.floor(time * tickSpeed); 
  const pseudoRandom = Math.abs(Math.sin(timeBlock * 999.9));
  
  const isDetected = pseudoRandom < probAtMouse;

  if (isDetected) {
    // 1. Pulsing Ring Effect
    const pulseSize = (Math.sin(time * 15) * 5) + 15; 
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, baselineY, pulseSize + 5, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Main Gold Particle
    ctx.fillStyle = '#fbbf24'; 
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.arc(targetX, baselineY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Hot White Center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(targetX, baselineY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 4. Text Label with Background Box
    const msg = "!! PARTICLE DETECTED !!";
    ctx.font = "bold 16px monospace";
    const textWidth = ctx.measureText(msg).width;
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1;
    const boxX = targetX - textWidth / 2 - 10;
    const boxY = baselineY - 60;
    ctx.fillRect(boxX, boxY, textWidth + 20, 30);
    ctx.strokeRect(boxX, boxY, textWidth + 20, 30);

    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = "center";
    ctx.fillText(msg, targetX, baselineY - 40);
    ctx.textAlign = "left"; 

  } else {
    // Show Probability Percentage
    ctx.fillStyle = '#888';
    ctx.font = "12px monospace";
    ctx.fillText(`Detection Prob: ${(probAtMouse * 100).toFixed(0)}%`, targetX + 10, 50);
  }
};


// --- THE SCRIPT ---

export const SCRIPT_33: StoryStep[] = [
  {
    speaker: "System",
    text: "Welcome to the sub-atomic realm. Before we begin, remember how things used to be. Simple. Predictable.",
    mathTitle: "Classical Mechanics",
    mathSub: "x(t) = x₀ + vt",
    draw: drawClassical
  },
  {
    speaker: "System",
    text: "But in the 1920s, electrons stopped behaving like bullets. They started doing weird 'jumps' (Bohr's model). Physics became messy.",
    mathTitle: "The Crisis",
    mathSub: "Discrete Energy Levels",
    draw: drawClassical 
  },
  {
    speaker: "Schrödinger",
    text: "I detest these quantum jumps! Nature does not 'jump'. Nature flows. If electrons behave like waves, I shall write an equation for waves!",
    mathTitle: "The Insight",
    mathSub: "Particles are illusions?",
    draw: drawSchrodingerWave
  },
  {
    speaker: "Schrödinger",
    text: "Behold, the Wavefunction (Psi). It moves smoothly. It evolves perfectly. No jagged edges. Mathematics is beautiful again.",
    mathTitle: "The Wavefunction",
    mathSub: "Ψ(x, t)",
    draw: drawSchrodingerWave
  },
  {
    speaker: "System",
    text: "But there was a problem. Erwin, what exactly *is* that wave physically? Is the electron a water wave?",
    mathTitle: "Physical Meaning?",
    mathSub: "What is waving?",
    draw: drawSchrodingerWave
  },
  {
    speaker: "Schrödinger",
    text: "It is simple! The electron is not a point. It is smeared out. The wave represents the density of the charge. Like peanut butter spread on toast.",
    mathTitle: "Charge Density?",
    mathSub: "e⁻ is a cloud",
    draw: drawElectronSmear
  },
  {
    speaker: "Born",
    text: "Erwin, don't be ridiculous. When we detect an electron, we don't catch a 'splash' of charge. We hear a 'click'. A single, hard point.",
    mathTitle: "The Contradiction",
    mathSub: "Waves spread, Particles hit.",
    draw: drawElectronSmear
  },
  {
    speaker: "Born",
    text: "Your equation is correct, but your philosophy is wrong. The wave is not the electron itself...",
    mathTitle: "A New Idea",
    mathSub: "Born Interpretation",
    draw: drawBornRule
  },
  {
    speaker: "Born",
    text: "The wave tells us the PROBABILITY of finding the particle. Where the wave is strong, the particle is likely to be.",
    mathTitle: "The Born Rule",
    mathSub: "P(x) = |Ψ(x)|²",
    draw: drawBornRule
  },
  {
    speaker: "System",
    text: "The wave can be negative (like a water trough), but Probability (Psi Squared) is always positive. You can't have a -50% chance of finding a cat.",
    mathTitle: "Squaring the Amplitude",
    mathSub: "(-A)² = +A²",
    draw: drawBornRule
  },
  {
    speaker: "System",
    text: "Move your mouse (Detector). High probability (Purple Mountains) means you are likely to find the particle. Low probability means empty space.",
    mathTitle: "Collapse",
    mathSub: "Interaction required",
    draw: drawMeasurement
  }
];
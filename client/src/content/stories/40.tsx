import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math & Helper Functions ---

const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions ---

// 1. Classical Ramp (Newton's world)
const drawRamp: DrawFunction = (ctx, W, H, time) => {
  const startX = 50;
  const endX = W - 50;
  // FIX: Lift the bottom up by ~200px to clear the dialog box
  const startY = 80;
  const endY = H - 200; 

  // Draw the Ramp
  ctx.strokeStyle = '#60a5fa'; // Blue (Newton)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw the Ball
  // It moves smoothly, can exist anywhere
  const t = (Math.sin(time) + 1) / 2; // 0 to 1
  const ballX = map(t, 0, 1, startX, endX);
  const ballY = map(t, 0, 1, startY, endY);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ballX, ballY - 15, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#60a5fa';
  ctx.fillText("Energy = Continuous (Any Height)", 60, 60);
};

// 2. The Hydrogen Spectrum (The Mystery)
const drawSpectrum: DrawFunction = (ctx, W, H) => {
  const barHeight = 100;
  // FIX: Center relative to the visible area (Top 70%), not full height
  const y = (H * 0.4) - barHeight / 2;
  
  // Background (Darkness)
  ctx.fillStyle = '#111';
  ctx.fillRect(50, y, W - 100, barHeight);
  ctx.strokeStyle = '#333';
  ctx.strokeRect(50, y, W - 100, barHeight);

  // The Spectral Lines (Balmer Series approximation)
  const lines = [
    { x: 0.9, color: '#ef4444' }, // Red
    { x: 0.75, color: '#06b6d4' }, // Cyan
    { x: 0.65, color: '#3b82f6' }, // Blue
    { x: 0.60, color: '#8b5cf6' }, // Violet
  ];

  lines.forEach(line => {
    const xPos = 50 + (W - 100) * line.x;
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(xPos, y);
    ctx.lineTo(xPos, y + barHeight);
    ctx.stroke();
    
    // Glow effect
    ctx.shadowColor = line.color;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  ctx.fillStyle = '#fff';
  // FIX: Text position relative to new Y
  ctx.fillText("Real Hydrogen Data: Why gaps?", W/2 - 80, y + barHeight + 30);
};

// 3. The Staircase (Bohr)
const drawStairs: DrawFunction = (ctx, W, H, time) => {
  const steps = 5;
  const stepW = (W - 100) / steps;
  // FIX: Calculate height based on available visible space
  const groundY = H - 200;
  const stepH = (groundY - 50) / steps;

  ctx.strokeStyle = '#22d3ee'; // Cyan (Bohr)
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, groundY);

  for(let i=0; i<steps; i++) {
    ctx.lineTo(50 + i*stepW, groundY - i*stepH); // Horizontal
    ctx.lineTo(50 + (i+1)*stepW, groundY - i*stepH); // Vertical up
  }
  ctx.stroke();

  // The Electron (Jumping)
  // It snaps to levels, never in between
  const level = Math.floor((time % steps)); 
  const ballX = 50 + level * stepW + stepW/2;
  const ballY = groundY - level * stepH - 20;

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI*2);
  ctx.fill();
  
  // Forbidden Zone text
  ctx.fillStyle = '#ef4444';
  ctx.globalAlpha = 0.5 + Math.sin(time*5)*0.5;
  ctx.fillText("FORBIDDEN ZONE", 50 + stepW * 1.5, groundY - stepH * 0.5);
  ctx.globalAlpha = 1;
};

// 4. Guitar String (De Broglie)
const drawGuitar: DrawFunction = (ctx, W, H, time) => {
  const startX = 50;
  const endX = W - 50;
  // FIX: Shift center up
  const centerY = (H * 0.45); 

  // Pegs
  ctx.fillStyle = '#888';
  ctx.fillRect(startX - 10, centerY - 10, 20, 20);
  ctx.fillRect(endX - 10, centerY - 10, 20, 20);

  // The String
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#22d3ee'; // Cyan (Matter Waves)
  
  ctx.beginPath();
  ctx.moveTo(startX, centerY);

  // A standing wave (n=3)
  const n = 3;
  for (let x = startX; x <= endX; x++) {
    const progress = (x - startX) / (endX - startX);
    // Sin(n * pi * progress) creates n humps
    // Sin(time) makes it vibrate
    const offset = Math.sin(progress * Math.PI * n) * Math.sin(time * 5) * 50;
    ctx.lineTo(x, centerY + offset);
  }
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.fillText(`Wave fits perfectly (n=${n})`, W/2 - 60, centerY + 80);
};

// 5. Interactive Potential Well (Schrodinger)
const drawEigenBox: DrawFunction = (ctx, W, H, time, mouseX) => {
  const boxX = 100;
  const boxW = W - 200;
  const boxTop = 80;
  // FIX: Bring bottom up to avoid overlap
  const boxBot = H - 220; 
  const centerY = (boxTop + boxBot) / 2;

  // Draw the "Box" (Infinite Potential Well)
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(boxX, boxTop - 50);
  ctx.lineTo(boxX, boxBot + 50); // Left Wall
  ctx.moveTo(boxX + boxW, boxTop - 50);
  ctx.lineTo(boxX + boxW, boxBot + 50); // Right Wall
  ctx.stroke();

  // User controls "Energy" (Frequency)
  // Let's map mouseX (0 to 1) to a frequency n (0.5 to 4.5)
  const n = map(mouseX, 0, 1, 0.5, 4.5);
  
  // Check if we are close to an integer (Eigenvalue)
  const closestInteger = Math.round(n);
  const diff = Math.abs(n - closestInteger);
  const isEigen = diff < 0.15; // Tolerance

  // Color logic
  const color = isEigen ? '#8b5cf6' : '#ef4444'; // Violet (Schrodinger) vs Red (Chaos)
  const amplitude = isEigen ? 80 : 30 + Math.random() * 10; // Stable vs Jittery

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(boxX, centerY);

  for (let x = 0; x <= boxW; x++) {
    const progress = x / boxW;
    // The wave function
    let yOffset = 0;
    
    if (isEigen) {
        // Smooth standing wave
        yOffset = Math.sin(progress * Math.PI * closestInteger) * Math.sin(time * 3) * amplitude;
    } else {
        // Destructive interference / Chaos
        yOffset = Math.sin(progress * Math.PI * n) * Math.sin(time * 10) * amplitude;
        // Make endpoints loose to show it "doesn't fit"
    }
    
    ctx.lineTo(boxX + x, centerY - yOffset);
  }
  ctx.stroke();

  // HUD
  ctx.fillStyle = color;
  ctx.font = "20px monospace";
  if (isEigen) {
    ctx.fillText(`MATCH FOUND! n = ${closestInteger}`, boxX, 60);
    ctx.fillText(`Eigenvalue E${closestInteger} = ${(closestInteger*closestInteger)}h`, boxX, 90);
  } else {
    ctx.fillText(`Input: n = ${n.toFixed(2)}`, boxX, 60);
    ctx.fillText("Wave cancels out. Not an energy state.", boxX, 90);
  }
};


// --- THE SCRIPT ---

export const SCRIPT_40: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Welcome to the sensible world. In my physics, energy is smooth. Like a ball rolling on a ramp.",
    mathTitle: "Classical Mechanics",
    mathSub: "E = ½mv² (Continuous)",
    draw: drawRamp
  },
  {
    speaker: "Newton",
    text: "You can have 1 Joule. You can have 1.00001 Joules. You can stop the ball anywhere you like. Total freedom.",
    mathTitle: "The Continuum",
    mathSub: "No restrictions",
    draw: drawRamp
  },
  {
    speaker: "System",
    text: "That sounds nice, Sir Isaac. But when we look at atoms... specifically Hydrogen... they act weird.",
    mathTitle: "Atomic Spectra",
    mathSub: "The Balmer Series",
    draw: drawSpectrum
  },
  {
    speaker: "System",
    text: "If atoms could have 'any' energy, they would glow in a full rainbow. Instead, they only glow specific colors. It's like a piano with missing keys.",
    mathTitle: "Discrete Lines",
    mathSub: "Missing Frequencies",
    draw: drawSpectrum
  },
  {
    speaker: "Bohr",
    text: "It is obvious! The atom is not a ramp. It is a staircase. You cannot stand between the steps.",
    mathTitle: "Bohr Model",
    mathSub: "Quantized Orbits",
    draw: drawStairs
  },
  {
    speaker: "Newton",
    text: "A staircase? In the middle of empty space? Why? That is arbitrary nonsense, Neils.",
    mathTitle: "Conflict",
    mathSub: "Why quantization?",
    draw: drawStairs
  },
  {
    speaker: "de Broglie",
    text: "It is not a staircase. It is music. The electron is a wave wrapped around the atom.",
    mathTitle: "Matter Waves",
    mathSub: "λ = h / p",
    draw: drawGuitar
  },
  {
    speaker: "de Broglie",
    text: "Think of a guitar string. You can play a C-note. You can play an E-note. But you cannot play a note that doesn't fit between the ends.",
    mathTitle: "Standing Waves",
    mathSub: "Boundary Conditions",
    draw: drawGuitar
  },
  {
    speaker: "Schrödinger",
    text: "Exactly. I have formalized this. Imagine a wave trapped in a box. I have an equation—a machine—that checks if a wave 'fits'.",
    mathTitle: "The Schrödinger Equation",
    mathSub: "Hψ = Eψ",
    draw: drawEigenBox
  },
  {
    speaker: "Schrödinger",
    text: "This equation is picky. It asks: 'Does this wave shape survive inside the box?' Usually, the answer is NO.",
    mathTitle: "The Operator",
    mathSub: "Testing Functions",
    draw: drawEigenBox
  },
  {
    speaker: "System",
    text: "Use your mouse. Slide left/right to change the wave's frequency. Find the spots where the wave turns PURPLE.",
    mathTitle: "Find the Eigenvalue",
    mathSub: "Mouse X to tune",
    draw: drawEigenBox
  },
  {
    speaker: "Born",
    text: "Those specific spots? Those are the Eigenvalues. The 'Own' values. The only energies nature allows the particle to have.",
    mathTitle: "Energy Eigenvalues",
    mathSub: "E_n = n²h² / 8mL²",
    draw: drawEigenBox
  }
];
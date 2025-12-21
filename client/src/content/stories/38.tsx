import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions ---

// 1. Classical Particle vs Wavy Mess
const drawIdentityCrisis: DrawFunction = (ctx, W, H, time) => {
  ctx.clearRect(0, 0, W, H);
  
  // Left: Classical Particle (Newtonian)
  const particleX = (Math.sin(time * 2) + 1) * (W / 4) + 50;
  ctx.fillStyle = '#60a5fa'; // Blue (Newton)
  ctx.beginPath();
  ctx.arc(particleX, H / 2, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText("Newton's Particle", 50, H / 2 - 30);

  // Right: de Broglie's "Thing"
  ctx.strokeStyle = '#22d3ee'; // Cyan (de Broglie)
  ctx.lineWidth = 3;
  ctx.beginPath();
  const startX = W / 2 + 50;
  const width = W / 2 - 100;
  for (let i = 0; i <= width; i++) {
    const x = startX + i;
    // Multi-frequency wave to look "messy" but wave-like
    const y = H / 2 + Math.sin(i * 0.1 - time * 3) * 20 * Math.sin(time); 
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillText("Matter Wave?", startX, H / 2 - 30);
  
  // Divider
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(W / 2, 50);
  ctx.lineTo(W / 2, H - 50);
  ctx.stroke();
};

// 2. The missing equation (The Search)
const drawEmptyCanvas: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;

  // Question marks floating
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(time))})`;
  ctx.font = "100px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", cx, cy);

  ctx.font = "20px monospace";
  ctx.fillStyle = "#ef4444"; // Red (Frustration)
  ctx.fillText("F = ma (Nope)", cx + Math.sin(time)*50, cy - 80);
  ctx.fillText("E = mc² (Not quite)", cx - Math.sin(time)*50, cy + 80);
  ctx.fillText("∇²? ∂t?", cx, cy + 120);
};

// 3. The Complex Circle (Visualizing the 'i')
const drawComplexRotation: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;
  const radius = 80;

  // Draw Complex Plane axes
  ctx.strokeStyle = '#444';
  ctx.beginPath();
  ctx.moveTo(cx - 120, cy);
  ctx.lineTo(cx + 120, cy); // Real
  ctx.moveTo(cx, cy - 120);
  ctx.lineTo(cx, cy + 120); // Imaginary
  ctx.stroke();

  ctx.fillStyle = '#888';
  ctx.font = "12px monospace";
  ctx.fillText("Real Axis", cx + 130, cy);
  ctx.fillText("Imaginary Axis (i)", cx - 40, cy - 130);

  // The Rotating Vector (The Phase)
  const angle = -time * 2; // Rotating clockwise
  const px = cx + Math.cos(angle) * radius;
  const py = cy + Math.sin(angle) * radius;

  // Circle path
  ctx.strokeStyle = '#8b5cf6'; // Violet (Schrodinger)
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Vector line
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, py);
  ctx.stroke();
  
  // Projection to Wave (Real part)
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, H - 50);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw the resulting wave at bottom
  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6';
  for(let x = 0; x < 200; x++) {
     const waveX = cx - 100 + x;
     const waveY = (H - 50) - Math.cos(angle + x * 0.1) * 20;
     if(x===0) ctx.moveTo(waveX, waveY);
     else ctx.lineTo(waveX, waveY);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.fillText("The factor: e^(-iEt/ħ)", cx - 60, cy + 150);
};

// 4. The Wave Packet (The Solution)
const drawWavePacket: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2;
  
  // Adjusted Speed and Wrapping for smoothness
  // We make the wrap range (W + 400) larger than screen to hide the jump
  const wrapWidth = W + 400;
  const speed = 150;
  const packetCenter = (time * speed) % wrapWidth - 200;
  
  ctx.beginPath();
  ctx.strokeStyle = '#8b5cf6'; // Schrodinger Violet
  ctx.lineWidth = 2;

  for (let x = 0; x < W; x += 3) {
    const dist = x - packetCenter;
    
    // Envelope: Gaussian curve (The "Lump")
    const envelope = Math.exp(-(dist * dist) / 3000);
    
    // Carrier: The wiggle inside. 
    // FIX: We base phase on 'x' and 'time' directly, NOT 'dist'.
    // This prevents the "stuck/jump" glitch when packetCenter wraps around.
    const carrier = Math.cos(x * 0.1 - time * 10);
    
    const y = centerY + envelope * carrier * 80;
    
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(139, 92, 246, 0.1)";
  ctx.fill();
  
  ctx.fillStyle = "#8b5cf6";
  ctx.font = "20px monospace";
  // Only draw label if visible
  if(packetCenter > 0 && packetCenter < W) {
      ctx.fillText("Ψ(x, t)", packetCenter - 20, centerY - 100);
  }
};

// 5. Probability Density (Interactive)
const drawProbability: DrawFunction = (ctx, W, H, time, mouseX) => {
  const centerY = H / 2;
  
  // FIX: Using same wrap logic as above for smoothness
  // If mouse is near left edge (scrolled back), we slow down time or control position?
  // Let's keep automatic movement but allow Mouse to "Scan".
  const wrapWidth = W + 400;
  const speed = 80;
  const packetCenter = (time * speed) % wrapWidth - 200;

  // 1. Draw the Wave Function (Ghostly background)
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'; 
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 4) {
    const dist = x - packetCenter;
    const envelope = Math.exp(-(dist * dist) / 3000); 
    const carrier = Math.cos(x * 0.1 - time * 10);
    const y = centerY + envelope * carrier * 80;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 2. Draw Probability |Ψ|² (Born's Purple Hill)
  ctx.beginPath();
  ctx.strokeStyle = '#c084fc'; 
  ctx.lineWidth = 3;
  
  // Store points for fill
  const polyPoints = [];
  
  for (let x = 0; x < W; x += 4) {
    const dist = x - packetCenter;
    const envelope = Math.exp(-(dist * dist) / 3000); 
    
    // |Ψ|² means squaring the amplitude (envelope)
    const prob = envelope * envelope; 
    
    const y = centerY + 60 - prob * 150; // Draw it as a "hill" upwards
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    
    polyPoints.push({x, y});
  }
  ctx.stroke();
  
  // Fill the hill
  if (polyPoints.length > 0) {
      ctx.lineTo(W, centerY + 60);
      ctx.lineTo(0, centerY + 60);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.2)';
      ctx.fill();
  }

  // 3. Interactive Measurement Cursor
  const cursorX = mouseX * W;
  
  // Calculate probability at cursor position
  const distCursor = cursorX - packetCenter;
  const envCursor = Math.exp(-(distCursor * distCursor) / 3000);
  const probCursor = envCursor * envCursor; // 0.0 to 1.0

  // Draw Cursor Line
  ctx.beginPath();
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.moveTo(cursorX, 50);
  ctx.lineTo(cursorX, H - 50);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw Data Box at Cursor
  const percentage = (probCursor * 100).toFixed(1);
  const isHigh = probCursor > 0.1;
  
  ctx.fillStyle = isHigh ? '#c084fc' : '#555';
  ctx.beginPath();
  ctx.arc(cursorX, centerY + 60 - probCursor * 150, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "14px monospace";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  // Keep text on screen
  const textX = cursorX > W - 200 ? cursorX - 180 : cursorX + 10;
  
  ctx.fillText(`Detector Position: x = ${cursorX.toFixed(0)}`, textX, centerY - 80);
  
  ctx.fillStyle = isHigh ? '#c084fc' : '#888';
  ctx.font = "bold 16px monospace";
  ctx.fillText(`Probability: ${percentage}%`, textX, centerY - 60);
  
  if(probCursor > 0.8) {
      ctx.fillStyle = "#fff";
      ctx.font = "12px monospace";
      ctx.fillText("HIGH CHANCE OF DETECTION!", textX, centerY - 40);
  }
};


// --- THE SCRIPT ---

export const SCRIPT_38: StoryStep[] = [
  {
    speaker: "de Broglie",
    text: "Mes amis, I have had a vision. Electrons are not just little balls. They are waves. Matter waves.",
    mathTitle: "Matter Waves",
    mathSub: "λ = h / p",
    draw: drawIdentityCrisis
  },
  {
    speaker: "System",
    text: "The physics community is stunned. If matter is a wave, it needs a wave equation. Water has one. Sound has one. Light has one.",
    mathTitle: "The Missing Link",
    mathSub: "How does the wave move?",
    draw: drawIdentityCrisis
  },
  {
    speaker: "Einstein",
    text: "De Broglie is correct. But Erwin, we have no idea how these waves evolve over time. Where is the math?",
    mathTitle: "Confusion",
    mathSub: "Current Status: Unknown",
    draw: drawEmptyCanvas
  },
  {
    speaker: "Schrödinger",
    text: "Fine! I am going to a ski cabin in Arosa. I will not return until I have derived the equation. Leave me alone.",
    mathTitle: "The Cabin Trip",
    mathSub: "Date: Winter 1925",
    draw: drawEmptyCanvas
  },
  {
    speaker: "System",
    text: "Schrödinger realizes that to make the energy conservation work for waves, he needs something strange. An imaginary number.",
    mathTitle: "The Imaginary Unit",
    mathSub: "i = √-1",
    draw: drawComplexRotation
  },
  {
    speaker: "Schrödinger",
    text: "Eureka! It describes a state vector Ψ rotating in a complex space. It doesn't just wiggle up and down; it spirals through time.",
    mathTitle: "Time-Dependence",
    mathSub: "The phase rotates: e^(-iEt/ħ)",
    draw: drawComplexRotation
  },
  {
    speaker: "System",
    text: "He produces the Time-Dependent Schrödinger Equation. It relates how the state changes in time (∂/∂t) to its total energy (H).",
    mathTitle: "The Equation",
    mathSub: "iħ ∂Ψ/∂t = ĤΨ",
    draw: drawWavePacket
  },
  {
    speaker: "Schrödinger",
    text: "Look at it flow! My equation describes the electron as a smooth, continuous charge cloud. No more jumping particles!",
    mathTitle: "The Wave Function",
    mathSub: "Ψ(x,t) evolution",
    draw: drawWavePacket
  },
  {
    speaker: "Born",
    text: "Erwin, beautiful math, but your interpretation is wrong. It's not charge. It's a probability cloud.",
    mathTitle: "The Born Rule",
    mathSub: "Probability = |Ψ|²",
    draw: drawProbability
  },
  {
    speaker: "System",
    text: "Interactive Mode: Move your mouse (Detector) across the wave. Notice how probability is only high in the center.",
    mathTitle: "Measurement",
    mathSub: "Cursor: Detection Chance",
    draw: drawProbability
  }
];
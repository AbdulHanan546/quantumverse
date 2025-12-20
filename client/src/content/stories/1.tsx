import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const center = (val: number, offset: number) => val / 2 + offset;

// Helper to draw a zigzag spring
const drawSpring = (
  ctx: CanvasRenderingContext2D, 
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  coils: number = 10, 
  width: number = 20
) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const step = len / coils;
  
  // Rotation for vertical/horizontal handling
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);

  for (let i = 0; i <= coils; i++) {
    const x = i * step;
    const y = i % 2 === 0 ? -width / 2 : width / 2;
    // Don't zigzag the very start and end
    if (i === 0 || i === coils) ctx.lineTo(x, 0);
    else ctx.lineTo(x, y);
  }
  
  ctx.stroke();
  ctx.restore();
};

// --- Draw Functions ---

// 1. The Pendulum (Observation)
const drawPendulum: DrawFunction = (ctx, W, H, time) => {
  const pivotX = W / 2;
  const pivotY = 50;
  const length = H / 2;
  const angle = Math.sin(time * 2) * 0.4; // +/- radians

  const bobX = pivotX + length * Math.sin(angle);
  const bobY = pivotY + length * Math.cos(angle);

  // Draw String
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(bobX, bobY);
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Bob
  ctx.beginPath();
  ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b'; // Amber
  ctx.fill();
  ctx.stroke();

  // Draw "Ghost" trails
  ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
  ctx.beginPath();
  ctx.arc(pivotX + length * Math.sin(angle - 0.1), pivotY + length * Math.cos(angle - 0.1), 15, 0, Math.PI * 2);
  ctx.fill();
};

// 2. Hooke's Spring (The Force)
const drawHookeSpring: DrawFunction = (ctx, W, H, time) => {
  const wallX = 50;
  const restLength = W / 2;
  // Mouse interaction simulation or auto-move
  const displacement = Math.sin(time * 3) * 100; 
  const currentLen = restLength + displacement;
  const blockY = H / 2;

  // Draw Wall
  ctx.fillStyle = '#333';
  ctx.fillRect(0, blockY - 50, wallX, 100);

  // Draw Spring
  ctx.strokeStyle = '#3b82f6'; // Hooke Blue
  ctx.lineWidth = 3;
  drawSpring(ctx, wallX, blockY, wallX + currentLen, blockY, 15, 30);

  // Draw Block
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(wallX + currentLen, blockY - 25, 50, 50);

  // Force Vector (Arrow pointing opposite to displacement)
  const arrowLen = -displacement * 1.5; 
  ctx.beginPath();
  ctx.moveTo(wallX + currentLen + 25, blockY - 40);
  ctx.lineTo(wallX + currentLen + 25 + arrowLen, blockY - 40);
  ctx.strokeStyle = '#ef4444'; // Red for Force
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Arrow head
  ctx.fillStyle = '#ef4444';
  if (Math.abs(arrowLen) > 5) {
      ctx.font = "14px monospace";
      ctx.fillText("Restoring Force", wallX + currentLen + 25 - 40, blockY - 55);
  }
};

// 3. Newton's Inertia (Velocity vs Acceleration)
const drawDynamics: DrawFunction = (ctx, W, H, time) => {
  // Same spring setup
  const wallX = 50;
  const restLength = W / 2;
  const displacement = Math.sin(time * 2) * 120; 
  const velocity = Math.cos(time * 2) * 100; // Derivative of sin is cos
  const currentLen = restLength + displacement;
  const blockY = H / 2;

  // Spring & Block
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  drawSpring(ctx, wallX, blockY, wallX + currentLen, blockY, 15, 30);
  ctx.fillStyle = '#333';
  ctx.fillRect(wallX + currentLen, blockY - 25, 50, 50);

  // Center Line
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(wallX + restLength + 25, 0);
  ctx.lineTo(wallX + restLength + 25, H);
  ctx.strokeStyle = '#444';
  ctx.stroke();
  ctx.setLineDash([]);

  // Velocity Vector (Green)
  ctx.beginPath();
  ctx.moveTo(wallX + currentLen + 25, blockY + 40);
  ctx.lineTo(wallX + currentLen + 25 + velocity, blockY + 40);
  ctx.strokeStyle = '#10b981'; 
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.fillText("Velocity (Inertia)", wallX + currentLen + 25, blockY + 60);

  // Acceleration Vector (Red - opposite to displacement)
  const accel = -displacement; 
  ctx.beginPath();
  ctx.moveTo(wallX + currentLen + 25, blockY - 40);
  ctx.lineTo(wallX + currentLen + 25 + accel, blockY - 40);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.fillText("Acceleration (Force)", wallX + currentLen + 25, blockY - 50);
};

// 4. The Circle Projection (The "Shadow")
const drawCircleProjection: DrawFunction = (ctx, W, H, time) => {
  const radius = 80;
  const centerX = 150;
  const centerY = H / 2;
  
  const angle = time * 2;
  const ballX = centerX + radius * Math.cos(angle);
  const ballY = centerY + radius * Math.sin(angle);

  // Draw Reference Circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#333';
  ctx.stroke();

  // Draw Rotating Ball
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(ballX, ballY);
  ctx.strokeStyle = '#555';
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#8b5cf6'; // Violet
  ctx.fill();

  // Draw "Shadow" Projecting to the right
  const projectionX = W - 150;
  // The shadow only moves Up/Down (Y-axis) matching the ball's Y
  
  // Dotted Connector
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(ballX, ballY);
  ctx.lineTo(projectionX, ballY);
  ctx.strokeStyle = '#8b5cf6';
  ctx.stroke();
  ctx.setLineDash([]);

  // The Oscillator (Shadow)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(projectionX - 20, ballY - 20, 40, 40);
  
  // Spring connecting shadow
  ctx.strokeStyle = '#555';
  drawSpring(ctx, projectionX, 50, projectionX, ballY - 20, 10, 20);

  ctx.fillStyle = '#fff';
  ctx.fillText("Uniform Circular Motion", centerX - 60, centerY + 110);
  ctx.fillText("Simple Harmonic Motion", projectionX - 60, centerY + 110);
};

// 5. Interactive Frequency
const drawInteractiveSHM: DrawFunction = (ctx, W, H, time, mouseX) => {
  // Map mouseX (0 to 1) to frequency (0.5 to 5)
  const frequency = 0.5 + (mouseX * 4);
  
  // Draw Graph
  ctx.beginPath();
  ctx.strokeStyle = '#10b981'; // Green
  ctx.lineWidth = 3;
  
  const amplitude = 80;
  const centerY = H / 2;
  
  for (let x = 0; x < W; x++) {
    // We visualize the wave spatially
    const t = x * 0.01 - (time * frequency); 
    const y = centerY + Math.sin(t) * amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Text
  ctx.fillStyle = '#fff';
  ctx.font = "16px monospace";
  ctx.fillText(`Frequency: ${frequency.toFixed(2)} Hz`, 50, 50);
  ctx.fillText("Drag mouse to change stiffness (k)", 50, 80);
};


// --- THE SCRIPT ---

export const SCRIPT_1: StoryStep[] = [
  {
    speaker: "System",
    text: "Observe the world around you. A child on a swing. A grandfather clock. A bungee jumper regretting their life choices.",
    mathTitle: "Oscillation",
    mathSub: "Repetitive Back & Forth",
    draw: drawPendulum
  },
  {
    speaker: "Hooke",
    text: "Ignore the chaos. Look at the spring. When you pull it from its home, it gets angry. It wants to go back.",
    mathTitle: "Restoring Force",
    mathSub: "Displacement causes Tension",
    draw: drawHookeSpring
  },
  {
    speaker: "Hooke",
    text: "The harder you pull (Extension), the harder it pulls back (Force). This is MY law. Ut tensio, sic vis.",
    mathTitle: "Hooke's Law",
    mathSub: "F = -k * x",
    draw: drawHookeSpring
  },
  {
    speaker: "Newton",
    text: "Cute, Robert. But why doesn't it stop at the middle? Because Force creates Acceleration. Acceleration creates Velocity.",
    mathTitle: "Inertia",
    mathSub: "F = m * a",
    draw: drawDynamics
  },
  {
    speaker: "Newton",
    text: "It's a tug of war. At the ends, Force is max (Stop!). In the middle, Force is zero, but Speed is max (Can't stop!).",
    mathTitle: "Conservation",
    mathSub: "Max Kinetic Energy vs Max Potential",
    draw: drawDynamics
  },
  {
    speaker: "System",
    text: "But there is a hidden pattern. If you look at the motion sideways... it looks familiar.",
    mathTitle: "The Geometry",
    mathSub: "Projection",
    draw: drawCircleProjection
  },
  {
    speaker: "Fourier",
    text: "Precisely. Linear oscillation is just the shadow of a circle spinning in higher dimensions. It is a Sine wave.",
    mathTitle: "Sinusoidal Nature",
    mathSub: "x = A cos(ωt)",
    draw: drawCircleProjection
  },
  {
    speaker: "System",
    text: "You are now in control of the stiffness constant (k). Move your cursor. Higher stiffness means a faster return.",
    mathTitle: "Frequency Control",
    mathSub: "ω = sqrt(k / m)",
    draw: drawInteractiveSHM
  }
];
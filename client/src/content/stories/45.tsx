import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Draw Functions ---

// 1. Newton vs Huygens: Bullets vs Ripples
const drawTheFeud: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2 - 80; // Moved up slightly
  
  // Left Side: Newton's Particles (Bullets)
  ctx.fillStyle = '#60a5fa'; // Blue
  for (let i = 0; i < 5; i++) {
    const x = (time * 200 + i * 50) % (W / 2 - 20);
    ctx.beginPath();
    ctx.arc(x, centerY - 20, 8, 0, Math.PI * 2);
    ctx.fill();
    // Trail
    ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
    ctx.fillRect(x - 20, centerY - 24, 20, 8);
    ctx.fillStyle = '#60a5fa';
  }
  ctx.fillStyle = '#fff';
  ctx.font = "16px monospace";
  ctx.fillText("Newton: It's a rock.", 20, centerY - 60);

  // Right Side: Huygens' Waves (Ripples)
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  const startX = W * 0.75;
  for (let i = 0; i < 5; i++) {
    const radius = ((time * 50) + i * 30) % 100;
    ctx.globalAlpha = 1 - (radius / 100);
    ctx.beginPath();
    ctx.arc(startX, centerY - 20, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.fillText("Huygens: It's a ripple.", W / 2 + 20, centerY - 60);
  
  // Divider
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(W/2, 20);
  ctx.lineTo(W/2, H * 0.7);
  ctx.stroke();
};

// 2. Young's Interference
const drawInterference: DrawFunction = (ctx, W, H, time) => {
  const centerY = H / 2 - 100; // Moved up
  const source1 = { x: W / 2 - 20, y: centerY };
  const source2 = { x: W / 2 + 20, y: centerY };

  // Draw two sources
  ctx.fillStyle = '#fff';
  ctx.fillRect(source1.x - 2, source1.y - 2, 4, 4);
  ctx.fillRect(source2.x - 2, source2.y - 2, 4, 4);
  
  // Draw Waves
  ctx.lineWidth = 1;
  for(let r=0; r<10; r++) {
    const radius = (time * 30 + r * 40) % (W);
    const alpha = Math.max(0, 1 - radius/(W*0.6));
    ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
    
    ctx.beginPath();
    ctx.arc(source1.x, source1.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(source2.x, source2.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw Screen Result (The Interference Pattern)
  const screenX = W - 50;
  // Limit the drawing to the top 70% of screen to avoid text box
  for(let y = 50; y < H * 0.7; y+=5) {
     const d1 = Math.sqrt(Math.pow(screenX - source1.x, 2) + Math.pow(y - source1.y, 2));
     const d2 = Math.sqrt(Math.pow(screenX - source2.x, 2) + Math.pow(y - source2.y, 2));
     const phase = Math.cos(d1 * 0.1) + Math.cos(d2 * 0.1); 
     const intensity = (phase + 2) / 4;
     
     ctx.fillStyle = `rgba(96, 165, 250, ${intensity})`;
     ctx.fillRect(screenX, y, 4, 5);
  }
};

// 3. Einstein's Photoelectric Effect (Cleaner version)
const drawPhotoelectric: DrawFunction = (ctx, W, H, time) => {
  // Define strict zones so it doesn't look messy
  const plateY = H * 0.5; // Plate in the middle
  const topY = H * 0.1;
  
  // 1. Draw The Metal Plate
  const grad = ctx.createLinearGradient(0, plateY, 0, plateY + 20);
  grad.addColorStop(0, '#9ca3af');
  grad.addColorStop(1, '#4b5563');
  ctx.fillStyle = grad;
  ctx.fillRect(W * 0.2, plateY, W * 0.6, 10);
  
  // Label
  ctx.fillStyle = '#9ca3af';
  ctx.font = "12px monospace";
  ctx.fillText("METAL SURFACE", W * 0.2, plateY + 30);

  // 2. Loop for particles (Fixed number for stability)
  const numParticles = 6;
  for(let i=0; i<numParticles; i++) {
    // Stagger the timing
    const t = (time * 0.40 + i * (10/numParticles)) % 2; // 2 second loop roughly
    
    const x = W * 0.3 + (W * 0.4) * (i / numParticles); // Spread across plate
    
    if (t < 1) {
        // PHASE 1: Photon Falling (Yellow)
        const y = map(t, 0, 1, topY, plateY);
        
        ctx.beginPath();
        ctx.fillStyle = '#facc15'; // Gold
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        // PHASE 2: Electron Ejected (Green) - Goes UP and slightly chaotic
        const ejectTime = t - 1;
        const y = map(ejectTime, 0, 1, plateY, topY - 50);
        
        // Slight sine wave wiggle for electron
        const wiggle = Math.sin(y * 0.1) * 10;
        
        ctx.beginPath();
        ctx.fillStyle = '#34d399'; // Emerald
        ctx.arc(x + wiggle, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = "10px monospace";
        ctx.fillText("e-", x + wiggle + 5, y);
    }
  }

  // Header text
  ctx.fillStyle = '#facc15';
  ctx.fillText("Incoming Photons (Packets)", W/2 - 80, topY - 10);
};

// 4. The Cylinder Metaphor (The Solution) - Adjusted Layout
const drawCylinder: DrawFunction = (ctx, W, H, time, mouseX) => {
  // --- LAYOUT CONFIG ---
  // We move everything UP to avoid the text box at the bottom.
  // The "Floor" will be at 65% height.
  const floorY = H * 0.65; 
  const centerX = W / 2;
  const centerY = floorY - 80; // The object floats above the floor
  
  const wallX = W * 0.25; // The wall on the left
  
  // --- DRAW ROOM ---
  // Floor
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(wallX, floorY);
  ctx.lineTo(W - 50, floorY);
  ctx.stroke();
  
  // Wall (Vertical line)
  ctx.beginPath();
  ctx.moveTo(wallX, floorY);
  ctx.lineTo(wallX, floorY - 150);
  ctx.stroke();

  // --- LOGIC ---
  // mouseX controls rotation. 0 = Square view, 1 = Circle view
  // We will interpolate colors and shapes based on this.
  const t = Math.max(0, Math.min(1, mouseX));

  // --- SHADOWS ---
  
  // 1. Shadow on Wall (Left) -> Represents Particle (Square)
  // Visible when t is low (Particle view)
  const squareOpacity = 1 - t;
  ctx.fillStyle = `rgba(239, 68, 68, ${squareOpacity + 0.1})`; // Red
  // Draw a fuzzy rectangle on the wall
  ctx.fillRect(wallX + 10, centerY - 30, 10, 60); 
  
  if (t < 0.5) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText("PARTICLE (Square)", wallX, centerY - 80);
  }

  // 2. Shadow on Floor (Bottom) -> Represents Wave (Circle)
  // Visible when t is high (Wave view)
  const circleOpacity = t;
  ctx.fillStyle = `rgba(16, 185, 129, ${circleOpacity + 0.1})`; // Green
  ctx.beginPath();
  // Draw an oval on the floor
  ctx.ellipse(centerX, floorY + 20, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  if (t > 0.5) {
      ctx.fillStyle = '#10b981';
      ctx.fillText("WAVE (Circle)", centerX - 40, floorY + 50);
  }

  // --- THE MYSTERY OBJECT (Center) ---
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Rotate based on mouse
  // At 0 (Particle), we see side of cylinder (Rectangle)
  // At 1 (Wave), we see top of cylinder (Circle)
  // We simulate 3D rotation by scaling the Y axis of a circle/rect hybrid
  
  ctx.rotate(Math.PI / 4); // Tilt it slightly so it looks 3D
  
  const colorInterp = `rgb(${239 * (1-t) + 16 * t}, ${68 * (1-t) + 185 * t}, ${68 * (1-t) + 129 * t})`;
  
  ctx.strokeStyle = colorInterp;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 3;
  
  // Draw wireframe cylinder-ish shape
  ctx.beginPath();
  // Transforming shape from Rect to Circle
  const w = 40;
  const h = 40;
  
  // Simple representation: A rotating wireframe box/cylinder
  const rot = time * 0.5;
  for(let i=0; i<4; i++) {
     const angle = rot + (i * Math.PI/2);
     // We deform the drawing based on mouseX to simulate perspective shift
     const pX = Math.cos(angle) * w * (1 - t * 0.5); 
     const pY = Math.sin(angle) * h;
     if(i===0) ctx.moveTo(pX, pY);
     else ctx.lineTo(pX, pY);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  
  // Center glowing core
  ctx.beginPath();
  ctx.fillStyle = colorInterp;
  ctx.arc(0, 0, 5, 0, Math.PI*2);
  ctx.fill();
  
  ctx.restore();
  
  // --- CONNECTING LINES (Beams of light) ---
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  
  // Light to Wall
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(wallX + 20, centerY);
  ctx.stroke();

  // Light to Floor
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, floorY + 20);
  ctx.stroke();
  ctx.setLineDash([]);
};

// --- SCRIPT ---

export const SCRIPT_45: StoryStep[] = [
  {
    speaker: "System",
    text: "Welcome to the longest argument in history. The topic? Light. Is it a rock? Or is it a ripple?",
    mathTitle: "The Great Debate",
    mathSub: "Corpuscle (Particle) vs Wave",
    draw: drawTheFeud
  },
  {
    speaker: "Newton",
    text: "It is obviously a particle. I call them 'Corpuscles'. Light travels in straight lines. Rocks travel in straight lines. Q.E.D.",
    mathTitle: "Mechanics",
    mathSub: "F = ma applies to light?",
    draw: drawTheFeud
  },
  {
    speaker: "Young",
    text: "Respectfully, Sir Isaac, you're wrong. I just passed light through two slits. It created ripples. Rocks don't ripple.",
    mathTitle: "Young's Experiment",
    mathSub: "Interference Patterns",
    draw: drawInterference
  },
  {
    speaker: "System",
    text: "Young's experiment was the mic drop of the 1800s. Physics was settled. Light is a wave. Until...",
    mathTitle: "Wave Theory Wins",
    mathSub: "λ (Wavelength) confirmed",
    draw: drawInterference
  },
  {
    speaker: "Einstein",
    text: "Hold on. When I shine light on metal, it knocks electrons off instantly. Like billiard balls. Waves would take time to 'slosh' them out.",
    mathTitle: "Photoelectric Effect",
    mathSub: "E = hf (Energy is discrete)",
    draw: drawPhotoelectric
  },
  {
    speaker: "de Broglie",
    text: "So... light is a wave that acts like a particle? Then maybe matter (particles) can act like waves? Does anyone know what is happening anymore?",
    mathTitle: "Matter Waves",
    mathSub: "λ = h / p",
    draw: drawPhotoelectric
  },
  {
    speaker: "System",
    text: "Physics was in crisis. How can something be two completely opposite things at the same time? It's like being a circle and a square simultaneously.",
    mathTitle: "The Paradox",
    mathSub: "Wave-Particle Duality",
    draw: drawCylinder
  },
  {
    speaker: "Bohr",
    text: "Stop fighting. You are asking the wrong question. It is not 'this' OR 'that'. It depends on how you ask.",
    mathTitle: "Complementarity",
    mathSub: "Contradictory but necessary",
    draw: drawCylinder
  },
  {
    speaker: "Bohr",
    text: "If you measure it as a particle, it becomes a particle. If you measure it as a wave, it becomes a wave. Nature denies you the full picture at once.",
    mathTitle: "Complementarity",
    mathSub: "Use Mouse: Change Observation",
    draw: drawCylinder
  },
  {
    speaker: "System",
    text: "This is the Complementarity Principle. The truth is a 3D cylinder, but we are stuck seeing only 2D shadows. The universe protects its secrets.",
    mathTitle: "simulation_end",
    mathSub: "Status: Uncertain",
    draw: drawCylinder
  }
];
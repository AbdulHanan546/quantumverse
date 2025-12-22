import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math & Drawing Helpers ---

const drawWall = (ctx: CanvasRenderingContext2D, x: number, w: number, bottomY: number, label: string) => {
  const topY = 50;
  const height = bottomY - topY;

  ctx.fillStyle = '#3f3f46'; // Zinc-700
  // Draw the main wall block
  ctx.fillRect(x, topY, w, height); 
  
  // --- Pattern Clipping Start ---
  ctx.save(); // Save current context state
  ctx.beginPath();
  ctx.rect(x, topY, w, height); // Define the clipping region (same as wall)
  ctx.clip(); // limit all future drawing to this region

  // Wall pattern
  ctx.strokeStyle = '#52525b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  // Draw Diagonals
  // We start from -20 to ensure the top-left corner is covered
  // We go slightly past 'height' because the clip will handle the overflow cleanly
  for(let i = -20; i < height; i+=20) {
      ctx.moveTo(x, topY + i);
      ctx.lineTo(x + w, topY + i + 20);
  }
  ctx.stroke();
  
  ctx.restore(); // Restore context state (remove clipping)
  // --- Pattern Clipping End ---

  if (label) {
      ctx.fillStyle = '#fff';
      ctx.font = "12px monospace";
      // Perfectly center the text vertically
      ctx.fillText(label, x + w/2 - (label.length*3), (topY + bottomY) / 2);
  }
};

// --- Scene Draw Functions ---

// 1. Classical Physics - The Bouncing Ball
const drawClassicalBounce: DrawFunction = (ctx, W, H, time) => {
    // SHIFT: Floor is at H - 220 (Center-ish)
    const floorY = H - 220;
    const wallX = W / 2 + 50;
    const wallWidth = 40;
    
    drawWall(ctx, wallX, wallWidth, floorY, "The Barrier");

    // Ball Physics
    const speed = 200;
    const loopTime = (time * speed) % (wallX + 100); 
    
    let ballX = 50 + loopTime;
    
    // Bounce logic
    if (ballX > wallX - 10) {
        const overlap = ballX - (wallX - 10);
        ballX = (wallX - 10) - overlap;
    }

    // Draw Floor
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(W, floorY);
    ctx.stroke();

    // Draw Ball
    ctx.fillStyle = '#3b82f6'; // Blue for Newton
    ctx.beginPath();
    ctx.arc(ballX, floorY - 15, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.fillText("KE < PE", 50, 50);
};

// 2. The Wave Approach
const drawWaveApproach: DrawFunction = (ctx, W, H, time) => {
    const floorY = H - 220;
    const wallX = W / 2 + 50;
    
    drawWall(ctx, wallX, 40, floorY, "Potential V");
    
    // Draw Floor
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(W, floorY);
    ctx.stroke();

    // Draw de Broglie Wave
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee'; // Cyan
    ctx.lineWidth = 3;

    const waveEnd = (time * 150) % (wallX);
    const waveBaseY = floorY - 20;

    for (let x = 0; x < waveEnd; x++) {
        const y = Math.sin((x * 0.1) - (time * 10)) * 20;
        if (x === 0) ctx.moveTo(x, waveBaseY + y);
        else ctx.lineTo(x, waveBaseY + y);
    }
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.fillText("Matter Wave λ = h/p", 50, 100);
};

// 3. The Decay (Inside the wall)
const drawExponentialDecay: DrawFunction = (ctx, W, H, time) => {
    const centerY = H - 250;
    const wallX = W / 2;
    const wallWidth = 100;
    
    // Wall extends a bit below the wave
    drawWall(ctx, wallX, wallWidth, centerY + 100, "Barrier");
    
    // Incoming Wave (Left)
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6'; // Violet for Schrodinger
    ctx.lineWidth = 3;
    
    for (let x = 0; x <= wallX; x++) {
        const y = Math.sin((x * 0.1) - (time * 5)) * 30;
        if (x === 0) ctx.moveTo(x, centerY + y);
        else ctx.lineTo(x, centerY + y);
    }
    ctx.stroke();

    // Draw the Decay inside wall
    ctx.beginPath();
    ctx.strokeStyle = '#d946ef'; // Fuchsia
    ctx.setLineDash([5, 5]); 
    
    for (let x = 0; x <= wallWidth; x++) {
        const progress = x / wallWidth; 
        const amp = 30 * Math.exp(-4 * progress); 
        const y = Math.sin(((wallX + x) * 0.1) - (time * 5)) * amp;
        
        if (x === 0) ctx.moveTo(wallX, centerY + y);
        else ctx.lineTo(wallX + x, centerY + y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
};

// 4. Interactive Tunneling
const drawInteractiveTunnel: DrawFunction = (ctx, W, H, time, mouseX) => {
    const centerY = H - 250;
    
    const wallThick = Math.max(10, mouseX * 200); 
    const wallX = W / 2 - wallThick / 2;

    drawWall(ctx, wallX, wallThick, centerY + 100, "");

    // 1. Incident Wave
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6'; 
    ctx.lineWidth = 2;
    for (let x = 0; x <= wallX; x++) {
        const y = Math.sin((x * 0.15) - (time * 8)) * 30;
        if (x===0) ctx.moveTo(x, centerY+y);
        else ctx.lineTo(x, centerY+y);
    }
    ctx.stroke();

    // 2. Decaying Wave
    const decayFactor = 5; 
    const exitAmp = 30 * Math.exp(-(decayFactor * wallThick) / 100); 

    ctx.beginPath();
    ctx.strokeStyle = '#d946ef'; 
    for (let x = 0; x <= wallThick; x++) {
        const progress = x / wallThick;
        const currentAmp = 30 * Math.exp(-(decayFactor * x) / 100);
        const y = Math.sin(((wallX + x) * 0.15) - (time * 8)) * currentAmp;
        if(x===0) ctx.moveTo(wallX, centerY+y);
        else ctx.lineTo(wallX+x, centerY+y);
    }
    ctx.stroke();

    // 3. Transmitted Wave
    if (exitAmp > 0.5) {
        ctx.beginPath();
        ctx.strokeStyle = '#10b981'; // Green
        ctx.lineWidth = 3;
        for (let x = wallX + wallThick; x < W; x++) {
            const y = Math.sin((x * 0.15) - (time * 8)) * exitAmp;
            if(x === wallX + wallThick) ctx.moveTo(x, centerY+y);
            else ctx.lineTo(x, centerY+y);
        }
        ctx.stroke();
    }

    // Text Overlay
    ctx.fillStyle = '#fff';
    ctx.font = "14px monospace";
    const prob = (exitAmp / 30) * 100;
    ctx.fillText(`Barrier Thickness: ${wallThick.toFixed(0)}nm`, 50, 50);
    ctx.fillText(`Tunneling Probability: ${prob.toFixed(2)}%`, 50, 70);
    
    if (prob > 10) {
        ctx.fillStyle = '#10b981';
        ctx.fillText("PARTICLE DETECTED!", W - 200, 100);
    } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText("BLOCKED", W - 150, 100);
    }
};

// --- THE SCRIPT ---

export const SCRIPT_42: StoryStep[] = [
    {
        speaker: "Newton",
        text: "Let us conduct a simple experiment. I shall throw this ball at that brick wall. Logic dictates it will bounce back.",
        mathTitle: "Classical Mechanics",
        mathSub: "Kinetic Energy < Potential Barrier",
        draw: drawClassicalBounce
    },
    {
        speaker: "Newton",
        text: "See? It stopped. Objects cannot occupy the same space. If you don't have enough energy to jump the fence, you stay in the yard. End of story.",
        mathTitle: "The Forbidden Region",
        mathSub: "E < V (Classically Impossible)",
        draw: drawClassicalBounce
    },
    {
        speaker: "de Broglie",
        text: "Sir Isaac, with all due respect, you're looking at a 'ball'. But matter... matter is actually a wiggle. A wave.",
        mathTitle: "Wave-Particle Duality",
        mathSub: "λ = h / p",
        draw: drawWaveApproach
    },
    {
        speaker: "Schrödinger",
        text: "Precisely. And waves do not just 'stop' at a boundary. They must be continuous. The math forces the wave to penetrate the wall slightly.",
        mathTitle: "The Wave Function",
        mathSub: "Ψ(x) inside barrier",
        draw: drawExponentialDecay
    },
    {
        speaker: "Heisenberg",
        text: "It's the fuzziness of nature. We don't know EXACTLY where the particle is. If the wall is thin enough, the 'uncertainty' extends to the other side.",
        mathTitle: "Exponential Decay",
        mathSub: "Ψ ~ e^(-kx)",
        draw: drawExponentialDecay
    },
    {
        speaker: "System",
        text: "This is Quantum Tunneling. The particle doesn't break the wall; it essentially 'teleports' through the ghost zone.",
        mathTitle: "The Result",
        mathSub: "Transmission > 0",
        draw: drawInteractiveTunnel
    },
    {
        speaker: "System",
        text: "Simulation Active: Move your mouse to change the Barrier Thickness. If the wall is thin enough, the particle escapes.",
        mathTitle: "Interactive Mode",
        mathSub: "Mouse X: Barrier Width",
        draw: drawInteractiveTunnel
    },
    {
        speaker: "Newton",
        text: "This is cheating. You're just walking through solid walls.",
        mathTitle: "Applications",
        mathSub: "USB Drives & Nuclear Fusion",
        draw: drawInteractiveTunnel
    }
];
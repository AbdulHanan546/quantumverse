import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math & Draw Helpers ---

const drawWellStructure = (ctx: CanvasRenderingContext2D, W: number, H: number, wallHeight: number, thickness: number = 0) => {
  const midX = W / 2;
  const wellWidth = 300;
  
  // FIX: Moved up to H - 250 to avoid overlapping with the bottom dialogue box
  const bottomY = H - 250; 
  const topY = bottomY - 200;
  
  // Draw Potential Landscape (The Box)
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 4;
  ctx.beginPath();
  
  // Left Wall
  ctx.moveTo(0, topY); // High potential
  ctx.lineTo(midX - wellWidth/2, topY);
  ctx.lineTo(midX - wellWidth/2, bottomY); // Drop to well
  
  // Well Floor
  ctx.lineTo(midX + wellWidth/2, bottomY);
  
  // Right Wall
  ctx.lineTo(midX + wellWidth/2, topY);
  ctx.lineTo(W, topY); // High potential
  
  ctx.stroke();

  // Fill Walls (to show "Solidness")
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(0, topY, midX - wellWidth/2, bottomY); // Left block
  ctx.fillRect(midX + wellWidth/2, topY, W, bottomY); // Right block
  
  // Labels
  ctx.fillStyle = '#888';
  ctx.font = "12px monospace";
  ctx.fillText("V = V₀ (Wall)", 20, topY - 10);
  ctx.fillText("V = 0 (Well)", midX - 20, bottomY + 20);
};

// --- Scene Drawers ---

// 1. Classical Ball Bouncing
const drawClassicalBall: DrawFunction = (ctx, W, H, time) => {
  drawWellStructure(ctx, W, H, 200);
  
  const wellWidth = 300;
  const midX = W / 2;
  
  // FIX: Consistent floor height
  const bottomY = H - 250; 
  const ballRadius = 15;

  // Simple Physics: x = speed * time, modulo bounce
  const speed = 200; // px per second
  const totalDist = wellWidth - ballRadius * 2;
  const cycle = (time * speed) % (totalDist * 2);
  
  let x = 0;
  if (cycle < totalDist) {
    x = (midX - wellWidth/2 + ballRadius) + cycle;
  } else {
    x = (midX + wellWidth/2 - ballRadius) - (cycle - totalDist);
  }

  // Draw Ball
  ctx.beginPath();
  ctx.arc(x, bottomY - ballRadius, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa'; // Newton Blue
  ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.stroke();
  
  ctx.fillStyle = '#60a5fa';
  ctx.fillText("E < V₀ (Trapped)", midX - 40, bottomY - 50);
};

// 2. The Infinite Well (Standing Wave)
const drawInfiniteWell: DrawFunction = (ctx, W, H, time) => {
  drawWellStructure(ctx, W, H, 200);
  
  const midX = W / 2;
  const wellWidth = 300;
  
  // FIX: Consistent floor height
  const bottomY = H - 250; 
  const baseY = bottomY - 100;
  
  ctx.strokeStyle = '#8b5cf6'; // Schrodinger Violet
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  // Draw Sine Wave confined STRICTLY inside
  const leftWall = midX - wellWidth/2;
  const rightWall = midX + wellWidth/2;
  
  for (let x = leftWall; x <= rightWall; x++) {
    // Map x to 0..PI for a half sine wave
    const progress = (x - leftWall) / wellWidth;
    const theta = progress * Math.PI * 2; // n=2 mode
    const amplitude = 80 * Math.sin(time * 3);
    const y = baseY - Math.sin(theta) * amplitude;
    
    if (x === leftWall) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Highlight Walls acting as infinite barriers
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftWall, bottomY); ctx.lineTo(leftWall, bottomY - 200);
  ctx.moveTo(rightWall, bottomY); ctx.lineTo(rightWall, bottomY - 200);
  ctx.stroke();
  
  ctx.fillStyle = '#ef4444';
  ctx.fillText("Ψ = 0 (Forbidden)", leftWall - 100, baseY);
};

// 3. The Finite Well (Exponential Decay)
// 3. The Finite Well (Exponential Decay) - Improved for Continuity
const drawFiniteLeak: DrawFunction = (ctx, W, H, time) => {
  // Lower walls visually
  drawWellStructure(ctx, W, H, 100);
  
  const midX = W / 2;
  const wellWidth = 300;
  
  // Positions
  const bottomY = H - 250;
  const baseY = bottomY - 100;
  const leftWall = midX - wellWidth / 2;
  const rightWall = midX + wellWidth / 2;

  // Physics Visualization Parameters
  const k = 0.009; // Wavenumber inside (Controls how "curvy" the cosine is)
  const decayRate = 0.04; // Decay constant outside
  const wellHalfWidth = wellWidth / 2;

  // CRITICAL FIX: Calculate the exact value of the Cosine at the wall
  // so we can start the exponential decay from this exact point.
  // cos(150 * 0.009) ≈ cos(1.35) ≈ 0.21
  const boundaryValue = Math.cos(wellHalfWidth * k); 

  // Animation Amplitude
  const amplitude = 80 * Math.sin(time * 3);

  ctx.strokeStyle = '#10b981'; // Heisenberg Green
  ctx.lineWidth = 3;
  ctx.beginPath();

  // Draw a single continuous path across the screen
  for (let x = 0; x <= W; x += 2) { // Step by 2 for performance
      let yOffset = 0;
      const localX = x - midX;

      if (x < leftWall) {
          // --- Left Tunneling Region ---
          const distFromWall = leftWall - x;
          // Start at boundaryValue and decay as we get further left
          yOffset = amplitude * boundaryValue * Math.exp(-distFromWall * decayRate);
      } 
      else if (x > rightWall) {
          // --- Right Tunneling Region ---
          const distFromWall = x - rightWall;
          // Start at boundaryValue and decay as we get further right
          yOffset = amplitude * boundaryValue * Math.exp(-distFromWall * decayRate);
      } 
      else {
          // --- Inside the Well ---
          // Simple Cosine wave
          yOffset = amplitude * Math.cos(localX * k);
      }

      const y = baseY - yOffset;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
  }
  
  ctx.stroke();

  // Annotations
  ctx.fillStyle = '#10b981';
  ctx.font = "14px monospace";
  ctx.fillText("Exponential Decay", rightWall + 20, baseY - 20);
  ctx.fillText("Tunneling Region", leftWall - 140, baseY - 20);
};
// 4. Interactive Energy Levels
const drawInteractiveWell: DrawFunction = (ctx, W, H, time, mouseX) => {
  drawWellStructure(ctx, W, H, 200);
  
  const midX = W / 2;
  const wellWidth = 300;
  
  // FIX: Consistent floor height
  const bottomY = H - 250;
  
  // Energy controlled by Mouse
  // Min energy near bottom, Max near top of well
  const energyY = bottomY - 20 - (mouseX * 150); 
  const isEscaped = mouseX > 0.9;
  
  // Draw Energy Line
  ctx.strokeStyle = isEscaped ? '#ef4444' : '#fbbf24'; // Red if escaped, Gold if trapped
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(midX - wellWidth/2, energyY);
  ctx.lineTo(midX + wellWidth/2, energyY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw Wavefunction based on Energy
  ctx.strokeStyle = isEscaped ? '#ef4444' : '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const baseY = energyY;
  // Frequency increases with energy
  const freq = 0.02 + (mouseX * 0.05); 
  const amplitude = 30;

  // Draw across screen
  for(let x = 0; x < W; x++) {
      let y = baseY;
      const inWell = x > (midX - wellWidth/2) && x < (midX + wellWidth/2);
      
      if (inWell) {
          // Oscillate
          y -= Math.sin((x - midX) * freq - time * 5) * amplitude;
      } else {
          // Outside
          if (isEscaped) {
             // Free particle (still oscillating but different k)
             y -= Math.sin((x - midX) * (freq * 0.8) - time * 5) * amplitude;
          } else {
             // Decaying
             const dist = inWell ? 0 : Math.min(Math.abs(x - (midX - wellWidth/2)), Math.abs(x - (midX + wellWidth/2)));
             // Needs to match phase at boundary (visual approximation)
             const boundaryVal = Math.sin((wellWidth/2) * freq - time * 5) * amplitude;
             y -= boundaryVal * Math.exp(-dist * (0.1 - mouseX * 0.05));
          }
      }
      
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  
  // Text
  ctx.fillStyle = '#fff';
  ctx.font = "16px monospace";
  ctx.fillText(`Particle Energy: ${(mouseX * 100).toFixed(0)}%`, 50, 50);
  
  if (isEscaped) {
      ctx.fillText("STATUS: FREE PARTICLE (Continuum)", 50, 80);
  } else {
      ctx.fillText("STATUS: BOUND STATE", 50, 80);
      ctx.fillStyle = '#888';
      ctx.font = "12px monospace";
      ctx.fillText("(Look at the tails penetrating the wall!)", 50, 100);
  }
};


// --- THE SCRIPT ---

export const SCRIPT_43: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Let us discuss a simple hole in the ground. If I drop a ball into a pit, and it does not have enough energy to jump out... it stays in the pit.",
    mathTitle: "Classical Mechanics",
    mathSub: "Total Energy (E) < Potential (V)",
    draw: drawClassicalBall
  },
  {
    speaker: "Newton",
    text: "It is strictly forbidden for the ball to be inside the wall. It bounces. It obeys the laws. It is a good, well-behaved ball.",
    mathTitle: "The Forbidden Region",
    mathSub: "Probability outside = 0",
    draw: drawClassicalBall
  },
  {
    speaker: "Schrödinger",
    text: "Apologies, Sir Isaac. But down here, particles are waves. Imagine a guitar string trapped between two infinite walls.",
    mathTitle: "The Infinite Well",
    mathSub: "V = ∞ at boundaries",
    draw: drawInfiniteWell
  },
  {
    speaker: "Schrödinger",
    text: "In an Infinite Well, the wave must be ZERO at the walls. It's a perfect prison. No escape. The math is clean.",
    mathTitle: "Boundary Conditions",
    mathSub: "Ψ(0) = 0, Ψ(L) = 0",
    draw: drawInfiniteWell
  },
  {
    speaker: "System",
    text: "But perfect prisons don't exist. Real walls require finite energy to build. What if the potential V is not infinity, but just... 'high'?",
    mathTitle: "The Finite Potential Well",
    mathSub: "V = V₀ (Finite)",
    draw: drawFiniteLeak
  },
  {
    speaker: "Heisenberg",
    text: "Aha! Now it gets fuzzy. We can't be 100% sure where the particle is. Look at the edges. The wave... it's leaking.",
    mathTitle: "Quantum Penetration",
    mathSub: "Exponential Decay: e^(-kx)",
    draw: drawFiniteLeak
  },
  {
    speaker: "Born",
    text: "Precisely. The wavefunction doesn't stop abruptly. It decays exponentially into the wall. There is a non-zero probability the particle is INSIDE the wall.",
    mathTitle: "Probability Density",
    mathSub: "|Ψ|² > 0 (In the barrier)",
    draw: drawFiniteLeak
  },
  {
    speaker: "System",
    text: "This 'leak' allows particles to Tunnel. Move your mouse to change the particle's energy. If E is high enough, it escapes. If low, it penetrates.",
    mathTitle: "Interactive Mode",
    mathSub: "Mouse X: Increase Energy",
    draw: drawInteractiveWell
  }
];
import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---
const drawSpring = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number) => {
  ctx.beginPath();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.moveTo(x, 50);
  const coils = 12;
  const step = (length - 50) / coils;
  for (let i = 0; i < coils; i++) {
    const yPos = 50 + (i * step);
    const xOffset = i % 2 === 0 ? 20 : -20;
    ctx.lineTo(x + xOffset, yPos + step/2);
  }
  ctx.lineTo(x, length);
  ctx.stroke();
  
  // The Mass
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(x - 20, length, 40, 40);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(x - 20, length, 40, 40);
};

// --- Scene Draw Functions ---

const drawBoringSpring: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const y = (H / 2) + Math.sin(time * 2) * 100;
  drawSpring(ctx, centerX, y);
  
  ctx.fillStyle = '#444';
  ctx.fillRect(centerX - 50, 40, 100, 10); // Ceiling
};

const drawCircleSecret: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 4;
  const centerY = H / 2;
  const radius = 100;
  
  // Draw the "Ghost" Circle
  ctx.beginPath();
  ctx.strokeStyle = '#222';
  ctx.setLineDash([5, 5]);
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // The rotating "Clock Hand" (Phase Angle)
  const angle = time * 3; 
  const dotX = centerX + Math.cos(angle) * radius;
  const dotY = centerY + Math.sin(angle) * radius;

  ctx.beginPath();
  ctx.strokeStyle = '#f59e0b';
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(dotX, dotY);
  ctx.stroke();

  // The Projection (The Spring)
  drawSpring(ctx, W * 0.7, dotY);
  
  // Connection line
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.moveTo(dotX, dotY);
  ctx.lineTo(W * 0.7, dotY);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.fillText("PHASE ANGLE (θ)", centerX - 40, centerY - 120);
};

const drawFrequencyRace: DrawFunction = (ctx, W, H, time) => {
  // Slow runner
  const y1 = (H / 2) + Math.sin(time * 1) * 100;
  drawSpring(ctx, W * 0.3, y1);
  ctx.fillStyle = '#888';
  ctx.fillText("Slow (Low ω)", W * 0.3 - 30, H - 50);

  // Fast runner
  const y2 = (H / 2) + Math.sin(time * 5) * 100;
  drawSpring(ctx, W * 0.7, y2);
  ctx.fillStyle = '#888';
  ctx.fillText("Aggressive (High ω)", W * 0.7 - 50, H - 50);
};

const drawPhaseShift: DrawFunction = (ctx, W, H, time) => {
  const angle1 = time * 3;
  const angle2 = time * 3 + 2; // The "Headstart" (Phase)

  const y1 = (H / 2) + Math.sin(angle1) * 100;
  const y2 = (H / 2) + Math.sin(angle2) * 100;

  drawSpring(ctx, W * 0.3, y1);
  drawSpring(ctx, W * 0.7, y2);

  ctx.fillStyle = '#fbbf24';
  ctx.fillText("Leader", W * 0.3 - 20, y1 - 10);
  ctx.fillStyle = '#ef4444';
  ctx.fillText("Follower (Phase Lag)", W * 0.7 - 40, y2 - 10);
};

const drawInteractiveSHM: DrawFunction = (ctx, W, H, time, mouseX) => {
  const phaseShift = map(mouseX, 0, 1, 0, Math.PI * 2);
  
  // Reference
  const yRef = (H / 2) + Math.sin(time * 3) * 100;
  drawSpring(ctx, W * 0.3, yRef);
  
  // User controlled
  const yUser = (H / 2) + Math.sin(time * 3 + phaseShift) * 100;
  drawSpring(ctx, W * 0.7, yUser);

  ctx.fillStyle = '#fff';
  ctx.fillText(`PHASE SHIFT (φ): ${(phaseShift).toFixed(2)} rad`, 50, 100);
  ctx.fillStyle = '#555';
  ctx.fillText("Move mouse to change the 'starting line'", 50, 130);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_2: StoryStep[] = [
  {
    speaker: "System",
    text: "Hooke has been staring at this bouncing weight for three hours. He says it's 'science.' His neighbors say he needs a hobby.",
    mathTitle: "Simple Oscillation",
    mathSub: "Up and down... forever.",
    draw: drawBoringSpring
  },
  {
    speaker: "Newton",
    text: "Robert, stop wasting time. Don't you see? It's not just moving up and down. It's actually a circle that's too shy to show its face.",
    mathTitle: "The Secret Circle",
    mathSub: "Vibration is just a rotation viewed from the side.",
    draw: drawCircleSecret
  },
  {
    speaker: "Hooke",
    text: "A circle? But it's a straight line! Are you mocking me, Isaac? Just because my wig is smaller than yours?",
    mathTitle: "The Phase Angle",
    mathSub: "Angle (θ) = Position in the bounce",
    draw: drawCircleSecret
  },
  {
    speaker: "Newton",
    text: "Look at the angle of that hidden 'hand.' We call it the Phase Angle. It tells you exactly where you are in the wiggle.",
    mathTitle: "Phase Angle",
    mathSub: "θ = ωt + φ",
    draw: drawCircleSecret
  },
  {
    speaker: "System",
    text: "Now, if we spin that 'hand' faster, the wiggles happen more often. That's 'Angular Frequency'. Or as we call it: The Vibe Check Speed.",
    mathTitle: "Angular Frequency (ω)",
    mathSub: "How many 'circles' per second?",
    draw: drawFrequencyRace
  },
  {
    speaker: "Huygens",
    text: "But what if two springs start at different times? Like my clocks? One has a headstart!",
    mathTitle: "Enter: Phase (φ)",
    mathSub: "The 'Headstart' Constant",
    draw: drawPhaseShift
  },
  {
    speaker: "System",
    text: "Exactly. That 'headstart' is called Phase. If two things have a different phase, they are 'out of sync.' Just like my social life.",
    mathTitle: "Out of Sync",
    mathSub: "Phase Difference = Synchronization Error",
    draw: drawPhaseShift
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to change the Phase (the headstart) of the right spring. Can you make them dance together?",
    mathTitle: "Interactive Phase",
    mathSub: "Mouse X = Phase Shift (φ)",
    draw: drawInteractiveSHM
  }
];
import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const toRad = (deg: number) => (deg * Math.PI) / 180;

// --- Draw Functions ---

// 1. The Solar System Model (Rutherford)
const drawSolarSystem: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const centerY = H / 2;
  const radius = 100;

  // Nucleus
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b'; // Amber/Gold nucleus
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#f59e0b';
  ctx.fill();
  ctx.shadowBlur = 0;

  // Orbit path
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#333';
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Electron
  const angle = time * 2;
  const ex = centerX + Math.cos(angle) * radius;
  const ey = centerY + Math.sin(angle) * radius;

  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#22d3ee'; // Cyan electron
  ctx.fill();
};

// 2. The Death Spiral (Classical Failure)
const drawDeathSpiral: DrawFunction = (ctx, W, H, time) => {
  const centerX = W / 2;
  const centerY = H / 2;
  
  // Calculate decaying radius
  // Starts at 150, decays to 15 over time
  let radius = 150 - (time * 40); 
  if (radius < 20) radius = 20; // Crash point

  // Nucleus
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();

  // Spiral Path (Trace history)
  ctx.beginPath();
  ctx.strokeStyle = '#ef4444'; // Red for danger
  ctx.lineWidth = 2;
  for (let t = 0; t < time * 20; t+=0.1) {
    const r = Math.max(20, 150 - (t/20 * 40));
    if (r <= 20) break;
    ctx.lineTo(centerX + Math.cos(t) * r, centerY + Math.sin(t) * r);
  }
  ctx.stroke();

  // The Screaming Electron
  const angle = time * 5; // Spanning faster as it falls
  const ex = centerX + Math.cos(angle) * radius;
  const ey = centerY + Math.sin(angle) * radius;

  // Flash red if crashed
  if (radius <= 25) {
      ctx.fillStyle = `rgba(239, 68, 68, ${Math.abs(Math.sin(time * 10))})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fillStyle = radius <= 25 ? '#fff' : '#ef4444';
  ctx.fill();
  
  ctx.fillStyle = '#ef4444';
  ctx.font = "14px monospace";
  if (radius > 25) ctx.fillText("RADIATING ENERGY!", ex + 15, ey);
  else ctx.fillText("BOOM.", ex + 15, ey);
};

// 3. Bohr's Tracks (Stationary States)
const drawBohrTracks: DrawFunction = (ctx, W, H, time, mouseX) => {
  const centerX = W / 2;
  const centerY = H / 2;
  
  // Draw Nucleus
  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();

  // Draw Allowed Tracks (n=1, n=2, n=3)
  const radii = [60, 110, 160];
  radii.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = '#22d3ee';
    ctx.font = "10px monospace";
    ctx.fillText(`n=${i+1}`, centerX + r + 5, centerY);
  });

  // Forbidden Zone Shading
  ctx.beginPath();
  ctx.arc(centerX, centerY, 160, 0, Math.PI*2);
  ctx.arc(centerX, centerY, 60, 0, Math.PI*2, true);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
  ctx.fill();

  // Electron placement based on mouse or time
  // Snap to closest track
  const targetLevel = Math.floor(mouseX * 3); // 0, 1, or 2
  const currentR = radii[Math.min(2, Math.max(0, targetLevel))];

  const angle = time * (1.5 - (targetLevel * 0.3)); // Outer tracks are slower
  const ex = centerX + Math.cos(angle) * currentR;
  const ey = centerY + Math.sin(angle) * currentR;

  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;
};

// 4. The Standing Wave (De Broglie)
const drawStandingWave: DrawFunction = (ctx, W, H, time, mouseX) => {
  const centerX = W / 2;
  const centerY = H / 2;
  const baseRadius = 100;

  // Draw Guide Circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#333';
  ctx.setLineDash([2, 2]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Determine frequency (n) based on mouse
  // Smooth transition not needed for story logic, but nice for visual
  // We want to show integer fits vs chaos
  const rawN = 1 + mouseX * 5; // 1 to 6
  const isInteger = Math.abs(Math.round(rawN) - rawN) < 0.1;
  const n = isInteger ? Math.round(rawN) : rawN;
  
  ctx.beginPath();
  ctx.strokeStyle = isInteger ? '#10b981' : '#ef4444'; // Green if stable, Red if chaotic
  ctx.lineWidth = 3;

  for (let a = 0; a <= Math.PI * 2.1; a += 0.05) { // Go slightly past to show overlap
    const waveHeight = 15 * Math.sin(n * a + time * 2);
    const r = baseRadius + waveHeight;
    const x = centerX + Math.cos(a) * r;
    const y = centerY + Math.sin(a) * r;
    
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Text status
  ctx.fillStyle = isInteger ? '#10b981' : '#ef4444';
  ctx.font = "20px monospace";
  ctx.fillText(`Wavelengths: ${n.toFixed(2)}`, centerX - 60, centerY + 10);
  ctx.font = "14px monospace";
  ctx.fillText(isInteger ? "STABLE (Standing Wave)" : "DESTRUCTIVE (Cancelled)", centerX - 80, centerY + 30);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_39: StoryStep[] = [
  {
    speaker: "Rutherford",
    text: "Eureka! I've mapped the atom. It is a tiny solar system. A heavy nucleus in the middle, and electrons orbiting around it like planets.",
    mathTitle: "Planetary Model",
    mathSub: "F_centripetal = F_electrostatic",
    draw: drawSolarSystem
  },
  {
    speaker: "System",
    text: "Objection. According to Classical Electrodynamics, an accelerating charged particle emits radiation.",
    mathTitle: "Maxwell's Equations",
    mathSub: "a ≠ 0 → Energy Loss",
    draw: drawSolarSystem // Keep showing the happy orbit for a second
  },
  {
    speaker: "System",
    text: "If it emits radiation, it loses energy. If it loses energy, it slows down. If it slows down, it crashes.",
    mathTitle: "The Death Spiral",
    mathSub: "Estimated Life: < 10^-11 s",
    draw: drawDeathSpiral
  },
  {
    speaker: "Newton",
    text: "He's right, Rutherford. Your atom just destroyed the entire universe in a fraction of a second. Nice going.",
    mathTitle: "Classic Physics Failed",
    mathSub: "Matter shouldn't exist.",
    draw: drawDeathSpiral
  },
  {
    speaker: "Bohr",
    text: "Everyone relax. I have a solution. It's a bit... illegal.",
    mathTitle: "The Fix",
    mathSub: "Enter Quantum Theory",
    draw: drawBohrTracks
  },
  {
    speaker: "Bohr",
    text: "The electron doesn't spiral. Why? Because I said so. It lives on 'Stationary States'.",
    mathTitle: "Stationary States",
    mathSub: "Move mouse to jump tracks",
    draw: drawBohrTracks
  },
  {
    speaker: "System",
    text: "You can't just make up rules, Niels. Why can it be here (n=1) or there (n=2), but not in the middle?",
    mathTitle: "Quantization",
    mathSub: "Discrete Orbits Only",
    draw: drawBohrTracks
  },
  {
    speaker: "de Broglie",
    text: "Because the electron isn't a planet. It's a vibration. A wave wrapped around a circle.",
    mathTitle: "Matter Waves",
    mathSub: "λ = h / p",
    draw: drawStandingWave
  },
  {
    speaker: "de Broglie",
    text: "Try the simulation. If the wave doesn't meet itself perfectly (integer number of wavelengths), it destroys itself. That's why the 'in-between' is forbidden.",
    mathTitle: "Constructive Interference",
    mathSub: "2πr = nλ (Mouse moves freq)",
    draw: drawStandingWave
  },
  {
    speaker: "Schrödinger",
    text: "You guys are getting closer. But wait until you see my cat.",
    mathTitle: "",
    mathSub: "",
    draw: drawStandingWave
  }
];
import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawParticles: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.fillStyle = '#60a5fa';
  for (let i = 0; i < 5; i++) {
    const x = ((time * 100) + (i * 150)) % (W + 100) - 50;
    ctx.beginPath();
    ctx.arc(x, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }
  ctx.fillStyle = '#666';
  ctx.font = "14px monospace";
  ctx.fillText("NEWTON'S LITTLE 'BALLS' OF LIGHT", W / 2 - 120, H - 40);
};

const drawInfiniteWave: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = cy + Math.sin(x * 0.05 - time * 5) * 50;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#888';
  ctx.fillText("HUYGENS'S WAVE: IT'S EVERYWHERE AT ONCE", W / 2 - 150, H - 40);
};

const drawDesperateEinstein: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const x = (time * 150) % (W + 200) - 100;
  
  // A localized "Burst"
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let dx = -100; dx < 100; dx++) {
    const worldX = x + dx;
    // Gaussian envelope to keep the wave in a "packet"
    const envelope = Math.exp(-(dx * dx) / 1000);
    const y = cy + Math.sin(dx * 0.2) * 60 * envelope;
    if (dx === -100) ctx.moveTo(worldX, y);
    else ctx.lineTo(worldX, y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#fbbf24';
  ctx.fillText("THE PHOTON: A WAVE IN A BOX?", x - 50, cy - 80);
};

const drawSuperpositionPacket: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const numWaves = 10;
  
  // Draw the component waves (faint)
  ctx.globalAlpha = 0.15;
  ctx.lineWidth = 1;
  for (let i = 0; i < numWaves; i++) {
    ctx.strokeStyle = `hsl(${i * 20}, 70%, 60%)`;
    ctx.beginPath();
    const freq = 0.05 + i * 0.005;
    for (let x = 0; x < W; x++) {
      const y = cy + Math.sin(x * freq - time * (2 + i)) * 40;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Draw the resulting Packet (Thick)
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    let totalY = 0;
    for (let i = 0; i < numWaves; i++) {
      const freq = 0.05 + i * 0.005;
      totalY += Math.sin(x * freq - time * (2 + i));
    }
    const y = cy + (totalY / numWaves) * 150;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.fillText("MANY WAVES TEAMING UP TO STAY IN ONE SPOT", 50, 50);
};

const drawInteractivePacket: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const spread = map(mouseX, 0, 1, 10, 200); // Uncertainty in k
  const packetX = (time * 100) % (W + 400) - 200;

  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const dist = x - packetX;
    // The width of the envelope is inversely proportional to the 'spread' of wavelengths
    const envelope = Math.exp(-(dist * dist) / (20000 / spread));
    const y = cy + Math.sin(x * 0.1) * 80 * envelope;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Packet Sharpness: ${spread.toFixed(0)}`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Adjust how many frequencies are invited to the party", 50, 75);
};

// --- THE SCRIPT ARRAY ---

export const SCRIPT_11: StoryStep[] = [
  {
    speaker: "System",
    text: "Long ago, Isaac Newton had a very simple view of the world. He thought everything was just little rocks flying through space.",
    mathTitle: "The Particle View",
    mathSub: "E = 1/2 mv²",
    draw: drawParticles
  },
  {
    speaker: "Newton",
    text: "Light is a particle! It hits things. It bounces. It's solid logic! Why are you all looking at me like that?",
    mathTitle: "Corpuscular Theory",
    mathSub: "Light as Marbles",
    draw: drawParticles
  },
  {
    speaker: "Huygens",
    text: "Nonsense, Isaac. Light is a ripple! But ripples go everywhere. If light is a wave, how can it be 'here' but not 'there'?",
    mathTitle: "The Wave Problem",
    mathSub: "Waves span all space.",
    draw: drawInfiniteWave
  },
  {
    speaker: "Einstein",
    text: "I have a desperate solution. What if light is a wave... that is trapped in a tiny bundle? A packet of energy. A Photon.",
    mathTitle: "Quantization",
    mathSub: "E = hf",
    draw: drawDesperateEinstein
  },
  {
    speaker: "System",
    text: "This is the mystery: How do you make a wave—which wants to be infinite—stay in one small spot?",
    mathTitle: "The localization Puzzle",
    mathSub: "Δx vs Δk",
    draw: drawDesperateEinstein
  },
  {
    speaker: "de Broglie",
    text: "It's a group project! If you stack many waves of different frequencies on top of each other, they cancel each other out everywhere... except for one spot.",
    mathTitle: "Superposition",
    mathSub: "Creating the 'Group'",
    draw: drawSuperpositionPacket
  },
  {
    speaker: "System",
    text: "This is the Wave Packet. It travels like a particle, but wiggles like a wave. It is the compromise that runs the entire universe.",
    mathTitle: "The Wave Packet",
    mathSub: "Localization through Interference",
    draw: drawSuperpositionPacket
  },
  {
    speaker: "Schrödinger",
    text: "So an electron isn't a dot? It's just a very organized pile of wiggles? My cat is going to hate this.",
    mathTitle: "Quantum Reality",
    mathSub: "ψ(x, t) = The Wave Packet",
    draw: drawInteractivePacket
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to change the variety of frequencies. More variety makes the packet 'sharper' but harder to measure.",
    mathTitle: "Interactive Uncertainty",
    mathSub: "Mouse X: Fourier Variety",
    draw: drawInteractivePacket
  }
];
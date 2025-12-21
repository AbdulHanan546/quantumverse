import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawMessyWave: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    // A chaotic looking wave
    const y = cy + 
      Math.sin(x * 0.02 + time) * 40 + 
      Math.sin(x * 0.05 - time * 2) * 20 + 
      Math.cos(x * 0.1 + time * 1.5) * 10;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#666';
  ctx.font = "14px monospace";
  ctx.fillText("A JAGGED, MESSY REAL-WORLD SIGNAL", W / 2 - 120, H - 40);
};

const drawPureIngredient: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    const y = cy + Math.sin(x * 0.03 + time * 3) * 60;
    if (x === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#60a5fa';
  ctx.fillText("THE PURE INGREDIENT: A SINE WAVE", W / 2 - 100, cy - 100);
};

const drawLegoSum: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const components = [
    { f: 0.02, a: 50, c: '#3b82f6' },
    { f: 0.06, a: 20, c: '#fbbf24' },
    { f: 0.12, a: 10, c: '#4ade80' }
  ];

  components.forEach((comp, i) => {
    ctx.strokeStyle = comp.c;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    const yOff = (i - 1) * 80;
    for (let x = 100; x < W - 100; x++) {
      const y = cy + yOff + Math.sin(x * comp.f + time * (i + 1)) * comp.a;
      if (x === 100) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 100; x < W - 100; x++) {
    let totalY = 0;
    components.forEach((comp, i) => {
      totalY += Math.sin(x * comp.f + time * (i + 1)) * comp.a;
    });
    ctx.lineTo(x, cy + totalY);
  }
  ctx.stroke();
  ctx.fillText("STACKING SIMPLE BLOCKS TO MAKE COMPLEXITY", 100, 50);
};

const drawSquareApproximation: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  // Approximating a Square Wave
  const iterations = Math.floor((time % 10) + 1);
  
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 50; x < W - 50; x++) {
    let y = 0;
    for (let n = 1; n < iterations * 2; n += 2) {
      y += (1 / n) * Math.sin(n * x * 0.02);
    }
    const plotY = cy + y * 100;
    if (x === 50) ctx.moveTo(x, plotY);
    else ctx.lineTo(x, plotY);
  }
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.fillText(`CIRCLES ADDED: ${iterations}`, 50, 50);
  ctx.fillStyle = '#888';
  ctx.fillText("Notice how the 'corners' start appearing!", 50, 75);
};

const drawInteractiveFourier: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cy = H / 2;
  const nMax = Math.floor(map(mouseX, 0, 1, 1, 30));
  
  // Draw the "target" square wave
  ctx.strokeStyle = '#222';
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(100, cy - 80, W - 200, 160);
  ctx.setLineDash([]);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 100; x < W - 100; x++) {
    let y = 0;
    for (let n = 1; n <= nMax; n++) {
        // Sawtooth wave approximation
        y += (Math.sin(n * (x * 0.03 + time)) / n);
    }
    const plotY = cy + y * 80;
    if (x === 100) ctx.moveTo(x, plotY);
    else ctx.lineTo(x, plotY);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`HARMONICS: ${nMax}`, 50, 50);
  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Add more circles to sharpen the 'jagged' edge", 50, 75);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_10: StoryStep[] = [
  {
    speaker: "System",
    text: "The universe is a messy place. Waves are rarely perfect. They are jagged, noisy, and chaotic.",
    mathTitle: "Real-World Signals",
    mathSub: "The 'Messy' Problem",
    draw: drawMessyWave
  },
  {
    speaker: "Newton",
    text: "It is impossible to describe that jagged mess with simple math! Math is for perfect things, like orbits and smooth curves.",
    mathTitle: "The Skeptic",
    mathSub: "Calculus of Smoothness",
    draw: drawMessyWave
  },
  {
    speaker: "Fourier",
    text: "Isaac, you are overthinking it. Jaggedness is just a disguise. Think of it like a recipe. Even the most complex soup is just a mix of simple ingredients.",
    mathTitle: "The Radical Idea",
    mathSub: "Everything is a recipe.",
    draw: drawPureIngredient
  },
  {
    speaker: "Fourier",
    text: "My 'ingredient' of choice is the Sine Wave. I claim that if you add enough of these smooth wiggles together, you can draw ANY shape. Even a box with sharp corners!",
    mathTitle: "Superposition of Sines",
    mathSub: "Σ An sin(nx)",
    draw: drawLegoSum
  },
  {
    speaker: "Newton",
    text: "A box? Made of circles? That’s like making a skyscraper out of beach balls, Joseph. It will always be lumpy!",
    mathTitle: "The Corner Paradox",
    mathSub: "Can 'Smooth' make 'Sharp'?",
    draw: drawSquareApproximation
  },
  {
    speaker: "System",
    text: "Actually, he's right. As you add more and more high-speed 'circles,' the lumps get smaller and smaller until they form a perfect edge.",
    mathTitle: "Convergence",
    mathSub: "The Infinite Sum",
    draw: drawSquareApproximation
  },
  {
    speaker: "Fourier",
    text: "This is my secret: Don't look at the 'Signal.' Look at the 'Ingredients.' Every sound, every image, every heat-map is just a chord of different frequencies.",
    mathTitle: "The Frequency Domain",
    mathSub: "Math as a Prism",
    draw: drawLegoSum
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to add 'Harmonics' (extra circles). Watch how a few smooth wiggles can 'trick' your eyes into seeing a sharp sawtooth edge.",
    mathTitle: "The Master Chef",
    mathSub: "Mouse X: Number of Ingredients",
    draw: drawInteractiveFourier
  }
];
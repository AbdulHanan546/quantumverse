import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// A simple Gaussian bump
const gaussian = (x: number, mean: number, sigma: number) => {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2)));
};

// --- Draw Functions ---

// Scene 1: Classical Dice (Discrete Average)
const drawDice: DrawFunction = (ctx, W, H, time) => {
  // Fix: Move ground up to avoid dialogue box overlay
  const groundY = H - 180; 
  const barWidth = W / 10;
  const startX = W * 0.15;

  // Draw Axes
  ctx.strokeStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(50, groundY);
  ctx.lineTo(W - 50, groundY);
  ctx.stroke();

  // Draw 6 Bars
  ctx.fillStyle = '#60a5fa'; // Blue (Newton)
  for (let i = 1; i <= 6; i++) {
    const height = 100 + Math.sin(time * 5 + i) * 5; // Slight jitter
    const x = startX + (i * barWidth);
    ctx.fillRect(x, groundY - height, barWidth - 10, height);
    
    ctx.fillStyle = '#fff';
    ctx.font = "16px monospace";
    ctx.fillText(i.toString(), x + barWidth/2 - 5, groundY + 20);
    ctx.fillStyle = '#60a5fa';
  }

  // Draw the "Average" line at 3.5
  const avgX = startX + (3.5 * barWidth);
  ctx.strokeStyle = '#f59e0b'; // Amber
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(avgX, groundY);
  ctx.lineTo(avgX, 50);
  ctx.stroke();
  
  ctx.fillStyle = '#f59e0b';
  ctx.fillText("AVG: 3.5", avgX + 10, 80);
  ctx.setLineDash([]);
};

// Scene 2: The Quantum Cloud (Uncertainty)
const drawCloud: DrawFunction = (ctx, W, H, time) => {
  const groundY = H - 180; // Adjusted height
  
  // Ghostly fill
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, 'rgba(139, 92, 246, 0)');
  grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)'); // Violet
  grad.addColorStop(1, 'rgba(139, 92, 246, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  
  for(let x = 0; x <= W; x+=5) {
    // A wave that breathes and moves slightly
    const center = W/2 + Math.sin(time) * 50;
    const height = gaussian(x, center, 80) * 250;
    const jitter = Math.sin(x * 0.1 + time * 5) * 5;
    ctx.lineTo(x, groundY - height + jitter);
  }
  ctx.lineTo(W, groundY);
  ctx.fill();

  ctx.fillStyle = '#ddd';
  ctx.font = "20px monospace";
  ctx.fillText("? ? ?", W/2 - 20, H/2 - 50);
};

// Scene 3: The Double Peak (The Expectation Paradox)
const drawDoublePeak: DrawFunction = (ctx, W, H) => {
  const groundY = H - 180; // Adjusted height
  
  // Two bumps
  const peak1 = W * 0.3;
  const peak2 = W * 0.7;
  
  ctx.strokeStyle = '#a78bfa'; // Light purple
  ctx.lineWidth = 4;
  ctx.beginPath();
  
  let sumX = 0;
  let totalProb = 0;

  for(let x = 0; x <= W; x+=2) {
    const y1 = gaussian(x, peak1, 40);
    const y2 = gaussian(x, peak2, 40);
    const val = y1 + y2;
    
    // Accumulate for "math" logic (simplified)
    sumX += x * val;
    totalProb += val;

    const plotY = groundY - val * 250;
    if(x===0) ctx.moveTo(x, plotY);
    else ctx.lineTo(x, plotY);
  }
  ctx.stroke();

  // The Expectation Value (The Center)
  const expVal = W / 2; // Perfectly in the middle
  
  // Draw the "Expected" Line
  ctx.strokeStyle = '#ef4444'; // Red (Warning)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(expVal, groundY);
  ctx.lineTo(expVal, 50);
  ctx.stroke();

  ctx.fillStyle = '#ef4444';
  ctx.fillText("<x> EXPECTATION", expVal - 60, 40);
  ctx.fillText("(Nobody is here!)", expVal - 60, 60);
};

// Scene 4: Interactive Balance
const drawInteractiveExpectation: DrawFunction = (ctx, W, H, time, mouseX) => {
  const groundY = H - 180; // Adjusted height
  const center = map(mouseX, 0, 1, 100, W - 100);
  
  // Draw the probability wave
  ctx.beginPath();
  ctx.fillStyle = 'rgba(52, 211, 153, 0.2)'; // Emerald transparent
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;
  
  ctx.moveTo(0, groundY);
  for(let x = 0; x <= W; x+=5) {
    // Skew the wave based on mouse to show "weighting"
    const skew = (x - center) * 0.002 * Math.sin(time); 
    const val = gaussian(x, center + skew, 60);
    const plotY = groundY - val * 300;
    ctx.lineTo(x, plotY);
  }
  ctx.lineTo(W, groundY);
  ctx.fill();
  ctx.stroke();

  // Draw the Expectation Fulcrum (Triangle)
  const fulcrumX = center; 
  
  ctx.fillStyle = '#fbbf24'; // Yellow
  ctx.beginPath();
  ctx.moveTo(fulcrumX, groundY);
  ctx.lineTo(fulcrumX - 10, groundY + 20);
  ctx.lineTo(fulcrumX + 10, groundY + 20);
  ctx.fill();

  // Text
  ctx.fillStyle = '#fff';
  ctx.font = "14px monospace";
  ctx.fillText(`Position Operator x`, 20, 50);
  ctx.fillText(`Wavefunction ψ`, 20, 70);
  ctx.fillText(`Result: <x> = ${fulcrumX.toFixed(0)}`, fulcrumX + 15, groundY - 50);
};


// --- THE SCRIPT ---

export const SCRIPT_36: StoryStep[] = [
  {
    speaker: "Newton",
    text: "Welcome to the casino of Classical Physics! It is I, Isaac Newton. Look at this die. Simple. Deterministic.",
    mathTitle: "Classical Average",
    mathSub: "Sum / Count",
    draw: drawDice
  },
  {
    speaker: "Newton",
    text: "If I roll this die a million times, I know exactly what the average will be. 3.5. It is boring, but it is TRUTH.",
    mathTitle: "The Certainty",
    mathSub: "Avg = (1+2+3+4+5+6)/6 = 3.5",
    draw: drawDice
  },
  {
    speaker: "Schrödinger",
    text: "Boring indeed. In my world, we don't have dice. We have... soup. A probability soup.",
    mathTitle: "The Wave Function",
    mathSub: "ψ(x) : Amplitude of probability",
    draw: drawCloud
  },
  {
    speaker: "Newton",
    text: "Soup? Don't be ridiculous. Where is the particle? Point to it.",
    mathTitle: "Location?",
    mathSub: "x = ???",
    draw: drawCloud
  },
  {
    speaker: "Schrödinger",
    text: "I cannot! It is smeared across space. It is mostly here, but slightly there. It is a ghost in the machine.",
    mathTitle: "Superposition",
    mathSub: "|ψ|² = Probability Density",
    draw: drawCloud
  },
  {
    speaker: "Born",
    text: "Gentlemen, please. We can still measure this. We just need to change how we calculate the 'Average'.",
    mathTitle: "The Born Rule",
    mathSub: "P(x) = |ψ(x)|²",
    draw: drawInteractiveExpectation
  },
  {
    speaker: "Born",
    text: "We call it the 'Expectation Value' (<x>). But be warned... it is a terrible name.",
    mathTitle: "Expectation Value",
    mathSub: "<x> = ∫ x · |ψ(x)|² dx",
    draw: drawDoublePeak
  },
  {
    speaker: "System",
    text: "Look at the red line. The 'Expectation Value' is in the middle. But the probability there is ZERO.",
    mathTitle: "The Misnomer",
    mathSub: "The average is where the particle ISN'T.",
    draw: drawDoublePeak
  },
  {
    speaker: "Heisenberg",
    text: "Exactly! It is a calculation, not a location. If I spend half my time in London and half in New York, my 'average' location is the middle of the Atlantic Ocean!",
    mathTitle: "Statistical Truth",
    mathSub: "Center of Mass of Probability",
    draw: drawDoublePeak
  },
  {
    speaker: "System",
    text: "Use your mouse to move the wave packet. The yellow fulcrum tracks the Expectation Value.",
    mathTitle: "Interactive",
    mathSub: "Move the Probability Cloud",
    draw: drawInteractiveExpectation
  }
];
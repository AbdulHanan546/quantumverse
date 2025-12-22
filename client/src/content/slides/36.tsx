import React from 'react';
import { Target, BarChart3, Binary, HelpCircle } from 'lucide-react';

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

// 1. The Dice/Probability Simulation
// Shows that the "average" (expectation) isn't necessarily a result you can actually roll.
const runDiceSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let rolls = [];
  let sum = 0;
  let animId;
  let frame = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    frame++;

    // Add a new roll every 20 frames
    if (frame % 20 === 0 && rolls.length < 100) {
      const val = Math.floor(Math.random() * 6) + 1;
      rolls.push(val);
      sum += val;
    }

    const avg = rolls.length > 0 ? (sum / rolls.length).toFixed(2) : "0.00";

    // Draw Histogram
    const counts = [0, 0, 0, 0, 0, 0];
    rolls.forEach(r => counts[r-1]++);
    
    const margin = 50;
    const barWidth = (w - margin * 2) / 6;
    
    counts.forEach((count, i) => {
      const barH = (count / (rolls.length || 1)) * (h - 150);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(margin + i * barWidth + 5, h - 50, barWidth - 10, - (h-150));
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(margin + i * barWidth + 5, h - 50, barWidth - 10, -barH);
      
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(i + 1, margin + i * barWidth + barWidth/2, h - 30);
    });

    // Draw Expectation Line
    if (rolls.length > 0) {
      const expectX = margin + (parseFloat(avg) - 1) * barWidth + barWidth/2;
      ctx.strokeStyle = '#f87171';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(expectX, 50);
      ctx.lineTo(expectX, h - 50);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Expectation (Average): ${avg}`, w/2, 40);
    }

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

// 2. The Quantum Particle Position Simulation
// A "cloud" shows where the particle is likely to be. Dots appear.
const runQuantumSim = (canvas) => {
  const ctx = canvas.getContext('2d');
  let points = [];
  let animId;
  let frame = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    const cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    frame++;

    // Wavefunction shape (The "Cloud")
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x++) {
      // A double-humped distribution
      const y = cy - (Math.exp(-Math.pow(x - w*0.3, 2)/2000) * 100) 
                   - (Math.exp(-Math.pow(x - w*0.7, 2)/2000) * 100);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Generate random detections based on the cloud
    if (frame % 5 === 0) {
      let found = false;
      while (!found) {
        let testX = Math.random() * w;
        let chance = (Math.exp(-Math.pow(testX - w*0.3, 2)/2000)) 
                   + (Math.exp(-Math.pow(testX - w*0.7, 2)/2000));
        if (Math.random() < chance) {
          points.push(testX);
          found = true;
        }
      }
    }

    // Draw detection dots
    ctx.fillStyle = '#4ade80';
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Calculate Average (Expectation Value)
    if (points.length > 0) {
      const avgX = points.reduce((a, b) => a + b, 0) / points.length;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(avgX, cy - 120);
      ctx.lineTo(avgX, cy + 120);
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("EXPECTATION VALUE", avgX, cy - 130);
      ctx.font = '12px sans-serif';
      ctx.fillText("(The Average Position)", avgX, cy + 145);
    }

    if (points.length > 200) points.shift();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_36 = [
  {
    id: 1,
    type: "intro",
    title: "Expectation Values",
    subtitle: "Predicting the 'Average' in a world of chance.",
    icon: <Target size={80} className="text-green-400" />,
    meta: "Quantum Physics for Beginners"
  },
  {
    id: 2,
    type: "quote",
    text: "Quantum mechanics says that the more you look, the less you know exactly where something is—but you can always guess the average!",
    author: "Simplified Science"
  },
  {
    id: 3,
    type: "concept-split",
    title: "The Big Secret",
    leftContent: "In physics, an 'Expectation Value' is just a fancy name for an AVERAGE. But it's a special kind of average.",
    rightPoints: [
      "It's not what you 'expect' to see once.",
      "It's what you get if you do it 1,000 times.",
      "It helps us find where a particle 'mostly' lives."
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Dice Experiment",
    description: "If you roll a die, you get 1, 2, 3, 4, 5, or 6. But the 'Expectation Value' is 3.5. Can you ever roll a 3.5? No! But that's the average.",
    run: runDiceSim
  },
  {
    id: 5,
    type: "comparison",
    title: "Most Likely vs. Average",
    leftTitle: "Most Likely (Mode)",
    leftPoints: [
      "The single result that happens most often.",
      "Like the most popular pizza topping.",
      "A specific spot on a map."
    ],
    rightTitle: "Expectation (Average)",
    rightPoints: [
      "The 'center of gravity' of all results.",
      "Could be a result that NEVER actually happens.",
      "Calculated by looking at every possibility."
    ]
  },
  {
    id: 6,
    type: "equation",
    latex: "⟨x⟩ = Σ (Result × Chance)",
    description: "To find the average, you multiply every possible result by how likely it is to happen, then add them all up.",
    variables: [
      { symbol: "⟨x⟩", meaning: "Expectation Value (The Average)" },
      { symbol: "Result", meaning: "What could happen (like a dice number)" },
      { symbol: "Chance", meaning: "How likely that result is (Probability)" }
    ]
  },
  {
    id: 7,
    type: "quiz",
    question: "If a particle has a 50% chance of being at position 0 and a 50% chance of being at position 10, what is the Expectation Value?",
    options: ["0", "10", "5", "It could be anywhere"],
    correctIndex: 2,
    explanation: "Halfway between 0 and 10 is 5. (0 * 0.5) + (10 * 0.5) = 5. Even if the particle is NEVER at 5, that is its average position!"
  },
  {
    id: 8,
    type: "simulation",
    title: "Quantum Probability Cloud",
    description: "In the quantum world, particles are like 'clouds.' The Expectation Value (blue line) shows the average of all the places the particle is 'detected' (green dots).",
    run: runQuantumSim
  },
  {
    id: 9,
    type: "process",
    title: "How to find it",
    steps: [
      { label: "Check the Cloud", desc: "Look at the probability distribution (where is the particle likely to be?)." },
      { label: "Do the Math", desc: "Multiply every possible position by its probability." },
      { label: "Sum it up", desc: "Add those values together to find the 'Balance Point'." },
      { label: "The Result", desc: "You now have the Expectation Value—the long-term average." }
    ]
  },
  {
    id: 10,
    type: "true-false",
    statement: "The 'Expectation Value' is the value we are 100% sure the particle will be at when we look.",
    isTrue: false,
    explanation: "False! It's just an average. The particle could actually be found far away from the expectation value."
  },
  {
    id: 11,
    type: "summary",
    title: "Key Takeaways",
    recap: [
      "Expectation Value = Weighted Average.",
      "It tells us where the 'center' of the probability is.",
      "You don't need to ever see a specific result for it to be the average.",
      "It is the foundation of predicting things in Quantum Mechanics."
    ]
  },
  {
    id: 12,
    type: "outro",
    title: "Great Job!",
    text: "You now understand how physicists predict the 'average' behavior of tiny particles that love to play hide and seek!"
  }
];
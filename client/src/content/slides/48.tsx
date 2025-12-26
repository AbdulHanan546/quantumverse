import React from 'react';
import { Atom, Microscope, ZoomIn, Globe, Zap, Layers } from 'lucide-react';
import type { SlideData } from '../../components/TopicRenderer'; 

/* -------------------------------------------------------------------------- /
/                         SIMULATION FUNCTIONS                               /
/ -------------------------------------------------------------------------- */

/**
 * Simulation 1: The Pixel Analogy (Looping Version)
 * Demonstrates how discrete dots (Quantum) appear as a solid mass (Classical) 
 * when viewed from a distance.
 */
const runPixelSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let zoom = 1.0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    
    const centerX = w / 2;
    const centerY = h / 2;
    
    // As zoom gets smaller, the grid tightens and dots get smaller
    const gridSize = 50 * zoom;
    const dotSize = 12 * zoom;

    // Drawing a "Ball" made of individual quantum dots
    for (let x = -6; x <= 6; x++) {
      for (let y = -6; y <= 6; y++) {
        // Only draw dots within a circular radius
        if (Math.sqrt(x*x + y*y) <= 5) {
          const posX = centerX + x * gridSize;
          const posY = centerY + y * gridSize;
          
          ctx.beginPath();
          ctx.arc(posX, posY, dotSize, 0, Math.PI * 2);
          
          // As we zoom out, dots become more opaque and solid-looking
          if (zoom > 0.15) {
            ctx.fillStyle = `rgba(74, 222, 128, ${1.2 - zoom})`;
          } else {
            ctx.fillStyle = '#4ade80'; // Solid green when "Classical"
          }
          ctx.fill();
        }
      }
    }

    // Text labels based on zoom level
    ctx.textAlign = 'center';
    if (zoom > 0.6) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        ctx.fillText("Quantum View: Seeing the 'Dots'", centerX, h - 40);
    } else if (zoom < 0.2) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText("Classical Limit: It looks solid!", centerX, h - 40);
    }

    // Logic to keep playing: zoom out until tiny, then reset
    zoom -= 0.004; 
    if (zoom <= 0.02) {
        zoom = 1.0; // Reset to start the loop over
    }

    animId = requestAnimationFrame(render);
  };
  
  render();
  return () => cancelAnimationFrame(animId);
};

/**
 * Simulation 2: Wave vs. Straight Line
 */
const runPathSim = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  let offset = 0;
  let animId = 0;

  const render = () => {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    offset += 0.05;

    const cy1 = h * 0.3; 
    const cy2 = h * 0.7; 

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px font-mono';
    ctx.fillText("TINY SCALE (Quantum): Fuzzy and Wavy", 20, cy1 - 40);
    ctx.fillText("LARGE SCALE (Daily Life): Straight and Certain", 20, cy2 - 40);

    ctx.beginPath();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    for(let x = 0; x < w; x++) {
        const y = cy1 + Math.sin(x * 0.05 + offset) * 20 + (Math.random() - 0.5) * 5;
        if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.moveTo(0, cy2);
    ctx.lineTo(w, cy2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    const ballX = (offset * 50) % w;
    ctx.beginPath();
    ctx.arc(ballX, cy2, 10, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(render);
  };
  render();
  return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- /
/                             DATA DEFINITION                                /
/ -------------------------------------------------------------------------- */

export const SLIDES_48: SlideData[] = [
  {
    id: 1,
    type: "intro",
    title: "The Great Hiding Act",
    subtitle: "Why the world looks normal when atoms are so weird.",
    icon: <Globe size={80} className="text-blue-400" />,
    meta: "Quantum Physics: Slide 48"
  },
  {
    id: 2,
    type: "quote",
    text: "Everything we call real is made of things that cannot be regarded as real.",
    author: "Niels Bohr"
  },
  {
    id: 3,
    type: "concept-split",
    title: "The Mystery",
    leftContent: "If you look at an atom, it's a mess. It behaves like a fuzzy wave and can be in multiple places. But when you look at a basketball, it's a solid object that follows a clear path. Where does the 'weirdness' go?",
    rightPoints: [
      "Atoms = Fuzzy Waves",
      "Large Objects = Solid Lines",
      "The 'Classical Limit' is the bridge where the fuzziness disappears."
    ]
  },
  {
    id: 4,
    type: "simulation",
    title: "The Pixel Secret",
    description: "Think of the world like a phone screen. When you zoom in (Quantum), you see individual dots. When you zoom out (Classical), it looks like one smooth, solid image.",
    run: runPixelSim
  },
  {
    id: 5,
    type: "comparison",
    title: "Two Different Worlds",
    leftTitle: "Quantum Rules (Small)",
    leftPoints: [
      "Things act like blurry waves",
      "Impossible to know exact position",
      "Objects can 'tunnel' through walls",
      "Everything is 'choppy' or chunky"
    ],
    rightTitle: "Classical Rules (Big)",
    rightPoints: [
      "Things move in straight lines",
      "You know exactly where things are",
      "Walls actually stop objects",
      "Everything looks smooth and continuous"
    ]
  },
  {
    id: 6,
    type: "process",
    title: "How Waves Become Lines",
    steps: [
      { label: "The Tiny Wave", desc: "A single atom ripples like a wave in a bathtub." },
      { label: "Strength in Numbers", desc: "When billions of atoms join together, their ripples overlap." },
      { label: "The Big Cancel", desc: "The 'weird' parts of the waves bump into each other and cancel out." },
      { label: "The Solid Result", desc: "What's left is the average motion—a predictable straight line." }
    ]
  },
  {
    id: 7,
    type: "simulation",
    title: "Predictable vs. Unpredictable",
    description: "In the quantum world (top), paths are fuzzy. In the classical world (bottom), the billions of atoms 'agree' on one straight path.",
    run: runPathSim
  },
  {
    id: 8,
    type: "concept-list",
    title: "Why don't we act 'Quantum'?",
    context: "If you are made of atoms, why can't you walk through walls? There are three main bodyguards protecting our 'normal' reality:",
    items: [
      "Mass: You are way too heavy for your wave-nature to show.",
      "Numbers: You have trillions of atoms averaging out the chaos.",
      "Environment: Air and light are constantly 'watching' you, forcing your atoms to stay in one place."
    ]
  },
  {
    id: 9,
    type: "equation",
    latex: "Mass \\times Size \\rightarrow Normal",
    description: "There is no magic line, but as things get bigger and heavier, the quantum math naturally turns into the 'normal' math we use in daily life.",
    variables: [
      { symbol: "Mass", meaning: "How much 'stuff' is in the object" },
      { symbol: "Normal", meaning: "The predictable world we see" }
    ]
  },
  {
    id: 10,
    type: "quiz",
    question: "Why does a grain of sand act like a solid object instead of a fuzzy wave?",
    options: [
      "Because it's made of special 'solid' atoms",
      "Because it contains enough atoms to average out the quantum fuzziness",
      "Because quantum mechanics turns off during the daytime",
      "Because sand is too heavy for gravity"
    ],
    correctIndex: 1,
    explanation: "Even a tiny grain of sand has quintillions of atoms. Their individual 'wave' behaviors cancel each other out, leaving only the solid 'average' behavior."
  },
  {
    id: 11,
    type: "true-false",
    statement: "Quantum laws still apply to big objects, we just don't notice the effects because they are too small.",
    isTrue: true,
    explanation: "Exactly! The laws of physics don't change, but the 'weird' effects become so small for big objects that they are impossible to measure."
  },
  {
    id: 12,
    type: "summary",
    title: "Recap: The Bridge",
    recap: [
      "Quantum Mechanics is the 'true' rulebook of the universe.",
      "Classical Physics is the 'shorthand' version for big things.",
      "The 'Classical Limit' happens when things get big or heavy.",
      "Billions of tiny waves cancel out to create one solid reality."
    ]
  },
  {
    id: 13,
    type: "outro",
    title: "Reality Check",
    text: "The 'normal' world is just a giant illusion created by billions of tiny, weird atoms working together. You've mastered the Classical Limit!"
  }
];
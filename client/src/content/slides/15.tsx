import React from "react";
import { 
  Layers, 
  Music, 
  ChefHat, 
  Activity, 
  Sigma,
  Sun, 
  BarChart3,
  AlignJustify
} from "lucide-react";
import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Energy Transport Simulation
 * Shows energy "packets" moving along a wave like a conveyor belt.
 */
const runEnergyFlowSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        // Draw the Wave (The Path)
        ctx.strokeStyle = '#3f3f46';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = cy + Math.sin(x * 0.02 + t) * 50;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Energy Packets (The Cargo)
        for (let i = 0; i < 10; i++) {
            const xPos = (i * (w / 10) + t * 50) % w;
            const yPos = cy + Math.sin(xPos * 0.02 + t) * 50;
            
            const grad = ctx.createRadialGradient(xPos, yPos, 2, xPos, yPos, 10);
            grad.addColorStop(0, '#fbbf24');
            grad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(xPos, yPos, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText("Energy traveling from Source → Destination", 20, 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 2. Intensity & Spreading Simulation
 * Shows a light source and how the energy "thins out" as the area grows.
 */
const runIntensitySim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let mouseX = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = 100;
        const cy = h / 2;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);

        // The Source (Light bulb / Speaker)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Rays spreading out
        const rayCount = 12;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * w, cy + Math.sin(angle) * w);
            ctx.stroke();
        }

        // The "Target Window" controlled by mouse
        const targetX = 150 + mouseX * (w - 300);
        const targetSize = (targetX - cx) * 0.4;
        
        // Draw the window
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetX, cy - targetSize/2, 10, targetSize);

        // Calculate "Intensity" (Energy hitting the window)
        // Intensity is Inverse of Area (Size)
        const intensity = 1 / (targetSize / 20);
        
        ctx.fillStyle = `rgba(74, 222, 128, ${intensity})`;
        ctx.fillRect(targetX, cy - targetSize/2, 10, targetSize);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`Target Distance: ${targetX.toFixed(0)}m`, 20, 30);
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`Intensity: ${(intensity * 100).toFixed(1)}%`, 20, 60);
        
        ctx.fillStyle = '#71717a';
        ctx.fillText("Move mouse to see energy spread out!", 20, h - 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_15: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "Energy Flow & Intensity",
        subtitle: "Why the sun is hot, but stars are just tiny dots.",
        icon: <Sun size={80} className="text-yellow-400" />,
        meta: "Wave Energetics"
    },
    {
        id: 2,
        type: "quote",
        text: "Energy is the ability to do work. Intensity is how much of that work hits you in the face.",
        author: "Physics Simplified"
    },
    {
        id: 3,
        type: "concept-split",
        title: "The Conveyor Belt",
        leftContent: "Imagine a conveyor belt carrying boxes of 'Juice'. The belt is the wave, and the boxes are Energy. Energy Flow is just the speed at which that juice arrives at your door.",
        rightPoints: [
            "Energy travels, the medium doesn't",
            "More wiggles = More boxes",
            "Energy moves from Source to You"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "Energy on the Move",
        description: "Watch the yellow 'energy packets' travel along the wave. Even though the wave just goes up and down, the energy moves forward.",
        run: runEnergyFlowSim
    },
    {
        id: 5,
        type: "concept-list",
        title: "What is Intensity?",
        context: "Intensity is a measure of how 'concentrated' the energy is.",
        items: [
            "Bright Light vs. Dim Light",
            "Screaming vs. Whispering",
            "Big Waves vs. Tiny Ripples",
            "It is the 'Power' spread over an 'Area'."
        ]
    },
    {
        id: 6,
        type: "concept-split",
        title: "The Butter Analogy",
        leftContent: "Imagine a piece of butter. If you put it on a small piece of toast, it's thick and tasty. But if you try to spread that same butter over a whole loaf of bread, it gets so thin you can't even see it.",
        rightPoints: [
            "Butter = Energy",
            "Toast = Area",
            "Thickness = Intensity"
        ]
    },
    {
        id: 7,
        type: "simulation",
        title: "The Spreading Rule",
        description: "As you move the window away from the light, the energy has to cover a much bigger space. The intensity (green glow) drops fast!",
        run: runIntensitySim
    },
    {
        id: 8,
        type: "equation",
        latex: "I = P / A",
        description: "Intensity is simply the total Power (Total Juice) divided by the Area (The Toast) it is spread over.",
        variables: [
            { symbol: "I", meaning: "Intensity (How 'thick' it is)" },
            { symbol: "P", meaning: "Power (The Source's strength)" },
            { symbol: "A", meaning: "Area (The space it covers)" }
        ]
    },
    {
        id: 9,
        type: "process",
        title: "Why Intensity Fades",
        steps: [
            { label: "The Source", desc: "A lightbulb sends out a burst of energy in all directions." },
            { label: "The Sphere", desc: "That energy forms a growing 'bubble' or sphere as it travels." },
            { label: "The Surface", desc: "The same amount of energy must now cover the entire surface of that bigger bubble." },
            { label: "The Fade", desc: "Because the bubble is huge, any small spot on it gets very little energy." }
        ]
    },
    {
        id: 10,
        type: "comparison",
        title: "Concentrated vs. Spread",
        leftTitle: "High Intensity",
        leftPoints: ["Laser Beam", "Standing next to a Speaker", "Looking at the Sun"],
        rightTitle: "Low Intensity",
        rightPoints: ["Flashlight beam far away", "Hearing a concert from the parking lot", "Looking at a distant Star"]
    },
    {
        id: 11,
        type: "quiz",
        question: "If you move 2 times further away from a light source, the area the light covers gets 4 times bigger. What happens to the intensity?",
        options: [
            "It stays the same.", 
            "It gets 2 times weaker.", 
            "It gets 4 times weaker.", 
            "It gets 4 times stronger."
        ],
        correctIndex: 2,
        explanation: "Since the same energy is spread over 4 times the area, the intensity (thickness) drops to 1/4th. This is the 'Inverse Square Law'!"
    },
    {
        id: 12,
        type: "true-false",
        statement: "A laser beam stays intense because it doesn't spread out like a normal light bulb.",
        isTrue: true,
        explanation: "Correct! Because the Area (A) stays small, the Intensity (I) stays very high even over long distances."
    },
    {
        id: 13,
        type: "summary",
        title: "Energy Recap",
        recap: [
            "Waves carry energy from place to place (Energy Flow).",
            "Intensity is how much energy hits a specific area.",
            "Intensity drops as you move away because energy spreads out.",
            "Distance is the enemy of intensity!"
        ]
    },
    {
        id: 14,
        type: "outro",
        title: "Stay Bright!",
        text: "You've finished the module on Energy Flow and Intensity. You now know why the stars are beautiful, but the sun is the one that gives you a tan!"
    }
];
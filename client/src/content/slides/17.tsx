import React from 'react';
import { Flame, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Glowing Object Simulation (Color Temperature)
const runGlowSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2, cy = h / 2;
        t += 0.01;

        // Temperature oscillates from Low (Red) to High (Blue-White)
        const tempFactor = (Math.sin(t) + 1) / 2; // 0 to 1

        ctx.clearRect(0, 0, w, h);

        // Interpolate Color
        // 0.0 -> Red (150, 0, 0)
        // 0.5 -> Yellow (255, 200, 0)
        // 1.0 -> Blueish White (200, 220, 255)
        
        let r, g, b;
        if (tempFactor < 0.5) {
            // Red to Yellow
            const localT = tempFactor * 2;
            r = 150 + (105 * localT);
            g = 0 + (200 * localT);
            b = 0;
        } else {
            // Yellow to Blue-White
            const localT = (tempFactor - 0.5) * 2;
            r = 255 - (55 * localT);
            g = 200 + (20 * localT);
            b = 0 + (255 * localT);
        }

        const color = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        const glowSize = 50 + (tempFactor * 30);

        // Draw Glow
        const gradient = ctx.createRadialGradient(cx, cy, 30, cx, cy, 150);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Draw Ball
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        const tempText = tempFactor < 0.2 ? "Warm" : tempFactor < 0.6 ? "Hot" : "Super Hot!";
        ctx.fillText(`Temperature: ${tempText}`, cx, cy + 100);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. The Ultraviolet Catastrophe Graph
const runCurveSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);
        
        // Setup Graph
        const originX = 50;
        const originY = h - 50;
        const scaleX = (w - 100) / 10;
        const scaleY = (h - 100) / 10;

        // Axes
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX, 50); // Y axis top
        ctx.lineTo(originX, originY); // Origin
        ctx.lineTo(w - 50, originY); // X axis right
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px sans-serif';
        ctx.fillText("Frequency (Color)", w/2, h - 20);
        ctx.save();
        ctx.translate(20, h/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText("Energy / Brightness", 0, 0);
        ctx.restore();

        // 1. Classical Prediction (The Catastrophe) - Goes to Infinity
        ctx.strokeStyle = '#ef4444'; // Red
        ctx.lineWidth = 4;
        ctx.beginPath();
        for(let x = 0; x < 10; x += 0.1) {
            const y = 0.8 * (x * x); // Rayliegh-Jeans roughly x^2
            const px = originX + x * scaleX;
            const py = originY - y * scaleY;
            if (py < 0) break; // Don't draw off screen
            if (x===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Label Classical
        ctx.fillStyle = '#ef4444';
        ctx.fillText("Old Theory (Oops!)", w/2 + 50, 100);

        // 2. Planck's Law (The Reality) - Goes up then down
        ctx.strokeStyle = '#4ade80'; // Green
        ctx.lineWidth = 4;
        ctx.beginPath();
        for(let x = 0.1; x < 10; x += 0.1) {
            // Planck distribution simplified shape: x^3 / (e^x - 1)
            // Adjusted constants for visual fit
            const y = (15 * Math.pow(x, 3)) / (Math.exp(x) - 1);
            const px = originX + x * scaleX;
            const py = originY - y * scaleY;
            if (x===0.1) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Label Quantum
        ctx.fillStyle = '#4ade80';
        ctx.fillText("Real Experiment", 150, h/2);

        // Animated dot on Quantum line
        const animX = (Math.sin(t) + 1) * 2.5 + 1; // oscillate between x=1 and x=6
        const animY = (15 * Math.pow(animX, 3)) / (Math.exp(animX) - 1);
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(originX + animX * scaleX, originY - animY * scaleY, 6, 0, Math.PI*2);
        ctx.fill();

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_17: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Mystery of Glowing Things",
        subtitle: "How a hot toaster broke physics and invented Quantum Mechanics.",
        icon: <Flame size={80} className="text-orange-500" />,
        meta: "Quantum Beginnings"
    },
    {
        id: "obs-1",
        type: "concept-list",
        title: "Have you ever heated metal?",
        context: "When things get really hot, they start to glow. The color changes as they get hotter.",
        items: [
            "First, it feels warm (Infrared - invisible)",
            "Then it glows RED hot",
            "Then YELLOW",
            "Finally, WHITE or BLUE hot"
        ]
    },
    {
        id: "sim-1",
        type: "simulation",
        title: "Temperature vs Color",
        description: "Watch how the color shifts from Red (Low Energy) to Blue/White (High Energy) as it gets hotter.",
        run: runGlowSim
    },
    {
        id: "problem-intro",
        type: "concept-split",
        title: "The Problem",
        leftContent: "In the year 1900, physicists tried to use math to predict how much light a hot object should emit. They called these perfect objects 'Blackbodies'.",
        rightPoints: [
            "Classical Math was used",
            "It worked for Red light",
            "It failed for Blue/UV light"
        ]
    },
    {
        id: "catastrophe",
        type: "comparison",
        title: "The Prediction vs Reality",
        leftTitle: "What Math Said",
        leftPoints: [
            "As color gets bluer (higher freq)...",
            "...Energy goes to INFINITY",
            "A toaster would blast deadly X-rays!"
        ],
        rightTitle: "What Actually Happens",
        rightPoints: [
            "It glows blue...",
            "...then the energy drops off",
            "No deadly death rays created"
        ]
    },
    {
        id: "sim-curve",
        type: "simulation",
        title: "The Ultraviolet Catastrophe",
        description: "The Red Line is what old math predicted (Infinity!). The Green Line is what actually happens. See the difference?",
        run: runCurveSim
    },
    {
        id: "analogy-oven",
        type: "concept-split",
        title: "The Oven Analogy",
        leftContent: "Why did the old math fail? Imagine an oven that can bake cookies of any size.",
        rightPoints: [
            "Old View: You can bake infinite tiny crumb-sized cookies.",
            "Result: Infinite energy (Too many crumbs!)",
            "Reality: You can't just bake crumbs."
        ]
    },
    {
        id: "solution-planck",
        type: "intro",
        title: "Max Planck",
        subtitle: "The man who fixed the math by adding a simple rule.",
        icon: <Lightbulb size={80} className="text-yellow-400" />
    },
    {
        id: "concept-quanta",
        type: "concept-list",
        title: "The Fix: Quanta",
        context: "Planck guessed that energy isn't a smooth flow (like water). He said energy comes in chunks (like packets of sugar).",
        items: [
            "He called these chunks 'Quanta'",
            "Small waves (Red) = Cheap packets",
            "Big waves (Blue/UV) = Expensive packets",
            "Nature can't afford infinite expensive packets!"
        ]
    },
    {
        id: "equation-e-hf",
        type: "equation",
        latex: "E = hf",
        description: "The energy (E) of a packet depends on its frequency (f). 'h' is just a number Planck made up to fix the math.",
        variables: [
            { symbol: "E", meaning: "Energy of the packet" },
            { symbol: "f", meaning: "Frequency (Color)" },
            { symbol: "h", meaning: "Planck's Constant" }
        ]
    },
    {
        id: "analogy-money",
        type: "process",
        title: "The Vending Machine Analogy",
        steps: [
            { label: "Red Light", desc: "Costs $1. The machine has lots of $1 bills, so it makes lots of Red light." },
            { label: "Blue Light", desc: "Costs $100. The machine has fewer $100 bills, so less Blue light." },
            { label: "UV/X-Ray", desc: "Costs $1,000,000. The machine can't afford this! So NO deadly rays." }
        ]
    },
    {
        id: "quiz-1",
        type: "quiz",
        question: "Why don't toasters emit deadly X-rays?",
        options: [
            "They aren't hot enough to 'afford' the expensive X-ray packets",
            "X-rays are too slow",
            "The toaster has a shield",
            "Classical physics was actually right"
        ],
        correctIndex: 0,
        explanation: "According to Quantum theory, X-rays are very high energy packets. A toaster simply doesn't have enough thermal energy to create even one of them."
    },
    {
        id: "true-false-1",
        type: "true-false",
        statement: "Classical physics predicted that energy is continuous (smooth), not chunky.",
        isTrue: true,
        explanation: "Correct! Classical physics thought energy was like a smooth stream of water. Planck showed it's more like distinct droplets."
    },
    {
        id: "summary",
        type: "summary",
        recap: [
            "Hot objects glow (Blackbody Radiation)",
            "Old math predicted infinite energy (UV Catastrophe)",
            "Max Planck fixed it by saying energy comes in packets (Quanta)",
            "High energy packets are 'too expensive' to make easily",
            "This idea started Quantum Mechanics"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "You're a Quantum Physicist!",
        text: "You now understand the problem that broke classical physics and started the modern age."
    }
];
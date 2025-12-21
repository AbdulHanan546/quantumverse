import React from "react";
import { 
  Waves, 
  ArrowRight, 
  Anchor, 
  Music, 
  Activity, 
  Repeat,
  Minimize2,
  Radio
} from "lucide-react";
import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Basic Traveling Pulse (Stadium Wave style)
const runPulseSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.03;

        ctx.clearRect(0, 0, w, h);
        
        // Axis
        ctx.strokeStyle = '#27272a';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

        const speed = 4;
        const pulseCenter = (t * 100) % (w + 200) - 100;

        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 4;
        
        for (let x = 0; x < w; x++) {
            // Gaussian Pulse: y = Amplitude * e^(-((x - center)^2) / width)
            const dist = x - pulseCenter;
            const y = cy - 80 * Math.exp(-(dist * dist) / 1000);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Label for the "Disturbance"
        ctx.fillStyle = '#4ade80';
        ctx.font = '12px monospace';
        ctx.fillText("ENERGY TRAVELING →", pulseCenter - 50, cy - 100);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. Neighbor-to-Neighbor Physics (The "String" Rule)
const runStringSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    // Simulation points
    const points = 40;
    const yValues = new Array(points).fill(0);

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        const spacing = w / points;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        // Update heights
        for (let i = 0; i < points; i++) {
            yValues[i] = Math.sin(t - i * 0.3) * 50;
        }

        // Draw points and connections
        ctx.lineWidth = 2;
        for (let i = 0; i < points; i++) {
            const x = i * spacing;
            const y = cy + yValues[i];

            // Draw line to neighbor
            if (i < points - 1) {
                ctx.beginPath();
                ctx.strokeStyle = '#3f3f46';
                ctx.moveTo(x, y);
                ctx.lineTo((i + 1) * spacing, cy + yValues[i+1]);
                ctx.stroke();
            }

            // Draw the "Molecule"
            ctx.fillStyle = i === 15 ? '#4ade80' : '#27272a'; // Highlight one
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText("Neighbors pulling neighbors...", 20, 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 3. Interactive Speed (Wave Equation Parameter)
const runSpeedSim = (canvas: HTMLCanvasElement) => {
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
        const cy = h / 2;
        
        // Speed 'v' is determined by mouse position
        const v = 0.5 + mouseX * 5; 
        t += 0.02 * v;

        ctx.clearRect(0, 0, w, h);
        
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        for (let x = 0; x < w; x++) {
            const y = cy + Math.sin(x * 0.02 - t * 5) * 60;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillText(`Wave Speed (v): ${v.toFixed(2)}`, 20, 30);
        ctx.fillStyle = '#3f3f46';
        ctx.fillText("Slide mouse left/right to change wave tension", 20, 50);

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

export const SLIDES_5: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "The Wave Equation",
        subtitle: "How nature sends messages through ripples, strings, and sound.",
        icon: <Waves size={80} className="text-blue-400" />,
        meta: "Modern Physics"
    },
    {
        id: 2,
        type: "quote",
        text: "The wave is not the water. The water is the medium; the wave is the pattern of energy passing through it.",
        author: "Basic Physics Principle"
    },
    {
        id: 3,
        type: "concept-split",
        title: "The Stadium Wave",
        leftContent: "Think of fans in a stadium. To make 'The Wave,' you don't run around the stadium. You just stand up and sit down. Your neighbor sees you and does the same.",
        rightPoints: [
            "Information moves horizontally",
            "People only move vertically",
            "The pattern is the Wave"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "A Traveling Pulse",
        description: "Watch the energy move across the screen. Notice that no 'particles' are actually traveling from left to right—only the disturbance is.",
        run: runPulseSim
    },
    {
        id: 5,
        type: "concept-list",
        title: "What makes a Wave?",
        context: "For a wave to exist, you need two things:",
        items: [
            "A Disturbance: Something pushes a part of the medium.",
            "Connection: The parts must pull on their neighbors (Tension).",
            "Inertia: The parts want to keep moving once they start.",
            "A Rulebook: A mathematical way to describe this teamwork."
        ]
    },
    {
        id: 6,
        type: "process",
        title: "The Neighbor-Pull Logic",
        steps: [
            { label: "The PUSH", desc: "You pluck a guitar string. Point A moves up." },
            { label: "The PULL", desc: "Point A is connected to Point B, so it pulls B up too." },
            { label: "The DELAY", desc: "Because B has weight, it takes a tiny moment to start moving." },
            { label: "The RESULT", desc: "The disturbance travels down the line. That's the Wave!" }
        ]
    },
    {
        id: 7,
        type: "simulation",
        title: "Neighbor Physics",
        description: "Each dot only follows its neighbor. This simple 'copy-cat' behavior creates the complex wave pattern.",
        run: runStringSim
    },
    {
        id: 8,
        type: "comparison",
        title: "Stuff vs. Waves",
        leftTitle: "A Flying Ball",
        leftPoints: ["Matter travels from A to B", "Moves through empty space", "Physical object moves"],
        rightTitle: "A Traveling Wave",
        rightPoints: ["Energy travels from A to B", "Needs a medium (usually)", "Pattern moves, objects stay"]
    },
    {
        id: 9,
        type: "equation",
        latex: "y = f(x - vt)",
        description: "This is the simplest way to write a moving wave. It says the shape (y) depends on where you are (x) and the time (t).",
        variables: [
            { symbol: "y", meaning: "Height of the wave" },
            { symbol: "x", meaning: "Position on the string" },
            { symbol: "v", meaning: "Speed of the wave" },
            { symbol: "t", meaning: "Time elapsed" }
        ]
    },
    {
        id: 10,
        type: "quiz",
        question: "In a stadium wave, if you (the fan) move to a different seat, is it still a wave?",
        options: [
            "Yes, that's exactly how waves work.", 
            "No, that would be 'flowing' like water in a pipe.", 
            "Yes, if you run fast enough.", 
            "Only if the stadium is round."
        ],
        correctIndex: 1,
        explanation: "Waves move energy through a medium. If the medium (the fans) moves with the wave, it's called 'Bulk Flow' or current, not a wave."
    },
    {
        id: 11,
        type: "simulation",
        title: "The Speed Variable",
        description: "The 'v' in our equation determines how fast the neighbors react. Higher tension means faster waves.",
        run: runSpeedSim
    },
    {
        id: 12,
        type: "equation",
        latex: "\\frac{\\partial^2 y}{\\partial t^2} = v^2 \\frac{\\partial^2 y}{\\partial x^2}",
        description: "The Master Equation! It says: 'How fast the height is changing' is tied to 'How much the string is curved.'",
        variables: [
            { symbol: "v²", meaning: "The 'Tension' and 'Heaviness' factor" },
            { symbol: "y/t", meaning: "Acceleration (Bounciness)" },
            { symbol: "y/x", meaning: "Curvature (The Bend)" }
        ]
    },
    {
        id: 13,
        type: "true-false",
        statement: "A wave traveling at speed 'v' will look exactly the same if you wait 1 second and move 'v' distance to the right.",
        isTrue: true,
        explanation: "Correct! That is the core meaning of f(x-vt). The pattern just shifts perfectly through space."
    },
    {
        id: 14,
        type: "summary",
        title: "Wave Master Checklist",
        recap: [
            "A wave is a pattern of energy, not a traveling object.",
            "The 'Medium' stays put; the 'Disturbance' travels.",
            "The Wave Equation is the 'Rulebook' for neighbor behavior.",
            "Speed (v) depends on the tension and weight of the medium."
        ]
    },
    {
        id: 15,
        type: "outro",
        title: "Mission Complete",
        text: "You now understand how ripples move across the universe. From guitar strings to Wi-Fi signals, it's all just the Wave Equation in action!"
    }
];
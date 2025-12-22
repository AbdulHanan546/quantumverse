import React from 'react';
// import TopicViewer, { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path
import { Lightbulb, TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. RAMP VS STAIRS SIMULATION
// Visualizes the difference between Continuous (Ramp) and Quantized (Stairs) motion
const runStairSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);
        
        const cy = h / 2;
        const colW = w / 2;

        // --- LEFT SIDE: THE RAMP (Continuous) ---
        ctx.fillStyle = '#27272a';
        ctx.fillRect(50, cy, colW - 100, 10); // Base line
        
        // Draw Ramp
        ctx.beginPath();
        ctx.moveTo(50, cy);
        ctx.lineTo(colW - 50, cy - 150);
        ctx.lineTo(colW - 50, cy);
        ctx.fillStyle = '#3f3f46';
        ctx.fill();

        // Ball on Ramp (Smooth)
        // Position oscillates up and down smoothly
        const rampPos = (Math.sin(t) + 1) / 2; // 0 to 1
        const rx = 50 + rampPos * (colW - 100);
        const ry = cy - (rampPos * 150) - 10; // On the slope
        
        ctx.fillStyle = '#ef4444'; // Red ball
        ctx.beginPath();
        ctx.arc(rx, ry, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Classical (Smooth)", colW/2, cy + 40);


        // --- RIGHT SIDE: THE STAIRS (Quantized) ---
        const startX = colW + 50;
        const stairW = (colW - 100) / 5;
        const stairH = 150 / 5;

        // Draw Stairs
        ctx.fillStyle = '#3f3f46';
        for(let i=0; i<5; i++) {
            const sx = startX + i * stairW;
            const sy = cy - (i * stairH);
            ctx.fillRect(sx, sy - stairH, stairW, stairH + (i*stairH)); // fill down to base
        }

        // Ball on Stairs (Snaps)
        // We use the same 't' but round it to discrete steps
        const stepIndex = Math.floor(rampPos * 5); // 0 to 4
        // Clamp it
        const safeStep = Math.min(4, Math.max(0, stepIndex));
        
        const bx = startX + safeStep * stairW + (stairW/2);
        const by = cy - (safeStep * stairH) - 15 - stairH + 15; // Sits on top of step

        ctx.fillStyle = '#4ade80'; // Green ball
        ctx.beginPath();
        ctx.arc(bx, by, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillText("Quantum (Steps)", colW + colW/2, cy + 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. THE ATM MACHINE ANALOGY
// Visualizes withdrawing energy. You can't withdraw $1.50, only $1, $10, etc.
const runPacketSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    // Particles representing energy packets
    const packets: { x: number; y: number; val: number; speed: number }[] = [];

    const render = () => {
        const { width: w, height: h } = canvas;
        t++;

        // Spawn packets
        // Small packets (Red, $1) are frequent
        if (t % 10 === 0) packets.push({ x: w/2, y: h-50, val: 1, speed: 2 + Math.random() });
        // Medium packets (Green, $10) are less frequent
        if (t % 60 === 0) packets.push({ x: w/2, y: h-50, val: 10, speed: 3 + Math.random() });
        // Huge packets (Blue, $100) are rare
        if (t % 200 === 0) packets.push({ x: w/2, y: h-50, val: 100, speed: 4 });

        ctx.clearRect(0, 0, w, h);

        // Draw "ATM"
        ctx.fillStyle = '#27272a';
        ctx.fillRect(w/2 - 40, h-60, 80, 60);
        ctx.fillStyle = '#52525b';
        ctx.fillRect(w/2 - 30, h-40, 60, 10);

        // Update and Draw Packets
        for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            p.y -= p.speed;
            p.x += Math.sin(p.y * 0.05) * 2; // slight wobble

            ctx.beginPath();
            
            if (p.val === 1) {
                ctx.fillStyle = '#ef4444'; // Red
                ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
            } else if (p.val === 10) {
                ctx.fillStyle = '#4ade80'; // Green
                ctx.arc(p.x, p.y, 10, 0, Math.PI*2);
            } else {
                ctx.fillStyle = '#3b82f6'; // Blue
                ctx.arc(p.x, p.y, 20, 0, Math.PI*2);
            }
            ctx.fill();

            // Draw Value
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            if(p.val > 1) ctx.fillText(`$${p.val}`, p.x, p.y+3);

            // Remove if off screen
            if (p.y < -50) packets.splice(i, 1);
        }

        // Text Info
        ctx.fillStyle = '#a1a1aa';
        ctx.textAlign = 'left';
        ctx.fillText("Nature's ATM:", 20, 30);
        ctx.fillText("• $1 Bills (Red Light) are easy to get", 20, 50);
        ctx.fillText("• $100 Bills (UV Light) are hard to get", 20, 70);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_19: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "The Chunkiness of Energy",
        subtitle: "Why the universe is made of pixels, not smooth lines.",
        icon: <Package size={80} className="text-yellow-400" />,
        meta: "Planck's Hypothesis"
    },
    {
        id: 2,
        type: "concept-list",
        title: "The Old Way of Thinking",
        context: "Before 1900, scientists thought energy was like a smooth river. You could scoop out ANY amount of water you wanted.",
        items: [
            "Energy flows smoothly",
            "You can have 1.5 Joules, or 1.00001 Joules",
            "Nature has no 'minimum' size"
        ]
    },
    {
        id: 3,
        type: "simulation",
        title: "Ramp vs. Stairs",
        description: "Classical physics said energy is a Ramp (smooth). Planck said energy is Stairs (steps). You can't stand between steps!",
        run: runStairSim
    },
    {
        id: 4,
        type: "concept-split",
        title: "The Revolution",
        leftContent: "Max Planck was trying to fix a math problem (The UV Catastrophe). He found that the math only worked if he assumed energy came in specific packet sizes.",
        rightPoints: [
            "He called these packets 'Quanta'",
            "Quantum = Quantity (Amount)",
            "Energy is grainy, not smooth",
            "Like sand, not water"
        ]
    },
    {
        id: 5,
        type: "quote",
        text: "The hypothesis of quanta will appear to many like a monster.",
        author: "Max Planck",
    },
    {
        id: 6,
        type: "process",
        title: "The Money Analogy",
        steps: [
            { label: "The Infinite Bank", desc: "Imagine a bank that only gives out specific bills ($1, $5, $100)." },
            { label: "No Change", desc: "You cannot ask for $1.50. The bank physically cannot give it to you." },
            { label: "The Rule", desc: "Energy works the same way. An atom can release 1 unit or 2 units, but never 1.5 units." }
        ]
    },
    {
        id: 7,
        type: "simulation",
        title: "Expensive Packets",
        description: "Low energy light (Red) is cheap 'small change'. High energy light (Blue) is a 'large bill'. Nature prefers small change.",
        run: runPacketSim
    },
    {
        id: 8,
        type: "equation",
        latex: "E = nhf",
        description: "How much energy is in a packet? It depends on the color (frequency).",
        variables: [
            { symbol: "E", meaning: "Total Energy" },
            { symbol: "n", meaning: "Number of packets (Integers only: 1, 2, 3...)" },
            { symbol: "h", meaning: "Planck's Constant (The size of the smallest step)" },
            { symbol: "f", meaning: "Frequency (Color)" }
        ]
    },
    {
        id: 9,
        type: "comparison",
        title: "Continuous vs Quantized",
        leftTitle: "Continuous (Classical)",
        leftPoints: [
            "A smooth ramp",
            "Pouring water",
            "Volume knob on a radio",
            "Any value allowed"
        ],
        rightTitle: "Quantized (Quantum)",
        rightPoints: [
            "A staircase",
            "Counting coins",
            "Keys on a piano",
            "Only specific values"
        ]
    },
    {
        id: 10,
        type: "quiz",
        question: "Which of these is an example of something 'Quantized'?",
        options: [
            "The height of a ramp",
            "The amount of water in a bucket",
            "The number of people in a room",
            "The distance a car travels"
        ],
        correctIndex: 2,
        explanation: "You can't have 2.5 people in a room. People come in whole numbers (integers). That is quantization."
    },
    {
        id: 11,
        type: "true-false",
        statement: "According to Planck, an atom can vibrate with ANY energy level it wants.",
        isTrue: false,
        explanation: "False! It can only vibrate at specific 'allowed' energy levels (Steps on the ladder)."
    },
    {
        id: 12,
        type: "summary",
        title: "Lesson Recap",
        recap: [
            "Energy is not smooth like water, it's chunky like sand",
            "These chunks are called Quanta",
            "High frequency light (Blue) has bigger chunks than Red light",
            "E = hf links energy to frequency"
        ]
    },
    {
        id: 13,
        type: "outro",
        title: "You know Quantum Mechanics!",
        text: "The idea that 'Energy is Chunky' is the foundation of all modern physics."
    }
];
import React from "react";
import { 
  Layers, 
  Music, 
  ChefHat, 
  Activity, 
  Sigma, 
  BarChart3,
  AlignJustify,
  Combine
} from "lucide-react";
import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Infinite Wave vs. Wave Packet
 * Shows the difference between a wave that is everywhere and a wave that is 'somewhere'.
 */
const runPacketIntroSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        // 1. Infinite Wave (Top)
        ctx.strokeStyle = '#3f3f46';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = cy - 80 + Math.sin(x * 0.05 - t * 2) * 30;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#71717a';
        ctx.fillText("Infinite Wave (Everywhere)", 20, cy - 120);

        // 2. Wave Packet (Bottom)
        const packetPos = (t * 50) % (w + 200) - 100;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            // The "Envelope" (Gaussian)
            const dist = x - packetPos;
            const envelope = Math.exp(-(dist * dist) / 2000);
            const y = cy + 80 + (Math.sin(x * 0.1 - t * 5) * 60 * envelope);
            
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#4ade80';
        ctx.fillText("Wave Packet (Right Here!)", 20, cy + 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 2. Building a Packet (Superposition)
 * Shows how adding waves of different lengths creates a "bump".
 */
const runBuildPacketSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);

        // We sum 5 slightly different waves
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            let totalY = 0;
            for (let i = 0; i < 5; i++) {
                const freq = 0.05 + i * 0.005;
                totalY += Math.sin(x * freq - t * (2 + i));
            }
            const plotY = cy + totalY * 15;
            if (x === 0) ctx.moveTo(x, plotY); else ctx.lineTo(x, plotY);
        }
        ctx.strokeStyle = '#60a5fa';
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillText("Many waves interfering to make a 'Group'", 20, 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 3. Group Velocity (The Caterpillar Sim)
 * Individual ripples move at one speed, the whole clump moves at another.
 */
const runCaterpillarSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        const groupSpeed = 2;
        const phaseSpeed = 5;
        const groupPos = (t * groupSpeed * 20) % (w + 200) - 100;

        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        for (let x = 0; x < w; x++) {
            const dist = x - groupPos;
            const envelope = Math.exp(-(dist * dist) / 1500);
            // Ripple moves faster than the clump
            const y = cy + Math.sin(x * 0.1 - t * phaseSpeed) * 70 * envelope;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Arrow for group movement
        ctx.fillStyle = '#fbbf24';
        ctx.fillText("GROUP VELOCITY (The Clump) →", groupPos - 50, cy + 100);
        
        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_11: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "Wave Packets",
        subtitle: "When waves decide to bundle up and go for a walk.",
        icon: <Combine size={80} className="text-green-400" />,
        meta: "Quantum Foundations"
    },
    {
        id: 2,
        type: "quote",
        text: "Imagine a wave that has a beginning and an end. It's not just a wiggle; it's a message sent in a single burst.",
        author: "Physics Simplified"
    },
    {
        id: 3,
        type: "concept-split",
        title: "Whistle vs. Clap",
        leftContent: "A whistle is like an infinite wave—it goes on and on. But a clap is a Wave Packet. It’s a burst of energy that exists in one specific place for a split second.",
        rightPoints: [
            "Whistle = Spread out",
            "Clap = Localized",
            "Clap = A bunch of waves combined"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "Where is the Wave?",
        description: "The top wave is everywhere at once. The green wave packet is like a 'thing'—it has a position and travels like a ball.",
        run: runPacketIntroSim
    },
    {
        id: 5,
        type: "process",
        title: "How to Build a Packet",
        steps: [
            { label: "Step 1: Grab a Wave", desc: "Start with a single pure wiggle (a sine wave)." },
            { label: "Step 2: Add Neighbors", desc: "Add more waves that are slightly longer or shorter." },
            { label: "Step 3: Interference", desc: "In most places, they cancel out (Destructive)." },
            { label: "Step 4: The Bump", desc: "In one special spot, they all peak together (Constructive)!" }
        ]
    },
    {
        id: 6,
        type: "simulation",
        title: "Superposition in Action",
        description: "By stacking many different waves on top of each other, we create a 'Group' that sticks together.",
        run: runBuildPacketSim
    },
    {
        id: 7,
        type: "comparison",
        title: "Individual vs. Group",
        leftTitle: "The Ripples",
        leftPoints: ["Move at 'Phase Velocity'", "The wiggles inside the pack", "They can be very fast"],
        rightTitle: "The Clump",
        rightPoints: ["Moves at 'Group Velocity'", "The actual energy movement", "This is the 'Particle' speed"]
    },
    {
        id: 8,
        type: "concept-split",
        title: "The Caterpillar Walk",
        leftContent: "Think of a caterpillar. Its legs (the wiggles) move fast, but the whole caterpillar (the clump) moves slower. In a wave packet, the information travels with the clump.",
        rightPoints: [
            "Information = The Clump",
            "Ripples can move through it",
            "Speed of the pack is what matters"
        ]
    },
    {
        id: 9,
        type: "simulation",
        title: "The Caterpillar Effect",
        description: "Watch the yellow ripples carefully. They appear at the back, move through the packet, and vanish at the front. But the 'Bump' moves at its own steady speed!",
        run: runCaterpillarSim
    },
    {
        id: 10,
        type: "equation",
        latex: "\\Delta x \\Delta k \\approx 1",
        description: "The 'Trade-off' Rule. If you want a wave packet to be very short (tiny x), you need to mix in a huge variety of different waves (large k).",
        variables: [
            { symbol: "Δx", meaning: "Size of the packet" },
            { symbol: "Δk", meaning: "Variety of wave lengths" }
        ]
    },
    {
        id: 11,
        type: "quiz",
        question: "Why do we need wave packets in Quantum Physics?",
        options: [
            "Because infinite waves are too loud.",
            "To explain how a wave can act like a localized 'particle'.",
            "Because waves like to travel in groups for safety.",
            "They aren't real; they're just for drawings."
        ],
        correctIndex: 1,
        explanation: "Particles like electrons aren't dots; they are wave packets! The 'packet' gives the wave a specific location in space."
    },
    {
        id: 12,
        type: "true-false",
        statement: "A wave packet is made by adding together many waves of exactly the same frequency.",
        isTrue: false,
        explanation: "False! If they were all the same, they would just be one giant infinite wave. You need different frequencies to create the 'bump'."
    },
    {
        id: 13,
        type: "summary",
        title: "Packet Recap",
        recap: [
            "Wave packets are 'localized' bundles of energy.",
            "They are created by many waves interfering with each other.",
            "Group Velocity is the speed of the actual bundle.",
            "This is how 'Waves' start looking like 'Particles'."
        ]
    },
    {
        id: 14,
        type: "outro",
        title: "Bundles of Joy!",
        text: "You've unlocked the secret of the Wave Packet. You're now one step closer to understanding the weird 'Wave-Particle' duality of the universe!"
    }
];
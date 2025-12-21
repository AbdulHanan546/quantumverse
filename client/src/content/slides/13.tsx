import React from "react";
import { 
  Layers, 
  Music, 
  ChefHat, 
  Activity, 
  Sigma, 
  BarChart3,
  AlignJustify,
  Building,
  Expand,
  Combine
} from "lucide-react";

import type { SlideData, SimulationDriver } from "./types";


/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Reflection Simulation (Fixed vs. Free End)
 * Shows how a wave "flips" upside down when hitting a hard wall, 
 * but stays upright when hitting a loose end.
 */
const runReflectionSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let mode: 'fixed' | 'free' = 'fixed';

    // Click to toggle mode
    const handleClick = () => { mode = mode === 'fixed' ? 'free' : 'fixed'; };
    canvas.addEventListener('click', handleClick);

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        const wallX = w - 100;
        t += 0.04;

        ctx.clearRect(0, 0, w, h);

        const cycle = t % 10;
        const pulsePos = cycle * 100 - 50;
        
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 4;

        for (let x = 0; x < wallX; x++) {
            let y = 0;
            // Incoming Pulse
            const distIn = x - pulsePos;
            const pulseIn = 60 * Math.exp(-(distIn * distIn) / 800);
            
            // Reflected Pulse
            const distRef = x - (2 * wallX - pulsePos);
            let pulseRef = 60 * Math.exp(-(distRef * distRef) / 800);
            
            if (mode === 'fixed') pulseRef *= -1; // Flip if wall is hard

            y = cy - (pulseIn + pulseRef);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw the Boundary
        ctx.fillStyle = mode === 'fixed' ? '#ef4444' : '#60a5fa';
        if (mode === 'fixed') {
            ctx.fillRect(wallX, cy - 80, 10, 160); // Solid Wall
            ctx.fillText("HARD WALL (Fixed End)", wallX - 150, cy - 100);
        } else {
            ctx.beginPath();
            ctx.arc(wallX, cy, 10, 0, Math.PI * 2); // Loose Ring
            ctx.stroke();
            ctx.fillText("LOOSE RING (Free End)", wallX - 150, cy - 100);
        }

        ctx.fillStyle = '#71717a';
        ctx.fillText("Click to Change Boundary Type", 20, h - 20);
        ctx.fillStyle = '#fff';
        ctx.fillText(mode === 'fixed' ? "The wave FLIPS!" : "The wave stays UPRIGHT", 20, 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('click', handleClick);
    };
};

/**
 * 2. Transmission Simulation (Medium Change)
 * Shows a wave moving from a light string to a heavy string.
 */
const runTransmissionSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        const boundaryX = w / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        const cycle = t % 12;
        const pulsePos = cycle * 80 - 100;

        // Draw the strings
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(boundaryX, cy); ctx.stroke();
        ctx.lineWidth = 8; // Heavier string
        ctx.beginPath(); ctx.moveTo(boundaryX, cy); ctx.lineTo(w, cy); ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;

        for (let x = 0; x < w; x++) {
            let y = cy;
            if (x < boundaryX) {
                // Light string: Incoming + Reflected
                const distIn = x - pulsePos;
                const pulseIn = 50 * Math.exp(-(distIn * distIn) / 800);
                
                const distRef = x - (2 * boundaryX - pulsePos);
                const pulseRef = -20 * Math.exp(-(distRef * distRef) / 800); // Small flip
                y -= (pulseIn + pulseRef);
            } else {
                // Heavy string: Transmitted
                const distTrans = (x - boundaryX) * 1.8 + boundaryX - pulsePos; // Slower/Squeezed
                const pulseTrans = 30 * Math.exp(-(distTrans * distTrans) / 800); // Shorter
                y -= pulseTrans;
            }
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillText("LIGHT STRING", 20, cy + 50);
        ctx.fillText("HEAVY STRING", boundaryX + 20, cy + 50);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText("Part of the wave bounces, part goes through!", 20, 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_13: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "The Great Divide",
        subtitle: "How waves bounce, snap, and push through new materials.",
        icon: <Building size={80} className="text-blue-400" />,
        meta: "Wave Boundaries"
    },
    {
        id: 2,
        type: "quote",
        text: "When a wave reaches the end of its rope, it has a choice: give up and go back, or keep fighting into the unknown.",
        author: "The Boundary Principle"
    },
    {
        id: 3,
        type: "concept-split",
        title: "What is a Boundary?",
        leftContent: "A boundary is just a place where the 'neighborhood' changes. It could be sound hitting a wall, or light moving from air into a glass of water.",
        rightPoints: [
            "Reflection: Energy bounces back.",
            "Transmission: Energy moves forward.",
            "The split depends on how 'different' the new material is."
        ]
    },
    {
        id: 4,
        type: "concept-list",
        title: "The Echo Rule (Reflection)",
        context: "Think of an echo. Your voice hits a mountain and returns. But did you know the wave can flip?",
        items: [
            "Hard Boundary (Fixed): The wave gets kicked and returns upside down.",
            "Soft Boundary (Free): The wave does a happy bounce and returns upright.",
            "Energy is saved, but the shape changes."
        ]
    },
    {
        id: 5,
        type: "simulation",
        title: "The Bouncing Pulse",
        description: "Watch how the wave behaves when it hits the end. Notice the 'Flip' when the wall is hard!",
        run: runReflectionSim
    },
    {
        id: 6,
        type: "concept-split",
        title: "Pushing Through (Transmission)",
        leftContent: "Imagine running from a paved road into a muddy field. You don't stop, but you definitely change! Your speed drops and your stride gets shorter.",
        rightPoints: [
            "Heavy Material = Slower Wave.",
            "Heavy Material = Shorter Wavelength.",
            "The frequency (the rhythm) stays exactly the same!"
        ]
    },
    {
        id: 7,
        type: "simulation",
        title: "Rope to Chain",
        description: "Watch a pulse move from a light string to a heavy one. Notice how the wave splits into two smaller pulses!",
        run: runTransmissionSim
    },
    {
        id: 8,
        type: "comparison",
        title: "Bounce vs. Push",
        leftTitle: "Reflection",
        leftPoints: ["Stays in the same material", "Speed stays the same", "Can flip upside down"],
        rightTitle: "Transmission",
        rightPoints: ["Enters a new material", "Speed changes", "Never flips upside down"]
    },
    {
        id: 9,
        type: "equation",
        latex: "100\\% = R + T",
        description: "The 'Law of the Split'. The energy you start with must equal the energy that bounces back (R) plus the energy that goes through (T).",
        variables: [
            { symbol: "R", meaning: "Percentage Reflected" },
            { symbol: "T", meaning: "Percentage Transmitted" }
        ]
    },
    {
        id: 10,
        type: "quiz",
        question: "When you look at a window, you can see the garden (transmitted light) AND your own face (reflected light). What does this tell you?",
        options: [
            "The window is broken.",
            "The wave's energy has split into both reflection and transmission.",
            "Light waves cannot bounce off glass.",
            "Your face is a wave."
        ],
        correctIndex: 1,
        explanation: "Correct! Most boundaries aren't 100% mirrors or 100% windows; they do a bit of both."
    },
    {
        id: 11,
        type: "true-false",
        statement: "A wave traveling into a thicker, heavier material will speed up.",
        isTrue: false,
        explanation: "False! Heavier materials are harder to move, so the wave slows down. Like trying to run through water instead of air."
    },
    {
        id: 12,
        type: "summary",
        title: "Boundary Master Recap",
        recap: [
            "Boundaries cause waves to split energy.",
            "Reflection flips if the boundary is stiffer than the current material.",
            "Transmission changes the speed and length of the wave.",
            "The 'Rhythm' (Frequency) never changes during the split."
        ]
    },
    {
        id: 13,
        type: "outro",
        title: "You've Hit the Limit!",
        text: "You now understand how waves navigate the world's obstacles. Whether it's light hitting your eyes or Wi-Fi passing through walls, boundaries are everywhere!"
    }
];
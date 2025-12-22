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
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Traveling Wave
// Visualizes a wave moving from Left to Right (Energy Transport)
const runTravelingSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t -= 2; // Move to the right (phase shift)

        ctx.clearRect(0, 0, w, h);

        // Draw Reference Line
        ctx.strokeStyle = '#3f3f46';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Wave
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80'; // Green
        ctx.lineWidth = 4;
        
        // Loop through width to draw sine wave
        for (let x = 0; x < w; x++) {
            // y = A sin(kx - wt)
            // The '- t' makes it move right
            const y = cy + Math.sin((x + t) * 0.02) * 60;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw a "Surfer" particle to show it moves? 
        // Actually, strictly speaking, particles oscillate up/down, wave moves right.
        // Let's draw a single red dot on the wave to show particle motion vs wave motion
        const particleX = w/2;
        const particleY = cy + Math.sin((particleX + t) * 0.02) * 60;
        
        // The Particle
        ctx.beginPath();
        ctx.arc(particleX, particleY, 10, 0, Math.PI*2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        
        // Arrows for Particle
        ctx.fillStyle = '#fff';
        ctx.font = "12px sans-serif";
        ctx.fillText("Particle: Moves Up/Down Only", particleX + 15, particleY);
        
        // Arrow for Wave Direction
        ctx.fillStyle = '#4ade80';
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("Wave Shape: Moves RIGHT ->", w - 250, h - 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: The Standing Wave
// Visualizes a wave oscillating in place (Nodes and Antinodes)
const runStandingSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        // Draw String constraints (Walls)
        ctx.fillStyle = '#71717a';
        ctx.fillRect(0, cy - 100, 10, 200);
        ctx.fillRect(w - 10, cy - 100, 10, 200);

        // Draw Wave
        // Standing Wave Equation: y = 2A sin(kx) cos(wt)
        // Notice x and t are separate terms!
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa'; // Blue
        ctx.lineWidth = 4;
        
        // We want nodes at ends. Let's make 3 loops (1.5 wavelengths)
        const k = (3 * Math.PI) / w; 

        for (let x = 0; x < w; x++) {
            // Amplitude changes with time (cos t)
            const amplitude = 80 * Math.cos(t);
            const y = cy + amplitude * Math.sin(k * x);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Ghost (Envelope) to show max displacement
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa';
        ctx.globalAlpha = 0.2;
        // Top envelope
        for (let x = 0; x < w; x++) {
            const y = cy + 80 * Math.sin(k * x); // Max positive
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        // Bottom envelope
        for (let x = 0; x < w; x++) {
            const y = cy - 80 * Math.sin(k * x); // Max negative
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Draw Nodes (Red dots that don't move)
        // Nodes occur where sin(kx) = 0
        ctx.fillStyle = '#ef4444';
        const loops = 3;
        for (let i = 0; i <= loops; i++) {
            const nodeX = (w / loops) * i;
            ctx.beginPath();
            ctx.arc(nodeX, cy, 6, 0, Math.PI*2);
            ctx.fill();
            
            // Label just one node
            if (i === 1) {
                ctx.fillStyle = '#fff';
                ctx.font = "12px sans-serif";
                ctx.fillText("NODE (Stays Still)", nodeX - 40, cy + 20);
                ctx.fillStyle = '#ef4444'; 
            }
        }
        
        // Label Antinode
        ctx.fillStyle = '#fff';
        ctx.fillText("ANTINODE (Dances)", w/6 - 50, cy - 90);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_4: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Traveling vs. Standing Waves",
        subtitle: "The difference between moving across the ocean and vibrating on a guitar.",
        icon: <Waves size={80} className="text-blue-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "analogy-crowd",
        type: "concept-split",
        title: "The Crowd Wave",
        leftContent: "Think of a stadium crowd doing 'The Wave'. You stand up and sit down, but the *pattern* moves around the stadium. This is a Traveling Wave.",
        rightPoints: [
            "Energy travels from A to B",
            "The wave profile moves forward",
            "Like ocean waves hitting a beach"
        ]
    },
    {
        id: "sim-traveling",
        type: "simulation",
        title: "Visualizing a Traveling Wave",
        description: "Watch the Green Wave. The shape is moving to the right. It is carrying a message (energy) to the other side.",
        run: runTravelingSim
    },
    {
        id: "analogy-rope",
        type: "concept-split",
        title: "The Jump Rope",
        leftContent: "Now imagine two friends shaking a jump rope. It makes loops that go up and down, but the loops don't run towards your friend. They stay in place. This is a Standing Wave.",
        rightPoints: [
            "Energy is trapped in the loop",
            "Wave profile oscillates in place",
            "Like a guitar string vibrating"
        ]
    },
    {
        id: "sim-standing",
        type: "simulation",
        title: "Visualizing a Standing Wave",
        description: "Notice the Red Dots (Nodes). They never move! The Blue Wave just grows and shrinks in the same spot.",
        run: runStandingSim
    },
    {
        id: "process-formation",
        type: "process",
        title: "How is a Standing Wave born?",
        steps: [
            { label: "1. The Launch", desc: "You send a wave down a string attached to a wall." },
            { label: "2. The Reflection", desc: "It hits the wall and bounces back upside down." },
            { label: "3. The Collision", desc: "The forward wave and backward wave crash into each other." },
            { label: "4. The Lock", desc: "They combine perfectly to create stationary loops." }
        ]
    },
    {
        id: "comparison-main",
        type: "comparison",
        title: "The Big Showdown",
        leftTitle: "Traveling Wave",
        leftPoints: [
            "Moves through space",
            "Transports energy",
            "No fixed zero points",
            "Example: Light, Sound, Wi-Fi"
        ],
        rightTitle: "Standing Wave",
        rightPoints: [
            "Stays in one region",
            "Stores energy locally",
            "Has fixed Nodes (Zero points)",
            "Example: Musical Instruments"
        ]
    },
    {
        id: "concept-anatomy",
        type: "concept-list",
        title: "Anatomy of a Standing Wave",
        context: "Musicians care about these two words:",
        items: [
            "Nodes: The 'Dead Spots'. Points that never move. (Like holding the string down).",
            "Antinodes: The 'Party Spots'. Points that move the most. (Where the sound comes from)."
        ]
    },
    {
        id: "quiz-guitar",
        type: "quiz",
        question: "When you pluck a guitar string, the ends of the string are attached to the wood. What must be at those attached ends?",
        options: [
            "Antinodes (Max movement)",
            "Nodes (No movement)",
            "Traveling Waves",
            "Energy leaks"
        ],
        correctIndex: 1,
        explanation: "Since the string is tied down at the ends, it CANNOT move there. Therefore, the ends must always be Nodes (Zero amplitude)."
    },
    {
        id: "true-false-energy",
        type: "true-false",
        statement: "A standing wave moves energy from one end of the string to the other continuously.",
        isTrue: false,
        explanation: "False! A standing wave 'traps' energy in the loops. It doesn't transport it from A to B like a radio signal; it just vibrates locally."
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "Traveling waves move energy across distance.",
            "Standing waves trap energy in a fixed pattern.",
            "Standing waves are made by interference (wave + reflection).",
            "Nodes = No motion. Antinodes = Max motion."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Lesson Complete",
        text: "Next time you see a guitar or a microwave (yes, they use standing waves!), you'll know the secret."
    }
];
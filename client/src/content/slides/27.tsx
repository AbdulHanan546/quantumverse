import React from 'react';
import { Atom, Zap, ArrowUp, ArrowDown, Footprints } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. THE SPIRAL OF DEATH (Classical Failure)
// Shows an electron losing energy and crashing into the nucleus.
const runSpiralSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2;
        
        // Reset every few seconds
        if (t > 300) t = 0;
        t += 2;

        ctx.clearRect(0, 0, w, h);

        // Draw Nucleus
        ctx.fillStyle = '#ef4444'; // Red Proton
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("+", cx, cy + 5);

        // Draw Spiral Path
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw the path the electron WILL take
        for(let i=0; i<300; i+=5) {
            const radius = 150 - (i * 0.5);
            if (radius < 0) break;
            const angle = i * 0.1;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Electron
        const radius = 150 - (t * 0.5);
        if (radius > 15) {
            const angle = t * 0.1;
            const ex = cx + Math.cos(angle) * radius;
            const ey = cy + Math.sin(angle) * radius;

            ctx.fillStyle = '#3b82f6'; // Blue Electron
            ctx.beginPath();
            ctx.arc(ex, ey, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw "Energy Loss" particles
            if (t % 10 === 0) {
                // Flash to show energy loss
                ctx.fillStyle = 'yellow';
                ctx.fillText("Radiating Energy!", ex + 20, ey - 20);
            }
        } else {
            // BOOM
            ctx.fillStyle = '#facc15';
            ctx.font = '30px sans-serif';
            ctx.fillText("BOOM! Atom Collapsed", cx, cy - 50);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Classical Physics Prediction", cx, h - 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. THE BOHR MODEL (Quantum Ladder)
// Shows electron jumping between fixed orbits
const runBohrSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let orbit = 1; // Current orbit index (0, 1, 2)
    let orbitTimer = 0;

    const orbits = [60, 110, 160]; // Radii

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2;
        
        t += 0.05;
        orbitTimer++;

        // Change orbit every 150 frames
        if (orbitTimer > 150) {
            const prevOrbit = orbit;
            // Randomly jump
            orbit = Math.floor(Math.random() * 3);
            orbitTimer = 0;
            // We can trigger a photon effect here conceptually
        }

        ctx.clearRect(0, 0, w, h);

        // Nucleus
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();

        // Draw Orbits (The Ladder Rungs)
        orbits.forEach((r, i) => {
            ctx.strokeStyle = i === orbit ? '#4ade80' : '#52525b';
            ctx.lineWidth = i === orbit ? 3 : 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#a1a1aa';
            ctx.fillText(`n=${i+1}`, cx + r + 10, cy);
        });

        // Electron Position
        const r = orbits[orbit];
        const ex = cx + Math.cos(t * (4/(orbit+1))) * r; // outer orbits slower
        const ey = cy + Math.sin(t * (4/(orbit+1))) * r;

        // Draw Electron
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Jump Animation (Photon emission/absorption)
        if (orbitTimer < 20) {
            ctx.fillStyle = 'yellow';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText("Quantum Jump!", ex, ey - 20);
        }

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText("Bohr Model: Allowed Orbits Only", cx, h - 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_27: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Bohr Model",
        subtitle: "Why atoms don't collapse and how they make neon lights glow.",
        icon: <Atom size={80} className="text-blue-400" />,
        meta: "Atomic Physics"
    },
    {
        id: "problem",
        type: "concept-list",
        title: "The Problem with Atoms",
        context: "Before Niels Bohr, scientists thought electrons orbited the nucleus like planets orbit the sun. But there was a huge fatal flaw.",
        items: [
            "Moving electric charges lose energy.",
            "If an electron loses energy, it should slow down.",
            "If it slows down, gravity (or attraction) pulls it in.",
            "It should crash into the nucleus instantly."
        ]
    },
    {
        id: "sim-spiral",
        type: "simulation",
        title: "The Spiral of Death",
        description: "According to old physics, every atom in your body should have collapsed in less than a second. Obviously, we are still here.",
        run: runSpiralSim
    },
    {
        id: "solution-intro",
        type: "concept-split",
        title: "Bohr's Crazy Idea",
        leftContent: "Niels Bohr said: 'What if the electron is NOT allowed to go just anywhere?'",
        rightPoints: [
            "He invented the 'Quantum Ladder'.",
            "You can stand on Step 1.",
            "You can stand on Step 2.",
            "But you CANNOT stand in between steps."
        ]
    },
    {
        id: "analogy-ladder",
        type: "comparison",
        title: "Ramp vs Ladder",
        leftTitle: "Old Model (Ramp)",
        leftPoints: [
            "You can slide down to any height.",
            "You slide smoothly into the center.",
            "Result: Atom destroys itself."
        ],
        rightTitle: "Bohr Model (Ladder)",
        rightPoints: [
            "You must be on a rung.",
            "The bottom rung (n=1) is safe.",
            "You can't fall below the bottom rung.",
            "Result: Atom is stable!"
        ]
    },
    {
        id: "sim-bohr",
        type: "simulation",
        title: "The Stable Atom",
        description: "Watch the electron. It jumps instantly between rungs (n=1, n=2...). It never spirals inward.",
        run: runBohrSim
    },
    {
        id: "process-jump",
        type: "process",
        title: "How to Jump (Quantum Leaps)",
        steps: [
            { label: "Ground Floor", desc: "The electron is happy on the lowest level (n=1)." },
            { label: "Energy Hit", desc: "Heat or electricity hits the atom. The electron absorbs it." },
            { label: "Jump Up", desc: "The electron uses that energy to teleport to a higher rung (n=2 or n=3)." },
            { label: "Fall Down", desc: "The electron gets tired and falls back down. It releases the energy as LIGHT." }
        ]
    },
    {
        id: "analogy-elevator",
        type: "concept-split",
        title: "The Elevator Analogy",
        leftContent: "Imagine a building where the elevator doesn't travel through space. It just disappears from Floor 1 and appears on Floor 5.",
        rightPoints: [
            "Going Up = Cost Money (Absorb Energy)",
            "Going Down = Get Money Back (Emit Light)",
            "Different floor drops = Different colors of light"
        ]
    },
    {
        id: "equation",
        type: "equation",
        latex: "E = E_2 - E_1 = hf",
        description: "The energy of the light (hf) matches exactly the difference between the two floors.",
        variables: [
            { symbol: "E2", meaning: "Energy of High Orbit" },
            { symbol: "E1", meaning: "Energy of Low Orbit" },
            { symbol: "hf", meaning: "Photon (Light) emitted" }
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "Why do neon lights glow?",
        options: [
            "The atoms are burning",
            "Electrons are falling from high orbits to low orbits, releasing light",
            "The glass is hot",
            "Magic"
        ],
        correctIndex: 1,
        explanation: "Electricity kicks the electrons up the ladder. When they fall back down, they release that energy as specific colors of light (Photons)."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "According to Bohr, an electron can orbit at distance 1.5.",
        isTrue: false,
        explanation: "False! It can orbit at 1, or 2. Nowhere in between. This is what 'Quantized' means."
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Recap",
        recap: [
            "Classical physics said atoms should collapse",
            "Bohr said orbits are quantized (like a ladder)",
            "Electrons can't exist between rungs",
            "Jumping down releases light (Spectroscopy)",
            "This explained why hydrogen glows the way it does"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "The Atom is Saved!",
        text: "Bohr's simple rule saved the universe from collapsing and explained the colors of the world."
    }
];
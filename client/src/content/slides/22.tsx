import React from 'react';
import { Target, Zap, Activity, ShieldQuestion, ArrowRightLeft } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. BILLIARD BALL SIMULATION (Classical Mechanics)
// Shows a white cue ball hitting a stationary colored ball.
// Demonstrates transfer of momentum and loss of speed.
const runBilliardSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;

    // State
    let cueBall = { x: 50, y: 0, vx: 5, vy: 0 }; // Will set y in render
    let targetBall = { x: 0, y: 0, vx: 0, vy: 0, hit: false }; // Will set x,y in render

    const reset = (w: number, h: number) => {
        cueBall = { x: 50, y: h/2 + 10, vx: 8, vy: -0.5 };
        targetBall = { x: w/2, y: h/2, vx: 0, vy: 0, hit: false };
    };

    const render = () => {
        const { width: w, height: h } = canvas;
        
        // Init positions if first frame
        if (targetBall.x === 0) reset(w, h);

        ctx.clearRect(0, 0, w, h);

        // Draw Table
        ctx.fillStyle = '#15803d'; // Pool Table Green
        ctx.fillRect(20, 20, w-40, h-40);
        ctx.fillStyle = '#4ade80'; // Border
        ctx.strokeRect(20, 20, w-40, h-40);

        // Update Physics
        cueBall.x += cueBall.vx;
        cueBall.y += cueBall.vy;
        targetBall.x += targetBall.vx;
        targetBall.y += targetBall.vy;

        // Collision Check
        const dx = cueBall.x - targetBall.x;
        const dy = cueBall.y - targetBall.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (!targetBall.hit && dist < 30) {
            targetBall.hit = true;
            // Elastic collision logic (Simplified)
            // Cue ball glances off
            cueBall.vx = 4;
            cueBall.vy = -3; 
            // Target ball takes some momentum
            targetBall.vx = 4;
            targetBall.vy = 2;
        }

        // Reset if off screen
        if (cueBall.x > w + 50 || cueBall.y < -50 || cueBall.y > h + 50) {
            reset(w, h);
        }

        // Draw Cue Ball (White)
        ctx.beginPath();
        ctx.arc(cueBall.x, cueBall.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // Draw Target Ball (Black 8-ball)
        ctx.beginPath();
        ctx.arc(targetBall.x, targetBall.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Collision!", w/2, 50);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. COMPTON SCATTERING SIMULATION
// Shows a High Energy Photon (Blue Wavy line) hitting an electron.
// It bounces off as Low Energy Photon (Red Wavy line).
const runComptonSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;

    // Photon State
    let photon = { x: 0, y: 0, active: true, phase: 'incoming' }; 
    let electron = { x: 0, y: 0, vx: 0, vy: 0 };

    const reset = (w: number, h: number) => {
        photon = { x: 50, y: h/2, active: true, phase: 'incoming' };
        electron = { x: w/2, y: h/2, vx: 0, vy: 0 };
    };

    const drawWavyLine = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: string, freq: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        
        const dist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX);
        
        for (let i = 0; i < dist; i+=2) {
            // Wavy math
            const waveH = Math.sin((i + t * 5) * freq) * 10;
            const px = startX + (Math.cos(angle) * i) - (Math.sin(angle) * waveH);
            const py = startY + (Math.sin(angle) * i) + (Math.cos(angle) * waveH);
            if (i===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    };

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.05;

        if (electron.x === 0) reset(w, h);

        ctx.clearRect(0, 0, w, h);

        // Update Electron
        electron.x += electron.vx;
        electron.y += electron.vy;

        // Collision Logic
        if (photon.phase === 'incoming') {
            photon.x += 4;
            if (photon.x >= w/2 - 20) {
                photon.phase = 'scattered';
                // Electron Recoils
                electron.vx = 2;
                electron.vy = 2;
            }
        } else if (photon.phase === 'scattered') {
            photon.x += 3;
            photon.y -= 2;
        }

        // Reset loop
        if (photon.x > w + 100 || photon.y < -100) {
            reset(w, h);
        }

        // DRAW

        // 1. Incoming Photon (Blue - High Freq)
        if (photon.phase === 'incoming') {
            drawWavyLine(ctx, photon.x - 60, photon.y, photon.x, photon.y, '#3b82f6', 0.5); // Tight wave
            
            ctx.fillStyle = '#3b82f6';
            ctx.fillText("High Energy (Blue)", 100, 50);
        } 
        // 2. Scattered Photon (Red - Low Freq)
        else {
            drawWavyLine(ctx, w/2, h/2, photon.x, photon.y, '#ef4444', 0.2); // Loose wave
            
            ctx.fillStyle = '#ef4444';
            ctx.textAlign = 'right';
            ctx.fillText("Low Energy (Red)", w - 50, 50);
        }

        // 3. Electron
        ctx.beginPath();
        ctx.arc(electron.x, electron.y, 15, 0, Math.PI*2);
        ctx.fillStyle = '#fbbf24'; // Yellow
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '12px sans-serif';
        ctx.fillText("e-", electron.x, electron.y + 4);


        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_22: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Compton Scattering",
        subtitle: "Proof that light plays pool with electrons.",
        icon: <Target size={80} className="text-green-400" />,
        meta: "Quantum Mechanics"
    },
    {
        id: "context",
        type: "concept-list",
        title: "Is Light a Wave or a Ball?",
        context: "We learned from the Photoelectric Effect that light acts like a particle (Photon). But can we prove it by crashing it into things?",
        items: [
            "Imagine throwing a rock at a ball.",
            "The rock slows down.",
            "The ball moves away.",
            "Does light do this?"
        ]
    },
    {
        id: "sim-billiard",
        type: "simulation",
        title: "The Billiard Analogy",
        description: "In the real world, when a moving white ball hits a stationary 8-ball, it transfers energy and slows down.",
        run: runBilliardSim
    },
    {
        id: "concept-analogy",
        type: "concept-split",
        title: "The Pool Table of Physics",
        leftContent: "Arthur Compton did an experiment in 1923. He shot X-rays (High Energy Light) at electrons.",
        rightPoints: [
            "Cue Ball = X-ray Photon",
            "8-Ball = Electron",
            "He wanted to see if they bounced off each other."
        ]
    },
    {
        id: "sim-compton",
        type: "simulation",
        title: "The Collision",
        description: "Watch the color! The Blue photon hits, loses energy, and leaves as a Red photon. This proves it lost 'speed' (energy).",
        run: runComptonSim
    },
    {
        id: "comparison",
        type: "comparison",
        title: "Wave Theory vs. Particle Theory",
        leftTitle: "If Light was just a Wave...",
        leftPoints: [
            "It would gently wiggle the electron",
            "The electron wouldn't go flying",
            "The light would stay the same color (same frequency)"
        ],
        rightTitle: "If Light is a Particle...",
        rightPoints: [
            "It crashes like a car crash",
            "The electron flies off (Recoil)",
            "The light loses energy -> Changes Color!"
        ]
    },
    {
        id: "process",
        type: "process",
        title: "What happens in the crash?",
        steps: [
            { label: "Incoming", desc: "A high-energy photon (Blue/X-ray) zooms in." },
            { label: "Smash!", desc: "It hits a stationary electron." },
            { label: "Payday", desc: "The photon gives some of its energy to the electron." },
            { label: "Result", desc: "The electron moves. The photon leaves, but now it's 'tired' (Redder color/Longer wavelength)." }
        ]
    },
    {
        id: "equation",
        type: "equation",
        latex: "\\Delta \\lambda = \\lambda' - \\lambda",
        description: "The Change in Color (Wavelength). The wavelength gets LONGER because the photon lost energy.",
        variables: [
            { symbol: "λ", meaning: "Original Color (Blue)" },
            { symbol: "λ'", meaning: "New Color (Red)" },
            { symbol: "Δλ", meaning: "The Shift (Compton Shift)" }
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "Why does the photon change color after hitting the electron?",
        options: [
            "It painted itself",
            "It lost energy to the electron",
            "It gained speed",
            "The electron is magnetic"
        ],
        correctIndex: 1,
        explanation: "Color = Energy. Blue is high energy, Red is low energy. Since the photon gave energy to the electron to push it, the photon MUST become 'redder'."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "Compton Scattering proved that light carries momentum, just like a physical object.",
        isTrue: true,
        explanation: "Correct! Even though light has no mass, it has momentum. It can push things around physically."
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "Light acts like a billiard ball",
            "When it hits an electron, they collide physically",
            "The electron gains speed (recoil)",
            "The photon loses energy (changes color/wavelength)",
            "This confirms the Particle Nature of light"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Particle Nature Confirmed",
        text: "Along with the Photoelectric Effect, Compton Scattering is the final proof that light is made of particles."
    }
];
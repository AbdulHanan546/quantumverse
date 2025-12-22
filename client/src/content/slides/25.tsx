import React from 'react';
import { Microscope, Target, Zap, Waves, Search } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. PARTICLE SCATTER SIMULATION (Expectation)
// Shows particles hitting a bumpy surface and bouncing off in random directions.
// This is what we expect if electrons are just "tiny balls".
const runParticleSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    
    // Particles
    const balls: {x: number, y: number, vx: number, vy: number}[] = [];
    
    // Generate bumpy surface
    const bumps: {x: number, y: number, r: number}[] = [];
    const w = canvas.width || 800; // fallback
    const h = canvas.height || 600;
    
    // We need to initialize bumps once we know width
    let initialized = false;

    const render = () => {
        const { width: w, height: h } = canvas;
        const surfaceY = h - 100;

        if (!initialized) {
            for(let i=0; i<w; i+=30) {
                bumps.push({ x: i, y: surfaceY + 10, r: 15 });
            }
            initialized = true;
        }

        ctx.clearRect(0, 0, w, h);

        // Spawn incoming electrons
        if (Math.random() < 0.1) {
            balls.push({ x: w/2 + (Math.random()-0.5)*50, y: 0, vx: 0, vy: 5 });
        }

        // Draw Surface (Atoms)
        ctx.fillStyle = '#71717a';
        for (const b of bumps) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.fillText("Nickel Atoms (Bumpy Surface)", 20, h - 20);

        // Update & Draw Balls
        ctx.fillStyle = '#fbbf24'; // Electron yellow
        for (let i = balls.length - 1; i >= 0; i--) {
            const b = balls[i];
            b.x += b.vx;
            b.y += b.vy;

            // Bounce check
            if (b.y > surfaceY - 5 && b.y < surfaceY + 20) {
                // Simple random bounce to simulate "scattering"
                b.vy = -Math.random() * 5 - 2;
                b.vx = (Math.random() - 0.5) * 10;
            }

            // Remove offscreen
            if (b.y < -10 || b.x < 0 || b.x > w) {
                balls.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // Detector Visualization (Everywhere)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(w/2, surfaceY, 200, Math.PI, 0); // Semicircle
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Scattering EVERYWHERE (Random)", w/2, 100);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. WAVE INTERFERENCE SIMULATION (Reality)
// Shows waves hitting the surface and forming distinct "Beams" (Diffraction)
const runWaveSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h - 50; // Source/Target at bottom for visual simplicity
        t += 0.2;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw Crystal Lattice
        ctx.fillStyle = '#71717a';
        for(let i=-200; i<=200; i+=40) {
            ctx.beginPath();
            ctx.arc(cx + i, cy, 10, 0, Math.PI*2);
            ctx.fill();
        }

        // 2. Draw Incoming Wave (Moving Down)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'; // Blue faint
        ctx.lineWidth = 2;
        for(let y=0; y<cy; y+=40) {
            const yPos = (y + t*2) % cy;
            ctx.beginPath();
            ctx.moveTo(cx - 100, yPos);
            ctx.lineTo(cx + 100, yPos);
            ctx.stroke();
        }

        // 3. Draw Constructive Interference Beams (The Result)
        // In real physics, this depends on Bragg's Law.
        // We will visualize 3 distinct beams: Left, Center, Right.
        
        const angles = [-Math.PI/4, 0, Math.PI/4]; // -45, 0, +45 degrees
        
        angles.forEach(angle => {
            const dx = Math.sin(angle);
            const dy = -Math.cos(angle);
            
            ctx.strokeStyle = '#4ade80'; // Green = Detected
            ctx.lineWidth = 3;
            
            // Animated pulses moving outward
            for(let r=0; r<400; r+=50) {
                const dist = (r + t*2) % 400;
                // Draw a small arc segment to represent the wave front in that direction
                
                // Position of wave front center
                const wx = cx + dx * dist;
                const wy = cy + dy * dist;
                
                ctx.beginPath();
                // Draw a line perpendicular to direction
                ctx.moveTo(wx - dy*20, wy + dx*20);
                ctx.lineTo(wx + dy*20, wy - dx*20);
                ctx.stroke();
            }
        });

        // 4. Draw Detector
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '20px sans-serif';
        ctx.fillText("Strong Signal Here!", cx, 50);
        ctx.fillText("Strong Signal Here!", cx - 200, 150);
        ctx.fillText("Strong Signal Here!", cx + 200, 150);

        ctx.fillStyle = '#ef4444';
        ctx.font = '14px sans-serif';
        ctx.fillText("(No signal in between gaps)", cx + 100, 100);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_25: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Davisson–Germer Experiment",
        subtitle: "The happy accident that proved electrons behave like waves.",
        icon: <Microscope size={80} className="text-blue-400" />,
        meta: "Experimental Proof"
    },
    {
        id: "context",
        type: "concept-list",
        title: "The Big Question",
        context: "De Broglie had just said 'Everything is a wave'. But that sounded crazy. Scientists needed proof.",
        items: [
            "If electrons are particles, they should bounce like tennis balls.",
            "If electrons are waves, they should overlap like ripples.",
            "How do we check?"
        ]
    },
    {
        id: "analogy-wall",
        type: "comparison",
        title: "Tennis Balls vs. Water",
        leftTitle: "Particles (Balls)",
        leftPoints: [
            "Throw them at a bumpy wall",
            "They bounce off in random directions",
            "No pattern"
        ],
        rightTitle: "Waves (Water)",
        rightPoints: [
            "Flow through gaps",
            "Create specific patterns (Interference)",
            "Strong spots and weak spots"
        ]
    },
    {
        id: "sim-particle",
        type: "simulation",
        title: "Expectation: Particle Scatter",
        description: "If electrons were just tiny marbles hitting rough nickel atoms, they would scatter everywhere randomly.",
        run: runParticleSim
    },
    {
        id: "story-accident",
        type: "concept-split",
        title: "The Happy Accident",
        leftContent: "Davisson and Germer were firing electrons at a block of Nickel. Suddenly, a liquid air bottle exploded in the lab! (True story).",
        rightPoints: [
            "The air rushed in and rusted the Nickel.",
            "To fix it, they heated the Nickel very hot.",
            "This accidentally turned the Nickel into a perfect Crystal.",
            "The atoms lined up in perfect rows."
        ]
    },
    {
        id: "result",
        type: "process",
        title: "What they saw",
        steps: [
            { label: "The Fire", desc: "They turned the electron gun back on." },
            { label: "The Detector", desc: "They moved the detector around the nickel." },
            { label: "The Surprise", desc: "The electrons weren't everywhere. They appeared in bright beams at specific angles!" }
        ]
    },
    {
        id: "sim-wave",
        type: "simulation",
        title: "Reality: Diffraction",
        description: "The electrons formed 'beams' at specific angles. Only WAVES do this (constructive interference).",
        run: runWaveSim
    },
    {
        id: "explanation",
        type: "concept-split",
        title: "Why did this happen?",
        leftContent: "The electrons were 'diffracting' off the rows of atoms, just like light diffracts off a CD or a hologram.",
        rightPoints: [
            "Waves bounce off atoms",
            "At certain angles, wave peaks line up (Peak + Peak)",
            "This creates a Super Wave (Strong Signal)",
            "At other angles, they cancel out (Silence)"
        ]
    },
    {
        id: "equation",
        type: "equation",
        latex: "n\\lambda = 2d \\sin\\theta",
        description: "Bragg's Law. It predicts exactly where the bright beams will appear based on the wavelength.",
        variables: [
            { symbol: "λ", meaning: "Wavelength of Electron" },
            { symbol: "d", meaning: "Distance between atoms" },
            { symbol: "θ", meaning: "Angle of the beam" }
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "If electrons were purely particles (like tiny rocks), what would the detector see?",
        options: [
            "Bright beams at specific angles",
            "A rainbow pattern",
            "Electrons scattered randomly everywhere",
            "Nothing at all"
        ],
        correctIndex: 2,
        explanation: "Particles bounce randomly off a rough surface. The fact that they formed neat 'beams' meant they were interfering like waves."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "This experiment proved de Broglie was wrong.",
        isTrue: false,
        explanation: "False! It proved he was 100% RIGHT. Matter really does act like a wave."
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Recap",
        recap: [
            "Davisson & Germer fired electrons at a Nickel crystal",
            "An accident made the crystal atoms line up perfectly",
            "Electrons bounced off in distinct beams (Diffraction)",
            "Diffraction is a WAVE property",
            "Conclusion: Electrons behave as waves"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Case Closed",
        text: "With this experiment, the debate was over. Matter waves are real."
    }
];
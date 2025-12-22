import React from 'react';
import { Waves, Box, MousePointer2, Microscope } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. MACRO VS MICRO SIMULATION
// Shows a Baseball moving (Straight line) vs an Electron moving (Wavy line)
// Demonstrates that "waviness" depends on mass.
const runMatterWaveSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 2;

        ctx.clearRect(0, 0, w, h);

        // --- SECTION 1: THE BASEBALL (Big Mass) ---
        const ballX = (t % (w + 50)) - 25;
        const ballY = h/4;
        
        // Draw Track
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath(); ctx.moveTo(0, ballY); ctx.lineTo(w, ballY); ctx.stroke();

        // Draw Baseball
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 15, 0, Math.PI * 2);
        ctx.fill();
        // Red stitches
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 15, 0.5, 2.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ballX, ballY, 15, 3.5, 5.5);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("You / Baseball (Heavy)", 20, ballY - 30);
        ctx.fillText("Wavelength: 0.00000000000001 nm (Invisible)", 20, ballY + 40);


        // --- SECTION 2: THE ELECTRON (Tiny Mass) ---
        const elecX = (t % (w + 50)) - 25;
        const elecBaseY = (h/4) * 3;
        
        // The Wave Path
        const waveAmp = 30;
        const waveFreq = 0.05;
        const elecY = elecBaseY + Math.sin(elecX * waveFreq) * waveAmp;

        // Draw Trail (The Wave)
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let x=0; x<elecX; x+=2) {
             const y = elecBaseY + Math.sin(x * waveFreq) * waveAmp;
             if (x===0) ctx.moveTo(x, y);
             else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Electron
        ctx.fillStyle = '#fbbf24'; // Yellow
        ctx.beginPath();
        ctx.arc(elecX, elecY, 8, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText("Electron (Tiny)", 20, elecBaseY - 50);
        ctx.fillStyle = '#4ade80';
        ctx.fillText("Wavelength: Large & Visible!", 20, elecBaseY + 50);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. WAVELENGTH CALCULATOR VISUALIZER
// Visualizes h/p.
const runFormulaSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.05;

        // Cycle Mass from Small (Electron) to Big (Bowling Ball)
        // 0 -> 1 -> 0
        const cycle = (Math.sin(t) + 1) / 2; 
        
        // Mass grows
        const size = 5 + (cycle * 60); 
        
        // Wavelength shrinks as mass grows
        // Inverse relationship roughly
        const wavelength = 100 / (size * 0.2); 

        ctx.clearRect(0, 0, w, h);
        const cy = h/2;

        // Draw The Wave
        ctx.strokeStyle = cycle > 0.8 ? '#3f3f46' : '#38bdf8'; // Grey out if flat
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = cy + Math.sin(x / wavelength) * 40 * (1 - cycle); // Flatten amplitude too for visual effect
            if (x===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Draw The Particle in middle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(w/2, cy, size, 0, Math.PI*2);
        ctx.fill();

        // Labels
        ctx.fillStyle = 'white';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        
        if (cycle < 0.2) {
            ctx.fillText("Tiny Mass = Big Wave", w/2, h - 50);
        } else if (cycle > 0.8) {
            ctx.fillText("Huge Mass = No Wave", w/2, h - 50);
        } else {
            ctx.fillText("More Mass = Less Wave", w/2, h - 50);
        }

        // Formula Overlay
        ctx.font = '16px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText("λ = h / (MASS × velocity)", w/2, 50);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_24: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Matter Waves",
        subtitle: "Can a baseball act like a ripple in a pond?",
        icon: <Waves size={80} className="text-blue-400" />,
        meta: "De Broglie Hypothesis"
    },
    {
        id: "recap",
        type: "concept-list",
        title: "The Story So Far",
        context: "We learned that light (a wave) can act like a particle (photon).",
        items: [
            "Light hits like a bullet.",
            "Light has momentum.",
            "So... does nature work in reverse?"
        ]
    },
    {
        id: "de-broglie",
        type: "intro",
        title: "Louis de Broglie",
        subtitle: "The student who asked: 'If waves can be particles, can particles be waves?'",
        icon: <MousePointer2 size={80} className="text-purple-400" />
    },
    {
        id: "concept-flip",
        type: "concept-split",
        title: "The Symmetry",
        leftContent: "De Broglie guessed that everything in the universe is a wave. Even you.",
        rightPoints: [
            "Electrons are waves.",
            "Baseballs are waves.",
            "Planets are waves.",
            "But... why don't we see it?"
        ]
    },
    {
        id: "sim-mass",
        type: "simulation",
        title: "Size Matters",
        description: "Watch the Electron vs the Baseball. The baseball's wave is so small it looks like a straight line.",
        run: runMatterWaveSim
    },
    {
        id: "equation",
        type: "equation",
        latex: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}",
        description: "The Wavelength (λ) equals Planck's Constant (h) divided by Momentum (mv).",
        variables: [
            { symbol: "λ", meaning: "Wavelength (The waviness)" },
            { symbol: "h", meaning: "Planck's Constant (Very tiny number!)" },
            { symbol: "m", meaning: "Mass (How heavy)" },
            { symbol: "v", meaning: "Velocity (Speed)" }
        ]
    },
    {
        id: "analogy-pizza",
        type: "process",
        title: "The Pizza Dough Analogy",
        steps: [
            { label: "The Formula", desc: "Think of Wavelength as 'How much you can stretch a pizza'." },
            { label: "The Denominator", desc: "Mass is on the bottom. Mass is like the stiffness of the dough." },
            { label: "Electron (Tiny Mass)", desc: "Very soft dough. Stretches huge! (Big Wave)." },
            { label: "Baseball (Big Mass)", desc: "Rock-hard dough. Can't stretch it at all. (No Wave)." }
        ]
    },
    {
        id: "sim-formula",
        type: "simulation",
        title: "The Wavelength Slider",
        description: "As the object gets heavier (bigger circle), observe how the wave flattens out into a straight line.",
        run: runFormulaSim
    },
    {
        id: "quiz",
        type: "quiz",
        question: "Why don't cars exhibit wave-like behavior on the highway?",
        options: [
            "They are moving too slow",
            "They are made of metal",
            "Their mass is too large, making the wavelength undetectable",
            "They actually do, we just ignore it"
        ],
        correctIndex: 2,
        explanation: "Because 'm' (mass) is on the bottom of the equation, a large mass makes the wavelength (λ) incredibly tiny—smaller than an atom!"
    },
    {
        id: "application",
        type: "comparison",
        title: "Real World Magic: Microscopes",
        leftTitle: "Light Microscope",
        leftPoints: [
            "Uses Light Waves",
            "Wavelength ~500 nm",
            "Can't see atoms (Atoms are too small)"
        ],
        rightTitle: "Electron Microscope",
        rightPoints: [
            "Uses Electron 'Waves'",
            "Wavelength ~0.005 nm",
            "Can see individual atoms because the wave is tiny!"
        ]
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Recap",
        recap: [
            "De Broglie proposed all matter has a wavelength",
            "Wavelength depends on Momentum (Mass × Velocity)",
            "Heavy things have invisible wavelengths",
            "Tiny things (electrons) have useful wavelengths",
            "We use electron waves to see atoms (SEM/TEM)"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Everything Wiggles",
        text: "You are technically a wave. But you're too heavy to notice."
    }
];
import React from 'react';
import { AlignJustify, ArrowDownCircle, Lightbulb, Zap, Music } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. THE BOOKSHELF SIMULATION
// Visualizes that an object can sit on shelf 1, 2, or 3, but CANNOT hover in between.
const runBookshelfSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    
    // State
    let ballLevel = 0; // 0 = ground, 1 = shelf 1, 2 = shelf 2
    let state = 'resting'; // resting, jumping, falling
    let yPos = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t++;
        
        ctx.clearRect(0, 0, w, h);
        const cx = w/2;
        const bottomY = h - 50;
        const shelfH = 80;

        // Draw Shelves
        ctx.fillStyle = '#a1a1aa';
        for(let i=0; i<4; i++) {
            const sy = bottomY - (i * shelfH);
            ctx.fillRect(cx - 100, sy, 200, 10);
            
            ctx.font = '14px sans-serif';
            ctx.fillStyle = '#fff';
            if (i===0) ctx.fillText("Ground (n=1)", cx + 110, sy + 5);
            else ctx.fillText(`Shelf ${i} (n=${i+1})`, cx + 110, sy + 5);
            ctx.fillStyle = '#a1a1aa';
        }

        // Logic
        // Cycle: Rest -> Jump -> Rest -> Fall
        const cycleSpeed = 180; // frames
        const phase = t % cycleSpeed;
        
        let targetY = bottomY - (ballLevel * shelfH) - 15; // -15 for radius

        if (phase === 0) {
            // Start jump
            ballLevel = (ballLevel === 0) ? 2 : 0; // Toggle between ground and shelf 2
            state = (ballLevel === 2) ? 'jumping' : 'falling';
        }

        // Animation smoothing
        // Simple lerp for visual effect
        const currentTargetY = bottomY - (ballLevel * shelfH) - 15;
        yPos = yPos + (currentTargetY - yPos) * 0.1;

        // Draw Ball
        ctx.beginPath();
        ctx.arc(cx, yPos, 15, 0, Math.PI*2);
        ctx.fillStyle = '#fbbf24'; // Electron Yellow
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Draw "Not Allowed" signs in the gaps
        if (state === 'falling' || state === 'jumping') {
            ctx.fillStyle = '#ef4444';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            // Show X in the gap being traversed
            const gapY = bottomY - (1 * shelfH) - 40; 
            if (Math.abs(yPos - gapY) < 40) {
                ctx.fillText("FORBIDDEN ZONE!", cx, gapY);
                ctx.font = '12px sans-serif';
                ctx.fillText("(Cannot stop here)", cx, gapY + 20);
            }
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. EMISSION SPECTRA SIMULATION
// Shows an electron dropping and emitting a specific color photon
const runEmissionSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;
    
    // Electron state
    let electron = { r: 50, level: 1 }; // r = distance from center
    let photon = { x: 0, y: 0, active: false, color: '' };

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h/2;
        t++;

        ctx.clearRect(0, 0, w, h);

        // Draw Orbits
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1;
        [50, 100, 150].forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI*2);
            ctx.stroke();
        });

        // Nucleus
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI*2);
        ctx.fill();

        // Logic Cycle
        // 0-100: Ground state
        // 100: Absorb energy (Jump to n=3)
        // 100-200: Excited state
        // 200: Drop to n=2 (Emit Red)
        // 200-300: Rest
        // 300: Drop to n=1 (Emit Blue)
        
        const cycle = t % 400;
        let targetR = 50;
        
        if (cycle > 100 && cycle < 200) targetR = 150; // Jump up
        else if (cycle >= 200 && cycle < 300) targetR = 100; // Drop step 1
        else targetR = 50; // Drop step 2

        // Snap animation
        electron.r = electron.r + (targetR - electron.r) * 0.1;

        // Emit Photon Logic
        if (cycle === 200) {
            photon = { x: cx, y: cy - 125, active: true, color: '#ef4444' }; // Red (Small drop)
        }
        if (cycle === 300) {
            photon = { x: cx, y: cy - 75, active: true, color: '#3b82f6' }; // Blue (Big drop to center)
        }

        // Draw Electron
        const ex = cx + Math.cos(t * 0.05) * electron.r;
        const ey = cy + Math.sin(t * 0.05) * electron.r;
        
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI*2);
        ctx.fill();
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        let levelText = "n=1";
        if(electron.r > 120) levelText = "n=3 (High E)";
        else if(electron.r > 80) levelText = "n=2";
        ctx.fillText(levelText, cx, cy + 180);

        // Draw Photon
        if (photon.active) {
            photon.x += 5; // Move right
            ctx.fillStyle = photon.color;
            ctx.beginPath();
            ctx.arc(photon.x, photon.y, 6, 0, Math.PI*2);
            ctx.fill();
            
            // Wavy trail
            ctx.strokeStyle = photon.color;
            ctx.beginPath();
            ctx.moveTo(photon.x - 20, photon.y);
            ctx.lineTo(photon.x, photon.y);
            ctx.stroke();

            // Label
            ctx.fillText("Photon!", photon.x, photon.y - 10);

            if (photon.x > w) photon.active = false;
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_28: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Atomic Ladder",
        subtitle: "Why atoms are like bookshelves, not slides.",
        icon: <AlignJustify size={80} className="text-yellow-400" />,
        meta: "Quantized Energy"
    },
    {
        id: "analogy-ramp",
        type: "comparison",
        title: "Ramps vs. Stairs",
        leftTitle: "A Ramp (Classical)",
        leftPoints: [
            "You can stand at any height",
            "You can climb 1 inch or 1 mile",
            "Smooth continuous movement"
        ],
        rightTitle: "A Ladder (Quantum)",
        rightPoints: [
            "You must stand on a rung",
            "You cannot hover between rungs",
            "You 'snap' from step to step"
        ]
    },
    {
        id: "sim-bookshelf",
        type: "simulation",
        title: "The Forbidden Zone",
        description: "Watch the electron. It can sit on Shelf 1 or Shelf 2. But the space in between is FORBIDDEN by the laws of physics.",
        run: runBookshelfSim
    },
    {
        id: "concept-levels",
        type: "concept-list",
        title: "Energy Levels",
        context: "Electrons orbit the nucleus, but only at specific distances. We call these 'Energy Levels' or Shells.",
        items: [
            "n=1: The Ground Floor (Lowest Energy, closest to nucleus)",
            "n=2: The First Floor (Higher Energy)",
            "n=3: The Second Floor (Even Higher)",
            "To move up, you must pay energy."
        ]
    },
    {
        id: "process-jump",
        type: "process",
        title: "How to make Light",
        steps: [
            { label: "1. Excitement", desc: "The atom gets hot or zapped. The electron absorbs energy." },
            { label: "2. The Quantum Jump", desc: "The electron jumps INSTANTLY to a higher shelf (n=3)." },
            { label: "3. The Fall", desc: "The electron wants to be lazy. It falls back down to a lower shelf." },
            { label: "4. The Flash", desc: "The energy it loses during the fall shoots out as a Photon (Light)." }
        ]
    },
    {
        id: "sim-emission",
        type: "simulation",
        title: "Falling Creates Color",
        description: "Watch: When it drops a small distance, it makes Red light. When it drops a large distance, it makes Blue light.",
        run: runEmissionSim
    },
    {
        id: "concept-color",
        type: "concept-split",
        title: "The Color Code",
        leftContent: "The color of the light tells us exactly how far the electron fell.",
        rightPoints: [
            "Small Fall = Low Energy = RED Light",
            "Medium Fall = Medium Energy = GREEN Light",
            "Huge Fall = High Energy = BLUE/UV Light"
        ]
    },
    {
        id: "analogy-staircase",
        type: "quote",
        text: "Think of it like a musical instrument. A guitar string can only play specific notes, not the sounds in between. Atoms are the same with light.",
        author: "Analogy"
    },
    {
        id: "equation",
        type: "equation",
        latex: "E = hf",
        description: "The Energy (E) of the jump determines the Frequency/Color (f) of the light.",
        variables: [
            { symbol: "E", meaning: "Energy Difference between shelves" },
            { symbol: "f", meaning: "Color of the light" },
            { symbol: "h", meaning: "Planck's Constant" }
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "If an electron falls from level n=5 to n=1 (a huge drop), what kind of light is most likely produced?",
        options: [
            "Radio waves (Very low energy)",
            "Red Light (Low energy)",
            "Ultraviolet or X-Ray (Very high energy)",
            "Sound waves"
        ],
        correctIndex: 2,
        explanation: "A big drop means a lot of energy is released. High energy light corresponds to Blue, Violet, or even invisible UV/X-rays."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "An electron can spiral slowly into the nucleus like a coin in a funnel.",
        isTrue: false,
        explanation: "False! That would be a 'ramp'. Electrons must stay in their specific shells. They cannot spiral or hover in between."
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "Atoms have specific Energy Levels (Shelves)",
            "Electrons cannot exist between levels",
            "Jumping UP requires energy",
            "Falling DOWN releases energy as Light",
            "The distance of the fall determines the Color"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "The Atomic Fingerprint",
        text: "Because every element has different shelf heights, every element glows with a unique set of colors. This is how we know what stars are made of!"
    }
];
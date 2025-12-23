import React from 'react';
import { Target, Atom, ScanSearch, Shield } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. PLUM PUDDING MODEL (Expected Result)
// Particles should just pass through soft "soup"
const runPlumPuddingSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 5;

        ctx.clearRect(0, 0, w, h);

        // Draw "The Atom" (Big Soft Cloud)
        const radius = 100;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // Soft yellow
        ctx.beginPath();
        ctx.arc(w/2, cy, radius, 0, Math.PI*2);
        ctx.fill();
        
        // Draw "Plums" (Electrons embedded)
        ctx.fillStyle = '#fbbf24';
        for(let i=0; i<8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(w/2 + Math.cos(angle)*50, cy + Math.sin(angle)*50, 5, 0, Math.PI*2);
            ctx.fill();
        }

        // Draw Alpha Particles (Bullets)
        // In this model, they just fly straight through because the positive charge is spread out
        ctx.fillStyle = '#ef4444'; // Red bullets
        for(let i=0; i<10; i++) {
            const x = (t + i * 50) % (w + 100) - 50;
            // Slight vertical spread
            const y = cy + (i - 5) * 10; 
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI*2);
            ctx.fill();
            
            // Trail
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.beginPath();
            ctx.moveTo(x-20, y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText("Expectation: Bullets go straight through the soft cake.", w/2, h - 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. NUCLEAR MODEL (Actual Result)
// Most pass through, but some bounce back hard!
const runNuclearSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h/2;
        t += 2;

        ctx.clearRect(0, 0, w, h);

        // Draw The Nucleus (Tiny, Hard, Positive)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI*2); // Tiny dot!
        ctx.fill();
        
        // Glow
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Alpha Particles
        for(let i=0; i<15; i++) {
            // Calculate path
            const yOffset = (i - 7) * 15; // Vertical spacing
            const startY = cy + yOffset;
            
            // Current X position looping
            let lx = (t * 4 + i * 30) % (w + 300) - 100;
            let ly = startY;

            // SCATTERING LOGIC
            // If the particle gets close to the center, it deflects
            // This is a visual approximation of hyperbolic paths
            
            if (Math.abs(yOffset) < 5) {
                // Direct hit (or very close) -> BOUNCE BACK
                if (lx > cx - 20) {
                    lx = cx - 20 - (lx - (cx - 20)); // Mirror X backwards
                    // Add some Y drift
                    ly += (lx - cx) * 0.5 * (Math.random() > 0.5 ? 1 : -1); 
                }
            } else if (Math.abs(yOffset) < 30) {
                // Close miss -> DEFLECT
                if (lx > cx) {
                    // Bend away from center
                    const push = 1000 / (yOffset); // Closer = stronger push
                    ly += push * ((lx - cx) / w); 
                }
            }
            
            // Draw Particle
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(lx, ly, 4, 0, Math.PI*2);
            ctx.fill();
            
            // Draw flash if bouncing
            if (lx > cx - 30 && lx < cx + 30 && Math.abs(yOffset) < 10) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(cx, cy, 15, 0, Math.PI*2);
                ctx.fill();
            }
        }

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText("Reality: 1 in 8000 bounce back!", w/2, h - 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_26: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Rutherford's Gold Foil",
        subtitle: "How shooting bullets at gold proved atoms are mostly empty.",
        icon: <Target size={80} className="text-red-500" />,
        meta: "Discovery of the Nucleus"
    },
    {
        id: "context",
        type: "concept-list",
        title: "The Old Idea: Plum Pudding",
        context: "Before 1911, scientists thought an atom was like a soft cookie or 'Plum Pudding'.",
        items: [
            "Positive charge was the dough (spread out)",
            "Electrons were the chocolate chips (stuck inside)",
            "The atom was soft and squishy"
        ]
    },
    {
        id: "experiment-setup",
        type: "process",
        title: "The Experiment",
        steps: [
            { label: "The Gun", desc: "A radioactive rock that shoots Alpha Particles (heavy, fast, positive bullets)." },
            { label: "The Target", desc: "A super thin sheet of pure Gold (only a few atoms thick)." },
            { label: "The Detector", desc: "A screen that glows when hit by a bullet." }
        ]
    },
    {
        id: "sim-pudding",
        type: "simulation",
        title: "What They Expected",
        description: "If atoms were soft 'puddings', the heavy bullets should punch straight through without slowing down.",
        run: runPlumPuddingSim
    },
    {
        id: "analogy-tissue",
        type: "quote",
        text: "It was quite the most incredible event... It was almost as incredible as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you.",
        author: "Ernest Rutherford"
    },
    {
        id: "sim-nuclear",
        type: "simulation",
        title: "What Actually Happened",
        description: "Most went through... but some hit something HARD and bounced backward!",
        run: runNuclearSim
    },
    {
        id: "concept-split-results",
        type: "concept-split",
        title: "The Results Analyzed",
        leftContent: "Three things happened to the bullets (Alpha particles):",
        rightPoints: [
            "99% went straight through (The atom is empty)",
            "Some curved slightly (They passed near something positive)",
            "1 in 8,000 bounced back (Direct hit!)"
        ]
    },
    {
        id: "analogy-stadium",
        type: "concept-list",
        title: "The Football Stadium Analogy",
        context: "Imagine an atom is the size of a professional football stadium.",
        items: [
            "The Nucleus is a marble on the center line.",
            "The Electrons are tiny flies buzzing in the top seats.",
            "The rest of the stadium? COMPLETELY EMPTY.",
            "If you threw rocks randomly into the stadium, you'd almost never hit the marble."
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "Why did most of the alpha particles go straight through the gold foil?",
        options: [
            "The gold foil was torn",
            "The alpha particles were ghosts",
            "Atoms are mostly empty space",
            "The nucleus moved out of the way"
        ],
        correctIndex: 2,
        explanation: "Since the nucleus is so tiny compared to the whole atom, most 'bullets' simply missed it and flew through the empty space."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "Rutherford discovered that the positive charge is spread out evenly across the atom.",
        isTrue: false,
        explanation: "False! He proved the exact opposite: the positive charge is concentrated in a tiny, dense center called the Nucleus."
    },
    {
        id: "comparison",
        type: "comparison",
        title: "Old vs New Atom",
        leftTitle: "Plum Pudding (Old)",
        leftPoints: [
            "Soft & Squishy",
            "Mass spread out",
            "Bullets pass through"
        ],
        rightTitle: "Nuclear Model (New)",
        rightPoints: [
            "Mostly Empty Space",
            "Tiny, Heavy Center (Nucleus)",
            "Bullets bounce off center"
        ]
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Recap",
        recap: [
            "Rutherford shot alpha particles at gold foil",
            "He expected them to go through soft atoms",
            "Some bounced back, proving a hard center exists",
            "We call this center the Nucleus",
            "Atoms are 99.999% empty space"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "The Modern Atom",
        text: "This experiment gave us the picture of the atom we use today: A solar system with a sun (nucleus) and planets (electrons)."
    }
];
import React from 'react';
import { Microscope, Search, Ruler, AlertTriangle, Crosshair } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. THE CAMERA ANALOGY SIMULATION
// Demonstrates that measuring position (Freeze frame) destroys speed info, 
// and measuring speed (Blur) destroys position info.
const runCameraSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2;
        t += 1;

        // Toggle mode every 3 seconds (approx 180 frames)
        const cycle = t % 360;
        const isSnapshot = cycle < 180;

        ctx.clearRect(0, 0, w, h);

        // Car/Particle logic
        const speed = 15;
        const xPos = (t * speed) % (w + 200) - 100;

        if (isSnapshot) {
            // --- MODE 1: SNAPSHOT (Position Known) ---
            // We strobe effect: Only draw every 20 frames to simulate a flash photo
            if (t % 20 === 0) {
                // Draw sharp object
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(xPos, cy, 20, 0, Math.PI*2);
                ctx.fill();
                
                // Text persist
                ctx.fillStyle = '#fff';
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("SNAPSHOT!", cx, cy - 80);
                
                ctx.font = '16px sans-serif';
                ctx.fillStyle = '#4ade80';
                ctx.fillText("Position: KNOWN (It's right there)", cx, cy + 60);
                ctx.fillStyle = '#ef4444';
                ctx.fillText("Speed: UNKNOWN (Looks frozen/stopped)", cx, cy + 85);
            }
        } else {
            // --- MODE 2: LONG EXPOSURE (Speed Known) ---
            // Draw a motion blur trail
            const blurLength = 300;
            const grad = ctx.createLinearGradient(xPos - blurLength, 0, xPos, 0);
            grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
            grad.addColorStop(1, '#3b82f6');

            ctx.fillStyle = grad;
            ctx.fillRect(xPos - blurLength, cy - 20, blurLength, 40); // The blur trail

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("LONG EXPOSURE", cx, cy - 80);

            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#ef4444';
            ctx.fillText("Position: UNKNOWN (It's a blurry streak)", cx, cy + 60);
            ctx.fillStyle = '#4ade80';
            ctx.fillText("Speed: KNOWN (Length of streak)", cx, cy + 85);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. THE QUANTUM SQUEEZE
// As you trap particles in a smaller box (Position known), they move faster (Momentum unknown).
const runSqueezeSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    
    // Particles
    const particles = Array.from({length: 50}, () => ({
        x: 0, y: 0, vx: 0, vy: 0
    }));

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h/2;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);

        // Oscillate Box Width
        // from 400px (Wide) to 20px (Tiny)
        const boxWidth = 210 + Math.sin(t) * 190;
        
        // Heisenberg logic: Uncertainty in Velocity is inverse to box Width
        // The tighter the box, the faster they buzz
        const velocityFactor = 1000 / boxWidth; 

        // Draw Box Walls
        ctx.fillStyle = '#27272a';
        ctx.fillRect(cx - boxWidth/2, cy - 100, boxWidth, 200);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - boxWidth/2, cy - 100, boxWidth, 200);

        // Draw Force Fields (Walls closing in)
        ctx.fillStyle = '#ef4444';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, cy - 100, cx - boxWidth/2, 200); // Left wall filler
        ctx.fillRect(cx + boxWidth/2, cy - 100, w - (cx + boxWidth/2), 200); // Right wall filler
        ctx.globalAlpha = 1.0;

        // Update Particles
        particles.forEach(p => {
            // Jitter velocity based on confinement
            p.vx = (Math.random() - 0.5) * velocityFactor;
            p.vy = (Math.random() - 0.5) * velocityFactor;

            // Keep inside box (roughly) for visual
            // We act as if position is "measured" to be within boxWidth
            p.x = cx + (Math.random() - 0.5) * boxWidth;
            p.y = cy + (Math.random() - 0.5) * 180;

            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        
        if (boxWidth > 300) {
            ctx.fillText("Wide Box (High Uncertainty in Position)", cx, cy - 120);
            ctx.fillStyle = '#4ade80';
            ctx.fillText("Result: Low Speed (Calm)", cx, cy + 130);
        } else if (boxWidth < 50) {
            ctx.fillText("Tiny Box (Precise Position)", cx, cy - 120);
            ctx.fillStyle = '#ef4444';
            ctx.fillText("Result: CRAZY SPEED!", cx, cy + 130);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_31: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Experimental Limits",
        subtitle: "Why you can never capture a perfect photo of an electron.",
        icon: <AlertTriangle size={80} className="text-orange-400" />,
        meta: "Heisenberg Uncertainty Principle"
    },
    {
        id: "problem",
        type: "concept-list",
        title: "The Measurement Problem",
        context: "In our normal world, we can measure things easily. I can tell you exactly where a parked car is. I can also tell you how fast a moving car is.",
        items: [
            "But in the Quantum World, there is a weird rule.",
            "Nature forbids you from knowing everything at once.",
            "It's not that our tools are bad.",
            "It's that nature itself is fuzzy."
        ]
    },
    {
        id: "analogy-camera",
        type: "simulation",
        title: "The Camera Analogy",
        description: "Think of an electron like a fast car. You have a camera. You can take two types of photos.",
        run: runCameraSim
    },
    {
        id: "concept-tradeoff",
        type: "concept-split",
        title: "The Trade-Off",
        leftContent: "You have to choose one property to measure. Measuring one destroys the other.",
        rightPoints: [
            "Measure Position (Where?) -> You lose Speed info (Blur is gone).",
            "Measure Momentum (Speed?) -> You lose Position info (It's just a streak).",
            "You cannot have both."
        ]
    },
    {
        id: "analogy-balloon",
        type: "concept-split",
        title: "The Balloon Analogy",
        leftContent: "Imagine holding a water balloon. The water is the 'Uncertainty'.",
        rightPoints: [
            "Squeeze the width (Position) -> The balloon pops up (Speed gets huge).",
            "Squeeze the height (Speed) -> The balloon expands out (Position gets wide).",
            "The total amount of water (Uncertainty) stays the same."
        ]
    },
    {
        id: "sim-squeeze",
        type: "simulation",
        title: "The Quantum Squeeze",
        description: "Watch what happens when we try to pin the particles down into a small space. They start moving uncontrollably!",
        run: runSqueezeSim
    },
    {
        id: "equation",
        type: "equation",
        latex: "\\Delta x \\cdot \\Delta p \\geq \\frac{h}{4\\pi}",
        description: "The Heisenberg Uncertainty Principle. It says the error in position (Δx) times the error in momentum (Δp) is always bigger than a tiny number.",
        variables: [
            { symbol: "Δx", meaning: "Uncertainty in Position (The Blur)" },
            { symbol: "Δp", meaning: "Uncertainty in Momentum (The Speed)" },
            { symbol: "h", meaning: "Planck's Constant" }
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "If we invent a perfect microscope in the future, will we be able to measure an electron's position and speed perfectly?",
        options: [
            "Yes, technology always improves",
            "No, because it's a fundamental law of nature",
            "Only if we use lasers",
            "Yes, but only on Tuesdays"
        ],
        correctIndex: 1,
        explanation: "This limit isn't about broken tools. It's a property of waves. A wave with a perfect location doesn't have a single wavelength (speed)."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "If you know exactly where a particle is (Δx = 0), its speed becomes infinitely unknown (Δp = ∞).",
        isTrue: true,
        explanation: "Correct! If the position is a single point, the momentum becomes completely undefined. The particle could be moving at ANY speed."
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "You cannot measure Position and Momentum perfectly at the same time",
            "It's like a trade-off: more precision in one = less in the other",
            "This is called the Heisenberg Uncertainty Principle",
            "It's why atoms don't collapse (electrons refuse to sit still in the nucleus)"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Fuzzy Reality",
        text: "The more precisely you look at the universe, the fuzzier it gets. Embrace the blur!"
    }
];
import React from "react";
import { 
  Layers, 
  Music, 
  ChefHat, 
  Activity, 
  Sigma, 
  BarChart3,
  AlignJustify,
  Expand,
  Combine
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Ideal Movement (No Dispersion)
 * A packet that stays perfectly together, like a solid ball.
 */
const runNoDispersionSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        const pos = (t * 60) % (w + 200) - 100;
        const width = 40;

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const dist = x - pos;
            const envelope = Math.exp(-(dist * dist) / (2 * width * width));
            const y = cy + Math.sin(x * 0.1 - t * 10) * 60 * envelope;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillText("VACUUM: Packet stays tight and strong", 20, 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 2. Dispersion Simulation (The Spreading)
 * As time goes on, the packet gets wider and shorter.
 */
const runDispersionSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.03;

        ctx.clearRect(0, 0, w, h);

        // Reset time if it goes off screen
        const cycleTime = t % 15;
        const pos = cycleTime * 50;
        
        // Dispersion math: width increases over time
        const initialWidth = 20;
        const currentWidth = initialWidth + (cycleTime * 15);
        // Height decreases to conserve "energy" (area under curve)
        const currentAmp = 100 * (initialWidth / currentWidth);

        ctx.strokeStyle = '#f87171'; // Red for warning/change
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const dist = x - pos;
            const envelope = Math.exp(-(dist * dist) / (2 * currentWidth * currentWidth));
            // Phase velocity is different for different parts
            const y = cy + Math.sin(x * 0.1 - cycleTime * 15) * currentAmp * envelope;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillText(`Packet Width: ${currentWidth.toFixed(0)} units`, 20, 30);
        ctx.fillText("IN GLASS: The packet 'leaks' and spreads out", 20, 50);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_12: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "The Spreading Wave",
        subtitle: "Why wave packets don't stay together forever.",
        icon: <Expand size={80} className="text-red-400" />,
        meta: "Quantum Mechanics"
    },
    {
        id: 2,
        type: "quote",
        text: "In the quantum world, being 'together' is hard work. Give a wave some time, and it will try to be everywhere at once.",
        author: "The Law of Spreading"
    },
    {
        id: 3,
        type: "concept-split",
        title: "The Marathon Analogy",
        leftContent: "Imagine a marathon starts. At the beginning, all the runners are in one tight clump. But as time passes, the fast runners pull ahead and the slow ones fall behind. The clump gets wider and wider.",
        rightPoints: [
            "Start = Tight Packet",
            "Mid-Race = Spreading Packet",
            "End = Total Blur"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "Perfect Travel",
        description: "In a perfect vacuum, every ripple in the packet travels at the exact same speed. The packet stays 'sharp' forever.",
        run: runNoDispersionSim
    },
    {
        id: 5,
        type: "concept-list",
        title: "What is Dispersion?",
        context: "Dispersion happens when a material is 'picky' about speed:",
        items: [
            "Blue ripples might travel slower than red ripples.",
            "Short ripples get 'stuck' more than long ones.",
            "Because they move at different speeds, they drift apart.",
            "The result: The packet 'disperses' or spreads out."
        ]
    },
    {
        id: 6,
        type: "simulation",
        title: "The Great Spreading",
        description: "Watch as the packet moves. It loses its height and becomes wider. This is dispersion in action. The 'identity' of the particle is becoming blurry!",
        run: runDispersionSim
    },
    {
        id: 7,
        type: "process",
        title: "Life of a Dispersing Packet",
        steps: [
            { label: "The Birth", desc: "A tight bundle of waves is created (a localized particle)." },
            { label: "The Journey", desc: "It enters a material like glass or water." },
            { label: "The Split", desc: "High-frequency ripples start moving at a different speed than low-frequency ones." },
            { label: "The Blur", desc: "The packet stretches out until it's no longer 'in one spot'." }
        ]
    },
    {
        id: 8,
        type: "comparison",
        title: "Vacuum vs. Glass",
        leftTitle: "Vacuum (Space)",
        leftPoints: ["All waves move at speed 'c'", "No spreading", "Packet stays like a bullet"],
        rightTitle: "Glass / Prism",
        rightPoints: ["Speeds depend on color", "Constant spreading", "Packet becomes a smear"]
    },
    {
        id: 9,
        type: "equation",
        latex: "v = \\omega / k \\neq \\text{constant}",
        description: "This is the mathematical sign of trouble! If the speed (v) changes when the wavelength (k) changes, you have dispersion.",
        variables: [
            { symbol: "ω", meaning: "How fast it wiggles" },
            { symbol: "k", meaning: "How many wiggles per meter" }
        ]
    },
    {
        id: 10,
        type: "quiz",
        question: "If a wave packet spreads out, what happens to the 'location' of the particle it represents?",
        options: [
            "It becomes easier to find.",
            "It stays in the exact same spot.",
            "It becomes 'fuzzier' and harder to pin down.",
            "The particle disappears into another dimension."
        ],
        correctIndex: 2,
        explanation: "Since the packet is wider, the particle could be anywhere inside that width. Its position is less certain!"
    },
    {
        id: 11,
        type: "true-false",
        statement: "Dispersion only happens in water and glass; it never happens to electrons.",
        isTrue: false,
        explanation: "False! In Quantum Mechanics, electron wave-packets disperse almost all the time. It is one of the biggest challenges in making tiny computers!"
    },
    {
        id: 12,
        type: "summary",
        title: "Mastery Recap",
        recap: [
            "Dispersion is waves of different speeds drifting apart.",
            "It causes wave packets to get wider and shorter over time.",
            "It makes the position of a particle 'blurry'.",
            "Vacuums are the only place where dispersion is zero."
        ]
    },
    {
        id: 13,
        type: "outro",
        title: "The Big Picture!",
        text: "You've mastered the mystery of Dispersion. You now know why light splits into rainbows and why particles eventually spread their wings and fly away!"
    }
];
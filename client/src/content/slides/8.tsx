import React from "react";
import { 
  Wind, 
  AlignJustify, 
  Gauge, 
  Activity, 
  Music, 
  ArrowRight,
  Zap
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Interactive Wave Mixer (The Core Concept)
const runInterferenceSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let mouseX = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        // Phase offset determined by mouse (0 to Math.PI * 2)
        const phaseOffset = mouseX * Math.PI * 2;

        const drawWave = (color: string, offset: number, alpha: number) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 2;
            for (let x = 0; x < w; x++) {
                const y = cy + Math.sin(x * 0.02 + t + offset) * 40;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        // 1. Wave A (Static Phase)
        drawWave('#60a5fa', 0, 0.5); 
        // 2. Wave B (Mouse Controlled Phase)
        drawWave('#fbbf24', phaseOffset, 0.5);

        // 3. The Result (Sum of A and B)
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.globalAlpha = 1;
        ctx.lineWidth = 4;
        for (let x = 0; x < w; x++) {
            const y1 = Math.sin(x * 0.02 + t) * 40;
            const y2 = Math.sin(x * 0.02 + t + phaseOffset) * 40;
            const yResult = cy + (y1 + y2);
            if (x === 0) ctx.moveTo(x, yResult); else ctx.lineTo(x, yResult);
        }
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText("Blue & Yellow = MEETING WAVES", 20, 30);
        ctx.fillStyle = '#4ade80';
        ctx.fillText("GREEN = THE COMBINED RESULT", 20, 50);
        ctx.fillStyle = '#71717a';
        ctx.fillText("Slide mouse to align waves!", 20, h - 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
};

// 2. Headphone Cancellation Sim (Real world Destructive)
const runHeadphoneSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.1;

        ctx.clearRect(0, 0, w, h);

        const noiseY = (x: number) => Math.sin(x * 0.05 + t) * 30;
        const antiNoiseY = (x: number) => Math.sin(x * 0.05 + t + Math.PI) * 30;

        // Outside Noise (Red)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x < w/2 - 50; x++) {
            const y = cy + noiseY(x);
            if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // The Headphone Barrier
        ctx.fillStyle = '#27272a';
        ctx.roundRect(w/2 - 50, cy - 80, 100, 160, 20);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText("HEADPHONE", w/2 - 35, cy + 100);

        // Anti-Noise (Yellow) - Generated inside headphone
        ctx.strokeStyle = '#fbbf24';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(w/2, cy);
        ctx.lineTo(w/2 + 40, cy + antiNoiseY(w/2 + 40));
        ctx.stroke();
        ctx.setLineDash([]);

        // Result inside Ear (Flatline)
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w/2 + 50, cy);
        ctx.lineTo(w - 20, cy);
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.fillText("SILENCE", w - 80, cy - 10);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_8: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "Wave Superpowers",
        subtitle: "How waves build up and break down when they meet.",
        icon: <Zap size={80} className="text-yellow-400" />,
        meta: "Wave Physics"
    },
    {
        id: 2,
        type: "quote",
        text: "Waves do not knock each other over like people do. They simply pass through each other, adding their heights as they go.",
        author: "The Addition Rule"
    },
    {
        id: 3,
        type: "concept-split",
        title: "The 'Meeting' Rule",
        leftContent: "When two waves meet at the same spot, they don't bounce off each other. They share the space! Think of it like two ghosts walking through each other.",
        rightPoints: [
            "Waves occupy the same space",
            "They help or hurt each other",
            "Then they move on like nothing happened"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "The Wave Mixer",
        description: "Align the yellow and blue waves. When they match perfectly, they build a giant green wave. When they clash, they vanish!",
        run: runInterferenceSim
    },
    {
        id: 5,
        type: "concept-list",
        title: "Constructive (The Builder)",
        context: "This is when waves are 'In Sync'. They work together to get bigger.",
        items: [
            "Peak meets Peak (High + High = Super High)",
            "Valley meets Valley (Low + Low = Super Low)",
            "Result: A much stronger, louder, or brighter wave."
        ]
    },
    {
        id: 6,
        type: "process",
        title: "Building a Giant Wave",
        steps: [
            { label: "Approach", desc: "Two small ripples move toward each other." },
            { label: "Overlap", desc: "Their peaks land on the exact same spot at the same time." },
            { label: "Addition", desc: "For a split second, they add their strengths together." },
            { label: "Giant Pulse", desc: "A single wave twice as tall appears!" }
        ]
    },
    {
        id: 7,
        type: "concept-list",
        title: "Destructive (The Destroyer)",
        context: "This is when waves are 'Out of Sync'. They fight each other.",
        items: [
            "Peak meets Valley (Up + Down = Zero)",
            "They 'cancel' each other out.",
            "Result: Silence, darkness, or a flat surface."
        ]
    },
    {
        id: 8,
        type: "comparison",
        title: "The Tug-of-War",
        leftTitle: "Constructive",
        leftPoints: ["Waves 'Team Up'", "Peak + Peak", "Result is LOUDER / Brighter", "Example: Surround Sound"],
        rightTitle: "Destructive",
        rightPoints: ["Waves 'Cancel Out'", "Peak + Valley", "Result is QUIET / Dark", "Example: Noise-Canceling"]
    },
    {
        id: 9,
        type: "simulation",
        title: "Noise-Canceling Magic",
        description: "How your headphones work: They listen to outside noise (Red) and create a 'Mirror Wave' (Yellow) to kill it.",
        run: runHeadphoneSim
    },
    {
        id: 10,
        type: "equation",
        latex: "1 + (-1) = 0",
        description: "This is the 'Math' of destructive interference. If one wave pulls up (+1) and the other pulls down (-1), the net result is zero.",
        variables: [
            { symbol: "Peak", meaning: "The +1 part of the wave" },
            { symbol: "Valley", meaning: "The -1 part of the wave" }
        ]
    },
    {
        id: 11,
        type: "quiz",
        question: "You have two speakers playing the same song. If you stand in a spot where a Peak from Speaker A meets a Valley from Speaker B, what do you hear?",
        options: [
            "The song gets twice as loud.", 
            "Nothing (or very quiet sound).", 
            "The song plays in reverse.", 
            "The speakers explode."
        ],
        correctIndex: 1,
        explanation: "Since a Peak (+1) and a Valley (-1) meet, they cancel out! This is destructive interference."
    },
    {
        id: 12,
        type: "true-false",
        statement: "In destructive interference, the energy of the waves is destroyed forever.",
        isTrue: false,
        explanation: "Energy can't be destroyed! The waves just cancel each other in that specific spot. They will continue moving and reappear on the other side."
    },
    {
        id: 13,
        type: "summary",
        title: "Interference Recap",
        recap: [
            "Waves can overlap and share the same space.",
            "Constructive: Waves add up to get bigger (In Sync).",
            "Destructive: Waves subtract to get smaller (Out of Sync).",
            "This is how tech like noise-canceling headphones works."
        ]
    },
    {
        id: 14,
        type: "outro",
        title: "Wave Mastery!",
        text: "Next time you use your headphones, remember: there's a tiny 'Wave War' happening inside your ears to keep things quiet!"
    }
];
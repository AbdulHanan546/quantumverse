import React from 'react';
import { Waves, Volume2, VolumeX, Zap, Music, Mic } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Constructive Interference (The "Mega Wave")
// Shows two waves aligned perfectly (in phase) creating a larger wave
const runConstructiveSim = (canvas) => {
    const ctx = canvas.getContext('2d');
    let offset = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        offset += 0.05;

        ctx.clearRect(0, 0, w, h);

        // Draw Center Line
        ctx.strokeStyle = '#3f3f46';
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        ctx.setLineDash([]);

        // Wave 1 (Top small)
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa'; // Blue
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
            const y = (cy - 100) + Math.sin((x * 0.02) - offset) * 30;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2 (Bottom small - identical)
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa'; // Blue
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
            const y = (cy + 100) + Math.sin((x * 0.02) - offset) * 30;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Plus Sign
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.fillText("+", 50, cy);

        // Result Wave (Middle Big)
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80'; // Green (Result)
        ctx.lineWidth = 5;
        for (let x = 0; x < w; x++) {
            // Adding amplitudes (30 + 30 = 60)
            const y = cy + Math.sin((x * 0.02) - offset) * 60;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.font = '16px sans-serif';
        ctx.fillText("Result: 2x Bigger!", w - 150, cy - 80);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. Destructive Interference (The "Silencer")
// Shows two waves opposite (out of phase) canceling out
const runDestructiveSim = (canvas) => {
    const ctx = canvas.getContext('2d');
    let offset = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        offset += 0.05;

        ctx.clearRect(0, 0, w, h);

        // Draw Center Line
        ctx.strokeStyle = '#3f3f46';
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        ctx.setLineDash([]);

        // Wave 1 (Top small)
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa'; // Blue
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
            const y = (cy - 100) + Math.sin((x * 0.02) - offset) * 30;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2 (Bottom small - OPPOSITE)
        // We add Math.PI to shift it 180 degrees
        ctx.beginPath();
        ctx.strokeStyle = '#f87171'; // Red
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
            const y = (cy + 100) + Math.sin((x * 0.02) - offset + Math.PI) * 30;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Plus Sign
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.fillText("+", 50, cy);

        // Result Wave (Middle Flat)
        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24'; // Yellow
        ctx.lineWidth = 5;
        for (let x = 0; x < w; x++) {
            // sin(a) + sin(a + PI) = 0
            const val1 = Math.sin((x * 0.02) - offset) * 30;
            const val2 = Math.sin((x * 0.02) - offset + Math.PI) * 30;
            const y = cy + (val1 + val2);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '16px sans-serif';
        ctx.fillText("Result: Zero (Silence)", w - 180, cy - 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 3. Pulse Collision
// Shows two pulses moving towards each other and passing through
const runPulseSim = (canvas) => {
    const ctx = canvas.getContext('2d');
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 2;
        if (t > w + 200) t = 0; // Reset loop

        ctx.clearRect(0, 0, w, h);

        // Axis
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

        // Pulse 1 moving Right
        const x1 = t;
        // Pulse 2 moving Left
        const x2 = w - t;

        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 4;
        
        for (let x = 0; x < w; x++) {
            // Gaussian pulse formula: e^(-(x-center)^2 / spread)
            const y1 = 80 * Math.exp(-Math.pow(x - x1, 2) / 3000);
            const y2 = 80 * Math.exp(-Math.pow(x - x2, 2) / 3000);
            
            // Superposition: Add them together!
            const yTotal = cy - (y1 + y2);
            
            if (x === 0) ctx.moveTo(x, yTotal); else ctx.lineTo(x, yTotal);
        }
        ctx.stroke();

        ctx.fillStyle = '#aaa';
        ctx.font = '14px sans-serif';
        ctx.fillText("Watch them merge and pass through", 20, 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const TOPIC_8 = [
    {
        id: 1,
        type: "intro",
        title: "Wave Interference",
        subtitle: "What happens when two waves crash into each other?",
        icon: <Waves size={80} className="text-blue-400" />,
        meta: "Physics • Waves"
    },
    {
        id: 2,
        type: "concept-list",
        title: "Imagine a Pond...",
        context: "You throw two rocks into a calm pond at the same time. Ripples spread out from both rocks. Eventually, the ripples meet.",
        items: [
            "Do they bounce off each other?",
            "Do they crash and stop?",
            "No! They pass right through each other.",
            "But while they overlap, they mix."
        ]
    },
    {
        id: 3,
        type: "quote",
        text: "Interference is just a fancy word for 'adding things up'.",
        author: "Physics Simplified"
    },
    {
        id: 4,
        type: "concept-split",
        title: "The Golden Rule",
        leftContent: "When two waves are in the same place at the same time, we just ADD their heights together. This is called the 'Principle of Superposition' (but let's just call it Adding Waves).",
        rightPoints: [
            "Height A + Height B = Total Height",
            "Sometimes they help each other (Constructive)",
            "Sometimes they fight each other (Destructive)"
        ]
    },
    {
        id: 5,
        type: "simulation",
        title: "Teamwork: Constructive Interference",
        description: "When a Peak meets a Peak, they join forces to make a MEGA peak.",
        run: runConstructiveSim
    },
    {
        id: 6,
        type: "process",
        title: "How Constructive Works",
        steps: [
            { label: "Step 1", desc: "Wave A goes UP." },
            { label: "Step 2", desc: "Wave B goes UP at the exact same time." },
            { label: "Result", desc: "The water (or air) is pushed UP twice as hard." },
            { label: "Analogy", desc: "Like two people pushing a swing at the same time." }
        ]
    },
    {
        id: 7,
        type: "simulation",
        title: " canceling: Destructive Interference",
        description: "When a Peak meets a Valley (Trough), they cancel each other out.",
        run: runDestructiveSim
    },
    {
        id: 8,
        type: "comparison",
        title: "The Two Outcomes",
        leftTitle: "Constructive",
        leftPoints: ["Peak + Peak", "Gets Louder / Brighter", "Waves are 'In Phase'"],
        rightTitle: "Destructive",
        rightPoints: ["Peak + Valley", "Gets Quieter / Darker", "Waves are 'Out of Phase'"]
    },
    {
        id: 9,
        type: "quiz",
        question: "If a wave with height +5 meets a wave with height -5, what is the result?",
        options: ["+10 (Huge wave)", "0 (Flat line)", "-10 (Deep hole)", "+5 (No change)"],
        correctIndex: 1,
        explanation: "Simple math! +5 added to -5 equals 0. They completely destroy each other for that moment."
    },
    {
        id: 10,
        type: "concept-split",
        title: "Real World Magic: Noise Canceling",
        leftContent: "How do those expensive headphones silence the world? They use Destructive Interference! They listen to the noise outside, and create an 'Anti-Noise' wave inside.",
        rightPoints: [
            "Mic hears airplane engine noise",
            "Chip creates an OPPOSITE wave",
            "Noise + Anti-Noise = Silence",
            "Your ears hear nothing"
        ]
    },
    {
        id: 11,
        type: "equation",
        latex: "y_{total} = y_1 + y_2",
        description: "It looks like math, but it just means: The result is the sum of the parts. If one is positive and one is negative, the sum is zero.",
        variables: [
            { symbol: "y", meaning: "Height of the wave" },
            { symbol: "+", meaning: "Just adding them up" }
        ]
    },
    {
        id: 12,
        type: "simulation",
        title: "Passing Through",
        description: "Watch two pulses collide. They mix for a moment, then continue as if nothing happened.",
        run: runPulseSim
    },
    {
        id: 13,
        type: "true-false",
        statement: "After two waves interfere and cancel out, they are destroyed forever.",
        isTrue: false,
        explanation: "False! They only cancel while they overlap. Once they pass each other, they continue moving exactly as they were before."
    },
    {
        id: 14,
        type: "summary",
        title: "Recap: Wave Interference",
        recap: [
            "Interference = Waves mixing together",
            "Constructive = Up + Up = BIGGER (Louder/Brighter)",
            "Destructive = Up + Down = ZERO (Silence/Darkness)",
            "This is how noise-canceling headphones work"
        ]
    },
    {
        id: 15,
        type: "outro",
        title: "Topic Mastered!",
        text: "You now understand how waves can add up to create power, or cancel out to create silence."
    }
];
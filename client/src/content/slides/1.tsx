import React from 'react';
import { Zap, Sun, AlertTriangle, Flame, TrendingUp, DollarSign } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Glowing Iron Simulation (Visualizing Temperature vs Color)
// Demonstrates that as things get hotter, they glow different colors (Red -> White -> Blue)
const runGlowSim = (canvas) => {
    const ctx = canvas.getContext('2d');
    let temp = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        // Oscillate temperature for visual effect
        temp += 0.01;
        const cycle = (Math.sin(temp) + 1) / 2; // 0 to 1

        ctx.clearRect(0, 0, w, h);

        // Interpolate color from Red (cool) to Yellow to White to Blue (hot)
        let r, g, b;
        if (cycle < 0.33) {
            // Red to Orange
            r = 255; g = cycle * 3 * 165; b = 0;
        } else if (cycle < 0.66) {
            // Orange to White
            r = 255; g = 165 + (cycle-0.33)*3*90; b = (cycle-0.33)*3*255;
        } else {
            // White to Blueish
            r = 255 - (cycle-0.66)*3*100; g = 255 - (cycle-0.66)*3*50; b = 255;
        }

        const color = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        const glowSize = 50 + (cycle * 30);

        // Draw Heat Source
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Text Label
        ctx.fillStyle = '#fff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        
        let label = "Warm (Red)";
        if(cycle > 0.3) label = "Hot (Yellow)";
        if(cycle > 0.6) label = "Very Hot (White)";
        if(cycle > 0.8) label = "Super Hot (Blue/UV)";
        
        ctx.fillText(label, w/2, h/2 + 100);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. The Catastrophe Graph
// Visualizing the prediction (Infinite Energy) vs Reality (Bell Curve)
const runGraphSim = (canvas) => {
    const ctx = canvas.getContext('2d');
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.5;
        
        ctx.clearRect(0, 0, w, h);
        
        // Axes
        const originX = 50;
        const originY = h - 50;
        const scaleX = (w - 100) / 100;
        const scaleY = (h - 100) / 100;

        ctx.strokeStyle = '#52525b'; // Zinc 600
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX, 50); // Y axis top
        ctx.lineTo(originX, originY); // Origin
        ctx.lineTo(w - 50, originY); // X axis right
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '14px sans-serif';
        ctx.fillText("Frequency (Color)", w - 120, originY - 10);
        ctx.fillText("Energy", originX + 10, 40);

        // 1. Classical Prediction (The Catastrophe) - Red Line
        // Grows exponentially
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444'; // Red 500
        ctx.lineWidth = 4;
        for (let x = 0; x < 100; x++) {
            // Classical formula ~ x^2 (simplified)
            const yVal = 0.15 * Math.pow(x, 2); 
            const canvasX = originX + x * scaleX;
            const canvasY = originY - yVal * scaleY;
            
            if (canvasY < 0) break; // Don't draw off screen
            
            if (x === 0) ctx.moveTo(canvasX, canvasY);
            else ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();

        // 2. Actual Reality (Planck) - Green Line
        // Goes up then down
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80'; // Green 400
        ctx.lineWidth = 4;
        for (let x = 0; x < 100; x++) {
            // Planck formula approximation x^3 / (e^x - 1)
            // Simplified curve shape: x * e^(-x)
            const xScaled = x * 0.1;
            const yVal = (xScaled * xScaled * xScaled) / (Math.exp(xScaled) - 1) * 35;
            
            const canvasX = originX + x * scaleX;
            const canvasY = originY - (isNaN(yVal) ? 0 : yVal) * scaleY;

            if (x === 0) ctx.moveTo(canvasX, canvasY);
            else ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();

        // Animated Dots
        const dotX = (t % 100);
        
        // Red dot (Catastrophe)
        const redY = 0.15 * Math.pow(dotX, 2);
        if (originY - redY * scaleY > 0) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(originX + dotX * scaleX, originY - redY * scaleY, 6, 0, Math.PI*2);
            ctx.fill();
        }

        // Green dot (Reality)
        const xScaled = dotX * 0.1;
        const greenY = (xScaled * xScaled * xScaled) / (Math.exp(xScaled) - 1) * 35;
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(originX + dotX * scaleX, originY - (isNaN(greenY)?0:greenY) * scaleY, 6, 0, Math.PI*2);
        ctx.fill();

        // Legend
        ctx.fillStyle = '#ef4444';
        ctx.fillText("What Old Physics Predicted (Boom!)", originX + 20, 100);
        ctx.fillStyle = '#4ade80';
        ctx.fillText("What Actually Happens (Safe)", originX + 20, 130);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 3. The "Expensive Energy" Analogy
// Visualizing why high frequency energy is rare (it costs too much!)
const runBudgetSim = (canvas) => {
    const ctx = canvas.getContext('2d');
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.02;
        
        ctx.clearRect(0, 0, w, h);
        
        const centerX = w / 2;
        const centerY = h / 2;

        // Draw "Budget" Box
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(centerX - 150, h - 60, 300, 40);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText("Nature's Energy Budget", centerX, h - 25);

        // Items to buy (Waves)
        
        // 1. Cheap Waves (Red/Low Freq) - Cost $1
        const lowCost = 10;
        const lowFreqCount = 8;
        for(let i=0; i<lowFreqCount; i++) {
            const x = centerX - 120 + Math.sin(t + i)*10;
            const y = centerY + Math.cos(t * 2 + i)*10 + 50;
            
            ctx.fillStyle = '#ef4444'; // Red
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI*2); // Small ball
            ctx.fill();
        }
        ctx.fillStyle = '#ef4444';
        ctx.fillText("Cheap (Low Freq)", centerX - 120, centerY + 90);

        // 2. Medium Waves (Green/Med Freq) - Cost $50
        const medFreqCount = 3;
        for(let i=0; i<medFreqCount; i++) {
            const x = centerX + Math.sin(t + i)*5;
            const y = centerY + Math.cos(t + i)*5;
            
            ctx.fillStyle = '#4ade80'; // Green
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI*2); // Medium ball
            ctx.fill();
        }
        ctx.fillStyle = '#4ade80';
        ctx.fillText("Pricey (Med Freq)", centerX, centerY + 50);

        // 3. Expensive Waves (UV/High Freq) - Cost $1000
        // We can't afford these!
        ctx.fillStyle = '#8b5cf6'; // Violet
        ctx.beginPath();
        ctx.arc(centerX + 120, centerY - 50, 40, 0, Math.PI*2); // Giant ball
        ctx.fill();
        
        // Cross it out
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX + 90, centerY - 80);
        ctx.lineTo(centerX + 150, centerY - 20);
        ctx.moveTo(centerX + 150, centerY - 80);
        ctx.lineTo(centerX + 90, centerY - 20);
        ctx.stroke();

        ctx.fillStyle = '#8b5cf6';
        ctx.fillText("Too Expensive!", centerX + 120, centerY + 20);
        ctx.fillText("(High Freq)", centerX + 120, centerY + 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};


/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_18 = [
    {
        id: "18-intro",
        type: "intro",
        title: "The Ultraviolet Catastrophe",
        subtitle: "The fancy name for the day Physics almost broke.",
        icon: <AlertTriangle size={80} className="text-red-400" />,
        meta: "Modern Physics • Quantum Origins"
    },
    {
        id: "18-context-1",
        type: "concept-list",
        title: "The Setup: Hot Things Glow",
        context: "Before we break physics, let's look at something simple. When you heat stuff up, it glows.",
        items: [
            "A stove element turns red",
            "A lightbulb filament turns white",
            "Stars can be red, white, or blue",
            "This light is called 'Blackbody Radiation'"
        ]
    },
    {
        id: "18-sim-1",
        type: "simulation",
        title: "Heat = Color",
        description: "Watch what happens to the color as the temperature goes up. It moves from Red (Low Energy) to Blue (High Energy).",
        run: runGlowSim
    },
    {
        id: "18-problem-intro",
        type: "concept-split",
        title: "The Old Rules (Classical Physics)",
        leftContent: "In the year 1900, scientists thought light was just a wave, like water. They thought if you put energy in, you could make waves of ANY size equally easily.",
        rightPoints: [
            "Heat creates light waves",
            "Any frequency is allowed",
            "More heat = More waves",
            "This logic had a HUGE flaw"
        ]
    },
    {
        id: "18-sim-2",
        type: "simulation",
        title: "The Prediction vs. Reality",
        description: "The Red Line is what old math predicted. The Green Line is what actually happens. Notice the Red Line goes up forever!",
        run: runGraphSim
    },
    {
        id: "18-explanation-1",
        type: "comparison",
        title: "The Catastrophe Explained",
        leftTitle: "The Prediction",
        leftPoints: [
            "As frequency gets higher (UV/X-Ray)",
            "Energy shoots to INFINITY",
            "A toaster would blast deadly X-rays"
        ],
        rightTitle: "The Reality",
        rightPoints: [
            "Energy goes up, then drops",
            "High frequency light is rare",
            "Safe to make toast",
            "The universe is not destroyed"
        ]
    },
    {
        id: "18-hero",
        type: "quote",
        text: "The universe does not allow infinite energy in your toaster.",
        author: "Physics (Probably)"
    },
    {
        id: "18-solution-1",
        type: "process",
        title: "Max Planck to the Rescue",
        steps: [
            { label: "The Idea", desc: "Planck guessed that energy isn't a continuous stream (like water)." },
            { label: "The Fix", desc: "He said energy comes in little packets called 'Quanta' (like rain drops)." },
            { label: "The Rule", desc: "High frequency light comes in HUGE packets. Low frequency comes in TINY packets." }
        ]
    },
    {
        id: "18-analogy-setup",
        type: "intro",
        title: "The Money Analogy",
        subtitle: "How to understand Quantum Mechanics using your wallet.",
        icon: <DollarSign size={80} className="text-green-400" />,
        meta: "Visualization"
    },
    {
        id: "18-sim-3",
        type: "simulation",
        title: "Nature's Energy Budget",
        description: "Nature has a limited budget. Red light 'costs' pennies. UV light 'costs' gold bars.",
        run: runBudgetSim
    },
    {
        id: "18-analogy-text",
        type: "concept-split",
        title: "Why the Curve Drops",
        leftContent: "Imagine you have $100 to give away. You want to buy 'Light Modes'.",
        rightPoints: [
            "Red Light costs $1. You buy 100. (Lots of light!)",
            "Blue Light costs $20. You buy 5. (Some light)",
            "UV Light costs $1000. You buy 0. (No light!)"
        ]
    },
    {
        id: "18-logic-summary",
        type: "true-false",
        statement: "Because UV light 'packets' are so expensive (high energy), it is very hard for Nature to create them casually.",
        isTrue: true,
        explanation: "Correct! This is why the graph drops to zero on the right side. The 'cost' (energy per packet) becomes too high to pay."
    },
    {
        id: "18-equation",
        type: "equation",
        latex: "E = hf",
        description: "This simple equation saved Physics. Energy (E) equals Frequency (f) times a constant (h).",
        variables: [
            { symbol: "E", meaning: "Energy of the packet" },
            { symbol: "f", meaning: "Frequency (Color)" },
            { symbol: "h", meaning: "Planck's Constant (The price tag)" }
        ]
    },
    {
        id: "18-quiz-1",
        type: "quiz",
        question: "Based on Planck's discovery, which light color has the biggest 'packets' of energy?",
        options: ["Red (Low Frequency)", "Green (Medium Frequency)", "Violet (High Frequency)", "Radio Waves"],
        correctIndex: 2,
        explanation: "Higher Frequency = Higher Energy per packet. Violet/UV is high frequency, so its packets are 'heavy' and 'expensive'."
    },
    {
        id: "18-summary",
        type: "summary",
        recap: [
            "Classical physics predicted infinite energy (The Catastrophe)",
            "Planck fixed it by saying energy comes in 'packets' (Quanta)",
            "High frequency packets are too 'expensive' to make easily",
            "This discovery started Quantum Mechanics"
        ]
    },
    {
        id: "18-outro",
        type: "outro",
        title: "Physics Saved!",
        text: "You now understand the birth of Quantum Mechanics. The world is grainy, not smooth!"
    }
];
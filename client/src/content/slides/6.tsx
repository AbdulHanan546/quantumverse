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
import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Great Medium Race
// Visualizes a pulse traveling through Gas (Slow/Sparse) vs Solid (Fast/Connected)
const runMediumRaceSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    
    // Pulse positions
    let xGas = 0;
    let xLiquid = 0;
    let xSolid = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const laneH = h / 3;

        // Speeds (Pixels per frame)
        // Solids are fastest because atoms are linked tightly (like a steel rod)
        // Gases are slowest because atoms are far apart (like shouting across a field)
        xGas += 2;
        xLiquid += 5;
        xSolid += 12;

        // Loop
        if (xGas > w) xGas = 0;
        if (xLiquid > w) xLiquid = 0;
        if (xSolid > w) xSolid = 0;

        ctx.clearRect(0, 0, w, h);

        // --- Lane 1: Gas (Sparse Particles) ---
        ctx.fillStyle = '#27272a'; // Lane BG
        ctx.fillRect(0, 0, w, laneH - 2);
        
        ctx.fillStyle = '#fff';
        ctx.fillText("GAS (Air)", 10, 20);
        
        // Draw Particles (Sparse)
        ctx.fillStyle = '#71717a';
        for(let i=0; i<w; i+=40) {
            ctx.beginPath(); ctx.arc(i, laneH/2, 3, 0, Math.PI*2); ctx.fill();
        }
        // Draw Pulse
        ctx.beginPath();
        ctx.arc(xGas, laneH/2, 15, 0, Math.PI*2);
        ctx.fillStyle = '#60a5fa'; // Blue pulse
        ctx.fill();


        // --- Lane 2: Liquid (Medium) ---
        ctx.fillStyle = '#27272a';
        ctx.fillRect(0, laneH, w, laneH - 2);

        ctx.fillStyle = '#fff';
        ctx.fillText("LIQUID (Water)", 10, laneH + 20);

        // Draw Particles (Closer)
        ctx.fillStyle = '#71717a';
        for(let i=0; i<w; i+=20) {
            ctx.beginPath(); ctx.arc(i, laneH + laneH/2, 4, 0, Math.PI*2); ctx.fill();
        }
        // Draw Pulse
        ctx.beginPath();
        ctx.arc(xLiquid, laneH + laneH/2, 15, 0, Math.PI*2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();


        // --- Lane 3: Solid (Dense/Connected) ---
        ctx.fillStyle = '#27272a';
        ctx.fillRect(0, laneH*2, w, laneH);

        ctx.fillStyle = '#fff';
        ctx.fillText("SOLID (Steel)", 10, laneH*2 + 20);

        // Draw Particles (Connected lines)
        ctx.strokeStyle = '#52525b';
        ctx.beginPath(); ctx.moveTo(0, laneH*2 + laneH/2); ctx.lineTo(w, laneH*2 + laneH/2); ctx.stroke();
        
        ctx.fillStyle = '#a1a1aa'; // Metallic
        for(let i=0; i<w; i+=10) {
            ctx.beginPath(); ctx.arc(i, laneH*2 + laneH/2, 5, 0, Math.PI*2); ctx.fill();
        }
        // Draw Pulse
        ctx.beginPath();
        ctx.arc(xSolid, laneH*2 + laneH/2, 15, 0, Math.PI*2);
        ctx.fillStyle = '#4ade80'; // Green pulse (Winning)
        ctx.fill();

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: Tension on a String
// Toggles between Loose (Slow) and Tight (Fast)
const runTensionSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;
    
    // Wave properties
    let pulseX = 0;
    let isTight = false;
    let speed = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t++;

        // Reset Logic
        if (pulseX > w + 100 || t === 1) {
            pulseX = -50;
            isTight = !isTight; // Toggle mode
            speed = isTight ? 15 : 4; // Fast vs Slow
        }

        pulseX += speed;

        ctx.clearRect(0, 0, w, h);

        // Draw Label
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        if (isTight) {
            ctx.fillStyle = "#4ade80";
            ctx.fillText("HIGH TENSION (Tight String)", w/2, 40);
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#fff";
            ctx.fillText("Particles pull each other harder -> Faster Wave", w/2, 70);
        } else {
            ctx.fillStyle = "#f472b6";
            ctx.fillText("LOW TENSION (Loose String)", w/2, 40);
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#fff";
            ctx.fillText("Lazy pull -> Slower Wave", w/2, 70);
        }

        // Draw String
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = isTight ? "#4ade80" : "#f472b6"; // Green vs Pink

        for (let x = 0; x < w; x++) {
            // Gaussian Pulse formula: y = A * e^(-(x-b)^2 / 2c^2)
            const dist = x - pulseX;
            const width = 40;
            const height = 100;
            const y = cy - height * Math.exp(-(dist*dist)/(2*width*width));
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw "Hand" pulling the string
        ctx.fillStyle = '#fff';
        ctx.fillRect(w - 20, cy - 10, 20, 20);
        if (isTight) {
            // Draw tension arrows
            ctx.fillText("<<< PULLING", w - 80, cy + 40);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_6: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Wave Speed",
        subtitle: "Why sound travels faster through a steel pipe than through the air.",
        icon: <Gauge size={80} className="text-yellow-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "concept-runner",
        type: "concept-split",
        title: "The Beach Runner",
        leftContent: "Imagine you are running. Your speed depends on what you are running ON. Running on solid concrete is fast. Running on loose sand is slow.",
        rightPoints: [
            "Waves are the same!",
            "They don't choose their speed.",
            "The MEDIUM (material) decides the speed."
        ]
    },
    {
        id: "analogy-dominoes",
        type: "concept-list",
        title: "The Domino Analogy",
        context: "Think of particles like dominoes.",
        items: [
            "Gas: Dominoes are far apart. It takes time for one to hit the next.",
            "Solid: Dominoes are touching. If you push one, the last one moves almost instantly.",
            "Conclusion: Closer connection = Faster Wave."
        ]
    },
    {
        id: "sim-medium-race",
        type: "simulation",
        title: "The Great Medium Race",
        description: "We triggered a pulse at the same time. Watch who wins. The Solid (Steel) wins because the particles are locked together tightly.",
        run: runMediumRaceSim
    },
    {
        id: "quiz-space",
        type: "quiz",
        question: "Based on what you just saw, what is the speed of sound in outer space (a vacuum)?",
        options: [
            "Super fast (Speed of light)",
            "Very slow",
            "Zero (No sound)",
            "Same as air"
        ],
        correctIndex: 2,
        explanation: "Sound needs a medium (particles) to travel. In space, there are no dominoes to knock over. So, the speed is zero."
    },
    {
        id: "concept-tension",
        type: "comparison",
        title: "What about Strings?",
        leftTitle: "Loose String",
        leftPoints: [
            "Low Tension",
            "Lazy particles",
            "Wave moves SLOW"
        ],
        rightTitle: "Tight String",
        rightPoints: [
            "High Tension",
            "Snappy particles",
            "Wave moves FAST"
        ]
    },
    {
        id: "sim-tension",
        type: "simulation",
        title: "Tension & Speed",
        description: "Watch the difference between a Loose string (Pink) and a Tight string (Green).",
        run: runTensionSim
    },
    {
        id: "equation-speed",
        type: "equation",
        latex: "v = f \\lambda",
        description: "The Wave Equation. Since 'v' is fixed by the medium, if you change Frequency (f), the Wavelength (λ) MUST change to keep the balance.",
        variables: [
            { symbol: "v", meaning: "Speed (Decided by Medium)" },
            { symbol: "f", meaning: "Frequency (Pitch)" },
            { symbol: "λ", meaning: "Wavelength (Distance)" }
        ]
    },
    {
        id: "true-false-shout",
        type: "true-false",
        statement: "If you shout LOUDER, the sound will travel faster to your friend.",
        isTrue: false,
        explanation: "False! Loudness (Amplitude) does not change speed. Only the air (medium) temperature or density changes the speed. A whisper and a scream travel at the same speed."
    },
    {
        id: "summary",
        type: "summary",
        title: "Key Takeaways",
        recap: [
            "Speed depends on the Medium, not the source.",
            "Solids > Liquids > Gases (usually) for sound speed.",
            "Tension increases wave speed on strings.",
            "In a vacuum, sound speed is zero."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Lesson Complete",
        text: "You now know why you see lightning before you hear thunder!"
    }
];
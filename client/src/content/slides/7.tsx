import React from "react";
import { 
  GitMerge, 
  Layers, 
  XCircle, 
  PlusCircle, 
  ArrowRightLeft, 
  Activity, 
  Ghost
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Ghost Crossing
// Two pulses approaching, crossing, and leaving unchanged
const runGhostSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t += 3;
        if (t > w + 200) t = 0; // Loop

        ctx.clearRect(0, 0, w, h);

        // Calculate positions
        const x1 = t;          // Moving Right
        const x2 = w - t;      // Moving Left

        // Pulse Functions (Gaussian)
        const pulse = (x: number, center: number, height: number) => {
            return height * Math.exp(-Math.pow(x - center, 2) / 2000);
        };

        // --- Draw Individual Ghosts (Dashed lines) ---
        ctx.setLineDash([5, 5]);
        
        // Pulse 1 (Red, Right)
        ctx.beginPath();
        ctx.strokeStyle = '#f87171'; // Red-400
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x+=5) {
            const y = cy - pulse(x, x1, 60);
            if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Pulse 2 (Blue, Left)
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa'; // Blue-400
        for (let x = 0; x < w; x+=5) {
            const y = cy - pulse(x, x2, 60); // Same height
            if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // --- Draw The Result (Superposition) ---
        // This is the "Real" string
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80'; // Green
        ctx.lineWidth = 5;
        for (let x = 0; x < w; x++) {
            // Y = y1 + y2
            const y1 = pulse(x, x1, 60);
            const y2 = pulse(x, x2, 60);
            const yTotal = cy - (y1 + y2);
            if (x===0) ctx.moveTo(x,yTotal); else ctx.lineTo(x,yTotal);
        }
        ctx.stroke();

        // Labels
        if (Math.abs(x1 - x2) < 50) {
            ctx.fillStyle = '#4ade80';
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("SUPERPOSITION!", w/2, cy + 80);
            ctx.font = "14px sans-serif";
            ctx.fillStyle = '#fff';
            ctx.fillText("(Adding Up)", w/2, cy + 100);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: Constructive vs Destructive
// Two continuous waves adding up to be huge or zero
const runInterferenceSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;
    let phaseShift = 0; // Controlled by time to sweep
    
    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t += 0.05;
        // Oscillate phase shift from 0 (Constructive) to PI (Destructive)
        phaseShift = (Math.sin(t * 0.5) + 1) * Math.PI / 2; // 0 to PI

        ctx.clearRect(0, 0, w, h);

        // Draw Wave 1 (Red)
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x<w; x++) {
            const y = cy + Math.sin(x*0.05 - t * 2) * 40;
            if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Draw Wave 2 (Blue) - Shifted
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.beginPath();
        for(let x=0; x<w; x++) {
            // Add phaseShift here
            const y = cy + Math.sin(x*0.05 - t * 2 + phaseShift) * 40;
            if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Draw Result (Green) - The Sum
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 5;
        ctx.beginPath();
        let maxAmp = 0;
        for(let x=0; x<w; x++) {
            const y1 = Math.sin(x*0.05 - t * 2) * 40;
            const y2 = Math.sin(x*0.05 - t * 2 + phaseShift) * 40;
            const ySum = cy + (y1 + y2);
            if(x===0) ctx.moveTo(x,ySum); else ctx.lineTo(x,ySum);
            maxAmp = Math.max(maxAmp, Math.abs(y1+y2));
        }
        ctx.stroke();

        // Label Logic
        ctx.textAlign = "center";
        ctx.font = "bold 20px sans-serif";
        const factor = phaseShift / Math.PI; // 0 to 1 roughly
        
        if (maxAmp > 70) {
            ctx.fillStyle = "#4ade80";
            ctx.fillText("CONSTRUCTIVE (Louder)", w/2, 50);
        } else if (maxAmp < 10) {
            ctx.fillStyle = "#ef4444";
            ctx.fillText("DESTRUCTIVE (Silent)", w/2, 50);
        } else {
            ctx.fillStyle = "#fbbf24";
            ctx.fillText("PARTIAL INTERFERENCE", w/2, 50);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_7: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Principle of Superposition",
        subtitle: "What happens when two waves crash into each other? (Hint: They don't crash).",
        icon: <Layers size={80} className="text-purple-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "analogy-ghosts",
        type: "concept-split",
        title: "The Ghost Theory",
        leftContent: "If two cars drive at each other, they crash and stop. But waves are not solid objects. They are like ghosts passing through a wall.",
        rightPoints: [
            "Waves pass through each other",
            "They don't bounce off",
            "They stack up while overlapping"
        ]
    },
    {
        id: "sim-crossing",
        type: "simulation",
        title: "The Ghost Crossing",
        description: "Watch the Red and Blue pulses. When they meet, they form a BIG Green pulse. Then they continue as if nothing happened.",
        run: runGhostSim
    },
    {
        id: "concept-math",
        type: "equation",
        latex: "y_{total} = y_1 + y_2",
        description: "This is the 'Principle of Superposition'. At any point, the total displacement is simply the sum of the individual displacements.",
        variables: [
            { symbol: "y_total", meaning: "Resulting Wave Height" },
            { symbol: "y_1", meaning: "Height of Wave 1" },
            { symbol: "y_2", meaning: "Height of Wave 2" }
        ]
    },
    {
        id: "concept-types",
        type: "comparison",
        title: "Two Types of Meetings",
        leftTitle: "Constructive (Teamwork)",
        leftPoints: [
            "Crest meets Crest",
            "They add up (+ +)",
            "Result: BIGGER Wave",
            "Example: Loud Sound"
        ],
        rightTitle: "Destructive (Battle)",
        rightPoints: [
            "Crest meets Trough",
            "They cancel out (+ -)",
            "Result: FLAT Line",
            "Example: Noise Canceling"
        ]
    },
    {
        id: "sim-interference",
        type: "simulation",
        title: "Interference in Action",
        description: "Watch how the Green wave changes. When Red and Blue align perfectly, it's huge. When they are opposite, it disappears.",
        run: runInterferenceSim
    },
    {
        id: "quiz-headphones",
        type: "quiz",
        question: "How do Noise Canceling Headphones work?",
        options: [
            "They block sound with thick foam",
            "They create a 'Anti-Sound' wave to destroy noise",
            "They absorb sound heat",
            "They reflect sound back"
        ],
        correctIndex: 1,
        explanation: "They listen to the outside noise and create a wave exactly inverted (Trough for every Crest). The superposition result is Zero (Silence)."
    },
    {
        id: "true-false-loss",
        type: "true-false",
        statement: "When two waves cancel each other out (Destructive Interference), the energy disappears forever.",
        isTrue: false,
        explanation: "False! Energy is conserved. It is just redistributed to other parts of the medium or stored momentarily as potential energy. After they pass, the energy returns."
    },
    {
        id: "process-steps",
        type: "process",
        title: "The Life of a Meeting",
        steps: [
            { label: "1. Approach", desc: "Two waves travel towards the same spot." },
            { label: "2. Overlap", desc: "They occupy the same space at the same time." },
            { label: "3. Superpose", desc: "Their heights add up mathematically (Algebraic Sum)." },
            { label: "4. Depart", desc: "They separate and continue unchanged." }
        ]
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Summary",
        recap: [
            "Superposition = Adding waves together.",
            "Constructive = Bigger wave (Crest + Crest).",
            "Destructive = Smaller/Zero wave (Crest + Trough).",
            "Waves pass through each other without damage."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Topic Completed",
        text: "You now understand how light, sound, and even quantum particles interact with each other!"
    }
];
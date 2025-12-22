import React from "react";
import { 
  Zap, 
  MoveHorizontal, 
  Activity, 
  Anchor, 
  RefreshCcw,
  Smile
} from "lucide-react";
// /* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Circle Maker (Angular Frequency)
// Visualizes how spinning around a circle creates a wave (Frequency)
const runCircleWaveSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    const trail: number[] = [];

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w * 0.25; // Circle on left
        const cy = h / 2;
        const radius = 60;
        
        // Speed of rotation (Angular Frequency)
        const omega = 0.05; 
        t += omega;

        const x = cx + radius * Math.cos(t);
        const y = cy + radius * Math.sin(t);

        // Track trail for wave
        trail.unshift(y);
        if (trail.length > w * 0.6) trail.pop();

        ctx.clearRect(0, 0, w, h);

        // 1. Draw The Circle
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Draw The "Hand" (Radius)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#71717a';
        ctx.stroke();

        // 3. Draw The Rotating Dot
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // 4. Draw Connection Line to Wave
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, y);
        ctx.lineTo(w * 0.4, y);
        ctx.strokeStyle = '#4ade80';
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // 5. Draw The Wave
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        for (let i = 0; i < trail.length; i++) {
            ctx.lineTo((w * 0.4) + i * 2, trail[i]);
        }
        ctx.stroke();
        
        // Text Labels
        ctx.fillStyle = '#fff';
        ctx.fillText("Circular Motion", cx - 40, cy + radius + 30);
        ctx.fillText("Wave Motion", w * 0.5, cy + radius + 30);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: The Phase Race (Phase Difference)
// Two dots running on a track. One is ahead of the other.
const runPhaseRaceSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 100;
        
        t += 0.03;
        
        // Dot 1 (Green)
        const angle1 = t;
        const x1 = cx + radius * Math.cos(angle1);
        const y1 = cy + radius * Math.sin(angle1);

        // Dot 2 (Blue) - Starts 90 degrees (PI/2) ahead
        // This simulates "Phase Difference"
        const phaseShift = Math.PI / 2; 
        const angle2 = t + phaseShift;
        const x2 = cx + radius * Math.cos(angle2);
        const y2 = cy + radius * Math.sin(angle2);

        ctx.clearRect(0, 0, w, h);

        // Track
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Center Pivot
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI*2);
        ctx.fill();

        // Runner 1 (Green)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = '#4ade80'; // Green line
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x1, y1, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("A", x1, y1);

        // Runner 2 (Blue)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#60a5fa'; // Blue line
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x2, y2, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillText("B", x2, y2);

        // Phase Angle visualizer
        ctx.beginPath();
        ctx.arc(cx, cy, 30, angle1, angle2);
        ctx.strokeStyle = '#f472b6'; // Pink
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.fillStyle = '#f472b6';
        ctx.fillText("Phase Diff", cx, cy - 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_2: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Cycles, Circles & Waves",
        subtitle: "Understanding Angular Frequency and Phase without the headache.",
        icon: <RefreshCcw size={80} className="text-blue-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "analogy-pizza",
        type: "concept-split",
        title: "The Pizza Cutter",
        leftContent: "Imagine a pizza cutter wheel rolling across a table. It spins around (Circular Motion) while it moves forward. In Physics, circles and waves are best friends. You can't have one without the other.",
        rightPoints: [
            "One full spin = One Cycle",
            "Spinning faster = Higher Frequency",
            "Where the logo is = The Phase"
        ]
    },
    {
        id: "sim-circle-wave",
        type: "simulation",
        title: "Converting Circles to Waves",
        description: "Watch how the green dot's height creates a wave. The faster it spins, the squigglier the wave gets.",
        run: runCircleWaveSim
    },
    {
        id: "concept-angular-freq",
        type: "comparison",
        title: "Regular Speed vs. Angular Speed",
        leftTitle: "Linear Speed (v)",
        leftPoints: [
            "Moving in a straight line",
            "Measured in meters per second (m/s)",
            "Like a car on a highway"
        ],
        rightTitle: "Angular Frequency (ω)",
        rightPoints: [
            "Spinning in a circle",
            "Measured in radians per second",
            "Like a car on a race track"
        ]
    },
    {
        id: "equation-omega",
        type: "equation",
        latex: "\\omega = 2\\pi f",
        description: "This scary symbol 'ω' (Omega) just means 'Angular Frequency'. Since one full circle is 2π radians, we just multiply the speed (f) by the circle size (2π).",
        variables: [
            { symbol: "ω", meaning: "Angular Frequency (Speed of spin)" },
            { symbol: "f", meaning: "Frequency (Spins per second)" },
            { symbol: "2π", meaning: "One full circle loop" }
        ]
    },
    {
        id: "concept-phase-intro",
        type: "concept-list",
        title: "What is Phase?",
        context: "Phase is just a fancy word for 'Position in the Cycle'. Imagine a clock hand.",
        items: [
            "Start of cycle = 12:00 (0 degrees)",
            "Quarter through = 3:00 (90 degrees)",
            "Halfway through = 6:00 (180 degrees)",
            "Phase answers the question: 'Where is the hand pointing right now?'"
        ]
    },
    {
        id: "sim-phase-diff",
        type: "simulation",
        title: "Phase Difference",
        description: "Look at runner A and B. They are running at the SAME speed, but B is ahead. They have a 'Phase Difference'.",
        run: runPhaseRaceSim
    },
    {
        id: "analogy-runners",
        type: "process",
        title: "The Race Track Analogy",
        steps: [
            { label: "In Phase", desc: "Two runners running side-by-side. They step together." },
            { label: "Out of Phase", desc: "One runner starts a bit ahead. They run at the same speed, but never touch." },
            { label: "Opposite Phase", desc: "One is at the start line, one is exactly halfway around. They are '180 degrees' out of sync." }
        ]
    },
    {
        id: "quiz-phase",
        type: "quiz",
        question: "Two swings are moving back and forth. When Swing A goes forward, Swing B goes backward exactly at the same time. What is their relationship?",
        options: [
            "They are In Phase",
            "They are Out of Phase (Opposite)",
            "They have different Frequencies",
            "They are broken"
        ],
        correctIndex: 1,
        explanation: "This is called being 'Anti-phase' or 180 degrees out of phase. They are doing the exact opposite motion at the same time."
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "Angular Frequency (ω) is just spinning speed.",
            "Phase (ϕ) is just where you are on the circle (like a clock hand).",
            "Phase Difference is the gap between two waves or runners.",
            "One full cycle = 2π radians (360 degrees)."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "You Mastered It!",
        text: "You can now speak the language of waves. Omega, Phi, and Pi aren't just Greek letters anymore—they are parts of a spinning circle!"
    }
];
import React from 'react';
import TopicViewer, { type SlideData } from '../../components/TopicRenderer';
import { Atom, Scale, Zap } from 'lucide-react';
// import { TOPIC_18 } from "../../slides/3"
import { StoryEngine } from '../../components/StoryEngine';
import { planckScript } from '../../content/stories/18';

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Spring Simulation
const runSpringSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2, cy = h / 2;
        t += 0.1;

        ctx.clearRect(0, 0, w, h);
        
        // Physics: x = A cos(wt)
        const x = 150 * Math.cos(t * 0.5);
        
        // Wall
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(cx - 200, cy - 50, 10, 100);

        // Spring
        ctx.beginPath();
        ctx.moveTo(cx - 200, cy);
        for(let i=0; i<=20; i++) {
            const sx = (cx - 200) + ((cx + x - 50) - (cx - 200)) * (i/20);
            const sy = cy + (i%2===0 ? -15 : 15) * (i===0||i===20?0:1);
            ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Block
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.fillRect(cx + x - 50, cy - 50, 100, 100);
        ctx.strokeRect(cx + x - 50, cy - 50, 100, 100);
        
        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. Wave Graph Simulation
const runWaveSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let offset = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h/2;
        offset -= 2;

        ctx.clearRect(0, 0, w, h);
        
        // Axis
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

        // Sine Wave
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        for(let x=0; x<w; x++) {
            const y = cy + Math.sin((x + offset) * 0.02) * 100;
            if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 3. Energy Exchange Bars
const runEnergySim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.05;

        // Energy oscillates
        const ke = Math.sin(t)**2;
        const pe = Math.cos(t)**2;

        ctx.clearRect(0, 0, w, h);
        const barW = Math.min(w * 0.3, 300);
        const cx = w/2 - barW/2;
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Kinetic (Motion)", cx + barW/2, h/2 - 60);
        
        // KE Bar
        ctx.fillStyle = '#27272a';
        ctx.fillRect(cx, h/2 - 50, barW, 20);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(cx, h/2 - 50, barW * ke, 20);

        // Label
        ctx.fillStyle = '#fff';
        ctx.fillText("Potential (Stored)", cx + barW/2, h/2 + 40);

        // PE Bar
        ctx.fillStyle = '#27272a';
        ctx.fillRect(cx, h/2 + 50, barW, 20);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(cx, h/2 + 50, barW * pe, 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const DATA: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "Energy in Oscillations",
        subtitle: "A deep dive into the physics of moving back and forth.",
        icon: <Atom size={80} className="text-green-400" />,
        meta: "Physics 101"
    },
    {
        id: 2,
        type: "quote",
        text: "It doesn't matter how beautiful your theory is, it doesn't matter how smart you are. If it doesn't agree with experiment, it's wrong.",
        author: "Richard Feynman"
    },
    {
        id: 3,
        type: "concept-list",
        title: "What is Oscillation?",
        context: "Oscillation is simply repetitive variation, typically in time, of some measure about a central value.",
        items: [
            "A swinging pendulum",
            "A plucked guitar string",
            "Alternating current (AC) electricity",
            "Atoms vibrating in a crystal"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "Visualizing Motion",
        description: "A block on a frictionless surface attached to a spring. This is Simple Harmonic Motion (SHM).",
        run: runSpringSim
    },
    {
        id: 5,
        type: "concept-split",
        title: "Restoring Force",
        leftContent: "The key to oscillation is the Restoring Force. Whenever the object moves away from the center (equilibrium), a force pulls it back.",
        rightPoints: [
            "Force directs to center",
            "Proportional to displacement",
            "F = -kx (Hooke's Law)"
        ]
    },
    {
        id: 6,
        type: "comparison",
        title: "Linear vs Oscillatory",
        leftTitle: "Linear Motion",
        leftPoints: ["Constant velocity possible", "No return tendency", "Position increases indefinitely"],
        rightTitle: "Oscillatory Motion",
        rightPoints: ["Velocity changes constantly", "Always returns to start", "Bounded within Amplitude"]
    },
    {
        id: 7,
        type: "equation",
        latex: "F = -kx",
        description: "Hooke's Law governs ideal springs. The negative sign is crucial—it means the force opposes the motion.",
        variables: [
            { symbol: "F", meaning: "Restoring Force (N)" },
            { symbol: "k", meaning: "Spring Constant (N/m)" },
            { symbol: "x", meaning: "Displacement (m)" }
        ]
    },
    {
        id: 8,
        type: "quiz",
        question: "If you double the displacement (x), what happens to the restoring force?",
        options: ["It stays the same", "It doubles", "It halves", "It quadruples"],
        correctIndex: 1,
        explanation: "Since F = -kx, Force is directly proportional to displacement. 2x means 2F."
    },
    {
        id: 9,
        type: "true-false",
        statement: "At the equilibrium position (center), the force acting on the object is zero.",
        isTrue: true,
        explanation: "Correct. At x=0, F = -k(0) = 0. The object is not being pushed or pulled, but its inertia carries it through."
    },
    {
        id: 10,
        type: "simulation",
        title: "Energy Conservation",
        description: "Observe how Kinetic Energy (Green) and Potential Energy (Blue) trade places perfectly.",
        run: runEnergySim
    },
    {
        id: 11,
        type: "process",
        title: "The Cycle of Energy",
        steps: [
            { label: "Extreme Point", desc: "Object stops momentarily. All energy is Potential." },
            { label: "Moving In", desc: "Spring pulls object. Potential turns into Kinetic." },
            { label: "Equilibrium", desc: "Spring is relaxed. Max speed. All energy is Kinetic." },
            { label: "Overshoot", desc: "Inertia carries object past center. Kinetic turns back to Potential." }
        ]
    },
    {
        id: 12,
        type: "concept-list",
        title: "Vocabulary Check",
        items: [
            "Amplitude (A): Max distance from center",
            "Period (T): Time for one full cycle",
            "Frequency (f): Cycles per second (Hz)",
            "Angular Frequency (ω): Radians per second"
        ]
    },
    {
        id: 13,
        type: "equation",
        latex: "E_{total} = \\frac{1}{2}kA^2",
        description: "The Total Energy is determined solely by the stiffness of the spring and how far you initially stretch it.",
        variables: [
            { symbol: "E", meaning: "Total Mechanical Energy" },
            { symbol: "A", meaning: "Amplitude" }
        ]
    },
    {
        id: 14,
        type: "quiz",
        question: "Where is the object moving the fastest?",
        options: ["At the far ends", "Halfway to the center", "At the center (Equilibrium)", "Constant speed"],
        correctIndex: 2,
        explanation: "At the center, all Potential Energy has converted to Kinetic Energy, resulting in maximum velocity."
    },
    {
        id: 15,
        type: "simulation",
        title: "Wave Representation",
        description: "If we plot the position over time, we get a sine wave.",
        run: runWaveSim
    },
    {
        id: 16,
        type: "concept-split",
        title: "Real World: Damping",
        leftContent: "In reality, perpetual motion machines don't exist. Friction and air resistance steal energy from the system over time.",
        rightPoints: [
            "Amplitude decreases over time",
            "Energy lost as Heat",
            "Eventually stops completely"
        ]
    },
    {
        id: 17,
        type: "comparison",
        title: "Ideal vs Real",
        leftTitle: "Undamped (Ideal)",
        leftPoints: ["Energy conserved forever", "Constant Amplitude", "Goes on to infinity"],
        rightTitle: "Damped (Real)",
        rightPoints: ["Energy decays", "Amplitude shrinks", "Stops eventually"]
    },
    {
        id: 18,
        type: "true-false",
        statement: "A car's shock absorbers are designed to be an undamped system.",
        isTrue: false,
        explanation: "False! You WANT damping in a car. Otherwise, after one bump, the car would bounce up and down forever."
    },
    {
        id: 19,
        type: "summary",
        title: "Mastery Checklist",
        recap: [
            "Oscillation is periodic motion around a center",
            "Restoring Force drives the motion (F=-kx)",
            "Energy is conserved (swaps between K and U)",
            "Total Energy depends on Amplitude squared"
        ]
    },
    {
        id: 20,
        type: "outro",
        title: "Lesson Complete",
        text: "You have completed the module on Energy in Oscillations. Excellent work."
    }
];

// export function Test() {
//   return (
//     // <TopicViewer 
//     //     title="Physics 101: Mechanics"
//     //     slides={TOPIC_18} 
//     //     onComplete={() => alert("Course Finished!")} 
//     // />
//     // <StoryEngine
//     //   title="Archive: Berlin // 1900"
//     //   script={planckScript}
//     //   onFinish={() => console.log("WOW")}
//     // />
//     <HarmonicMotionDemo />
//   );
// }
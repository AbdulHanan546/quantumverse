import React from "react";
import { 
  Battery, 
  Zap, 
  TrendingDown, 
  RefreshCcw, 
  Activity, 
  Thermometer,
  Scale
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Skateboarder (Energy Exchange)
// Visualizes the perfect trade between Height (Potential) and Speed (Kinetic)
const runSkaterSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2 + 50;
        const radius = 150; // Radius of the half-pipe
        
        t += 0.05;
        
        // Physics: Simple Harmonic Motion angle
        // Max angle is roughly 60 degrees (1 radian)
        const maxAngle = 1.0;
        const angle = maxAngle * Math.cos(t);
        
        // Calculate Position
        const ballX = cx + radius * Math.sin(angle);
        const ballY = cy + radius * (1 - Math.cos(angle)); // U-shape parabola approx for visual

        // Calculate Energies (Normalized 0 to 1)
        // Potential depends on height (angle displacement)
        const pe = Math.pow(Math.sin(angle)/Math.sin(maxAngle), 2); 
        // Kinetic is remainder (1 - PE)
        const ke = 1 - pe;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw Half-Pipe Track
        ctx.beginPath();
        // Draw arc from -maxAngle to +maxAngle
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        
        // Manual curve drawing for U-shape
        ctx.moveTo(cx - 150, cy - 50);
        ctx.bezierCurveTo(cx - 50, cy + 150, cx + 50, cy + 150, cx + 150, cy - 50);
        ctx.stroke();

        // 2. Draw The Skater (Ball)
        // We need to map the ball position to that bezier curve approx
        // Simplified: Just use pendulum math relative to a pivot above
        const pivotY = cy - 200;
        const ropeLen = 350;
        const realX = cx + ropeLen * Math.sin(angle);
        const realY = pivotY + ropeLen * Math.cos(angle);

        // Draw Skater
        ctx.beginPath();
        ctx.arc(realX, realY, 15, 0, Math.PI * 2);
        // Color shifts from Blue (Potential) to Green (Kinetic)
        const r = Math.floor(96 + (74 - 96) * ke); // Intepolate colors roughly
        const g = Math.floor(165 + (222 - 165) * ke);
        const b = Math.floor(250 + (128 - 250) * ke);
        ctx.fillStyle = `rgb(${r},${g},${b})`; 
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Draw Energy Bars (HUD)
        const barW = 30;
        const barH = 150;
        const barX = w - 100;
        const barY = h / 2 - 75;

        // Container
        ctx.fillStyle = '#27272a';
        ctx.fillRect(barX, barY, barW * 2 + 10, barH);
        
        // Potential Bar (Blue)
        ctx.fillStyle = '#60a5fa';
        const hPE = barH * pe;
        ctx.fillRect(barX + 5, barY + (barH - hPE), barW, hPE);
        
        // Kinetic Bar (Green)
        ctx.fillStyle = '#4ade80';
        const hKE = barH * ke;
        ctx.fillRect(barX + barW + 5, barY + (barH - hKE), barW, hKE);

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Height", barX + 20, barY + barH + 15);
        ctx.fillText("Speed", barX + 55, barY + barH + 15);
        ctx.fillText("(PE)", barX + 20, barY + barH + 25);
        ctx.fillText("(KE)", barX + 55, barY + barH + 25);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: The Energy Leak (Damping)
// Shows total energy bar shrinking over time
const runDampingSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let maxAmplitude = 1.0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2;
        
        t += 0.1;
        // Damping factor: Amplitude shrinks
        maxAmplitude *= 0.995; 

        // Physics
        const x = cx + (200 * maxAmplitude) * Math.cos(t);
        
        ctx.clearRect(0, 0, w, h);

        // Spring Line
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(x, cy);
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 2;
        
        // Spring coils visual
        for(let i=0; i<x; i+=10) {
           ctx.lineTo(i, cy + (i%20===0 ? 10 : -10));
        }
        ctx.stroke();

        // Block
        ctx.fillStyle = '#ef4444'; // Red for "Heating up"
        ctx.fillRect(x - 25, cy - 25, 50, 50);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x - 25, cy - 25, 50, 50);

        // Total Energy Bar (Shrinking)
        const barW = 200;
        const barH = 20;
        const barX = cx - 100;
        const barY = h - 50;

        // Background Bar
        ctx.fillStyle = '#27272a';
        ctx.fillRect(barX, barY, barW, barH);
        
        // Active Energy
        ctx.fillStyle = '#fbbf24'; // Amber
        ctx.fillRect(barX, barY, barW * maxAmplitude * maxAmplitude, barH); // E ~ A^2

        // Label
        ctx.fillStyle = '#a1a1aa';
        ctx.textAlign = 'center';
        ctx.fillText("Total Mechanical Energy (Leaking...)", cx, barY - 10);
        
        // Heat Particles if moving fast
        if (Math.abs(Math.sin(t)) > 0.5 && maxAmplitude > 0.1) {
             ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
             for(let k=0; k<3; k++) {
                 const px = x + (Math.random()-0.5)*40;
                 const py = cy - 25 + (Math.random()-0.5)*40;
                 ctx.beginPath();
                 ctx.arc(px, py, Math.random()*3, 0, Math.PI*2);
                 ctx.fill();
             }
        }

        if (maxAmplitude < 0.05) {
            ctx.fillStyle = '#fff';
            ctx.font = '20px sans-serif';
            ctx.fillText("STOPPED", cx, cy - 50);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_3: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Energy in Motion",
        subtitle: "How nature trades height for speed (and back again).",
        icon: <Battery size={80} className="text-yellow-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "concept-two-tanks",
        type: "concept-split",
        title: "The Two Accounts",
        leftContent: "Imagine you have two bank accounts. You can transfer money between them freely, but you can't deposit or withdraw cash from the outside. The total money stays the same.",
        rightPoints: [
            "Account 1: Kinetic Energy (Motion)",
            "Account 2: Potential Energy (Height/Spring)",
            "Rule: Total = Account 1 + Account 2"
        ]
    },
    {
        id: "analogy-skater",
        type: "comparison",
        title: "The Skateboarder Analogy",
        leftTitle: "At the Top (Edge)",
        leftPoints: [
            "Stopped for a split second",
            "Zero Speed = Zero Kinetic Energy",
            "Maximum Height = Max Potential Energy"
        ],
        rightTitle: "At the Bottom (Middle)",
        rightPoints: [
            "Moving Fastest",
            "Maximum Speed = Max Kinetic Energy",
            "Zero Height = Zero Potential Energy"
        ]
    },
    {
        id: "sim-skater",
        type: "simulation",
        title: "Watch the Trade-off",
        description: "Focus on the bars on the right. Notice how when Blue (Height) goes down, Green (Speed) goes up. They are trading places.",
        run: runSkaterSim
    },
    {
        id: "quiz-max-speed",
        type: "quiz",
        question: "Based on the simulation, where does the skater have the LEAST amount of Potential Energy?",
        options: [
            "At the very top of the ramp",
            "Halfway down",
            "At the very bottom (middle)",
            "It is always the same"
        ],
        correctIndex: 2,
        explanation: "At the bottom, height is zero. Since Potential Energy depends on height, it hits zero there (and Kinetic Energy hits max)."
    },
    {
        id: "equation-conservation",
        type: "equation",
        latex: "E_{total} = K + U = Constant",
        description: "The 'Law of Conservation of Mechanical Energy'. K is Kinetic (Speed energy), U is Potential (Stored energy). If you add them up at ANY point, you get the same number.",
        variables: [
            { symbol: "E", meaning: "Total Energy (The Bucket)" },
            { symbol: "K", meaning: "Kinetic (Movement)" },
            { symbol: "U", meaning: "Potential (Stored)" }
        ]
    },
    {
        id: "process-cycle",
        type: "process",
        title: "The Energy Cycle",
        steps: [
            { label: "1. The Drop", desc: "Gravity pulls you down. Potential turns into Kinetic." },
            { label: "2. The Floor", desc: "All energy is now Kinetic. You are going super fast." },
            { label: "3. The Rise", desc: "You coast up the other side. Kinetic turns back into Potential." },
            { label: "4. The Stop", desc: "Gravity slows you to a halt at the top. Cycle repeats." }
        ]
    },
    {
        id: "concept-reality",
        type: "concept-split",
        title: "But wait... Reality Check",
        leftContent: "If this were true, a swing would push back and forth forever. Does that happen on a playground? No. Eventually, you stop.",
        rightPoints: [
            "There is a thief!",
            "Friction & Air Resistance",
            "They steal energy and turn it into HEAT",
            "We call this 'Damping'"
        ]
    },
    {
        id: "sim-damping",
        type: "simulation",
        title: "The Energy Leak (Damping)",
        description: "Watch the Yellow bar at the bottom. It represents Total Energy. Friction is slowly 'eating' it, turning it into heat.",
        run: runDampingSim
    },
    {
        id: "true-false-friction",
        type: "true-false",
        statement: "When an oscillator stops due to damping, the energy is destroyed and disappears from the universe.",
        isTrue: false,
        explanation: "False! Energy cannot be destroyed. It just turned into Heat (Thermal Energy) in the air and the spring. It's no longer 'useful' motion, but it still exists."
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Summary",
        recap: [
            "Oscillation is a constant trade between Kinetic and Potential Energy.",
            "Total Mechanical Energy stays constant (in a perfect world).",
            "Top of motion = Max Potential.",
            "Middle of motion = Max Kinetic.",
            "Damping is the loss of energy to Heat (Friction)."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Topic Completed",
        text: "You now understand the hidden economy of energy in moving objects!"
    }
];
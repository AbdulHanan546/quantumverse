import React from "react";
import { 
  Layers, 
  Music, 
  ChefHat, 
  Activity, 
  Sigma, 
  BarChart3,
  AlignJustify,
  Building,
  Expand,
  Combine,
  Wifi
} from "lucide-react";

import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Energy Transport Sim (The Physical Push)
 * Shows a wave pulse physically moving a heavy object at the end.
 */
const runEnergyPushSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        const pulsePos = (t * 100) % (w + 200) - 100;
        const targetX = w - 100;
        
        // Draw the rope/medium
        ctx.beginPath();
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 2;
        for (let x = 0; x < targetX; x++) {
            const dist = x - pulsePos;
            const y = cy + Math.sin(x * 0.05) * Math.exp(-(dist * dist) / 1000) * 60;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // The "Energy Receiver" (A block)
        const hit = Math.abs(pulsePos - targetX) < 20;
        ctx.fillStyle = hit ? '#4ade80' : '#27272a';
        ctx.strokeStyle = hit ? '#fff' : '#4ade80';
        ctx.lineWidth = 2;
        const blockY = cy - 25 + (hit ? -10 : 0);
        ctx.fillRect(targetX, blockY, 50, 50);
        ctx.strokeRect(targetX, blockY, 50, 50);

        ctx.fillStyle = '#fff';
        ctx.fillText("Energy moves the block", targetX - 50, cy + 60);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 2. Information Transport Sim (The Binary Pulse)
 * Shows how pulses represent 1s and 0s to send a message.
 */
const runInfoPulseSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    const message = [1, 0, 1, 1, 0, 1];

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);

        message.forEach((bit, i) => {
            const xBase = (i * 100 + t * 50) % (w + 100) - 50;
            if (bit === 1) {
                // Draw a distinct pulse
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let dx = -40; dx < 40; dx++) {
                    const y = cy - Math.cos(dx * 0.1) * 30 * Math.exp(-(dx * dx) / 400);
                    ctx.lineTo(xBase + dx, y);
                }
                ctx.stroke();
                ctx.fillStyle = '#60a5fa';
                ctx.fillText("1", xBase - 5, cy - 50);
            } else {
                // Draw a flat gap
                ctx.strokeStyle = '#3f3f46';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(xBase - 40, cy);
                ctx.lineTo(xBase + 40, cy);
                ctx.stroke();
                ctx.fillStyle = '#3f3f46';
                ctx.fillText("0", xBase - 5, cy - 20);
            }
        });

        ctx.fillStyle = '#fff';
        ctx.fillText("Pattern = Information", 20, 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 3. The "Fake Speed" Trick (Laser on the Wall)
 * Shows how a dot can move faster than light, but sends no message from side A to B.
 */
const runLaserSweepSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const bottom = h - 50;
        t += 0.01;

        ctx.clearRect(0, 0, w, h);

        const angle = Math.sin(t * 2) * 1.2;
        const dotX = cx + Math.tan(angle) * 200;

        // Laser Source
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(cx, bottom, 10, 0, Math.PI * 2); ctx.fill();

        // Laser Beam
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath(); ctx.moveTo(cx, bottom); ctx.lineTo(dotX, 100); ctx.stroke();

        // The Dot
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'red';
        ctx.beginPath(); ctx.arc(dotX, 100, 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText("The dot moves very fast across the wall...", cx, 40);
        ctx.fillStyle = '#71717a';
        ctx.fillText("But Point A cannot 'talk' to Point B through the dot!", cx, 60);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_16: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "Energy vs. Information",
        subtitle: "How we move power and how we move ideas.",
        icon: <Wifi size={80} className="text-blue-400" />,
        meta: "The Physics of Communication"
    },
    {
        id: 2,
        type: "quote",
        text: "Energy is the ability to do work; Information is the choice of which work to do.",
        author: "Principles of Physics"
    },
    {
        id: 3,
        type: "concept-split",
        title: "The Truck and the Letter",
        leftContent: "Imagine a delivery truck carrying a birthday card. The truck is the ENERGY—it is heavy, burns fuel, and physically moves. The card is the INFORMATION—it is light, but it contains a message that matters.",
        rightPoints: [
            "Energy is the 'Medium' (the Truck)",
            "Information is the 'Pattern' (the Letter)",
            "You need energy to carry information!"
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "Transporting Energy",
        description: "Watch the wave pulse. It carries a physical 'kick' that knocks the block over. This is energy transport—doing work at a distance.",
        run: runEnergyPushSim
    },
    {
        id: 5,
        type: "concept-list",
        title: "What is Information Transport?",
        context: "Information isn't about how hard you hit; it's about the pattern of hits.",
        items: [
            "Morse Code: S-O-S using short and long beeps.",
            "Binary: 1s and 0s sent via fiber optics.",
            "The Internet: Your Wi-Fi uses waves to send memes and videos.",
            "Information is the 'Order' of the energy pulses."
        ]
    },
    {
        id: 6,
        type: "simulation",
        title: "Sending a Message",
        description: "Notice how the waves here aren't just wiggling; they are forming a pattern (1 0 1 1). The receiver reads this pattern to understand the message.",
        run: runInfoPulseSim
    },
    {
        id: 7,
        type: "process",
        title: "The 3 Steps of Info Travel",
        steps: [
            { label: "Encoding", desc: "You turn your thought into a code (like turning 'Hi' into binary 01001000)." },
            { label: "Carrier", desc: "Energy (Light, Electricity, or Sound) carries that code across a distance." },
            { label: "Decoding", desc: "The receiver catches the energy, sees the pattern, and turns it back into 'Hi'." }
        ]
    },
    {
        id: 8,
        type: "comparison",
        title: "The Main Differences",
        leftTitle: "Energy Transport",
        leftPoints: ["Measured in Joules/Watts", "Used to heat things or move them", "Can be 'noise' without meaning"],
        rightTitle: "Information Transport",
        rightPoints: ["Measured in Bits/Bytes", "Used to communicate meaning", "Requires a clever code/pattern"]
    },
    {
        id: 9,
        type: "equation",
        latex: "v \\le c",
        description: "The Golden Rule: No information can ever travel faster than the speed of light ($c$). Energy usually follows this rule too!",
        variables: [
            { symbol: "v", meaning: "Speed of Information" },
            { symbol: "c", meaning: "Speed of Light (300,000 km/s)" }
        ]
    },
    {
        id: 10,
        type: "simulation",
        title: "The Fast Dot Illusion",
        description: "If you flick a laser pointer, the dot moves across the wall 'faster' than the beam. But you can't use that dot to send a secret message from one side of the wall to the other instantly!",
        run: runLaserSweepSim
    },
    {
        id: 11,
        type: "quiz",
        question: "If a giant space-truck crashes into a moon, is that mostly information or energy transport?",
        options: [
            "Information, because it tells us the moon is there.",
            "Energy, because it physically smashes the moon.",
            "Neither, it's just a bad day.",
            "Both equally."
        ],
        correctIndex: 1,
        explanation: "While it 'tells' us something, the primary action is the physical smash—which is a massive transfer of Kinetic Energy."
    },
    {
        id: 12,
        type: "true-false",
        statement: "You can send information from Point A to Point B without sending any energy at all.",
        isTrue: false,
        explanation: "False! Information needs a 'carrier.' Even thoughts in your brain use tiny electrical energy to move information."
    },
    {
        id: 13,
        type: "summary",
        title: "Recap Checklist",
        recap: [
            "Energy is the muscle that does the moving.",
            "Information is the pattern that carries meaning.",
            "Info is always carried BY energy.",
            "Nothing (Energy or Info) moves faster than light."
        ]
    },
    {
        id: 14,
        type: "outro",
        title: "Message Delivered!",
        text: "You've successfully decoded the difference between Energy and Information. You're now ready to understand how the whole digital world wiggles!"
    }
];
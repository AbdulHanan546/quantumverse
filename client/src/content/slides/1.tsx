import React from "react";
import { 
  Zap, 
  MoveHorizontal, 
  Activity, 
  Anchor, 
  RefreshCcw,
  Smile
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types"; // Assuming types are in a local file or same file

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Playground Swing (Pendulum)
// Visualizes the "Back and Forth" motion nicely
const runSwingSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 4; // Pivot point high up
        const length = h * 0.5; // Rope length
        
        t += 0.05;
        
        // Physics: Angle swings back and forth
        const angle = Math.PI / 4 * Math.sin(t); 
        
        const bobX = cx + length * Math.sin(angle);
        const bobY = cy + length * Math.cos(angle);

        ctx.clearRect(0, 0, w, h);

        // Draw The Stand (Pivot)
        ctx.fillStyle = '#71717a';
        ctx.fillRect(cx - 50, cy - 10, 100, 10);

        // Draw String
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#e4e4e7'; // light zinc
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw The "Seat" (Bob)
        ctx.beginPath();
        ctx.arc(bobX, bobY, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80'; // green
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Speed lines (visual effect)
        if (Math.cos(t) > 0.5 || Math.cos(t) < -0.5) {
            ctx.beginPath();
            ctx.arc(bobX - (Math.cos(t)*10), bobY, 20, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.stroke();
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: The Marble in a Bowl
// Visualizes "Restoring Force" - gravity always pulls it to the center
const runBowlSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 1.5;
        const radius = 200; // Bowl radius

        t += 0.06;

        ctx.clearRect(0, 0, w, h);

        // Draw The Bowl (Arc)
        ctx.beginPath();
        ctx.arc(cx, cy - radius + 50, radius, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Calculate Marble Position
        // It oscillates along the arc
        const maxAngle = 0.6; 
        const currentAngle = maxAngle * Math.cos(t) + Math.PI/2; // Offset by 90deg to be at bottom
        
        // Math to place ball on rim
        const ballX = cx + radius * Math.cos(currentAngle); 
        const ballY = (cy - radius + 50) + radius * Math.sin(currentAngle);

        // Draw Center Point (The "Happy Place")
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(cx, cy + 50, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#71717a';
        ctx.fillText("Middle", cx - 20, cy + 70);

        // Draw Force Arrow (Pointing to center)
        const distFromCenter = ballX - cx;
        if (Math.abs(distFromCenter) > 10) {
             ctx.beginPath();
             const arrowDir = distFromCenter > 0 ? -1 : 1;
             ctx.moveTo(ballX, ballY - 40);
             ctx.lineTo(ballX + (40 * arrowDir), ballY - 40);
             ctx.strokeStyle = '#f87171'; // Red arrow showing force
             ctx.lineWidth = 4;
             ctx.stroke();
             // Arrowhead
             ctx.beginPath();
             ctx.fillStyle = '#f87171';
             ctx.lineTo(ballX + (40 * arrowDir), ballY - 40);
             ctx.lineTo(ballX + (30 * arrowDir), ballY - 48);
             ctx.lineTo(ballX + (30 * arrowDir), ballY - 32);
             ctx.fill();
        }

        // Draw Marble
        ctx.beginPath();
        ctx.arc(ballX, ballY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa'; // Blue
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_1: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Science of Swings",
        subtitle: "Why things move back and forth (and why they don't stop immediately).",
        icon: <MoveHorizontal size={80} className="text-green-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "hook-analogy",
        type: "concept-split",
        title: "Have you ever been on a swing?",
        leftContent: "Think about a playground swing. You go up, you stop for a split second, you zoom down fast through the middle, and then you go up the other side.",
        rightPoints: [
            "It repeats the same path",
            "It has a rhythm",
            "This is called Oscillation"
        ]
    },
    {
        id: "sim-1",
        type: "simulation",
        title: "Watch the Swing",
        description: "Notice how it's fastest in the middle and slowest at the ends.",
        run: runSwingSim
    },
    {
        id: "concept-equilibrium",
        type: "comparison",
        title: "The Happy Place (Equilibrium)",
        leftTitle: "The Middle",
        leftPoints: [
            "The swing hangs straight down here",
            "It 'wants' to be here",
            "We call this Equilibrium"
        ],
        rightTitle: "The Edges",
        rightPoints: [
            "Gravity is pulling you back",
            "You are far from the happy place",
            "You have lots of height (Potential Energy)"
        ]
    },
    {
        id: "concept-restoring",
        type: "concept-list",
        title: "The Invisible Rubber Band",
        context: "Why does the swing come back? Why doesn't it just stay up in the air?",
        items: [
            "There is a force pulling you to the middle.",
            "Physicists call this the 'Restoring Force'.",
            "Analogy: It's like a rubber band pulling you home.",
            "The further you go, the harder it pulls!"
        ]
    },
    {
        id: "sim-2",
        type: "simulation",
        title: "The Marble in a Bowl",
        description: "Look at the RED ARROW. It always points to the middle. That is the Restoring Force.",
        run: runBowlSim
    },
    {
        id: "quiz-force",
        type: "quiz",
        question: "Based on the simulation, when is the 'Pull Back' force the strongest?",
        options: [
            "When the marble is in the middle",
            "When the marble is highest up the side",
            "The force is always the same",
            "When the marble stops moving"
        ],
        correctIndex: 1,
        explanation: "Correct! The further you are from the middle, the harder gravity (or the spring) tries to pull you back. In the middle, the force is zero."
    },
    {
        id: "equation-simple",
        type: "equation",
        latex: "F = -kx",
        description: "Don't panic! This just translates to: 'Force = Stiffness × Distance'. The minus sign just means 'Pulling Back' towards the center.",
        variables: [
            { symbol: "x", meaning: "Distance from middle" },
            { symbol: "k", meaning: "How stiff the spring is" },
            { symbol: "-", meaning: "Opposite direction" }
        ]
    },
    {
        id: "concept-inertia",
        type: "concept-split",
        title: "Why don't we stop?",
        leftContent: "If the 'Happy Place' is in the middle, why doesn't the swing just stop there immediately? Why does it overshoot and go to the other side?",
        rightPoints: [
            "Answer: Inertia!",
            "You are moving too fast to stop.",
            "Like running down a hill—you can't just stop instantly at the bottom."
        ]
    },
    {
        id: "process-cycle",
        type: "process",
        title: "The Cycle of a Swing",
        steps: [
            { label: "1. The Edge", desc: "You stop for a moment. Force pulls you in." },
            { label: "2. The Drop", desc: "You speed up. Force gets weaker as you get closer to middle." },
            { label: "3. The Zoom", desc: "You hit the middle at MAX speed! Inertia carries you through." },
            { label: "4. The Climb", desc: "You slow down as you go up the other side." }
        ]
    },
    {
        id: "true-false-friction",
        type: "true-false",
        statement: "If there was absolutely no air resistance or friction, the swing would go on forever.",
        isTrue: true,
        explanation: "True! This is called 'Simple Harmonic Motion'. In real life, friction steals energy, so you eventually stop (Damping), but in pure physics land, it goes forever."
    },
    {
        id: "summary",
        type: "summary",
        title: "What we learned",
        recap: [
            "Equilibrium is the 'Happy Middle' where things want to be.",
            "Restoring Force pulls you back when you leave the middle.",
            "Inertia makes you overshoot the middle.",
            "This back-and-forth dance is called Oscillation."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Great Job!",
        text: "Next time you see a swing, a guitar string, or a clock pendulum, you'll know exactly how it works!"
    }
];
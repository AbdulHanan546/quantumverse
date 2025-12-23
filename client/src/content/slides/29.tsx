import React from 'react';
import { Split, Eye,  HelpCircle, Ghost, Waves } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. THE CYLINDER ANALOGY (Visualizing Duality)
// A cylinder looks like a Square from the side, but a Circle from the front.
// It is BOTH, depending on how you look.
const runCylinderSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h/2;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);

        // Rotation
        const rotation = t;
        
        // Draw 3D Cylinder Wireframe
        const r = 40;
        const hCyl = 100;
        
        // Perspective logic (simplified)
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // Draw Shadow 1 (Square-ish)
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(50, cy - 50, 60, 100);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '14px sans-serif';
        ctx.fillText("Looks like a Particle", 80, cy + 80);
        ctx.fillText("(Rectangle)", 80, cy + 100);

        // Draw Shadow 2 (Circle-ish)
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(w - 80, cy, 40, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText("Looks like a Wave", w - 80, cy + 80);
        ctx.fillText("(Circle)", w - 80, cy + 100);

        // Draw The Actual Object (Spinning Cylinder) in center
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        
        // Top Circle
        ctx.beginPath();
        for(let i=0; i<=Math.PI*2; i+=0.1) {
            const x = cx + Math.cos(i) * r * cos;
            const y = cy - hCyl/2 + Math.sin(i) * r;
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Bottom Circle
        ctx.beginPath();
        for(let i=0; i<=Math.PI*2; i+=0.1) {
            const x = cx + Math.cos(i) * r * cos;
            const y = cy + hCyl/2 + Math.sin(i) * r;
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Sides
        ctx.beginPath();
        ctx.moveTo(cx - r*cos, cy - hCyl/2);
        ctx.lineTo(cx - r*cos, cy + hCyl/2);
        ctx.moveTo(cx + r*cos, cy - hCyl/2);
        ctx.lineTo(cx + r*cos, cy + hCyl/2);
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.fillText("The Truth (Quantum Object)", cx, cy + 120);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. PARTICLE VS WAVE BEHAVIOR (The Double Slit)
// Shows tennis balls making 2 bands vs Water making many bands
const runDoubleSlitSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    
    // Mode toggles every few seconds
    // 0 = Particles (Tennis Balls), 1 = Waves (Ripples)

    const particles: {x: number, y: number, vx: number, vy: number}[] = [];

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h/2;
        t++;

        const mode = Math.floor(t / 300) % 2; // Switch every 300 frames
        
        ctx.clearRect(0, 0, w, h);

        // Draw Wall with 2 Slits
        ctx.fillStyle = '#71717a';
        ctx.fillRect(cx - 10, 0, 20, h);
        ctx.clearRect(cx - 10, h/2 - 40, 20, 20); // Top Slit
        ctx.clearRect(cx - 10, h/2 + 20, 20, 20); // Bottom Slit

        // --- MODE 0: PARTICLES ---
        if (mode === 0) {
            // Spawn balls
            if (t % 5 === 0) {
                const targetSlit = Math.random() > 0.5 ? -30 : 30; // Aim for top or bottom
                particles.push({
                    x: 0,
                    y: h/2 + targetSlit + (Math.random()-0.5)*10,
                    vx: 4,
                    vy: 0
                });
            }

            // Draw Balls
            ctx.fillStyle = '#ef4444';
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
                ctx.fill();

                if (p.x > w) particles.splice(i, 1);
            }

            // Result on Screen
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(w - 20, h/2 - 50, 10, 40); // Pile 1
            ctx.fillRect(w - 20, h/2 + 10, 10, 40); // Pile 2
            
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText("PARTICLES: Two Piles", cx, 30);
        } 
        
        // --- MODE 1: WAVES ---
        else {
            // Clear particles
            particles.length = 0;

            // Draw Ripples
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            
            // Source wave
            const pulse = (t % 20) * 5;
            
            // Left side wave
            for(let r=0; r<cx; r+=20) {
                const x = cx - r + (t%20);
                if (x < cx) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0); ctx.lineTo(x, h);
                    ctx.stroke();
                }
            }

            // Right side interference (Simplified visual)
            // Radiating from slits
            for(let r=0; r<w-cx; r+=20) {
                const rad = r + (t%20);
                // Top Slit Arc
                ctx.beginPath();
                ctx.arc(cx, h/2 - 30, rad, -Math.PI/2, Math.PI/2);
                ctx.stroke();
                // Bottom Slit Arc
                ctx.beginPath();
                ctx.arc(cx, h/2 + 30, rad, -Math.PI/2, Math.PI/2);
                ctx.stroke();
            }

            // Result Pattern (Interference)
            ctx.fillStyle = '#3b82f6';
            for(let i=-3; i<=3; i++) {
                ctx.fillRect(w - 20, h/2 + (i*30) - 5, 10, 10);
            }

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText("WAVES: Many Bands (Interference)", cx, 30);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 3. THE QUANTUM MYSTERY
// Electrons appearing one by one to form a WAVE pattern
const runMysterySim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    
    // Store where dots landed
    // An array of y-positions
    const hits: number[] = [];
    let t = 0;
    let animId = 0;

    const render = () => {
        t++;
        
        // Fast forward: add random hits based on wave probability
        for(let i=0; i<5; i++) {
            // Interference pattern math approximation: cos^2
            // We want clusters of hits
            let y = Math.random() * h;
            const prob = Math.cos((y - h/2) * 0.05); 
            // Only accept hit if probability is met
            if (Math.random() < prob * prob) {
                hits.push(y);
            }
        }

        // Limit dots for performance
        if (hits.length > 2000) hits.shift();

        ctx.clearRect(0, 0, w, h);

        // Draw Electron Gun
        ctx.fillStyle = '#52525b';
        ctx.fillRect(0, h/2 - 20, 40, 40);
        
        // Draw Slits
        ctx.fillStyle = '#71717a';
        ctx.fillRect(w/3, 0, 10, h);
        ctx.clearRect(w/3, h/2 - 40, 10, 20);
        ctx.clearRect(w/3, h/2 + 20, 10, 20);

        // Draw Hits
        ctx.fillStyle = '#fbbf24'; // Yellow dots
        hits.forEach(y => {
            ctx.fillRect(w - 50 + (Math.random()*10), y, 2, 2);
        });

        // Current flying electron
        const flyX = (t * 10) % w;
        if (flyX < w - 50) {
            ctx.beginPath();
            ctx.arc(flyX, h/2, 4, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText("Shooting Particles one by one...", w/2, 40);
        
        if (hits.length > 500) {
            ctx.fillStyle = '#4ade80';
            ctx.fillText("RESULT: It looks like a Wave Pattern!", w/2, h - 40);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_29: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Wave-Particle Duality",
        subtitle: "The universe has a split personality.",
        icon: <Split size={80} className="text-purple-400" />,
        meta: "Quantum Weirdness"
    },
    {
        id: "context",
        type: "concept-list",
        title: "The Argument",
        context: "For centuries, scientists fought over a simple question: Is light made of particles (sand) or waves (water)?",
        items: [
            "Newton said: Particles!",
            "Young said: Waves!",
            "Einstein said: Particles (Photons)!",
            "Who is right?"
        ]
    },
    {
        id: "analogy-cyl",
        type: "simulation",
        title: "The Cylinder Analogy",
        description: "How can one thing be two things? Imagine a cylinder. From one side it's a rectangle. From the other, a circle.",
        run: runCylinderSim
    },
    {
        id: "concept-experiment-setup",
        type: "process",
        title: "The Double Slit Experiment",
        steps: [
            { label: "The Wall", desc: "We set up a wall with two vertical slits (holes) in it." },
            { label: "The Screen", desc: "Behind it, we put a screen to catch whatever comes through." },
            { label: "The Stuff", desc: "We throw stuff at the wall and see what pattern appears on the screen." }
        ]
    },
    {
        id: "sim-compare",
        type: "simulation",
        title: "Particles vs. Waves",
        description: "Watch closely. Particles (Red) make two piles. Waves (Blue) make a striped pattern called Interference.",
        run: runDoubleSlitSim
    },
    {
        id: "concept-mystery",
        type: "concept-split",
        title: "The Mystery of the Electron",
        leftContent: "Scientists thought electrons were definitely particles (tiny rocks). So they expected two piles.",
        rightPoints: [
            "They fired electrons one by one.",
            "Click... Click... Click...",
            "Slowly, a pattern emerged on the screen.",
            "It wasn't two piles. It was the WAVE pattern!"
        ]
    },
    {
        id: "sim-mystery",
        type: "simulation",
        title: "The Quantum Result",
        description: "Even though they are particles hitting one by one, they land in a wave pattern. It's like they 'know' where to go.",
        run: runMysterySim
    },
    {
        id: "explanation",
        type: "concept-list",
        title: "What does this mean?",
        context: "This implies something impossible in our normal world.",
        items: [
            "The single electron must have gone through BOTH slits at the same time.",
            "It interfered with itself like a wave.",
            "Then it chose a spot to land like a particle.",
            "It travels as a wave, but hits as a particle."
        ]
    },
    {
        id: "observer-effect",
        type: "intro",
        title: "The Observer Effect",
        subtitle: "It gets weirder. If you peek, it changes.",
        icon: <Eye size={80} className="text-yellow-400" />
    },
    {
        id: "analogy-ninja",
        type: "comparison",
        title: "The Shy Ninja",
        leftTitle: "When you aren't looking",
        leftPoints: [
            "The electron acts like a Wave",
            "It goes through both slits",
            "It creates an interference pattern"
        ],
        rightTitle: "When you ARE looking",
        rightPoints: [
            "The electron acts like a Particle",
            "It picks just one slit",
            "It makes two piles (Boring!)"
        ]
    },
    {
        id: "equation",
        type: "equation",
        latex: "\\lambda = \\frac{h}{p}",
        description: "The math that connects the two worlds. Wavelength (Wave) = Constant / Momentum (Particle). They are linked.",
        variables: [
            { symbol: "λ", meaning: "Wavelength (Wave property)" },
            { symbol: "p", meaning: "Momentum (Particle property)" }
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "In the Double Slit experiment, what happens if you put a camera to watch which slit the electron goes through?",
        options: [
            "The camera breaks",
            "You see the wave pattern clearly",
            "The wave pattern disappears and you get two piles",
            "The electron stops moving"
        ],
        correctIndex: 2,
        explanation: "This is the 'Observer Effect'. By measuring the particle's path, you force it to behave like a particle, destroying the wave pattern."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "You are made of atoms, so you also have a wavelength and exhibit duality.",
        isTrue: true,
        explanation: "Technically True! But your mass is so huge that your wavelength is basically zero, so you don't diffract through doorways."
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "Light and Matter are both Waves AND Particles",
            "They travel as waves (probability clouds)",
            "They hit as particles (dots on a screen)",
            "Observing them forces them to choose a state",
            "This is the heart of Quantum Mechanics"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Reality is Fuzzy",
        text: "The universe isn't made of hard stuff. It's made of possibilities that only harden when we look at them."
    }
];
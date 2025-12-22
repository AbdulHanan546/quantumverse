import React from 'react';
import { Zap, Wind, Rocket, Hammer } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. IMPACT SIMULATION
// Shows how different colors (frequencies) of light hit with different force.
const runImpactSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    
    // State
    const particles: { x: number, y: number, color: string, speed: number, size: number }[] = [];
    let blockX = 200;
    let blockVel = 0;
    
    // Cyclical "Gun" changing colors
    // 0-200: Red (Weak), 200-400: Blue (Strong)
    
    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h/2;
        t++;

        const cycle = t % 600;
        const isBluePhase = cycle > 300;
        const color = isBluePhase ? '#3b82f6' : '#ef4444'; // Blue vs Red
        const speed = isBluePhase ? 8 : 4; // Blue is "faster" analogy for energy
        
        ctx.clearRect(0, 0, w, h);

        // --- 1. Draw The Gun ---
        ctx.fillStyle = '#27272a';
        ctx.fillRect(0, cy - 20, 60, 40);
        ctx.fillStyle = color;
        ctx.fillRect(60, cy - 10, 10, 20); // Muzzle flash
        
        // Spawn Particles
        if (t % 10 === 0) {
            particles.push({ 
                x: 70, 
                y: cy + (Math.random() - 0.5) * 20, 
                color: color, 
                speed: speed,
                size: isBluePhase ? 6 : 8 // Blue = dense bullet, Red = fluffy ball analogy
            });
        }

        // --- 2. Update Particles ---
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.speed;
            
            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            // Collision with Block
            if (p.x > blockX && p.x < blockX + 50 && p.y > cy - 40 && p.y < cy + 40) {
                // Hit!
                particles.splice(i, 1);
                // Momentum Transfer: Blue hits harder
                blockVel += p.color === '#3b82f6' ? 2.5 : 0.5;
                
                // Visual Impact
                ctx.strokeStyle = '#fff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 15, 0, Math.PI*2);
                ctx.stroke();
            } else if (p.x > w) {
                particles.splice(i, 1);
            }
        }

        // --- 3. Update Block ---
        blockX += blockVel;
        blockVel *= 0.95; // Friction to stop it eventually
        
        // Reset block if off screen or phase change
        if (blockX > w || (cycle === 0) || (cycle === 300)) {
            blockX = 200;
            blockVel = 0;
            particles.length = 0; // Clear bullets
        }

        // Draw Block
        ctx.fillStyle = '#fff';
        ctx.fillRect(blockX, cy - 40, 50, 80);
        
        // Draw Label
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        const label = isBluePhase ? "BLUE LIGHT (High Energy)" : "RED LIGHT (Low Energy)";
        ctx.fillText(label, w/2, 50);
        
        ctx.font = '14px monospace';
        const pushLabel = isBluePhase ? "PUSH: HARD!" : "PUSH: soft...";
        ctx.fillText(pushLabel, blockX + 25, cy - 50);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. SOLAR SAIL SIMULATION
// Shows a spaceship being pushed by light
const runSailSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let shipY = 0;
    let velocity = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t++;

        ctx.clearRect(0, 0, w, h);
        
        const cx = w/2;
        
        // Stars background
        if (t === 1) {
            // Static stars could be optimized, but drawing randomly every frame looks like warp speed
            // Let's keep it static-ish
        }
        ctx.fillStyle = '#fff';
        for(let i=0; i<20; i++) {
            // simplistic star field moving down
            const sy = (i * 50 + t * 2) % h;
            const sx = (i * 123) % w;
            ctx.fillRect(sx, sy, 2, 2);
        }

        // --- The Laser Beam ---
        const laserW = 40 + Math.sin(t * 0.5) * 5;
        const grad = ctx.createLinearGradient(cx - laserW, 0, cx + laserW, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.5)'); // Yellow sunlight
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 50, h - 150, 100, 150); // Emitter at bottom

        // Photons moving up
        for(let i=0; i<5; i++) {
            const py = h - ((t * 10 + i * 50) % 300) - 50;
            if (py > h - 150 - shipY) { // Only draw if below ship
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(cx + (i%2===0?10:-10), py, 3, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // --- The Ship (Solar Sail) ---
        // Ship starts at bottom and accelerates up
        if (velocity < 5) velocity += 0.01; // Constant acceleration from light pressure
        shipY += velocity;
        
        // Loop ship
        if (shipY > h + 100) {
            shipY = -50;
            velocity = 0;
        }

        const screenY = h - 150 - shipY;
        
        // Draw Sail (Large Mirror)
        ctx.strokeStyle = '#38bdf8'; // Cyan frame
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 60, screenY);
        ctx.quadraticCurveTo(cx, screenY - 20, cx + 60, screenY); // Curved sail
        ctx.stroke();
        
        // Sail Glow (Reflection)
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Ship Body
        ctx.fillStyle = '#e4e4e7';
        ctx.fillRect(cx - 10, screenY - 40, 20, 40);
        
        // Text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText("Solar Sail", cx, screenY - 60);
        ctx.fillStyle = '#facc15';
        ctx.font = '12px monospace';
        ctx.fillText("MOMENTUM TRANSFER", cx, h - 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_21: SlideData[] = [
    {
        id: "1-intro",
        type: "intro",
        title: "Photons: Bullets of Light",
        subtitle: "How light carries a punch, even though it weighs nothing.",
        icon: <Hammer size={80} className="text-blue-400" />,
        meta: "Particle Physics"
    },
    {
        id: "2-concept",
        type: "concept-list",
        title: "Is Light a Wave or a Particle?",
        context: "We've learned light acts like a wave (ripples). But Einstein showed it also acts like a stream of tiny particles.",
        items: [
            "We call these particles 'Photons'",
            "Think of them like tiny invisible tennis balls",
            "They fly at the speed of light"
        ]
    },
    {
        id: "3-analogy-energy",
        type: "concept-split",
        title: "The Color = The Impact",
        leftContent: "Not all Photons are equal. Their energy depends on their color (frequency).",
        rightPoints: [
            "Red Photon = Soft Ping Pong Ball (Low Energy)",
            "Blue Photon = Fast Baseball (High Energy)",
            "X-Ray Photon = Cannonball (Dangerous!)"
        ]
    },
    {
        id: "4-sim-impact",
        type: "simulation",
        title: "The Impact Test",
        description: "Watch how the 'Red' light barely pushes the block, but the 'Blue' light hits it hard. (Wait for the color change).",
        run: runImpactSim
    },
    {
        id: "5-puzzle",
        type: "quiz",
        question: "Wait... how can light PUSH things if it has no mass?",
        options: [
            "It can't, that's impossible",
            "It has momentum (pure energy motion)",
            "Light is actually heavy",
            "Magic"
        ],
        correctIndex: 1,
        explanation: "This is the weird part of physics. You usually need Mass to have Momentum (p=mv). But Photons have Momentum just from their Energy!"
    },
    {
        id: "6-analogy-ghost",
        type: "concept-split",
        title: "The Ghost Analogy",
        leftContent: "Imagine a ghost. It weighs nothing (zero mass). But if it runs into you really fast, you still feel a 'whoosh' of wind pushing you.",
        rightPoints: [
            "Photon Mass = 0",
            "Photon Momentum > 0",
            "It's a 'kick' made of pure energy"
        ]
    },
    {
        id: "7-real-world",
        type: "simulation",
        title: "Solar Sails",
        description: "We actually use this in space! Huge mirrors catch the 'momentum' of sunlight to push spaceships without fuel.",
        run: runSailSim
    },
    {
        id: "8-equation",
        type: "equation",
        latex: "p = \\frac{h}{\\lambda}",
        description: "The momentum (p) of a photon gets bigger when the wavelength (λ) gets smaller. Short waves (Blue) push harder!",
        variables: [
            { symbol: "p", meaning: "Momentum (The Push)" },
            { symbol: "h", meaning: "Planck's Constant" },
            { symbol: "λ", meaning: "Wavelength (Color)" }
        ]
    },
    {
        id: "9-comparison",
        type: "comparison",
        title: "Matter vs Light",
        leftTitle: "Baseball (Matter)",
        leftPoints: [
            "Has Mass (kg)",
            "Momentum comes from Mass × Speed",
            "Can stop moving"
        ],
        rightTitle: "Photon (Light)",
        rightPoints: [
            "Zero Mass",
            "Momentum comes from Frequency",
            "Never stops (always speed of light)"
        ]
    },
    {
        id: "10-true-false",
        type: "true-false",
        statement: "A flashlight beam exerts a tiny force on the wall it hits.",
        isTrue: true,
        explanation: "True! It's called 'Radiation Pressure'. It's too small to feel with your hand, but sensitive instruments can measure it."
    },
    {
        id: "11-summary",
        type: "summary",
        title: "What we learned",
        recap: [
            "Light is made of particles called Photons",
            "Blue photons hit harder than Red photons (E=hf)",
            "Photons have NO mass, but they DO have Momentum",
            "We can use this 'light push' to sail in space"
        ]
    },
    {
        id: "12-outro",
        type: "outro",
        title: "Beam me up!",
        text: "You now understand how light is both a wave and a stream of energetic particles."
    }
];
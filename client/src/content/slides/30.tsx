import React from 'react';
import { Dices, Clock, HelpCircle, Crosshair, MapPin } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. DETERMINISM SIMULATION (The Cannon)
// Shows that if we know the input, we know the output 100%.
const runDeterminismSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let shots: {x: number, y: number, t: number}[] = [];

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h - 50;
        t++;

        // Fire a shot every 60 frames
        if (t % 60 === 0) {
            shots.push({x: 50, y: cy, t: 0});
        }

        ctx.clearRect(0, 0, w, h);

        // Draw Target
        const targetX = w - 100;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(targetX, h - 60, 20, 20);
        ctx.fillStyle = 'white';
        ctx.fillText("Target", targetX - 10, h - 20);

        // Draw Calculated Path (The Prediction)
        ctx.strokeStyle = '#52525b';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(50, cy);
        // Basic projectile math: x = v*t, y = 0.5*g*t^2 (simplified)
        for(let i=0; i<targetX - 50; i+=10) {
            const time = i / 5; 
            const y = cy - (time * 6) + (0.5 * 0.1 * time * time);
            ctx.lineTo(50 + i, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Update Shots
        ctx.fillStyle = '#fbbf24'; // Yellow
        for (let i = shots.length - 1; i >= 0; i--) {
            const s = shots[i];
            s.t += 1.5;
            
            // Movement logic same as prediction
            s.x = 50 + (s.t * 5);
            s.y = cy - (s.t * 6) + (0.5 * 0.1 * s.t * s.t);

            ctx.beginPath();
            ctx.arc(s.x, s.y, 6, 0, Math.PI*2);
            ctx.fill();

            // Check hit
            if (s.x >= targetX) {
                // Perfect hit every time
                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText("PERFECT PREDICTION", w/2 - 100, h/2);
                shots.splice(i, 1);
            }
        }

        // Gun
        ctx.fillStyle = '#a1a1aa';
        ctx.fillRect(20, cy - 10, 40, 20);

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Classical Physics: Same Input = Same Output", w/2, 50);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. PROBABILITY SIMULATION (The Quantum Dartboard)
// Shows that we can't predict individual hits, only the pattern.
const runProbabilitySim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    
    // Store past hits
    // Using a typed array or simple array for dots
    const hits: {x: number, y: number}[] = [];

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w/2;
        const cy = h/2;

        // Add 5 random hits per frame
        for(let i=0; i<5; i++) {
            // Generate Random Point with Gaussian distribution (Cluster in middle)
            // This represents the "Probability Cloud" or Wavefunction
            const angle = Math.random() * Math.PI * 2;
            const radius = (Math.random() + Math.random()) * 80; // Simple bias towards center
            
            hits.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }

        // Limit history for performance
        if (hits.length > 2000) hits.splice(0, 5);

        ctx.clearRect(0, 0, w, h);

        // Draw "The Cloud" (Accumulated hits)
        ctx.fillStyle = '#3b82f6'; // Blue dots
        hits.forEach(h => {
            ctx.fillRect(h.x, h.y, 2, 2);
        });

        // Draw "Prediction" Circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI*2);
        ctx.stroke();

        // Overlay Text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText("Quantum Physics: We can't predict the next dot.", w/2, 40);
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText("But we know 90% will land inside the circle.", w/2, 70);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_30: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Clockwork vs. Chaos",
        subtitle: "Is the future written in stone, or is it a roll of the dice?",
        icon: <Dices size={80} className="text-purple-400" />,
        meta: "Philosophy of Physics"
    },
    {
        id: "classical-view",
        type: "concept-list",
        title: "The Old World: Determinism",
        context: "For centuries, Isaac Newton and others believed the universe was a giant machine.",
        items: [
            "If you know where a planet is now...",
            "And you know how fast it's moving...",
            "You can predict exactly where it will be in 1,000 years.",
            "The future is already determined by the present."
        ]
    },
    {
        id: "sim-determinism",
        type: "simulation",
        title: "The Cannonball",
        description: "In Classical Physics, if you aim the same way, you hit the same spot. 100% certainty. No surprises.",
        run: runDeterminismSim
    },
    {
        id: "quantum-shock",
        type: "concept-split",
        title: "The Quantum Shock",
        leftContent: "When we started looking at electrons, the rules broke. We aimed the same way, but the electron landed in different places!",
        rightPoints: [
            "Nature is inherently random.",
            "You CANNOT predict the future perfectly.",
            "You can only predict the CHANCE (Probability)."
        ]
    },
    {
        id: "analogy-weather",
        type: "comparison",
        title: "Train Schedules vs Weather",
        leftTitle: "Classical (Train)",
        leftPoints: [
            "Arrives at 5:00 PM exactly.",
            "Follows a fixed track.",
            "We know the destination."
        ],
        rightTitle: "Quantum (Weather)",
        rightPoints: [
            "60% Chance of Rain.",
            "It might rain, it might not.",
            "We only know the likelihood."
        ]
    },
    {
        id: "sim-probability",
        type: "simulation",
        title: "The Electron Cloud",
        description: "We don't know where the electron IS. We only know where it PROBABLY is. Watch the dots form a pattern over time.",
        run: runProbabilitySim
    },
    {
        id: "einstein-complaint",
        type: "quote",
        text: "God does not play dice with the universe.",
        author: "Albert Einstein (He hated this idea!)"
    },
    {
        id: "concept-reality",
        type: "concept-list",
        title: "Einstein was Wrong",
        context: "Sorry Einstein. Experiments proved that the universe DOES play dice.",
        items: [
            "An electron isn't a point orbiting like a planet.",
            "It's a 'Cloud of Probability'.",
            "It exists everywhere in the cloud at once, until we check.",
            "When we check, it picks a spot randomly."
        ]
    },
    {
        id: "quiz",
        type: "quiz",
        question: "If you have a Quantum Coin, and you flip it 1,000 times...",
        options: [
            "You can predict the result of the next flip perfectly",
            "You can't predict the next flip, but you know it will be roughly 50% heads overall",
            "The coin disappears",
            "It will always land on heads"
        ],
        correctIndex: 1,
        explanation: "Quantum mechanics gives us perfect statistics (group behavior), but zero certainty about individual events."
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "If we had a powerful enough computer, we could calculate exactly where an electron will go.",
        isTrue: false,
        explanation: "False! It's not about computing power. Nature itself is fuzzy. The information literally does not exist until the event happens."
    },
    {
        id: "summary",
        type: "summary",
        title: "The New Reality",
        recap: [
            "Classical Physics = Determinism (Predictable Machine)",
            "Quantum Physics = Probability (Rolling Dice)",
            "We can predict the Group, but not the Individual",
            "The future is not fixed; it is a range of possibilities"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Embrace the Chaos",
        text: "The universe is built on uncertainty. And that's what makes it possible for things to happen at all!"
    }
];
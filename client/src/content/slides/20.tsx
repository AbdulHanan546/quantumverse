import React from 'react';
import { Zap, Sun, Lightbulb, BatteryCharging, MousePointerClick } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path if needed

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. Photoelectric Effect Demo
// Cycles through Red Light (No effect) -> Blue Light (Effect) -> UV Light (Fast effect)
const runPhotoelectricSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let particles: {x: number, y: number, vx: number, vy: number, type: 'photon'|'electron', color: string}[] = [];
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const metalY = h - 80;
        
        // Cycle phases every 200 frames
        t++;
        const cycle = t % 600;
        
        let lightColor = '#ef4444'; // Red
        let lightEnergy = 1; // Too weak
        let label = "Red Light (Low Energy)";
        
        if (cycle > 200 && cycle < 400) {
            lightColor = '#3b82f6'; // Blue
            lightEnergy = 5; // Enough
            label = "Blue Light (Medium Energy)";
        } else if (cycle >= 400) {
            lightColor = '#a855f7'; // Purple/UV
            lightEnergy = 8; // Super strong
            label = "UV Light (High Energy)";
        }

        ctx.clearRect(0, 0, w, h);

        // Draw Metal Plate
        ctx.fillStyle = '#52525b';
        ctx.fillRect(0, metalY, w, 80);
        ctx.fillStyle = '#71717a';
        ctx.fillRect(0, metalY, w, 10); // Surface
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText("Metal Plate (Electrons trapped here)", 20, h - 30);

        // Spawn Photons (Rain down)
        if (t % 5 === 0) {
            particles.push({
                x: Math.random() * w,
                y: -10,
                vx: 0,
                vy: 5,
                type: 'photon',
                color: lightColor
            });
        }

        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Photon hits metal
            if (p.type === 'photon' && p.y >= metalY) {
                particles.splice(i, 1); // Absorb photon
                
                // If energy is high enough, eject electron
                if (lightEnergy >= 5) {
                    const speed = lightEnergy * 1.5; // Excess energy becomes speed
                    particles.push({
                        x: p.x,
                        y: metalY - 5,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -speed,
                        type: 'electron',
                        color: '#fbbf24' // Gold/Yellow electron
                    });
                }
            }
            // Remove off-screen particles
            else if (p.y < -50 || p.y > h + 50) {
                particles.splice(i, 1);
            }
        }

        // Draw Particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.type === 'photon' ? 4 : 6, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            // Glow for electrons
            if(p.type === 'electron') {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Status Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, w/2, 40);
        
        // Subtext
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#a1a1aa';
        if (lightEnergy === 1) ctx.fillText("Photons are too weak to knock electrons out!", w/2, 70);
        if (lightEnergy === 5) ctx.fillText("Success! Electrons ejected.", w/2, 70);
        if (lightEnergy === 8) ctx.fillText("Fast electrons! Extra energy = Speed.", w/2, 70);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_20: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Photoelectric Effect",
        subtitle: "How light acts like a bullet to knock electrons loose.",
        icon: <Sun size={80} className="text-yellow-400" />,
        meta: "Nobel Prize Physics"
    },
    {
        id: "concept-1",
        type: "concept-list",
        title: "The Setup",
        context: "Imagine a piece of metal. Inside, there are electrons swarming around, but they are stuck to the metal.",
        items: [
            "Electrons want to be free.",
            "But the metal holds onto them (like gravity).",
            "We need to give them a 'kick' to escape.",
            "Can we use light to kick them out?"
        ]
    },
    {
        id: "sim-main",
        type: "simulation",
        title: "The Experiment",
        description: "Watch what happens when we use Red light vs Blue light. Does brightness matter?",
        run: runPhotoelectricSim
    },
    {
        id: "confusion",
        type: "comparison",
        title: "The Mystery",
        leftTitle: "What We Expected (Waves)",
        leftPoints: [
            "Light is a continuous wave (like the ocean)",
            "If the wave is big enough (Bright Light)...",
            "...it should eventually wash electrons away.",
            "Color shouldn't matter."
        ],
        rightTitle: "What Actually Happened",
        rightPoints: [
            "Bright Red light did NOTHING.",
            "Dim Blue light worked INSTANTLY.",
            "Color mattered more than brightness!"
        ]
    },
    {
        id: "analogy-pingpong",
        type: "concept-split",
        title: "The Ping Pong Analogy",
        leftContent: "Imagine the electrons are bowling pins. You want to knock them over.",
        rightPoints: [
            "Red Light = Ping Pong Balls. You can throw 1,000 of them (High Intensity), but they just bounce off.",
            "Blue Light = Baseballs. You only need ONE to knock a pin down.",
            "Conclusion: You need HEAVY particles, not just 'more' particles."
        ]
    },
    {
        id: "einstein",
        type: "intro",
        title: "Einstein's Idea",
        subtitle: "Light isn't just a wave. It's made of particles called PHOTONS.",
        icon: <Lightbulb size={80} className="text-blue-400" />
    },
    {
        id: "concept-photons",
        type: "process",
        title: "How Photons Work",
        steps: [
            { label: "1. The Collision", desc: "One Photon hits One Electron. It's a one-on-one fight." },
            { label: "2. The Cost", desc: "The electron needs a specific amount of energy to escape (The Exit Fee)." },
            { label: "3. The Result", desc: "If the Photon has enough energy, the electron pays the fee and flies away." },
            { label: "4. The Spare Change", desc: "Any leftover energy becomes the electron's speed." }
        ]
    },
    {
        id: "equation",
        type: "equation",
        latex: "KE = hf - W",
        description: "This is the budget for the electron.",
        variables: [
            { symbol: "KE", meaning: "Speed of Electron (Spare change)" },
            { symbol: "hf", meaning: "Energy of Light (Money you have)" },
            { symbol: "W", meaning: "Work Function (Cost to escape)" }
        ]
    },
    {
        id: "analogy-vending",
        type: "concept-split",
        title: "The Vending Machine",
        leftContent: "Think of the metal like a vending machine that costs $5.",
        rightPoints: [
            "Red Photon = $1 bill. Machine rejects it. Even if you have 100 of them, it only takes one bill at a time.",
            "Blue Photon = $10 bill. Machine takes $5, and gives you $5 change (Speed)."
        ]
    },
    {
        id: "quiz-1",
        type: "quiz",
        question: "If you shine a VERY BRIGHT Red light on the metal, but Red light is too weak to eject electrons, what happens?",
        options: [
            "A few electrons come out eventually",
            "Nothing happens",
            "The metal melts",
            "The electrons come out very slowly"
        ],
        correctIndex: 1,
        explanation: "Nothing happens! Since light acts like particles, 1,000 weak particles still can't do the job of 1 strong particle. It's a one-on-one interaction."
    },
    {
        id: "true-false-1",
        type: "true-false",
        statement: "Einstein won the Nobel Prize for E=mc², not this.",
        isTrue: false,
        explanation: "Surprisingly, Einstein actually won the Nobel Prize for explaining the Photoelectric Effect (this topic!), not for Relativity."
    },
    {
        id: "summary",
        type: "summary",
        title: "What to Remember",
        recap: [
            "Light acts like a stream of particles (Photons)",
            "Frequency (Color) determines how strong each photon is",
            "Intensity (Brightness) is just the NUMBER of photons",
            "You need a minimum frequency (Threshold) to knock electrons out"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Solar Power!",
        text: "This effect is exactly how solar panels work today. Sunlight knocks electrons loose to create electricity."
    }
];
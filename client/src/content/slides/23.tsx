import React from 'react';
import { Ghost, Activity, MousePointerClick, Zap } from 'lucide-react';
// import { type SlideData, type SimulationDriver } from './TopicViewer'; // Adjust path

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// 1. WAVE PACKET SIMULATION
// Visualizes an electron not as a dot, but as a traveling "pulse" or wave packet
const runWavePacketSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 2;
        
        ctx.clearRect(0, 0, w, h);
        const cy = h / 2;

        // Reset loop
        const xPos = t % (w + 200) - 100;

        // 1. Classical Particle (Ghost / Faded)
        // Just to show comparison
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(xPos, cy - 80, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px sans-serif';
        ctx.fillText("Classical Bullet (Boring)", xPos, cy - 100);

        // 2. Quantum Wave Packet (The Real Electron)
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Draw a sine wave contained inside a bell curve (Gaussian)
        // Center of the packet is xPos
        for(let i = -100; i < 100; i+=2) {
            const x = xPos + i;
            if (x < 0 || x > w) continue;

            // Envelope (The shape of the packet)
            const envelope = Math.exp(-(i*i) / 1000) * 40; 
            
            // The Wiggle (The wave nature)
            // Moving parts inside the envelope
            const wiggle = Math.sin((i * 0.2) - (t * 0.1));

            const y = cy + envelope * wiggle;

            if (i === -100) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glow
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText("The 'Wavy' Electron", xPos, cy + 60);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// 2. MASS VS WAVELENGTH SIMULATION
// Shows how increasing mass kills the waviness
const runMassSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        t += 0.02; // Time cycle for changing mass

        // Mass oscillates from Tiny (Electron) to Huge (Bowling Ball)
        // 0.0 -> 1.0
        const factor = (Math.sin(t) + 1) / 2;
        
        ctx.clearRect(0, 0, w, h);
        const cy = h/2;

        // Calculate visual parameters based on "Mass" factor
        // Low Factor = Low Mass = Huge Wavelength
        // High Factor = High Mass = Tiny Wavelength (Straight line)
        
        const massLabel = factor < 0.3 ? "Electron (Tiny Mass)" : factor < 0.7 ? "Dust Mote (Medium)" : "Baseball (Huge Mass)";
        const wavelength = 100 * (1 - factor) + 2; // Big to Small
        const amplitude = 50 * (1 - factor); // Big wiggle to Straight line
        const ballSize = 5 + (factor * 40); // Small dot to Big ball
        const color = factor < 0.5 ? '#4ade80' : '#facc15';

        // Draw the path
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        for(let x=0; x<w; x+=2) {
            // Static wave path
            const y = cy + Math.sin(x / wavelength * 6) * amplitude;
            if (x===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw the Object moving
        const speed = 2; // constant speed
        const xPos = (t * 100) % (w + 100) - 50;
        const yPos = cy + Math.sin(xPos / wavelength * 6) * amplitude;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xPos, yPos, ballSize, 0, Math.PI*2);
        ctx.fill();

        // Stats
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '24px sans-serif';
        ctx.fillText(massLabel, w/2, 50);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#a1a1aa';
        if (factor > 0.8) ctx.fillText("Wavelength is too small to see!", w/2, 80);
        else ctx.fillText("Large Wavelength = Very Wavy", w/2, 80);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                             SLIDE DATA                                     */
/* -------------------------------------------------------------------------- */

export const SLIDES_23: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The de Broglie Hypothesis",
        subtitle: "Why you are technically a wave (but a very boring one).",
        icon: <Ghost size={80} className="text-purple-400" />,
        meta: "Matter Waves"
    },
    {
        id: "recap",
        type: "concept-list",
        title: "Wait, what?",
        context: "So far, we learned that Light (which acts like a wave) can act like a Particle (Photon).",
        items: [
            "Light = Wave AND Particle",
            "Louis de Broglie asked a crazy question:",
            "If Light can be a Particle...",
            "...can Matter (Particles) be a Wave?"
        ]
    },
    {
        id: "sim-wavepacket",
        type: "simulation",
        title: "The Wavy Electron",
        description: "Instead of a hard little marble, de Broglie suggested an electron is more like a traveling ripple.",
        run: runWavePacketSim
    },
    {
        id: "concept-duality",
        type: "concept-split",
        title: "Wave-Particle Duality",
        leftContent: "This is the core of Quantum Mechanics. Matter isn't solid. It's 'fuzzy'.",
        rightPoints: [
            "Electrons don't have a specific location",
            "They exist in a 'cloud' of probability",
            "They wiggle as they move"
        ]
    },
    {
        id: "analogy-baseball",
        type: "comparison",
        title: "Why don't I wiggle?",
        leftTitle: "Electron",
        leftPoints: [
            "Tiny Mass",
            "HUGE Wavelength",
            "Very Wavy (Quantum behavior)"
        ],
        rightTitle: "Baseball",
        rightPoints: [
            "Huge Mass",
            "Tiny Wavelength",
            "Basically Straight (Classical behavior)"
        ]
    },
    {
        id: "sim-mass",
        type: "simulation",
        title: "Mass Kills the Wave",
        description: "Watch as the object gets heavier (larger). The 'waviness' disappears. This is why you don't phase through walls.",
        run: runMassSim
    },
    {
        id: "equation",
        type: "equation",
        latex: "\\lambda = \\frac{h}{mv}",
        description: "The de Broglie Equation. It calculates your wavelength (λ).",
        variables: [
            { symbol: "λ", meaning: "Wavelength (How wavy you are)" },
            { symbol: "h", meaning: "Planck's Constant (Tiny number)" },
            { symbol: "m", meaning: "Mass (How heavy you are)" },
            { symbol: "v", meaning: "Velocity (Speed)" }
        ]
    },
    {
        id: "quiz-1",
        type: "quiz",
        question: "Based on the equation, who has a longer wavelength (is more wavy)?",
        options: [
            "A semi-truck moving at 60mph",
            "A person walking",
            "A dust mote floating",
            "An electron zipping around"
        ],
        correctIndex: 3,
        explanation: "The equation divides by Mass (m). The smaller the mass, the bigger the wavelength. Electrons are tiny, so they are the wavi-est!"
    },
    {
        id: "true-false",
        type: "true-false",
        statement: "If you run fast enough, your wavelength becomes visible to the human eye.",
        isTrue: false,
        explanation: "Actually, as velocity (v) increases, wavelength (λ) gets SMALLER! Running faster makes you act MORE like a particle, not less."
    },
    {
        id: "process-microscope",
        type: "process",
        title: "Real World Use: Electron Microscope",
        steps: [
            { label: "The Problem", desc: "Light waves are too big to see atoms. It's like trying to feel a lego brick with a boxing glove." },
            { label: "The Solution", desc: "Use Electrons! Since they move fast, they have tiny wavelengths." },
            { label: "The Result", desc: "We can take pictures of viruses and DNA using electron waves instead of light waves." }
        ]
    },
    {
        id: "summary",
        type: "summary",
        title: "Recap",
        recap: [
            "Matter acts like a wave (de Broglie Hypothesis)",
            "Wavelength depends on Mass and Speed",
            "Big things (People) have waves too small to measure",
            "Tiny things (Electrons) act very wavy",
            "Everything in the universe wiggles"
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Everything is Wavy",
        text: "You are now quantum mechanics certified. You know that particles are just waves in disguise."
    }
];
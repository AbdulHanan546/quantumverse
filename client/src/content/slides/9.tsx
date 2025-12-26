import React from "react";
import { 
  GitMerge, 
  Layers, 
  XCircle, 
  Radio,
  PlusCircle, 
  ArrowRightLeft, 
  Activity, 
  Ghost
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                         SIMULATION FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Beats Simulation
 * Shows two waves of slightly different frequencies and their "throbbing" sum.
 */
const runBeatsSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.02;

        ctx.clearRect(0, 0, w, h);

        const freq1 = 0.05;
        const freq2 = 0.055; // Slightly different
        const amp = 30;

        // Draw Wave 1 (Top)
        ctx.strokeStyle = '#60a5fa'; // Blue
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = cy - 100 + Math.sin(x * freq1 - t * 5) * amp;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Wave 2 (Middle)
        ctx.strokeStyle = '#fbbf24'; // Yellow
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = cy - 50 + Math.sin(x * freq2 - t * 5) * amp;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw the Result (The "Beat" Wave)
        ctx.strokeStyle = '#4ade80'; // Green
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const s1 = Math.sin(x * freq1 - t * 5) * amp;
            const s2 = Math.sin(x * freq2 - t * 5) * amp;
            const y = cy + 80 + (s1 + s2);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText("WAVE A (440 Hz)", 10, cy - 120);
        ctx.fillText("WAVE B (444 Hz)", 10, cy - 70);
        ctx.fillText("THE COMBINED BEAT (The Throb!)", 10, cy + 40);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/**
 * 2. Amplitude Modulation (AM) Simulation
 * Shows a slow message wave "shaping" a fast carrier wave.
 */
const runAMSim = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId = 0;
    let mouseX = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        t += 0.05;

        ctx.clearRect(0, 0, w, h);

        // 1. Message Wave (Your Voice)
        const msgFreq = 0.01;
        const msgAmp = 40;
        
        // 2. Carrier Wave (The Radio Signal - Fast)
        const carrierFreq = 0.2;

        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
            // Modulation: The amplitude of the carrier is (1 + msgWave)
            const modulation = 1 + (Math.sin(x * msgFreq + t) * mouseX);
            const y = cy + (Math.sin(x * carrierFreq + t * 5) * modulation * 50);
            
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Envelope (The Ghost Shape)
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const env = cy - (1 + Math.sin(x * msgFreq + t) * mouseX) * 50;
            if (x === 0) ctx.moveTo(x, env); else ctx.lineTo(x, env);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fff';
        ctx.fillText("AM RADIO WAVE", 20, 30);
        ctx.fillStyle = '#71717a';
        ctx.fillText("Move mouse to change the volume of your voice!", 20, h - 20);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
};

/* -------------------------------------------------------------------------- */
/*                             DATA DEFINITION                                */
/* -------------------------------------------------------------------------- */

export const SLIDES_9: SlideData[] = [
    {
        id: 1,
        type: "intro",
        title: "Beats & Radio Waves",
        subtitle: "How waves throb, wobble, and carry music to your car.",
        icon: <Radio size={80} className="text-blue-400" />,
        meta: "Wave Interactions"
    },
    {
        id: 2,
        type: "quote",
        text: "Two waves that are almost the same create a rhythm. In that tiny difference, we find the music.",
        author: "Physics Proverb"
    },
    {
        id: 3,
        type: "concept-split",
        title: "The 'Walking' Analogy",
        leftContent: "Imagine walking with a friend. You take 100 steps a minute, but they take 101. Sometimes your feet hit the ground together (LOUD), and sometimes you're perfectly out of step (QUIET).",
        rightPoints: [
            "Sync = Constructive (Big)",
            "Out of Sync = Destructive (Small)",
            "The result is a 'Throb' or a Beat."
        ]
    },
    {
        id: 4,
        type: "simulation",
        title: "Visualizing Beats",
        description: "Watch how two waves with slightly different speeds create a new pattern that gets big and small over and over. That's a Beat!",
        run: runBeatsSim
    },
    {
        id: 5,
        type: "concept-list",
        title: "How to Hear Beats",
        context: "You can hear this 'wobble' in real life:",
        items: [
            "Tuning a Guitar: When two strings are almost right, they 'wa-wa-wa'.",
            "Twin Engine Planes: The hum of the engines 'throbs'.",
            "The Beat Frequency is just the difference between the two waves."
        ]
    },
    {
        id: 6,
        type: "equation",
        latex: "f_{\\text{beat}} = |f_1 - f_2|",
        description: "If Wave A is 440 Hz and Wave B is 444 Hz, you will hear exactly 4 'wobbles' or beats every second.",
        variables: [
            { symbol: "f_{\\text{beat}}", meaning: "How fast the sound wobbles" },
            { symbol: "f_1, f_2", meaning: "The frequencies of the two sounds" }
        ]
    },
    {
        id: 7,
        type: "concept-split",
        title: "The Carrier Pigeon",
        leftContent: "Your voice is a 'slow' wave. It can't travel through space easily. To send it to a radio, we need a 'Carrier Wave'—a fast, strong wave that acts like a pigeon carrying a letter.",
        rightPoints: [
            "Voice = The Letter",
            "Carrier = The Pigeon",
            "Modulation = Tying the letter to the pigeon"
        ]
    },
    {
        id: 8,
        type: "concept-list",
        title: "What is AM?",
        context: "Amplitude Modulation (AM) is one way to tie that letter:",
        items: [
            "Amplitude = Strength or Height of the wave.",
            "Modulation = Changing or Controlling.",
            "AM means: We change the STRENGTH of the carrier wave to match the shape of your voice."
        ]
    },
    {
        id: 9,
        type: "simulation",
        title: "Amplitude Modulation (AM)",
        description: "The fast blue wave is the 'Carrier'. Notice how its height follows a slow, invisible 'Envelope'. That envelope is the message!",
        run: runAMSim
    },
    {
        id: 10,
        type: "process",
        title: "How AM Radio Works",
        steps: [
            { label: "Microphone", desc: "Turns your voice into a slow electrical wave." },
            { label: "Modulator", desc: "Shapes a high-speed carrier wave to match your voice's height." },
            { label: "Antenna", desc: "Zaps that shaped wave through the air." },
            { label: "Receiver", desc: "Your radio peels away the carrier and plays just the shape (the voice)." }
        ]
    },
    {
        id: 11,
        type: "comparison",
        title: "AM vs. FM",
        leftTitle: "AM (Amplitude)",
        leftPoints: ["Changes the HEIGHT", "Can travel very far", "Gets 'noisy' easily (static)"],
        rightTitle: "FM (Frequency)",
        rightPoints: ["Changes the SPEED/WIGGLE", "Short range", "Clear, high-quality sound"]
    },
    {
        id: 12,
        type: "quiz",
        question: "If you hear 5 beats per second and one tuning fork is 256 Hz, what could the other one be?",
        options: [
            "261 Hz", 
            "251 Hz", 
            "Either 261 Hz or 251 Hz", 
            "5 Hz"
        ],
        correctIndex: 2,
        explanation: "Beats are the difference. |256 - 261| = 5, and |256 - 251| = 5. Both work!"
    },
    {
        id: 13,
        type: "true-false",
        statement: "In Amplitude Modulation, the frequency of the carrier wave stays exactly the same.",
        isTrue: true,
        explanation: "Correct! We only change the amplitude (height). If we changed the frequency, it would be FM!"
    },
    {
        id: 14,
        type: "summary",
        title: "Rhythm & Radio Recap",
        recap: [
            "Beats are the 'throbbing' sound caused by frequency differences.",
            "Modulation is how we 'piggyback' information onto waves.",
            "AM works by changing the strength of a fast wave.",
            "Physics isn't just about math; it's about how energy communicates."
        ]
    },
    {
        id: 15,
        type: "outro",
        title: "Signal Received!",
        text: "You've finished the module on Beats and Modulation. You're now ready to tune into the mysteries of the electromagnetic spectrum!"
    }
];
import React from "react";
import { 
  Layers, 
  Music, 
  ChefHat, 
  Activity, 
  Sigma, 
  BarChart3,
  AlignJustify
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Wave Baker (Building a Square Wave)
// Visualizes adding harmonics one by one to create a square shape.
const runSquareBuilderSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;
    let numTerms = 1;
    let frameCount = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t += 0.02; // Time flow
        frameCount++;

        // Every 200 frames, add another "ingredient" (Harmonic)
        if (frameCount % 200 === 0) {
            numTerms += 2; // Square wave uses odd harmonics: 1, 3, 5, 7...
            if (numTerms > 15) numTerms = 1; // Reset
        }

        ctx.clearRect(0, 0, w, h);

        // 1. Draw the "Ghost" Sine Waves (The Ingredients)
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        for (let n = 1; n <= numTerms; n += 2) {
            ctx.beginPath();
            // Color logic: Fundamental is Blue, Harmonics shift to Pink
            ctx.strokeStyle = n === 1 ? '#60a5fa' : '#f472b6'; 
            
            for (let x = 0; x < w; x+=2) {
                // y = (1/n) * sin(n * x)
                const amp = (80 / n); 
                const freq = 0.02 * n;
                const y = cy + amp * Math.sin(freq * x + t * n); // t*n keeps phase locked
                if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // 2. Draw the RESULT (The Cake)
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#4ade80'; // Green
        ctx.beginPath();
        
        for (let x = 0; x < w; x++) {
            let sumY = 0;
            // Sum up all the sine waves
            for (let n = 1; n <= numTerms; n += 2) {
                const amp = (80 / n);
                const freq = 0.02 * n;
                sumY += amp * Math.sin(freq * x + t * n);
            }
            const y = cy + sumY;
            if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3. UI/Text
        ctx.fillStyle = '#fff';
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        
        // Dynamic Label
        let text = "";
        if (numTerms === 1) text = "Just the Main Wave (1)";
        else if (numTerms === 3) text = "Adding the 3rd Harmonic (+1/3)";
        else if (numTerms > 9) text = "Getting Squarer!";
        
        ctx.fillText(text, w/2, 50);
        
        ctx.font = "14px monospace";
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`Ingredients: ${Math.ceil(numTerms/2)} Sine Waves`, w/2, 80);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: The Complex Mess (Sawtooth)
// Shows how a sharp "Saw" shape is just smooth waves added together
const runSawtoothSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cy = h / 2;
        
        t -= 0.05; // Move left

        ctx.clearRect(0, 0, w, h);

        // We will visualize the "Circle" method roughly on the left
        // and the wave on the right.
        
        // Draw the Result Wave (Sawtooth)
        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24'; // Yellow
        ctx.lineWidth = 4;
        
        // Sawtooth formula: sin(x) + sin(2x)/2 + sin(3x)/3 ...
        const terms = 10; 
        
        for (let x = 0; x < w; x++) {
            let sum = 0;
            for (let n = 1; n <= terms; n++) {
                // Alternating signs for proper saw
                // Actually simple inverse sum: sin(nx)/n
                sum += (100 / n) * Math.sin((x * 0.02 * n) + t*n); 
            }
            // Flip every other term for sawtooth? 
            // Standard saw is sum( (-1)^k * sin(kx)/k )
            // Let's stick to the visual sum
            
            const y = cy - (sum * 0.6); // Scale down
            if (x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.font = "16px sans-serif";
        ctx.fillText("A Sharp Sawtooth Wave", w/2, h - 30);
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText("(Made entirely of smooth circles!)", w/2, h - 10);

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_10: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "The Wave Recipe",
        subtitle: "How to build ANY shape using only simple circles.",
        icon: <Layers size={80} className="text-pink-400" />,
        meta: "Physics • Concept: Fourier Series"
    },
    {
        id: "analogy-soup",
        type: "concept-split",
        title: "The Soup Analogy",
        leftContent: "Imagine you are eating a bowl of soup. It tastes complex, but it's just made of simple ingredients: salt, water, carrots, and onions.",
        rightPoints: [
            "Complex Wave = The Soup",
            "Simple Sine Waves = The Ingredients",
            "Joseph Fourier discovered the recipe book!"
        ]
    },
    {
        id: "concept-sine",
        type: "concept-list",
        title: "The Ingredient: Sine Wave",
        context: "In physics, the Sine Wave is the 'Pure Brick'. It is the simplest possible vibration.",
        items: [
            "A whistle blowing a single note.",
            "A pendulum swinging gently.",
            "A smooth, rolling hill.",
            "Fourier's Idea: We can stack these to make jagged shapes."
        ]
    },
    {
        id: "sim-square",
        type: "simulation",
        title: "Baking a Square Wave",
        description: "Watch the Green Line. We start with one smooth wave. As we add more 'ingredients' (smaller, faster waves), the Green Line starts to look like a brick wall!",
        run: runSquareBuilderSim
    },
    {
        id: "equation-recipe",
        type: "equation",
        latex: "y = \\sin(x) + \\frac{1}{3}\\sin(3x) + \\frac{1}{5}\\sin(5x) + ...",
        description: "This is the recipe for a Square Wave. You take a big slow wave, add a medium wave (1/3 size), then a tiny fast wave (1/5 size), and keep going forever.",
        variables: [
            { symbol: "sin(x)", meaning: "The Main Ingredient (Fundamental)" },
            { symbol: "1/3", meaning: "Less of the faster ingredient" },
            { symbol: "...", meaning: "Keep adding to sharpen corners" }
        ]
    },
    {
        id: "concept-music",
        type: "comparison",
        title: "Why does a Piano sound different from a Flute?",
        leftTitle: "The Flute (Pure)",
        leftPoints: [
            "Mostly just the first sine wave",
            "Sounds smooth and hollow",
            "Simple recipe"
        ],
        rightTitle: "The Piano (Rich)",
        rightPoints: [
            "Has the first wave + MANY extra waves",
            "These extras are called 'Harmonics'",
            "Sounds complex and rich"
        ]
    },
    {
        id: "sim-sawtooth",
        type: "simulation",
        title: "The Sharp Sawtooth",
        description: "Even a jagged, sharp shape like this Sawtooth wave is made of smooth curves. It just takes a LOT of them to make that sharp point.",
        run: runSawtoothSim
    },
    {
        id: "quiz-corners",
        type: "quiz",
        question: "In the simulation, what was needed to make the corners of the square wave look sharp?",
        options: [
            "Just one big wave",
            "Adding more and more small, fast waves",
            "Removing waves",
            "Making the waves slower"
        ],
        correctIndex: 1,
        explanation: "To draw a sharp corner using smooth pencils (sine waves), you need tiny, fast wiggles to fill in the gaps. More harmonics = Sharper corners."
    },
    {
        id: "true-false-reality",
        type: "true-false",
        statement: "Your voice is actually just a sum of many simple sine waves added together.",
        isTrue: true,
        explanation: "True! When you speak, your vocal cords vibrate in a complex way. A computer can record it and break it down into a list of simple sine waves (Frequencies). This is how MP3s work!"
    },
    {
        id: "summary",
        type: "summary",
        title: "The Secret Revealed",
        recap: [
            "All complex waves are sums of simple sine waves.",
            "The simple waves are called 'Harmonics'.",
            "Adding more harmonics makes the shape sharper.",
            "This math (Fourier) runs the internet, music, and images."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "Chef's Kiss!",
        text: "You now understand how nature builds complex reality out of simple vibrations."
    }
];
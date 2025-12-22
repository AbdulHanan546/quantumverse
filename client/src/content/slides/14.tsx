import React from "react";
import { 
  Volume2, 
  Activity, 
  Zap, 
  Music, 
  AlertTriangle, 
  Radio, 
  Repeat
} from "lucide-react";
// import type { SlideData, SimulationDriver } from "./types";

/* -------------------------------------------------------------------------- */
/*                            SIMULATION LOGIC                                */
/* -------------------------------------------------------------------------- */

// SIMULATION 1: The Magic Swing
// Visualizes the difference between pushing at the wrong time vs the right time.
const runSwingSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    
    // Physics State
    let angle = 0;
    let velocity = 0;
    const naturalFreq = 0.05; // The swing's favorite speed
    
    // Simulation Modes
    let mode = "wait"; // wait, sync, chaos
    let timer = 0;
    let pushForce = 0;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = 50;
        const length = h - 100;

        timer++;

        // Mode Switching Logic
        if (timer % 400 === 0) {
            // Reset energy
            angle = 0; velocity = 0;
            if (mode === "wait" || mode === "chaos") mode = "sync";
            else mode = "chaos";
        }

        // --- PHYSICS ENGINE ---
        // 1. Natural Gravity Restoring Force
        const gravity = -0.002 * Math.sin(angle);
        
        // 2. The Push (Driving Force)
        pushForce = 0;
        if (mode === "sync") {
            // Push matches the swing's motion (Resonance)
            pushForce = 0.001 * Math.cos(naturalFreq * timer); 
        } else if (mode === "chaos") {
            // Push is too fast/random (Anti-Resonance)
            pushForce = 0.001 * Math.cos(naturalFreq * 2.5 * timer); 
        }

        velocity += gravity + pushForce;
        velocity *= 0.995; // Friction/Air resistance
        angle += velocity;

        ctx.clearRect(0, 0, w, h);

        // --- DRAWING ---

        // Draw Stand
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(cx - 50, cy - 10, 100, 10);

        // Draw String
        const bobX = cx + length * Math.sin(angle);
        const bobY = cy + length * Math.cos(angle);
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Seat/Person
        ctx.beginPath();
        ctx.arc(bobX, bobY, 20, 0, Math.PI*2);
        // Color depends on energy
        const energy = Math.abs(angle);
        ctx.fillStyle = energy > 0.8 ? '#ef4444' : (mode === "sync" ? '#4ade80' : '#60a5fa');
        ctx.fill();

        // Draw "The Hand" (Visualizing the push)
        const pushIndicator = Math.cos(mode === "sync" ? naturalFreq * timer : naturalFreq * 2.5 * timer);
        const handX = bobX - 40;
        const handY = bobY;
        
        if (pushIndicator > 0.5) {
            ctx.fillStyle = '#fbbf24'; // Yellow hand
            ctx.font = "20px sans-serif";
            ctx.fillText("PUSH!", handX - 30, handY);
            // Draw simple arrow
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            ctx.lineTo(handX + 20, handY);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        // UI Labels
        ctx.textAlign = "center";
        ctx.font = "bold 20px sans-serif";
        if (mode === "sync") {
            ctx.fillStyle = "#4ade80";
            ctx.fillText("RESONANCE (Perfect Timing)", cx, h - 30);
            ctx.font = "14px sans-serif";
            ctx.fillText("Energy builds up!", cx, h - 10);
        } else {
            ctx.fillStyle = "#f87171";
            ctx.fillText("NO RESONANCE (Bad Timing)", cx, h - 30);
            ctx.font = "14px sans-serif";
            ctx.fillText("Motions cancel out", cx, h - 10);
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

// SIMULATION 2: The Opera Singer
// Sound waves hitting a glass. Shows amplitude increasing until break.
const runGlassSim: SimulationDriver = (canvas) => {
    const ctx = canvas.getContext('2d')!;
    let animId = 0;
    let t = 0;
    let glassAmp = 0;
    let isBroken = false;

    const render = () => {
        const { width: w, height: h } = canvas;
        const cx = w / 2;
        const cy = h / 2 + 50;
        
        t += 0.1;

        // Amplitude grows slowly to simulate resonance building up
        if (!isBroken && glassAmp < 20) {
            glassAmp += 0.05;
        }

        // Check break condition
        if (glassAmp >= 20) isBroken = true;

        ctx.clearRect(0, 0, w, h);

        // Draw Sound Waves (Source)
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let r=20; r<100; r+=20) {
            const offset = (t * 20) % 40; // Moving out
            ctx.arc(cx - 150, cy - 50, r + offset, -0.5, 0.5);
        }
        ctx.stroke();
        
        // Draw Speaker/Singer Icon area
        ctx.fillStyle = '#60a5fa';
        ctx.font = '30px sans-serif';
        ctx.fillText("🎵", cx - 180, cy - 40);

        // Draw Glass
        if (!isBroken) {
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            
            // The glass wobbles based on glassAmp
            const wobble = Math.sin(t * 10) * glassAmp;
            
            // Left side
            ctx.moveTo(cx - 30 - wobble, cy - 100); 
            ctx.bezierCurveTo(cx - 30 - wobble, cy, cx - 20, cy + 50, cx, cy + 50);
            // Right side
            ctx.lineTo(cx, cy + 50);
            ctx.bezierCurveTo(cx + 20, cy + 50, cx + 30 + wobble, cy, cx + 30 + wobble, cy - 100);
            // Rim
            ctx.ellipse(cx, cy - 100, 30 + wobble, 10, 0, 0, Math.PI * 2);
            
            ctx.stroke();
            
            // Stem
            ctx.beginPath();
            ctx.moveTo(cx, cy + 50);
            ctx.lineTo(cx, cy + 100);
            ctx.moveTo(cx - 20, cy + 100);
            ctx.lineTo(cx + 20, cy + 100);
            ctx.stroke();

            // Energy Bar
            ctx.fillStyle = '#3f3f46';
            ctx.fillRect(cx - 50, cy + 120, 100, 10);
            ctx.fillStyle = glassAmp > 15 ? '#ef4444' : '#fbbf24';
            ctx.fillRect(cx - 50, cy + 120, glassAmp * 5, 10);
            ctx.fillText("Stress Level", cx - 40, cy + 150);

        } else {
            // BROKEN STATE
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 30px sans-serif';
            ctx.fillText("CRACK!", cx - 50, cy - 50);
            
            // Shards
            ctx.strokeStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(cx, cy+100); ctx.lineTo(cx, cy+50); ctx.stroke(); // Stem left
            ctx.fillText("💥", cx, cy);
            
            // Reset logic
            if (t % 50 > 48) {
                isBroken = false;
                glassAmp = 0;
            }
        }

        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
};

/* -------------------------------------------------------------------------- */
/*                                SLIDE DATA                                  */
/* -------------------------------------------------------------------------- */

export const SLIDES_14: SlideData[] = [
    {
        id: "intro",
        type: "intro",
        title: "Resonance",
        subtitle: "Why bridges collapse, glasses break, and swings go high.",
        icon: <Volume2 size={80} className="text-yellow-400" />,
        meta: "Physics • Grade 9"
    },
    {
        id: "analogy-swing",
        type: "concept-split",
        title: "The Playground Secret",
        leftContent: "Imagine pushing a friend on a swing. To make them go super high, you don't need to be Hulk. You just need to push at the EXACT right moment.",
        rightPoints: [
            "Push when they move away",
            "Don't push when they come back",
            "Timing > Strength"
        ]
    },
    {
        id: "concept-natural",
        type: "concept-list",
        title: "Concept 1: Natural Frequency",
        context: "Every object in the universe has a 'Favorite Speed' to vibrate.",
        items: [
            "A guitar string has a specific note.",
            "A pendulum has a specific rhythm.",
            "Even a skyscraper sways at a specific speed!",
            "We call this the Natural Frequency."
        ]
    },
    {
        id: "sim-swing",
        type: "simulation",
        title: "The Perfect Push",
        description: "Watch the swing. GREEN mode pushes in rhythm (Resonance). RED mode pushes randomly (No Resonance). See how the Green one gets huge?",
        run: runSwingSim
    },
    {
        id: "definition-resonance",
        type: "equation",
        latex: "f_{push} = f_{natural}",
        description: "This is the formula for Resonance. It happens when the Frequency of the Push matches the Natural Frequency of the object.",
        variables: [
            { symbol: "f_push", meaning: "Speed of your hand (Driving Force)" },
            { symbol: "f_natural", meaning: "Speed the object wants to go" },
            { symbol: "=", meaning: "BOOM! Maximum Energy Transfer" }
        ]
    },
    {
        id: "analogy-glass",
        type: "concept-split",
        title: "The Opera Singer Trick",
        leftContent: "You've seen cartoons where a singer breaks a glass? It's real! If the note they sing matches the natural vibration of the glass...",
        rightPoints: [
            "The air pushes the glass",
            "The glass wobbles a little",
            "The next sound wave pushes AGAIN at the perfect time",
            "The wobble gets too big -> CRACK"
        ]
    },
    {
        id: "sim-glass",
        type: "simulation",
        title: "Shattering with Sound",
        description: "The sound waves are hitting the glass at exactly the right rate. The stress (Energy) builds up until the glass can't handle it.",
        run: runGlassSim
    },
    {
        id: "quiz-bridge",
        type: "quiz",
        question: "In 1940, the Tacoma Narrows Bridge twisted and collapsed in a mild wind. Why?",
        options: [
            "The wind was stronger than a hurricane",
            "The bridge was made of paper",
            "The wind gusts matched the bridge's natural frequency",
            "Godzilla stepped on it"
        ],
        correctIndex: 2,
        explanation: "Resonance! The wind wasn't super strong, but it pushed in a rhythm that matched the bridge's natural wobble. The wobble grew until the bridge snapped."
    },
    {
        id: "true-false-radio",
        type: "true-false",
        statement: "Your car radio uses resonance to pick a station.",
        isTrue: true,
        explanation: "True! When you tune to 98.5 FM, you are adjusting your radio's electric circuit to 'resonate' only with 98.5 FM waves, ignoring all others."
    },
    {
        id: "summary",
        type: "summary",
        title: "Lesson Recap",
        recap: [
            "Natural Frequency: An object's favorite vibration speed.",
            "Resonance: When the push matches the favorite speed.",
            "Result: Small pushes add up to HUGE motion.",
            "It can be useful (Music, Radio) or dangerous (Bridges)."
        ]
    },
    {
        id: "outro",
        type: "outro",
        title: "You're Resonating!",
        text: "You now understand the physics of timing. Go push a swing and feel the science!"
    }
];
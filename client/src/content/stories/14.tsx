import { type StoryStep, type DrawFunction } from "../../components/StoryEngine";

// --- Math Helpers ---
const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => 
  (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- Specialized Draw Helpers ---

const drawNaturalVibes: DrawFunction = (ctx, W, H, time) => {
  const cy = H / 2;
  const objects = [
    { label: "Short Ruler", f: 5, color: '#f87171', len: 60 },
    { label: "Long Ruler", f: 2, color: '#60a5fa', len: 120 },
    { label: "Wine Glass", f: 8, color: '#fbbf24', len: 40 }
  ];

  objects.forEach((obj, i) => {
    const x = (W / 4) * (i + 1);
    const yOffset = Math.sin(time * obj.f) * 20;
    
    // Draw base
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 20, cy + 50, 40, 10);
    
    // Draw "vibrating" object
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, cy + 50);
    ctx.lineTo(x + yOffset, cy + 50 - obj.len);
    ctx.stroke();

    ctx.fillStyle = obj.color;
    ctx.font = "10px monospace";
    ctx.fillText(obj.label, x - 30, cy + 80);
  });

  ctx.fillStyle = '#888';
  ctx.font = "14px monospace";
  ctx.fillText("EVERYTHING HAS A 'FAVORITE' SPEED", W / 2 - 120, 50);
};

const drawWrongTiming: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = 100;
  const length = 200;
  
  // Swing physics
  const angle = Math.sin(time * 2) * 0.2;
  const x = cx + Math.sin(angle) * length;
  const y = cy + Math.cos(angle) * length;

  // The "Push" (Force arrow)
  const pushActive = Math.sin(time * 5) > 0.8;
  if (pushActive) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 50, y);
      ctx.lineTo(x - 10, y);
      ctx.lineTo(x - 20, y - 5);
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x - 20, y + 5);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText("PUSH!", x - 80, y);
  }

  // Draw swing
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.fillText("TIMING IS OFF: ENERGY CANCELLED", W / 2 - 100, H - 40);
};

const drawResonanceBuild: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = 100;
  const length = 200;
  
  // High amplitude because of perfect timing
  const amplitude = Math.min(1.4, time * 0.1);
  const angle = Math.sin(time * 3) * amplitude;
  const x = cx + Math.sin(angle) * length;
  const y = cy + Math.cos(angle) * length;

  // Draw Glow
  const grad = ctx.createRadialGradient(x, y, 5, x, y, 40);
  grad.addColorStop(0, 'rgba(74, 222, 128, 0.5)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();

  // Draw swing
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = '#4ade80';
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#4ade80';
  ctx.fillText("RESONANCE: ENERGY STACKING", W / 2 - 100, H - 40);
};

const drawBrokenGlass: DrawFunction = (ctx, W, H, time) => {
  const cx = W / 2;
  const cy = H / 2;
  
  // Vibrate the glass violently
  const shake = Math.sin(time * 20) * 5;
  
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  
  if (time % 5 < 4) {
      // Drawing a glass
      ctx.beginPath();
      ctx.moveTo(cx - 40 + shake, cy - 80);
      ctx.lineTo(cx + 40 + shake, cy - 80);
      ctx.lineTo(cx + 20 + shake, cy + 40);
      ctx.lineTo(cx - 20 + shake, cy + 40);
      ctx.closePath();
      ctx.stroke();
  } else {
      // Shatter effect
      for(let i=0; i<10; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + Math.random()*100-50, cy + Math.random()*100-50);
          ctx.lineTo(cx + Math.random()*100-50, cy + Math.random()*100-50);
          ctx.stroke();
      }
  }

  ctx.fillStyle = '#fbbf24';
  ctx.fillText("MATCH THE FREQUENCY → BREAK THE WORLD", W / 2 - 120, H - 40);
};

const drawInteractiveResonance: DrawFunction = (ctx, W, H, time, mouseX) => {
  const cx = W / 2;
  const cy = H / 2;
  
  // Natural frequency is 0.5 (middle)
  const naturalF = 5;
  const inputF = map(mouseX, 0, 1, 1, 10);
  
  // Amplitude peaks at resonance
  const diff = Math.abs(inputF - naturalF);
  const response = 1 / (diff + 0.1); 
  const currentAmp = Math.min(150, response * 10);

  // Draw the "Bridge" or "Spring"
  ctx.strokeStyle = `hsl(${map(currentAmp, 0, 150, 200, 0)}, 80%, 60%)`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = -100; x <= 100; x++) {
      const y = Math.sin(x * 0.1 + time * inputF) * currentAmp;
      if (x === -100) ctx.moveTo(cx + x, cy + y);
      else ctx.lineTo(cx + x, cy + y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Input Frequency: ${inputF.toFixed(2)} Hz`, 50, 50);
  ctx.fillText(`System Response: ${currentAmp.toFixed(0)}`, 50, 80);
  
  if (diff < 0.2) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText("DANGER: RESONANCE DETECTED!", 50, 110);
  }

  ctx.fillStyle = "#888";
  ctx.fillText("Mouse X: Tune the external force frequency", 50, H - 30);
};


// --- THE SCRIPT ARRAY ---

export const SCRIPT_14: StoryStep[] = [
  {
    speaker: "Hooke",
    text: "I'm pushing this swing as hard as I can, but it's barely moving! It's like the universe is ignoring me.",
    mathTitle: "Forced Vibration",
    mathSub: "Input Energy vs Result",
    draw: drawWrongTiming
  },
  {
    speaker: "Newton",
    text: "That's because you're pushing like a madman, Robert. You're hitting the swing while it's still coming back at you. You're fighting yourself.",
    mathTitle: "Phase Mismatch",
    mathSub: "Out of sync pulses",
    draw: drawWrongTiming
  },
  {
    speaker: "Huygens",
    text: "Every object in this room has a 'natural rhythm'—a speed it likes to dance at. If you want to move it, you must respect that rhythm.",
    mathTitle: "Natural Frequency",
    mathSub: "The intrinsic 'vibe'",
    draw: drawNaturalVibes
  },
  {
    speaker: "Hooke",
    text: "A rhythm? For a piece of wood? Or a glass of wine? They don't have ears, Christiaan!",
    mathTitle: "The Skeptic",
    mathSub: "Mechanical preference?",
    draw: drawNaturalVibes
  },
  {
    speaker: "Huygens",
    text: "Watch. If I push with a tiny, tiny finger, but I do it exactly when the swing wants to move... the energy doesn't go away. It stacks.",
    mathTitle: "Resonance",
    mathSub: "Cumulative Energy Transfer",
    draw: drawResonanceBuild
  },
  {
    speaker: "Newton",
    text: "Incredible. The amplitude is growing without extra effort. It’s like the object is stealing energy from the timing itself.",
    mathTitle: "The Feedback Loop",
    mathSub: "Matching f_external to f_natural",
    draw: drawResonanceBuild
  },
  {
    speaker: "System",
    text: "This is Resonance. It's how opera singers shatter glass and why soldiers shouldn't march in step across bridges. A small force at the right time is a weapon.",
    mathTitle: "The Danger Zone",
    mathSub: "Structural Failure via Timing",
    draw: drawBrokenGlass
  },
  {
    speaker: "System",
    text: "Simulation Active. Move your mouse to change the frequency of the external force. Try to find the 'Sweet Spot' where the system starts to go wild.",
    mathTitle: "Interactive Tuner",
    mathSub: "Mouse X: Driving Frequency",
    draw: drawInteractiveResonance
  }
];
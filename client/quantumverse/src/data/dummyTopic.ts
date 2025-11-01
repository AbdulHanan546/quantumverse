export const dummyTopic = [
  {
  type: "Heading",
  props: {
    title: "Quantum Entanglement",
    description: "Two particles can be **entangled**, sharing information instantly.\nMeasuring one instantly affects the **other**, no matter the distance.\nEinstein called it *spooky action at a distance.*",
    background: "/images/1.png"
  
  }
}
,
  {
    type: "PointToPonder",
    props: {
      point: "Can something really be in two places at once?",
      character: { name: "Ava", image: "/images/7.png" },
      characterEmotion: "curious"
    }
  },
 {
  type: "Story",
  props: {
    scenes: [
      {
        dialogue: "Welcome to the Quantumverse.",
        character: { name: "Ava", image: "/images/5.png" },
        background: "/images/3.png",
        emotion: "happy",
        orientation: "bottom-right"
      },
      {
        dialogue: "Here, we’ll explore the mystery of superposition.",
        character: { name: "Ava", image: "/images/6.png" },
        background: "/images/2.png",
        emotion: "excited",
        orientation: "bottom-left"
      }
    ]
  }
}
,
  {
    type: "Slice",
    props: {
      title: "Understanding Superposition",
      content: "1. A quantum particle can exist in many states.\n2. Observation collapses it to one.\n3. This is what makes quantum physics strange!.\n4. This is what makes quantum physics strange!"
    }
  },
  {
    type: "MCQ",
    props: {
      question: "What happens when we observe a quantum particle?",
      a: { option: "It disappears", reason: "No, it doesn’t vanish." },
      b: { option: "It freezes in one state", reason: "Correct! Observation collapses its state." },
      c: { option: "It becomes multiple particles", reason: "Not quite." },
      d: { option: "Nothing happens", reason: "Incorrect — something definitely changes." },
      correctOption: "b"
    }
  },
  {
    type: "TrueFalse",
    props: {
      statement: "Quantum particles are always in a fixed state.",
      isTrue: false,
      negativeReason: "They can exist in multiple possible states until observed."
    }
  },
  {
    type: "Matching",
    props: {
      statement: "Match the quantum terms with their meanings.",
      options: [
        { left: "Superposition", right: "Being in multiple states" },
        { left: "Entanglement", right: "Linked particles influencing each other" },
        { left: "Observation", right: "Collapsing a wavefunction" }
      ]
    }
  },
  {
    type: "FunFact",
    props: {
      fact: "Quantum computers can solve problems millions of times faster!",
      illustration: "/images/4.png",
      character: "Zee",
      characterEmotion: "happy",
      characterDialogue: "That’s why quantum AI is the future!"
    }
  },
  {
    type: "Diagram",
    props: {
      illustration: "/images/1.png",
      text: "This diagram shows how measurement collapses the wave function."
    }
  },
  {
    type: "Analogy",
    props: {
      analogy: "**Coin Flip** — before you look, it’s both heads and tails.",
      point: "**Quantum Particle** — before measurement, it’s in all possible states."
    }
  },
  {
    type: "StackOrder",
    props: {
      statement: "Arrange the steps of quantum measurement:",
      illustration: "/images/9.png",
      blocks: [
        { order: 1, statement: "Particle exists in superposition" },
        { order: 2, statement: "Measurement occurs" },
        { order: 3, statement: "Wavefunction collapses" }
      ]
    }
  },
  {
    type: "Simulation",
    props: {
      simulationId: "quantum-wave",
      title: "Wave Interference Demo",
      instruction: "Watch how waves interact — interference patterns emerge."
    }
  }
];

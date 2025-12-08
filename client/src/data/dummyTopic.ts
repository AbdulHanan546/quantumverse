export const dummyTopic = [
  {
    type: "Heading",
    props: {
      title: "Quantum Entanglement",
      description:
        "Two particles behave as one — even across galaxies.\nThis connection is called *entanglement.*",
      background: "/images/1.png"
    }
  },

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
          character: { name: "Ava", image: "/images/6.png" },
          background: "/images/2.png",
          emotion: "happy",
          orientation: "bottom-right"
        },
        {
          dialogue: "Here, we'll explore the mystery of superposition.",
          character: { name: "Ava", image: "/images/6.png" },
          background: "/images/2.png",
          emotion: "excited",
          orientation: "bottom-left"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is Entanglement?",
      illustration: "/images/entangle-basic.png",
      text:
        "Two particles share a linked state. Changing one instantly changes the other."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Quantum State",
          back: "The hidden information describing a particle."
        },
        {
          front: "Measurement",
          back: "Forces the particle to pick one definite state."
        },
        {
          front: "Superposition",
          back: "A particle being in many states at once."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Superposition",
      content:
        "1. A quantum particle can exist in many states.\n2. Observation collapses it to one.\n3. This is what makes quantum physics strange!."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How Entanglement Happens",
      steps: [
        "Two particles interact.",
        "Their properties become linked.",
        "Separating them keeps the connection.",
        "Measuring one changes the other instantly."
      ]
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
    type: "ComparisonCards",
    props: {
      title: "Classical vs Quantum Behavior",
      left: {
        label: "Classical Particles",
        image: "/images/1.png",
        description: "Behave independently."
      },
      right: {
        label: "Entangled Particles",
        image: "/images/1.png",
        description: "Linked no matter the distance."
      }
    }
  },

  {
    type: "ZoomReveal",
    props: {
      title: "Inside the Quantum Link",
      image: "/images/1.png",
      labels: [
        { text: "Spin", x: 30, y: 40 },
        { text: "State Correlation", x: 65, y: 50 },
        { text: "Instant Influence", x: 50, y: 80 }
      ]
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Wave Collapse Demo",
      gif: "/images/link.gif",
      description: "Watch the probability wave snap into a single value."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Entanglement Network",
      center: "Entanglement",
      links: ["Spin", "State", "Measurement", "Correlation", "Quantum Info"]
    }
  },
 
];

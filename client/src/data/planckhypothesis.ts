export const planckHypothesisTopic = [
  {
    type: "Heading",
    props: {
      title: "Planck’s Hypothesis & Quantization of Energy",
      description:
        "Planck proposed that energy is not continuous.\nIt is emitted or absorbed in small packets called quanta.",
      background: "/images/Planck/planck-bg.jfif"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "Why can’t energy be emitted in any amount?",
      character: {
        name: "Max Planck",
        image: "/images/Scientists/Planck/thinkingplanck.png"
      },
      characterEmotion: "curious"
    }
  },

  {
    type: "Story",
    props: {
      scenes: [
        {
          dialogue:
            "Energy is released in fixed packets, not continuously. These packets are called quanta.",
          character: {
            name: "Max Planck",
            image: "/images/Scientists/Planck/happyplanck.png"
          },
          background: "/images/Planck/planck-story.jpg",
          emotion: "thoughtful",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is Quantization of Energy?",
      illustration: "/images/Planck/energy-quanta.png",
      text:
        "Energy can only be emitted or absorbed in discrete amounts. Each packet has energy E = hν."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Planck’s Hypothesis",
          back: "Energy is emitted in discrete packets called quanta."
        },
        {
          front: "Quantum (Plural: Quanta)",
          back: "The smallest packet of energy."
        },
        {
          front: "Planck’s Constant (h)",
          back: "A fundamental constant that relates energy to frequency."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Planck’s Idea",
      content:
        "1. Classical physics assumed energy was continuous.\n2. Experiments showed this was incorrect.\n3. Planck suggested energy comes in packets.\n4. This idea began quantum physics."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How Quantization Works",
      steps: [
        "An atom vibrates with a certain frequency.",
        "Energy is related to this frequency.",
        "Only fixed energy values are allowed.",
        "Energy is emitted or absorbed in quanta.",
        "This explains blackbody radiation."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Coins** — you can pay with whole coins, not fractions of a coin.",
      point:
        "**Energy** — energy is exchanged in whole packets, not fractions."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Continuous vs Quantized Energy",
      left: {
        label: "Classical View",
        image: "/images/Planck/continuous-energy.png",
        description: "Energy changes smoothly."
      },
      right: {
        label: "Quantum View",
        image: "/images/Planck/quantized-energy.png",
        description: "Energy changes in steps."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Energy Quantization",
      gif: "/images/Planck/energy-quanta.gif",
      description:
        "Watch how energy is released in fixed packets."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Planck’s Hypothesis Network",
      center: "Quantization of Energy",
      links: [
        "Quanta",
        "Frequency",
        "Planck’s Constant",
        "Blackbody Radiation",
        "Quantum Physics"
      ]
    }
  }
];

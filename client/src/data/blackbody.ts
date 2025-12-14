export const blackbodyRadiationTopic = [
  {
    type: "Heading",
    props: {
      title: "Blackbody Radiation & Ultraviolet Catastrophe",
      description:
        "Blackbody radiation explains how hot objects emit energy.\nClassical physics failed to explain this, leading to the ultraviolet catastrophe.",
      background: "/images/Blackbody/blackbody-bg.jpg"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "Why doesn’t a hot object emit infinite energy?",
      character: {
        name: "Planck",
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
            "Classical physics predicted infinite energy at high frequencies — a serious problem called the ultraviolet catastrophe.",
          character: {
            name: "Max Planck",
            image: "/images/Scientists/Planck/thinkingplanck.png"
          },
          background: "/images/Blackbody/blackbody-story.png",
          emotion: "thoughtful",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is Blackbody Radiation?",
      illustration: "/images/Blackbody/blackbody-curve.jpg",
      text:
        "A blackbody absorbs all radiation and emits energy depending only on its temperature."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Blackbody",
          back: "An ideal object that absorbs all incoming radiation."
        },
        {
          front: "Blackbody Radiation",
          back: "Energy emitted by a hot object."
        },
        {
          front: "Ultraviolet Catastrophe",
          back: "The failure of classical physics at high frequencies."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding the Problem",
      content:
        "1. Hot objects emit radiation.\n2. Classical theory predicted infinite energy at high frequency.\n3. This was called the ultraviolet catastrophe.\n4. Experiments showed this prediction was wrong."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How the Problem Was Solved",
      steps: [
        "Scientists studied radiation from hot objects.",
        "Classical physics failed to match experiments.",
        "Max Planck proposed energy is emitted in packets.",
        "These packets are called quanta.",
        "This solved the ultraviolet catastrophe."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Stair Steps** — you move in steps, not smoothly.",
      point:
        "**Energy** — energy is emitted in small steps (quanta), not continuously."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Classical vs Quantum View",
      left: {
        label: "Classical Physics",
        image: "/images/Blackbody/classical-curve.png",
        description: "Predicted infinite energy."
      },
      right: {
        label: "Quantum Physics",
        image: "/images/Blackbody/quantum-curve.png",
        description: "Matches experimental results."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Blackbody Radiation Curve",
      gif: "/images/Blackbody/blackbody.gif",
      description:
        "See how radiation intensity changes with wavelength."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Blackbody Radiation Network",
      center: "Blackbody Radiation",
      links: [
        "Temperature",
        "Energy",
        "Quanta",
        "Ultraviolet Catastrophe",
        "Planck"
      ]
    }
  }
];

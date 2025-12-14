export const photoelectricEffectTopic = [
  {
    type: "Heading",
    props: {
      title: "Photoelectric Effect",
      description:
        "The photoelectric effect explains how light can eject electrons from a metal surface.\nThis showed that light behaves like particles.",
      background: "/images/Photoelectric/photoelectric-bg.jpg"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "Why does bright light sometimes fail to release electrons?",
      character: {
        name: "Einstien",
        image: "/images/Scientists/einstein/einsteinthinking.png"
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
            "A security door won’t open, even with very bright red light. But the moment ultraviolet light is used, the door unlocks instantly!",
          character: {
            name: "Albert Einstein",
            image: "/images/Scientists/Einstein/einstein.png"
          },
          background: "/images/Photoelectric/story.jpg",
          emotion: "excited",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is the Photoelectric Effect?",
      illustration: "/images/Photoelectric/photoelectric-diagram.gif",
      text:
        "When light of sufficient frequency hits a metal surface, electrons are emitted from the metal."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Photoelectric Effect",
          back: "Emission of electrons when light hits a metal."
        },
        {
          front: "Threshold Frequency",
          back: "Minimum frequency needed to eject electrons."
        },
        {
          front: "Photon",
          back: "A packet of light energy."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding the Effect",
      content:
        "1. Light shines on a metal surface.\n2. Low-frequency light does nothing, even if bright.\n3. High-frequency light ejects electrons instantly.\n4. This cannot be explained by classical physics."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How the Photoelectric Effect Happens",
      steps: [
        "Light hits a metal surface.",
        "Each photon carries fixed energy.",
        "If energy is enough, electrons are released.",
        "Higher frequency gives more energy.",
        "This confirms particle nature of light."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Key Card Door** — only the correct card opens the door.",
      point:
        "**Light** — only light with enough frequency can eject electrons."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Classical vs Quantum Explanation",
      left: {
        label: "Classical View",
        image: "/images/Photoelectric/classical-light.png",
        description: "Brightness should release electrons."
      },
      right: {
        label: "Quantum View",
        image: "/images/Photoelectric/quantum-light.png",
        description: "Frequency controls electron emission."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Photoelectric Effect Demo",
      gif: "/images/Photoelectric/photoelectric.gif",
      description:
        "See electrons being emitted when high-frequency light hits metal."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Photoelectric Effect Network",
      center: "Photoelectric Effect",
      links: [
        "Photons",
        "Frequency",
        "Threshold Energy",
        "Electrons",
        "Einstein"
      ]
    }
  }
];

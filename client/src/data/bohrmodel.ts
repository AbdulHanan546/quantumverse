export const bohrModelTopic = [
  {
    type: "Heading",
    props: {
      title: "Bohr Model of Atom",
      description:
        "The Bohr Model explains how electrons move in fixed orbits around the nucleus and how atoms emit or absorb energy in discrete amounts.",
      background: "/images/Bohr/bohr-bg.jfif"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "Why don’t electrons spiral into the nucleus?",
      character: {
        name: "Neil Bohr",
        image: "/images/Scientists/Bohr/ThinkingBohr.png"
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
            "Imagine a tiny solar system: electrons orbit the nucleus in fixed paths without falling in. Energy is absorbed or emitted when they jump between orbits.",
          character: {
            name: "Niels Bohr",
            image: "/images/Scientists/Bohr/HappyBohr.png"
          },
          background: "/images/Bohr/bohr-story.png",
          emotion: "excited",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "Bohr Model of Atom",
      illustration: "/images/Bohr/bohr-diagram.gif",
      text:
        "Electrons move in fixed circular orbits around the nucleus. When they jump between orbits, energy is absorbed or emitted as photons."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Bohr Model",
          back: "Electrons move in fixed orbits around nucleus."
        },
        {
          front: "Energy Levels",
          back: "Specific orbits with fixed energy."
        },
        {
          front: "Electron Transition",
          back: "Jumping between orbits emits or absorbs energy."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Bohr Model",
      content:
        "1. Electrons orbit the nucleus in fixed paths.\n2. Each orbit has a specific energy.\n3. Electrons can jump between orbits.\n4. Jumping electrons emit or absorb photons."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How the Bohr Model Works",
      steps: [
        "Electron revolves around nucleus in a stable orbit.",
        "Each orbit corresponds to a specific energy level.",
        "Electron absorbs energy to jump to a higher orbit.",
        "Electron emits energy as photon when falling to lower orbit.",
        "This explains atomic spectra."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Planet Orbiting Sun** — planets stay in orbit and don’t fall in.",
      point:
        "**Electron** — moves in fixed orbits around nucleus without collapsing."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Classical vs Bohr Model",
      left: {
        label: "Classical Atom",
        image: "/images/Bohr/classical-atom.png",
        description: "Electrons should spiral into nucleus."
      },
      right: {
        label: "Bohr Atom",
        image: "/images/Bohr/bohr-atom.png",
        description: "Electrons occupy stable orbits."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Electron Transition",
      gif: "/images/Bohr/bohr-diagram1.gif",
      description:
        "See how electrons jump between orbits and emit/absorb photons."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Bohr Model Network",
      center: "Bohr Model of Atom",
      links: ["Electron Orbits", "Energy Levels", "Photon Emission", "Photon Absorption", "Atomic Spectra"]
    }
  }
];

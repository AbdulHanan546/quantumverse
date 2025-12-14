export const annihilationOfMatterTopic = [
  {
    type: "Heading",
    props: {
      title: "Annihilation of Matter",
      description:
        "Annihilation of matter occurs when a particle meets its antiparticle, converting their mass into energy according to E=mc².",
      background: "/images/Annihilation/annihilation-bg.jpg"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "What happens when matter meets antimatter?",
      character: {
        name: "Thomas",
        image: "/images/Scientists/Dirac/confuseddirac.png"
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
            "Imagine a futuristic lab: a particle and its antiparticle collide and instantly vanish, releasing a burst of energy.",
          character: {
            name: "Paul Dirac",
            image: "/images/Scientists/Dirac/happydirac.png"
          },
          background: "/images/Annihilation/annihilation-lab.jfif",
          emotion: "amazed",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "How Matter and Antimatter Annihilate",
      illustration: "/images/Annihilation/annihilation-diagram1.gif",
      text:
        "A particle (e.g., electron) meets its antiparticle (e.g., positron), and both disappear, producing photons (energy)."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Matter",
          back: "Ordinary particles like electrons and protons."
        },
        {
          front: "Antimatter",
          back: "Particles with same mass but opposite charge."
        },
        {
          front: "Annihilation",
          back: "Process where matter and antimatter convert to energy."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Annihilation",
      content:
        "1. Every particle has a corresponding antiparticle.\n2. When they meet, they annihilate.\n3. Mass converts into energy (light/photons).\n4. This demonstrates Einstein's E=mc² in action."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "Steps of Matter-Antimatter Annihilation",
      steps: [
        "Particle and antiparticle approach each other.",
        "They collide.",
        "Both disappear instantly.",
        "Energy is released in the form of photons.",
        "This process is highly efficient in converting mass to energy."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Fire and Fuel** — when they meet, energy is released.",
      point:
        "**Matter and Antimatter** — when they meet, mass is converted to energy."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Particle vs Antiparticle",
      left: {
        label: "Particle",
        image: "/images/Annihilation/particle.png",
        description: "Regular matter particle."
      },
      right: {
        label: "Antiparticle",
        image: "/images/Annihilation/antiparticle.png",
        description: "Opposite charge particle."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Annihilation in Action",
      gif: "/images/Annihilation/annihilation-diagram.gif",
      description:
        "Watch a particle and antiparticle collide and release energy as photons."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Annihilation Network",
      center: "Matter-Antimatter Annihilation",
      links: ["Particle", "Antiparticle", "Photon", "Energy", "E=mc²"]
    }
  }
];

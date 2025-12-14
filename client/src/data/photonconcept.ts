export const photonConceptTopic = [
  {
    type: "Heading",
    props: {
      title: "Concept of Photon",
      description:
        "A photon is a particle of light that carries energy and momentum but has no mass. It explains the particle nature of light.",
      background: "/images/Photon/photon-bg.jpg"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "How can light behave like both wave and particle?",
      character: {
        name: "Einstein",
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
            "In a physics lab, shining light on a metal surface, electrons are ejected only when the light has high enough frequency. These light packets are called photons!",
          character: {
            name: "Albert Einstein",
            image: "/images/Scientists/einstein/einsteinhappy.png"
          },
          background: "/images/Photon/photon-story.jfif",
          emotion: "excited",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is a Photon?",
      illustration: "/images/Photon/photon-diagram.gif",
      text:
        "A photon is a quantum of light energy. Its energy depends on frequency: E = hν, where h is Planck’s constant."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Photon",
          back: "A particle of light with energy and momentum, but no mass."
        },
        {
          front: "Energy of Photon",
          back: "E = hν, where h is Planck’s constant and ν is frequency."
        },
        {
          front: "Wave-Particle Duality",
          back: "Light behaves as both wave and particle (photon)."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Photons",
      content:
        "1. Photons are packets of light energy.\n2. They have zero mass but carry momentum.\n3. Photon energy depends on light frequency.\n4. Photons explain phenomena like photoelectric effect and Compton effect."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How Photon Works",
      steps: [
        "Light shines on a surface.",
        "Photons hit electrons.",
        "If photon energy is enough, electrons are ejected.",
        "Higher frequency photons carry more energy.",
        "This shows the particle nature of light."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Marbles** — each marble carries fixed energy.",
      point:
        "**Photons** — light comes in discrete packets of energy."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Wave vs Photon",
      left: {
        label: "Wave",
        image: "/images/Photon/light-wave.png",
        description: "Light behaves as a continuous wave."
      },
      right: {
        label: "Photon",
        image: "/images/Photon/photon-particle.png",
        description: "Light behaves as discrete particles."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Photon Interaction",
      gif: "/images/Photon/photon-diagram1.gif",
      description:
        "Watch photons interacting with electrons and transferring energy."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Photon Concept Network",
      center: "Photon",
      links: ["Energy", "Frequency", "Wave-Particle Duality", "Photoelectric Effect", "Momentum"]
    }
  }
];

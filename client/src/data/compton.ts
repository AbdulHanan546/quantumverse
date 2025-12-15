export const comptonEffectTopic = [
  {
    type: "Heading",
    props: {
      title: "Compton Effect",
      description:
        "The Compton Effect explains how light behaves like particles when it collides with electrons.\nThis confirmed the particle nature of light.",
      background: "/images/compton/compton-bg.png"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "What happens when light hits an electron like a moving ball?",
      character: {
        name: "Aurthur Compton",
        image: "/images/Scientists/Compton/confusedcompton.png"
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
            "In a hospital X-ray lab, scientists noticed X-rays bouncing off electrons and losing energy—just like a moving ball hitting another ball!",
          character: {
            name: "Arthur Compton",
            image: "/images/Scientists/Compton/comptonhappy.png"
          },
          background: "/images/compton/real-life-lab.png",
          emotion: "excited",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is the Compton Effect?",
      illustration: "/images/compton/compton-diagram1.gif",
      text:
        "When a high-energy photon collides with an electron, it transfers energy and changes direction."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Compton Effect",
          back: "Scattering of photons by electrons with energy loss."
        },
        {
          front: "Photon",
          back: "A particle of light carrying energy and momentum."
        },
        {
          front: "Wavelength Shift",
          back: "Increase in wavelength after collision."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding the Effect",
      content:
        "1. High-energy light hits an electron.\n2. The photon transfers part of its energy.\n3. The electron recoils.\n4. The scattered light has longer wavelength."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How the Compton Effect Happens",
      steps: [
        "A photon moves toward an electron.",
        "They collide like particles.",
        "The electron gains energy and moves away.",
        "The photon loses energy.",
        "Its wavelength increases."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Billiard Balls** — one ball hits another and slows down.",
      point:
        "**Photons** — light hits electrons and loses energy."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Before vs After Collision",
      left: {
        label: "Before Collision",
        image: "/images/compton/before-collision.png",
        description: "High-energy photon approaches electron."
      },
      right: {
        label: "After Collision",
        image: "/images/compton/after-collision.png",
        description: "Photon scatters with lower energy."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Compton Scattering Demo",
      gif: "/images/compton/compton-diagram.gif",
      description:
        "Watch how photons scatter after colliding with electrons."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Compton Effect Network",
      center: "Compton Effect",
      links: [
        "Photons",
        "Electrons",
        "Scattering",
        "Wavelength Shift",
        "Particle Nature of Light"
      ]
    }
  }
];
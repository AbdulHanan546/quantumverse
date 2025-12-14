export const diffractionTopic = [
  {
    type: "Heading",
    props: {
      title: "Diffraction in Physics",
      description:
        "When waves bend or spread after passing through a small opening or around an obstacle, this effect is called *diffraction.*",
      background: "/images/Diffraction/diffractionheading.png"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "Why do waves spread out instead of moving straight?",
      character: {
        name: "Thomas",
        image: "/images/Scientists/Thomas/thinkingthomas.png"
      },
      characterEmotion: "curious"
    }
  },

  {
    type: "Story",
    props: {
      scenes: [
        {
          dialogue: "Let’s see what happens when waves meet an obstacle!",
          character: {
            name: "Thomas",
            image: "/images/Scientists/Thomas/happythomas.png"
          },
          background: "/images/Diffraction/diffraction-story.png",
          emotion: "happy",
          orientation: "bottom-right"
        },
        {
          dialogue:
            "Instead of stopping, waves bend and spread out. That’s diffraction!",
          character: {
            name: "Ava",
            image: "/images/Scientists/Thomas/happythomas.png"
          },
          background: "/images/Diffraction/diffraction-story.png",
          emotion: "excited",
          orientation: "bottom-left"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is Diffraction?",
      illustration: "/images/Diffraction/diffraction.gif",
      text:
        "When waves pass through a narrow gap or around an edge, they spread out instead of moving straight."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Diffraction",
          back: "Bending and spreading of waves around obstacles."
        },
        {
          front: "Narrow Opening",
          back: "Smaller gaps cause more spreading of waves."
        },
        {
          front: "Wave Nature",
          back: "Only waves can show diffraction."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Diffraction",
      content:
        "1. Diffraction happens to all types of waves.\n2. Light, sound, and water waves can diffract.\n3. Smaller openings cause more bending.\n4. Diffraction proves that light behaves like a wave."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How Diffraction Happens",
      steps: [
        "A wave moves toward an opening or obstacle.",
        "The wave passes through a narrow gap or edge.",
        "The wave spreads out after crossing it.",
        "This spreading is called diffraction.",
        "A diffraction pattern is formed."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Water Waves** — water spreads after passing through a narrow gap.",
      point:
        "**Light Waves** — light spreads after passing through a tiny slit."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Before vs After Diffraction",
      left: {
        label: "Before Gap",
        image: "/images/Diffraction/straight-wave.png",
        description: "Waves travel straight."
      },
      right: {
        label: "After Gap",
        image: "/images/Diffraction/spread-wave.png",
        description: "Waves spread out in all directions."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Single-Slit Diffraction",
      gif: "/images/Diffraction/diffraction.gif",
      description:
        "Watch waves bend and spread after passing through a narrow slit."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Diffraction Network",
      center: "Diffraction",
      links: ["Waves", "Bending", "Spreading", "Slits", "Patterns"]
    }
  }
];

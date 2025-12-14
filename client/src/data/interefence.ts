export const interferenceTopic = [
  {
    type: "Heading",
    props: {
      title: "Interference in Physics",
      description:
        "When waves meet, they combine to create patterns of highs and lows.\nThis phenomenon is called *interference.*",
      background: "/images/interference-1.png"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "How can two waves make each other bigger or cancel out?",
      character: { name: "Ava", image: "/images/7.png" },
      characterEmotion: "curious"
    }
  },

  {
    type: "Story",
    props: {
      scenes: [
        {
          dialogue: "Welcome to the world of waves!",
          character: { name: "Ava", image: "/images/6.png" },
          background: "/images/interference-2.png",
          emotion: "happy",
          orientation: "bottom-right"
        },
        {
          dialogue: "Here, we'll see how waves can combine in surprising ways.",
          character: { name: "Ava", image: "/images/6.png" },
          background: "/images/interference-2.png",
          emotion: "excited",
          orientation: "bottom-left"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is Interference?",
      illustration: "/images/wave.gif",
      text:
        "Two waves meet. Where their peaks align, they amplify (constructive interference). Where a peak meets a trough, they cancel (destructive interference)."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Constructive Interference",
          back: "Waves add together to make a bigger wave."
        },
        {
          front: "Destructive Interference",
          back: "Waves cancel each other out."
        },
        {
          front: "Wave Superposition",
          back: "The principle that waves can overlap and combine."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Interference",
      content:
        "1. Waves can be water, light, or sound.\n2. When two waves meet, their effects combine.\n3. This creates patterns of bright and dark, loud and quiet.\n4. Even a single particle like an electron shows interference if not measured!"
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How Interference Happens",
      steps: [
        "Two waves approach each other.",
        "Their peaks and troughs overlap.",
        "If peaks meet peaks, the wave gets bigger (constructive).",
        "If peak meets trough, the wave diminishes (destructive).",
        "This produces an interference pattern."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy: "**Two People Shouting** — if they shout together in sync, it’s louder.",
      point: "**Waves** — if they align, they amplify each other; if opposite, they cancel."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Individual vs Combined Waves",
      left: {
        label: "Single Wave",
        image: "/images/interference-3.png",
        description: "Just one wave traveling."
      },
      right: {
        label: "Interfering Waves",
        image: "/images/interference-4.png",
        description: "Two waves meet, producing peaks and troughs."
      }
    }
  },

  {
    type: "ZoomReveal",
    props: {
      title: "Wave Interactions Up Close",
      image: "/images/interference-5.png",
      labels: [
        { text: "Peak", x: 20, y: 40 },
        { text: "Trough", x: 50, y: 60 },
        { text: "Pattern", x: 70, y: 30 }
      ]
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Double-Slit Demo",
      gif: "/images/interference-gif.gif",
      description: "Watch electrons create interference patterns as if they were waves!"
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Interference Network",
      center: "Interference",
      links: ["Constructive", "Destructive", "Waves", "Pattern", "Superposition"]
    }
  }
];

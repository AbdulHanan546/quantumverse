export const shmTopic = [
  {
    type: "Heading",
    props: {
      title: "Simple Harmonic Motion (SHM)",
      description:
        "Simple Harmonic Motion is a special type of motion where an object moves back and forth around a fixed point in a repeating way.",
      background: "/images/SHM/shm-bg.jfif"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "Why does a swinging object always return to its middle position?",
      character: {
        name: "Hook",
        image: "/images/Scientists/hook/confusedHook.png"
      },
      characterEmotion: "curious"
    }
  },

  {
    type: "Story",
    props: {
      scenes: [
        {
          dialogue: "Look at this swinging pendulum!",
          character: {
            name: "Hook",
            image: "/images/Scientists/hook/happyhook.png"
          },
          background: "/images/SHM/shm-story.png",
          emotion: "happy",
          orientation: "bottom-right"
        },
        {
          dialogue:
            "It keeps moving back and forth again and again. This is SHM!",
          character: {
            name: "Ava",
            image: "/images/Scientists/hook/happyhook.png"
          },
          background: "/images/SHM/shm-story.png",
          emotion: "excited",
          orientation: "bottom-left"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "What Is SHM?",
      illustration: "/images/SHM/SHM.png",
      text:
        "In SHM, an object moves back and forth about a central position. A restoring force always pulls it back to the center."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Simple Harmonic Motion",
          back: "A repeated back-and-forth motion about a mean position."
        },
        {
          front: "Mean Position",
          back: "The central position where the object rests."
        },
        {
          front: "Restoring Force",
          back: "A force that pulls the object back to the mean position."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding SHM",
      content:
        "1. The motion repeats again and again.\n2. The object moves equally on both sides of the center.\n3. A restoring force always acts toward the center.\n4. Examples include pendulums and spring systems."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How SHM Happens",
      steps: [
        "The object is displaced from its mean position.",
        "A restoring force pulls it back toward the center.",
        "The object gains speed as it passes the center.",
        "It slows down at the extreme position.",
        "The motion repeats continuously."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Child on a Swing** — the child moves back and forth repeatedly.",
      point:
        "**SHM** — objects move back and forth around a central point in the same way."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Extreme vs Mean Position",
      left: {
        label: "Extreme Position",
        image: "/images/SHM/extreme-position.png",
        description: "Maximum displacement, zero speed."
      },
      right: {
        label: "Mean Position",
        image: "/images/SHM/mean-position.png",
        description: "Zero displacement, maximum speed."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "SHM Animation",
      gif: "/images/SHM/SHM.gif",
      description:
        "Watch how an object moves back and forth in simple harmonic motion."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "SHM Network",
      center: "Simple Harmonic Motion",
      links: [
        "Mean Position",
        "Restoring Force",
        "Amplitude",
        "Time Period",
        "Oscillation"
      ]
    }
  }
];

export const electromagnetismThomsonTopic = [
  {
    type: "Heading",
    props: {
      title: "Electromagnetism (Review by Thomson)",
      description:
        "Electromagnetism explains how electricity and magnetism are connected.\nThomson reviewed and helped explain these ideas in simple physical terms.",
      background: "/images/Electromagnetism/electromagnetism-bg.jpg"
    }
  },

  {
    type: "PointToPonder",
    props: {
      point: "How are electricity and magnetism actually linked?",
      character: {
        name: "Thomas",
        image: "/images/Scientists/Thomson/confusedthomson.png"
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
            "Electric charges create electric fields, moving charges create magnetic fields — together they form electromagnetism.",
          character: {
            name: "Thomson",
            image: "/images/Scientists/Thomson/happythomson.png"
          },
          background: "/images/Electromagnetism/electromagnetism-story.png",
          emotion: "thoughtful",
          orientation: "bottom-right"
        }
      ]
    }
  },

  {
    type: "Diagram",
    props: {
      title: "Electricity and Magnetism Together",
      illustration: "/images/Electromagnetism/thomsan.gif",
      text:
        "Electric charges produce electric fields. Moving charges produce magnetic fields. These two effects are closely connected."
    }
  },

  {
    type: "FlipCardSet",
    props: {
      title: "Quick Knowledge Cards",
      cards: [
        {
          front: "Electric Field",
          back: "A region around a charge where electric force acts."
        },
        {
          front: "Magnetic Field",
          back: "A region around moving charges or magnets."
        },
        {
          front: "Electromagnetism",
          back: "The combined study of electricity and magnetism."
        }
      ]
    }
  },

  {
    type: "Slice",
    props: {
      title: "Understanding Electromagnetism",
      content:
        "1. Electric charges create electric fields.\n2. Moving charges create magnetic fields.\n3. Changing electric fields can create magnetic fields.\n4. Thomson reviewed these ideas to make them clearer and more physical."
    }
  },

  {
    type: "StepFlow",
    props: {
      title: "How Electromagnetism Works",
      steps: [
        "An electric charge exists.",
        "It creates an electric field around it.",
        "If the charge moves, a magnetic field is produced.",
        "Electric and magnetic fields affect each other.",
        "This interaction is called electromagnetism."
      ]
    }
  },

  {
    type: "Analogy",
    props: {
      analogy:
        "**Flowing Water** — moving water creates ripples around it.",
      point:
        "**Moving Charges** — moving charges create magnetic effects around them."
    }
  },

  {
    type: "ComparisonCards",
    props: {
      title: "Electric vs Magnetic Effects",
      left: {
        label: "Electric Effect",
        image: "/images/Electromagnetism/electric-field.png",
        description: "Produced by electric charges."
      },
      right: {
        label: "Magnetic Effect",
        image: "/images/Electromagnetism/magnetic-field.png",
        description: "Produced by moving charges."
      }
    }
  },

  {
    type: "ShortAnimation",
    props: {
      title: "Electromagnetic Interaction",
      gif: "/images/Electromagnetism/em-wave.gif",
      description:
        "See how electric and magnetic fields interact and travel together."
    }
  },

  {
    type: "ConceptMap",
    props: {
      title: "Electromagnetism Network",
      center: "Electromagnetism",
      links: [
        "Electric Field",
        "Magnetic Field",
        "Moving Charges",
        "Forces",
        "Energy"
      ]
    }
  }
];

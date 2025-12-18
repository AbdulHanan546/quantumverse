# Auto-Play System - Implementation Examples

## Example 1: Basic Auto-Play Setup

```tsx
// pages/student/Home.tsx
import TopicRenderer from "@/components/TopicRenderer";

export default function StudentHome() {
  const components = [
    { type: "Heading", props: { title: "Chapter 1", ... } },
    { type: "Story", props: { scenes: [...] } },
    { type: "MCQ", props: { question: "...", ... } },
  ];

  return (
    <TopicRenderer
      components={components}
      autoPlay={true}
      marginX="px-4"
      marginY="py-6"
    />
  );
}
```

## Example 2: Story Component (Auto-Advanced Scenes)

```tsx
// Automatically advances through scenes after reading time

// Scene 1: Character dialogue (40 words)
// Duration: (40 / 200 × 60) × 1000 + 2000 (animation) = 14s
// Progress bar fills for 14s, then auto-advances

// User can:
// - Tap to pause (pause icon appears)
// - Tap again to resume (progress bar continues)
// - Or read ahead and tap to force next scene

{
  type: "Story",
  props: {
    scenes: [
      {
        dialogue: "Once upon a time...",  // 40 words
        character: { name: "Narrator", image: "..." },
        background: "..."
      },
      // Next scene auto-plays after ~14 seconds
    ]
  }
}
```

## Example 3: FlipCardSet (Sequential Auto-Flip)

```tsx
// Cards auto-flip in sequence

// Card 1 (30 words front + 20 words back)
// Duration: (50 / 200 × 60) × 1000 = 15s
// Card auto-flips after 15s

// Card 2 auto-flips after its duration
// When all flipped, "Tap to continue" appears

{
  type: "FlipCardSet",
  props: {
    title: "Vocabulary",
    cards: [
      { front: "Photosynthesis", back: "Process by which plants..." },
      { front: "Chlorophyll", back: "Green pigment in plants..." },
      // Each auto-flips sequentially
    ]
  }
}
```

## Example 4: StepFlow (Dynamic Reveal)

```tsx
// Steps reveal automatically after reading time
// No scrollbar - content grows downward

// Step 1: "First, gather all materials"
// Duration: 2s (component-specific)
// Step appears, after 2s, Step 2 auto-reveals

{
  type: "StepFlow",
  props: {
    title: "How to Make Coffee",
    steps: [
      "Gather: coffee, filter, water",
      "Add water to machine",
      "Add ground coffee",
      "Press brew button",
      "Wait 5 minutes"
      // Each step appears after 2-3s reading time
    ]
  }
}
```

## Example 5: Diagram (Auto-Display)

```tsx
// Displays illustration and text, auto-advances after reading

// Time calculation:
// - Text: 60 words = 18s
// - Image: +3s visual comprehension
// - Total: ~21s, then auto-advances

{
  type: "Diagram",
  props: {
    title: "Photosynthesis Process",
    illustration: "https://...",
    text: "Photosynthesis is a complex chemical process..."
    // 60 words total
    // Duration: 21s
  }
}
```

## Example 6: MCQ (Reading + Thinking Time)

```tsx
// MCQ gets minimum 4s thinking time

{
  type: "MCQ",
  props: {
    question: "What is the main product of photosynthesis?",
    // ~6 words = 1.8s reading
    // Adjusted to 4s minimum for thinking
    a: { option: "Glucose", reason: "..." },
    b: { option: "Oxygen", reason: "..." },
    c: { option: "Water", reason: "..." },
    d: { option: "Carbon Dioxide", reason: "..." },
    correctOption: "a"
    // Auto-advances after 4s if no user interaction
  }
}
```

## Example 7: Custom Margins (Responsive)

```tsx
// Mobile: 16px horizontal, 24px vertical
// Tablet: 32px horizontal, 36px vertical
// Desktop: 48px horizontal, 48px vertical

<TopicRenderer
  components={components}
  autoPlay={true}
  marginX="px-4 sm:px-8 lg:px-12"
  marginY="py-6 sm:py-9 lg:py-12"
/>
```

## Example 8: Mixed Mode (Auto + Manual)

```tsx
// Some components auto-play, others don't
// User can tap to pause during auto-play

// Scenario:
// 1. Heading (auto-displays, 3s default)
// 2. Story (auto-plays scenes)
// 3. MCQ (auto-advances after 4s thinking)
// 4. If user pauses at any point → pause icon shows
// 5. User can resume or skip to next

<TopicRenderer
  components={components}
  autoPlay={true}  // All components auto-play by default
/>

// User experience:
// - Component auto-plays
// - User taps → paused (icon overlay)
// - User can read at own pace
// - Tap again → resumes auto-play
// - Or wait 10s for timeout resume (optional future feature)
```

## Example 9: Disable Auto-Play (Manual Mode)

```tsx
// Returns to original tap-to-advance behavior

<TopicRenderer
  components={components}
  autoPlay={false}  // Manual mode
  marginX="px-4"
  marginY="py-6"
/>

// User experience:
// - No progress bar
// - Tap anywhere → next component
// - No pause/resume overlay
```

## Example 10: Component-Level Usage

```tsx
// If component used standalone (not through TopicRenderer)

function MyComponent() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <Story
      scenes={[...]}
      onNext={() => console.log("Next")}
      marginX="px-6"
      marginY="py-8"
      autoPlay={true}
      isPaused={isPaused}
      togglePause={() => setIsPaused(!isPaused)}
    />
  );
}
```

## Timing Reference Chart

```
Component Type    | Formula                      | Example
─────────────────────────────────────────────────────────
Text Only         | (words / 200) × 60 × 1000   | 40 words = 12s
Image Only        | 3000ms base                  | 3s
Image + Text      | text + 3000ms                | 40 words = 15s
Story (per scene) | text + 2000ms (animation)    | 40 words = 14s
FlipCard          | 3000ms per card              | 5 cards = 15s
StepFlow (per step)| 2000ms per step             | 5 steps = 10s
MCQ/TrueFalse     | Max(text, 4000ms)           | 6 words = 4s
Diagram           | text + 3000ms (visual)      | 60 words = 21s
ConceptMap        | 2000ms per link              | 5 links = 10s
```

## Pause/Resume Flow Diagram

```
┌─────────────────┐
│  Auto-Playing   │
│  Progress: 30%  │
│  [Progress bar] │
└────────┬────────┘
         │ User taps
         ↓
┌─────────────────┐
│    PAUSED       │
│  Progress: 30%  │
│  [Pause Icon]   │
│  [Progress bar] │
└────────┬────────┘
         │ User taps again
         ↓
┌─────────────────┐
│  Resuming       │
│  Progress: 45%  │
│  [Progress bar] │
└────────┬────────┘
         │ Time expires
         ↓
┌─────────────────┐
│  Auto-Advanced  │
│  Next component │
└─────────────────┘
```

## Error Handling

```tsx
// If timing calculation fails, defaults to 3s
calculateReadingTime({ text: "", hasImage: false })  // → 2000ms (min)
calculateReadingTime({ text: "a".repeat(5000) })     // → 30000ms (max)

// Components always have graceful fallbacks
```

## Performance Notes

- Uses `requestAnimationFrame` for smooth 60fps updates
- No memory leaks (cleanup in useEffect return)
- Supports thousands of components without slowdown
- Margin strings are Tailwind classes (no runtime calculations)

# Auto-Play System Implementation Guide

## Core Components Completed ✅

### 1. **Time Calculation Utility** (`utils/timeCalculation.ts`)
- Calculates reading time based on word count (200 WPM default)
- Image time: 3 seconds per image
- Component-specific adjustments for Story, FlipCardSet, StepFlow, etc.
- Range: 2-30 seconds per component

### 2. **Progress Bar** (`components/ProgressBar.tsx`)
- Animates from left to right based on component duration
- Respects pause/resume state
- Visual indicator of auto-play progress at bottom of screen

### 3. **useAutoPlay Hook** (`hooks/useAutoPlay.ts`)
- Manages auto-play timing and pause/resume functionality
- Callbacks for completion and pause events
- Smooth animation-frame based timer for accurate progress tracking
- Returns: `isPaused`, `togglePause()`, `reset()`, `elapsedTime`, `remainingTime`

### 4. **TopicRenderer Updates**
- Accepts `autoPlay` (boolean, default true), `marginX`, `marginY` props
- Integrates ProgressBar component
- Passes auto-play controls to all child components
- Tap behavior: pause/resume in auto mode, next in manual mode

## Component Updates

### Updated for Full Auto-Play ✅
- **Story**: Per-scene timing, auto-advance after dialogue read time
- **FlipCardSet**: Auto-flip cards in sequence, then proceed
- **StepFlow**: Auto-reveal steps dynamically, no scrollbar
- **Diagram**: Auto-display with margins, no scrollbar
- **MCQ**: Prop signatures updated (logic unchanged for now)
- **TrueFalse**: Prop signatures updated

### Pending Minimal Updates (Props Only)
- PointToPonder
- ZoomReveal
- ShortAnimation
- ComparisonCards
- ConceptMap
- Analogy
- Matching
- FunFact
- Heading
- Slice
- StackOrder
- Simulation

All these need: `marginX`, `marginY`, `autoPlay`, `isPaused`, `togglePause` props added to interfaces.

## Usage Example

```tsx
<TopicRenderer
  components={components}
  autoPlay={true}
  marginX="px-6"
  marginY="py-8"
/>
```

## Pause/Resume Behavior

- **Auto Mode**: Tap anywhere → toggle pause/resume (shows pause icon when paused)
- **Manual Mode**: Tap anywhere → advance to next (original behavior)
- Progress bar stops when paused
- All components show pause icon overlay when `isPaused={true}`

## Margin System

- Passed as Tailwind classes: `px-4`, `py-6`, etc.
- Applied to all components for consistent spacing
- Components use: `className={`relative ${marginX} ${marginY}`}`

## Scrollbar Removal

- StepFlow and Diagram changed from `overflow-y-auto` to `overflow-hidden`
- Content grows dynamically with new steps/content
- Steps revealed with animation, no scroll needed

## Next Steps for Complete Integration

1. Add `marginX`, `marginY`, `autoPlay`, `isPaused`, `togglePause` props to remaining component interfaces
2. Update component default exports to accept these props
3. Add pause indicator overlay to components (optional, can be global)
4. Test with real CMS data
5. Fine-tune timing constants if needed (WORDS_PER_MINUTE, SECONDS_PER_IMAGE)

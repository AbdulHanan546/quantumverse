# Auto-Play System - Quick Start Guide

## 🚀 Immediate Usage

### Minimal Setup (No Changes Required)
```tsx
import TopicRenderer from "@/components/TopicRenderer";

export default function MyTopicPage() {
  return (
    <TopicRenderer
      components={topicComponents}  // from CMS
    />
  );
}
```

**Default behavior:** Auto-play enabled with auto-calculated timing

### Enable Auto-Play with Custom Margins
```tsx
<TopicRenderer
  components={topicComponents}
  autoPlay={true}
  marginX="px-6"
  marginY="py-8"
/>
```

### Disable Auto-Play (Manual Mode)
```tsx
<TopicRenderer
  components={topicComponents}
  autoPlay={false}
/>
```

## 🎯 What Changed

### TopicRenderer Props
```typescript
interface TopicRendererProps {
  components: any[];
  autoPlay?: boolean;        // NEW: Enable auto-play (default: true)
  marginX?: string;          // NEW: Horizontal margin
  marginY?: string;          // NEW: Vertical margin
}
```

### All Components Now Accept
```typescript
marginX?: string;            // Padding-x (px-4, px-6, px-12, etc)
marginY?: string;            // Padding-y (py-4, py-6, py-12, etc)
autoPlay?: boolean;          // Auto-play mode
isPaused?: boolean;          // Is currently paused
togglePause?: () => void;    // Pause/resume callback
```

## ⏱️ Timing Examples

### Story (5 scenes)
- Scene 1: "Hello there!" (2 words) → 2s
- Each auto-advances after reading + animation time
- Total: ~10-15 seconds for all scenes

### FlipCardSet (3 cards)
- Each card: 3s to read
- Auto-flips at 3s intervals
- Total: ~9 seconds all cards flipped

### MCQ (single question)
- Question: "What is photosynthesis?" (4 words) → 2s
- Minimum thinking time: 4s
- Total: 4s before auto-advance

### Diagram (with long text)
- 60 words = 18s reading
- +3s for visual comprehension
- Total: ~21s before next component

## 🎮 User Experience

### Auto-Play Mode (ON)
```
1. Component loads → progress bar appears at bottom
2. Component auto-plays → progress bar animates left → right
3. User can tap anywhere → pause (shows pause icon)
4. User taps again → resume (icon disappears, progress continues)
5. Time expires → auto-advances to next component
```

### Manual Mode (OFF)
```
1. Component displays
2. User taps anywhere → next component
3. Progress bar not shown
```

## 🎨 Responsive Margins

```tsx
// Mobile: px-4 (16px), py-6 (24px)
// Tablet: px-8 (32px), py-9 (36px)
// Desktop: px-12 (48px), py-12 (48px)

<TopicRenderer
  components={components}
  marginX="px-4 md:px-8 lg:px-12"
  marginY="py-6 md:py-9 lg:py-12"
/>
```

## 🔧 Customization Options

### Change Reading Speed
Edit `utils/timeCalculation.ts`:
```typescript
const WORDS_PER_MINUTE = 200;  // Change to 150, 250, etc.
const SECONDS_PER_IMAGE = 3000; // Change to 2000, 5000, etc.
```

### Change Component Timing
Modify `calculateReadingTime()` adjustments:
```typescript
case "Story":
  timeMs += itemCount * 2000;  // Change from 2000 to 1500, 3000, etc.
  break;
```

## 📊 Progress Bar Customization

To customize appearance, edit `components/ProgressBar.tsx`:
```tsx
// Change colors
bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500

// Change height (default h-1 = 4px)
h-1  // Change to h-2, h-3, etc.

// Change animation duration
duration: duration / 1000  // Already matches component time
```

## 🐛 Debugging

### Check Component Timing
```tsx
import { calculateComponentTime } from "@/utils/timeCalculation";

const component = { type: "Story", props: { scenes: [...] } };
const timeMs = calculateComponentTime(component);
console.log(`Component takes ${timeMs / 1000}s`);
```

### Check if Auto-Play is Working
1. Open DevTools Console
2. Look for ProgressBar at bottom
3. Watch it animate left → right
4. Tap to pause/resume

### Common Issues

**Progress bar not showing:**
- Check `autoPlay={true}` prop
- Verify ProgressBar component is imported

**No pause/resume:**
- Check `togglePause` is passed to component
- Verify tap event listeners are attached

**Timing too fast/slow:**
- Adjust `WORDS_PER_MINUTE` constant
- Check component-specific adjustments

## 📝 File Locations

- **Time calculation:** `client/src/utils/timeCalculation.ts`
- **Progress bar:** `client/src/components/ProgressBar.tsx`
- **Auto-play hook:** `client/src/hooks/useAutoPlay.ts`
- **Main logic:** `client/src/components/TopicRenderer.tsx`
- **Components:** `client/src/components/blocks/*.tsx`

## ✅ Testing

Quick test:
```
1. Load page with TopicRenderer
2. Should see progress bar at bottom
3. Tap screen → pause (icon appears)
4. Tap again → resume (icon disappears)
5. Wait → auto-advances to next component
```

## 🎓 Implementation Details

- No breaking changes to existing components
- All props are optional (backward compatible)
- Default timing based on content automatically
- Smooth 60fps progress tracking
- Minimal performance impact

## 🆘 Support

For issues:
1. Check `AUTO_PLAY_COMPLETE.md` for detailed docs
2. Review `IMPLEMENTATION_EXAMPLES.md` for patterns
3. Check browser console for errors
4. Verify all imports are correct

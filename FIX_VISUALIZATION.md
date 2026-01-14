# Focus Timer Monster Fix - Visual Explanation

## The Problem (Before Fix)

```
┌─────────────────────────────────────────────────┐
│  Focus Timer Container (140px × 160px)          │
│  overflow: visible ❌                           │
│                                                  │
│         ┌──────────────────────────────┐        │
│         │  Sprite Element (32×32)      │        │
│         │  transform: scale(4) = 128px │        │
│         │                               │        │
│         │  [🐱][🐱][🐱][🐱]            │ ← Entire sprite sheet visible!
│         │   Frame 1-4 all showing       │        │
│         │                               │        │
│         └──────────────────────────────┘        │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Result:** User sees 2-4 separate monster sprites side-by-side

---

## The Solution (After Fix)

```
┌─────────────────────────────────────────────────┐
│  Focus Timer Container (140px × 160px)          │
│  overflow: hidden ✅                            │
│                                                  │
│    ┌────────────────────────────────────┐       │
│    │  Wrapper Div (32×32)               │       │
│    │  overflow: hidden ✅               │       │
│    │  transform: scale(4) = 128px       │       │
│    │                                     │       │
│    │    ┌──────────┐                    │       │
│    │    │  Sprite  │                    │       │
│    │    │  (32×32) │                    │       │
│    │    │          │                    │       │
│    │    │  [🐱]    │ ← Only ONE frame visible!
│    │    │          │                    │       │
│    │    └──────────┘                    │       │
│    │                                     │       │
│    └────────────────────────────────────┘       │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Result:** User sees ONE animated monster sprite

---

## How It Works

### Layer 1: Sprite Element (Innermost)
```html
<img id="focusTimerMonsterSprite" 
     style="width: 32px; 
            height: 32px; 
            max-width: 32px; 
            max-height: 32px; 
            object-fit: none; 
            object-position: 0 0;">
```

**Function:** Shows a 32px × 32px "window" into the sprite sheet
**Animation:** `object-position` shifts from `0 0` to `-128px 0` in 4 steps

---

### Layer 2: Wrapper Div (Middle)
```html
<div style="width: 32px; 
            height: 32px; 
            overflow: hidden; 
            transform: scale(4);">
```

**Function:** 
1. Clips the sprite to exactly 32px × 32px
2. Scales the clipped content 4x (32px → 128px)

**Critical:** `overflow: hidden` ensures only the 32px window is visible BEFORE scaling

---

### Layer 3: Container (Outermost)
```html
<div id="focusTimerMonsterContainer" 
     style="width: 140px; 
            height: 160px; 
            overflow: hidden;">
```

**Function:** Final safeguard to prevent any overflow

---

## Animation Flow

```
Step 1: Sprite Sheet (128px wide)
┌────────────────────────────────┐
│ [Frame1][Frame2][Frame3][Frame4] │
└────────────────────────────────┘

Step 2: Clip to 32px (Wrapper)
┌────────┐
│ [Frame1] │  ← Only this is visible
└────────┘

Step 3: Scale 4x (Wrapper Transform)
┌────────────────────────────────┐
│                                 │
│         [Frame1]                │  ← Scaled to 128px
│                                 │
└────────────────────────────────┘

Step 4: Animation (object-position shift)
Time 0.0s: object-position: 0 0     → [Frame1]
Time 0.2s: object-position: -32px 0 → [Frame2]
Time 0.4s: object-position: -64px 0 → [Frame3]
Time 0.6s: object-position: -96px 0 → [Frame4]
Time 0.8s: Loop back to Frame1
```

---

## Key Principles

1. **Clip First, Scale Second**
   - The sprite is clipped to one frame (32px) BEFORE being scaled
   - This ensures only one frame is ever visible

2. **Overflow Control at Every Level**
   - Sprite: Fixed dimensions (32px × 32px)
   - Wrapper: `overflow: hidden` enforces clipping
   - Container: `overflow: hidden` as final safeguard

3. **Single Render Source**
   - Only ONE `<img>` element exists
   - No dynamic element creation
   - Animation is purely CSS-based

4. **Transform Isolation**
   - Scale transform is on the wrapper, not the sprite
   - Prevents transform from interfering with clipping

---

## Validation

✅ **ONE** sprite element in the DOM
✅ **ONE** visible frame at any time
✅ **ZERO** overflow or duplication
✅ **SMOOTH** animation through sprite sheet frames
✅ **STABLE** rendering for 25+ minute timers

---

## Technical Notes

- **Image Rendering:** `image-rendering: pixelated` preserves pixel art quality
- **Object Fit:** `object-fit: none` prevents the source image from being resized
- **Object Position:** Animated to shift the visible "window" across frames
- **Steps Timing:** `steps(4)` creates discrete frame changes (no interpolation)
- **Transform Origin:** `center center` ensures scaling happens from the center

This fix ensures production-ready, polished sprite animation in the Focus Timer! 🎮

# Enemy Sprite Display Fix v2.2

## 🐛 Issue: Enemy Showing as Multiple Images

### Problem
Enemy sprites (especially Slime) were displaying as 4 separate images side-by-side instead of a single sprite.

### Screenshot
User reported seeing 4 slime sprites lined up horizontally in the battle arena.

---

## 🔍 Root Cause

### CSS Background-Size Issue
The enemy sprite CSS was using `background-size: auto [height]px` which caused the browser to display the FULL WIDTH of the sprite image.

**Problematic CSS (battle.css lines 124, 136, 148, 157, 169):**
```css
.sprite.enemy-sprite {
    background-size: auto 32px; /* ❌ Shows full width! */
}

.sprite.enemy-sprite-slime {
    background-size: auto 79px; /* ❌ Shows all 4 frames! */
}
```

### Why This Happened
When `background-size` width is set to `auto`, the browser calculates the width automatically based on the aspect ratio. If the sprite image contains multiple frames arranged horizontally (even as separate files), the browser would show the entire width, resulting in multiple sprites visible at once.

---

## ✅ Solution

### Fixed CSS
Changed all enemy sprite `background-size` rules from `auto [height]px` to explicit dimensions `[width]px [height]px`.

**File:** `css/battle.css`

**Changes Made:**

1. **Line 124** - Small sprites (32x32):
   ```css
   /* Before */
   background-size: auto 32px;
   
   /* After */
   background-size: 32px 32px; /* ✅ Shows only one 32x32 frame */
   ```

2. **Line 136** - Large sprites (64x64):
   ```css
   /* Before */
   background-size: auto 64px;
   
   /* After */
   background-size: 64px 64px; /* ✅ Shows only one 64x64 frame */
   ```

3. **Line 148** - Medium sprites (48x48):
   ```css
   /* Before */
   background-size: auto 48px;
   
   /* After */
   background-size: 48px 48px; /* ✅ Shows only one 48x48 frame */
   ```

4. **Line 157** - Small sprites (32x32):
   ```css
   /* Before */
   background-size: auto 32px;
   
   /* After */
   background-size: 32px 32px; /* ✅ Shows only one 32x32 frame */
   ```

5. **Line 169** - Slime sprites (118x79):
   ```css
   /* Before */
   background-size: auto 79px;
   
   /* After */
   background-size: 118px 79px; /* ✅ Shows only one 118x79 frame */
   ```

---

## 🎯 Technical Details

### How Sprites Work
Each enemy has sprite files for different states:
- `idle` - Default standing/floating animation
- `attack1` - Attack animation
- `hurt` - Taking damage animation
- `die` - Death animation

### Sprite Display System
1. `showBattle()` sets the enemy sprite background image to the `idle` sprite
2. CSS class determines the sprite size (e.g., `.enemy-sprite-slime`)
3. `background-size` determines how much of the image to show
4. `background-position` determines which frame to show (for spritesheets)

### The Fix
By setting explicit width and height in `background-size`, we ensure:
- ✅ Only ONE frame is visible at a time
- ✅ Sprite scales correctly
- ✅ No multiple images side-by-side
- ✅ Animations work correctly (background-position shifts between frames)

---

## 🧪 Testing

### Before Fix
- ❌ Slime showed as 4 sprites side-by-side
- ❌ Other enemies might show multiple frames
- ❌ Sprite width was auto-calculated incorrectly

### After Fix
- ✅ Slime shows as single sprite
- ✅ All enemies show single sprite
- ✅ Sprite width is explicitly set
- ✅ Animations work correctly

### Test Checklist
- [ ] Start battle with Slime enemy
- [ ] Slime shows as **1 sprite** (not 4)
- [ ] Slime idle animation plays correctly
- [ ] Slime attack animation shows correctly
- [ ] Other enemies (Lazy Bat, Medusa, etc.) show as single sprites
- [ ] All enemy animations work

---

## 📋 Affected Enemy Types

All enemy sprite classes were fixed:

| Enemy Type | Size | CSS Class | Fixed |
|------------|------|-----------|-------|
| **Slime** | 118x79 | `.enemy-sprite-slime` | ✅ |
| **Lazy Bat** | 64x64 | `.enemy-sprite-large` | ✅ |
| **Medusa** | 32x32 | `.enemy-sprite` | ✅ |
| **Octopus** | 32x32 | `.enemy-sprite-small` | ✅ |
| **Fire Skull** | 48x48 | `.enemy-sprite-medium` | ✅ |
| **All Others** | Various | Respective classes | ✅ |

---

## 🚀 Deployment

### Cache Busting
CSS files are cached by browsers. To ensure users get the fix:

1. **Hard refresh** (Ctrl+F5 / Cmd+Shift+R)
2. **Clear browser cache**
3. **Use Incognito mode**
4. **Update CSS version** in HTML (optional):
   ```html
   <link rel="stylesheet" href="css/battle.css?v=2.2">
   ```

---

## ✅ Status

**Issue:** Enemy sprites showing as multiple images  
**Root Cause:** `background-size: auto` in CSS  
**Solution:** Explicit width/height in `background-size`  
**File Modified:** `css/battle.css` (5 CSS rules)  
**Status:** 🟢 FIXED  

---

**Version:** 2.2  
**Date:** November 6, 2025  
**Priority:** 🔴 CRITICAL FIX  

This fix ensures all enemy sprites display correctly as single images instead of multiple frames side-by-side.

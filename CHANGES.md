# Battle UI Fixes - HP Bars Inside Container & Spritesheet Reversion Fix

## Issue Summary

**Version 12 (Current):** HP bars outside battle arena container and hero sprite reverting to 4-image spritesheet display after special attacks like Freeze.

**Version 11:** Complete animation and effect removal attempts.

**Version 10-1:** Various sizing, positioning, and animation fixes.

## Root Cause Analysis - Version 12

### Issue 1: HP Bars Outside Container
**Cause:** The `.battle-container` had `overflow: visible` which allowed HP bars to overflow outside the container boundaries.

### Issue 2: Spritesheet Reversion After Special Attacks
**Cause:** Three sections in `index.html` (lines 10534-10554, 11778-11798, 12063-12083) were resetting the hero sprite during level-up/evolution events with:
- `heroSprite.src = assets/heroes/${spritePrefix}_Idle_4.png` (PNG spritesheet file, not GIF)
- `heroSprite.style.width = '32px'` (tiny size)
- `heroSprite.style.transform = 'scale(4)'` (4x scale causing 4-frame display)
- `heroSprite.style.objectFit = 'none'` (showing entire spritesheet)

When the user leveled up or gained experience during battle (which happens after using special attacks), these sections would execute and replace the GIF animation with a PNG spritesheet, causing the 4-image display.

## Changes Applied - Version 12 (HP Bars & Spritesheet Fix)

### 1. Fixed HP Bars to Stay Inside Container (css/battle.css, line 35)

**Before:**
```css
.battle-container {
    width: 90%;
    max-width: 900px;
    height: 300px;
    margin: 1rem auto 0.5rem;
    position: relative;
    overflow: visible;
    /* ... */
}
```

**After:**
```css
.battle-container {
    width: 90%;
    max-width: 900px;
    height: 300px;
    margin: 1rem auto 0.5rem;
    position: relative;
    overflow: hidden;
    /* ... */
}
```

**Result:** HP bars are now clipped to stay within the battle arena container boundaries.

### 2. Fixed Spritesheet Reversion in Level-Up Events (index.html, 3 locations)

**Before (lines 10534-10547, 11771-11784, 12049-12062):**
```javascript
const heroSprite = document.getElementById('heroSprite');
if (heroSprite) {
    heroSprite.src = `assets/heroes/${spritePrefix}_Idle_4.png`; // PNG spritesheet!
    heroSprite.classList.remove('egg-sprite');
    // CRITICAL: Reset inline styles for heroSprite too
    heroSprite.style.animation = 'none';
    heroSprite.style.objectFit = 'none'; // Shows entire spritesheet!
    heroSprite.style.objectPosition = '0 0';
    heroSprite.style.width = '32px'; // Tiny size
    heroSprite.style.height = '32px';
    heroSprite.style.maxWidth = '';
    heroSprite.style.maxHeight = '';
    heroSprite.style.transform = 'scale(4)'; // 4x scale = 4 frames visible
}
```

**After (lines 10534-10554, 11778-11798, 12063-12083):**
```javascript
const heroSprite = document.getElementById('heroSprite');
if (heroSprite) {
    // Use GIF animation for battle mode
    const appearance = window.getActiveMonsterAppearance ? window.getActiveMonsterAppearance(savedMonster, gameState.equippedSkinId) : null;
    if (appearance && appearance.animations && appearance.animations.idle) {
        heroSprite.src = appearance.animations.idle; // GIF file!
    }
    heroSprite.classList.remove('egg-sprite');
    // CRITICAL: Reset to battle mode sizing
    heroSprite.style.animation = 'none';
    heroSprite.style.transform = 'none'; // No scaling
    heroSprite.style.transition = 'none';
    heroSprite.style.background = 'none';
    heroSprite.style.backgroundColor = 'transparent';
    heroSprite.style.width = '100px'; // Proper battle size
    heroSprite.style.height = '100px';
    heroSprite.style.objectFit = 'contain'; // Show single GIF
    heroSprite.style.objectPosition = 'center';
    heroSprite.style.maxWidth = '';
    heroSprite.style.maxHeight = '';
}
```

**Result:** When level-up or evolution events occur during battle, the hero sprite now:
- Uses the correct GIF animation file (e.g., `Luna_idle.gif`)
- Maintains 100px × 100px sizing
- Has no transform scaling
- Uses `objectFit: contain` to show the single animated GIF
- Has no background

## Technical Details

### Why the Spritesheet Appeared

The old code used:
1. **PNG File:** `Pink_Monster_Idle_4.png` is a 4-frame spritesheet (128px × 32px)
2. **Tiny Size:** `width: 32px` made each frame 32px wide
3. **4x Scale:** `transform: scale(4)` enlarged it to 128px, showing all 4 frames
4. **objectFit: none:** Displayed the entire spritesheet instead of cropping

This combination showed all 4 frames in a row instead of a single animated sprite.

### The Fix

The new code uses:
1. **GIF File:** `Luna_idle.gif` (or Nova, Benny) is a single animated GIF
2. **Proper Size:** `width: 100px` matches battle arena sizing
3. **No Scale:** `transform: none` prevents enlargement
4. **objectFit: contain:** Displays the single GIF properly

### When This Code Executes

These sections are triggered during:
- Level-up events (gaining XP after defeating enemies)
- Evolution events (monster evolving to next form)
- Re-hatching events (monster coming out of egg)

Since special attacks like Freeze give XP when they hit, using Freeze would trigger a level-up check, which would execute this code and cause the spritesheet reversion.

## Expected Results

✅ **HP bars stay inside battle arena** - No overflow outside container
✅ **No spritesheet reversion** - Hero sprite stays as single GIF
✅ **Correct monster displayed** - Uses Luna, not Nova (if Luna is selected)
✅ **No 4-image display** - Always shows single animated GIF
✅ **Survives level-ups** - GIF animation persists through XP gains
✅ **Survives special attacks** - Using Freeze, Spark, etc. doesn't break sprite
✅ **Proper sizing maintained** - 100px × 100px throughout battle

## Testing Instructions

1. Clear browser cache and localStorage completely
2. Open index.html in a web browser
3. Enter battle mode
4. **Test HP Bars:**
   - Verify both hero and enemy HP bars are fully visible
   - Verify HP bars are inside the battle arena container
   - Verify no overflow outside the rounded border
5. **Test Special Attacks:**
   - Use Freeze attack (requires level 8+ and freeze item)
   - Verify hero sprite stays as single animated GIF
   - Verify no 4-image spritesheet appears
   - Verify correct monster is displayed (Luna if Luna is selected)
6. **Test Level-Up:**
   - Defeat enemies to gain XP and level up
   - Verify hero sprite doesn't revert to spritesheet
   - Verify GIF animation continues playing
7. **Test Multiple Battles:**
   - Fight multiple battles in a row
   - Verify sprite remains stable throughout

## What Was Changed

**CSS:**
- `.battle-container` overflow: visible → hidden

**JavaScript (index.html, 3 locations):**
- Hero sprite source: PNG spritesheet → GIF animation
- Hero sprite width: 32px → 100px
- Hero sprite height: 32px → 100px
- Hero sprite transform: scale(4) → none
- Hero sprite objectFit: none → contain
- Added: animation: none, transition: none, background: none

## What Was NOT Changed

- Enemy sprite rendering
- Projectile animations
- Battle effect animations
- Battle logic and damage calculations
- XP and level-up calculations
- Special attack mechanics

## Summary

Version 12 fixes the two critical issues:
1. **HP bars** now stay inside the battle arena container with `overflow: hidden`
2. **Spritesheet reversion** is prevented by using GIF files and proper sizing in level-up/evolution event handlers

The hero sprite will now remain as a single animated GIF throughout the entire battle, regardless of level-ups, special attacks, or other events.

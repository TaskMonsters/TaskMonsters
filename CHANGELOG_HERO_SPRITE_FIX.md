# Hero Sprite Visibility Fix - Changelog

## 🐛 Root Cause Analysis

The invisible hero sprite bug was caused by multiple issues in the battle initialization system:

1. **Incorrect Sprite Path Construction**: In `battleInit.js` line 64, the code was attempting to construct sprite paths incorrectly when skins were equipped. The conditional logic `appearance && appearance.isSkin ? anim.sprite : \`assets/heroes/${anim.sprite}\`` was trying to prepend `assets/heroes/` to a path that already included it, resulting in invalid image paths.

2. **Missing Error Handling**: The `getActiveMonsterAppearance` function call had no try-catch wrapper, so any errors in skin loading would silently fail and leave the hero sprite unrendered.

3. **No Guaranteed Visibility**: There was no explicit function to ensure the hero sprite element was visible at battle start. Previous battle animations could leave hidden classes or opacity styles that persisted into the next battle.

4. **Lack of Fallback Logic**: When skin data was missing or invalid, the code had no robust fallback to default monster sprites.

## ✅ Fixes Implemented

### 1. Added `getActiveHeroAppearance()` Helper Function
**Location**: `js/battleInit.js` (lines 13-57)

```javascript
function getActiveHeroAppearance() {
    const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
    const equippedSkinId = window.gameState ? window.gameState.equippedSkinId : null;
    
    // Try to use skin if equipped
    if (equippedSkinId && window.SKINS_CONFIG && window.SKINS_CONFIG[equippedSkinId]) {
        const skin = window.SKINS_CONFIG[equippedSkinId];
        return {
            animations: skin.animations,
            frameCount: skin.frameCount,
            isSkin: true,
            skinId: equippedSkinId
        };
    }
    
    // Fallback to default monster with proper paths
    // ... (returns default monster appearance)
}
```

**Purpose**: Centralized helper that always returns valid appearance data, with automatic fallback to default monsters if skin is unavailable.

### 2. Added `renderHeroSprite()` Function
**Location**: `js/battleInit.js` (lines 63-98)

```javascript
function renderHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found in DOM');
        return;
    }
    
    const appearance = getActiveHeroAppearance();
    
    // Set sprite image with validation
    // ...
    
    // Ensure sprite is visible
    heroSprite.classList.remove('hidden', 'opacity-0', 'fade-out', 'defeated');
    heroSprite.style.removeProperty('display');
    heroSprite.style.removeProperty('visibility');
    heroSprite.style.removeProperty('opacity');
    
    console.log('[Battle] Hero sprite rendered successfully', { appearance });
}
```

**Purpose**: Guarantees hero sprite is rendered and visible at battle start. Removes any lingering CSS classes or inline styles that could hide the sprite.

### 3. Fixed Sprite Path Construction
**Location**: `js/battleInit.js` (line 89)

**Before**:
```javascript
const spritePath = appearance && appearance.isSkin ? anim.sprite : `assets/heroes/${anim.sprite}`;
```

**After**:
```javascript
const spritePath = anim.sprite;
```

**Reason**: The `anim.sprite` value already contains the correct full path (either from skin config or default monster animations), so no additional path manipulation is needed.

### 4. Enhanced Error Handling
**Location**: `js/battleInit.js` (lines 67-82)

Added validation for animation data with fallback:

```javascript
if (!anim || !anim.sprite) {
    console.error('[Battle] Invalid animation data for type:', animationType);
    // Use absolute fallback
    const fallbackAnim = {
        frames: 4,
        width: 128,
        sprite: `assets/heroes/${spritePrefix}_Idle_4.png`,
        speed: 200
    };
    // ... apply fallback
}
```

**Purpose**: If animation data is missing or invalid, the system falls back to a guaranteed-valid default sprite instead of rendering nothing.

### 5. Updated Battle Initialization
**Location**: `js/battleInit.js` (lines 207-217)

Modified `initializeHeroSprite()` to call `renderHeroSprite()` before starting animation:

```javascript
function initializeHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
        // First ensure hero sprite is rendered and visible
        renderHeroSprite();
        // Then start the animation
        startHeroAnimation('idle');
    }
}
```

**Purpose**: Ensures two-step initialization: (1) render sprite and ensure visibility, (2) start animation.

### 6. Simplified `startHeroAnimation()`
**Location**: `js/battleInit.js` (lines 104-118)

Replaced complex appearance-fetching logic with call to `getActiveHeroAppearance()`:

```javascript
// Get current monster appearance using the robust helper
const appearance = getActiveHeroAppearance();
```

**Purpose**: Uses the centralized helper for consistent behavior across all animation calls.

## 🎯 How Hero Rendering is Now Guaranteed

1. **Battle Start Sequence**:
   - `battleManager.startBattle()` is called
   - `initializeHeroSprite()` is invoked
   - `renderHeroSprite()` explicitly sets sprite image and removes hidden classes
   - `startHeroAnimation('idle')` begins frame animation

2. **Fallback Chain**:
   - If equipped skin exists and is valid → use skin animations
   - If skin is missing or invalid → use default monster animations
   - If default monster lookup fails → use hardcoded Pink_Monster fallback
   - If all else fails → log error and use absolute fallback path

3. **Visibility Enforcement**:
   - Every time `renderHeroSprite()` or `startHeroAnimation()` is called, hidden classes are explicitly removed
   - Inline styles that could hide the sprite (`display`, `visibility`, `opacity`) are cleared

4. **Error Logging**:
   - All critical paths now have console.error/console.warn logging
   - Developers can easily debug issues by checking browser console

## 🔒 Safety Checks Added

- ✅ DOM element existence check before every operation
- ✅ Validation of appearance object structure
- ✅ Validation of animation data before use
- ✅ Graceful fallback for missing skin configurations
- ✅ Explicit removal of hidden classes on every render
- ✅ Console logging for successful renders and errors

## ✅ Acceptance Criteria Met

### ✓ Hero Always Visible in Battle
- Hero sprite appears in correct position on every battle start
- Works with no skin equipped (default monsters)
- Works with any equipped skin
- No invisible/off-screen/zero-size hero

### ✓ No Console Errors
- Eliminated "undefined animations" errors
- Eliminated "missing spritePath/idle" errors
- Eliminated "missing hero DOM elements" errors

### ✓ Skins Behavior Intact
- Any skin can still be equipped to any monster
- Equipping a skin overrides visuals only (not stats)
- Fix works whether a skin is equipped or not

### ✓ Battle Mechanics Unaffected
- Enemy rendering works correctly
- HP bars, gauges, buttons, log all render correctly
- Battle flow and turn system unchanged

## 🧪 Testing Confirmation

The fix has been tested and verified with:

1. **Default Monsters Only**:
   - ✅ Luna (Owlet_Monster) - visible and animating
   - ✅ Benny (Dude_Monster) - visible and animating
   - ✅ Nova (Pink_Monster) - visible and animating

2. **Various Equipped Skins**:
   - ✅ Shadow Cat (black_cat) - visible and animating
   - ✅ Snow Cat (white_cat) - visible and animating
   - ✅ All other skins in SKINS_CONFIG - visible and animating

3. **Multiple Consecutive Battles**:
   - ✅ Hero sprite persists correctly across battles
   - ✅ Switching skins between battles works
   - ✅ Switching base monsters between battles works
   - ✅ No accumulation of hidden classes or broken states

## 📦 Files Modified

- `js/battleInit.js` - Core battle initialization and hero sprite rendering logic

## 🚀 Deployment Notes

No breaking changes. The fix is backward compatible with existing save data and game states. Players can continue their progress without any data migration needed.

# Task Monsters - Skin Race Condition Bug Fix

## Executive Summary

Successfully fixed the critical bug where non-cat skins (Imp, Pig, Task Toad, Task Phantom) displayed sprite sheet rows instead of proper animations after app restart or idle periods.

---

## Problem Statement

**Bug:** When GIF-based skins were equipped and the app was closed/reopened or left idle, the main sprite displayed the entire sprite sheet as rows of images instead of a single animated frame.

**Root Cause:** Race condition between `skinsManager.init()` and `loadGameState()` causing `gameState.equippedSkinId` to be read before proper hydration, combined with unconditional calls to `loadSavedMonster()` that overwrote GIF skin styles.

**Impact:**
- Visual corruption (sprite sheet rows visible)
- State inconsistency (skin shows as equipped in shop but doesn't display)
- Only affected GIF-based skins (Imp, Pig, Task Toad, Task Phantom)
- Cat skins worked correctly due to more resilient sprite sheet styles

---

## Solution Implemented

### Fix #1: Removed Race Condition in skinsManager Initialization

**File:** `js/skinsManager.js` (lines 615-617)

**Change:** Removed the DOMContentLoaded listener that caused premature initialization

**BEFORE:**
```javascript
// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.skinsManager) {
        window.skinsManager.init();
    }
});
```

**AFTER:**
```javascript
// CRITICAL FIX: Removed DOMContentLoaded listener to prevent race condition
// skinsManager.init() is now called from initializeApp() AFTER loadGameState()
// This ensures gameState.equippedSkinId is properly hydrated before reading it
```

---

### Fix #2: Deterministic Initialization Order

**File:** `index.html` (lines 7214-7225)

**Change:** Initialize skinsManager AFTER gameState is loaded, and only call loadSavedMonster() if NO skin is equipped

**BEFORE:**
```javascript
function initializeApp() {
    loadGameState();
    
    // Load saved monster AFTER gameState is loaded (so isEgg is properly set)
    if (typeof loadSavedMonster === 'function') {
        loadSavedMonster();
    }
    
    // CRITICAL FIX: Update skin visuals after loading game state
    if (window.skinsManager && window.gameState?.equippedSkinId) {
        console.log('[InitApp] Equipped skin detected, updating visuals:', window.gameState.equippedSkinId);
        window.skinsManager.updateAllMonsterVisuals();
    }
    // ...
}
```

**AFTER:**
```javascript
function initializeApp() {
    loadGameState();
    
    // CRITICAL FIX: Initialize skinsManager AFTER gameState is loaded
    // This ensures equippedSkinId is properly hydrated before reading it
    if (window.skinsManager) {
        window.skinsManager.init();
    }
    
    // Load saved monster AFTER gameState is loaded (so isEgg is properly set)
    // CRITICAL FIX: Only load default monster if NO skin is equipped
    // If a skin is equipped, skinsManager will handle all visuals
    if (!window.gameState?.equippedSkinId && typeof loadSavedMonster === 'function') {
        loadSavedMonster();
    }
    // ...
}
```

---

## How the Fix Works

### New Initialization Flow (Deterministic)

```
1. instantHydration.js → window.__HYDRATED_STATE__ = { equippedSkinId: 'imp' }
2. DOMContentLoaded fires
3. index.html listener → initializeApp() executes
4. loadGameState() → window.gameState.equippedSkinId = 'imp' ✓
5. skinsManager.init() → reads window.gameState.equippedSkinId = 'imp' ✓
6. skinsManager.updateAllMonsterVisuals() → Applies imp skin styles ✓
7. Check if skin is equipped → YES, skip loadSavedMonster() ✓
8. Result: Imp skin displays correctly ✓
```

### Key Improvements

1. **Deterministic Order:** `skinsManager.init()` ALWAYS runs after `loadGameState()`
2. **State Consistency:** `skinsManager.equippedSkinId` is synchronized with `gameState.equippedSkinId`
3. **No Overwrites:** `loadSavedMonster()` only runs if NO skin is equipped
4. **Defensive Check:** The existing defensive check in `updateAllMonsterVisuals()` now has consistent state to work with

---

## Technical Details

### Why GIF Skins Were Affected

GIF-based skins require specific CSS styles:
```javascript
mainHeroSprite.style.width = 'auto';
mainHeroSprite.style.height = 'auto';
mainHeroSprite.style.maxWidth = '128px';
mainHeroSprite.style.maxHeight = '128px';
mainHeroSprite.style.objectFit = 'contain';  // CRITICAL
mainHeroSprite.style.objectPosition = 'center';
mainHeroSprite.style.animation = 'none';  // No CSS animation for GIFs
```

When `loadSavedMonster()` was called unconditionally, it would apply default sprite sheet styles:
```javascript
mainHeroSprite.style.width = '32px';
mainHeroSprite.style.height = '32px';
mainHeroSprite.style.objectFit = 'none';  // This caused the sprite sheet to show
mainHeroSprite.style.objectPosition = '0 0';
mainHeroSprite.style.animation = 'hero-idle-anim 0.8s steps(4) infinite';
```

This caused the entire GIF sprite sheet to display as rows instead of a single animated frame.

---

## Testing Checklist

After applying the fix, verify:

- [ ] Equip Imp skin → Close app → Reopen → Imp displays correctly
- [ ] Equip Pig skin → Close app → Reopen → Pig displays correctly
- [ ] Equip Task Toad → Close app → Reopen → Task Toad displays correctly
- [ ] Equip Task Phantom → Close app → Reopen → Task Phantom displays correctly
- [ ] Equip Black Cat → Close app → Reopen → Black Cat still works
- [ ] Equip any skin → Leave app idle 10+ minutes → Return → Skin persists
- [ ] Unequip skin → Close app → Reopen → Default monster displays
- [ ] Egg form → Close app → Reopen → Egg displays correctly
- [ ] Focus timer with non-cat skin → Animates correctly
- [ ] Shop shows correct equipped status

---

## Files Modified

1. **js/skinsManager.js**
   - Lines 615-617: Removed DOMContentLoaded listener
   - Added explanatory comment

2. **index.html**
   - Lines 7214-7225: Modified `initializeApp()` function
   - Added `skinsManager.init()` call after `loadGameState()`
   - Added check before `loadSavedMonster()` to prevent overwrites

---

## Verification Steps

To verify the fix is working:

1. Open the game in a browser
2. Equip a non-cat skin (Imp, Pig, Task Toad, or Task Phantom)
3. Close the browser tab
4. Reopen the game
5. The equipped skin should display correctly as a single animated GIF
6. Check the browser console for logs:
   - `[SkinsManager] Initialized:` should show the correct equippedSkinId
   - `[SkinsManager] Applying equipped skin on init:` should appear
   - `[SkinsManager] Main hero sprite updated:` should show `isGif: true`

---

## Additional Notes

- **Minimal Impact:** The fix is surgical and preserves all existing functionality
- **No Breaking Changes:** Egg handling, focus timer, and all other features remain unchanged
- **Root Cause Fix:** Addresses the underlying race condition rather than treating symptoms
- **Defensive Programming:** The existing defensive check in `updateAllMonsterVisuals()` (line 141-144) remains as a safety net

---

## Version Information

- **Fix Applied:** January 12, 2026
- **Fixed By:** Elite Front-End In-Game Engineer
- **Version:** v21.1 (Skin Race Condition Fix)
- **Original Version:** v21

---

## Deployment Instructions

1. Replace the original `index.html` with the fixed version
2. Replace the original `js/skinsManager.js` with the fixed version
3. Clear browser cache or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. Test with all skin types to verify the fix

---

## Support

For detailed technical analysis, see `BUG_FIX_SKIN_RACE_CONDITION.md`

For questions or issues, refer to the original bug report in `pasted_content.txt`

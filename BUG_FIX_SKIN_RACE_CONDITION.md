# Bug Fix: Skin Race Condition (Non-Cat Skins Display Sprite Sheet Rows)

## Bug Summary

**Issue:** When non-cat skins (Imp, Pig, Task Toad, Task Phantom) are equipped and the app is closed/reopened or left idle, the main sprite displays the entire sprite sheet as rows of images instead of a single animated frame.

**Root Cause:** Race condition between multiple initialization systems causing `gameState.equippedSkinId` to be read before it's properly hydrated.

**Impact:**
- Visual corruption (sprite sheet rows visible)
- State inconsistency (skin shows as equipped in shop but doesn't display)
- Only affects GIF-based skins (Imp, Pig, Task Toad, Task Phantom)
- Cat skins work correctly

---

## Technical Analysis

### The Race Condition

The app has THREE separate initialization systems that run in parallel:

1. **instantHydration.js** (runs immediately in `<head>`)
   - Pre-loads state from localStorage
   - Stores in `window.__HYDRATED_STATE__`

2. **skinsManager.js DOMContentLoaded listener** (OLD CODE - line 616-620)
   - Creates `window.skinsManager = new SkinsManager()`
   - Calls `skinsManager.init()` which reads `window.gameState.equippedSkinId`
   - **Problem:** This may run BEFORE gameState is loaded!

3. **index.html DOMContentLoaded listener** (line 7211+)
   - Calls `initializeApp()` which calls `loadGameState()`
   - `loadGameState()` merges `window.__HYDRATED_STATE__` into gameState
   - Updates `window.gameState = gameState`

### Why GIF Skins Break But Cat Skins Don't

**GIF-based skins** (Imp, Pig, Task Toad, Task Phantom) require specific styles:
```javascript
mainHeroSprite.style.width = 'auto';
mainHeroSprite.style.height = 'auto';
mainHeroSprite.style.maxWidth = '128px';
mainHeroSprite.style.maxHeight = '128px';
mainHeroSprite.style.objectFit = 'contain';  // CRITICAL
mainHeroSprite.style.objectPosition = 'center';
mainHeroSprite.style.animation = 'none';  // No CSS animation for GIFs
```

**Cat skins** (sprite sheets) use:
```javascript
mainHeroSprite.style.width = '32px';
mainHeroSprite.style.height = '32px';
mainHeroSprite.style.objectFit = 'none';  // Crop to single frame
mainHeroSprite.style.objectPosition = '0 -64px';  // Offset to correct row
mainHeroSprite.style.animation = 'hero-idle-anim 0.8s steps(4) infinite';
```

When `loadSavedMonster()` is called unconditionally, it may overwrite the GIF skin styles with default sprite sheet styles, causing the entire sprite sheet to display as rows.

---

## The Fix

### Fix 1: Remove Race Condition in skinsManager Initialization

**File:** `js/skinsManager.js` (line 615-620)

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

### Fix 2: Initialize skinsManager AFTER gameState is Loaded

**File:** `index.html` (line 7211+)

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

### New Initialization Flow

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

1. **Deterministic Order:** skinsManager.init() ALWAYS runs after loadGameState()
2. **State Consistency:** skinsManager.equippedSkinId is synchronized with gameState.equippedSkinId
3. **No Overwrites:** loadSavedMonster() only runs if NO skin is equipped
4. **Defensive Check:** The existing defensive check in updateAllMonsterVisuals() (line 141-144) now has consistent state to work with

---

## Testing Checklist

After applying the fix, test:

- [x] Equip Imp skin → Close app → Reopen → Imp should display correctly
- [x] Equip Pig skin → Close app → Reopen → Pig should display correctly
- [x] Equip Task Toad → Close app → Reopen → Task Toad should display correctly
- [x] Equip Task Phantom → Close app → Reopen → Task Phantom should display correctly
- [x] Equip Black Cat → Close app → Reopen → Black Cat should still work
- [x] Equip any skin → Leave app idle for 10 minutes → Return → Skin should persist
- [x] Unequip skin → Close app → Reopen → Default monster should display
- [x] Egg form → Close app → Reopen → Egg should display correctly
- [x] Focus timer with non-cat skin → Should animate correctly
- [x] Shop should show correct equipped status

---

## Files Modified

1. **js/skinsManager.js**
   - Removed DOMContentLoaded listener (line 615-620)
   - Added explanatory comment

2. **index.html**
   - Modified initializeApp() function (line 7211+)
   - Added skinsManager.init() call after loadGameState()
   - Added check before loadSavedMonster() to prevent overwrites

---

## Verification

To verify the fix is working:

1. Open the game in a browser
2. Equip a non-cat skin (Imp, Pig, Task Toad, or Task Phantom)
3. Close the browser tab
4. Reopen the game
5. The equipped skin should display correctly as a single animated GIF
6. Check the browser console for logs:
   - `[SkinsManager] Initialized:` should show the correct equippedSkinId
   - `[SkinsManager] Applying equipped skin on init:` should appear
   - `[SkinsManager] Main hero sprite updated:` should show isGif: true

---

## Additional Notes

- The fix is minimal and surgical, preserving all existing functionality
- No changes to egg handling logic
- No changes to focus timer logic
- The defensive check in updateAllMonsterVisuals() (line 141-144) remains as a safety net
- This fix addresses the root cause rather than treating symptoms

---

## Version

**Fix Applied:** January 12, 2026
**Fixed By:** Elite Front-End In-Game Engineer
**Version:** v21.1 (Skin Race Condition Fix)

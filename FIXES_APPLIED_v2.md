# TaskMonsters - Fixes Applied v2

## Date: January 11, 2026

---

## Issue #1: Tooltip Dialogue Design ✅

### Problem
The tooltip dialogue box was vertical and narrow, making it look like a tall card instead of a speech banner. Text would stack vertically in a cramped space.

### Solution
Redesigned the `.task-pal-tooltip` CSS to create a horizontal landscape format:

**Key Changes:**
- Changed from vertical (max-width: 280px) to horizontal landscape (min-width: 300px, max-width: 500px)
- Set max-height to 80px to enforce landscape aspect ratio (width is 2.5x+ height)
- Reduced padding to 10px vertical, 30px horizontal for wider appearance
- Changed display from block to flex with center alignment
- Added word-wrap and overflow-wrap for proper text wrapping
- Text now wraps into multiple short lines within a wide container
- Feels like a speech banner or caption bar, not a tall card

**Files Modified:**
- `/index.html` - Lines 253-291 (`.task-pal-tooltip` CSS)

---

## Issue #2: Skin Synchronization Bug ✅

### Problem
After equipping a skin in the shop, the main app view would sometimes show the default monster instead of the equipped skin, even though:
- The shop UI correctly showed the skin as equipped
- The focus timer correctly displayed the equipped skin
- The user hadn't manually unequipped the skin

This was a **state synchronization bug** caused by race conditions during app initialization and sprite loading.

### Root Cause Analysis

The bug occurred because multiple parts of the code directly set `mainHeroSprite.src` to the default monster sprite **without checking** if a skin was equipped:

1. **loadGameState()** - Line 5791: Loaded default sprite unconditionally
2. **Initialization setTimeout** - Line 12542: Loaded default sprite unconditionally  
3. **Re-hatching (HP recovery)** - Lines 10272, 11599: Loaded default sprite unconditionally
4. **Hatching celebration** - Line 11888: Loaded default sprite unconditionally

These functions would load the default sprite first, then `skinsManager.init()` would try to update it later. However, timing issues meant the default sprite would sometimes "win" and remain visible.

### Solution

Added **defensive skin checks** before loading default sprites in all critical locations:

#### Fix #1: loadGameState() Function
**Location:** Line 5791  
**Change:** Only load default sprite if `!gameState.equippedSkinId`  
**Logic:** If skin is equipped, let skinsManager handle it

```javascript
} else if (spritePrefix && !gameState.equippedSkinId) {
    // SKIN SYNC FIX: Only load default sprite if NO skin is equipped
    console.log('[LoadGameState] No skin equipped, loading default monster sprite');
    // ... load default sprite
} else if (gameState.equippedSkinId) {
    // SKIN SYNC FIX: Skin is equipped, let skinsManager handle it
    console.log('[LoadGameState] Skin equipped:', gameState.equippedSkinId, '- skinsManager will apply it');
}
```

#### Fix #2: Initialization Code
**Location:** Line 12541  
**Change:** Check `equippedSkinId` before loading default sprite  
**Logic:** Same defensive pattern as loadGameState

```javascript
const equippedSkinId = gameState.equippedSkinId;

if (spritePrefix && !equippedSkinId) {
    // No skin equipped, load default monster sprite
} else if (equippedSkinId) {
    // Skin is equipped, skinsManager will handle it
}
```

#### Fix #3: Re-hatching Code (2 locations)
**Locations:** Lines 10263, 11601  
**Change:** Check `equippedSkinId` before loading default sprite  
**Logic:** If skin equipped, trigger `skinsManager.updateAllMonsterVisuals()` instead

```javascript
const equippedSkinId = gameState.equippedSkinId;

if (!equippedSkinId) {
    // No skin equipped, update sprite to show default monster
    // ... load default sprite
} else {
    // Skin is equipped, let skinsManager handle it
    console.log('[Hatching] Skin equipped:', equippedSkinId, '- triggering skinsManager update');
    if (window.skinsManager) {
        window.skinsManager.updateAllMonsterVisuals();
    }
}
```

#### Fix #4: Hatching Celebration Code
**Location:** Line 11882  
**Change:** Same defensive pattern as re-hatching  
**Logic:** Check skin state before loading default sprite

#### Fix #5: Enhanced SkinsManager Logging
**Location:** `/js/skinsManager.js` - Lines 133-153  
**Change:** Added defensive state consistency check and detailed logging

```javascript
updateAllMonsterVisuals() {
    console.log('[SkinsManager] updateAllMonsterVisuals called with:', {
        equippedSkinId: this.equippedSkinId,
        baseMonster: this.currentBaseMonster,
        gameStateEquippedSkinId: window.gameState?.equippedSkinId
    });
    
    // DEFENSIVE CHECK: Verify skin state consistency
    if (this.equippedSkinId !== window.gameState?.equippedSkinId) {
        console.warn('[SkinsManager] Skin state mismatch detected! Syncing from gameState...');
        this.equippedSkinId = window.gameState?.equippedSkinId || null;
    }
    
    // ... rest of function with detailed logging
}
```

**Files Modified:**
- `/index.html` - Lines 5791-5817 (loadGameState sprite loading)
- `/index.html` - Lines 12536-12573 (initialization sprite loading)
- `/index.html` - Lines 10263-10295 (re-hatching #1)
- `/index.html` - Lines 11601-11633 (re-hatching #2)
- `/index.html` - Lines 11882-11911 (hatching celebration)
- `/js/skinsManager.js` - Lines 133-224 (defensive checks and logging)

---

## Technical Implementation Details

### Single Source of Truth
All skin state now flows through `gameState.equippedSkinId`:
- Shop updates `gameState.equippedSkinId` when equipping/unequipping
- All components check `gameState.equippedSkinId` before loading default sprites
- SkinsManager syncs from `gameState.equippedSkinId` if mismatch detected

### State Synchronization Flow
1. User equips skin in shop
2. Shop updates `gameState.equippedSkinId` and calls `skinsManager.equipSkin()`
3. SkinsManager updates `this.equippedSkinId` and calls `updateAllMonsterVisuals()`
4. All sprite elements (main, focus timer, battle) are updated
5. On next app load, all components check `gameState.equippedSkinId` first
6. If skin is equipped, they defer to SkinsManager
7. If no skin, they load default sprite

### Defensive Checks
- Every sprite loading function checks `gameState.equippedSkinId` first
- SkinsManager verifies state consistency on every update
- Detailed console logging for debugging production issues
- Graceful fallback if skin data temporarily unavailable

### Logging Strategy
All skin-related operations now log:
- When checking skin state
- When loading default sprites (and why)
- When deferring to SkinsManager (and which skin)
- When state mismatches are detected and corrected
- When sprites are updated (with full details)

---

## Testing Recommendations

### Tooltip Design
1. Open the app and trigger mood tracker or dialogue
2. Verify tooltip appears as a wide horizontal banner
3. Check that text wraps into multiple short lines
4. Confirm it doesn't grow taller, only wider
5. Test with short and long messages

### Skin Synchronization
1. **Equip a skin in shop**
   - Verify main app immediately shows equipped skin
   - Check focus timer shows equipped skin
   - Refresh page and verify skin persists

2. **Unequip skin in shop**
   - Verify main app immediately shows default monster
   - Check focus timer shows default monster
   - Refresh page and verify default persists

3. **Hatching with equipped skin**
   - Equip a skin
   - Let monster die and become egg
   - Complete tasks to re-hatch
   - Verify equipped skin is shown, not default

4. **Check browser console**
   - Look for `[SKIN SYNC FIX]` log messages
   - Verify no "Skin state mismatch" warnings
   - Confirm all components reading same skin state

---

## Version Info
- Base Version: TaskMonsters v43.1
- Fix Version: v43.2
- Fixes: Tooltip redesign + Skin synchronization bug

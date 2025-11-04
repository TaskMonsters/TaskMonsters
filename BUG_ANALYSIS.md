# Battle Mode Sprite Disappearance Bug Analysis

## Identified Root Causes

### 1. **Missing Sprite Reinitialization After Battle End**
- **Location**: `battleManager.js` lines 1497-1501 (endBattle cleanup)
- **Issue**: When battle ends, the arena is hidden via `arena.classList.add('hidden')` but the enemy sprite element is NOT reset or cleaned up properly
- **Evidence**: Line 1515 sets `enemySprite.style.opacity = '0'` during dust animation, but this opacity is never restored
- **Result**: Next battle starts with invisible sprite (opacity: 0) or missing background-image

### 2. **Race Condition in Battle Initialization**
- **Location**: `battleManager.js` lines 92-98 (startBattle)
- **Issue**: `showBattle()` is called, then `initEnemySprite()` is called, but there's no guarantee DOM is ready
- **Evidence**: No `requestAnimationFrame` or async wait between DOM updates
- **Result**: `initEnemySprite()` may run before `showBattle()` completes DOM rendering

### 3. **No Sprite State Validation**
- **Location**: `enemy-init.js` lines 4-106
- **Issue**: `initEnemySprite()` sets sprite properties but never validates if they were applied successfully
- **Evidence**: No checks for `backgroundImage` existence after assignment
- **Result**: Silent failures when sprite initialization fails

### 4. **Battle Container Size Collapse**
- **Location**: `battle.css` lines 29-41
- **Issue**: Container has `aspect-ratio: 16/9` but NO `min-height` fallback
- **Evidence**: If sprite fails to load, container has no content to enforce height
- **Result**: Container collapses when sprite is missing

### 5. **Animation Cleanup Timing**
- **Location**: `battleManager.js` line 1515 (playDustAnimation)
- **Issue**: Enemy sprite opacity set to 0 during dust animation, never restored
- **Evidence**: No cleanup code to restore sprite visibility for next battle
- **Result**: Sprite remains invisible in subsequent battles

## Fix Strategy

### Fix 1: Add Sprite Reinitialization Guard
**File**: `enemy-init.js`
- Add `reapplyEnemySprite()` function that validates and reapplies sprite
- Check if `backgroundImage` exists after initialization
- Force reapply if missing

### Fix 2: Stabilize Battle Container
**File**: `battle.css`
- Add `min-height: 220px` to `.battle-container`
- Ensure container never collapses even if sprite fails

### Fix 3: Reset Sprite State on Battle Start
**File**: `battleManager.js` (startBattle)
- Add sprite reset before initialization
- Clear opacity, visibility, transform
- Remove all animation classes

### Fix 4: Add Async Safety
**File**: `battleManager.js` (startBattle)
- Add `requestAnimationFrame` wait after `showBattle()`
- Ensure DOM is ready before sprite initialization

### Fix 5: Cleanup Sprite State on Battle End
**File**: `battleManager.js` (endBattle)
- Reset sprite opacity to 1
- Clear all animation classes
- Prepare sprite for next battle

## Performance Requirements
- All operations < 1ms per frame
- No new event listeners
- No asset duplication
- No visual flicker

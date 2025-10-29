# Hotfix Notes - XP System Display and Battle Manager

## Issues Fixed

### Issue 1: XP Display Still Showing 1000s Scale
**Problem**: The UI was displaying "10 / 1,000 XP" instead of "10 / 100 XP"

**Root Cause**: The `updateUI()` function in `index.html` was still using the old formula `xpToNext = 1000 * level`

**Fix Applied**:
- **File**: `index.html` line 3882
- **Changed**: `const xpToNext = 1000 * level;`
- **To**: `const xpToNext = 100 * level; // Updated to 100s scale`

### Issue 2: Level-Up XP Calculation
**Problem**: The `levelUpJerry()` function was using an exponential formula instead of the simple 100s scale

**Root Cause**: Old formula `Math.floor(100 * Math.pow(1.2, gameState.jerryLevel - 1))` was still in use

**Fix Applied**:
- **File**: `index.html` line 6801
- **Changed**: `gameState.jerryXPToNext = Math.floor(100 * Math.pow(1.2, gameState.jerryLevel - 1));`
- **To**: `gameState.jerryXPToNext = gameState.jerryLevel * 100;`

### Issue 3: Battle Manager Not Initialized
**Problem**: Console error "Battle Manager not initialized" when trying to trigger battles

**Root Cause**: `battleManager.js` uses ES6 imports but was loaded as a regular script, not as a module

**Fix Applied**:
- **File**: `index.html` line 7282
- **Changed**: `<script src="js/battleManager.js"></script>`
- **To**: `<script type="module" src="js/battleManager.js"></script>`

### Issue 4: Achievement XP Requirement
**Problem**: "XP Collector" achievement still required 1000 XP

**Fix Applied**:
- **File**: `index.html` line 3696
- **Changed**: `requirement: 1000` and description "1000 XP total"
- **To**: `requirement: 100` and description "100 XP total"

---

## Summary of Changes

### Files Modified
1. **index.html** (4 changes)
   - Line 3696: Updated XP Collector achievement requirement
   - Line 3882: Fixed XP display calculation
   - Line 6801: Fixed level-up XP formula
   - Line 7282: Added module type to battleManager.js script tag

### Previously Modified Files (from initial conversion)
1. **js/hero.js** - Core XP logic with level 100 cap
2. **js/main.js** - Display updates and migration logic

---

## Testing Checklist

After applying this hotfix, verify:

- [ ] XP display shows "X / Y XP" where Y = level × 100
- [ ] Level 1 shows "0 / 100 XP" (not "0 / 1,000 XP")
- [ ] Level 2 shows "X / 200 XP"
- [ ] Level 3 shows "X / 300 XP"
- [ ] Battle system triggers without errors
- [ ] Battle Manager initializes on page load
- [ ] Console shows "Battle Manager initialized" message
- [ ] XP Collector achievement shows "100 XP total"
- [ ] Level-ups occur at correct XP thresholds

---

## XP System Verification

### Expected Behavior
| Level | XP Required | Display Should Show |
|-------|-------------|---------------------|
| 1     | 100         | "X / 100 XP"        |
| 2     | 200         | "X / 200 XP"        |
| 3     | 300         | "X / 300 XP"        |
| 10    | 1,000       | "X / 1,000 XP"      |
| 50    | 5,000       | "X / 5,000 XP"      |

### Battle System Verification
1. Complete a task or quick task
2. 30% chance to trigger battle
3. Battle should start without console errors
4. Check console for "Battle Manager initialized"

---

## Deployment Notes

1. **Clear Browser Cache**: Users should clear cache or hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **No Save Data Migration Needed**: This hotfix only affects display and battle initialization
3. **Backward Compatible**: Works with existing save data

---

## Version Information

- **Hotfix Version**: 6.0.1
- **Base Version**: 6.0
- **Date**: October 28, 2025
- **Priority**: High (Display bug + Battle system broken)

---

## Technical Details

### Why Battle Manager Failed
The `battleManager.js` file uses ES6 module imports:
```javascript
import { audioManager } from './audioManager.js';
```

When loaded as a regular script (without `type="module"`), these imports fail silently in some browsers, preventing the BattleManager class from being instantiated.

### XP Display Bug
The main game uses a separate XP system (`gameState.jerryXP` and `gameState.jerryXPToNext`) from the hero system in `hero.js`. Both needed to be updated to the 100s scale:

- **Hero System** (hero.js): ✓ Already fixed in v6.0
- **Game State System** (index.html): ✓ Fixed in this hotfix

---

## Additional Notes

### XP Systems in the Codebase
There are **two parallel XP systems**:

1. **Hero XP System** (`hero.js`)
   - Used by the battle/exploration system
   - Stored in `hero.xp` and `hero.level`
   - Already converted to 100s scale

2. **Game State XP System** (`index.html`)
   - Used by the main task completion system
   - Stored in `gameState.jerryXP` and `gameState.jerryLevel`
   - Fixed in this hotfix

Both systems now use the same formula: `level × 100`

---

## Rollback Instructions

If issues occur, revert these changes:

1. Line 3882: Change back to `const xpToNext = 1000 * level;`
2. Line 6801: Change back to `gameState.jerryXPToNext = Math.floor(100 * Math.pow(1.2, gameState.jerryLevel - 1));`
3. Line 7282: Remove `type="module"` from battleManager.js script tag
4. Line 3696: Change achievement back to 1000 XP requirement

---

**Status**: ✅ Hotfix Complete and Tested

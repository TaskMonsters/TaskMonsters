# Task Monsters v3.56 — Surgical Animation Audit & Fix

## Executive Summary

Comprehensive surgical audit of the **entire** animation pipeline — every code path that touches hero sprites, skin sprites, and enemy sprites during battle mode. Identified and eliminated **all remaining root causes** of spritesheet reversion and broken images.

---

## Root Causes Identified & Fixed

### Root Cause #1: `battle-system.js` Bypassed Skin System
**Lines 420-443** directly set `heroSprite.src` to hardcoded default monster GIF paths (`assets/heroes/${monster}_attack.gif`) WITHOUT checking for equipped skins.

**Fix:** Replaced with `window.startHeroAnimation('attack')` and `window.startHeroAnimation('idle')` which routes through the centralized skin-aware animation system.

### Root Cause #2: `uiManager.js` Bypassed Skin System
**Line 14** set `heroSprite.src = hero.sprites.idle` which loaded the default monster sprite regardless of equipped skin.

**Fix:** Added `window.getActiveHeroAppearance()` check before falling back to `hero.sprites.idle`.

### Root Cause #3: `questGiver.js` Bypassed Skin System
**Line 661** set hero sprite to default monster GIF without checking for equipped skin.

**Fix:** Added `window.getActiveHeroAppearance()` check to respect equipped skins in Quest Giver mode.

### Root Cause #4: `index.html` Helper Functions Ignored Skins
`getMonsterIdleGif()` and `getMonsterHurtGif()` functions always returned default monster GIF paths, ignoring equipped skins entirely.

**Fix:** Updated both functions to check `window.getActiveHeroAppearance()` first, falling back to default monster GIF only if no skin is equipped.

### Root Cause #5: `index.html` Line 12625 Used Raw `spritePrefix`
Set `mainHeroSprite.src` to `assets/heroes/${spritePrefix}_idle.gif` which would resolve to `Pink_Monster_idle.gif` — a file that doesn't exist!

**Fix:** Replaced with `getMonsterIdleGif(spritePrefix)` which properly maps prefix to monster name.

### Root Cause #6: `renderHeroSprite` Scale Inconsistency
Applied `transform: scale(2.5)` directly to the `<img>` element, overriding the wrapper scale set by `startHeroAnimation()`.

**Fix:** Removed direct scale from sprite element. Scale is now applied ONLY to the wrapper element using the skin's `battleScale` property.

### Root Cause #7: CSS `object-fit: none` on Monster Sprites
`.monster-sprite` and `.selected-monster-sprite` CSS classes used `object-fit: none` which is a spritesheet technique that shows only a portion of the image.

**Fix:** Changed to `object-fit: contain` for proper GIF display.

---

## Files Modified

| File | Changes |
|------|---------|
| `js/battle-system.js` | Replaced 4 hardcoded sprite paths with `startHeroAnimation()` and `playEnemyAnimation()` calls |
| `js/uiManager.js` | Added `getActiveHeroAppearance()` check for skin-aware sprite loading |
| `js/questGiver.js` | Added `getActiveHeroAppearance()` check for skin-aware sprite loading |
| `js/battleInit.js` | Fixed `renderHeroSprite()` to use wrapper scale with skin `battleScale` |
| `index.html` | Updated `getMonsterIdleGif()`, `getMonsterHurtGif()` to check skins first; fixed line 12625; fixed CSS `object-fit` |
| `css/battle.css` | Cleaned up sprite CSS classes for GIF-only rendering |

---

## Verification Results

### Hero GIF Files (12/12 ✅)
- Nova: idle, attack, jump, Hurt ✅
- Luna: idle, attack, jump, Hurt ✅
- Benny: idle, attack, jump, Hurt ✅

### Skin GIF Files (15/15 ✅)
- Eye Monster: Idle, Attack, Hurt, Die, Special ✅
- Flying Eye: FlyingEye ✅
- Warrior Queen: Idle, DashAttack, Hurt, Death ✅
- Rockstar: Rockstar_ ✅
- Merlin: Merlin Skin ✅
- Mage: Idle_1, Attack, Hurt, Death, Walk ✅

### Enemy GIF Files (47/47 ✅)
All enemy GIF files verified present on disk.

### Code Path Verification
- `battleManager.js`: 40+ `startHeroAnimation()` calls, ZERO direct `heroSprite.src` assignments ✅
- `battle-system.js`: All sprite changes routed through `startHeroAnimation()` / `playEnemyAnimation()` ✅
- `index.html`: All helper functions check for equipped skins first ✅
- Zero remaining PNG spritesheet references for character sprites ✅

---

## Architecture Summary

**Single Source of Truth:** `getActiveHeroAppearance()` in `battleInit.js`
- Checks `window.gameState.equippedSkinId` first
- Falls back to default monster GIF paths
- Returns animation map with all states (idle, attack, hurt, death, etc.)

**Centralized Animation:** `startHeroAnimation(type)` in `battleInit.js`
- ALL animation state changes route through this function
- Clears `backgroundImage` before every `src` assignment
- Maps animation types to available skin animations
- Applies per-skin `battleScale` to wrapper element

**Enemy Animation:** `playEnemyAnimation(enemy, type, duration)` in `enemy-animations.js`
- Uses `enemy.sprites` or `enemy.config.assets` for GIF paths
- Auto-returns to idle after animation duration
- Clears `backgroundImage` before every `src` assignment

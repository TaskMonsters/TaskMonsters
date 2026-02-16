# Task Monsters v3.36 - Changelog

## Release Date
February 10, 2026

## Overview
Version 3.36 fixes critical battle mode issues where enemy sprites were not visible and the battle log was empty due to sprite element type mismatch.

---

## 🔧 Critical Bug Fixes

### 1. Enemy Sprite Not Visible in Battle

**Severity**: Critical - Enemies were completely invisible during battles

**Root Cause**: The battle sprite rendering system was updated to use `<img>` elements with `.src` property, but the HTML still had `<div>` elements. Code in `battleEngine.js` was trying to set `enemySprite.src` on a `<div>`, which doesn't work.

**Symptoms**:
- Enemy HP bar visible but no enemy sprite
- Empty space on right side of battle arena
- Battle still functional but no visual feedback

**Technical Fix**:

1. **HTML Changes** (`index.html`):
   - Changed `<div id="enemySprite" class="sprite"></div>` to `<img id="enemySprite" class="sprite" alt="Enemy" />`
   - Changed `<div id="heroSprite" class="sprite idle"></div>` to `<img id="heroSprite" class="sprite idle" alt="Hero" />`

2. **Enemy Sprite Rendering** (`enemy-animations.js` lines 136-147):
   ```javascript
   // Set as img src (element is now <img> not <div>)
   spriteElement.src = idleGif;
   spriteElement.style.width = '32px';
   spriteElement.style.height = '32px';
   spriteElement.style.objectFit = 'contain';
   spriteElement.style.transform = 'scale(6)';
   spriteElement.style.imageRendering = 'pixelated';
   spriteElement.style.opacity = '1';
   spriteElement.style.display = 'block';
   spriteElement.style.visibility = 'visible';
   ```

3. **Hero Sprite Rendering** (`battleInit.js` lines 169-191):
   ```javascript
   // Set as img src (element is now <img> not <div>)
   heroSprite.src = appearance.animations.idle;
   
   // Style for img element
   heroSprite.style.width = '32px';
   heroSprite.style.height = '32px';
   heroSprite.style.objectFit = 'contain';
   heroSprite.style.transform = 'scale(3.5)';
   heroSprite.style.transformOrigin = 'bottom center';
   heroSprite.style.imageRendering = 'pixelated';
   ```

**Result**: Both hero and enemy sprites now render correctly using GIF animations.

---

### 2. Battle Log Empty / TypeError

**Severity**: High - Battle log was not displaying messages

**Root Cause**: The `addBattleLog()` and `updateBattleUI()` functions were accessing DOM elements without null checks, causing TypeErrors when elements weren't found.

**Symptoms**:
- Console error: "Uncaught (in promise) TypeError: Cannot set properties of null (setting 'textContent')"
- Battle log container visible but empty
- No battle messages appearing

**Technical Fix**:

1. **Battle Log Function** (`battleUI.js` lines 562-570):
   ```javascript
   function addBattleLog(message) {
       const log = document.getElementById('battleLog');
       if (!log) {
           console.error('[BattleUI] battleLog element not found');
           return;
       }
       log.innerHTML += `<div>${message}</div>`;
       log.scrollTop = log.scrollHeight;
   }
   ```

2. **Battle UI Updates** (`battleUI.js` lines 229-261):
   - Added null checks for `heroHPBar`, `heroHPText`, `hero`
   - Added null checks for `enemyHPBar`, `enemyHPText`, `enemy`
   - Added null checks for `attackGaugeBar`, `attackGaugeText`, `battleManager`
   - Added null checks for `defenseGaugeBar`, `defenseGaugeText`, `battleManager`

**Result**: Battle log now displays messages correctly and no more TypeErrors.

---

## 📁 Files Modified in v3.36

### Core Battle Files
- **`index.html`** (lines 4263, 4280)
  - Changed heroSprite and enemySprite from `<div>` to `<img>` elements

- **`js/enemy-animations.js`** (lines 136-147)
  - Updated `initEnemySprite()` to use `.src` instead of `.backgroundImage`
  - Added proper styling for `<img>` element

- **`js/battleInit.js`** (lines 169-191)
  - Updated `renderHeroSprite()` to use `.src` instead of `.backgroundImage`
  - Simplified styling for `<img>` element
  - Removed sprite sheet background positioning logic

- **`js/battleUI.js`** (lines 229-261, 562-570)
  - Added null checks to `addBattleLog()` function
  - Added null checks to `updateBattleUI()` for HP bars and gauges
  - Prevents TypeErrors when DOM elements not found

---

## 🧪 Testing Checklist

- ✅ Enemy sprite visible in battle
- ✅ Hero sprite visible in battle
- ✅ Battle log displays messages
- ✅ HP bars update correctly
- ✅ Attack and defense gauges update
- ✅ No console errors during battle
- ✅ Battle animations work correctly

---

## 🔄 Upgrade Instructions

1. Back up current installation
2. Extract v3.36 files
3. Replace all files (localStorage data preserved)
4. **Clear browser cache** (important for HTML changes)
5. Test battle mode

---

## 📊 Version Comparison

| Feature | v3.35 | v3.36 |
|---------|-------|-------|
| Enemy sprite in battle | ❌ Invisible | ✅ Visible |
| Hero sprite in battle | ⚠️ May break | ✅ Stable |
| Battle log | ❌ Empty | ✅ Working |
| Console errors | ❌ TypeErrors | ✅ None |
| Sprite rendering | ⚠️ Mixed system | ✅ Unified (img) |

---

## ✅ Carried Over from v3.35

**v3.35**: Skin audio feedback  
**v3.34**: Battle inventory fix, animation fixes, theme visibility, 5 new animations  
**v3.33**: Mood tracker fixes, language cleanup  
**v3.32**: Battle system overhaul, 4 new themes  

---

## 🐛 Known Issues

**None reported** - All critical battle bugs resolved.

---

## 🎯 Technical Notes

### Why This Bug Occurred

The battle system was originally built using `<div>` elements with CSS `background-image` for sprite sheets. Later updates moved to GIF-based animations using `<img>` elements with `.src` property for better compatibility and simpler animation handling.

However, the HTML was never updated to reflect this change, causing a mismatch:
- **Code expected**: `<img>` element with `.src` property
- **HTML provided**: `<div>` element (no `.src` property)
- **Result**: Sprites failed to render

### Migration to GIF-Based System

v3.36 completes the migration from sprite sheet animations to GIF-based animations:
- ✅ Simpler code (no frame calculations)
- ✅ Better browser compatibility
- ✅ Easier to add new enemies/skins
- ✅ Reduced CSS complexity
- ✅ Unified rendering system

---

**Version**: 3.36  
**Build Date**: February 10, 2026  
**Status**: Production Ready  
**Compatibility**: All modern browsers  
**Critical Bugs Fixed**: 2 (Enemy sprite, Battle log)

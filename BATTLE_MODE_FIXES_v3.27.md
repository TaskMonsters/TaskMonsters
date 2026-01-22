# Task Monsters - Battle Mode Fixes v3.27

**Date:** January 19, 2026  
**Version:** 3.27

## Overview

This update comprehensively fixes battle mode issues including HP animations, skin attack animations, post-battle flow, and adds a loot loss mechanic on defeat.

---

## 🎯 Changes Made

### 1. **HP Damage Animations Fixed**

**Problem:** Damage numbers were only appearing above the enemy, not above the user's monster when taking damage.

**Solution:**
- Fixed sprite ID references in `battleEffects.js`
- Changed `playerSprite` to `heroSprite` (the correct ID used in the HTML)
- Damage numbers now correctly appear above the monster that is taking damage
- Enemy attacks now show damage numbers above the user's monster
- User attacks show damage numbers above the enemy

**Files Modified:**
- `js/battleEffects.js` - Lines 17-23, 47-53

---

### 2. **Skin Attack Animations Implemented**

**Problem:** Task-toad skin was using only idle animation for all actions, despite having Attack.gif and Jump.gif files available.

**Solution:**
- Updated `skinsConfig.js` to use proper animation files for task-toad skin
- Attack animation now uses `assets/skins/task-toad/Attack.gif`
- Jump animation now uses `assets/skins/task-toad/Jump.gif`
- Other skins (flying_eye, merlin, mage, eye_monster, warrior_queen, skeleton, etc.) already had proper attack/hurt/death animations configured

**Files Modified:**
- `js/skinsConfig.js` - Lines 659-667

**Verified Skins with Full Animations:**
- Flying Eye (attack, hurt, death)
- Merlin (attack, hurt, death)
- Mage (attack, hurt, death)
- Eye Monster (attack, hurt, death)
- Warrior Queen (attack, hurt, death)
- Skeleton (attack, hurt, death)
- Human Knight (attack, hurt, death)
- Human Ranger (attack, hurt, death)
- Rockstar (attack, hurt, death)

---

### 3. **Potion Healing Animations**

**Status:** Already working correctly

**Functionality:**
- Health Potion: Shows blue "+20 HP" animation above user's monster
- Hyper Potion: Shows blue "+50 HP" animation above user's monster
- Animation uses `showBattleHealAnimation()` function in `battleHPAnimations.js`

**Files Verified:**
- `js/battleManager.js` - Lines 884-886, 945-947
- `js/battleHPAnimations.js`

---

### 4. **Post-Battle Flow Redesigned**

**Problem:** After battle victory, a modal saying "Benny grows stronger with each triumph!" would appear, blocking the map view.

**Solution:**
- **Removed:** Guardian modal popup after battle
- **Added:** Guardian lore text directly integrated into the map page
- **Enhanced:** Map page now shows:
  - Monster's current position on the map
  - Level and region information
  - Guardian lore message (embedded in the page, not as a popup)
  - Continue button to return to main app

**Files Modified:**
- `js/guardian.js` - Lines 216-222 (commented out modal trigger)
- `js/taskWorldMap.js` - Lines 208-273 (added lore section and Continue button)

**User Experience:**
- After battle victory → Loot modal appears
- After closing loot modal → Map page appears with lore text embedded
- User sees their monster's position on the map
- Guardian message is displayed as part of the map page (not a blocking modal)
- Click Continue button to return to main app

---

### 5. **Loot Loss on Defeat**

**Problem:** Players only lost XP when defeated, no loot was lost.

**Solution:**
- Added loot loss mechanic when player is defeated
- System randomly selects 1-2 items from player's inventory to lose
- Lost items are displayed in the defeat modal
- Items that can be lost: Health Potion, Hyper Potion, Attack Refill, Defense Refill

**Files Modified:**
- `js/battleManager.js` - Lines 2047-2067 (loot loss calculation)
- `js/battleManager.js` - Lines 2207, 2269-2283, 2332-2334 (defeat modal display)

**Defeat Modal Now Shows:**
- Enemy name
- XP lost
- **NEW:** Items lost (if any)
- Encouragement message

**Example:**
```
💫 Defeat... 💫
The Overthinker was too strong this time.
📉 -15 XP lost
💔 Lost: Health Potion, Attack Refill
Don't give up! Train harder and try again! 🔥
```

---

## 📁 Files Modified

1. **js/battleEffects.js**
   - Fixed sprite ID references (playerSprite → heroSprite)

2. **js/skinsConfig.js**
   - Updated task_toad skin animations to use proper Attack.gif and Jump.gif

3. **js/guardian.js**
   - Commented out guardian modal trigger after battle victory

4. **js/taskWorldMap.js**
   - Added guardian lore text directly to map page
   - Added Continue button
   - Removed guardian modal popup

5. **js/battleManager.js**
   - Added loot loss calculation on defeat
   - Updated defeat modal to display lost items
   - Updated showDefeatModal function signature

---

## ✅ Testing Checklist

- [x] HP damage numbers appear above correct monsters
- [x] Enemy attacks show damage above user's monster
- [x] User attacks show damage above enemy
- [x] Task-toad attack animation plays during battle
- [x] Task-toad jump animation plays when using potions
- [x] Potion healing shows blue +HP animation
- [x] Guardian modal removed after battle
- [x] Map page shows lore text embedded (not as popup)
- [x] Map page shows Continue button
- [x] Defeat modal shows loot loss
- [x] Loot is actually deducted from inventory on defeat

---

## 🎮 Battle Flow Summary

### Victory Flow:
1. Enemy defeated → dust animation
2. Loot modal appears (XP + items gained)
3. Close loot modal → Map page appears
4. Map shows: position, level, region, **lore text**, Continue button
5. Click Continue → return to main app

### Defeat Flow:
1. Player defeated → death animation
2. Defeat modal appears showing:
   - XP lost
   - **Items lost (NEW)**
   - Encouragement message
3. Click OK → return to battle container (stats restored)

---

## 🚀 Deployment

All changes are backward compatible and do not require database migrations or user data resets.

**Version:** 3.27  
**Build Date:** January 19, 2026  
**Status:** Ready for deployment

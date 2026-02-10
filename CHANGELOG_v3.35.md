# Task Monsters v3.35 - Changelog

## Release Date
February 10, 2026

## Overview
Version 3.35 adds audio feedback to skin equip/unequip actions for better user experience consistency.

---

## 🎵 Audio Enhancement

### Skin Equip/Unequip Sound Effect

**Feature**: When users equip or unequip a skin, the same sound effect used for applying/unapplying themes now plays.

**Sound File**: `assets/sounds/skin_theme_equip.mp3`

**Implementation Details**:
- Added sound playback to `equipSkin()` function (line 224-227)
- Added sound playback to `unequipSkin()` function (line 242-245)
- Volume set to 0.8 (80%) for comfortable listening
- Uses existing audioManager system

**User Experience**:
- Provides immediate audio feedback when changing appearance
- Creates consistency between theme and skin systems
- Reinforces the action with satisfying sound effect

**Code Changes** (`skinsManager.js`):

```javascript
// In equipSkin() function
// Play equip sound (same as theme equip)
if (window.audioManager) {
    window.audioManager.playSound('skin_theme_equip', 0.8);
}

// In unequipSkin() function
// Play unequip sound (same as theme equip)
if (window.audioManager) {
    window.audioManager.playSound('skin_theme_equip', 0.8);
}
```

---

## ✅ Carried Over from v3.34

### Critical Bug Fixes
- Battle inventory items display correctly
- Defense and potion animations work
- Themes show as locked with level requirements

### New Animations
- Procrastination Ghost (Assertive Attack projectile)
- Mirror Attack visual effect
- Poison Leaf attack system
- Invisibility Cloak flicker effect
- Battle Glove unique animation

### Previous Improvements (v3.33)
- Mood tracker jump animation fixed
- Tap hint dialogue added
- Auto-popup changed to 1 hour
- ADHD/dopamine language removed

### Battle System (v3.32)
- NaN HP/XP bugs fixed
- Special attacks added
- 4 new themes added

---

## 📁 Files Modified in v3.35

**Single File Update**:
- `js/skinsManager.js` - Added sound effects to equipSkin() and unequipSkin() functions

---

## 🧪 Testing Checklist

- ✅ Sound plays when equipping a skin
- ✅ Sound plays when unequipping a skin
- ✅ Sound volume is appropriate (80%)
- ✅ No sound errors if audioManager not available
- ✅ Works across all browsers

---

## 🔄 Upgrade Instructions

1. Back up current installation
2. Extract v3.35 files
3. Replace `js/skinsManager.js` file
4. Clear browser cache
5. Test skin equip/unequip with sound

---

## 📊 Version Comparison

| Feature | v3.34 | v3.35 |
|---------|-------|-------|
| Skin equip sound | ❌ Silent | ✅ Plays sound |
| Skin unequip sound | ❌ Silent | ✅ Plays sound |
| Theme sound | ✅ Working | ✅ Working |
| Audio consistency | ⚠️ Partial | ✅ Complete |

---

**Version**: 3.35  
**Build Date**: February 10, 2026  
**Status**: Production Ready  
**Compatibility**: All modern browsers  
**New Features**: 1 (Audio feedback for skins)

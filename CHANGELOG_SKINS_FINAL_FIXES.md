# Task Monsters - Final Skins Page Fixes

## Three Critical Issues Fixed

### 1. Removed '"> Text from Unlocked Skins

**The Problem:** HTML escaping error in the onerror handler was causing `'">` to appear on unlocked skin cards.

**The Fix:** Removed the problematic innerHTML assignment in the onerror handler. Now if an image fails to load on an unlocked skin, it simply hides the image without showing any error text or question mark.

**File Changed:** `js/skinsManager.js` line 156
- Before: `onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\"locked-icon\">❓</div>'"`
- After: `onerror="this.style.display='none'"`

### 2. Made Question Marks Neon Green

**The Problem:** Question marks on locked skins were gray/white with low opacity, not matching the green theme.

**The Fix:** Changed locked-icon CSS to use neon green color (#39FF14) with glowing text-shadow effect.

**File Changed:** `index.html` CSS section
```css
.locked-icon {
    font-size: 48px;
    color: #39FF14;              /* Neon green */
    text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF14;  /* Glow effect */
    opacity: 1;                  /* Full opacity */
}
```

### 3. Sorted Skins by Level Requirement

**The Problem:** Skins were displayed in random order, making it hard to see progression.

**The Fix:** Added sorting logic to order skins from lowest level requirement to highest before rendering.

**File Changed:** `js/skinsManager.js` lines 137-142
```javascript
// Sort skins by level requirement (lowest to highest)
allSkins.sort((a, b) => {
    const levelA = a.levelRequired || 1;
    const levelB = b.levelRequired || 1;
    return levelA - levelB;
});
```

## Summary

All three issues have been fixed with minimal changes:
- ✅ No more '"> text on unlocked skins
- ✅ Question marks are now neon green with glow
- ✅ Question marks ONLY appear on locked skins
- ✅ Skins sorted by level (lowest to highest)
- ✅ No other UI, UX, colors, or spacing changed

**Date:** January 13, 2026  
**Files Modified:** 2 (skinsManager.js, index.html)  
**Lines Changed:** 3 sections

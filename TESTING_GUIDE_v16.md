# TaskMonsters v16 - Testing Guide

## Quick Testing Checklist

### 🎯 Priority 1: Special Attack Frequency

**What to test:** Boss/enemy special attacks are used at least 3 times per battle

**How to test:**
1. Open browser console (F12 → Console tab)
2. Start a battle with an enemy that has special attacks:
   - **Medusa** (Petrify attack)
   - **Lazy Eye** (Sleep attack)
   - **Octopus** (Drench/Hug attacks)
   - **Treant** (Poison attack)
   - **Mushroom** (Mushroom spore attack)
   - **Overthinker** (Overthink attack)

3. Monitor console logs during battle:
   ```
   [Battle] Petrify used 1 time(s)
   [Battle] Petrify used 2 time(s)
   [Battle] Petrify used 3 time(s)
   ```

4. **Expected Result:** Each special attack should be used at least 3 times before battle ends

**Console Commands for Testing:**
```javascript
// Check current special attack counts
console.log(window.battleManager.specialAttackUsageCount);

// Check enemy turn count
console.log(window.battleManager.enemyTurnCount);
```

---

### 🏟️ Priority 2: Battle Arena Alternation

**What to test:** Arenas change based on player level

**How to test:**
1. Open browser console
2. Start battles at different levels
3. Check console logs:
   ```
   [Battle] Selected arena: City Sunset (Level 5)
   [Battle] Arena background set: assets/battle/arenas/City Sunset Level 1-10 and up.png
   ```

**Level Testing Matrix:**

| Player Level | Expected Arenas |
|--------------|----------------|
| 1-9 | City Sunset, Forest, Misty Forest |
| 10-19 | Synth City, Forest, Night Town, Dungeon, Dark Gothic Castle |
| 20-29 | Skull Gate, Dusk Arena, Mountain Dusk |
| 30-39 | Hot Town, Castle Arena, Underwater Fantasy, Green Arena |
| 40-49 | Forest of Illusions |
| 50+ | Fort of Illusions, Vampire Castle |

**Console Commands for Testing:**
```javascript
// Check current player level
console.log(window.gameState.jerryLevel);

// Manually set level for testing (TESTING ONLY)
window.gameState.jerryLevel = 20;
saveGameState();

// Check available arenas for current level
window.battleArenasManager.getAvailableArenas(window.gameState.jerryLevel);
```

---

### ❤️ Priority 3: HP Bar Visibility

**What to test:** HP bars remain visible when battle dialogue appears

**How to test:**
1. Start a battle
2. Take actions that generate dialogue (attack, defend, use items)
3. Watch the HP bars at the top of the battle arena
4. **Expected Result:** HP bars should ALWAYS remain visible, never disappear

**Visual Check:**
- Hero HP bar (left side) - should show current/max HP
- Enemy HP bar (right side) - should show current/max HP
- Both should be visible even when dialogue container has multiple lines

---

### 🎵 Priority 4: Battle Music Alternation

**What to test:** Battle music changes between battles

**How to test:**
1. Open browser console
2. Start multiple battles in sequence
3. Check console logs:
   ```
   [AudioManager] Battle music started: Track 1/7
   [AudioManager] Battle music started: Track 2/7
   [AudioManager] Battle music started: Track 3/7
   ```

4. **Expected Result:** Track number should increment with each battle

**Music Tracks:**
1. Battle Music Default
2. Battle mode music 1
3. Battle mode music 2
4. Battle mode 3
5. Battle mode music 4
6. Battle mode music 5
7. Battle-mode-music-6

---

## 🔍 Advanced Testing

### Special Attack Force Mechanism

**Test that special attacks are forced after turn 5:**

1. Open console
2. Start battle with special attack enemy
3. Monitor turn count and usage:
   ```javascript
   // Check if forcing is active
   window.battleManager.shouldForceSpecialAttack();
   ```

4. After turn 5, if usage < 3, special attacks should be forced

---

### Arena Background Loading

**Test that arena backgrounds load correctly:**

1. Open browser console
2. Check for errors related to image loading
3. Verify background image appears in battle scene
4. Check Network tab (F12 → Network) for 404 errors

**Common Issues:**
- Missing arena image files
- Incorrect file paths
- Typos in filenames

---

## 🐛 Bug Reporting Template

If you find issues, please report with this format:

```
**Issue:** [Brief description]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [What should happen]

**Actual Result:** [What actually happened]

**Console Logs:** [Copy relevant console output]

**Player Level:** [Your current level]

**Enemy Type:** [Enemy you were fighting]

**Browser:** [Chrome/Firefox/Safari/etc.]
```

---

## 📊 Performance Testing

### Check Battle Performance

1. Open browser console
2. Go to Performance tab
3. Start recording
4. Complete a full battle
5. Stop recording
6. Check for:
   - Frame drops
   - Long tasks (>50ms)
   - Memory leaks

**Expected Performance:**
- Smooth 60fps during battle
- No memory leaks
- Fast response to button clicks

---

## ✅ Success Criteria

### All Tests Pass When:

1. ✅ Special attacks used 3+ times per battle (check console logs)
2. ✅ Correct arenas appear for each level range
3. ✅ HP bars always visible during battle
4. ✅ Music tracks alternate correctly
5. ✅ No console errors or warnings
6. ✅ Battle mechanics work smoothly
7. ✅ Character hurt animations display correctly

---

## 🚀 Quick Test Script

Run this in browser console for automated checks:

```javascript
// Quick validation script
(function testBattleSystem() {
    console.log("=== TaskMonsters v16 Test Suite ===");
    
    // Test 1: Check BattleManager exists
    console.log("✓ BattleManager:", window.battleManager ? "FOUND" : "MISSING");
    
    // Test 2: Check BattleArenasManager exists
    console.log("✓ BattleArenasManager:", window.battleArenasManager ? "FOUND" : "MISSING");
    
    // Test 3: Check AudioManager exists
    console.log("✓ AudioManager:", window.audioManager ? "FOUND" : "MISSING");
    
    // Test 4: Check special attack tracking
    if (window.battleManager) {
        console.log("✓ Special Attack Tracking:", 
            typeof window.battleManager.specialAttackUsageCount === 'object' ? "ENABLED" : "DISABLED");
    }
    
    // Test 5: Check arena system
    if (window.battleArenasManager) {
        const arenas = window.battleArenasManager.getAvailableArenas(1);
        console.log("✓ Arena System:", arenas.length > 0 ? "WORKING" : "BROKEN");
    }
    
    // Test 6: Check battle music tracks
    if (window.audioManager) {
        console.log("✓ Battle Music Tracks:", window.audioManager.battleTracks.length);
    }
    
    console.log("=== Test Suite Complete ===");
})();
```

---

## 📞 Support

If you encounter issues:
1. Check console for error messages
2. Verify all files are properly uploaded
3. Clear browser cache
4. Try in incognito/private mode
5. Test in different browser

---

**Version:** 16.0.0  
**Last Updated:** February 5, 2026

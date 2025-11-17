# Task Monsters v2.4 - Testing Guide

## 🚨 CRITICAL: Clear Cache Before Testing!

**You MUST clear your browser cache or use Incognito mode to see the new changes!**

### Quick Cache Clear Methods:
1. **Incognito/Private Mode** (Easiest)
   - Chrome: `Ctrl + Shift + N` (Windows) / `Cmd + Shift + N` (Mac)
   - Firefox: `Ctrl + Shift + P` (Windows) / `Cmd + Shift + P` (Mac)
   - Safari: `Cmd + Shift + N`

2. **Hard Refresh**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Clear Cache Manually**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content
   - Safari: Develop → Empty Caches

---

## Test Scenarios

### 1. Hero Hurt Animation ✅
**What to test:** Hero returns to idle after taking damage

**Steps:**
1. Start a battle
2. Let the enemy attack
3. **Expected:** Hero plays hurt animation (4 frames), then returns to idle animation
4. **Duration:** Hurt animation lasts 2 seconds before returning to idle

**What was fixed:**
- Hero was stuck in hurt animation
- Now properly transitions: hurt → wait 2000ms → idle

---

### 2. Attack/Defense Gauges ✅
**What to test:** Gauges start at 100/100 instead of 0/100

**Steps:**
1. Start a battle
2. Look at the gauge display immediately
3. **Expected:** 
   - Attack Gauge: 100/100 (full green bar)
   - Defense Gauge: 100/100 (full blue bar)
   - Special Gauge: 0/100 (empty)

**What was fixed:**
- Gauges were showing 0/100 at battle start
- Now correctly initialize to 100/100 in `startBattle()`

---

### 3. HP Bar Visual Updates ✅
**What to test:** HP bar decreases visually when damage is taken

**Steps:**
1. Start a battle with 100 HP
2. Let enemy attack (e.g., 5 damage)
3. **Expected:**
   - HP text shows "95/100"
   - HP bar width decreases to 95%
   - Visual change is immediate

**What was fixed:**
- HP bar wasn't updating visually
- Added missing `updateBattleUI()` function

---

### 4. Fireball Projectile Animation 🔥
**What to test:** Hero throw animation + new fireball projectile

**Steps:**
1. Ensure you have fireballs in inventory (buy from shop if needed)
2. Start a battle
3. Click "Fireball" button
4. **Expected:**
   - Hero plays throw animation (4 frames, 600ms)
   - Fireball projectile flies from hero to enemy
   - Explosion animation plays (6 frames)
   - Hero returns to idle animation
   - Deals 15-18 damage

**Requirements:**
- 30 attack gauge
- At least 1 fireball in inventory

---

### 5. Prickler Projectile Animation 🌵
**What to test:** Hero throw animation + new prickler projectile

**Steps:**
1. Ensure you have pricklers in inventory (buy from shop if needed)
2. Start a battle
3. Click "Prickler" button
4. **Expected:**
   - Hero plays throw animation (4 frames, 600ms)
   - Prickler projectile flies with rotation
   - Explosion animation plays (9 frames)
   - Hero returns to idle animation
   - Deals 50 damage + applies Poison (5 dmg/turn for 3 turns)

**Requirements:**
- 20 attack gauge
- At least 1 prickler in inventory

---

### 6. Blue Flame Projectile Animation 🔵🔥
**What to test:** Hero throw animation + new blue flame projectile

**Steps:**
1. Ensure you have blue flames in inventory (buy from shop if needed)
2. Start a battle
3. Click "Blue Flame" button
4. **Expected:**
   - Hero plays throw animation (4 frames, 600ms)
   - Blue flame projectile flies with arc
   - Explosion animation plays (3 frames)
   - Hero returns to idle animation
   - Deals 20 damage

**Requirements:**
- 20 attack gauge
- At least 1 blue flame in inventory

---

### 7. Poison Damage Animation ☠️
**What to test:** Hero hurt animation when poison drains HP

**Steps:**
1. Fight a Treant (poison boss)
2. Get hit by poison attack
3. Wait for your turn
4. **Expected:**
   - Poison drains HP and gauges
   - Hero plays hurt animation
   - Hero returns to idle after 2 seconds
   - Battle log shows poison damage

---

### 8. Special Gauge System 💫
**What to test:** Special gauge fills correctly and displays gradient

**Steps:**
1. Start a battle
2. **Expected at start:** Special Gauge shows 0/100
3. Attack the enemy
4. **Expected:** Special Gauge increases by +15%
5. Take damage from enemy
6. **Expected:** Special Gauge increases by +10%
7. **Visual:** Gauge shows Blue→Purple→Gold gradient animation

---

## Quick Battle Test Sequence

### Fast Test (5 minutes)
1. ✅ Open game in Incognito mode
2. ✅ Check gauges at battle start (100/100/0)
3. ✅ Let enemy attack → verify hurt animation returns to idle
4. ✅ Check HP bar decreases visually
5. ✅ Use fireball → verify throw animation and projectile
6. ✅ Verify hero returns to idle after fireball

### Full Test (15 minutes)
1. ✅ All steps from Fast Test
2. ✅ Buy prickler from shop
3. ✅ Use prickler → verify throw animation and explosion
4. ✅ Buy blue flame from shop
5. ✅ Use blue flame → verify throw animation and explosion
6. ✅ Fight Treant → verify poison damage hurt animation
7. ✅ Verify special gauge fills on attack and damage
8. ✅ Test all hero animations: idle, attack1, walk-attack, throw, hurt, jump

---

## Expected Results Summary

| Feature | Expected Behavior | Status |
|---------|------------------|--------|
| Hero Hurt Animation | Returns to idle after 2 seconds | ✅ Fixed |
| Attack Gauge Start | 100/100 | ✅ Fixed |
| Defense Gauge Start | 100/100 | ✅ Fixed |
| Special Gauge Start | 0/100 | ✅ Working |
| HP Bar Updates | Decreases visually on damage | ✅ Fixed |
| Fireball Projectile | Throw animation + new sprite | ✅ Implemented |
| Prickler Projectile | Throw animation + new sprite | ✅ Implemented |
| Blue Flame Projectile | Throw animation + new sprite | ✅ Implemented |
| Poison Hurt Animation | Shows hurt on poison damage | ✅ Fixed |

---

## Troubleshooting

### Issue: Animations not working
**Solution:** Clear cache! Use Incognito mode.

### Issue: Projectiles not showing
**Solution:** 
1. Check browser console for errors (F12)
2. Verify assets are loaded: `/assets/battle-items/projectiles/`
3. Hard refresh the page

### Issue: Gauges still showing 0/100
**Solution:** 
1. Clear cache completely
2. Check cache busting version: `battleManager.js?v=2.4`
3. Use Incognito mode

### Issue: HP bar not updating
**Solution:**
1. Clear cache
2. Check cache busting version: `battleUI.js?v=2.4`
3. Hard refresh

---

## Developer Notes

### Files Modified in v2.4
- `js/battleManager.js?v=2.4` - Animation timing, gauge init
- `js/battleUI.js?v=2.4` - Added updateBattleUI, projectile paths
- `index.html` - Cache busting updates
- `assets/battle-items/projectiles/` - New projectile assets

### Animation Timing Reference
- **Hurt animation:** 2000ms (matches reference app)
- **Throw animation:** 600ms (4 frames × 150ms)
- **Idle animation:** Continuous loop

### Cache Busting
Current version: **v2.4**
- Always increment version when modifying JS files
- Update in `index.html` script tags
- Format: `file.js?v=2.4`

---

**Version:** 2.4  
**Last Updated:** November 6, 2025  
**Status:** Ready for Testing

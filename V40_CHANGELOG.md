# Task Monsters V40 - Hero Size & Fly Drone Fixes

**Release Date:** December 30, 2025

## 🎯 What's Fixed in V40

### 1. **Hero Monster Size Adjustment**
- Reduced hero sprite scale from 2.5 to 2.0 in battle mode
- Now matches reference screenshot proportions
- Better visual balance between hero and enemy sprites

### 2. **Fly Enemy Renamed to "Fly Drone"**
- Changed enemy name from "Fly" to "Fly Drone" across all systems
- Updated in enemy.js, battleManager.js, and enemy-init.js
- Evasion emoji still displays correctly (🪰)

### 3. **Fly Drone Projectile Attack Bug Fixed**
- **CRITICAL FIX:** Fly Drone no longer transforms into the blue blast projectile
- Enemy sprite now stays visible during attack
- Blue energy blast projectile shoots from Fly Drone to hero correctly
- Fixed by preventing sprite background image changes during attack animation
- Fly Drone keeps idle sprite while projectile animates separately

## 🔧 Technical Changes

### Files Modified:
1. **css/battle.css** (line 144)
   - Changed `transform: scale(2.5)` to `transform: scale(2.0)` for hero sprites

2. **js/enemy.js** (lines 308, 455-458, 469, 478, 499-503)
   - Renamed "Fly" to "Fly Drone"
   - Added Fly Drone exception in `playEnemyAnimation` function
   - Prevents sprite background image change during attack
   - Prevents sprite reset in setTimeout section

3. **js/battleManager.js** (line 255)
   - Updated evasion emoji check from 'Fly' to 'Fly Drone'

4. **js/enemy-init.js** (line 101)
   - Updated enemy name check from 'Fly' to 'Fly Drone'

## 🐛 Bug Details

**Problem:** When Fly Drone attacked, the `playEnemyAnimation` function would change the enemy sprite's background image to the attack sprite (blue blast), making it appear as if the Fly turned INTO the projectile instead of shooting it.

**Root Cause:** Fly Drone was not in the list of enemies that should keep their idle sprite during attacks (like Ghost, Medusa, etc.)

**Solution:** Added conditional checks to skip sprite background image changes for Fly Drone in both the initial animation and the setTimeout reset, allowing the projectile to animate independently while the enemy remains visible.

## ✅ Current Game State (V40)

**All Systems Operational:**
- ✅ Static enemy animation system (V38)
- ✅ All 9 projectile systems working correctly
- ✅ Fly Drone blue energy blast shoots properly
- ✅ Physical attack system (35% lunge chance)
- ✅ HP drain, HP absorption, evasion abilities
- ✅ Damage balance (level 1 max 9 damage)
- ✅ Blue flame custom image in shop/battle
- ✅ Battle arenas alternating by level
- ✅ Turn timer restricted to level 10+
- ✅ Hero sprite properly sized in battle

## 🎮 Testing Checklist

- [x] Hero sprite size matches reference screenshot
- [x] Fly Drone name displays correctly in battle
- [x] Fly Drone shoots blue blast projectile (doesn't turn into it)
- [x] Fly Drone remains visible during attack
- [x] All other enemy projectiles still work
- [x] No sprite flickering or overflow issues

---

**Previous Version:** V39 (Blue Flame Image Update)  
**Current Version:** V40 (Hero Size & Fly Drone Fixes)

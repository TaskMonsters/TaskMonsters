# Task Monsters V41 - True Alternation System

**Release Date:** December 30, 2025

## 🎯 What's New in V41

### **True Enemy Alternation System**
The game now cycles through **all available enemies** in order before repeating, ensuring predictable variety and fair distribution of enemy encounters.

**Previous System:** Random selection with 2-4 battle "sticky" behavior (same enemy could appear multiple times before seeing others)

**New System:** True rotation - enemies appear in sequence, cycling through the entire pool before repeating

**Benefits:**
- No more seeing the same enemy 3-4 times while others never appear
- Predictable progression through enemy types
- All enemies get equal screen time
- Better showcase of game content

### **True Arena Alternation System**
Battle arenas now cycle through **all available arenas** in order before repeating, ensuring visual variety in every play session.

**Arena Progression:**
- **Levels 1-10:** Synth City only (tutorial phase)
- **Levels 11-19:** 9 arenas rotate (City Sunset, Forest, Ocean, Castle, Temple, Space, Night Town, Synth City, Skull Gate)
- **Levels 20+:** All 10 shop themes rotate (adds Neon City to the mix)

**Previous System:** Random selection with 3-5 battle "sticky" behavior, weighted towards certain arenas

**New System:** True rotation - arenas appear in sequence, cycling through the entire pool before repeating

**Benefits:**
- Guaranteed to see all arenas in rotation
- No more getting stuck in the same arena for multiple battles
- Smooth visual variety as you progress
- Fair distribution of all arena themes

---

## 🔧 Technical Changes

### Files Modified:

**1. js/enemy.js** (lines 333-353)
- Replaced random enemy selection with true alternation system
- Added rotation index tracking with modulo cycling
- Automatic reset when new enemies unlock (level up)
- Removed "sticky battle" random behavior

**2. js/battleManager.js** (lines 118-172)
- Replaced random arena selection with true alternation system
- Reorganized arena pools by level tiers (1-10, 11-19, 20+)
- Added rotation index tracking with modulo cycling
- Automatic reset when new arenas unlock (level threshold)
- Removed weighted arena selection and "sticky battle" behavior

---

## 📊 Enemy Rotation Examples

**Level 1:** Lazy Bat only

**Level 2:** Lazy Bat → Octopus → Alien → (repeat)

**Level 5:** Lazy Bat → Lazy Bat II → Octopus → Alien → Slime → Fire Skull → Fly Drone → (repeat)

**Level 13:** All 11 regular enemies rotate before repeating

**Boss Battles:** Still appear at levels 10, 20, 30, 40, 50... (unchanged)

---

## 🏟️ Arena Rotation Examples

**Levels 1-10:** Synth City every battle

**Levels 11-19:** 
Battle 1: City Sunset  
Battle 2: Forest  
Battle 3: Ocean  
Battle 4: Castle  
Battle 5: Temple  
Battle 6: Space  
Battle 7: Night Town  
Battle 8: Synth City  
Battle 9: Skull Gate  
Battle 10: City Sunset (cycle repeats)

**Levels 20+:** All 10 arenas rotate in order

---

## ✅ Testing Checklist

- [x] Enemy rotation cycles through all available enemies
- [x] No duplicate enemies until full rotation complete
- [x] Rotation resets when new enemy unlocks
- [x] Arena rotation cycles through all available arenas
- [x] No duplicate arenas until full rotation complete
- [x] Rotation resets when new arena tier unlocks
- [x] Level 1-10 shows only Synth City
- [x] Level 11+ shows 9 rotating arenas
- [x] Level 20+ shows all 10 arenas
- [x] Boss battles still appear at correct levels

---

## 🎮 Player Experience Improvements

**Before V41:**
- Could see Lazy Bat 4 times in a row at level 5
- Might not see Fire Skull for 10+ battles
- Arena could stay the same for 5 battles
- Unpredictable variety

**After V41:**
- See each enemy exactly once before any repeat
- All enemies appear in predictable order
- Each arena appears exactly once before any repeat
- Consistent, fair variety

---

## 📝 Documentation

See `ALTERNATION_SYSTEM_TEST.md` for detailed testing instructions and technical implementation details.

---

**Previous Version:** V40 (Hero Size & Fly Drone Fixes)  
**Current Version:** V41 (True Alternation System)

**All V40 Features Preserved:**
- ✅ Hero sprite size (scale 2.0)
- ✅ Fly Drone renamed and projectile fixed
- ✅ Static enemy animation system
- ✅ All 9 projectile systems working
- ✅ Physical attack system (35% lunge)
- ✅ HP drain, absorption, evasion abilities
- ✅ Damage balance (level 1 max 9)
- ✅ Blue flame custom image
- ✅ Turn timer level 10+

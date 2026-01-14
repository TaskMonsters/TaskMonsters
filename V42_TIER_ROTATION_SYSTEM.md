# V42 - 7-Level Tier Enemy Rotation System

## Overview

Enemies now rotate on a **7-level tier system**. The enemy pool resets every 7 levels, cycling through all available enemies (including those from previous levels) before repeating.

---

## How It Works

### Level Tiers:
- **Tier 1:** Levels 1-7
- **Tier 2:** Levels 8-14
- **Tier 3:** Levels 15-21
- **Tier 4:** Levels 22-28
- And so on...

### Rotation Behavior:
1. When you enter a new 7-level tier, the enemy rotation **resets**
2. All enemies from **current and previous levels** are available
3. Enemies cycle through in order within each tier
4. After seeing all available enemies once, the rotation repeats

### Key Feature:
**All enemies from lower levels remain available!** You can still battle early-game enemies at high levels.

---

## Example Progression

### Levels 1-7 (Tier 1)
**Available Enemies:** Lazy Bat, Octopus, Alien, Lazy Bat II, Slime, Fire Skull, Fly Drone, Ghost Task Stopper

**Rotation:**
- Battle 1: Lazy Bat
- Battle 2: Octopus
- Battle 3: Alien
- Battle 4: Lazy Bat II
- Battle 5: Slime
- Battle 6: Fire Skull
- Battle 7: Fly Drone
- Battle 8: Ghost Task Stopper
- Battle 9: Lazy Bat (cycle repeats)

### Levels 8-14 (Tier 2)
**Available Enemies:** All from Tier 1 + Medusa, Lazy Eye, Ogre (unlocked at levels 8, 12, 13)

**Rotation resets at level 8:**
- Battle 1 (Level 8): Lazy Bat
- Battle 2: Octopus
- Battle 3: Alien
- Battle 4: Lazy Bat II
- Battle 5: Slime
- Battle 6: Fire Skull
- Battle 7: Fly Drone
- Battle 8: Ghost Task Stopper
- Battle 9: Medusa (new!)
- Battle 10: Lazy Eye (new!)
- Battle 11: Ogre (new!)
- Battle 12: Lazy Bat (cycle repeats)

### Levels 15-21 (Tier 3)
**Available Enemies:** All enemies from Tiers 1 & 2 (no new enemies unlock in this range)

**Rotation resets at level 15:**
- Cycles through all 11 regular enemies
- Early enemies (Lazy Bat, Slime, etc.) still appear!

### Levels 22-28 (Tier 4)
**Rotation resets at level 22:**
- Continues cycling through all available enemies
- Pattern continues indefinitely

---

## Boss Battles

Boss battles are **separate** from the rotation system:
- **Level 10, 40, 70...** → Treant Boss
- **Level 20, 50, 80...** → Sunny Dragon Boss
- **Level 30, 60, 90...** → Mushroom Boss

Bosses appear at their designated levels regardless of the rotation tier.

---

## Benefits

### 1. **Consistent Variety**
- See all enemies in rotation before repeats
- No more random selection that could show same enemy multiple times

### 2. **Nostalgia Factor**
- Early enemies remain available at high levels
- Can still battle Lazy Bat at level 50!

### 3. **Predictable Pacing**
- Rotation resets every 7 levels for fresh experience
- Players know when to expect rotation reset

### 4. **Fair Distribution**
- Every enemy gets equal screen time within each tier
- No enemy is "forgotten" as you level up

### 5. **Strategic Depth**
- Can plan for specific enemy encounters
- Know which enemies are in current rotation pool

---

## Technical Implementation

### Code Changes (enemy.js):

```javascript
// Enemy rotation system - 7-level tier rotation
let currentEnemyRotationIndex = 0;
let lastLevelTier = 0;

function getNextEnemyFromRotation(availableEnemies, playerLevel) {
    // Calculate current level tier (0-6, 7-13, 14-20, etc.)
    const currentLevelTier = Math.floor((playerLevel - 1) / 7);
    
    // Reset rotation index when entering a new 7-level tier
    if (currentLevelTier !== lastLevelTier) {
        currentEnemyRotationIndex = 0;
        lastLevelTier = currentLevelTier;
    }
    
    // Get current enemy from rotation
    const selectedEnemy = availableEnemies[currentEnemyRotationIndex];
    
    // Move to next enemy in rotation
    currentEnemyRotationIndex = (currentEnemyRotationIndex + 1) % availableEnemies.length;
    
    return selectedEnemy;
}
```

### Key Logic:
- `Math.floor((playerLevel - 1) / 7)` calculates tier (0, 1, 2, 3...)
- Level 1-7 → Tier 0
- Level 8-14 → Tier 1
- Level 15-21 → Tier 2
- When tier changes, rotation index resets to 0

---

## Testing Checklist

### Test Tier Transitions:
- [x] Level 1-7: Rotation cycles through available enemies
- [x] Level 8: Rotation resets, starts from first enemy
- [x] Level 15: Rotation resets again
- [x] Level 22: Rotation resets again

### Test Enemy Availability:
- [x] Level 1: Only Lazy Bat available
- [x] Level 7: All Tier 1 enemies available
- [x] Level 8: All Tier 1 enemies still available + Medusa
- [x] Level 15: All previous enemies still available

### Test Rotation Cycling:
- [x] Battle through full rotation in one tier
- [x] Verify rotation repeats after seeing all enemies
- [x] Verify no duplicate enemies until full cycle complete

### Test Boss Integration:
- [x] Level 10: Treant Boss appears (doesn't affect rotation)
- [x] Level 11: Regular rotation continues
- [x] Level 20: Sunny Dragon Boss appears
- [x] Level 30: Mushroom Boss appears

---

## Comparison to Previous Systems

### V40 (Before V42):
- Random selection with 2-4 battle "sticky" behavior
- Could see same enemy multiple times before others
- Unpredictable variety

### V41:
- True alternation every battle
- Rotation reset when new enemy unlocked
- Too frequent changes, less immersive

### V42 (Current):
- **7-level tier rotation**
- Rotation resets every 7 levels
- All previous enemies remain available
- **Perfect balance of variety and consistency**

---

## Player Experience

**Early Game (Levels 1-7):**
- Build familiarity with core enemies
- See variety within first tier

**Mid Game (Levels 8-21):**
- Rotation resets at levels 8 and 15
- Fresh experience every 7 levels
- Still see early enemies mixed in

**Late Game (Levels 22+):**
- Full enemy roster available
- Rotation continues every 7 levels
- Nostalgic encounters with early enemies

---

**Previous Version:** V41 (True Alternation System)  
**Current Version:** V42 (7-Level Tier Rotation)

**Key Improvement:** Enemies rotate less frequently (every 7 levels) while maintaining variety and keeping all previous enemies available.

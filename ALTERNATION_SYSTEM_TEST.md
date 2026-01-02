# Enemy and Arena Alternation System - Test Guide

## V41 Changes: True Alternation Implementation

The game now uses **true alternation** instead of random selection with sticky behavior. This ensures predictable variety and all enemies/arenas are seen in rotation.

---

## Enemy Alternation System

### How It Works:
- Enemies cycle through **all available enemies** at the current level in order
- When a new enemy is unlocked (level up), rotation resets to include the new enemy
- **No randomness** - enemies appear in a predictable sequence

### Enemy Unlock Progression:

**Level 1:**
- Rotation: Lazy Bat → Lazy Bat → Lazy Bat...

**Level 2:**
- Rotation: Lazy Bat → Octopus → Alien → Lazy Bat → Octopus → Alien...

**Level 3:**
- Rotation: Lazy Bat → Lazy Bat II → Octopus → Alien → (repeat)

**Level 5:**
- Rotation: Lazy Bat → Lazy Bat II → Octopus → Alien → Slime → Fire Skull → Fly Drone → (repeat)

**Level 7:**
- Rotation: Lazy Bat → Lazy Bat II → Octopus → Alien → Slime → Ghost Task Stopper → Fire Skull → Fly Drone → (repeat)

**Level 8:**
- Rotation: Lazy Bat → Lazy Bat II → Octopus → Alien → Slime → Ghost Task Stopper → Medusa → Fire Skull → Fly Drone → (repeat)

**Level 10:**
- **TREANT BOSS** (every 10 levels: 10, 40, 70, 100...)

**Level 12:**
- Rotation: Lazy Bat → Lazy Bat II → Octopus → Alien → Slime → Ghost Task Stopper → Medusa → Lazy Eye → Fire Skull → Fly Drone → (repeat)

**Level 13:**
- Rotation: Lazy Bat → Lazy Bat II → Octopus → Alien → Slime → Ghost Task Stopper → Medusa → Lazy Eye → Fire Skull → Ogre → Fly Drone → (repeat)

**Level 20:**
- **SUNNY DRAGON BOSS** (every 30 levels offset by 20: 20, 50, 80, 110...)

**Level 30:**
- **MUSHROOM BOSS** (every 30 levels: 30, 60, 90, 120...)

---

## Arena Alternation System

### How It Works:
- Arenas cycle through **all available arenas** at the current level in order
- When new arenas unlock (level threshold), rotation resets to include new arenas
- **No randomness** - arenas appear in a predictable sequence

### Arena Unlock Progression:

**Levels 1-10:**
- Arena: Synth City (only)
- Every battle uses Synth City

**Levels 11-19:**
- Rotation: City Sunset → Forest → Ocean → Castle → Temple → Space → Night Town → Synth City → Skull Gate → (repeat)
- **9 arenas** rotating

**Levels 20+:**
- Rotation: Forest → Night Town → City Sunset → Temple → Ocean → Skull Gate → Space → Castle → Neon City → Synth City → (repeat)
- **10 arenas** rotating (all shop themes)

---

## Testing Instructions

### Test Enemy Alternation:
1. Start at Level 1 - should only see Lazy Bat
2. Level up to 2 - should see Lazy Bat, then Octopus, then Alien, then Lazy Bat again
3. Level up to 3 - rotation should reset and include Lazy Bat II
4. Continue leveling and verify enemies appear in predictable order
5. At level 10, 20, 30 - verify boss battles appear

### Test Arena Alternation:
1. Levels 1-10 - every battle should be Synth City
2. Level 11 - first battle should be City Sunset, then Forest, then Ocean, etc.
3. Complete 9 battles at level 11+ - should see all 9 arenas once
4. Level 20 - rotation should reset with all 10 arenas
5. Verify arenas cycle through in order without repeating until all are shown

### Expected Behavior:
✅ **No duplicate enemies** until all available enemies have been battled
✅ **No duplicate arenas** until all available arenas have been used
✅ **Predictable patterns** - players can anticipate what's coming next
✅ **Automatic reset** when new enemies/arenas unlock

---

## Technical Implementation

### Enemy Rotation (enemy.js):
```javascript
function getNextEnemyFromRotation(availableEnemies) {
    // Reset rotation index if enemy pool changed
    if (availableEnemies.length !== lastAvailableEnemiesCount) {
        currentEnemyRotationIndex = 0;
        lastAvailableEnemiesCount = availableEnemies.length;
    }
    
    // Get current enemy from rotation
    const selectedEnemy = availableEnemies[currentEnemyRotationIndex];
    
    // Move to next enemy in rotation
    currentEnemyRotationIndex = (currentEnemyRotationIndex + 1) % availableEnemies.length;
    
    return selectedEnemy;
}
```

### Arena Rotation (battleManager.js):
```javascript
// True alternation system - cycle through arenas in order
if (!window.battleArenaRotationIndex) window.battleArenaRotationIndex = 0;

// Reset rotation if arena pool changed (level up unlocked new arenas)
if (availableArenas.length !== window.lastArenaPoolSize) {
    window.battleArenaRotationIndex = 0;
    window.lastArenaPoolSize = availableArenas.length;
}

// Get current arena from rotation
const selectedArena = availableArenas[window.battleArenaRotationIndex];

// Move to next arena in rotation
window.battleArenaRotationIndex = (window.battleArenaRotationIndex + 1) % availableArenas.length;
```

---

## Benefits of True Alternation

1. **Predictable Variety** - Players know they'll see all enemies/arenas before repeats
2. **Fair Experience** - No bad RNG where same enemy appears 5 times in a row
3. **Strategic Planning** - Players can prepare for upcoming enemies
4. **Showcase Content** - All enemies and arenas get equal screen time
5. **Better Pacing** - Smooth progression through game content

---

**Previous System:** Random selection with 2-4 battle "sticky" behavior (could see same enemy multiple times before others)

**New System (V41):** True alternation - cycles through all available options in order before repeating

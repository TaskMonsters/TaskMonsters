# Arena Rotation Update - Every 5 Battles

## Changes Made

### Arena Rotation Frequency
**Changed:** Arena backgrounds now rotate **every 5 battles** instead of every single battle.

**Location:** `/js/battleInit.js` (lines 17-37)

**Implementation:**
```javascript
let currentArenaIndex = 0;
let battlesSinceArenaChange = 0;
const BATTLES_PER_ARENA = 5;

function getNextArenaBackground() {
    if (!ARENA_POOL || ARENA_POOL.length === 0) return null;
    
    // Increment battle counter
    battlesSinceArenaChange++;
    
    // Only rotate arena every 5 battles
    if (battlesSinceArenaChange >= BATTLES_PER_ARENA) {
        currentArenaIndex = (currentArenaIndex + 1) % ARENA_POOL.length;
        battlesSinceArenaChange = 0;
        console.log(`[Arena] Rotating to NEW arena ${currentArenaIndex + 1}/${ARENA_POOL.length}: ${ARENA_POOL[currentArenaIndex]}`);
    } else {
        console.log(`[Arena] Keeping current arena (${battlesSinceArenaChange}/${BATTLES_PER_ARENA} battles): ${ARENA_POOL[currentArenaIndex]}`);
    }
    
    return ARENA_POOL[currentArenaIndex];
}
```

### Console Logging
- **Battle 1-4:** "Keeping current arena (X/5 battles): [arena_name]"
- **Battle 5:** "Rotating to NEW arena X/10: [arena_name]"

## Background Architecture Confirmed

### Page Background (NEVER CHANGES)
- **Element:** `.pet-rock-header`
- **Managed by:** `js/backgroundManager.js`
- **Changes only with:** Day/night cycle (every 12 hours) or custom themes from shop
- **Purpose:** Main app container with forest/nature scene

### Battle Arena Background (ROTATES EVERY 5 BATTLES)
- **Element:** `#battleArena` (full-screen battle overlay)
- **Managed by:** `js/battleInit.js` → `getNextArenaBackground()`
- **Rotation:** Round-robin through 10 arena backgrounds
- **Frequency:** Every 5 battles
- **Purpose:** Battle scene container (rectangular game frame)

## Arena Pool (10 Backgrounds)
1. forest-road.png
2. mountain-dusk.png
3. temple-arena.png
4. castle.png
5. city.png
6. forest.png
7. graveyard.png
8. underwater.png
9. space.png
10. synth-city.png

## Testing Instructions
1. Complete 5 tasks to trigger battles
2. Check console for arena rotation messages
3. Observe that:
   - Main page background (forest/nature) stays the same
   - Battle arena background changes only on the 5th battle
   - Counter resets after arena change

## Files Modified
- `/js/battleInit.js` - Updated `getNextArenaBackground()` function

## Verification
✅ Page background remains static (only changes with day/night or themes)
✅ Battle arena rotates every 5 battles (not every battle)
✅ Console logging shows battle counter (X/5)
✅ Round-robin rotation through 10 arena backgrounds
✅ No conflicts between page background and arena background systems

# Battle Arenas and Recurring Tasks Update

## Summary

This update adds 5 new battle arenas to the game, adjusts the arena rotation system to make city_sunset.png more common for levels 1-10, and removes the add button and descriptive text from the Recurring Tasks section.

## Changes Made

### 1. New Battle Arenas Added

Added 5 new battle arena backgrounds to `assets/battle-backgrounds/`:

1. **space.png** - A cosmic space background with a glowing planet
2. **castle.png** - A dark castle interior with gothic windows and vines
3. **city.png** - A vibrant neon city street with retro aesthetics
4. **synth-city.png** - A synthwave-style cityscape with palm trees and purple skies
5. **skull-gate-arena.png** - A dark temple entrance with skull motif

### 2. CSS Classes Added

Added new CSS classes in `css/battle.css`:

- `.bg-space` - Updated to use new space.png
- `.bg-castle` - Castle interior arena
- `.bg-city-neon` - Neon city street arena
- `.bg-synth-city` - Synthwave city arena
- `.bg-skull-gate` - Skull gate temple arena

### 3. Battle Arena Rotation System Updated

Updated the arena rotation logic in `js/battleManager.js` with the following progression:

**Levels 1-10**: city_sunset appears 3x more frequently than other arenas
- Level 1: city_sunset (3x weight)
- Level 3: + forest_path
- Level 5: + ocean
- Level 7: + castle
- Level 10: + temple

**Levels 11+**: city_sunset appears with normal frequency
- Level 12: + space
- Level 15: + city-neon
- Level 18: + night_town
- Level 20: + synth-city
- Level 25: + skull-gate

The rotation system cycles through available arenas sequentially, ensuring variety while respecting level progression.

### 4. Recurring Tasks UI Cleanup

Removed from the Recurring Tasks card header in `index.html`:
- ➕ Add button (previously triggered `openCreateRecurringTaskModal()`)
- "Automated routine tasks" descriptive text

The header now shows only "📅 Recurring Tasks" for a cleaner, simpler appearance.

## Arena Unlock Progression

| Level | Arena | Theme |
|-------|-------|-------|
| 1 | City Sunset | Peaceful city at dusk (3x frequency levels 1-10) |
| 3 | Forest Path | Natural forest setting |
| 5 | Ocean | Coastal battle arena |
| 7 | Castle | Gothic castle interior |
| 10 | Temple | Ancient temple ruins |
| 12 | Space | Cosmic space environment |
| 15 | Neon City | Retro cyberpunk street |
| 18 | Night Town | Dark urban setting |
| 20 | Synth City | Synthwave aesthetic |
| 25 | Skull Gate | Ominous temple entrance |

## Technical Details

**Arena Rotation Algorithm**:
- Maintains a global `window.battleArenaIndex` counter
- Cycles through available arenas using modulo operation
- City sunset has 3x weight for levels 1-10 by adding it to the array 3 times
- Ensures new players see the beginner-friendly city_sunset arena more frequently

**CSS Implementation**:
- All arena backgrounds use `background-image` property
- Images are loaded from `assets/battle-backgrounds/`
- Consistent styling with `background-size: cover` and `background-position: center`

## Files Modified

1. `assets/battle-backgrounds/` - Added 5 new arena images
2. `css/battle.css` - Added 5 new CSS classes for arenas
3. `js/battleManager.js` - Updated arena rotation logic (lines 97-126)
4. `index.html` - Simplified Recurring Tasks header (lines 4021-4024)

## Testing Recommendations

1. Start a new game and verify city_sunset appears frequently in early levels
2. Progress through levels to confirm new arenas unlock at correct levels
3. Check that arena rotation cycles properly without repeating
4. Verify Recurring Tasks section displays correctly without add button
5. Test all arena backgrounds load properly without visual glitches

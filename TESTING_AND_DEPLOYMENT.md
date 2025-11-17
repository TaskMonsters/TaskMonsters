# Task Monsters Battle System - Testing & Deployment Guide

## Quick Start

### 1. Deploy the Fixed Files
Replace the following files in your production environment:
- `js/specialGaugeSystem.js`
- `js/enemyAI.js`
- `js/battleManager.js`
- `index.html` (battleItems section only, lines 6844-6988)

### 2. Clear Browser Cache
Users should clear their browser cache or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to ensure they load the updated files.

### 3. Test in Order
Follow the testing checklist below in sequence.

## Testing Checklist

### Phase 1: Visual Tests (No Battle Required)

#### Test 1.1: Special Gauge Gradient
1. Start any battle
2. Look at the Special Attack gauge beneath the monster's HP bar
3. **Expected**: Gauge should display a Blue→Purple→Gold gradient
4. **Pass Criteria**: Colors transition smoothly from blue (#4169E1) through purple (#9370DB) to gold (#FFD700)

#### Test 1.2: Shop Item Prices
1. Open the Shop tab
2. Check the prices of the following items:
   - Potion: 50 XP
   - Power Boost: 150 XP
   - Freeze Attack: 250 XP
   - Mirror Explosion: 400 XP
   - Spark Orb: 600 XP
   - Prickler: 800 XP
   - Asteroid: 1200 XP
3. **Pass Criteria**: All prices match the list above

#### Test 1.3: Item Descriptions
1. In the Shop, verify item descriptions match:
   - Potion: "Heals 25% of Monster's Max HP"
   - Spark Orb: "Deals 100 Damage, 10% chance to hit twice"
   - Prickler: "Deals 50 Damage, applies Poison debuff (5 Damage per turn for 3 turns)"
   - Asteroid: "Deals massive 150 Damage, but has a 10% chance to miss"
   - Freeze Attack: "Deals 50 Damage, 30% chance to Stun enemy for 1 turn"
   - Mirror Explosion: "Deals 75 Damage, reflects 50% of damage taken back to enemy next turn"
2. **Pass Criteria**: All descriptions are accurate

### Phase 2: Battle Item Tests

#### Test 2.1: Potion Healing
1. Start a battle and take damage
2. Note your current HP and max HP
3. Use a Potion
4. **Expected**: Heal amount = 25% of max HP (e.g., if max HP is 100, heal 25)
5. **Pass Criteria**: Healing is percentage-based, not fixed at 20

#### Test 2.2: Spark Orb Damage
1. Purchase Spark Orbs (need Level 20)
2. Start a battle
3. Use Spark Orb multiple times (5-10 times recommended)
4. **Expected**: 
   - Each hit deals 100 damage
   - Occasionally see "⚡⚡ DOUBLE HIT!" message (10% chance)
   - When double hit occurs, enemy takes 200 total damage
5. **Pass Criteria**: Damage is 100 per hit, double hits occur occasionally

#### Test 2.3: Prickler Poison Effect
1. Purchase Pricklers (need Level 25)
2. Start a battle
3. Use Prickler
4. **Expected**:
   - Initial hit deals 50 damage
   - Message: "🦠 Enemy is poisoned! (5 damage per turn for 3 turns)"
   - For next 3 enemy turns, see "🦠 [Enemy] takes 5 poison damage!"
5. **Pass Criteria**: Poison ticks for exactly 3 turns, dealing 5 damage each turn

#### Test 2.4: Asteroid Miss Chance
1. Purchase Asteroids (need Level 35)
2. Start a battle
3. Use Asteroid 10+ times
4. **Expected**:
   - Most hits deal 150 damage
   - Occasionally see "💨 Asteroid missed!" (10% chance)
   - When it misses, no damage is dealt
5. **Pass Criteria**: ~10% miss rate, 150 damage when hits

#### Test 2.5: Freeze Stun Effect
1. Purchase Freeze Attacks (need Level 10)
2. Start a battle
3. Use Freeze Attack multiple times
4. **Expected**:
   - Each use deals 50 damage
   - Occasionally see "❄️ Enemy is stunned!" (30% chance)
   - When stunned, enemy skips next turn
5. **Pass Criteria**: 50 damage per use, ~30% stun rate

#### Test 2.6: Mirror Explosion Damage + Reflect
1. Purchase Mirror Explosions (need Level 15)
2. Start a battle
3. Use Mirror Explosion
4. **Expected**:
   - Deals 75 damage immediately
   - Message: "🪞 Mirror dealt 75 damage! Next damage taken will be reflected 50%!"
   - On enemy's next attack, 50% of damage is reflected back
5. **Pass Criteria**: 75 initial damage, 50% reflect on next hit

### Phase 3: Enemy AI Tests

#### Test 3.1: Enemy Healing Behavior
1. Start a battle with a mid-tier or boss enemy
2. Reduce enemy HP below 30%
3. Wait for enemy turns
4. **Expected**: Enemy has a chance to heal (40% when HP < 30%)
5. **Pass Criteria**: Enemy heals strategically when low on HP, not randomly

#### Test 3.2: Enemy Defense Behavior
1. Start a battle
2. Use high-damage attacks (Asteroid, Spark)
3. Observe enemy behavior
4. **Expected**: Enemy occasionally defends (30% chance when threatened)
5. **Pass Criteria**: Enemy defends proactively, not randomly

#### Test 3.3: Enemy Decision Priority
1. Start multiple battles
2. Observe enemy behavior patterns
3. **Expected**: Enemies prioritize:
   - Healing when HP < 30%
   - Defending when player is strong
   - Special attacks when HP > 50%
   - Status effects occasionally
   - Basic attacks as default
5. **Pass Criteria**: Enemy decisions feel strategic, not random

### Phase 4: Performance Tests

#### Test 4.1: Frame Rate
1. Start a battle
2. Use various attacks (especially Spark, Asteroid, Prickler)
3. Observe animation smoothness
4. **Expected**: Smooth 60 FPS throughout
5. **Pass Criteria**: No lag, stuttering, or frame drops

#### Test 4.2: Special Gauge Animation
1. Start a battle
2. Attack multiple times to fill the Special Gauge
3. Watch the gauge fill animation
4. **Expected**: Smooth gradient animation at 60 FPS
5. **Pass Criteria**: Buttery-smooth fill transition

## Known Issues & Workarounds

### Issue 1: Power Boost Still Refills Gauge
**Status**: Not yet implemented
**Workaround**: Power Boost currently refills attack gauge instead of applying a 3-turn buff
**Fix Required**: Implement buff system in battleManager.js

### Issue 2: Battle Trigger Not Updated
**Status**: Not yet implemented
**Workaround**: Battle trigger is not yet 35%/50% based on settings
**Fix Required**: Update questTaskManager.js

### Issue 3: No Tiered Loot Drops
**Status**: Not yet implemented
**Workaround**: Loot drops don't follow 70/25/5 tier system yet
**Fix Required**: Implement loot table in battleManager.js

## Deployment Steps

### Step 1: Backup Current Files
```bash
# Backup current production files
cp js/specialGaugeSystem.js js/specialGaugeSystem.js.backup
cp js/enemyAI.js js/enemyAI.js.backup
cp js/battleManager.js js/battleManager.js.backup
cp index.html index.html.backup
```

### Step 2: Deploy New Files
```bash
# Copy fixed files to production
cp /path/to/fixed/js/specialGaugeSystem.js js/
cp /path/to/fixed/js/enemyAI.js js/
cp /path/to/fixed/js/battleManager.js js/
cp /path/to/fixed/index.html index.html
```

### Step 3: Verify Deployment
1. Check file sizes match
2. Verify no syntax errors in browser console
3. Run Phase 1 visual tests

### Step 4: Monitor User Feedback
1. Watch for bug reports related to:
   - Item damage values
   - Poison effects not working
   - Enemy AI behaving strangely
   - Special gauge color issues
2. Check browser console for JavaScript errors

## Rollback Plan

If critical issues are discovered:

```bash
# Restore backup files
cp js/specialGaugeSystem.js.backup js/specialGaugeSystem.js
cp js/enemyAI.js.backup js/enemyAI.js
cp js/battleManager.js.backup js/battleManager.js
cp index.html.backup index.html

# Clear server cache if applicable
# Notify users to hard refresh
```

## Success Criteria (Gold Standard)

The deployment is successful when:

1. ✅ **Performance**: 60 FPS throughout all battle animations
2. ✅ **AI Sophistication**: Enemy AI makes strategic, non-random decisions
3. ✅ **Visual Parity**: Special gauge displays correct Blue→Purple→Gold gradient
4. ✅ **Economic Balance**: All shop items have correct costs and effects
5. ✅ **Special Attack Flow**: All item effects work as specified in blueprint
6. ✅ **Architectural Cleanliness**: No JavaScript errors in console

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files were deployed correctly
3. Ensure users have cleared their cache
4. Review CHANGES_MADE.md for implementation details
5. Consult BLUEPRINT_IMPLEMENTATION_NOTES.md for specifications

## Next Steps

After successful deployment and testing:
1. Implement Power Boost buff system
2. Add battle trigger logic (35%/50%)
3. Implement tiered loot drops
4. Add Level 50 progression cap
5. Verify asset preloading
6. Test on multiple browsers and devices

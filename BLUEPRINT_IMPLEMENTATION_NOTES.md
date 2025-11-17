# Blueprint Implementation Notes

## Current Status Analysis

### ✅ Already Implemented
1. **Special Gauge System** - Exists in `js/specialGaugeSystem.js`
   - ✅ Fills +15% on attack, +10% on damage
   - ✅ Positioned beneath HP bar
   - ✅ Gradient updated to Blue→Purple→Gold (FIXED)
   
2. **Battle Items** - Exist in `index.html` battleItems object
   - ✅ Potion (20 XP cost)
   - ✅ Power Boost (25 XP cost)
   - ✅ Freeze Attack (45 XP cost)
   - ⚠️ Mirror Attack exists but costs 80 XP (blueprint says 400 coins)
   - ✅ Spark (35 XP cost) - exists but needs rebalancing
   - ✅ Prickler (25 XP cost) - exists but needs rebalancing
   - ❌ Asteroid Attack - needs to be added as separate item

3. **Asset Preloading** - `js/assetLoader.js` exists
   
4. **Enemy AI** - `js/enemyAI.js` exists but needs Smart AI rewrite (COMPLETED)

### ⚠️ Needs Rebalancing (Blueprint vs Current)

| Item | Blueprint | Current | Action Needed |
|------|-----------|---------|---------------|
| Potion | 50 coins, Heals 25% Max HP, Level 1 | 20 XP, Heals 20 HP | Update cost to 50, change to 25% heal |
| Power Boost | 150 coins, +20% Attack 3 turns, Level 5 | 25 XP, +30 gauge | Update cost to 150, change effect |
| Freeze Attack | 250 coins, 50 Damage + 30% Stun, Level 10 | 45 XP, 10 damage + skip 2 turns | Update cost to 250, change damage to 50 |
| Mirror Explosion | 400 coins, 75 Damage + 50% reflect, Level 15 | 80 XP, reflect only | Update cost to 400, add 75 damage |
| Spark Orb | 600 coins, 100 Damage + 10% double hit, Level 20 | 35 XP, 18-20 damage | Update cost to 600, change to 100 damage |
| Prickler | 800 coins, 50 Damage + Poison (5/turn, 3 turns), Level 25 | 25 XP, 10-15 damage | Update cost to 800, add poison effect |
| Asteroid | 1200 coins, 150 Damage + 10% miss, Level 35 | N/A | ADD NEW ITEM |

### 🔴 Critical Issues to Fix

1. **Currency Confusion**: Blueprint uses "Coins" but game uses "XP Coins" (jerryXP)
   - Need to clarify if these are the same or different currencies
   - Current shop uses `gameState.jerryXP` for purchases

2. **Item Effects Don't Match Blueprint**:
   - Power Boost should be a 3-turn buff, not gauge refill
   - Freeze should do 50 damage + 30% stun chance
   - Mirror should do 75 damage + reflect
   - Spark should do 100 damage + 10% double hit
   - Prickler should apply poison debuff

3. **Level Requirements**:
   - Blueprint specifies different level requirements than current

4. **Loot System**:
   - ✅ Minimum 50 XP award exists
   - ❌ Tiered drops (Common 70%, Uncommon 25%, Rare 5%) not implemented

5. **Battle Trigger Logic**:
   - ❌ 35% base / 50% boosted system not found in `js/questTaskManager.js`

## Implementation Plan

### Phase 1: Update Shop Items (CRITICAL)
```javascript
// Update battleItems in index.html lines 6844-6988
const battleItems = {
    health_potion: {
        id: 'health_potion',
        name: 'Potion',
        emoji: '🧪',
        description: 'Heals 25% of Monster\'s Max HP',
        cost: 50,  // UPDATED
        effect: 'heal_percent',  // UPDATED
        value: 0.25,  // UPDATED
        levelRequired: 1
    },
    power_boost: {
        id: 'power_boost',
        name: 'Power Boost',
        emoji: '⚡',
        description: 'Increases Monster\'s Attack by 20% for 3 turns',
        cost: 150,  // UPDATED
        effect: 'attack_buff',  // UPDATED
        value: 0.20,
        duration: 3,
        levelRequired: 5
    },
    freeze_attack: {
        id: 'freeze',
        name: 'Freeze Attack',
        emoji: '❄️',
        description: 'Deals 50 Damage, 30% chance to Stun enemy for 1 turn',
        cost: 250,  // UPDATED
        effect: 'freeze_stun',  // UPDATED
        value: 50,  // UPDATED
        stunChance: 0.30,
        levelRequired: 10,
        maxQuantity: 8
    },
    mirror_explosion: {
        id: 'mirror_attack',
        name: 'Mirror Explosion',
        emoji: '🪞',
        description: 'Deals 75 Damage, reflects 50% of damage taken back to enemy next turn',
        cost: 400,  // UPDATED
        effect: 'mirror_damage',  // UPDATED
        value: 75,  // UPDATED
        reflectPercent: 0.50,
        levelRequired: 15
    },
    spark_orb: {
        id: 'spark',
        name: 'Spark Orb',
        emoji: '⚡',
        description: 'Deals 100 Damage, 10% chance to hit twice',
        cost: 600,  // UPDATED
        effect: 'spark_burst',  // UPDATED
        value: 100,  // UPDATED
        doubleHitChance: 0.10,
        levelRequired: 20,
        maxQuantity: 10
    },
    prickler: {
        id: 'prickler',
        name: 'Prickler',
        emoji: '💣',
        description: 'Deals 50 Damage, applies Poison debuff (5 Damage per turn for 3 turns)',
        cost: 800,  // UPDATED
        effect: 'poison_damage',  // UPDATED
        value: 50,  // UPDATED
        poisonDamage: 5,
        poisonDuration: 3,
        levelRequired: 25,
        maxQuantity: 15
    },
    asteroid_attack: {
        id: 'asteroid_attack',
        name: 'Asteroid',
        emoji: '🪨',
        description: 'Deals massive 150 Damage, but has a 10% chance to miss',
        cost: 1200,  // NEW
        effect: 'asteroid_strike',  // NEW
        value: 150,  // NEW
        missChance: 0.10,
        levelRequired: 35,
        maxQuantity: 8
    }
};
```

### Phase 2: Update Battle Manager Item Effects
- Modify `js/battleManager.js` to handle new item effects:
  - `heal_percent` - heal based on max HP percentage
  - `attack_buff` - apply temporary attack boost
  - `freeze_stun` - damage + stun chance
  - `mirror_damage` - damage + reflect next turn
  - `spark_burst` - damage + double hit chance
  - `poison_damage` - damage + poison DoT
  - `asteroid_strike` - high damage + miss chance

### Phase 3: Implement Loot System
- Add to `js/battleManager.js` endBattle function:
```javascript
function calculateLootDrop(enemyLevel, playerLevel) {
    const xpReward = Math.max(50, baseXP); // Minimum 50 XP
    
    // Tiered drop system
    const roll = Math.random();
    let dropTier = 'common';
    
    if (roll < 0.05) {
        dropTier = 'rare';  // 5%
    } else if (roll < 0.30) {
        dropTier = 'uncommon';  // 25%
    } else {
        dropTier = 'common';  // 70%
    }
    
    return { xpReward, dropTier, items: getItemsForTier(dropTier) };
}
```

### Phase 4: Battle Trigger Logic
- Update `js/questTaskManager.js`:
```javascript
function shouldTriggerBattle() {
    const baseChance = 0.35;  // 35%
    const boostedChance = 0.50;  // 50%
    const isBoosted = gameState.battleModeEnabled || false;
    
    const chance = isBoosted ? boostedChance : baseChance;
    return Math.random() < chance;
}
```

### Phase 5: Level 50 Progression Curve
- Update `js/levelSystem.js` or relevant XP calculation:
```javascript
function calculateXPForLevel(level) {
    // Smooth curve to Level 50
    // Example: exponential curve with cap
    if (level >= 50) return Infinity;  // Cap at 50
    
    // Smooth progression formula
    return Math.floor(100 * Math.pow(1.15, level - 1));
}
```

## Files Modified

1. ✅ `js/specialGaugeSystem.js` - Updated gradient to Blue→Purple→Gold
2. ✅ `js/enemyAI.js` - Rewritten with Smart Enemy AI System
3. ⏳ `index.html` - Need to update battleItems object (lines 6844-6988)
4. ⏳ `js/battleManager.js` - Need to update item effect handlers
5. ⏳ `js/questTaskManager.js` - Need to add battle trigger logic
6. ⏳ `js/levelSystem.js` - Need to implement Level 50 cap

## Testing Checklist

- [ ] Special Gauge displays Blue→Purple→Gold gradient
- [ ] Special Gauge fills +15% on attack, +10% on damage
- [ ] Enemy AI makes strategic decisions (not random)
- [ ] Potion heals 25% of max HP
- [ ] Power Boost applies +20% attack for 3 turns
- [ ] Freeze deals 50 damage + 30% stun chance
- [ ] Mirror deals 75 damage + reflects 50% next turn
- [ ] Spark deals 100 damage + 10% double hit
- [ ] Prickler deals 50 damage + poison (5/turn, 3 turns)
- [ ] Asteroid deals 150 damage + 10% miss chance
- [ ] All items have correct costs (50, 150, 250, 400, 600, 800, 1200)
- [ ] Battle trigger is 35% base / 50% boosted
- [ ] Minimum 50 XP awarded on victory
- [ ] Loot drops follow 70/25/5 tier system
- [ ] Level cap at 50 with smooth progression
- [ ] All pixel art assets load before battle
- [ ] 60 FPS maintained during animations

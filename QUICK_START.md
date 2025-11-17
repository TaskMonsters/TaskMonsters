# Quick Start Integration Guide

## 🚀 5-Minute Setup

Follow these steps to integrate the new battle system into your Task Monsters game.

---

## Step 1: Add Script Tags

Open `index.html` and add these script tags **before** your existing battle system scripts:

```html
<!-- New Battle System - Add BEFORE existing battle scripts -->
<script src="js/assetConfig.js"></script>
<script src="js/levelSystem.js"></script>
<script src="js/specialGaugeSystem.js"></script>
<script src="js/monsterSpecialAttacks.js"></script>
<script src="js/battleMusicSystem.js"></script>
<script src="js/battleBackgroundSystem.js"></script>
```

---

## Step 2: Initialize Systems

In your battle initialization function (usually `startBattle()` or similar), add:

```javascript
function startBattle(enemy) {
    // Initialize new systems
    specialGauge.init();
    battleMusicSystem.init();
    battleBackgroundSystem.init();
    
    // Load background for current level
    battleBackgroundSystem.loadBackgroundForLevel(gameState.hero.level);
    
    // Play appropriate music
    const tier = getEnemyTier(gameState.hero.level);
    battleMusicSystem.playBattleMusic(tier);
    
    // ... rest of your existing battle initialization
}
```

---

## Step 3: Integrate Gauge Fills

### In Player Attack Function:
```javascript
function playerAttack() {
    // ... your existing attack code
    
    // Add this line after attack completes
    specialGauge.fillOnAttack();
}
```

### In Player Damage Function:
```javascript
function playerTakeDamage(damage) {
    // ... your existing damage code
    
    // Add this line after damage is applied
    specialGauge.fillOnDamage();
}
```

---

## Step 4: Add Special Attack Button

### In your battle UI HTML:
```html
<button id="special-attack-btn" class="battle-button" onclick="useSpecialAttack()">
    ⚡ Special Attack
</button>
```

### Add this function to your battle JavaScript:
```javascript
async function useSpecialAttack() {
    if (!specialGauge.isReady) {
        addBattleLog('❌ Special Attack not ready!');
        return;
    }
    
    // Get monster type from game state ('nova', 'benny', or 'luna')
    const monsterType = gameState.hero.monster || 'nova';
    const enemyElement = document.getElementById('enemySprite');
    
    const result = await executeSpecialAttack(monsterType, enemyElement, gameState.hero.level);
    
    if (result) {
        // Apply damage
        gameState.currentEnemy.takeDamage(result.damage);
        
        // Apply special effects
        if (monsterType === 'benny') {
            gameState.currentEnemy.stunned = true;
        } else if (monsterType === 'luna') {
            gameState.currentEnemy.defenseReduction = 0.2;
            gameState.currentEnemy.defenseReductionTurns = 2;
        }
        
        // Update UI
        updateBattleUI(gameState.hero, gameState.currentEnemy);
    }
}
```

---

## Step 5: Update XP System

Replace your existing XP gain code with:

```javascript
function endBattle(victory) {
    if (victory) {
        // Calculate XP using new formula
        const xpGain = LEVEL_SYSTEM.calculateBattleXP(
            gameState.currentEnemy.level, 
            gameState.actionsUsed || 0
        );
        
        // Update player XP (handles level up automatically)
        updatePlayerXP(xpGain);
        
        // Play victory music
        battleMusicSystem.playVictory();
    } else {
        // Play defeat music
        battleMusicSystem.playDefeat();
    }
    
    // Reset special gauge
    specialGauge.reset();
    
    // ... rest of your battle end code
}
```

---

## Step 6: Add Boss Enrage (Optional)

In your enemy HP update function:

```javascript
function updateEnemyHP(enemy) {
    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
    
    // Trigger enrage at 30% HP for bosses
    if (hpPercent < 30 && enemy.tier === 'boss' && !enemy.enraged) {
        enemy.enraged = true;
        battleMusicSystem.triggerEnrage();
        addBattleLog('🔥 Boss entered ENRAGE MODE!');
    }
    
    // ... rest of your HP update code
}
```

---

## ✅ Verification Checklist

After integration, test these features:

- [ ] Special gauge appears under HP bar
- [ ] Gauge fills when attacking (+15%)
- [ ] Gauge fills when taking damage (+10%)
- [ ] "SPECIAL READY!" appears when gauge is full
- [ ] Special attack button works
- [ ] Monster special animations play correctly
- [ ] Battle music changes based on enemy tier
- [ ] Battle background changes based on player level
- [ ] Level up shows milestone messages
- [ ] XP gain displays with floating text
- [ ] Boss enrage music triggers at <30% HP

---

## 🎮 Monster Types

Make sure your `gameState.hero.monster` is set to one of:
- `'nova'` - Stellar Burst (AoE damage)
- `'benny'` - Sonic Boom (Stun)
- `'luna'` - Lunar Eclipse (Defense down)

---

## 🐛 Troubleshooting

### Gauge not appearing?
- Check that `specialGauge.init()` is called on battle start
- Verify the battle container has class `.battle-stats` or `.hero-stats`

### Music not playing?
- Check browser console for audio errors
- Verify music files are in `assets/sounds/`
- Check that `battleMusicSystem.init()` is called

### Background not changing?
- Verify background images are in `assets/battle-backgrounds/`
- Check that `.battle-arena` container exists
- Ensure `battleBackgroundSystem.init()` is called

### Special attacks not working?
- Verify special attack frames are in `assets/special-attacks/`
- Check that `assetConfig.js` is loaded first
- Ensure `monsterType` matches 'nova', 'benny', or 'luna'

---

## 📚 Full Documentation

For complete details, see:
- **IMPLEMENTATION_GUIDE.md** - Comprehensive integration instructions
- **EXECUTIVE_SUMMARY.md** - Feature overview and technical details

---

**Need Help?** Check the browser console for error messages and verify all asset paths are correct.

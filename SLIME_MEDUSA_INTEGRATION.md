# Slime & Medusa Enemy Integration

## Overview

Two new enemies with special abilities have been integrated:
- **Slime** (Level 5+): Energy and defense draining enemy
- **Medusa** (Level 8+): Petrifying enemy that can skip player turns

A new **Temple Arena** background has been added for battles at levels 5-11.

---

## Enemy Specifications

### Slime (Level 5+)

**Stats**:
- Base HP: 40
- Base Attack: 8
- Base Defense: 5
- Max Damage: 10 (capped)

**Special Abilities**:
- **Energy Drain**: Each hit drains player's energy/attack gauge
- **Defense Drain**: Each hit reduces player's defense gauge
- **Damage Cap**: Maximum 10 damage per attack (5-10 range)

**Sprite**:
- File: `slime-sheet.png`
- Size: 118×79 pixels per frame
- Frames: 4 (horizontal sprite sheet, 472×79 total)
- Animation: 0.6s loop

**Projectile**: Slime projectile type

---

### Medusa (Level 8+)

**Stats**:
- Base HP: 60
- Base Attack: 15
- Base Defense: 12
- Max Damage: 15 (capped)

**Special Abilities**:
- **Petrify Attack**: 30% chance to petrify player
- **Skip Turn**: Petrified players lose their next turn
- **Damage Cap**: Maximum 15 damage per attack

**Sprite**:
- File: `medusa-idle.png`
- Size: 32×32 pixels per frame
- Frames: 4 (horizontal sprite sheet, 128×32 total)
- Animation: 0.5s loop

**Projectile**:
- File: `medusa-attack.png`
- Type: Medusa projectile (stone gaze effect)

---

## Temple Arena Background

**File**: `temple-arena.png`  
**Used For**: Levels 5-11 battles  
**Enemies**: Slime, Ghost Task Stopper, Medusa

The temple arena provides a darker, more mystical atmosphere for mid-level battles.

---

## Enemy Progression

| Player Level | Available Enemies | Battle Background |
|--------------|-------------------|-------------------|
| **1-2** | Lazy Bat | City |
| **3-4** | Lazy Bat, Lazy Bat II | City |
| **5-6** | Lazy Bat, Lazy Bat II, **Slime** | **Temple** |
| **7** | Lazy Bat, Lazy Bat II, Slime, Ghost | **Temple** |
| **8-11** | Lazy Bat, Lazy Bat II, Slime, Ghost, **Medusa** | **Temple** |
| **12+** | All 6 enemies + Lazy Eye | Night Town |

---

## Special Ability Implementation

### Slime - Energy & Defense Drain

The Slime's drain abilities are flagged in the enemy data:

```javascript
drainEnergy: true,  // Drains attack gauge on hit
drainDefense: true  // Drains defense gauge on hit
```

**Implementation Notes**:
- These flags are passed to the enemy instance
- Battle logic should check `enemy.drainEnergy` and `enemy.drainDefense`
- Recommended drain: 10-15 points per hit from gauges
- Adds strategic challenge - players must manage gauges carefully

---

### Medusa - Petrify Attack

Medusa can petrify the player, causing them to skip a turn:

```javascript
canPetrify: true,
petrifyChance: 0.3  // 30% chance on each attack
```

**Implementation Notes**:
- Check `enemy.canPetrify` in battle logic
- Roll random chance (0-1) against `enemy.petrifyChance`
- If petrified: Set player status flag, skip next turn
- Display message: "💎 You've been petrified! Turn skipped!"
- Clear petrify status after 1 turn

---

## Damage Caps

Both enemies have maximum damage limits:

```javascript
maxDamage: 10  // Slime
maxDamage: 15  // Medusa
```

**Implementation**:
```javascript
let damage = calculateDamage(enemy, player);
if (enemy.maxDamage) {
    damage = Math.min(damage, enemy.maxDamage);
}
```

This prevents these enemies from becoming too powerful at high levels while maintaining challenge.

---

## Files Modified

### 1. `js/enemy.js`

**Added Enemy Data**:
- `SLIME_DATA` (lines 80-101)
- `MEDUSA_DATA` (lines 125-146)

**Updated**:
- `ENEMY_TYPES` array to include Slime and Medusa
- `createRandomEnemy()` to handle new special abilities:
  - `canPetrify`, `petrifyChance`
  - `drainEnergy`, `drainDefense`
  - `maxDamage`
- `playEnemyAnimation()` to support slime-idle and medusa-idle animations

---

### 2. `js/enemy-init.js`

**Added Sprite Initialization**:
- Slime: 118×79 sprite, 4 frames (472×79 total)
- Medusa: 32×32 sprite, 4 frames (128×32 total)

---

### 3. `css/battle.css`

**Added Sprite Class**:
```css
.sprite.enemy-sprite-slime {
    width: 118px;
    height: 79px;
    transform: scaleX(-1) scale(1.5);
}
```

**Added Animations**:
- `slimeIdle`: 0.6s, 4 steps, -472px
- `medusaIdle`: 0.5s, 4 steps, -128px

**Added Background**:
```css
.battle-container.bg-temple {
    background-image: url('../assets/backgrounds/temple-arena.png');
}
```

---

### 4. `js/battleManager.js`

**Updated Background Logic**:
```javascript
if (this.hero.level >= 12) {
    battleContainer.classList.add('bg-night-town');
} else if (this.hero.level >= 5) {
    battleContainer.classList.add('bg-temple'); // NEW
} else {
    battleContainer.classList.add('bg-city');
}
```

---

### 5. `assets/enemies/`

**Added Files**:
- `slime-sheet.png` (472×79 sprite sheet)
- `medusa-idle.png` (128×32 sprite sheet)
- `medusa-attack.png` (projectile sprite)

---

### 6. `assets/backgrounds/`

**Added File**:
- `temple-arena.png` (battle background)

---

## Battle Mechanics To Implement

### Slime Drain Effect

When Slime hits the player:

```javascript
if (enemy.drainEnergy) {
    player.attackGauge = Math.max(0, player.attackGauge - 15);
    addBattleLog('💧 Slime drained your energy!');
}

if (enemy.drainDefense) {
    player.defenseGauge = Math.max(0, player.defenseGauge - 12);
    addBattleLog('💧 Slime weakened your defense!');
}
```

**Strategic Impact**:
- Players must use attacks quickly before gauge depletes
- Defense items become more valuable
- Adds urgency to battles

---

### Medusa Petrify Effect

When Medusa attacks:

```javascript
if (enemy.canPetrify && Math.random() < enemy.petrifyChance) {
    player.petrified = true;
    player.petrifyTurnsLeft = 1;
    addBattleLog('💎 Medusa\'s gaze petrifies you! Turn skipped!');
    return; // Skip player's next turn
}
```

On player turn:
```javascript
if (player.petrified && player.petrifyTurnsLeft > 0) {
    player.petrifyTurnsLeft--;
    if (player.petrifyTurnsLeft === 0) {
        player.petrified = false;
        addBattleLog('✨ You break free from petrification!');
    }
    return; // Skip this turn
}
```

**Strategic Impact**:
- 30% chance adds unpredictability
- Players may want to defeat Medusa quickly
- Defense items can help survive petrify turns

---

## Testing Checklist

### Visual Verification
- [ ] Slime sprite appears correctly (large, green)
- [ ] Slime animation loops smoothly (4 frames)
- [ ] Medusa sprite appears correctly (32×32)
- [ ] Medusa animation loops smoothly (4 frames)
- [ ] Temple background loads for levels 5-11
- [ ] Temple background is dark/mystical themed

### Gameplay Verification
- [ ] Slime appears at level 5+
- [ ] Medusa appears at level 8+
- [ ] Slime damage capped at 10
- [ ] Medusa damage capped at 15
- [ ] Enemy variety works correctly

### Special Abilities (To Be Implemented)
- [ ] Slime drains energy gauge on hit
- [ ] Slime drains defense gauge on hit
- [ ] Medusa petrify triggers (~30% of attacks)
- [ ] Petrified player skips turn
- [ ] Petrify status clears after 1 turn
- [ ] Battle log shows drain/petrify messages

---

## Enemy Comparison Table

| Enemy | Level | HP | Atk | Def | Special | Sprite Size |
|-------|-------|----|----|-----|---------|-------------|
| Lazy Bat | 1 | 50 | 15 | 10 | None | 64×64 |
| Lazy Bat II | 3 | 50 | 15 | 10 | None | 32×32 |
| **Slime** | **5** | **40** | **8** | **5** | **Drain** | **118×79** |
| Ghost | 7 | 50 | 15 | 10 | 25% Evade | 32×32 |
| **Medusa** | **8** | **60** | **15** | **12** | **Petrify** | **32×32** |
| Lazy Eye | 12 | 75 | 20 | 15 | Sleep | 48×48 |

---

## Projectile Integration

### Medusa Attack Projectile

**File**: `medusa-attack.png`  
**Type**: Stone gaze effect (appears to be a purple/blue orb)

**Implementation**:
```javascript
if (enemy.projectileType === 'medusa') {
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.className = 'medusa-projectile';
    projectile.style.backgroundImage = 'url(assets/enemies/medusa-attack.png)';
    // Animate from enemy to player
    // ...
}
```

**CSS** (to be added):
```css
.medusa-projectile {
    position: absolute;
    width: 32px;
    height: 32px;
    background-size: contain;
    background-repeat: no-repeat;
    image-rendering: pixelated;
    z-index: 10000;
}
```

---

## Balance Notes

### Slime
- **Lower stats** than other enemies (40 HP, 8 Atk)
- **Drain mechanic** makes up for weak stats
- **Damage cap** prevents scaling issues
- **Strategy**: Fast, aggressive playstyle needed

### Medusa
- **Mid-tier stats** (60 HP, 15 Atk)
- **Petrify** adds RNG challenge
- **30% chance** is balanced (not too frequent)
- **Strategy**: Burst damage before petrify hits

---

## Future Enhancements

1. **Slime Variants**: Different colored slimes with different drains
2. **Petrify Visual**: Stone statue effect on player sprite
3. **Drain Animation**: Visual effect showing gauge drain
4. **Medusa Gaze**: Eye glow animation before petrify
5. **Temple Ambience**: Add temple-themed sound effects

---

## Console Verification

When battles start, check for:
```
⚔️ Battle triggered!
Enemy: Slime (Level 5)
Special: drainEnergy, drainDefense, maxDamage: 10
```

```
⚔️ Battle triggered!
Enemy: Medusa (Level 8)
Special: canPetrify (30%), maxDamage: 15
```

---

**Status**: ✅ Sprites & Background Integrated  
**Status**: ⚠️ Special Abilities Flagged (Battle Logic Needed)  
**Version**: 6.3  
**Total Enemies**: 6  
**Battle Backgrounds**: 3 (City, Temple, Night Town)

---

## Next Steps

To complete the integration:

1. **Implement Slime Drain** in battle logic
2. **Implement Medusa Petrify** in battle logic
3. **Add Medusa Projectile** animation
4. **Test special abilities** thoroughly
5. **Balance drain/petrify** values if needed

The sprites, animations, and background are ready. The special ability flags are set. Now the battle logic needs to check these flags and apply the effects!

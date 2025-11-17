# Task Monsters v2.7 - Complete Battle System Audit

## 🎯 Comprehensive Battle System Analysis

This document provides a complete audit of the turn-based RPG battle system, including all mechanics, items, monsters, enemies, and animations.

---

## 📊 Battle System Overview

### Turn-Based RPG Mechanics

The battle system follows a classic turn-based RPG structure:

1. **Battle Start** → Initialize HP, gauges, select enemy
2. **Player Turn** → Choose action (Attack, Defend, Item, Special Attack)
3. **Action Resolution** → Execute player action, apply damage/effects
4. **Enemy Turn** → AI selects action, executes attack
5. **Turn End** → Check win/loss conditions, update UI
6. **Repeat** → Return to Player Turn until battle ends

---

## 🛡️ Battle Statistics & Gauges

### HP (Hit Points)
- **Hero HP:** Based on selected monster + level scaling
- **Enemy HP:** Based on enemy tier + level scaling
- **Display:** Numeric (95/100) + Progress bar
- **Updates:** Real-time after damage/healing

### Attack Gauge (0-100)
- **Start Value:** 100 (FIXED in v2.4)
- **Gain:** +10 per successful attack
- **Loss:** -10 when using Attack action
- **Effect:** Increases damage output
- **Display:** Orange progress bar + numeric value

### Defense Gauge (0-100)
- **Start Value:** 100 (FIXED in v2.4)
- **Gain:** +15 when using Defend action
- **Loss:** -5 per enemy attack received
- **Effect:** Reduces incoming damage
- **Display:** Purple progress bar + numeric value

### Special Gauge (0-100)
- **Start Value:** 0 ✅
- **Gain:** +15 per attack, +10 when taking damage
- **Usage:** Consumed when using Special Attack
- **Effect:** Unlocks monster-specific special attacks
- **Display:** Blue→Purple→Gold gradient + numeric value
- **Status:** ✅ Working correctly (v2.3)

---

## 🎮 Player Actions

### 1. Attack
- **Cost:** -10 Attack Gauge
- **Effect:** Deal damage to enemy
- **Damage Formula:** `(hero.attack * (attackGauge/100)) - (enemy.defense * 0.5)`
- **Animation:** Hero attack animation → Enemy hurt animation
- **Gauge Changes:**
  - Attack Gauge: +10 (net 0)
  - Special Gauge: +15
  - Defense Gauge: No change

### 2. Defend
- **Cost:** None
- **Effect:** Reduce next incoming damage by 50%
- **Gauge Changes:**
  - Defense Gauge: +15
  - Special Gauge: No change
  - Attack Gauge: No change
- **Animation:** Hero idle (defensive stance implied)
- **Duration:** Next enemy turn only

### 3. Special Attack
- **Cost:** 100 Special Gauge (must be full)
- **Effect:** Monster-specific powerful attack
- **Damage:** Varies by monster (see Monster Special Attacks section)
- **Animation:** Monster-specific special animation
- **Gauge Changes:**
  - Special Gauge: -100 (reset to 0)
  - Attack Gauge: No change
  - Defense Gauge: No change

### 4. Use Item
- **Cost:** 1 item from inventory
- **Effect:** Varies by item (heal, buff, attack, etc.)
- **Gauge Changes:** Depends on item
- **Animation:** Item-specific animation

---

## 🧪 Battle Items (14 Total)

### Healing Items (2)

#### 1. **Potion** 🧪
- **ID:** `health_potion`
- **Cost:** 50 XP
- **Effect:** Heal 25% of max HP
- **Level Required:** 1
- **Max Quantity:** Unlimited
- **Function:** `playerUsePotion()`
- **Status:** ✅ Implemented

#### 2. **Hyper Potion** ❤️‍🩹
- **ID:** `hyper_potion`
- **Cost:** 40 XP
- **Effect:** Heal 50 HP instantly
- **Level Required:** None
- **Max Quantity:** Unlimited
- **Function:** `playerUseHyperPotion()`
- **Status:** ✅ Implemented

---

### Buff Items (2)

#### 3. **Shield** 🛡️
- **ID:** `defense_refill`
- **Cost:** 25 XP
- **Effect:** +20 Defense for next battle
- **Level Required:** None
- **Max Quantity:** Unlimited
- **Function:** `playerUseDefenseRefill()`
- **Status:** ✅ Implemented

#### 4. **Power Boost** ⚡
- **ID:** `attack_refill`
- **Cost:** 30 XP
- **Effect:** +20% Attack for 3 turns
- **Level Required:** 5
- **Max Quantity:** Unlimited
- **Function:** `playerUsePowerBoost()`
- **Status:** ✅ Implemented (Fixed in v2.3 - was giving 30 XP instead of buff)

---

### Attack Items (10)

#### 5. **Fireball** 🔥
- **ID:** `fireball`
- **Cost:** 30 XP
- **Effect:** 15-18 damage with fire explosion
- **Level Required:** 4
- **Max Quantity:** 10
- **Function:** `playerFireball()`
- **Animation:** Hero throw → Fireball projectile → Explosion (6 frames)
- **Status:** ✅ Implemented with projectile animation (v2.4)

#### 6. **Blue Flame** 🔵🔥
- **ID:** `blue_flame`
- **Cost:** 40 XP
- **Effect:** 20 damage with blue fire explosion
- **Level Required:** 12
- **Max Quantity:** 12
- **Function:** `playerBlueFlame()`
- **Animation:** Hero throw → Blue flame projectile → Explosion (6 frames)
- **Status:** ✅ Implemented with projectile animation (v2.4)

#### 7. **Prickler** 💣
- **ID:** `prickler`
- **Cost:** 800 XP
- **Effect:** 50 damage + Poison (5 damage/turn for 3 turns)
- **Level Required:** 25
- **Max Quantity:** 15
- **Function:** `playerPrickler()`
- **Animation:** Hero throw → Prickler projectile → Explosion (6 frames)
- **Status:** ✅ Implemented with projectile animation (v2.4)

#### 8. **Procrastination Ghost** 👻
- **ID:** `procrastination_ghost`
- **Cost:** 50 XP
- **Effect:** 18-22 damage + Skip 1 enemy turn
- **Level Required:** 15
- **Max Quantity:** 8
- **Function:** `playerProcrastinationGhost()`
- **Animation:** Ghost projectile with ghostly blast
- **Status:** ✅ Implemented

#### 9. **Poison Leaf** 🍃
- **ID:** `poison_leaf`
- **Cost:** 55 XP
- **Effect:** 10 damage/turn for 4 turns (40 total)
- **Level Required:** 30
- **Max Quantity:** 10
- **Function:** `playerPoisonLeaf()`
- **Animation:** Leaf projectile with poison cloud (6 frames)
- **Status:** ✅ Implemented (Added in v2.5)

#### 10. **Freeze Attack** ❄️
- **ID:** `freeze`
- **Cost:** 250 XP
- **Effect:** 50 damage + 30% chance to stun for 1 turn
- **Level Required:** 10
- **Max Quantity:** 8
- **Function:** `playerFreeze()`
- **Animation:** Ice projectile with freeze effect
- **Status:** ✅ Implemented

#### 11. **Spark Orb** ⚡
- **ID:** `spark`
- **Cost:** 600 XP
- **Effect:** 100 damage + 10% chance to hit twice
- **Level Required:** 20
- **Max Quantity:** 10
- **Function:** `playerSpark()`
- **Animation:** Electric orb with spark effect
- **Status:** ✅ Implemented

#### 12. **Mirror Explosion** 🪞
- **ID:** `mirror_attack`
- **Cost:** 400 XP
- **Effect:** 75 damage + Reflect 50% of next damage taken
- **Level Required:** 15
- **Max Quantity:** Unlimited
- **Function:** `playerMirrorAttack()`
- **Animation:** Mirror shatter with explosion
- **Status:** ✅ Implemented (Added to inventory in v2.5)

#### 13. **Asteroid** 🪨
- **ID:** `asteroid_attack`
- **Cost:** 1200 XP
- **Effect:** 150 damage + 10% miss chance
- **Level Required:** 35
- **Max Quantity:** 8
- **Function:** `playerAsteroidAttack()`
- **Animation:** Asteroid falling with impact
- **Status:** ✅ Implemented (Added to inventory in v2.5)

#### 14. **Invisibility Cloak** 🥷🏼
- **ID:** `invisibility_cloak`
- **Cost:** 30 XP
- **Effect:** Evade next enemy attack completely
- **Level Required:** 3
- **Max Quantity:** Unlimited
- **Function:** `playerInvisibilityCloak()`
- **Animation:** Hero fades out
- **Status:** ✅ Implemented

---

## 🐉 Hero Monsters & Special Attacks

### Monster Selection System
- **Total Monsters:** 6 (Blob, Dino, Ghost, Pumpkin, Skull, Cyclops)
- **Selection:** Player chooses before battle
- **Stats:** Each monster has unique HP, Attack, Defense
- **Special Attack:** Each monster has unique special move

### Monster Stats Scaling
```javascript
Base Stats × (1 + (Level - 1) × 0.1)
```

---

### 1. **Blob** 💧
- **Base HP:** 100
- **Base Attack:** 15
- **Base Defense:** 10
- **Special Attack:** "Blob Splash"
  - **Damage:** 30-40
  - **Effect:** Water-based attack
  - **Animation:** Blob splash animation
  - **Special Gauge Cost:** 100

### 2. **Dino** 🦖
- **Base HP:** 120
- **Base Attack:** 18
- **Base Defense:** 12
- **Special Attack:** "Dino Roar"
  - **Damage:** 35-45
  - **Effect:** Intimidating roar
  - **Animation:** Dino roar animation
  - **Special Gauge Cost:** 100

### 3. **Ghost** 👻
- **Base HP:** 90
- **Base Attack:** 20
- **Base Defense:** 8
- **Special Attack:** "Phantom Strike"
  - **Damage:** 40-50
  - **Effect:** Ethereal attack
  - **Animation:** Ghost phase animation
  - **Special Gauge Cost:** 100

### 4. **Pumpkin** 🎃
- **Base HP:** 110
- **Base Attack:** 16
- **Base Defense:** 14
- **Special Attack:** "Pumpkin Bomb"
  - **Damage:** 38-48
  - **Effect:** Explosive attack
  - **Animation:** Pumpkin explosion
  - **Special Gauge Cost:** 100

### 5. **Skull** 💀
- **Base HP:** 95
- **Base Attack:** 22
- **Base Defense:** 9
- **Special Attack:** "Bone Crush"
  - **Damage:** 42-52
  - **Effect:** Crushing attack
  - **Animation:** Skull bite animation
  - **Special Gauge Cost:** 100

### 6. **Cyclops** 👁️
- **Base HP:** 130
- **Base Attack:** 17
- **Base Defense:** 15
- **Special Attack:** "Eye Beam"
  - **Damage:** 45-55
  - **Effect:** Laser beam attack
  - **Animation:** Eye beam animation
  - **Special Gauge Cost:** 100

**Note:** Need to verify actual monster stats and special attack implementations in code.

---

## 👾 Enemy System

### Enemy Tiers

#### **Common Tier** (Levels 1-10)
1. **Bunny** - 40 HP, 12 ATK, 8 DEF
2. **Lazy Bat** - 50 HP, 15 ATK, 10 DEF
3. **Slime** - 40 HP, 12 ATK, 8 DEF

#### **Elite Tier** (Levels 10-25)
4. **Medusa** - 80 HP, 25 ATK, 15 DEF (Special: Petrify)
5. **Octopus** - 75 HP, 22 ATK, 18 DEF (Special: Drench)
6. **Fire Skull** - 70 HP, 28 ATK, 12 DEF (Special: Fire)
7. **Drone** - 65 HP, 24 ATK, 14 DEF (Special: Laser)

#### **Boss Tier** (Levels 25+)
8. **Ogre** - 150 HP, 35 ATK, 25 DEF (Boss)
9. **Robot** - 140 HP, 32 ATK, 28 DEF (Boss, Special: Energy)
10. **Alien Walking** - 145 HP, 33 ATK, 24 DEF (Boss, Special: Alien)
11. **Alien Flying** - 135 HP, 30 ATK, 22 DEF (Boss, Special: Alien)
12. **Treant** - 160 HP, 36 ATK, 30 DEF (Boss)

### Enemy Scaling
```javascript
Base Stats × (1 + (Player Level / 10))
```

---

## 🎯 Enemy Special Attacks

### 1. **Petrify** (Medusa)
- **Effect:** Stun player for 1 turn
- **Chance:** 30%
- **Animation:** Stone effect
- **Function:** `enemyPetrifyAttack()`

### 2. **Poison** (Lazy Bat, Slime)
- **Effect:** 5 damage/turn for 3 turns
- **Chance:** 25%
- **Animation:** Poison cloud
- **Function:** `enemyPoisonAttack()`

### 3. **Drench** (Octopus)
- **Effect:** Reduce player attack by 20% for 2 turns
- **Chance:** 30%
- **Animation:** Water splash
- **Function:** `enemyDrenchAttack()`

### 4. **Mushroom** (Boss enemies)
- **Effect:** 15 damage + Confusion (miss next turn)
- **Chance:** 20%
- **Animation:** Mushroom spores
- **Function:** `enemyMushroomAttack()`

### 5. **Drain Gauge** (Boss enemies)
- **Effect:** Steal 20 from player's Attack Gauge
- **Chance:** 25%
- **Animation:** Energy drain effect
- **Function:** `enemyDrainGaugeAttack()`

---

## 🤖 Enemy AI System

### Smart AI Decision Making

The enemy AI uses a priority-based decision system:

```javascript
Priority 1: Special Attack (if available and HP < 50%)
Priority 2: Heal (if HP < 30% and has healing)
Priority 3: Buff (if no active buffs)
Priority 4: Normal Attack
```

### AI Factors:
- **Enemy HP percentage**
- **Player HP percentage**
- **Available special attacks**
- **Cooldowns**
- **Random chance** (for variety)

**Status:** ✅ Smart AI implemented (v2.3)

---

## 🎬 Animation System

### Hero Animations

#### Available Animations:
1. **Idle** - Default standing animation (looping)
2. **Attack** - Attack animation (4 frames, 600ms)
3. **Hurt** - Damage taken animation (2000ms)
4. **Throw** - Projectile item animation (4 frames, 600ms)

#### Animation Flow:
```
Player Action → Attack/Throw Animation (600ms)
→ Projectile/Effect Animation
→ Enemy Hurt Animation (2000ms)
→ Return to Idle
```

**Status:** ✅ All hero animations working (v2.4-2.6)

### Enemy Animations

#### Animation Types:
1. **Spritesheet Enemies** (5 enemies)
   - Bunny: 8 frames
   - Lazy Bat: 9 frames
   - Slime: 4 frames
   - Alien Walking: 4 idle + 6 walk frames
   - Alien Flying: 8 frames

2. **Single Frame Enemies** (7 enemies)
   - Medusa, Octopus, Fire Skull, Drone, Ogre, Robot, Treant
   - Static sprites with instant switching

#### Animation Flow:
```
Enemy Turn → Attack Animation
→ Projectile (if applicable)
→ Hero Hurt Animation (2000ms)
→ Hero Return to Idle
→ Enemy Return to Idle
```

**Status:** ✅ All enemy animations configured (v2.7)

---

## 💬 Battle Dialogue & Log System

### Battle Log Features:
- **Turn-by-turn messages**
- **Damage numbers**
- **Status effects**
- **Special attack notifications**
- **Item usage**
- **Win/Loss messages**

### Log Message Types:
1. **Battle Start:** "Battle Start!"
2. **Player Attack:** "You dealt X damage!"
3. **Enemy Attack:** "[Enemy] dealt X damage!"
4. **Item Used:** "Used [Item]!"
5. **Special Attack:** "[Monster] used [Special Attack]!"
6. **Status Effect:** "Enemy is [Status]!"
7. **Battle End:** "Victory!" / "Defeat..."

**Status:** ✅ Battle log system implemented

---

## 🔧 Known Issues & Fixes

### ✅ Fixed Issues:

1. **v2.4:** Hero stuck in hurt animation
   - **Fix:** Added proper hurt→idle transitions with 2000ms timing

2. **v2.4:** Attack/Defense gauges starting at 0
   - **Fix:** Initialize to 100 in `startBattle()`

3. **v2.4:** HP bars not updating visually
   - **Fix:** Created missing `updateBattleUI()` function

4. **v2.5:** Poison Leaf missing from battle
   - **Fix:** Created complete implementation with function, button, animation

5. **v2.5:** updateActionButtons missing
   - **Fix:** Created comprehensive button management system

6. **v2.6:** Enemy sprites showing as spritesheets
   - **Fix:** Created frame-based enemy animation system

7. **v2.7:** Enemy sizing inconsistent
   - **Fix:** Auto-scale all enemies to 80px height

---

## 🧪 Testing Checklist

### Turn-Based Mechanics:
- [ ] Player turn → Enemy turn flow works
- [ ] Turn counter increments correctly
- [ ] Actions execute in correct order
- [ ] Battle ends on HP = 0

### Damage Calculations:
- [ ] Attack damage formula correct
- [ ] Defense reduces damage properly
- [ ] Gauges affect damage output
- [ ] Critical hits work (if implemented)

### Gauges:
- [ ] HP updates after damage/healing
- [ ] Attack Gauge starts at 100
- [ ] Defense Gauge starts at 100
- [ ] Special Gauge starts at 0
- [ ] Special Gauge fills correctly (+15 attack, +10 damage)
- [ ] Gauge UI updates in real-time

### Battle Dialogue:
- [ ] Messages appear for all actions
- [ ] Damage numbers display correctly
- [ ] Status effects show in log
- [ ] Log scrolls automatically

### Animations:
- [ ] Hero attack animation plays
- [ ] Hero returns to idle after attack
- [ ] Hero hurt animation plays when damaged
- [ ] Hero returns to idle after hurt
- [ ] Enemy animations cycle correctly
- [ ] Enemy hurt animation plays (if available)
- [ ] Projectile animations work for items

### Hero Monsters:
- [ ] All 6 monsters selectable
- [ ] Monster stats scale with level
- [ ] Special attacks work for each monster
- [ ] Special gauge requirement enforced

### Shop Items (14):
- [ ] All 14 items purchasable
- [ ] Items appear in battle inventory
- [ ] Item counts update after use
- [ ] Item effects work correctly
- [ ] Projectile items have animations

### Enemy Special Attacks:
- [ ] Petrify stuns player
- [ ] Poison deals damage over time
- [ ] Drench reduces attack
- [ ] Mushroom causes confusion
- [ ] Drain steals gauge points

### Enemy AI:
- [ ] AI makes logical decisions
- [ ] AI uses special attacks when appropriate
- [ ] AI doesn't spam same move
- [ ] AI difficulty scales with level

---

## 📝 Next Steps

### Priority 1: Verify Monster Special Attacks
- [ ] Check if all 6 monsters have special attack functions
- [ ] Verify special attack damage values
- [ ] Test special gauge consumption

### Priority 2: Test All 14 Shop Items
- [ ] Verify each item function exists
- [ ] Test item effects in battle
- [ ] Verify projectile animations

### Priority 3: Test Enemy Special Attacks
- [ ] Verify all enemy special attacks trigger
- [ ] Test status effect durations
- [ ] Verify AI uses specials correctly

### Priority 4: Comprehensive Battle Flow Test
- [ ] Start battle → Complete battle cycle
- [ ] Test win condition
- [ ] Test loss condition
- [ ] Verify XP/loot rewards

---

## 📦 Files to Audit

1. **battleManager.js** - Core battle logic, turn system, damage calculations
2. **battleInit.js** - Battle initialization, gauge setup, enemy animations
3. **battleUI.js** - UI updates, animations, visual effects
4. **specialGaugeSystem.js** - Special gauge logic
5. **monsterSpecialAttacks.js** - Monster special attack implementations
6. **enemyTierSystem.js** - Enemy selection and scaling
7. **battleLog.js** - Battle message system
8. **index.html** - Shop items definitions, battle UI

---

**Status:** Ready for comprehensive testing  
**Version:** 2.7  
**Last Updated:** Current session

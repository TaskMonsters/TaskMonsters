# Projectile System Implementation

## Overview
All shop battle items now have visible projectile animations that travel from the player's monster to the enemy during battles.

## Implemented Projectiles

### 1. **Asteroid Attack** ⚡
- **Asset:** `assets/projectiles/asteroid.png`
- **Function:** `playAsteroidAnimation()`
- **Damage:** 12 (fixed)
- **Attack Gauge Cost:** 15
- **Animation:** Arcing trajectory with 720° rotation
- **Duration:** 700ms

### 2. **Fireball** 🔥
- **Asset:** `assets/projectiles/fireball.png`
- **Function:** `playFireballAnimation()`
- **Damage:** 15-18 (random)
- **Attack Gauge Cost:** 30
- **Animation:** Straight line with rotation, explosion on impact
- **Duration:** 800ms
- **Special:** Can be blocked by Drench attack

### 3. **Spark** ⚡
- **Asset:** `assets/projectiles/spark/spark-spritesheet.png` (5 frames)
- **Function:** `playSparkAnimation()`
- **Damage:** 18-20 (random)
- **Attack Gauge Cost:** 25
- **Animation:** Fast straight shot with sprite animation
- **Duration:** 600ms
- **Unlock:** Level 7+

### 4. **Prickler** 🌵
- **Asset:** `assets/projectiles/prickler.png`
- **Function:** `playPricklerAnimation()`
- **Damage:** 10-15 (random)
- **Attack Gauge Cost:** 20
- **Animation:** High arc with rotation, nuclear explosion on impact
- **Duration:** 800ms
- **Special:** 12-frame explosion animation

### 5. **Freeze** ❄️
- **Asset:** `assets/projectiles/freeze.png`
- **Function:** `playFreezeAnimation()`
- **Damage:** 10 (fixed)
- **Attack Gauge Cost:** 35
- **Animation:** Straight shot with rotation, freeze impact effect
- **Duration:** 700ms
- **Special:** Skips enemy's next 2 turns

### 6. **Blue Flame** 🔵🔥
- **Asset:** `assets/projectiles/blue-flame.png`
- **Function:** `playBlueFlameAnimation()`
- **Damage:** 20 (fixed)
- **Attack Gauge Cost:** 20
- **Animation:** Fast horizontal shot with explosion
- **Duration:** 500ms

### 7. **Procrastination Ghost** 👻
- **Asset:** `assets/projectiles/ghost.png`
- **Function:** `playProcrastinationGhostAnimation()`
- **Damage:** 18-22 (random)
- **Attack Gauge Cost:** 25
- **Animation:** Floating motion with opacity effect
- **Duration:** 600ms
- **Special:** Skips enemy's next turn, darkens enemy sprite on impact

## Technical Implementation

### Animation Pattern
All projectile animations follow this structure:

```javascript
async function playProjectileAnimation(startElement, targetElement) {
    // 1. Create projectile DOM element
    const projectile = document.createElement('div');
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/projectiles/[item].png")';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);
    
    // 2. Get start and target positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // 3. Animate using requestAnimationFrame
    return new Promise((resolve) => {
        function animate() {
            // Calculate progress and position
            // Apply easing function
            // Update projectile position
            // Continue or resolve
        }
        requestAnimationFrame(animate);
    });
}
```

### Key Features
- **Smooth Animation:** Uses `requestAnimationFrame` for 60fps animations
- **Easing Functions:** Different easing for different projectile types
- **Trajectory Options:** Straight lines, arcs, floating motion
- **Visual Effects:** Rotation, scaling, opacity changes
- **Impact Effects:** Explosions, freeze effects, visual feedback
- **Cleanup:** Projectiles removed from DOM after animation completes

### Battle Manager Integration
Each offensive item has a corresponding function in `battleManager.js`:

```javascript
async playerItemName() {
    // 1. Check battle state
    // 2. Verify item count
    // 3. Deduct attack gauge and item
    // 4. Play hero throw animation
    // 5. Call projectile animation
    // 6. Calculate and apply damage
    // 7. Check for victory/continue battle
}
```

## Files Modified

### `/js/battleUI.js`
- Fixed all projectile asset paths to use `assets/projectiles/`
- Exported all projectile animation functions to global scope
- Updated fireball, asteroid, prickler, freeze, blue flame, and ghost animations

**Lines Changed:**
- 420: Fireball asset path
- 566: Asteroid asset path
- 623: Prickler asset path
- 732: Freeze animation simplified to single image
- 929-936: Exported projectile functions
- 1152: Blue flame asset path
- 1188: Ghost asset path

### `/js/battleManager.js`
- All battle item functions already implemented
- Proper integration with projectile animations
- Sound effects and damage calculations working

### `/assets/projectiles/`
- Renamed all projectile files to simple names without spaces
- **Files:**
  - `asteroid.png`
  - `fireball.png`
  - `spark.png`
  - `prickler.png`
  - `freeze.png`
  - `blue-flame.png`
  - `ghost.png`
  - `mirror.png` (available but not implemented)
  - `poison-leaf.png` (available but not implemented)

## Battle Items Inventory

### Currently Implemented in Battle System:
1. ✅ **Fireball** - Offensive projectile
2. ✅ **Spark** - Offensive projectile
3. ✅ **Asteroid Attack** - Offensive projectile
4. ✅ **Prickler** - Offensive projectile
5. ✅ **Freeze** - Offensive projectile with status effect
6. ✅ **Blue Flame** - Offensive projectile
7. ✅ **Procrastination Ghost** - Offensive projectile with status effect
8. ✅ **Health Potion** - Healing (no projectile needed)
9. ✅ **Attack Refill** - Gauge refill (no projectile needed)
10. ✅ **Defense Refill** - Gauge refill (no projectile needed)
11. ✅ **Invisibility Cloak** - Defensive (no projectile needed)
12. ✅ **Mirror Attack** - Reflect (no projectile needed)

### Available Assets Not Yet Implemented:
- `mirror.png` - Could be used for mirror attack visual
- `poison-leaf.png` - Could be added as new battle item

## Testing Checklist

- [x] Asteroid projectile visible and travels to enemy
- [x] Fireball projectile visible with explosion
- [x] Spark projectile visible with animation
- [x] Prickler projectile visible with nuclear explosion
- [x] Freeze projectile visible with impact effect
- [x] Blue Flame projectile visible
- [x] Ghost projectile visible with floating effect
- [x] All projectiles properly removed after animation
- [x] No console errors for missing assets
- [x] Damage applied correctly after projectile hits
- [x] Battle continues normally after projectile animations

## Console Logging
All projectile animations are silent (no console logs) to keep battle log clean. Errors will appear if assets are missing.

## Performance
- Projectiles use CSS transforms for smooth GPU-accelerated animations
- DOM elements cleaned up immediately after animation completes
- No memory leaks or ghost elements
- 60fps animation using requestAnimationFrame

## Future Enhancements
1. Add explosion frames for more projectiles
2. Implement mirror and poison leaf projectiles
3. Add particle effects on impact
4. Sound effects synchronized with projectile travel
5. Camera shake on powerful hits

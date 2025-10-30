# Animation Overhaul - File Analysis & Duplicate Detection

## Current State Analysis

### Duplicate/Conflicting Files Detected

#### Fireball Assets
**Duplicates Found:**
- `assets/battle-items/fire-ball.png`
- `assets/battle-items/fireball.png`
- `assets/battle-items/fireball1.png`
- `assets/battle-items/fireball2.png`
- `assets/battle-items/fireball3.png`
- `assets/fire-ball.png`

**Explosion Assets:**
- `assets/battle-items/fireball-explosion3.png` ✅ (KEEP - correct file)
- `assets/fireball-explosion3.png` (duplicate location)

**Action**: Consolidate to single fireball projectile sprite and use `fireball-explosion3.png` for explosion

#### Bomb/Prickler Assets
**Current Structure:**
- `assets/battle-items/bomb/` (directory)
- `assets/battle-items/bomb/Bomb Explosion/explosion-d1.png` through `explosion-d12.png` ✅ (KEEP - nuclear explosion sequence)
- `assets/battle-items/bomb/bomb1.png`, `bomb2.png`, `bomb3.png`
- `assets/battle-items/bomb-explosion1.png` through `bomb-explosion6.png` (old/conflicting)

**Action**: Rename all "bomb" to "prickler", keep nuclear explosion sequence (explosion-d1 through d12)

#### Ghost Assets
**Current:**
- `assets/enemies/ghost-attack.png` ✅ (KEEP)
- `assets/enemies/ghost-idle.png`
- `assets/enemies/ghost/ghost-idle.png` (duplicate)
- `assets/procrastination-ghost-projectile.png` (needs verification)

**Action**: Use `ghost-attack.png` for Procrastination Ghost projectile

#### Freeze Assets
**Current:**
- `assets/battle-items/freeze/` (directory - appears empty or missing files)

**New Assets Provided:**
- Freeze/_0000_Layer-1.png through _0007_Layer-8.png (8 frames)

**Action**: Replace/add freeze animation frames

#### Blue Flame Assets
**Current:**
- `assets/blue-flame-icon.png`
- `assets/blue-flame-spritesheet.png`
- `assets/blue-flame.png`

**New Assets Provided:**
- `blue-flame-icon copy.png`
- `blue-flame-spritesheet copy.png`

**Action**: Verify and use spritesheet, share fireball-explosion3.png for explosion

#### Spark Assets
**Current:**
- `assets/projectiles/spark/spark-spritesheet.png`

**Action**: Verify this is the correct strike animation (melee, not projectile)

---

## Attack Specifications (from requirements)

| Attack | Damage | Special Effect | Type | Explosion File | Notes |
|--------|--------|---------------|------|----------------|-------|
| Fireball | 15-18 | Explosion on impact | Projectile | fireball-explosion3.png | Left→right travel |
| Blue Flame | 20 | Explosion on impact | Projectile | fireball-explosion3.png | Same explosion as Fireball |
| Procrastination Ghost | 18-22 | Skip 1 turn | Projectile | ghost-attack.png | Transparent with fade glow |
| Spark | 18-20 | None | Melee Strike | spark-strike.png | No projectile, hit on enemy |
| Freeze | 10 | Skip 2 turns | Projectile | freeze-attack.png | Ice projectile, halt animation |
| Pricklers | 10-15 | Nuclear explosion | Projectile | explosion-d1.png - d12.png | Full screen travel, nuclear explosion |

---

## Current Code References

### battleManager.js
- `playerFireball()` - line 310
- `playerBomb()` - line 376 (needs rename to playerPrickler)
- Inventory references: `gameState.battleInventory.bomb` (needs rename)

### battleUI.js
- `playFireballAnimation()` - line 329
- `playBombAnimation()` - referenced but needs to be found
- `playFreezeAnimation()` - referenced
- `playSparkAnimation()` - referenced

### Inventory Structure
```javascript
battleInventory: {
    fireball: 0,
    spark: 0,
    health_potion: 2,
    attack_refill: 2,
    defense_refill: 2,
    invisibility_cloak: 0,
    bomb: 0,  // RENAME TO: prickler
    freeze: 0,
    blue_flame: 0,
    procrastination_ghost: 0
}
```

---

## Files to Modify

### JavaScript Files
1. `js/battleManager.js` - Rename bomb → prickler, update damage ranges
2. `js/battleUI.js` - Update all animation functions, add explosion effects
3. `index.html` - Update inventory initialization, shop references

### Asset Files to Add/Replace
1. **Fireball**: Consolidate sprites, ensure explosion3 is used
2. **Prickler**: Rename bomb directory, keep nuclear explosion sequence
3. **Freeze**: Add 8-frame animation sequence
4. **Blue Flame**: Verify spritesheet, use fireball explosion
5. **Ghost**: Use ghost-attack.png for projectile
6. **Spark**: Verify spark-strike.png exists/works

### Asset Files to Remove
- Duplicate fireball sprites
- Old bomb-explosion1-6.png files
- Duplicate ghost files
- Any unused/conflicting sprites

---

## Safety Checklist

- [x] Full backup created
- [ ] Identify all code references to "bomb"
- [ ] Verify all new sprite files are valid images
- [ ] Test each animation individually
- [ ] Verify no localStorage corruption
- [ ] Ensure shop/inventory sync remains intact
- [ ] Confirm no unrelated files modified
- [ ] Performance test on animations (60fps cap)

---

## Next Steps

1. Rename all "bomb" references to "prickler" across codebase
2. Organize and consolidate sprite assets
3. Update animation functions with correct explosion effects
4. Implement damage range updates
5. Test each attack individually
6. Verify persistence and shop sync
7. Final regression testing

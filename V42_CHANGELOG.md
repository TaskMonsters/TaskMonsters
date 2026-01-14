# Task Monsters V42 - 7-Level Tier Rotation System

**Release Date:** December 30, 2025

## 🎯 What's New in V42

### **7-Level Tier Enemy Rotation**

Enemies now rotate on a **7-level tier system** instead of changing every battle. This creates a more immersive experience with consistent enemy encounters while maintaining variety.

**How It Works:**
- Enemy rotation **resets every 7 levels** (Levels 1-7, 8-14, 15-21, etc.)
- Within each 7-level tier, enemies cycle through all available enemies in order
- **All enemies from previous levels remain available** - early enemies still appear at high levels!

**Example:**
- **Levels 1-7:** Cycle through all Tier 1 enemies
- **Levels 8-14:** Rotation resets, cycle through all Tier 1 + Tier 2 enemies
- **Levels 15-21:** Rotation resets again, cycle through all available enemies
- And so on...

---

## 🔄 Why This Change?

### V41 System (Previous):
- Enemies changed **every single battle**
- Rotation reset whenever a new enemy unlocked
- Too frequent changes felt jarring

### V42 System (Current):
- Enemies rotate **every 7 levels**
- More consistent experience within each tier
- Fresh start every 7 levels keeps it interesting
- **All previous enemies remain in rotation pool**

---

## 🎮 Key Benefits

### 1. **Better Pacing**
The 7-level tier system provides natural "chapters" in your progression. Each tier feels like a distinct phase of the game with its own enemy roster.

### 2. **Nostalgia Factor**
Early enemies like Lazy Bat and Slime continue to appear even at level 50+. This keeps the full enemy roster relevant throughout the entire game.

### 3. **Predictable Variety**
You know exactly when the rotation will reset (every 7 levels), making progression feel more structured and intentional.

### 4. **Fair Distribution**
Every enemy gets equal screen time within each tier. No enemy is forgotten or over-represented.

### 5. **Strategic Depth**
Players can plan their strategy knowing which enemies are in the current rotation pool and when the pool will refresh.

---

## 📊 Level Tier Breakdown

| Level Range | Tier | Rotation Behavior |
|-------------|------|-------------------|
| 1-7 | Tier 1 | Cycles through enemies unlocked by level 7 |
| 8-14 | Tier 2 | **Resets** - Cycles through all enemies unlocked by level 14 |
| 15-21 | Tier 3 | **Resets** - Cycles through all enemies unlocked by level 21 |
| 22-28 | Tier 4 | **Resets** - Cycles through all available enemies |
| 29-35 | Tier 5 | **Resets** - Continues pattern |

**Boss battles** (levels 10, 20, 30...) are separate from the rotation system and always appear at their designated levels.

---

## 🔧 Technical Changes

### Files Modified:

**js/enemy.js** (lines 333-357, 370)
- Replaced per-battle rotation with 7-level tier rotation
- Added `lastLevelTier` tracking variable
- Modified `getNextEnemyFromRotation()` to accept `playerLevel` parameter
- Implemented tier calculation: `Math.floor((playerLevel - 1) / 7)`
- Rotation resets when `currentLevelTier !== lastLevelTier`

### Code Implementation:
```javascript
// Calculate current level tier (0-6, 7-13, 14-20, etc.)
const currentLevelTier = Math.floor((playerLevel - 1) / 7);

// Reset rotation index when entering a new 7-level tier
if (currentLevelTier !== lastLevelTier) {
    currentEnemyRotationIndex = 0;
    lastLevelTier = currentLevelTier;
}
```

---

## ✅ Testing Results

### Tier Transitions Verified:
- ✅ Level 1-7: Rotation cycles through available enemies
- ✅ Level 8: Rotation resets to first enemy in expanded pool
- ✅ Level 15: Rotation resets again
- ✅ Level 22: Rotation resets as expected

### Enemy Availability Verified:
- ✅ Early enemies (Lazy Bat, Slime) still appear at level 15+
- ✅ All previous enemies remain in rotation pool
- ✅ New enemies are added to pool when unlocked

### Rotation Cycling Verified:
- ✅ No duplicate enemies until full rotation complete
- ✅ Rotation repeats correctly after seeing all enemies
- ✅ Boss battles don't interfere with rotation

---

## 📝 Documentation

See `V42_TIER_ROTATION_SYSTEM.md` for detailed explanation, examples, and testing instructions.

---

## 🎯 Player Experience Improvements

**Before V42:**
- Enemies changed every battle (V41)
- Could feel repetitive or too frequent
- No sense of "chapters" in progression

**After V42:**
- Enemies rotate every 7 levels
- Each tier feels like a distinct phase
- Early enemies remain relevant at high levels
- Natural rhythm to progression
- More immersive and strategic

---

## 🔄 Comparison Table

| Feature | V40 (Random) | V41 (Per-Battle) | V42 (7-Level Tier) |
|---------|--------------|------------------|---------------------|
| Rotation Frequency | Random 2-4 battles | Every battle | Every 7 levels |
| Predictability | Low | High | Medium-High |
| Variety | Inconsistent | Very High | Balanced |
| Immersion | Low | Medium | **High** |
| Previous Enemies | Available | Available | **Available** |
| Strategic Planning | Difficult | Easy | **Optimal** |

---

**Previous Version:** V41 (True Alternation System)  
**Current Version:** V42 (7-Level Tier Rotation)

**All Previous Features Preserved:**
- ✅ Arena alternation system (V41)
- ✅ Hero sprite size (V40)
- ✅ Fly Drone fixes (V40)
- ✅ Static enemy animation system (V38)
- ✅ All projectile systems (V38)
- ✅ Special abilities (V38)
- ✅ Damage balance (V38)
- ✅ Blue flame image (V39)

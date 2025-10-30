# Bug Analysis: Purchased Items Not Active During Battle

## Problem Statement
Purchased items appear inactive or unavailable mid-battle, even after being purchased and added to inventory.

## Key Findings

### 1. Data Structure
- **battleInventory**: Object storing item quantities (e.g., `{ fireball: 3, health_potion: 2 }`)
- **unlockedBattleItems**: Array tracking which items have ever been unlocked (e.g., `['health_potion', 'fireball']`)
- Both are stored in `gameState` and persisted to localStorage

### 2. Item Purchase Flow (index.html ~line 6400-6450)
```javascript
function buyBattleItem(itemId) {
    // Deduct XP
    gameState.jerryXP = (gameState.jerryXP || 0) - item.cost;
    
    // Add item to battle inventory
    if (!gameState.battleInventory[itemId]) {
        gameState.battleInventory[itemId] = 0;
    }
    gameState.battleInventory[itemId]++;
    
    // Track that this item has been unlocked
    if (!gameState.unlockedBattleItems) {
        gameState.unlockedBattleItems = [];
    }
    if (!gameState.unlockedBattleItems.includes(itemId)) {
        gameState.unlockedBattleItems.push(itemId);
    }
    
    // Save and update displays
    saveGameState();
    updateUI();
}
```

### 3. Battle Button Visibility Logic (battleUI.js lines 14-127)
```javascript
function updateBattleButtonsVisibility() {
    const inventory = gameState.battleInventory || {};
    const unlockedItems = gameState.unlockedBattleItems || [];
    
    // For each item, check if it's in unlockedItems array
    if (unlockedItems.includes('fireball')) {
        fireballBtn.style.display = '';
        fireballCount.textContent = `(${inventory.fireball || 0})`;
    } else {
        fireballBtn.style.display = 'none';
    }
}
```

### 4. Battle Initialization (battleManager.js lines 25-81)
- `startBattle()` function initializes battle state
- Calls `showBattle(this.hero, this.enemy)` which triggers `updateBattleButtonsVisibility()`
- **CRITICAL**: No explicit reload of gameState from localStorage before battle

### 5. LoadGameState Function (index.html lines 3742-3848)
- Loads saved state from localStorage on page load
- Uses spread operator: `gameState = { ...gameState, ...parsedState }`
- **MISSING**: No migration/initialization for `battleInventory` and `unlockedBattleItems`

## Root Cause Hypothesis

### Primary Issue: Missing Migration in loadGameState
The `loadGameState()` function does NOT ensure that `battleInventory` and `unlockedBattleItems` exist when loading saved data. If an older save doesn't have these properties, they won't be initialized.

**Evidence:**
- Lines 3770-3818 show migrations for other properties (battlesWon, achievementProgress, etc.)
- NO migration for `battleInventory` or `unlockedBattleItems`
- When these are undefined, the battle UI visibility logic fails

### Secondary Issue: No Pre-Battle State Verification
The battle initialization doesn't verify that gameState is properly loaded before checking item availability.

## Solution Plan

1. **Add Migration in loadGameState** (index.html ~line 3820)
   - Ensure `battleInventory` exists and has default structure
   - Ensure `unlockedBattleItems` exists and has default items
   - Preserve any existing purchased items

2. **Add State Verification in Battle Init** (battleManager.js ~line 25)
   - Verify gameState.battleInventory exists before battle starts
   - Log warning if items are missing

3. **Ensure Consistent State Access** (battleUI.js)
   - Add defensive checks for undefined inventory
   - Ensure buttons update correctly after purchases

## Testing Checklist
- [ ] Purchase items → verify they appear in inventory
- [ ] Enter battle → verify purchased items are visible and active
- [ ] Complete battle → verify items persist
- [ ] Refresh page → verify items still available
- [ ] Purchase more items → verify no duplication
- [ ] Test with empty/new save
- [ ] Test with existing save (migration)

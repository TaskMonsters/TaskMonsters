# TEST VERSION - Task Monsters Game

## 🧪 Test Mode Features

This is a special **TEST VERSION** of the game with the following modifications:

### Automatic Test Settings

When you load the game, it will automatically:

1. **Set 50,000 XP Coins** - Plenty of currency to test all purchases
2. **Unlock ALL Skins** - Every skin is available in your inventory
3. **Set Level to 20** - Access all game features and arenas
4. **Disable Egg State** - Monster is fully hatched
5. **Fill Battle Inventory** - 99 of each battle item for testing

### What This Means

- **Skins Page**: All skins will show as "owned" and can be equipped immediately
- **Battle Mode**: Fully unlocked with all arenas and music tracks available
- **Shop**: You have 50,000 XP to test purchasing mechanics
- **Battle Items**: All items unlocked with 99 quantity for testing animations

### Console Messages

When the game loads, you'll see these messages in the browser console:
```
🧪 TEST MODE ENABLED: Unlocking all skins and setting 50,000 XP
🧪 TEST MODE: Unlocked [X] skins
🧪 TEST MODE: Set level to 20
🧪 TEST MODE: Filled battle inventory
```

### How to Use

1. Open `index.html` in a web browser
2. The test settings will apply automatically on load
3. Navigate to the Skins page to see all unlocked skins with green question marks changed
4. Enter battle mode to test the new item animations
5. Check that Fire Pig skin shows "Level 10" requirement

### Disabling Test Mode

To disable test mode and return to normal gameplay:

1. Open `index.html` in a text editor
2. Find line ~5624: `const TEST_MODE = true;`
3. Change to: `const TEST_MODE = false;`
4. Save and reload

### Testing Checklist

- [ ] All locked skins show **green** question marks (not red)
- [ ] Fire Pig skin requires **Level 10** to unlock
- [ ] Using Health Potion in battle shows **rising potion animation**
- [ ] Using Attack Refill shows **attack boost glow**
- [ ] Using Defense Refill shows **shield effect**
- [ ] Battle arenas alternate every battle
- [ ] Battle music changes every battle
- [ ] All skins are owned and can be equipped

---

**Note**: This test version is for development and testing purposes only. The production version should have `TEST_MODE = false`.

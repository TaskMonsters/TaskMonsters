# Mood Tracker & Dialogue System Analysis

## Components Found in Reference App

### 1. MOOD TRACKER SYSTEM

#### CSS Styling (Lines 247-276)
```css
.mood-options {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 8px;
}

.mood-options button {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    /* ... styling ... */
}
```

#### JavaScript Functions (Lines 5238-5446)
- **moodPhrases** object: Contains phrases for happy, sad, mad moods
- **phraseHistory** tracking: Prevents phrase repetition
- **getRandomMoodPhrase(mood)**: Returns random phrase without repeats
- **showMoodTracker()**: Displays mood selection UI
- **selectMood(moodKey)**: Handles mood selection
  - Updates localStorage
  - Shows response message
  - Triggers monster animation (jump for happy, hurt for sad/mad)
  - Updates mood display emoji
- **updateMoodDisplay(moodKey)**: Shows emoji next to Energy stat
- **getCurrentSpritePrefix()**: Helper to get current monster sprite

#### Features:
- 4 mood options: 😊 (happy), 😢 (sad), 🫤 (discouraged), 😡 (mad)
- Mood-based monster animations
- Persistent mood storage
- Mood emoji display in stats
- Auto-show on page load
- Varied response phrases

---

### 2. DIALOGUE SYSTEM

#### Dialogue Database (Lines 5548-5942)
**DIALOGUE_DATABASE** object containing:
- **level1to5**: Beginner phrases
- **level6to10**: Intermediate phrases
- **level11to15**: Advanced phrases
- **level16to20**: Expert phrases
- **level21plus**: Master phrases
- **taskComplete**: Category-specific completion phrases
- **equipment**: Equip/unequip responses
- **levelUp**: Level milestone phrases
- **funFact**: Random fun facts (Level 15+)
- **greeting**: Time-based greetings (morning/afternoon/evening)

#### Dialogue State Management (Lines 5944-5950)
```javascript
let dialogueState = {
    lastDialogueTime: 0,
    dialogueInterval: 10 * 60 * 1000, // 10 minutes
    bubble: null,
    currentLevel: 1
};
```

#### Core Functions
- **showSpeechBubble(text, duration)**: Dummy function (speech bubble removed, using tooltip)
- **hideSpeechBubble()**: Dummy function
- **getRandomWithoutRepeat(array)**: Prevents dialogue repetition
- **getDialogueForContext(context, data)**: Returns appropriate dialogue
  - Contexts: taskComplete, idle, equipment, levelUp, funFact, greeting
- **getTimeOfDay()**: Returns morning/afternoon/evening
- **startDialogueSystem()**: Periodic dialogue every 10 minutes
- **completeTaskWithDialogue(index)**: Task completion with dialogue
- **equipItemWithDialogue(itemId)**: Equipment with dialogue
- **unequipItemWithDialogue(itemId)**: Unequip with dialogue

#### Integration Points
- **initializeApp()**: Starts dialogue system (Line 6204)
- **Task completion**: Shows dialogue after task done (Lines 8782-8794)
- **Welcome message**: Shows idle dialogue on load (Lines 6213-6217)

---

### 3. ADDITIONAL MOOD HANDLER (Lines 9523-9556)

Alternative mood tracker implementation:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const moodTracker = document.getElementById('moodTracker');
  if (moodTracker && !moodTracker.dataset.enhanced) {
    const moods = ['😊', '😢', '😡', '🫤'];
    // Creates mood buttons dynamically
  }
});

function handleMoodSelection(mood) {
  // Handles mood selection with messages
}
```

---

## Key Differences from Current App

### Missing in Current App:
1. ❌ Mood tracker CSS styling
2. ❌ Mood tracker JavaScript functions
3. ❌ Mood phrases database
4. ❌ Mood selection UI
5. ❌ Mood-based animations
6. ❌ Mood display emoji
7. ❌ Dialogue database (DIALOGUE_DATABASE)
8. ❌ Dialogue state management
9. ❌ Dialogue system functions
10. ❌ Integration with task completion
11. ❌ Periodic dialogue system
12. ❌ Equipment dialogue responses

### Present in Current App:
- ✅ Monster sprite animations (idle, walk, jump, hurt)
- ✅ Task completion system
- ✅ Equipment system
- ✅ Level up system
- ✅ Tooltip system (taskPalTooltip)

---

## Integration Strategy

### Phase 1: Mood Tracker
1. Add mood CSS styling
2. Add mood phrases database
3. Add mood tracker functions
4. Integrate mood display with stats
5. Connect mood selection to monster animations

### Phase 2: Dialogue System
1. Add DIALOGUE_DATABASE
2. Add dialogue state management
3. Add dialogue helper functions
4. Integrate with task completion
5. Integrate with equipment system
6. Start periodic dialogue system

### Phase 3: Testing
1. Test mood tracker UI
2. Test mood selection and animations
3. Test dialogue responses
4. Test dialogue variety (no repeats)
5. Test periodic dialogue timing
6. Test integration with existing features

---

## Files to Modify

1. **index.html** (main file)
   - Add CSS for mood tracker
   - Add mood tracker JavaScript
   - Add dialogue system JavaScript
   - Update task completion to include dialogue
   - Update equipment functions to include dialogue
   - Update initializeApp() to start dialogue system

No additional files needed - all functionality is in index.html

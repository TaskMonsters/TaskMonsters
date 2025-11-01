# Player Name Integration Examples

## How to Use Player Name in Your Game

The player name is stored in `localStorage` under the key `"playerName"`. Here's how to integrate it into various parts of your game:

## Basic Usage

```javascript
// Get player name with fallback
const playerName = localStorage.getItem("playerName") || "adventurer";
```

## Integration Examples

### 1. In Tooltip Messages

```javascript
function showTooltip(message) {
  const playerName = localStorage.getItem("playerName") || "adventurer";
  const personalizedMessage = message.replace("{playerName}", playerName);
  
  const tooltip = document.getElementById('taskPalTooltip');
  if (!tooltip) return;
  tooltip.textContent = personalizedMessage;
  tooltip.classList.add('show');
  
  setTimeout(() => {
    tooltip.classList.remove('show');
  }, 3000);
}

// Usage:
showTooltip("Great work, {playerName}! You're on fire!");
```

### 2. In Monster Dialogue

```javascript
function showMonsterDialogue() {
  const playerName = localStorage.getItem("playerName") || "adventurer";
  const dialogues = [
    `Hey ${playerName}, ready for another task?`,
    `${playerName}, you're doing amazing!`,
    `I believe in you, ${playerName}!`,
    `Let's crush these tasks together, ${playerName}!`
  ];
  
  const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
  // Display the dialogue in your monster's speech bubble
}
```

### 3. In Achievement Messages

```javascript
function unlockAchievement(achievementName) {
  const playerName = localStorage.getItem("playerName") || "adventurer";
  showSuccessMessage(`Congratulations ${playerName}! You unlocked: ${achievementName}`);
}
```

### 4. In Welcome Messages

```javascript
function showWelcomeMessage() {
  const playerName = localStorage.getItem("playerName") || "adventurer";
  const hour = new Date().getHours();
  let greeting = "Hello";
  
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  
  showTooltip(`${greeting}, ${playerName}! Ready to be productive?`);
}
```

### 5. In Task Completion Messages

```javascript
function completeTask(taskId) {
  const playerName = localStorage.getItem("playerName") || "adventurer";
  // ... existing task completion logic ...
  
  const encouragements = [
    `Awesome work, ${playerName}!`,
    `${playerName}, you're unstoppable!`,
    `Keep it up, ${playerName}!`,
    `That's the spirit, ${playerName}!`
  ];
  
  const message = encouragements[Math.floor(Math.random() * encouragements.length)];
  showTooltip(message);
}
```

### 6. Dynamic Dialogue System

```javascript
// Create a dialogue generator that uses player name
const DialogueGenerator = {
  greetings: [
    "Hey {name}, let's get started!",
    "Welcome back, {name}!",
    "{name}, ready for action?"
  ],
  
  encouragement: [
    "You've got this, {name}!",
    "Keep pushing, {name}!",
    "{name}, you're amazing!"
  ],
  
  celebration: [
    "Woohoo! Great job, {name}!",
    "{name}, you're on fire!",
    "Incredible work, {name}!"
  ],
  
  generate: function(type) {
    const playerName = localStorage.getItem("playerName") || "adventurer";
    const messages = this[type] || this.greetings;
    const template = messages[Math.floor(Math.random() * messages.length)];
    return template.replace("{name}", playerName);
  }
};

// Usage:
showTooltip(DialogueGenerator.generate("celebration"));
```

## Best Practices

1. **Always provide a fallback**: Use `|| "adventurer"` or another generic term
2. **Keep it natural**: Don't overuse the name - use it strategically for impact
3. **Vary your messages**: Create arrays of different messages to avoid repetition
4. **Context matters**: Use the name in meaningful moments (achievements, encouragement, etc.)

## Testing

To test the integration:

1. Open browser console
2. Check current name: `localStorage.getItem("playerName")`
3. Set a test name: `localStorage.setItem("playerName", "TestUser")`
4. Remove name to trigger modal: `localStorage.removeItem("playerName")`
5. Reload page to see modal appear

## Notes

- The name is stored locally in the browser
- No server-side integration needed
- Name persists across sessions
- Cleared when user resets the game
- Can be changed anytime in Settings

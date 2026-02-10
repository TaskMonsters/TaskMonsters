# UI Positioning and Mood Tracker Fix (January 18, 2026)

## Overview
This update addresses three key UI/UX improvements:
1. **Message dialogue container repositioning** - Moved to be directly under the user's monster
2. **Mood tracker modal size reduction** - Reduced by 25% (scale 0.75) to prevent covering the monster
3. **Mood tracker auto-popup** - Now appears every time users arrive at the home page after onboarding

---

## Changes Implemented

### 1. Message Dialogue Container Repositioning

**File:** `index.html` (CSS section)

**Problem:** The message dialogue container (task-pal-tooltip) was positioned too far below the monster, not aligned with the monster's feet as shown in the design mockup.

**Solution:** Changed the `top` position from `100%` to `60%` to position it directly under the monster's feet.

**Before:**
```css
.task-pal-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    /* ... other styles ... */
}
```

**After:**
```css
.task-pal-tooltip {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translateX(-50%);
    /* ... other styles ... */
}
```

**Visual Result:** The speech bubble/message container now appears in the red rectangle area shown in the design mockup, directly under the monster's feet.

---

### 2. Mood Tracker Modal Size Reduction

**File:** `js/moodTracker.js`

**Problem:** The mood tracker modal was too large and completely covered the user's monster, making the UI feel cluttered and blocking the main character.

**Solution:** Applied a `scale(0.75)` transform to reduce the modal size by 25%, making it more compact while maintaining readability.

**Changes Made:**

#### A. Initial Modal Styling
```javascript
// Before
transform: translateX(-50%);
transform-origin: bottom center;

// After
transform: translateX(-50%) scale(0.75);
transform-origin: top center;
```

#### B. Show Animation
```javascript
// Before
tooltip.style.transform = 'translateX(-50%) scale(1)';

// After
tooltip.style.transform = 'translateX(-50%) scale(0.75)';
```

#### C. Hide Animation
```javascript
// Before
tooltip.style.transform = 'translateX(-50%) scale(0.95)';

// After
tooltip.style.transform = 'translateX(-50%) scale(0.7)';
```

**Visual Result:** The mood tracker modal is now 25% smaller, no longer covering the monster completely, and feels more integrated with the UI.

---

### 3. Mood Tracker Auto-Popup on Home Page

**File:** `js/moodTracker.js`

**Problem:** The mood tracker only appeared once per day. Users wanted it to appear every time they arrive at the home page after completing onboarding.

**Solution:** Modified the `showInitialMoodTracker()` method to:
- Remove the "once per day" restriction
- Check for multiple onboarding completion flags
- Verify user is on home page (not in battle or other modals)
- Retry if modals are still open

**Before:**
```javascript
showInitialMoodTracker() {
    const onboardingComplete = localStorage.getItem('simpleOnboardingCompleted') === 'true';
    
    if (!onboardingComplete) {
        return;
    }
    
    // Check if already shown today
    const lastShown = localStorage.getItem('moodTrackerLastShown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
        console.log('[MoodTracker] Mood tracker already shown today');
        return;
    }
    
    this.showTooltip();
    localStorage.setItem('moodTrackerLastShown', today);
}
```

**After:**
```javascript
showInitialMoodTracker() {
    // Check multiple onboarding flags
    const onboardingComplete = localStorage.getItem('simpleOnboardingCompleted') === 'true' || 
                               localStorage.getItem('onboardingCompleted') === 'true' ||
                               localStorage.getItem('onboardingComplete') === 'true';
    
    if (!onboardingComplete) {
        return;
    }
    
    // Check if user is on home page (not in battle or other modals)
    const isBattleActive = document.getElementById('battleContainer')?.style.display !== 'none';
    const isModalOpen = document.querySelector('.modal-overlay:not([style*="display: none"])');
    
    if (isBattleActive || isModalOpen) {
        // Retry after modals close
        setTimeout(() => this.showInitialMoodTracker(), 2000);
        return;
    }
    
    console.log('[MoodTracker] Showing mood tracker on home page arrival');
    this.showTooltip();
}
```

**Key Improvements:**
- ✅ Removed daily restriction - now shows every time user arrives at home page
- ✅ Checks multiple onboarding completion flags for compatibility
- ✅ Intelligently waits for battle/modals to close before showing
- ✅ Automatically retries if modals are still open

---

## Cache-Busting

**File:** `index.html`

Updated the moodTracker.js script tag with version parameter:

```html
<script src="js/moodTracker.js?v=1768748859"></script>
```

This ensures users get the latest version without manual cache clearing.

---

## Files Modified

1. **index.html**
   - Updated `.task-pal-tooltip` CSS positioning (`top: 60%`)
   - Added cache-busting to moodTracker.js

2. **js/moodTracker.js**
   - Reduced modal size with `scale(0.75)` transform
   - Updated show/hide animations to maintain scaled size
   - Modified `showInitialMoodTracker()` to show on every home page visit
   - Added intelligent modal/battle detection

---

## Testing Recommendations

### 1. Message Dialogue Position
- ✅ Load the home page
- ✅ Wait for the monster's welcome message to appear
- ✅ Verify the message appears directly under the monster's feet (in the red rectangle area from mockup)

### 2. Mood Tracker Size
- ✅ Complete onboarding
- ✅ Arrive at home page
- ✅ Verify mood tracker modal appears at 75% size
- ✅ Confirm the monster is still visible and not completely covered

### 3. Mood Tracker Auto-Popup
- ✅ Complete onboarding
- ✅ Navigate away from home page (to Achievements, Shop, etc.)
- ✅ Return to home page
- ✅ Verify mood tracker appears automatically
- ✅ Repeat multiple times to confirm it shows every time

### 4. Modal Conflict Handling
- ✅ Trigger a battle
- ✅ Complete the battle
- ✅ Return to home page
- ✅ Verify mood tracker appears after battle modal closes

---

## Expected Behavior

### Message Dialogue
- **Position:** Directly under monster's feet (60% from top of container)
- **Appearance:** Horizontal landscape format, dark background with white text
- **Timing:** Appears on page load with welcome message

### Mood Tracker Modal
- **Size:** 75% of original size (scale 0.75)
- **Position:** Top center of screen
- **Trigger:** Automatically on home page arrival after onboarding
- **Frequency:** Every time user returns to home page
- **Conflict Handling:** Waits for battles/modals to close before showing

---

## Technical Notes

### Transform Origin
Changed from `bottom center` to `top center` for the mood tracker to ensure the scaling happens from the top, keeping the modal's top edge in a consistent position.

### Multiple Onboarding Flags
The system checks three different onboarding completion flags to ensure compatibility with different onboarding flows:
- `simpleOnboardingCompleted`
- `onboardingCompleted`
- `onboardingComplete`

### Intelligent Retry Logic
If the mood tracker detects an active battle or modal, it automatically retries after 2 seconds, ensuring it appears as soon as the user reaches a clean home page state.

---

## Version Information

- **Fix Date:** January 18, 2026
- **Cache-Bust Version:** 1768748859
- **Files Changed:** 2 (index.html, js/moodTracker.js)
- **Status:** ✅ READY FOR TESTING

---

## Visual Comparison

### Before
- Message dialogue: Too far below monster
- Mood tracker: Full size, covering entire monster
- Auto-popup: Once per day only

### After
- Message dialogue: ✅ Directly under monster's feet
- Mood tracker: ✅ 75% size, monster visible
- Auto-popup: ✅ Every home page visit after onboarding

---

**Note:** These changes create a more polished, pixel-perfect experience with better visual hierarchy and improved user engagement through the mood tracker's increased visibility.

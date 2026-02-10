# Task Monsters v3.33 - Changelog

## Release Date
February 9, 2026

## Overview
Version 3.33 builds on v3.32 with critical mood tracker fixes and language improvements for broader accessibility.

---

## 🆕 New in v3.33

### Mood Tracker Improvements
1. **Fixed Jump Animation Breaking**
   - Fixed monster jump animation not loading correctly when clicking happy mood
   - Added proper capitalization for monster name in file path (e.g., `nova` → `Nova_jump.gif`)
   - Jump GIF now loads correctly for all three monsters (Nova, Luna, Benny)

2. **Added Tap Hint Dialogue**
   - New "tap_hint" dialogue category added to all monsters
   - Appears 3 seconds after app loads to teach users about mood tracker
   - Each monster has unique tap hint messages:
     - **Nova**: "Hey! Tap on me to check in with your mood!"
     - **Luna**: "You can tap on me to share how you're feeling."
     - **Benny**: "Ooh! Tap me to tell me your mood!"

3. **Hourly Auto-Trigger**
   - Changed mood tracker auto-popup from 30 minutes to 1 hour
   - Reduces interruption frequency while maintaining regular check-ins
   - Updated all documentation and comments to reflect new timing

### Language & Accessibility Updates
4. **Removed ADHD/Dopamine Language**
   - Made onboarding language more inclusive and universal
   - Changes in `simpleOnboarding.js`:
     - "Perfect for your brain - gamification makes boring tasks fun!" → "Gamification makes boring tasks fun!"
     - "ADHD-friendly: Less decision fatigue, more action!" → "Less decision fatigue, more action!"
     - "Instant rewards = dopamine boost = motivation!" → "Instant rewards = instant motivation!"
     - "Why This Works for ADHD" → "Why This Works"
     - "Your brain will LOVE the dopamine hits!" → "Your brain will LOVE the instant rewards!"
   - Maintains motivational messaging while being inclusive to all users

---

## ✅ Carried Over from v3.32

### Battle System Fixes
- Fixed NaN HP bug with comprehensive null checks
- Fixed purchased items not appearing in battle (visibility logic corrected)
- Fixed NaN XP error in defeat modal
- Added enemy special attack functions (Medusa, Mushroom projectiles)
- Removed Orc enemy completely from all systems
- Fixed enemy level triggers so lower level enemies appear at all levels 1-50

### Player Special Attacks
- Implemented special attacks for Nova, Luna, and Benny
- Added projectile animations for each monster's unique ability
- Special attack button shows at level 10+, enables at 100/100 gauge

### New Themes (4 Total)
- **Bright Town** - Level 30+, 1400 XP
- **Fort of Illusions** - Level 50+, 2500 XP
- **Stone Ruins** - Level 40+, 2000 XP
- **Forest of Illusions** - Level 40+, 2000 XP

### Battle Animations
- Added defend animation using DefendandDefenseAnimation.gif
- Added potion/boost animations using PotionandattackboostAnimation.gif
- All animations properly integrated into battle flow

### Onboarding Improvements
- Repositioned step 3 header 20px higher
- Fixed Welcome to Task World page scrolling issues
- Removed "procrastination and distraction" language

---

## 🧪 Testing Version Features
- All items unlock at level 1 (for testing)
- Starting XP: 500,000
- Starting level: 10
- All themes immediately accessible

---

## 📁 Files Modified in v3.33

### Core Changes
- `js/moodTracker.js` - Fixed jump animation path, changed interval to 1 hour
- `js/dialogueData.js` - Added tap_hint dialogue for all monsters
- `js/moodDialogueSystem.js` - Added tap_hint trigger on app load
- `js/simpleOnboarding.js` - Removed ADHD/dopamine language

---

## 🐛 Known Issues
None reported.

---

## 🔄 Upgrade Instructions
1. Back up your current installation
2. Extract v3.33 files
3. Replace all files (localStorage data will be preserved)
4. Clear browser cache for best results

---

## 📝 Notes
- This is a **testing version** with boosted stats for development
- Production version should reset starting XP to normal values
- All mood tracker features now fully functional
- Language is now more inclusive and accessible to all users

---

## 🎯 Next Steps
- Monitor mood tracker hourly trigger in production
- Gather user feedback on new inclusive language
- Consider adding more monster dialogue variations
- Test jump animation across different browsers

---

**Version**: 3.33  
**Build Date**: February 9, 2026  
**Status**: Testing Ready  
**Compatibility**: All modern browsers

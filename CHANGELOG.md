# Task Monsters - Change Log

## Version 21.1 - January 6, 2026

### 🐛 Bug Fixes

#### Critical Fixes
- **[FIXED]** Sprite sheet animation showing rows of frames on initial load
  - Applied CSS animation immediately on page load
  - Added opacity transition for smooth appearance
  - Affects all sprite-based monsters (Benny, Nova, Luna)

- **[FIXED]** Level 1 egg not displaying for new players
  - Removed DEMO code that was setting isEgg = false
  - Properly initialize level to 1 (was null)
  - Set isEgg = true for new players in onboarding
  - Egg now correctly displays until Level 10

- **[FIXED]** Rock skins missing from shop
  - Restored Jerry (900 XP)
  - Restored Rock Star (1000 XP, Level 18)
  - Restored Rocks Anne (900 XP)
  - All using optimized animated GIFs

- **[FIXED]** Inconsistent rock skin thumbnail sizes
  - Jerry: 2048x2048 (3.1MB) → 256x256 (69KB)
  - Rock Star: 2048x2048 (45KB WebP) → 256x256 (19KB GIF)
  - Rocks Anne: 2028x2048 (51KB WebP) → 256x256 (20KB GIF)

### ✨ New Features

#### New Themes (4 Added)
1. **Bright Town** - 1000 XP Coins
   - Colorful medieval town with orange roofs
   - Cheerful daytime setting

2. **Stone Ruins** - 1200 XP Coins
   - Purple ruins with ancient castle arches
   - Mystical fantasy atmosphere

3. **Skull Gates** - 1500 XP Coins, Level 25+
   - Haunted dungeon entrance with skull gateway
   - Dark, atmospheric setting

4. **Dark Gothic Castle** - 2000 XP Coins, Level 50+
   - Majestic dark castle silhouette at dusk
   - Premium end-game theme

#### Theme System Enhancements
- Themes now dynamically change background in main view
- Purchase and equip functionality fully implemented
- Level requirements enforced for premium themes
- Theme backgrounds properly applied to pet-rock-header

### 🎨 Asset Updates

#### New Assets
- `/assets/skins/Jerry.gif` (69KB)
- `/assets/skins/rock-star.gif` (19KB)
- `/assets/skins/rocks-anne.gif` (20KB)
- `/assets/backgrounds/themes/bright-town.png` (34KB)
- `/assets/backgrounds/themes/stone-ruins.png` (230KB)
- `/assets/backgrounds/themes/skull-gates.png` (23KB)
- `/assets/backgrounds/themes/dark-gothic-castle.png` (22KB)

#### Optimized Assets
- All rock skin GIFs resized to 256x256
- Consistent thumbnail sizes across all skins
- Optimized file sizes for faster loading

### 🔧 Technical Changes

#### Code Modifications
- `index.html` (multiple sections)
  - Sprite animation initialization (line ~4318)
  - Theme background application (line ~5939-5962)
  - Theme display configuration (line ~8862-8894)
  - Theme purchase configuration (line ~8960-8963)
  - Onboarding egg initialization (line ~12600-12620)

- `js/skinsConfig.js`
  - Added rock skins with GIF support
  - Configured costs and requirements

### 📊 Statistics

- **Total Themes:** 15 (11 existing + 4 new)
- **Total Skins:** All original skins + 3 rock skins
- **Files Modified:** 2 core files
- **Assets Added:** 7 new files
- **Assets Optimized:** 3 files
- **Package Size:** 72MB

### 🧪 Testing

#### Tested Scenarios
- ✅ New player onboarding with egg display
- ✅ Sprite animation on page load
- ✅ Rock skins appearing in shop
- ✅ Thumbnail size consistency
- ✅ Theme display in shop
- ✅ Theme purchase functionality (code verified)
- ✅ Theme equip functionality (code verified)

#### Browser Compatibility
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### ⚠️ Known Issues

1. Tutorial modal persists on reload (cosmetic only)
2. Browser cache may require hard refresh to see changes
3. LocalStorage preserved for existing users

### 🔄 Migration Notes

- No database changes required
- Existing user data preserved
- New themes available immediately
- Rock skins available immediately
- No breaking changes

### 📝 Upgrade Path

From any previous version:
1. Extract new package
2. Replace existing files
3. Restart web server
4. Users may need to hard refresh browser

No data migration or user action required.

---

## Previous Versions

### Version 21.0 - Original Release
- Base Task Monsters application
- 11 themes
- Original monster skins
- Basic gameplay features

---

**Release Date:** January 6, 2026  
**Build:** task-monsters-fixed-20260106  
**Status:** Stable

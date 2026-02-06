# TaskMonsters v15 - Changes and Fixes

## Date: February 5, 2026

### 🎨 Hurt Animations Updated
- **Replaced hurt animations** for all three main heroes:
  - Nova_Hurt.gif (updated)
  - Luna_Hurt.gif (updated)
  - Benny_Hurt.gif (updated)
- New hurt animations are now active in battle mode
- Located in: `assets/heroes/`

### 🐛 Critical Bug Fixes

#### HP Bar Visibility Fix
**Problem:** When dialogue appeared in battle mode, the battle arena would shrink and HP bars would disappear.

**Solution:** Applied multiple CSS fixes to `css/battle.css`:
1. Added `min-height: 300px` to `.battle-container` to prevent shrinking
2. Added `flex-shrink: 0` to prevent flexbox compression
3. Added `visibility: visible !important` and `opacity: 1 !important` to HP bar containers
4. Added pointer-events management to prevent overlapping elements from hiding HP bars

**Result:** HP bars now remain visible at all times during battle, regardless of dialogue or battle log content.

### 🧹 Asset Cleanup
- **Scanned 1,420 total assets** in the project
- **Identified 829 unused assets** (62MB)
- **Moved all unused assets** to backup folder: `TaskMonsters_unused_assets_backup/`
- **Cleaned up empty directories** automatically
- **Project size reduced** from 176MB to 114MB (35% reduction)

### 📊 Summary
- ✅ Hurt animations replaced and working
- ✅ HP bar visibility bug fixed
- ✅ 829 unused assets cleaned up (safely backed up)
- ✅ Project optimized and leaner

### 🔧 Technical Details

**Files Modified:**
- `assets/heroes/Nova_Hurt.gif` - Replaced
- `assets/heroes/Luna_Hurt.gif` - Replaced
- `assets/heroes/Benny_Hurt.gif` - Replaced
- `css/battle.css` - HP bar visibility fixes (lines 29-324)

**Files Created:**
- `CHANGES_v15.md` - This changelog

**Backup Location:**
- `/home/ubuntu/TaskMonsters_unused_assets_backup/` - Contains all removed unused assets

### 🎮 Testing Recommendations
1. Start a battle and verify new hurt animations play when characters take damage
2. Check that HP bars remain visible when battle dialogue appears
3. Verify all battle functionality works as expected
4. Test on different screen sizes to ensure responsive layout works

---
**Version:** v15  
**Previous Version:** v14  
**Build Date:** February 5, 2026

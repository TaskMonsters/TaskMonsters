// Battle System Initialization

// Level-based arena pools (as per battle system specifications)
const ARENA_POOLS = {
    level_1_9: [
        'assets/battle-backgrounds/City Sunset Level 1-10 and up.png',
        'assets/battle-backgrounds/Forest Level 1-10 and up.png',
        'assets/battle-backgrounds/MistyForest Levle 1-10 and up.png'
    ],
    level_10_19: [
        'assets/battle-backgrounds/synth-city Level 10 - 20 and up .png',
        'assets/battle-backgrounds/Forest Level 1-10 and up.png',
        'assets/battle-backgrounds/Night Town Level 10 - 20 and up.png',
        'assets/battle-backgrounds/Dungeon Level 20+.png',
        'assets/battle-backgrounds/DarkGothicCastle Level 20 and up.png'
    ],
    level_20_29: [
        'assets/battle-backgrounds/skull-gate level 20 - 25 and up.png',
        'assets/battle-backgrounds/Dusk Arena Level 20 - 25 and up.png',
        'assets/battle-backgrounds/Mountain Dusk Level 20 - 25 and up.png'
    ],
    level_30_39: [
        'assets/battle-backgrounds/Hot Town Level 30 - 35 and up.png',
        'assets/battle-backgrounds/Castle Arena Level 30 - 35 and up.png',
        'assets/battle-backgrounds/UnderwaterFantasy Level 30 - 35 and up.png',
        'assets/battle-backgrounds/Green Arena Level 30 - 35 and up.png'
    ],
    level_40_49: [
        'assets/battle-backgrounds/Forest of Illusions Level 40 and up.gif'
    ],
    level_50_plus: [
        'assets/battle-backgrounds/Fort of Illusions Level 50.gif',
        'assets/battle-backgrounds/vampire-castle Level 50.png'
    ]
};

let arenaIndices = {
    level_1_9: 0,
    level_10_19: 0,
    level_20_29: 0,
    level_30_39: 0,
    level_40_49: 0,
    level_50_plus: 0
};

// Global arena rotation index
let globalArenaIndex = 0;

function getNextArenaBackground() {
    const playerLevel = window.gameState?.jerryLevel || 10;
    
    // Build cumulative arena pool based on player level
    // Once unlocked, arenas stay available and alternate
    let availableArenas = [];
    
    // Level 1-9: Add Level 1-9 arenas
    if (playerLevel >= 1) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_1_9);
    }
    
    // Level 10-19: Add Level 10-19 arenas (cumulative)
    if (playerLevel >= 10) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_10_19);
    }
    
    // Level 20-29: Add Level 20-29 arenas (cumulative)
    if (playerLevel >= 20) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_20_29);
    }
    
    // Level 30-39: Add Level 30-39 arenas (cumulative)
    if (playerLevel >= 30) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_30_39);
    }
    
    // Level 40-49: Add Level 40-49 arenas (cumulative)
    if (playerLevel >= 40) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_40_49);
    }
    
    // Level 50+: Add Level 50+ arenas (cumulative)
    if (playerLevel >= 50) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_50_plus);
    }
    
    // Fallback if no arenas available
    if (availableArenas.length === 0) {
        console.warn(`[Arena] No arenas available for level ${playerLevel}, using fallback`);
        return 'assets/battle-backgrounds/synth-city Level 10 - 20 and up .png';
    }
    
    // Get current arena and rotate to next
    const arena = availableArenas[globalArenaIndex % availableArenas.length];
    globalArenaIndex++;
    
    console.log(`[Arena] Level ${playerLevel}: ${arena} (${globalArenaIndex}/${availableArenas.length} total arenas available)`);
    return arena;
}

// Hero Sprite Animation System
let heroAnimationInterval = null;
let heroCurrentFrame = 0;
let heroTotalFrames = 4;
let heroFrameWidth = 32;

/**
 * Get active hero appearance with robust fallback
 * Returns skin animations if equipped, otherwise default monster animations
 */
function getActiveHeroAppearance() {
    const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
    const equippedSkinId = window.gameState ? window.gameState.equippedSkinId : null;
    
    // Try to use skin if equipped
    if (equippedSkinId && window.SKINS_CONFIG && window.SKINS_CONFIG[equippedSkinId]) {
        const skin = window.SKINS_CONFIG[equippedSkinId];
        return {
            animations: skin.animations,
            frameCount: skin.frameCount,
            isSkin: true,
            skinId: equippedSkinId
        };
    }
    
    // Fallback to default monster
    const defaultMonsterMap = {
        luna: 'Owlet_Monster',
        benny: 'Dude_Monster',
        nova: 'Pink_Monster'
    };
    
    const prefix = defaultMonsterMap[baseMonsterId] || 'Pink_Monster';
    
    return {
        animations: {
            idle: `assets/heroes/${prefix}_Idle_4.png`,
            walk: `assets/heroes/${prefix}_Walk_4.png`,
            attack: `assets/heroes/${prefix}_Attack1_4.png`,
            jump: `assets/heroes/${prefix}_Jump_8.png`,
            hurt: `assets/heroes/${prefix}_Hurt_4.png`,
            death: `assets/heroes/${prefix}_Death_8.png`
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 4,
            jump: 8,
            hurt: 4,
            death: 8
        },
        isSkin: false,
        skinId: null
    };
}

/**
 * Render hero sprite with guaranteed visibility
 * Called at battle start to ensure hero is always visible
 */
function renderHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found in DOM');
        return;
    }
    
    const appearance = getActiveHeroAppearance();
    
    if (!appearance || !appearance.animations || !appearance.animations.idle) {
        console.error('[Battle] Unable to get valid hero appearance', { appearance });
        // Last resort fallback
        heroSprite.style.backgroundImage = "url('assets/heroes/Pink_Monster_Idle_4.png')";
        heroSprite.style.backgroundSize = '128px 32px';
    } else {
        heroSprite.style.backgroundImage = `url('${appearance.animations.idle}')`;
        
        // Get sprite dimensions (default to 32x32 for standard sprites)
        const spriteSize = appearance.spriteSize || { width: 32, height: 32 };
        const frameWidth = spriteSize.width;
        const frameHeight = spriteSize.height;
        
        // For multi-directional sprites, we need to account for multiple rows
        const spriteRow = appearance.spriteRow || 0;
        const animationRows = appearance.animationRows || {};
        
        // Calculate total width and height based on sprite type
        let totalWidth, totalHeight;
        
        if (Object.keys(animationRows).length > 0) {
            // Blob-style: full sprite sheet is 192x192 (6 frames wide × 6 rows tall)
            totalWidth = 192; // Full sprite sheet width
            totalHeight = 192; // Full sprite sheet height (6 rows × 32px)
        } else {
            // Standard sprites: calculate based on idle frame count
            totalWidth = (appearance.frameCount.idle || 4) * frameWidth;
            totalHeight = frameHeight;
        }
        
        heroSprite.style.backgroundSize = `${totalWidth}px ${totalHeight}px`;
    }
    
    // Ensure sprite is visible - render all skins at same size as cat skins
    const spriteSize = appearance?.spriteSize || { width: 32, height: 32 };
    const spriteRow = appearance?.spriteRow || 0;
    const animationRows = appearance?.animationRows || {};
    
    // FIX: Maintain consistent sprite container size across ALL animations
    // This prevents size changes during attack/idle transitions
    
    // Store the base sprite size on first animation (or use from appearance)
    if (!heroSprite.dataset.baseWidth || !heroSprite.dataset.baseHeight) {
        heroSprite.dataset.baseWidth = spriteSize.width;
        heroSprite.dataset.baseHeight = spriteSize.height;
    }
    
    // Always use the stored base size for consistency
    const baseWidth = parseInt(heroSprite.dataset.baseWidth);
    const baseHeight = parseInt(heroSprite.dataset.baseHeight);
    
    heroSprite.style.width = `${baseWidth}px`;
    heroSprite.style.height = `${baseHeight}px`;
    heroSprite.style.transform = 'none'; // No scaling on sprite element
    
    // Scale the wrapper to maintain visual size (NEVER change this during battle)
    const spriteWrapper = heroSprite.parentElement;
    if (spriteWrapper && spriteWrapper.classList.contains('sprite-wrapper')) {
        // Lock the wrapper transform to prevent size changes
        if (!spriteWrapper.dataset.transformLocked) {
            spriteWrapper.style.transform = 'scale(3.5)';
            spriteWrapper.dataset.transformLocked = 'true';
        }
    }
    
    heroSprite.style.imageRendering = 'pixelated';
    
    // Set initial background position (accounting for sprite row if multi-directional)
    // For Blob-style sprites with animationRows, use idle row
    const initialRow = animationRows.idle !== undefined ? animationRows.idle : spriteRow;
    const yOffset = initialRow * spriteSize.height;
    heroSprite.style.backgroundPosition = `0 -${yOffset}px`;
    
    // Remove any classes or styles that could hide the sprite
    heroSprite.classList.remove('hidden', 'opacity-0', 'fade-out', 'defeated');
    heroSprite.style.removeProperty('display');
    heroSprite.style.removeProperty('visibility');
    heroSprite.style.removeProperty('opacity');
    
    console.log('[Battle] Hero sprite rendered successfully', { appearance });
}

// Export to global scope
window.getActiveHeroAppearance = getActiveHeroAppearance;
window.renderHeroSprite = renderHeroSprite;

function startHeroAnimation(animationType = 'idle') {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found');
        return;
    }
    
    // Stop any existing animation
    if (heroAnimationInterval) {
        clearInterval(heroAnimationInterval);
        heroAnimationInterval = null;
    }
    
    // Prevent flicker: ensure sprite is fully visible and disable transitions
    heroSprite.style.opacity = '1';
    heroSprite.style.transition = 'none';
    
    // Get current monster appearance using the robust helper
    const appearance = getActiveHeroAppearance();
    const spritePrefix = localStorage.getItem('heroSpritePrefix') || 'Pink_Monster';
    
    // Set animation parameters based on type
    let animations;
    
    if (appearance && appearance.isSkin) {
        // Use skin animations
        const skin = appearance;
        const spriteSize = skin.spriteSize || { width: 32, height: 32 };
        const frameWidth = spriteSize.width;
        const spriteSheetWidth = skin.spriteSheetWidth || {};
        
        // Helper function to get width - use actual sprite sheet width if available, otherwise calculate
        const getWidth = (animType, frameCount) => {
            return spriteSheetWidth[animType] || (frameCount * frameWidth);
        };
        
        animations = {
            idle: { frames: skin.frameCount.idle || 4, width: getWidth('idle', skin.frameCount.idle || 4), sprite: skin.animations.idle, speed: 200 },
            attack1: { frames: skin.frameCount.attack || 4, width: getWidth('attack', skin.frameCount.attack || 4), sprite: skin.animations.attack, speed: 150 },
            'walk-attack': { frames: skin.frameCount.walk || 6, width: getWidth('walk', skin.frameCount.walk || 6), sprite: skin.animations.walk, speed: 150 },
            throw: { frames: skin.frameCount.attack || 4, width: getWidth('attack', skin.frameCount.attack || 4), sprite: skin.animations.attack, speed: 150 },
            jump: { frames: skin.frameCount.jump || 4, width: getWidth('jump', skin.frameCount.jump || 4), sprite: skin.animations.jump || skin.animations.idle, speed: 100 },
            hurt: { frames: skin.frameCount.hurt || 2, width: getWidth('hurt', skin.frameCount.hurt || 2), sprite: skin.animations.hurt, speed: 150 },
            death: { frames: skin.frameCount.death || 4, width: getWidth('death', skin.frameCount.death || 4), sprite: skin.animations.death, speed: 150 },
            dash: { frames: skin.frameCount.dash || 4, width: getWidth('dash', skin.frameCount.dash || 4), sprite: skin.animations.dash || skin.animations.walk, speed: 100 },
            special: { frames: skin.frameCount.special || 4, width: getWidth('special', skin.frameCount.special || 4), sprite: skin.animations.special || skin.animations.attack, speed: 150 },
            walk: { frames: skin.frameCount.walk || 4, width: getWidth('walk', skin.frameCount.walk || 4), sprite: skin.animations.walk, speed: 150 }
        };
    } else {
        // Use default monster animations
        animations = {
            idle: { frames: 4, width: 128, sprite: `assets/heroes/${spritePrefix}_Idle_4.png`, speed: 200 },
            attack1: { frames: 4, width: 128, sprite: `assets/heroes/${spritePrefix}_Attack1_4.png`, speed: 150 },
            'walk-attack': { frames: 6, width: 192, sprite: `assets/heroes/${spritePrefix}_Walk+Attack_6.png`, speed: 150 },
            throw: { frames: 4, width: 128, sprite: `assets/heroes/${spritePrefix}_Throw_4.png`, speed: 150 },
            jump: { frames: 8, width: 256, sprite: `assets/heroes/${spritePrefix}_Jump_8.png`, speed: 100 },
            hurt: { frames: 4, width: 128, sprite: `assets/heroes/${spritePrefix}_Hurt_4.png`, speed: 150 },
            death: { frames: 8, width: 256, sprite: `assets/heroes/${spritePrefix}_Death_8.png`, speed: 150 }
        };
    }
    
    const anim = animations[animationType] || animations.idle;
    
    // Get sprite dimensions from appearance (already declared above)
    const spriteSize = appearance?.spriteSize || { width: 32, height: 32 };
    
    // Validate animation data
    if (!anim || !anim.sprite) {
        console.error('[Battle] Invalid animation data for type:', animationType);
        
        // Special case: If hurt animation is missing, use flicker effect
        if (animationType === 'hurt') {
            console.log('[Battle] No hurt animation found, using flicker effect');
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                heroSprite.style.opacity = heroSprite.style.opacity === '0.3' ? '1' : '0.3';
                flickerCount++;
                if (flickerCount >= 6) {
                    clearInterval(flickerInterval);
                    heroSprite.style.opacity = '1';
                }
            }, 100);
            return; // Exit early, flicker effect is handled
        }
        
        // Use absolute fallback for other animations
        const fallbackAnim = {
            frames: 4,
            width: 128,
            sprite: `assets/heroes/${spritePrefix}_Idle_4.png`,
            speed: 200
        };
        heroTotalFrames = fallbackAnim.frames;
        heroFrameWidth = fallbackAnim.width / fallbackAnim.frames;
        heroCurrentFrame = 0;
        heroSprite.style.backgroundImage = `url('${fallbackAnim.sprite}')`;
        heroSprite.style.backgroundSize = `${fallbackAnim.width}px ${spriteSize.height}px`;
        console.warn('[Battle] Using fallback animation:', fallbackAnim);
    } else {
        heroTotalFrames = anim.frames;
        heroFrameWidth = anim.width / anim.frames;
        heroCurrentFrame = 0;
        
        // Set sprite image and size (only if not using fallback)
        const spritePath = anim.sprite;
        const spriteRow = appearance?.spriteRow || 0;
        const animationRows = appearance?.animationRows || {};
        
        // Calculate total width and height based on sprite type
        let totalWidth, totalHeight;
        
        if (Object.keys(animationRows).length > 0) {
            // Blob-style: full sprite sheet is 192x192
            totalWidth = 192;
            totalHeight = 192;
        } else {
            // Standard sprites: use calculated animation width
            totalWidth = anim.width;
            totalHeight = spriteSize.height;
        }
        
        heroSprite.style.backgroundImage = `url('${spritePath}')`;
        heroSprite.style.backgroundSize = `${totalWidth}px ${totalHeight}px`;
    }
    // FIX: Maintain consistent sprite container size across ALL animations
    // This prevents size changes during attack/idle transitions
    
    // Store the base sprite size on first animation (or use from appearance)
    if (!heroSprite.dataset.baseWidth || !heroSprite.dataset.baseHeight) {
        heroSprite.dataset.baseWidth = spriteSize.width;
        heroSprite.dataset.baseHeight = spriteSize.height;
    }
    
    // Always use the stored base size for consistency
    const baseWidth = parseInt(heroSprite.dataset.baseWidth);
    const baseHeight = parseInt(heroSprite.dataset.baseHeight);
    
    heroSprite.style.width = `${baseWidth}px`;
    heroSprite.style.height = `${baseHeight}px`;
    heroSprite.style.transform = 'none'; // No scaling on sprite element
    
    // Scale the wrapper to maintain visual size (NEVER change this during battle)
    const spriteWrapper = heroSprite.parentElement;
    if (spriteWrapper && spriteWrapper.classList.contains('sprite-wrapper')) {
        // Lock the wrapper transform to prevent size changes
        if (!spriteWrapper.dataset.transformLocked) {
            spriteWrapper.style.transform = 'scale(3.5)';
            spriteWrapper.dataset.transformLocked = 'true';
        }
    }
    
    heroSprite.style.imageRendering = 'pixelated';
    
    // Ensure hero sprite is visible (remove any hidden classes)
    heroSprite.classList.remove('hidden', 'opacity-0', 'fade-out', 'defeated');
    heroSprite.style.removeProperty('display');
    heroSprite.style.removeProperty('visibility');
    heroSprite.style.removeProperty('opacity');
    
    // Animate frames
    const spriteRow = appearance?.spriteRow || 0;
    const animationRows = appearance?.animationRows || {};
    
    // Determine which row to use for this animation type
    let rowIndex = spriteRow;
    if (animationRows[animationType] !== undefined) {
        rowIndex = animationRows[animationType];
    }
    const yOffset = rowIndex * spriteSize.height;
    
    heroAnimationInterval = setInterval(() => {
        heroCurrentFrame = (heroCurrentFrame + 1) % heroTotalFrames;
        const xPos = -(heroCurrentFrame * heroFrameWidth);
        heroSprite.style.backgroundPosition = `${xPos}px -${yOffset}px`;
    }, anim.speed);
}

function stopHeroAnimation() {
    if (heroAnimationInterval) {
        clearInterval(heroAnimationInterval);
        heroAnimationInterval = null;
    }
}

// Export to global scope for use in battleManager
window.startHeroAnimation = startHeroAnimation;
window.stopHeroAnimation = stopHeroAnimation;

// Start idle animation when battle starts
function initializeHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
        // First ensure hero sprite is rendered and visible
        renderHeroSprite();
        // Then start the animation
        startHeroAnimation('idle');
    } else {
        console.error('[Battle] Cannot initialize hero sprite - element not found');
    }
}

// Battle system initialization is handled in battleManager.js

// Test function to start a battle (for development)
function startTestBattle() {
    // Check if Battle Mode is enabled
    if (window.battleModeEnabled === false) {
        console.log('⚙️ Battle Mode is OFF — skipping encounter.');
        return;
    }
    
    // Safeguard: Check if Battle Manager is initialized
    if (!window.battleManager || !window.battleManager.initialized) {
        console.warn('⚠️ Battle Manager not initialized – skipping battle trigger');
        return;
    }

    // Create hero data from gameState
    const level = gameState.jerryLevel || 1;
    
    // Level-based attack damage scaling (grows with level)
    // Hero damage scaling according to gameplay mechanics:
    // Level 5: 5-15 damage
    // Level 10: 15-25 damage
    // Level 20: 30-45 damage
    // Level 30: 45-65 damage
    // Level 40: 60-85 damage
    // Level 50: 75-100 damage
    let baseDamage;
    if (level >= 40) {
        baseDamage = 60 + Math.floor((level - 40) * 1.5); // Level 40: 60, Level 50: 75
    } else if (level >= 30) {
        baseDamage = 45 + Math.floor((level - 30) * 1.5); // Level 30: 45, Level 40: 60
    } else if (level >= 20) {
        baseDamage = 30 + Math.floor((level - 20) * 1.5); // Level 20: 30, Level 30: 45
    } else if (level >= 10) {
        baseDamage = 15 + Math.floor((level - 10) * 1.5); // Level 10: 15, Level 20: 30
    } else if (level >= 5) {
        baseDamage = 5 + Math.floor((level - 5) * 2);  // Level 5: 5, Level 10: 15
    } else {
        baseDamage = 3 + Math.floor(level * 0.4);  // Level 1-4: 3-4 damage
    }
    
    // HP scaling: Level 1: 100 HP, Level 50: 400 HP
    // Linear growth: +6 HP per level
    const maxHP = 100 + Math.floor((level - 1) * 6);
    
    const heroData = {
        hp: gameState.health || maxHP,
        maxHP: maxHP,
        attack: gameState.attack || baseDamage,  // Use saved attack if available
        defense: gameState.defense || (5 + level),  // Use saved defense if available
        level: level,
        attackGauge: gameState.battleInventory?.attackGauge || 100,
        defenseGauge: gameState.battleInventory?.defenseGauge || 100
    };

    // Check if this is a boss level
    const playerLevel = gameState.jerryLevel || 1;
    let enemyData;
    
    if (isBossLevel(playerLevel)) {
        // Create boss enemy
        enemyData = createBossEnemy(playerLevel);
        
        // Track boss count for arena alternation
        if (!gameState.bossCount) {
            gameState.bossCount = 0;
        }
        gameState.bossCount++;
        
        // Set boss arena background on battle-container (not battleArena)
        const arenaBackground = getBossArenaBackground(gameState.bossCount);
        const battleContainer = document.querySelector('.battle-container');
        if (battleContainer) {
            battleContainer.style.backgroundImage = `url('${arenaBackground}')`;
            battleContainer.style.backgroundSize = 'cover';
            battleContainer.style.backgroundPosition = 'center';
        }
        
        saveGameState();
    } else {
        // Create regular enemy
        // Wait for enemy.js to load if not ready yet
        if (typeof window.createRandomEnemy !== 'function') {
            console.warn('⏳ createRandomEnemy not ready yet, waiting for enemy.js to load...');
            // Retry after a short delay
            setTimeout(() => {
                if (typeof window.createRandomEnemy === 'function') {
                    console.log('✅ enemy.js loaded, retrying battle start');
                    startTestBattle();
                } else {
                    console.error('❌ createRandomEnemy still not defined after wait. Make sure enemy.js is loaded.');
                    console.error('Available window functions:', Object.keys(window).filter(k => k.includes('enemy')));
                }
            }, 500);
            return;
        }
        enemyData = window.createRandomEnemy(playerLevel);
        
        // Set rotating arena background on battle-container (not battleArena)
        const arenaBackground = getNextArenaBackground();
        const battleContainer = document.querySelector('.battle-container');
        if (battleContainer && arenaBackground) {
            battleContainer.style.backgroundImage = `url('${arenaBackground}')`;
            battleContainer.style.backgroundSize = 'cover';
            battleContainer.style.backgroundPosition = 'center';
        }
    }

    // Start battle
    battleManager.startBattle(heroData, enemyData);
    
    // Initialize hero sprite animation
    setTimeout(() => {
        initializeHeroSprite();
    }, 100);
}

// Expose globally for testing
window.startTestBattle = startTestBattle;

// Add event listener to battle button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBattleButton);
} else {
    attachBattleButton();
}

function attachBattleButton() {
    // Wait a bit for the button to be rendered
    setTimeout(() => {
        const btn = document.getElementById('startBattleBtn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Battle button clicked via event listener!');
                startTestBattle();
            });
            console.log('Battle button event listener attached successfully');
        } else {
            console.warn('Start Battle button not found (this is normal if not in battle mode)');
        }
    }, 1000);
}




// ===================================
// DYNAMIC BATTLE SCALING FOR MOBILE
// ===================================

function adjustBattleScale() {
    const battle = document.querySelector(".battle-container");
    if (!battle) return;
    
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    
    // Keep within safe area for very small screens
    if (vw < 375) {
        const scale = vw / 420;
        battle.style.transform = `scale(${scale})`;
        battle.style.transformOrigin = "top center";
    } else {
        battle.style.transform = "scale(1)";
    }
}

// Initialize scaling on load and resize
window.addEventListener("resize", adjustBattleScale);
window.addEventListener("load", adjustBattleScale);

// Also call when battle starts
const originalStartBattle = window.battleManager?.startBattle;
if (originalStartBattle && window.battleManager) {
    window.battleManager.startBattle = function(...args) {
        const result = originalStartBattle.apply(this, args);
        setTimeout(adjustBattleScale, 100);
        return result;
    };
}



// ===================================
// PROBABILITY-BASED BATTLE TRIGGER
// ===================================

/**
 * Unified battle trigger function with probability control
 * Only Quick Tasks and Regular Tasks can trigger battles
 * @param {string} sourceType - Either 'quickTask' or 'regularTask'
 */
function maybeTriggerBattle(sourceType) {
    // Check if Battle Mode is enabled
    if (window.battleModeEnabled === false) {
        console.log('⚙️ Battle Mode is OFF — skipping encounter.');
        return false;
    }
    
    // Safeguard: Check if Battle Manager is initialized
    if (!window.battleManager || !window.battleManager.initialized) {
        console.warn('⚠️ Battle Manager not initialized – skipping battle trigger');
        return false;
    }
    
    let chance = 0;
    
    if (sourceType === 'quickTask') {
        chance = 0.20; // 20% probability for quick tasks
    } else if (sourceType === 'regularTask') {
        chance = 0.25; // 25% probability for regular tasks (reduced from 50%)
    } else {
        // Any other source should never trigger battle
        console.log(`🚫 Battle trigger blocked for source: ${sourceType}`);
        return false;
    }
    
    // Roll the dice
    const roll = Math.random();
    console.log(`🎲 Battle probability check: ${(chance * 100)}% chance, rolled ${(roll * 100).toFixed(1)}%`);
    
    if (roll < chance) {
        console.log('⚔️ Battle triggered!');
        startTestBattle();
        return true; // Battle was triggered
    } else {
        console.log('✨ No battle this time');
        return false; // No battle triggered
    }
}

// Expose globally for use in index.html
window.maybeTriggerBattle = maybeTriggerBattle;



// ========================================
// ANIMATION PRELOADING
// ========================================

/**
 * Preload all skin animations to prevent flicker
 * Call this when battle starts
 */
function preloadSkinAnimations(appearance) {
    if (!appearance || !appearance.isSkin) {
        return; // Only preload for skins
    }
    
    const animations = ['idle', 'attack', 'hurt', 'death', 'walk', 'jump', 'throw'];
    const preloadedImages = [];
    
    animations.forEach(animType => {
        const animPath = appearance.animations?.[animType];
        if (animPath) {
            const img = new Image();
            img.src = animPath;
            preloadedImages.push(img);
            console.log(`[Battle] Preloading ${animType} animation:`, animPath);
        }
    });
    
    return preloadedImages;
}

// Export to global scope
window.preloadSkinAnimations = preloadSkinAnimations;

console.log('✅ Animation preloading system loaded');

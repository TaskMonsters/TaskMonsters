// Battle System Initialization

// Arena rotation system
const ARENA_POOL = [
    'assets/backgrounds/forest-road.png',
    'assets/backgrounds/mountain-dusk.png',
    'assets/backgrounds/temple-arena.png',
    'assets/backgrounds/themes/castle.png',
    'assets/backgrounds/themes/city.png',
    'assets/backgrounds/themes/forest.png',
    'assets/backgrounds/themes/graveyard.png',
    'assets/backgrounds/themes/underwater.png',
    'assets/backgrounds/themes/space.png',
    'assets/backgrounds/themes/synth-city.png'
];

let currentArenaIndex = 0;
let battlesSinceArenaChange = 0;
const BATTLES_PER_ARENA = 5;

function getNextArenaBackground() {
    if (!ARENA_POOL || ARENA_POOL.length === 0) return null;
    
    // Increment battle counter
    battlesSinceArenaChange++;
    
    // Only rotate arena every 5 battles
    if (battlesSinceArenaChange >= BATTLES_PER_ARENA) {
        currentArenaIndex = (currentArenaIndex + 1) % ARENA_POOL.length;
        battlesSinceArenaChange = 0;
        console.log(`[Arena] Rotating to NEW arena ${currentArenaIndex + 1}/${ARENA_POOL.length}: ${ARENA_POOL[currentArenaIndex]}`);
    } else {
        console.log(`[Arena] Keeping current arena (${battlesSinceArenaChange}/${BATTLES_PER_ARENA} battles): ${ARENA_POOL[currentArenaIndex]}`);
    }
    
    return ARENA_POOL[currentArenaIndex];
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
    
    // FIX: Increase sprite size in battle mode to match screenshot
    // Skins keep their own dimensions, default monsters get larger scale
    heroSprite.style.width = '32px';
    heroSprite.style.height = '32px';
    
    // Check if skin is equipped - skins retain their own scale
    const isSkinEquipped = appearance && appearance.isSkin;
    if (isSkinEquipped) {
        heroSprite.style.transform = 'scale(1.5)'; // Keep skin size unchanged
    } else {
        heroSprite.style.transform = 'scale(3.0)'; // Increase default monster size
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
    }
    
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
        
        animations = {
            idle: { frames: skin.frameCount.idle || 4, width: (skin.frameCount.idle || 4) * frameWidth, sprite: skin.animations.idle, speed: 200 },
            attack1: { frames: skin.frameCount.attack || 4, width: (skin.frameCount.attack || 4) * frameWidth, sprite: skin.animations.attack, speed: 150 },
            'walk-attack': { frames: skin.frameCount.walk || 6, width: (skin.frameCount.walk || 6) * frameWidth, sprite: skin.animations.walk, speed: 150 },
            throw: { frames: skin.frameCount.attack || 4, width: (skin.frameCount.attack || 4) * frameWidth, sprite: skin.animations.attack, speed: 150 },
            jump: { frames: skin.frameCount.jump || 4, width: (skin.frameCount.jump || 4) * frameWidth, sprite: skin.animations.jump || skin.animations.idle, speed: 100 },
            hurt: { frames: skin.frameCount.hurt || 2, width: (skin.frameCount.hurt || 2) * frameWidth, sprite: skin.animations.hurt, speed: 150 },
            death: { frames: skin.frameCount.death || 4, width: (skin.frameCount.death || 4) * frameWidth, sprite: skin.animations.death, speed: 150 }
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
        // Use absolute fallback
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
    // FIX: Increase sprite size in battle mode to match screenshot
    // Skins keep their own dimensions, default monsters get larger scale
    heroSprite.style.width = '32px';
    heroSprite.style.height = '32px';
    
    // Check if skin is equipped - skins retain their own scale
    const isSkinEquipped = appearance && appearance.isSkin;
    if (isSkinEquipped) {
        heroSprite.style.transform = 'scale(1.5)'; // Keep skin size unchanged
    } else {
        heroSprite.style.transform = 'scale(3.0)'; // Increase default monster size
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
    let baseDamage;
    if (level >= 15) {
        baseDamage = 13 + Math.floor((level - 15) / 5); // Grows every 5 levels after 15
    } else if (level >= 10) {
        baseDamage = 10 + Math.floor((level - 10) / 3); // Grows every 3 levels after 10
    } else {
        baseDamage = 6 + Math.floor(level / 3);  // Grows every 3 levels
    }
    
    const heroData = {
        hp: gameState.health || 100,
        maxHP: 100,
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
        enemyData = createRandomEnemy(playerLevel);
        
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
        return;
    }
    
    // Safeguard: Check if Battle Manager is initialized
    if (!window.battleManager || !window.battleManager.initialized) {
        console.warn('⚠️ Battle Manager not initialized – skipping battle trigger');
        return;
    }
    
    let chance = 0;
    
    if (sourceType === 'quickTask') {
        chance = 0.20; // 20% probability for quick tasks
    } else if (sourceType === 'regularTask') {
        chance = 0.50; // 50% probability for regular tasks
    } else {
        // Any other source should never trigger battle
        console.log(`🚫 Battle trigger blocked for source: ${sourceType}`);
        return;
    }
    
    // Roll the dice
    const roll = Math.random();
    console.log(`🎲 Battle probability check: ${(chance * 100)}% chance, rolled ${(roll * 100).toFixed(1)}%`);
    
    if (roll < chance) {
        console.log('⚔️ Battle triggered!');
        startTestBattle();
    } else {
        console.log('✨ No battle this time');
    }
}

// Expose globally for use in index.html
window.maybeTriggerBattle = maybeTriggerBattle;


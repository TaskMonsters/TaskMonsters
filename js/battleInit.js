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

// Cache the hero appearance for the entire battle to prevent skin reversion
let cachedBattleAppearance = null;

/**
 * Get active hero appearance with robust fallback
 * Returns skin animations if equipped, otherwise default monster animations
 */
function getActiveHeroAppearance() {
    const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
    const equippedSkinId = window.gameState ? window.gameState.equippedSkinId : null;
    
    // Default frame counts for fallback
    const defaultFrameCount = {
        idle: 4,
        walk: 4,
        attack: 4,
        jump: 8,
        hurt: 4,
        death: 8
    };
    
    // Try to use skin if equipped
    if (equippedSkinId && window.SKINS_CONFIG && window.SKINS_CONFIG[equippedSkinId]) {
        const skin = window.SKINS_CONFIG[equippedSkinId];
        
        // CRITICAL FIX: Ensure frameCount always exists with valid defaults
        const frameCount = skin.frameCount ? {
            idle: skin.frameCount.idle || 4,
            walk: skin.frameCount.walk || 4,
            attack: skin.frameCount.attack || 4,
            jump: skin.frameCount.jump || 8,
            hurt: skin.frameCount.hurt || 4,
            death: skin.frameCount.death || 8
        } : defaultFrameCount;
        
        return {
            animations: skin.animations || {},
            frameCount: frameCount,
            spriteSize: skin.spriteSize || { width: 32, height: 32 },
            spriteRow: skin.spriteRow || 0,
            animationRows: skin.animationRows || {},
            isSkin: true,
            skinId: equippedSkinId
        };
    }
    
    // Fallback to default monster - USE GIF FILES
    const defaultMonsterMap = {
        luna: 'Luna',
        benny: 'Benny',
        nova: 'Nova'
    };
    
    const prefix = defaultMonsterMap[baseMonsterId] || 'Nova';
    
    // Use GIF files for all animations (not sprite sheets)
    return {
        animations: {
            idle: `assets/heroes/${prefix}_idle.gif`,
            walk: `assets/heroes/${prefix}_idle.gif`,
            attack: `assets/heroes/${prefix}_attack.gif`,
            jump: `assets/heroes/${prefix}_jump.gif`,
            hurt: `assets/heroes/${prefix}_Hurt.gif`,
            death: `assets/heroes/${prefix}_Hurt.gif`
        },
        frameCount: { idle: 1, walk: 1, attack: 1, jump: 1, hurt: 1, death: 1 },
        spriteSize: { width: 32, height: 32 },
        spriteRow: 0,
        animationRows: {},
        isSkin: false,
        skinId: null,
        useGif: true  // Flag to indicate GIF-based animation
    };
}

/**
 * Render hero sprite with guaranteed visibility
 * Called at battle start to ensure hero is always visible
 * NOW USES IMG.SRC FOR GIF ANIMATIONS (not background-image sprite sheets)
 */
function renderHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found in DOM');
        return;
    }
    
    // Reset all sprite state
    heroSprite.className = 'sprite';
    heroSprite.style.cssText = '';
    
    // Cache the appearance at battle start to prevent skin reversion
    cachedBattleAppearance = getActiveHeroAppearance();
    const appearance = cachedBattleAppearance;
    console.log('[Battle] Hero appearance cached:', appearance);
    
    if (!appearance || !appearance.animations || !appearance.animations.idle) {
        console.error('[Battle] Unable to get valid hero appearance', { appearance });
        // Last resort fallback - use GIF
        heroSprite.src = 'assets/heroes/Nova_idle.gif';
    } else {
        // USE IMG.SRC FOR GIF ANIMATION - This is the key fix!
        heroSprite.src = appearance.animations.idle;
        console.log('[Battle] Setting hero sprite src to:', appearance.animations.idle);
    }
    
    // Style the img element - 300px (3x enemy size)
    heroSprite.style.width = '300px';
    heroSprite.style.height = '300px';
    heroSprite.style.objectFit = 'contain';
    heroSprite.style.imageRendering = 'pixelated';
    
    // Ensure visibility
    heroSprite.style.opacity = '1';
    heroSprite.style.visibility = 'visible';
    heroSprite.style.display = 'block';
    
    // Store animation paths for later use
    heroSprite.dataset.idleGif = appearance.animations.idle;
    heroSprite.dataset.attackGif = appearance.animations.attack || appearance.animations.idle;
    heroSprite.dataset.hurtGif = appearance.animations.hurt || appearance.animations.idle;
    heroSprite.dataset.deathGif = appearance.animations.death || appearance.animations.hurt || appearance.animations.idle;
    
    console.log('[Battle] Hero sprite rendered successfully with GIF:', heroSprite.src);
}

// Export to global scope
window.getActiveHeroAppearance = getActiveHeroAppearance;
window.renderHeroSprite = renderHeroSprite;

/**
 * Start hero animation - NOW USES GIF FILES
 * Simply swaps the img.src to the appropriate GIF for the animation type
 */
function startHeroAnimation(animationType = 'idle') {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found');
        return;
    }
    
    // Stop any existing animation interval (not needed for GIFs but keep for cleanup)
    if (heroAnimationInterval) {
        clearInterval(heroAnimationInterval);
        heroAnimationInterval = null;
    }
    
    // Ensure sprite is visible
    heroSprite.style.opacity = '1';
    heroSprite.style.visibility = 'visible';
    heroSprite.style.display = 'block';
    
    // Get the appropriate GIF from cached appearance (prevents skin reversion)
    const appearance = cachedBattleAppearance || getActiveHeroAppearance();
    let gifPath;
    
    // Map animation types to GIF paths
    switch(animationType) {
        case 'attack':
        case 'attack1':
        case 'throw':
        case 'special':
            gifPath = heroSprite.dataset.attackGif || appearance.animations.attack || appearance.animations.idle;
            break;
        case 'hurt':
            gifPath = heroSprite.dataset.hurtGif || appearance.animations.hurt || appearance.animations.idle;
            // Add flicker effect for hurt
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                heroSprite.style.opacity = heroSprite.style.opacity === '0.3' ? '1' : '0.3';
                flickerCount++;
                if (flickerCount >= 6) {
                    clearInterval(flickerInterval);
                    heroSprite.style.opacity = '1';
                }
            }, 100);
            break;
        case 'death':
            gifPath = heroSprite.dataset.deathGif || appearance.animations.death || appearance.animations.hurt || appearance.animations.idle;
            break;
        case 'jump':
            gifPath = appearance.animations.jump || appearance.animations.idle;
            break;
        default:
            gifPath = heroSprite.dataset.idleGif || appearance.animations.idle;
    }
    
    // Set the GIF source - this is all we need for GIF animations!
    if (gifPath && heroSprite.src !== gifPath) {
        heroSprite.src = gifPath;
        console.log('[Battle] Hero animation changed to:', animationType, gifPath);
    }
    
    // Ensure proper styling - 300px (3x enemy size)
    heroSprite.style.width = '300px';
    heroSprite.style.height = '300px';
    heroSprite.style.objectFit = 'contain';
    heroSprite.style.imageRendering = 'pixelated';
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
window.cachedBattleAppearance = cachedBattleAppearance;

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

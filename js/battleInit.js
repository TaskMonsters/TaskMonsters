// Battle System Initialization

// Hero Sprite Animation System
let heroAnimationInterval = null;
let heroCurrentFrame = 0;
let heroTotalFrames = 4;
let heroFrameWidth = 32;

function startHeroAnimation(animationType = 'idle') {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) return;
    
    // Stop any existing animation
    if (heroAnimationInterval) {
        clearInterval(heroAnimationInterval);
    }
    
    // Get current monster sprite prefix
    const spritePrefix = localStorage.getItem('heroSpritePrefix') || 'Pink_Monster';
    
    // Set animation parameters based on type
    const animations = {
        idle: { frames: 4, width: 128, sprite: `${spritePrefix}_Idle_4.png`, speed: 200 },
        attack1: { frames: 4, width: 128, sprite: `${spritePrefix}_Attack1_4.png`, speed: 150 },
        'walk-attack': { frames: 6, width: 192, sprite: `${spritePrefix}_Walk+Attack_6.png`, speed: 150 },
        throw: { frames: 4, width: 128, sprite: `${spritePrefix}_Throw_4.png`, speed: 150 },
        jump: { frames: 8, width: 256, sprite: `${spritePrefix}_Jump_8.png`, speed: 100 },
        hurt: { frames: 4, width: 128, sprite: `${spritePrefix}_Hurt_4.png`, speed: 150 },
        death: { frames: 8, width: 256, sprite: `${spritePrefix}_Death_8.png`, speed: 150 }
    };
    
    const anim = animations[animationType] || animations.idle;
    heroTotalFrames = anim.frames;
    heroFrameWidth = anim.width / anim.frames;
    heroCurrentFrame = 0;
    
    // Set sprite image and size
    heroSprite.style.backgroundImage = `url('assets/heroes/${anim.sprite}')`;
    heroSprite.style.backgroundSize = `${anim.width}px 32px`;
    heroSprite.style.width = '32px';
    heroSprite.style.height = '32px';
    heroSprite.style.transform = 'scale(2.5)';
    heroSprite.style.imageRendering = 'pixelated';
    
    // Animate frames
    heroAnimationInterval = setInterval(() => {
        heroCurrentFrame = (heroCurrentFrame + 1) % heroTotalFrames;
        const xPos = -(heroCurrentFrame * heroFrameWidth);
        heroSprite.style.backgroundPosition = `${xPos}px 0`;
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
        startHeroAnimation('idle');
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
        
        // Set boss arena background
        const arenaBackground = getBossArenaBackground(gameState.bossCount);
        const battleArena = document.getElementById('battleArena');
        if (battleArena) {
            battleArena.style.backgroundImage = `url('${arenaBackground}')`;
            battleArena.style.backgroundSize = 'cover';
            battleArena.style.backgroundPosition = 'center';
        }
        
        saveGameState();
    } else {
        // Create regular enemy
        enemyData = createRandomEnemy(playerLevel);
        
        // Reset to default arena for regular battles
        const battleArena = document.getElementById('battleArena');
        if (battleArena) {
            battleArena.style.backgroundImage = '';
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
            console.error('Start Battle button not found');
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


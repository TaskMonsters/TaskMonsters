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

// Enemy Animation System
let enemyAnimationInterval = null;
let enemyCurrentFrame = 0;
let enemyTotalFrames = 8;
let enemyFrameWidth = 34;

function startEnemyAnimation(enemyName, animationType = 'idle') {
    const enemySprite = document.getElementById('enemySprite');
    if (!enemySprite) return;
    
    // Stop any existing animation
    if (enemyAnimationInterval) {
        clearInterval(enemyAnimationInterval);
    }
    
    // Enemy animation configurations (updated with actual sprite dimensions)
    const enemyAnimations = {
        'Bunny': {
            idle: { frames: 8, width: 272, height: 44, sprite: 'Bunny/Idle (34x44).png', speed: 150 },
            run: { frames: 8, width: 272, height: 44, sprite: 'Bunny/Run (34x44).png', speed: 100 },
            hurt: { frames: 4, width: 136, height: 44, sprite: 'Bunny/Hit (34x44).png', speed: 150 }
        },
        'Ogre': {
            idle: { frames: 12, width: 576, height: 80, sprite: 'Ogre/Spritesheets/ogre-idle.png', speed: 150 },
            attack: { frames: 21, width: 1008, height: 80, sprite: 'Ogre/Spritesheets/ogre-attack.png', speed: 80 },
            hurt: { frames: 12, width: 576, height: 80, sprite: 'Ogre/Spritesheets/ogre-idle.png', speed: 150 }
        },
        'Medusa': {
            idle: { frames: 1, width: 32, height: 32, sprite: 'Medusa/frame1.png', speed: 150 },
            attack: { frames: 7, width: 224, height: 32, sprite: 'Medusa/Medusa Attack Explosion/spritesheet.png', speed: 100 },
            hurt: { frames: 1, width: 32, height: 32, sprite: 'Medusa/frame2.png', speed: 150 }
        },
        'Fire Skull': {
            idle: { frames: 6, width: 216, height: 70, sprite: 'Fire Skull/Spritesheets/fire-skull-no-fire.png', speed: 150 },
            attack: { frames: 8, width: 768, height: 112, sprite: 'Fire Skull/Spritesheets/fire-skull.png', speed: 100 },
            hurt: { frames: 6, width: 216, height: 70, sprite: 'Fire Skull/Spritesheets/fire-skull-no-fire.png', speed: 150 }
        },
        'Treant': {
            idle: { 
                frames: 4, 
                width: 80, 
                height: 84, 
                frameFiles: ['Treant/Treant1.png', 'Treant/Treant2.png', 'Treant/Treant3.png', 'Treant/Treant4.png'],
                speed: 200 
            },
            attack: { frames: 1, width: 25, height: 25, sprite: 'Treant/Treant Attack 2.png', speed: 150 },
            hurt: { frames: 1, width: 80, height: 84, sprite: 'Treant/Treant2.png', speed: 150 }
        },
        'Octopus': {
            idle: { frames: 1, width: 28, height: 37, sprite: 'Octopus/octopus-1.png', speed: 150 },
            attack: { frames: 3, width: 78, height: 32, sprite: 'Octopus/Octopus Attack/spritesheet.png', speed: 120 },
            hurt: { frames: 1, width: 28, height: 37, sprite: 'Octopus/octopus-2.png', speed: 150 }
        },
        'Lazy Bat': {
            idle: { frames: 9, width: 576, height: 64, sprite: 'Lazy Bat/Bat-IdleFly.png', speed: 150 },
            attack: { frames: 9, width: 576, height: 64, sprite: 'Lazy Bat/Bat-Attack1.png', speed: 120 },
            hurt: { frames: 9, width: 576, height: 64, sprite: 'Lazy Bat/Bat-Hurt.png', speed: 150 }
        },
        'Drone': {
            idle: { 
                frames: 4, 
                width: 55, 
                height: 52, 
                frameFiles: ['Drone/drone-1.png', 'Drone/drone-2.png', 'Drone/drone-3.png', 'Drone/drone-4.png'],
                speed: 150 
            },
            attack: { frames: 1, width: 60, height: 11, sprite: 'Drone/Drone Attack.png', speed: 120 },
            hurt: { frames: 1, width: 55, height: 52, sprite: 'Drone/drone-2.png', speed: 150 }
        },
        'Robot': {
            idle: { 
                frames: 2, 
                width: 22, 
                height: 24, 
                frameFiles: ['Robot/enemy1.png', 'Robot/enemy2.png'],
                speed: 150 
            },
            attack: { frames: 1, width: 48, height: 32, sprite: 'Robot/Robot Attack.png', speed: 120 },
            hurt: { frames: 1, width: 22, height: 24, sprite: 'Robot/enemy2.png', speed: 150 }
        },
        'Slime': {
            idle: { frames: 4, width: 472, height: 79, sprite: 'Slime II/slime-sheet.png', speed: 150 },
            attack: { frames: 3, width: 78, height: 32, sprite: 'Slime II/Slime II Attack/spritesheet.png', speed: 120 },
            hurt: { frames: 4, width: 472, height: 79, sprite: 'Slime II/slime-sheet.png', speed: 150 }
        },
        'Alien Walking': {
            idle: { frames: 4, width: 192, height: 48, sprite: 'Alien Walking Enemy/Spritesheets/alien-enemy-idle.png', speed: 150 },
            walk: { frames: 6, width: 342, height: 42, sprite: 'Alien Walking Enemy/Spritesheets/alien-enemy-walk.png', speed: 120 }
        },
        'Alien Flying': {
            idle: { frames: 8, width: 664, height: 64, sprite: 'Alien Flying Enemy/spritesheet.png', speed: 150 }
        }
    };
    
    // Get animation config for this enemy
    const enemyConfig = enemyAnimations[enemyName];
    if (!enemyConfig) {
        console.warn(`No animation config for enemy: ${enemyName}`);
        return;
    }
    
    const anim = enemyConfig[animationType] || enemyConfig.idle;
    enemyTotalFrames = anim.frames;
    enemyCurrentFrame = 0;
    enemyFrameWidth = anim.width / anim.frames;
    
    // Clear any existing styles and classes
    enemySprite.className = 'sprite';
    enemySprite.style.backgroundRepeat = 'no-repeat';
    enemySprite.style.imageRendering = 'pixelated';
    
        // Calculate scale to match hero size (hero is ~80px tall after scaling)
        const targetHeight = 80;
        let scale = targetHeight / anim.height;
        
        // Fix for Lazy Bat: ensure a minimum scale of 2.5 to prevent it from being too small
        if (enemyName === 'Lazy Bat' && scale < 2.5) {
            scale = 2.5;
        }
    
    // Check if using individual frame files or spritesheet
    if (anim.frameFiles) {
        // Individual frame files mode
        enemySprite.style.width = `${anim.width}px`;
        enemySprite.style.height = `${anim.height}px`;
        enemySprite.style.backgroundSize = 'contain';
        enemySprite.style.backgroundPosition = 'center';
        enemySprite.style.transform = `scale(${scale})`;
        
        // Set initial frame
        enemySprite.style.backgroundImage = `url('assets/enemies/${anim.frameFiles[0]}')`;
        
        // Animate by switching frame files
        enemyAnimationInterval = setInterval(() => {
            enemyCurrentFrame = (enemyCurrentFrame + 1) % enemyTotalFrames;
            enemySprite.style.backgroundImage = `url('assets/enemies/${anim.frameFiles[enemyCurrentFrame]}')`;
        }, anim.speed);
    } else {
        // Spritesheet mode - EXACTLY like hero animation
        enemySprite.style.backgroundImage = `url('assets/enemies/${anim.sprite}')`;
        enemySprite.style.backgroundSize = `${anim.width}px ${anim.height}px`;
        enemySprite.style.width = `${enemyFrameWidth}px`;  // Single frame width only
        enemySprite.style.height = `${anim.height}px`;
        enemySprite.style.transform = `scale(${scale})`;
        
        // Animate frames by changing background position
        enemyAnimationInterval = setInterval(() => {
            enemyCurrentFrame = (enemyCurrentFrame + 1) % enemyTotalFrames;
            const xPos = -(enemyCurrentFrame * enemyFrameWidth);
            enemySprite.style.backgroundPosition = `${xPos}px 0`;
        }, anim.speed);
    }
}

function stopEnemyAnimation() {
    if (enemyAnimationInterval) {
        clearInterval(enemyAnimationInterval);
        enemyAnimationInterval = null;
    }
}

// Export to global scope
window.startEnemyAnimation = startEnemyAnimation;
window.stopEnemyAnimation = stopEnemyAnimation;

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
    console.log('🔵 startTestBattle called!');
    
    // Check if Battle Mode is enabled
    if (window.battleModeEnabled === false) {
        console.log('⚙️ Battle Mode is OFF — skipping encounter.');
        return;
    }
    
    // Wait for battleManager to be initialized with retry mechanism
    if (!window.battleManager) {
        console.warn('⏳ Battle Manager not yet initialized, waiting...');
        
        // Retry up to 10 times with 100ms delay
        let retryCount = 0;
        const maxRetries = 10;
        
        const checkBattleManager = setInterval(() => {
            retryCount++;
            console.log(`🔄 Retry ${retryCount}/${maxRetries} - Checking for battleManager...`);
            
            if (window.battleManager) {
                console.log('✅ Battle Manager found! Starting battle...');
                clearInterval(checkBattleManager);
                // Call the actual battle start logic
                startBattleInternal();
            } else if (retryCount >= maxRetries) {
                console.error('❌ Battle Manager not initialized after ' + maxRetries + ' retries!');
                clearInterval(checkBattleManager);
            }
        }, 100);
        
        return;
    }
    
    // If battleManager exists, start immediately
    startBattleInternal();
}

// Internal function that contains the actual battle start logic
function startBattleInternal() {
    if (!window.battleManager) {
        console.error('❌ Battle Manager not initialized!');
        return;
    }
    
    console.log('✅ Battle Manager is ready! Starting battle...')

    // Create hero data from gameState
    const level = gameState.jerryLevel || 1;
    
    // Level-based attack damage scaling with non-linear curve (P1: QA Report)
    // Uses exponential curve for more impactful progression at higher tiers
    const baseAttack = 15;
    
    // Non-linear scaling curve: starts similar to linear but accelerates at higher levels
    // Formula: baseAttack * (1 + (level - 1) * 0.08 + Math.pow((level - 1) / 50, 1.5) * 0.5)
    const linearComponent = (level - 1) * 0.08; // Reduced from 0.1 to 0.08
    const exponentialComponent = Math.pow((level - 1) / 50, 1.5) * 0.5; // Exponential growth
    const levelScale = 1 + linearComponent + exponentialComponent;
    let baseDamage = Math.floor(baseAttack * levelScale);
    
    // Examples with new curve:
    // Level 1:  15 damage (1.00x) - Same as before
    // Level 5:  18 damage (1.20x) - Slightly slower early game
    // Level 10: 22 damage (1.47x) - Still reasonable
    // Level 20: 33 damage (2.20x) - Starts accelerating
    // Level 30: 46 damage (3.07x) - Noticeable power
    // Level 50: 88 damage (5.87x) - Dramatic late game power
    
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
    
    // Use new enemy tier system if available
    if (window.ENEMY_TIER_SYSTEM) {
        enemyData = window.ENEMY_TIER_SYSTEM.selectEnemy(playerLevel);
        
        // Set background based on tier
        if (window.battleBackgroundSystem) {
            window.battleBackgroundSystem.setBackground(playerLevel, enemyData.tier);
        }
        
        // Track boss count for boss enemies
        if (enemyData.tier === 'boss') {
            if (!gameState.bossCount) {
                gameState.bossCount = 0;
            }
            gameState.bossCount++;
            saveGameState();
        }
    } else {
        // Fallback to old system
        if (isBossLevel(playerLevel)) {
            enemyData = createBossEnemy(playerLevel);
            
            if (!gameState.bossCount) {
                gameState.bossCount = 0;
            }
            gameState.bossCount++;
            
            const arenaBackground = getBossArenaBackground(gameState.bossCount);
            const battleArena = document.getElementById('battleArena');
            if (battleArena) {
                battleArena.style.backgroundImage = `url('${arenaBackground}')`;
                battleArena.style.backgroundSize = 'cover';
                battleArena.style.backgroundPosition = 'center';
            }
            
            saveGameState();
        } else {
            enemyData = createRandomEnemy(playerLevel);
            
            const battleArena = document.getElementById('battleArena');
            if (battleArena) {
                battleArena.style.backgroundImage = '';
            }
        }
    }

    // Start battle
    console.log('⚔️ Calling battleManager.startBattle with:', { heroData, enemyData });
    try {
        battleManager.startBattle(heroData, enemyData);
        console.log('✅ battleManager.startBattle called successfully!');
    } catch(error) {
        console.error('❌ Error calling battleManager.startBattle:', error);
        return;
    }
    
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


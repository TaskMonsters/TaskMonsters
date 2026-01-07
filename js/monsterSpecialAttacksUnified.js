// ========================================
// UNIFIED MONSTER SPECIAL ATTACK SYSTEM
// ========================================
// Handles special attacks for Nova, Benny, and Luna
// Implements per-monster behavior (projectile-only vs melee-drag)

// Monster special attack configuration
const MONSTER_SPECIAL_CONFIG = {
    nova: {
        name: 'Energy Blast',
        type: 'projectile', // Projectile-only, no enemy movement
        damage: 25, // FIX: Reduced from 40 to 25 base damage
        effect: 'poison', // FIX: Added poison effect for 2 HP/turn for 3 turns
        poisonDamage: 2,
        poisonTurns: 3,
        frames: [
            // FIX: Updated to use new Nova projectile animation
            'assets/projectiles/nova_special/_0000_Layer-1.png',
            'assets/projectiles/nova_special/_0001_Layer-2.png',
            'assets/projectiles/nova_special/_0002_Layer-3.png',
            'assets/projectiles/nova_special/_0003_Layer-4.png',
            'assets/projectiles/nova_special/_0004_Layer-5.png',
            'assets/projectiles/nova_special/_0005_Layer-6.png',
            'assets/projectiles/nova_special/_0006_Layer-7.png',
            'assets/projectiles/nova_special/_0007_Layer-8.png'
        ],
        color: '#ff69b4',
        displayName: 'ENERGY BLAST'
    },
    benny: {
        name: 'Stunning Strike',
        type: 'projectile', // FIX: Changed to projectile-only, no enemy drag
        damage: 20,
        effect: 'life_absorption',
        frames: [
            'assets/special-attacks/benny/_0000_Layer-1.png',
            'assets/special-attacks/benny/_0001_Layer-2.png',
            'assets/special-attacks/benny/_0002_Layer-3.png',
            'assets/special-attacks/benny/_0003_Layer-4.png',
            'assets/special-attacks/benny/_0004_Layer-5.png',
            'assets/special-attacks/benny/_0005_Layer-6.png'
        ],
        color: '#64c8ff',
        displayName: 'STUNNING STRIKE'
    },
    luna: {
        name: 'Chaos Curse',
        type: 'projectile', // Projectile-only, no enemy movement
        damage: 0,
        effect: 'reflect',
        frames: [
            'assets/special-attacks/luna/_0000_Layer-1.png',
            'assets/special-attacks/luna/_0001_Layer-2.png',
            'assets/special-attacks/luna/_0002_Layer-3.png',
            'assets/special-attacks/luna/_0003_Layer-4.png',
            'assets/special-attacks/luna/_0004_Layer-5.png'
        ],
        color: '#a855f7',
        displayName: 'CHAOS CURSE'
    }
};

/**
 * Get battle element positions relative to arena
 */
function getBattlePositions() {
    const battleArena = document.querySelector('.battle-container');
    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    
    if (!battleArena || !heroSprite || !enemySprite) {
        console.error('❌ Battle elements not found');
        return null;
    }
    
    const arenaRect = battleArena.getBoundingClientRect();
    const heroRect = heroSprite.getBoundingClientRect();
    const enemyRect = enemySprite.getBoundingClientRect();
    
    return {
        arena: battleArena,
        hero: {
            x: heroRect.left - arenaRect.left + heroRect.width / 2,
            y: heroRect.top - arenaRect.top + heroRect.height / 2
        },
        enemy: {
            x: enemyRect.left - arenaRect.left + enemyRect.width / 2,
            y: enemyRect.top - arenaRect.top + enemyRect.height / 2
        },
        enemyElement: enemySprite
    };
}

/**
 * Play projectile-only special attack (Nova, Luna)
 */
async function playProjectileSpecialAttack(monsterType, positions, config) {
    console.log(`🌟 ${config.displayName} - Projectile Attack`);
    
    // Validate positions
    if (!positions || !positions.arena || !positions.hero || !positions.enemy) {
        console.error('❌ Invalid positions for projectile attack');
        return;
    }
    
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.style.cssText = `
        position: absolute;
        width: 120px;
        height: 120px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 9999;
        filter: drop-shadow(0 0 20px ${config.color});
        pointer-events: none;
        left: ${positions.hero.x - 60}px;
        top: ${positions.hero.y - 60}px;
    `;
    positions.arena.appendChild(projectile);
    
    // Show attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = config.displayName;
    nameDisplay.style.cssText = `
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        color: ${config.color};
        font-size: 42px;
        font-weight: bold;
        text-shadow: 0 0 20px ${config.color}, 0 0 40px ${config.color};
        z-index: 10000;
        pointer-events: none;
        animation: fadeOut 1.5s ease-out forwards;
    `;
    positions.arena.appendChild(nameDisplay);
    
    // Animate projectile from hero to enemy
    const duration = 1800;
    const startTime = Date.now();
    
    return new Promise((resolve) => {
        function animate() {
            try {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Cycle through frames with error handling
                const frameIndex = Math.floor((elapsed / 200) % config.frames.length);
                if (config.frames && config.frames[frameIndex]) {
                    projectile.style.backgroundImage = `url('${config.frames[frameIndex]}')`;
                }
                
                // Move from hero to enemy
                const currentX = positions.hero.x + (positions.enemy.x - positions.hero.x) * progress - 60;
                const currentY = positions.hero.y + (positions.enemy.y - positions.hero.y) * progress - 60;
                projectile.style.left = currentX + 'px';
                projectile.style.top = currentY + 'px';
                
                // Scale up as it travels
                const scale = 1 + progress * 0.5;
                projectile.style.transform = `scale(${scale})`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Impact effect with cleanup error handling
                    projectile.style.filter = `brightness(2) drop-shadow(0 0 40px ${config.color})`;
                    setTimeout(() => {
                        try {
                            if (projectile && projectile.parentNode) projectile.remove();
                            if (nameDisplay && nameDisplay.parentNode) nameDisplay.remove();
                        } catch (e) {
                            console.error('Error cleaning up projectile animation:', e);
                        }
                        resolve();
                    }, 250);
                }
            } catch (e) {
                console.error('Error in projectile animation loop:', e);
                // Ensure animation completes even on error
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
        }
        requestAnimationFrame(animate);
    });
}

/**
 * Play melee-drag special attack (Benny only)
 * Enemy sprite moves toward hero during attack
 */
async function playMeleeDragSpecialAttack(monsterType, positions, config) {
    console.log(`💨 ${config.displayName} - Melee Drag Attack`);
    
    // Validate positions
    if (!positions || !positions.arena || !positions.hero || !positions.enemy || !positions.enemyElement) {
        console.error('❌ Invalid positions for melee drag attack');
        return;
    }
    
    const enemySprite = positions.enemyElement;
    
    // Store original enemy position
    const originalLeft = enemySprite.style.left || '';
    const originalTransform = enemySprite.style.transform || '';
    
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.style.cssText = `
        position: absolute;
        width: 100px;
        height: 100px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 9999;
        filter: drop-shadow(0 0 18px ${config.color});
        pointer-events: none;
        left: ${positions.hero.x - 50}px;
        top: ${positions.hero.y - 50}px;
    `;
    positions.arena.appendChild(projectile);
    
    // Show attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = config.displayName;
    nameDisplay.style.cssText = `
        position: absolute;
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
        color: ${config.color};
        font-size: 40px;
        font-weight: bold;
        text-shadow: 0 0 18px ${config.color}, 0 0 35px ${config.color};
        z-index: 10000;
        pointer-events: none;
        animation: fadeOut 1.5s ease-out forwards;
    `;
    positions.arena.appendChild(nameDisplay);
    
    // Animate projectile AND drag enemy
    const duration = 1800;
    const startTime = Date.now();
    
    // Calculate enemy drag distance (move 30% toward hero)
    const dragDistance = (positions.enemy.x - positions.hero.x) * 0.3;
    
    return new Promise((resolve) => {
        function animate() {
            try {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Cycle through frames with error handling
                const frameIndex = Math.floor((elapsed / 200) % config.frames.length);
                if (config.frames && config.frames[frameIndex]) {
                    projectile.style.backgroundImage = `url('${config.frames[frameIndex]}')`;
                }
                
                // Move projectile from hero to enemy
                const currentX = positions.hero.x + (positions.enemy.x - positions.hero.x) * progress - 50;
                const currentY = positions.hero.y + (positions.enemy.y - positions.hero.y) * progress - 50;
                projectile.style.left = currentX + 'px';
                projectile.style.top = currentY + 'px';
                
                // Rotate and scale projectile
                const rotation = progress * 720;
                const scale = 1 + progress * 0.5;
                projectile.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                
                // DRAG ENEMY TOWARD HERO (Benny-specific behavior)
                const enemyDragProgress = Math.sin(progress * Math.PI); // Smooth in-out
                const enemyOffset = -dragDistance * enemyDragProgress;
                enemySprite.style.transform = `translateX(${enemyOffset}px)`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Impact effect
                    projectile.style.filter = `brightness(2) drop-shadow(0 0 35px ${config.color})`;
                    
                    // Return enemy to original position with error handling
                    setTimeout(() => {
                        try {
                            enemySprite.style.transform = originalTransform;
                            if (projectile && projectile.parentNode) projectile.remove();
                            if (nameDisplay && nameDisplay.parentNode) nameDisplay.remove();
                        } catch (e) {
                            console.error('Error cleaning up melee drag animation:', e);
                        }
                        resolve();
                    }, 250);
                }
            } catch (e) {
                console.error('Error in melee drag animation loop:', e);
                // Ensure animation completes even on error
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
        }
        requestAnimationFrame(animate);
    });
}

/**
 * Main function to play special attack based on monster type
 * Routes to projectile-only or melee-drag based on configuration
 */
async function playSpecialAttackForMonster(monsterType, heroElement, enemyElement) {
    console.log(`🎯 Playing special attack for: ${monsterType}`);
    
    const config = MONSTER_SPECIAL_CONFIG[monsterType];
    if (!config) {
        console.error(`Unknown monster type: ${monsterType}`);
        return;
    }
    
    const positions = getBattlePositions();
    if (!positions) return;
    
    // Route to appropriate attack type
    if (config.type === 'melee_drag') {
        // Benny: Melee with enemy drag
        await playMeleeDragSpecialAttack(monsterType, positions, config);
    } else if (config.type === 'projectile') {
        // Nova & Luna: Projectile-only, no enemy movement
        await playProjectileSpecialAttack(monsterType, positions, config);
    } else {
        console.error(`Unknown attack type: ${config.type}`);
    }
}

/**
 * Preload all special attack frames to ensure smooth animations
 */
function preloadSpecialAttackFrames() {
    console.log('🎨 Preloading special attack frames...');
    
    Object.keys(MONSTER_SPECIAL_CONFIG).forEach(monsterType => {
        const config = MONSTER_SPECIAL_CONFIG[monsterType];
        if (config.frames && Array.isArray(config.frames)) {
            config.frames.forEach(framePath => {
                const img = new Image();
                img.src = framePath;
                // Silently preload, no need to track completion
            });
        }
    });
    
    console.log('✅ Special attack frames preloaded');
}

// Preload frames when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadSpecialAttackFrames);
} else {
    preloadSpecialAttackFrames();
}

// Export to window
window.playSpecialAttackForMonster = playSpecialAttackForMonster;
window.MONSTER_SPECIAL_CONFIG = MONSTER_SPECIAL_CONFIG;
window.preloadSpecialAttackFrames = preloadSpecialAttackFrames;

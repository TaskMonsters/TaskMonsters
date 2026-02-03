/**
 * Enemy Animation System - GIF-based
 * Uses GIF animations with img.src for proper animated display
 * 
 * NOTE: Enemy class is defined in enemy.js
 * This file only handles animation playback
 */

// Play enemy animation using GIF files
function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        // Get the enemy sprite element (now an img tag)
        let spriteElement = document.getElementById('enemySprite');
        if (!spriteElement) {
            spriteElement = document.getElementById('battleEnemySprite');
        }
        
        if (!spriteElement || !enemy) {
            console.warn('[EnemyAnimation] Sprite element or enemy not found');
            resolve();
            return;
        }
        
        // Check if enemy has config with assets (new BATTLE_ENEMIES system)
        let animationPath = null;
        if (enemy.config && enemy.config.assets) {
            // Use new BATTLE_ENEMIES config
            switch(animationKey) {
                case 'idle':
                    animationPath = enemy.config.assets.idle;
                    break;
                case 'attack1':
                case 'attack2':
                case 'attack':
                    animationPath = enemy.config.assets.attack || enemy.config.assets.idle;
                    break;
                case 'hurt':
                    animationPath = enemy.config.assets.hurt || enemy.config.assets.idle;
                    break;
                case 'death':
                case 'die':
                    animationPath = enemy.config.assets.die || enemy.config.assets.hurt || enemy.config.assets.idle;
                    break;
                default:
                    animationPath = enemy.config.assets.idle;
            }
        } else {
            // Fallback to mapped paths
            const enemyName = enemy.name;
            const enemyPaths = getEnemyPaths();
            animationPath = enemyPaths[enemyName] || `assets/enemies/${enemyName}/${enemyName}.gif`;
        }
        
        console.log('[EnemyAnimation] Playing', animationKey, 'animation:', animationPath);
        
        // USE IMG.SRC FOR GIF ANIMATION - This is the key fix!
        spriteElement.src = animationPath;
        
        // Add hurt flash effect for hurt animation
        if (animationKey === 'hurt') {
            spriteElement.classList.add('enemy-hurt-flash');
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                spriteElement.style.opacity = spriteElement.style.opacity === '0.3' ? '1' : '0.3';
                flickerCount++;
                if (flickerCount >= 6) {
                    clearInterval(flickerInterval);
                    spriteElement.style.opacity = '1';
                    spriteElement.classList.remove('enemy-hurt-flash');
                }
            }, 80);
        }
        
        // Resolve after duration
        setTimeout(() => {
            // Return to idle after animation completes (except for death)
            if (animationKey !== 'death' && animationKey !== 'die') {
                let idleAnimation = null;
                if (enemy.config && enemy.config.assets) {
                    idleAnimation = enemy.config.assets.idle;
                } else {
                    const enemyName = enemy.name;
                    const enemyPaths = getEnemyPaths();
                    idleAnimation = enemyPaths[enemyName] || `assets/enemies/${enemyName}/${enemyName}.gif`;
                }
                spriteElement.src = idleAnimation;
            }
            resolve();
        }, duration);
    });
}

// Helper function to get enemy paths mapping
function getEnemyPaths() {
    return {
        'Slime': 'assets/enemies/Slime Enemy/Slime Enemy.gif',
        'Treant': 'assets/enemies/Treant/Treant.gif',
        '2Face': 'assets/enemies/2Face/2Face Idle.gif',
        'Distraction Dragon': 'assets/enemies/Distraction Dragon/Distraction Dragon.gif',
        'Energy Vampire Bat': 'assets/enemies/Energy Vampire Bat/Energy Vampire Bat.gif',
        'Flying Procrastinator': 'assets/enemies/Flying Procrastinator/Flying Procrastinator.gif',
        'Ice Bully': 'assets/enemies/Ice Bully/idle.gif',
        'Land Alien': 'assets/enemies/Land Alien/alien-idle-animated.gif',
        'Lazy Bat': 'assets/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif',
        'Little Cthulhu': 'assets/enemies/Little Cthulhu/Little Cthulhu.gif',
        'Medusa': 'assets/enemies/Medusa/Medusa-animated.gif',
        'Mushroom Guard': 'assets/enemies/Mushroom Guard/Mushroom_Attack.gif',
        'Naughty Nova': 'assets/enemies/Naughty Nova/Naughty Nova Attack.gif',
        'Orc': 'assets/enemies/Orc/Orc-Attack.gif',
        'Overthinker': 'assets/enemies/Overthinker/OverthinkerEnemy.gif',
        'Self Doubt Drone': 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif',
        'Sentry Drone': 'assets/enemies/Sentry Drone/Sentry Drone.gif',
        'Slothful Ogre': 'assets/enemies/Slothful Ogre/ogre-idle.gif'
    };
}

// Initialize enemy sprite with idle animation
function initEnemySprite(enemy) {
    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement || !enemy) {
        console.warn('[EnemyAnimation] Cannot init enemy sprite - element or enemy missing');
        return;
    }
    
    console.log('[EnemyAnimation] Initializing enemy sprite for:', enemy.name);
    
    // Reset all styles first
    spriteElement.className = 'sprite';
    spriteElement.style.cssText = '';
    
    const enemyName = enemy.name;
    
    // Check if enemy has config with assets (new BATTLE_ENEMIES system)
    let idleGif = null;
    if (enemy.config && enemy.config.assets && enemy.config.assets.idle) {
        idleGif = enemy.config.assets.idle;
        console.log('[EnemyAnimation] Using config assets:', idleGif);
    } else {
        // Use mapped paths
        const enemyPaths = getEnemyPaths();
        idleGif = enemyPaths[enemyName] || `assets/enemies/${enemyName}/${enemyName}.gif`;
        console.log('[EnemyAnimation] Using mapped path:', idleGif);
    }
    
    // USE IMG.SRC FOR GIF ANIMATION - This is the key fix!
    spriteElement.src = idleGif;
    
    // Style the img element - larger size matching reference screenshot
    spriteElement.style.width = '100px';
    spriteElement.style.height = '100px';
    spriteElement.style.objectFit = 'contain';
    spriteElement.style.imageRendering = 'pixelated';
    
    // Ensure visibility
    spriteElement.style.opacity = '1';
    spriteElement.style.visibility = 'visible';
    spriteElement.style.display = 'block';
    
    // Store idle gif path for later use
    spriteElement.dataset.idleGif = idleGif;
    
    console.log('[EnemyAnimation] Enemy sprite initialized successfully with src:', idleGif);
}

// Export to global scope
window.playEnemyAnimation = playEnemyAnimation;
window.initEnemySprite = initEnemySprite;
window.getEnemyPaths = getEnemyPaths;

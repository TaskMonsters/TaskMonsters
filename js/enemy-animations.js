/**
 * Enemy Animation System - GIF-based
 * Uses GIF animations instead of sprite sheets for simplicity and reliability
 * 
 * NOTE: Enemy class is defined in enemy.js
 * This file only handles animation playback
 */

// Play enemy animation using GIF files
function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        // Try both possible sprite element IDs
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
                    animationPath = enemy.config.assets.attack;
                    break;
                case 'hurt':
                    animationPath = enemy.config.assets.hurt;
                    break;
                case 'death':
                case 'die':
                    animationPath = enemy.config.assets.die || enemy.config.assets.hurt;
                    break;
                default:
                    animationPath = enemy.config.assets.idle;
            }
        } else {
            // Fallback to old system
            const enemyName = enemy.name;
            const basePath = `assets/enemies/${enemyName}/`;
            
            switch(animationKey) {
                case 'idle':
                    animationPath = `${basePath}${enemyName}-IdleFly-animated.gif`;
                    break;
                case 'attack1':
                case 'attack2':
                case 'attack':
                    animationPath = `${basePath}${enemyName}-Attack-animated.gif`;
                    break;
                case 'hurt':
                    animationPath = `${basePath}${enemyName}-Hurt.gif`;
                    break;
                case 'death':
                case 'die':
                    animationPath = `${basePath}${enemyName}-Die.gif`;
                    break;
                default:
                    animationPath = `${basePath}${enemyName}-IdleFly-animated.gif`;
            }
        }
        
        console.log('[EnemyAnimation] Playing', animationKey, 'animation:', animationPath);
        
        // Set the animation using img src (not background image)
        spriteElement.src = animationPath;
        
        // Add hurt flash effect for hurt animation
        if (animationKey === 'hurt') {
            spriteElement.classList.add('enemy-hurt-flash');
            setTimeout(() => {
                spriteElement.classList.remove('enemy-hurt-flash');
            }, duration);
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
                    idleAnimation = `assets/enemies/${enemyName}/${enemyName}-IdleFly-animated.gif`;
                }
                spriteElement.src = idleAnimation;
            }
            resolve();
        }, duration);
    });
}

// Initialize enemy sprite with idle animation
function initEnemySprite(enemy) {
    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement || !enemy) return;
    
    const enemyName = enemy.name;
    
    // Map enemy names to their actual directory and file names
    const enemyPaths = {
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
        // 'Orc': removed from game
        'Overthinker': 'assets/enemies/Overthinker/OverthinkerEnemy.gif',
        'Self Doubt Drone': 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif',
        'Sentry Drone': 'assets/enemies/Sentry Drone/Sentry Drone.gif',
        'Slothful Ogre': 'assets/enemies/Slothful Ogre/ogre-idle.gif'
    };
    
    // Use mapped path if available, otherwise try the standard pattern
    const idleGif = enemyPaths[enemyName] || `assets/enemies/${enemyName}/${enemyName}-IdleFly-animated.gif`;
    
    spriteElement.style.backgroundImage = `url('${idleGif}')`;
    spriteElement.style.backgroundSize = 'contain';
    spriteElement.style.backgroundRepeat = 'no-repeat';
    spriteElement.style.backgroundPosition = 'center';
    spriteElement.style.width = '100px';
    spriteElement.style.height = '100px';
}

// Export to global scope
window.playEnemyAnimation = playEnemyAnimation;
window.initEnemySprite = initEnemySprite;

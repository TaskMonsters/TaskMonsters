/**
 * Enemy Animation System - GIF-based
 * Uses GIF animations with img.src for proper animated display
 * 
 * NOTE: Enemy class is defined in enemy.js
 * This file only handles animation playback
 */

// Complete enemy animation mappings (idle, attack, hurt, die)
function getEnemyAnimations() {
    return {
        'Lazy Bat': {
            idle: 'assets/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif',
            attack: 'assets/enemies/Lazy Bat/Lazy Bat-Attack-animated.gif',
            hurt: 'assets/enemies/Lazy Bat/Lazy Bat-Hurt.gif',
            die: null
        },
        'Flying Procrastinator': {
            idle: 'assets/enemies/Flying Procrastinator/Flying Procrastinator.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Medusa': {
            idle: 'assets/enemies/Medusa/Medusa-animated.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Distraction Dragon': {
            idle: 'assets/enemies/Distraction Dragon/Distraction Dragon.gif',
            attack: 'assets/enemies/Distraction Dragon/Distraction Dragon Attack.gif',
            hurt: null,
            die: null
        },
        'Treant': {
            idle: 'assets/enemies/Treant/Treant.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Naughty Nova': {
            idle: 'assets/enemies/Naughty Nova/Naughty Nova Attack.gif',
            attack: 'assets/enemies/Naughty Nova/Naughty Nova Attack.gif',
            hurt: null,
            die: null
        },
        'Mushroom Guard': {
            idle: 'assets/enemies/Mushroom Guard/Mushroom_Idle.gif',
            attack: 'assets/enemies/Mushroom Guard/Mushroom_Attack.gif',
            hurt: 'assets/enemies/Mushroom Guard/Mushroom_Hit.gif',
            die: null
        },
        '2Face': {
            idle: 'assets/enemies/2Face/2Face Idle.gif',
            attack: 'assets/enemies/2Face/2Face_Attack.gif',
            hurt: 'assets/enemies/2Face/2Face_Hurt.gif',
            die: null
        },
        'Slime': {
            idle: 'assets/enemies/Slime Enemy/Slime Enemy.gif',
            attack: 'assets/enemies/Slime Enemy/Slime Enemy Attack.gif',
            hurt: null,
            die: null
        },
        'Little Cthulhu': {
            idle: 'assets/enemies/Little Cthulhu/Little Cthulhu.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Ice Bully': {
            idle: 'assets/enemies/Ice Bully/idle.gif',
            attack: 'assets/enemies/Ice Bully/1_atk.gif',
            hurt: 'assets/enemies/Ice Bully/take_hit.gif',
            die: 'assets/enemies/Ice Bully/death.gif'
        },
        'Slothful Ogre': {
            idle: 'assets/enemies/Slothful Ogre/ogre-idle.gif',
            attack: 'assets/enemies/Slothful Ogre/ogre-attack.gif',
            hurt: null,
            die: null
        },
        'Energy Vampire Bat': {
            idle: 'assets/enemies/Energy Vampire Bat/Energy Vampire Bat.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Sentry Drone': {
            idle: 'assets/enemies/Sentry Drone/Sentry Drone.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Land Alien': {
            idle: 'assets/enemies/Land Alien/alien-idle-animated.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Orc': {
            idle: 'assets/enemies/Orc/Orc-Idle.gif',
            attack: 'assets/enemies/Orc/Orc-Attack.gif',
            hurt: 'assets/enemies/Orc/Orc-Hurt.gif',
            die: 'assets/enemies/Orc/Orc-Death.gif'
        },
        'Overthinker': {
            idle: 'assets/enemies/Overthinker/OverthinkerEnemy.gif',
            attack: null,
            hurt: null,
            die: null
        },
        'Self Doubt Drone': {
            idle: 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif',
            attack: null,
            hurt: null,
            die: null
        }
    };
}

// Legacy function for backward compatibility
function getEnemyPaths() {
    const animations = getEnemyAnimations();
    const paths = {};
    for (const [name, anims] of Object.entries(animations)) {
        paths[name] = anims.idle;
    }
    return paths;
}

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
        
        let animationPath = null;
        
        // Check if enemy has config with assets (new BATTLE_ENEMIES system)
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
            // Use complete animation mappings
            const enemyName = enemy.name;
            const enemyAnimations = getEnemyAnimations();
            const animations = enemyAnimations[enemyName];
            
            if (animations) {
                switch(animationKey) {
                    case 'idle':
                        animationPath = animations.idle;
                        break;
                    case 'attack1':
                    case 'attack2':
                    case 'attack':
                        animationPath = animations.attack || animations.idle;
                        break;
                    case 'hurt':
                        animationPath = animations.hurt || animations.idle;
                        break;
                    case 'death':
                    case 'die':
                        animationPath = animations.die || animations.hurt || animations.idle;
                        break;
                    default:
                        animationPath = animations.idle;
                }
            } else {
                // Ultimate fallback
                animationPath = `assets/enemies/${enemyName}/${enemyName}.gif`;
            }
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
                    const enemyAnimations = getEnemyAnimations();
                    const animations = enemyAnimations[enemyName];
                    idleAnimation = animations ? animations.idle : `assets/enemies/${enemyName}/${enemyName}.gif`;
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
    if (!spriteElement || !enemy) {
        console.warn('[EnemyAnimation] Cannot init enemy sprite - element or enemy missing');
        return;
    }
    
    console.log('[EnemyAnimation] Initializing enemy sprite for:', enemy.name);
    
    // Reset all styles first
    spriteElement.className = 'sprite';
    spriteElement.style.cssText = '';
    
    const enemyName = enemy.name;
    let idleGif = null;
    
    // Check if enemy has config with assets (new BATTLE_ENEMIES system)
    if (enemy.config && enemy.config.assets && enemy.config.assets.idle) {
        idleGif = enemy.config.assets.idle;
        console.log('[EnemyAnimation] Using config assets:', idleGif);
    } else {
        // Use complete animation mappings
        const enemyAnimations = getEnemyAnimations();
        const animations = enemyAnimations[enemyName];
        idleGif = animations ? animations.idle : `assets/enemies/${enemyName}/${enemyName}.gif`;
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
window.getEnemyAnimations = getEnemyAnimations;

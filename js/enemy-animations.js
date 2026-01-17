/**
 * Enemy Animation System - GIF-based
 * Uses GIF animations instead of sprite sheets for simplicity and reliability
 */

// Enemy class definition
class Enemy {
    constructor(name, baseHP, baseAttack, baseDefense, sprites) {
        this.name = name;
        this.baseHP = baseHP;
        this.baseAttack = baseAttack;
        this.baseDefense = baseDefense;
        this.sprites = sprites;

        // Current battle stats (will be scaled)
        this.maxHP = baseHP;
        this.hp = baseHP;
        this.attack = baseAttack;
        this.defense = baseDefense;

        this.currentSprite = sprites.idle;
    }

    // Scale stats based on player level
    scaleToLevel(playerLevel) {
        // Apply difficulty scaling if AI system available
        let scaling = { hpBonus: 0, healBonus: 0, defenseBonus: 0 };
        if (window.enemyAI) {
            scaling = window.enemyAI.getDifficultyScaling(playerLevel);
        }
        
        // Scale attack, defense, and HP based on player level
        this.attack = this.baseAttack + Math.floor(playerLevel * 2);
        this.defense = this.baseDefense + Math.floor(playerLevel * 1.5);
        this.maxHP = Math.floor((this.baseHP + playerLevel * 5) * (1 + scaling.hpBonus));
        this.hp = this.maxHP;
    }

    // Take damage
    takeDamage(amount) {
        // Check if enemy is defending (reduces damage by 50%)
        if (this.isDefending) {
            amount = Math.floor(amount * 0.5);
            this.isDefending = false; // Reset defense after hit
        }
        
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }

    // Update sprite
    setSprite(spriteKey) {
        if (this.sprites[spriteKey]) {
            this.currentSprite = this.sprites[spriteKey];
        }
    }
}

// Export Enemy class to global scope
window.Enemy = Enemy;

// Play enemy animation using GIF files
function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        const spriteElement = document.getElementById('enemySprite');
        if (!spriteElement || !enemy) {
            resolve();
            return;
        }
        
        // Get enemy name for file path
        const enemyName = enemy.name;
        const basePath = `assets/enemies/${enemyName}/`;
        
        // Map animation keys to GIF files
        let gifFile = '';
        
        switch(animationKey) {
            case 'idle':
                gifFile = `${enemyName}-IdleFly-animated.gif`;
                break;
            case 'attack1':
            case 'attack2':
            case 'attack':
                gifFile = `${enemyName}-Attack-animated.gif`;
                break;
            case 'hurt':
                gifFile = `${enemyName}-Hurt.gif`;
                break;
            case 'death':
            case 'die':
                gifFile = `${enemyName}-Die.gif`;
                break;
            default:
                // Default to idle
                gifFile = `${enemyName}-IdleFly-animated.gif`;
        }
        
        // Set the GIF as background image
        const fullPath = basePath + gifFile;
        spriteElement.style.backgroundImage = `url('${fullPath}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.backgroundRepeat = 'no-repeat';
        spriteElement.style.backgroundPosition = 'center';
        
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
                const idleGif = `${basePath}${enemyName}-IdleFly-animated.gif`;
                spriteElement.style.backgroundImage = `url('${idleGif}')`;
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
        'Orc': 'assets/enemies/Orc/Orc-Attack.gif',
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

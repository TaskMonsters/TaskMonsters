// Enemy Class
class Enemy {
    constructor(name, baseHP, baseAttack, baseDefense, sprites) {
        this.name = name;
        this.baseHP = baseHP;
        this.baseAttack = baseAttack;
        this.baseDefense = baseDefense;
        this.sprites = sprites;
        this.hp = baseHP;
        this.maxHP = baseHP;
        this.attack = baseAttack;
        this.defense = baseDefense;
        this.level = 1;
        this.tier = 'common';
        this.healCount = 0; // Track healing uses
        this.maxHeals = 6; // Maximum heals per battle
    }
    
    // Scale stats to player level using Smart AI dynamic scaling
    scaleToLevel(playerLevel) {
        // Use Smart AI dynamic scaling if available (Blueprint v2.0)
        if (window.enemyAI && window.enemyAI.applyDynamicScaling) {
            window.enemyAI.applyDynamicScaling(this, playerLevel);
        } else {
            // Fallback to old scaling if AI not loaded
            this.attack = this.baseAttack + playerLevel * 2;
            this.defense = this.baseDefense + playerLevel * 1.5;
            this.maxHP = Math.floor(this.baseHP + playerLevel * 5);
            this.hp = this.maxHP;
        }
    }
    
    // Take damage and return if dead
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }
    
    // Heal (limited by maxHeals)
    heal(amount) {
        if (this.healCount >= this.maxHeals) {
            return false; // No more heals available
        }
        this.hp = Math.min(this.maxHP, this.hp + amount);
        this.healCount++;
        return true;
    }
    
    // Set sprite based on animation key
    setSprite(animationKey) {
        const spriteElement = document.getElementById('enemySprite');
        if (!spriteElement) return;
        
        // Map animation keys to sprite paths
        const spriteMap = {
            'idle': this.sprites.idle,
            'attack1': this.sprites.attack1 || this.sprites.idle,
            'attack2': this.sprites.attack2 || this.sprites.attack1 || this.sprites.idle,
            'hurt': this.sprites.hurt || this.sprites.idle,
            'die': this.sprites.die || this.sprites.idle,
            'run': this.sprites.run || this.sprites.idle,
            'sleep': this.sprites.sleep || this.sprites.idle,
            'wakeup': this.sprites.wakeup || this.sprites.idle
        };
        
        const spritePath = spriteMap[animationKey] || this.sprites.idle;
        spriteElement.style.backgroundImage = `url('${spritePath}')`;
    }
}

// Create a scaled enemy for battle using ASSET_CONFIG
function createRandomEnemy(playerLevel) {
    console.log('🎲 createRandomEnemy called with playerLevel:', playerLevel);
    console.log('🔍 Checking ASSET_CONFIG:', window.ASSET_CONFIG ? 'EXISTS' : 'MISSING');
    
    // Get enemy tier based on player level
    const tier = window.getEnemyTier ? window.getEnemyTier(playerLevel) : 'common';
    console.log('📊 Enemy tier for level', playerLevel, ':', tier);
    
    // Get available enemies for this tier from ASSET_CONFIG
    const availableEnemies = window.ASSET_CONFIG && window.ASSET_CONFIG.enemies[tier]
        ? window.ASSET_CONFIG.enemies[tier]
        : [];
    
    console.log('👾 Available enemies for tier', tier, ':', availableEnemies.length);
    
    if (availableEnemies.length === 0) {
        console.error('❌ No enemies available for tier:', tier);
        // Fallback to common tier
        const fallbackEnemies = window.ASSET_CONFIG.enemies.common || [];
        if (fallbackEnemies.length === 0) {
            console.error('No fallback enemies available!');
            return null;
        }
        const enemyData = fallbackEnemies[Math.floor(Math.random() * fallbackEnemies.length)];
        return createEnemyFromData(enemyData, playerLevel);
    }
    
    // Use weighted selection if AI system is available
    const enemyData = window.enemyAI 
        ? window.enemyAI.selectWeightedEnemy(playerLevel, availableEnemies)
        : availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    
    return createEnemyFromData(enemyData, playerLevel);
}

// Create enemy from ASSET_CONFIG data
function createEnemyFromData(enemyData, playerLevel) {
    console.log('👾 Creating enemy from data:', enemyData.name);
    
    // Build full sprite paths
    const sprites = {};
    for (const [key, filename] of Object.entries(enemyData.sprites)) {
        sprites[key] = `assets/enemies/${enemyData.folder}/${filename}`;
    }
    
    const enemy = new Enemy(
        enemyData.name,
        enemyData.baseHP,
        enemyData.baseAttack,
        enemyData.baseDefense,
        sprites
    );
    
    // Add tier for AI healing/defense calculations
    if (enemyData.isBoss) {
        enemy.tier = 'boss';
    } else if (playerLevel >= 10) {
        enemy.tier = 'elite';
    } else {
        enemy.tier = 'common';
    }
    
    // Add projectile type
    if (enemyData.projectile) {
        enemy.projectileType = enemyData.projectile;
    }
    
    // Add special attacks
    if (enemyData.specialAttack) {
        if (enemyData.specialAttack === 'petrify') {
            enemy.canPetrify = true;
            enemy.petrifyChance = 0.15; // 15% chance
        } else if (enemyData.specialAttack === 'drench') {
            enemy.drenchAttack = true;
        } else if (enemyData.specialAttack === 'poison') {
            enemy.poisonAttack = true;
        }
    }
    
    // Scale to player level
    enemy.scaleToLevel(playerLevel);
    enemy.level = playerLevel; // Store level for XP calculations
    
    // Lazy Bat doesn't use projectiles
    if (enemy.name === 'Lazy Bat') {
        enemy.attackType = 'melee';
        enemy.usesProjectile = false;
        enemy.shoot = () => {};
    }
    
    console.log('✅ Enemy created successfully:', enemy.name, 'HP:', enemy.hp, 'Level:', enemy.level);
    return enemy;
}

// Play enemy animation sequence
function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        const spriteElement = document.getElementById('enemySprite');
        
        // For spritesheet-based enemies, just add/remove animation classes
        // Don't change backgroundImage as it breaks the sprite setup
        const enemyName = enemy.name;
        
        // Check if this enemy uses spritesheets (has CSS animation)
        const spritesheetEnemies = ['Lazy Bat', 'Bunny', 'Slime', 'Ogre', 'Fire Skull', 'Alien Walking', 'Alien Flying'];
        const usesSpritesheetAnimation = spritesheetEnemies.includes(enemyName);
        
        if (usesSpritesheetAnimation) {
            // For spritesheet enemies, animation is handled by CSS
            // Just add a visual effect class if needed
            if (animationKey === 'hurt') {
                spriteElement.style.filter = 'brightness(2)';
                setTimeout(() => {
                    spriteElement.style.filter = '';
                }, duration);
            }
            // Die animation: fade out
            if (animationKey === 'die') {
                spriteElement.style.transition = 'opacity 0.5s';
                spriteElement.style.opacity = '0';
            }
        } else {
            // For single-frame enemies, change the sprite image
            const spriteMap = {
                'idle': enemy.sprites.idle,
                'attack1': enemy.sprites.attack1 || enemy.sprites.idle,
                'attack2': enemy.sprites.attack2 || enemy.sprites.attack1 || enemy.sprites.idle,
                'hurt': enemy.sprites.hurt || enemy.sprites.idle,
                'die': enemy.sprites.die || enemy.sprites.idle
            };
            const spritePath = spriteMap[animationKey] || enemy.sprites.idle;
            spriteElement.style.backgroundImage = `url('${spritePath}')`;
        }
        
        // Wait for animation duration
        setTimeout(() => {
            // Return to idle sprite for single-frame enemies
            if (!usesSpritesheetAnimation && animationKey !== 'idle' && animationKey !== 'die') {
                spriteElement.style.backgroundImage = `url('${enemy.sprites.idle}')`;
            }
            resolve();
        }, duration);
    });
}

// Play wake-up sequence for Lazy Bat
async function playWakeUpSequence(enemy) {
    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement) return;
    
    // Helper function to set sprite (handles both methods)
    const setSpriteHelper = (animationKey) => {
        if (typeof enemy.setSprite === 'function') {
            enemy.setSprite(animationKey);
        } else {
            // Fallback: manually set sprite
            const spriteMap = {
                'idle': enemy.sprites.idle,
                'sleep': enemy.sprites.sleep || enemy.sprites.idle,
                'wakeup': enemy.sprites.wakeup || enemy.sprites.idle
            };
            const spritePath = spriteMap[animationKey] || enemy.sprites.idle;
            spriteElement.style.backgroundImage = `url('${spritePath}')`;
        }
    };
    
    // Show sleep sprite
    setSpriteHelper('sleep');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Show wake-up sprite
    setSpriteHelper('wakeup');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return to idle
    setSpriteHelper('idle');
}


// Export to global scope
window.Enemy = Enemy;
window.createRandomEnemy = createRandomEnemy;
window.createEnemyFromData = createEnemyFromData;
window.playEnemyAnimation = playEnemyAnimation;
window.playWakeUpSequence = playWakeUpSequence;

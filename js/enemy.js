
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
        
        // ENHANCED: Increase attack scaling to make enemies hit harder as player levels up
        // This creates more challenge and makes defense/items more valuable
        this.attack = this.baseAttack + Math.floor(playerLevel * 2.5); // Increased from 2 to 2.5
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
        
        // Show damage animation above enemy
        this.showDamageAnimation(amount);
        
        return this.hp <= 0;
    }
    
    // Show damage animation above enemy sprite
    showDamageAnimation(damage) {
        const enemySprite = document.getElementById('enemySprite');
        if (!enemySprite) return;
        
        const damageText = document.createElement('div');
        damageText.textContent = `-${damage}`;
        damageText.style.position = 'absolute';
        damageText.style.left = '50%';
        damageText.style.top = '-20px';
        damageText.style.transform = 'translateX(-50%)';
        damageText.style.fontSize = '24px';
        damageText.style.fontWeight = 'bold';
        damageText.style.color = '#ff4444';
        damageText.style.textShadow = '0 0 10px rgba(255, 68, 68, 0.8), 0 0 20px rgba(255, 68, 68, 0.5), 0 2px 4px rgba(0, 0, 0, 0.5)';
        damageText.style.pointerEvents = 'none';
        damageText.style.zIndex = '1000';
        damageText.style.animation = 'damageFloat 1.5s ease-out forwards';
        
        // Add to enemy sprite's parent container
        const enemyContainer = enemySprite.parentElement;
        if (enemyContainer) {
            enemyContainer.style.position = 'relative';
            enemyContainer.appendChild(damageText);
            
            // Remove after animation completes
            setTimeout(() => {
                if (damageText.parentElement) {
                    damageText.parentElement.removeChild(damageText);
                }
            }, 1500);
        }
    }

    // Update sprite
    setSprite(spriteKey) {
        if (this.sprites[spriteKey]) {
            this.currentSprite = this.sprites[spriteKey];
        }
    }
}

// Lazy Bat enemy data
const LAZY_BAT_DATA = {
    name: 'Lazy Bat',
    baseHP: 50,
    baseAttack: 15,
    baseDefense: 10,
    minLevel: 1,
    tier: 'early',
    sprites: {
        idle: 'assets/enemies/Lazy Bat/Bat-IdleFly.png',
        attack1: 'assets/enemies/Lazy Bat/Bat-Attack1.png',
        attack2: 'assets/enemies/Lazy Bat/Bat-Attack2.png',
        hurt: 'assets/enemies/Lazy Bat/Bat-Hurt.png',
        die: 'assets/enemies/Lazy Bat/Bat-Die.png',
        run: 'assets/enemies/Lazy Bat/Bat-Run.png',
        sleep: 'assets/enemies/Lazy Bat/Bat-Sleep.png',
        wakeup: 'assets/enemies/Lazy Bat/Bat-WakeUp.png'
    }
};

// Lazy Bat II enemy data (appears at level 3+)
const LAZY_BAT_II_DATA = {
    name: 'Lazy Bat II',
    baseHP: 50,
    baseAttack: 15,
    baseDefense: 10,
    minLevel: 3,
    tier: 'mid',
    sprites: {
        idle: 'assets/enemies/Lazy Bat/Bat-IdleFly.png',
        attack1: 'assets/enemies/Lazy Bat/Bat-Attack1.png',
        attack2: 'assets/enemies/Lazy Bat/Bat-Attack2.png',
        hurt: 'assets/enemies/Lazy Bat/Bat-Hurt.png',
        die: 'assets/enemies/Lazy Bat/Bat-Die.png',
        run: 'assets/enemies/Lazy Bat/Bat-Run.png',
        sleep: 'assets/enemies/Lazy Bat/Bat-Sleep.png',
        wakeup: 'assets/enemies/Lazy Bat/Bat-WakeUp.png'
    }
};

// Slime enemy data (appears at level 5+)
const SLIME_DATA = {
    name: 'Slime',
    baseHP: 40,
    baseAttack: 8,
    baseDefense: 5,
    minLevel: 5,
    tier: 'early',
    maxDamage: 10, // Cap damage at 10
    drainEnergy: true, // Drains energy on hit
    drainDefense: true, // Drains defense on hit
    projectileType: 'slime',
    sprites: {
        idle: 'assets/enemies/Slothful Slime/slime-sheet.png',
        attack1: 'assets/enemies/Slothful Slime/slime-sheet.png',
        attack2: 'assets/enemies/Slothful Slime/slime-sheet.png',
        hurt: 'assets/enemies/Slothful Slime/slime-sheet.png',
        die: 'assets/enemies/Slothful Slime/slime-sheet.png',
        run: 'assets/enemies/Slothful Slime/slime-sheet.png',
        sleep: 'assets/enemies/Slothful Slime/slime-sheet.png',
        wakeup: 'assets/enemies/Slothful Slime/slime-sheet.png'
    }
};

// Slime II enemy data (appears at level 6+) - 4-frame animated spritesheet
const SLIME_II_DATA = {
    name: 'Slime II',
    baseHP: 50,
    baseAttack: 12,
    baseDefense: 8,
    minLevel: 6,
    tier: 'mid',
    maxDamage: 15,
    drainEnergy: true,
    drainDefense: true,
    isAnimated: true, // Uses 4-frame spritesheet
    frameCount: 4,
    sprites: {
        idle: 'assets/enemies/Slothful Slime/slime-sheet.png',
        attack1: 'assets/enemies/Slothful Slime/slime-sheet.png',
        attack2: 'assets/enemies/Slothful Slime/slime-sheet.png',
        hurt: 'assets/enemies/Slothful Slime/slime-sheet.png',
        die: 'assets/enemies/Slothful Slime/slime-sheet.png',
        run: 'assets/enemies/Slothful Slime/slime-sheet.png',
        sleep: 'assets/enemies/Slothful Slime/slime-sheet.png',
        wakeup: 'assets/enemies/Slothful Slime/slime-sheet.png'
    }
};

// Ghost Task Stopper enemy data (appears at level 7+)
const GHOST_TASK_STOPPER_DATA = {
    name: 'Ghost Task Stopper',
    baseHP: 50,
    baseAttack: 15,
    baseDefense: 10,
    minLevel: 7,
    tier: 'mid',
    canEvade: true,
    evasionChance: 0.25, // 25% chance to evade attacks
    projectileType: 'waveform',
    sprites: {
        idle: 'assets/enemies/Procrastination Drone/drone-1.png',
        attack1: 'assets/enemies/Procrastination Drone/Drone Attack.png',
        attack2: 'assets/enemies/Procrastination Drone/Drone Attack.png',
        hurt: 'assets/enemies/Procrastination Drone/drone-2.png',
        die: 'assets/enemies/Procrastination Drone/drone-3.png',
        run: 'assets/enemies/Procrastination Drone/drone-4.png',
        sleep: 'assets/enemies/Procrastination Drone/drone-1.png',
        wakeup: 'assets/enemies/Procrastination Drone/drone-1.png'
    }
};

// Medusa enemy data (appears at level 8+)
const MEDUSA_DATA = {
    name: 'Medusa',
    baseHP: 60,
    baseAttack: 15,
    baseDefense: 12,
    minLevel: 8,
    tier: 'mid',
    maxDamage: 15, // Cap damage at 15
    canPetrify: true, // Can use petrify attack
    petrifyChance: 0.3, // 30% chance to petrify (skip player turn)
    projectileType: 'medusa',
    sprites: {
        idle: 'assets/enemies/Medusa/frame1.png',
        attack1: 'assets/enemies/Medusa/Medusa Attack.png',
        attack2: 'assets/enemies/Medusa/Medusa Attack.png',
        hurt: 'assets/enemies/Medusa/frame2.png',
        die: 'assets/enemies/Medusa/frame3.png',
        run: 'assets/enemies/Medusa/frame4.png',
        sleep: 'assets/enemies/Medusa/frame1.png',
        wakeup: 'assets/enemies/Medusa/frame1.png'
    }
};

// Lazy Eye enemy data (appears at level 12+)
const LAZY_EYE_DATA = {
    name: 'Lazy Eye',
    baseHP: 75,
    baseAttack: 20,
    baseDefense: 15,
    minLevel: 12,
    tier: 'boss',
    specialDefense: true,
    canSleep: true,
    sprites: {
        idle: 'assets/enemies/Flying Alien/spritesheet.png',
        attack1: 'assets/enemies/Flying Alien/spritesheet.png',
        attack2: 'assets/enemies/Flying Alien/spritesheet.png',
        hurt: 'assets/enemies/Flying Alien/spritesheet.png',
        die: 'assets/enemies/Flying Alien/spritesheet.png',
        run: 'assets/enemies/Flying Alien/spritesheet.png',
        sleep: 'assets/enemies/Flying Alien/spritesheet.png',
        wakeup: 'assets/enemies/Flying Alien/spritesheet.png'
    }
};

// Octopus enemy data (appears at level 2+)
const OCTOPUS_DATA = {
    name: 'Octopus',
    baseHP: 45,
    baseAttack: 12,
    baseDefense: 8,
    minLevel: 2,
    tier: 'mid',
    drenchAttack: true,
    hugAttack: true,
    projectileType: 'splash',
    sprites: {
        idle: 'assets/enemies/Little Cthulhu/octopus-1.png',
        attack1: 'assets/enemies/Little Cthulhu/Octopus Attack II.png',
        attack2: 'assets/enemies/Little Cthulhu/Octopus Attack II.png',
        hurt: 'assets/enemies/Little Cthulhu/octopus-2.png',
        die: 'assets/enemies/Little Cthulhu/octopus-3.png',
        run: 'assets/enemies/Little Cthulhu/octopus-4.png',
        sleep: 'assets/enemies/Little Cthulhu/octopus-1.png',
        wakeup: 'assets/enemies/Little Cthulhu/octopus-1.png'
    }
};

// Alien enemy data (appears at level 2+)
const ALIEN_DATA = {
    name: 'Alien',
    baseHP: 40,
    baseAttack: 10,
    baseDefense: 6,
    minLevel: 2,
    tier: 'mid',
    variableDamage: true,
    projectileType: 'alien',
    timeStingAttack: true,  // FIX: Time Sting ability - reduces player timer to 1 second
    timeStingChance: 0.25,  // FIX: 25% chance to use Time Sting
    sprites: {
        idle: 'assets/enemies/Alien/Spritesheets/alien-enemy-idle.png',
        attack1: 'assets/enemies/Alien/Spritesheets/alien-enemy-walk.png',
        attack2: 'assets/enemies/Alien/Spritesheets/alien-enemy-walk.png',
        hurt: 'assets/enemies/Alien/Spritesheets/alien-enemy-idle.png',
        die: 'assets/enemies/Alien/Spritesheets/alien-enemy-idle.png',
        run: 'assets/enemies/Alien/Spritesheets/alien-enemy-walk.png',
        sleep: 'assets/enemies/Alien/Spritesheets/alien-enemy-idle.png',
        wakeup: 'assets/enemies/Alien/Spritesheets/alien-enemy-idle.png'
    }
};

// Fire Skull enemy data (appears at level 5+)
const FIRE_SKULL_DATA = {
    name: 'Fire Skull',
    baseHP: 45,
    baseAttack: 18,
    baseDefense: 8,
    minLevel: 5,
    tier: 'mid',
    immunities: ['fire', 'spark'],
    weakness: 'freeze',
    weaknessDamage: 18,
    projectileType: 'fire-explosion',
    sprites: {
        idle: 'assets/enemies/The Overthinker/Spritesheets/fire-skull.png',
        attack1: 'assets/enemies/The Overthinker/Fire skull attack/Sprites.png',
        attack2: 'assets/enemies/The Overthinker/Fire skull attack/Sprites.png',
        hurt: 'assets/enemies/The Overthinker/Spritesheets/fire-skull-no-fire.png',
        die: 'assets/enemies/The Overthinker/Spritesheets/fire-skull-no-fire.png',
        run: 'assets/enemies/The Overthinker/Spritesheets/fire-skull.png',
        sleep: 'assets/enemies/The Overthinker/Spritesheets/fire-skull.png',
        wakeup: 'assets/enemies/The Overthinker/Spritesheets/fire-skull.png'
    }
};

// Ogre enemy data (appears at level 13+)
const OGRE_DATA = {
    name: 'Ogre',
    baseHP: 80,
    baseAttack: 22,
    baseDefense: 15,
    minLevel: 13,
    tier: 'boss',
    specialDefense: true,
    vulnerableToEvasion: true, // After player evades, next 2 attacks miss
    sprites: {
        idle: 'assets/enemies/Ogre/Spritesheets/ogre-idle.png',
        attack1: 'assets/enemies/Ogre/Spritesheets/ogre-attack.png',
        attack2: 'assets/enemies/Ogre/Spritesheets/ogre-attack.png',
        hurt: 'assets/enemies/Ogre/Spritesheets/ogre-idle-unarmed.png',
        die: 'assets/enemies/Ogre/Spritesheets/ogre-idle-unarmed.png',
        run: 'assets/enemies/Ogre/Spritesheets/ogre-walk.png',
        sleep: 'assets/enemies/Ogre/Spritesheets/ogre-idle.png',
        wakeup: 'assets/enemies/Ogre/Spritesheets/ogre-idle.png'
    }
};

// Fly enemy data (appears at level 5+)
const FLY_DATA = {
    name: 'Fly Drone',
    baseHP: 35,
    baseAttack: 13,
    baseDefense: 6,
    minLevel: 5,
    tier: 'mid',
    variableDamage: true,
    damageValues: [9, 17], // Specific damage values
    evasionAbility: true,
    evasionChance: 0.30, // 30% chance to evade player attacks
    projectileType: 'fly-spit',
    sprites: {
        idle: 'assets/enemies/Chaos Drone/enemy1.png',
        attack1: 'assets/enemies/Chaos Drone/Robot Attack.png',
        attack2: 'assets/enemies/Chaos Drone/Robot Attack.png',
        hurt: 'assets/enemies/Chaos Drone/enemy2.png',
        die: 'assets/enemies/Chaos Drone/enemy2.png',
        run: 'assets/enemies/Chaos Drone/enemy1.png',
        sleep: 'assets/enemies/Chaos Drone/enemy1.png',
        wakeup: 'assets/enemies/Chaos Drone/enemy1.png'
    }
};

const ENEMY_TYPES = [LAZY_BAT_DATA, LAZY_BAT_II_DATA, OCTOPUS_DATA, ALIEN_DATA, SLIME_DATA, GHOST_TASK_STOPPER_DATA, MEDUSA_DATA, LAZY_EYE_DATA, FIRE_SKULL_DATA, OGRE_DATA, FLY_DATA];

// Enemy rotation system - 7-level tier rotation
// Enemies change every 7 levels, all previous enemies remain available
let currentEnemyRotationIndex = 0;
let lastLevelTier = 0;

function getNextEnemyFromRotation(availableEnemies, playerLevel) {
    if (!availableEnemies || availableEnemies.length === 0) return null;
    
    // Calculate current level tier (0-6, 7-13, 14-20, etc.)
    const currentLevelTier = Math.floor((playerLevel - 1) / 7);
    
    // Reset rotation index when entering a new 7-level tier
    if (currentLevelTier !== lastLevelTier) {
        currentEnemyRotationIndex = 0;
        lastLevelTier = currentLevelTier;
    }
    
    // Get current enemy from rotation
    const selectedEnemy = availableEnemies[currentEnemyRotationIndex];
    
    // Move to next enemy in rotation
    currentEnemyRotationIndex = (currentEnemyRotationIndex + 1) % availableEnemies.length;
    
    return selectedEnemy;
}

// Create a scaled enemy for battle
function createRandomEnemy(playerLevel) {
    // Filter enemies available at current level
    let availableEnemies = ENEMY_TYPES.filter(e => playerLevel >= e.minLevel);
    
    // Octopus unlock at level 7
    if (playerLevel < 7) {
        availableEnemies = availableEnemies.filter(e => e.name !== 'Octopus');
    }
    
    // Use rotation system for enemy selection (7-level tier rotation)
    const enemyData = getNextEnemyFromRotation(availableEnemies, playerLevel);
    
    const enemy = new Enemy(
        enemyData.name,
        enemyData.baseHP,
        enemyData.baseAttack,
        enemyData.baseDefense,
        enemyData.sprites
    );
    
    // Add tier for AI healing/defense calculations
    if (enemyData.tier) {
        enemy.tier = enemyData.tier;
    }
    if (enemyData.specialDefense) {
        enemy.specialDefense = true;
        enemy.defenseChance = 0.15; // 15% base defense chance
    }
    
    // Add special abilities
    if (enemyData.canSleep) {
        enemy.canSleep = true;
    }
    if (enemyData.canEvade) {
        enemy.canEvade = true;
        enemy.evasionChance = enemyData.evasionChance;
    }
    if (enemyData.canPetrify) {
        enemy.canPetrify = true;
        enemy.petrifyChance = enemyData.petrifyChance;
    }
    if (enemyData.drainEnergy) {
        enemy.drainEnergy = true;
    }
    if (enemyData.drainDefense) {
        enemy.drainDefense = true;
    }
    if (enemyData.maxDamage) {
        enemy.maxDamage = enemyData.maxDamage;
    }
    if (enemyData.projectileType) {
        enemy.projectileType = enemyData.projectileType;
    }
    if (enemyData.drenchAttack) {
        enemy.drenchAttack = true;
    }
    if (enemyData.hugAttack) {
        enemy.hugAttack = true;
    }
    if (enemyData.variableDamage) {
        enemy.variableDamage = true;
    }
    if (enemyData.damageValues) {
        enemy.damageValues = enemyData.damageValues;
    }
    if (enemyData.evasionAbility) {
        enemy.evasionAbility = true;
        enemy.evasionChance = enemyData.evasionChance;
    }
    if (enemyData.immunities) {
        enemy.immunities = enemyData.immunities;
    }
    if (enemyData.weakness) {
        enemy.weakness = enemyData.weakness;
        enemy.weaknessDamage = enemyData.weaknessDamage;
    }
    if (enemyData.vulnerableToEvasion) {
        enemy.vulnerableToEvasion = true;
    }

    enemy.scaleToLevel(playerLevel);
    enemy.level = playerLevel; // Store level for XP calculations
    
    // LAZY BAT FIX: Disable projectile for Lazy Bat only (not Lazy Bat II)
    if (enemy.name === 'Lazy Bat') {
        enemy.attackType = 'melee';
        enemy.usesProjectile = false;
        // Block projectile spawn
        enemy.shoot = () => {};
    }
    
    return enemy;
}

// Play enemy animation sequence
function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        const spriteElement = document.getElementById('enemySprite');
        
        // Update sprite sheet source (skip for Fly Drone - it uses projectile only)
        if (enemy.name !== 'Fly Drone') {
            enemy.setSprite(animationKey);
            spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
        }
        
        // Remove all animation classes
        spriteElement.classList.remove('bat-idle', 'bat-attack', 'bat-hurt', 'slime-idle', 'medusa-idle', 'eye-idle', 'ghost-idle', 'procedural-idle', 'procedural-attack');
        
        // Add appropriate animation class based on enemy type
        const isBat = enemy.name === 'Lazy Bat';
        const isBat2 = enemy.name === 'Lazy Bat II';
        const isSlime = enemy.name === 'Slime';
        const isGhost = enemy.name === 'Ghost Task Stopper';
        const isMedusa = enemy.name === 'Medusa';
        const isEye = enemy.name === 'Flying Eye Demon' || enemy.name === 'Lazy Eye';
        const isProcedural = enemy.name === 'Octopus' || enemy.name === 'Alien' || enemy.name === 'Fire Skull' || enemy.name === 'Ogre';
        const isFly = enemy.name === 'Fly Drone';
        
        if (animationKey === 'attack1' || animationKey === 'attack2') {
            if (isBat) spriteElement.classList.add('bat-attack');
            else if (isBat2) spriteElement.classList.add('bat-attack');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            else if (isProcedural) spriteElement.classList.add('procedural-attack');
            else if (isFly) { /* Fly keeps idle sprite, projectile animates separately */ }
        } else if (animationKey === 'hurt') {
            if (isBat) spriteElement.classList.add('bat-hurt');
            else if (isBat2) spriteElement.classList.add('bat-hurt');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            else if (isProcedural) {
                // Static enemies: add hurt flash effect
                spriteElement.classList.add('procedural-hurt');
            }
            else if (isFly) {
                // Fly Drone: add hurt flash effect
                spriteElement.classList.add('enemy-hurt-flash');
            }
        } else {
            if (isBat) spriteElement.classList.add('bat-idle');
            else if (isBat2) spriteElement.classList.add('bat-idle');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isEye) spriteElement.classList.add('eye-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            else if (isProcedural) spriteElement.classList.add('procedural-idle');
        }

        setTimeout(() => {
            // Reset sprite to idle (skip for Fly Drone - it stays idle)
            if (enemy.name !== 'Fly Drone') {
                enemy.setSprite('idle');
                spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
            }
            spriteElement.classList.remove('bat-attack', 'bat-hurt', 'slime-idle', 'medusa-idle', 'eye-idle', 'ghost-idle', 'procedural-hurt', 'enemy-hurt-flash', 'procedural-attack');
            
            const isBat = enemy.name === 'Lazy Bat';
            const isBat2 = enemy.name === 'Lazy Bat II';
            const isSlime = enemy.name === 'Slime';
            const isGhost = enemy.name === 'Ghost Task Stopper';
            const isMedusa = enemy.name === 'Medusa';
            const isEye = enemy.name === 'Flying Eye Demon' || enemy.name === 'Lazy Eye';
            if (isBat) spriteElement.classList.add('bat-idle');
            else if (isBat2) spriteElement.classList.add('bat-idle');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isEye) spriteElement.classList.add('eye-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            
            // Re-add procedural-idle for static enemies after hurt animation
            const isProcedural = enemy.name === 'Octopus' || enemy.name === 'Alien' || enemy.name === 'Fire Skull' || enemy.name === 'Ogre';
            if (isProcedural) {
                spriteElement.classList.add('procedural-idle');
            }
            
            resolve();
        }, duration);
    });
}

// Wake up animation sequence (battle start)
async function playWakeUpSequence(enemy) {
    const spriteElement = document.getElementById('enemySprite');
    const isBat = enemy.name === 'Lazy Bat';
    const isEye = enemy.name === 'Flying Eye Demon' || enemy.name === 'Lazy Eye';
    const isGhost = enemy.name === 'Ghost Task Stopper';

    // Start with sleep
    enemy.setSprite('sleep');
    spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
    spriteElement.classList.remove('bat-idle', 'bat-attack', 'bat-hurt', 'eye-idle', 'ghost-idle');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Wake up
    enemy.setSprite('wakeup');
    spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
    await new Promise(resolve => setTimeout(resolve, 800));

    // Transition to idle
    enemy.setSprite('idle');
    spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
    if (isBat) spriteElement.classList.add('bat-idle');
    else if (isEye) spriteElement.classList.add('eye-idle');
    else if (isGhost) spriteElement.classList.add('ghost-idle');
}


// Export to global scope
window.Enemy = Enemy;
window.createRandomEnemy = createRandomEnemy;
window.playEnemyAnimation = playEnemyAnimation;
window.playWakeUpSequence = playWakeUpSequence;

// Enemy System for Task Monsters Battle Mode

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
        
        this.attack = this.baseAttack + playerLevel * 2;
        this.defense = this.baseDefense + playerLevel * 1.5;
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

// Lazy Bat enemy data
const LAZY_BAT_DATA = {
    name: 'Lazy Bat',
    baseHP: 50,
    baseAttack: 15,
    baseDefense: 10,
    minLevel: 1,
    tier: 'early',
    sprites: {
        idle: 'assets/enemies/Bat-IdleFly.png',
        attack1: 'assets/enemies/Bat-Attack1.png',
        attack2: 'assets/enemies/Bat-Attack2.png',
        hurt: 'assets/enemies/Bat-Hurt.png',
        die: 'assets/enemies/Bat-Die.png',
        run: 'assets/enemies/Bat-Run.png',
        sleep: 'assets/enemies/Bat-Sleep.png',
        wakeup: 'assets/enemies/Bat-WakeUp.png'
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
        idle: 'assets/enemies/LazyBat2-IdleFly.png',
        attack1: 'assets/enemies/LazyBat2-IdleFly.png',
        attack2: 'assets/enemies/LazyBat2-IdleFly.png',
        hurt: 'assets/enemies/LazyBat2-IdleFly.png',
        die: 'assets/enemies/LazyBat2-IdleFly.png',
        run: 'assets/enemies/LazyBat2-IdleFly.png',
        sleep: 'assets/enemies/LazyBat2-IdleFly.png',
        wakeup: 'assets/enemies/LazyBat2-IdleFly.png'
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
        idle: 'assets/enemies/slime-sheet.png',
        attack1: 'assets/enemies/slime-sheet.png',
        attack2: 'assets/enemies/slime-sheet.png',
        hurt: 'assets/enemies/slime-sheet.png',
        die: 'assets/enemies/slime-sheet.png',
        run: 'assets/enemies/slime-sheet.png',
        sleep: 'assets/enemies/slime-sheet.png',
        wakeup: 'assets/enemies/slime-sheet.png'
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
        idle: 'assets/enemies/Slime II/slime-sheet.png',
        attack1: 'assets/enemies/Slime II/slime-sheet.png',
        attack2: 'assets/enemies/Slime II/slime-sheet.png',
        hurt: 'assets/enemies/Slime II/slime-sheet.png',
        die: 'assets/enemies/Slime II/slime-sheet.png',
        run: 'assets/enemies/Slime II/slime-sheet.png',
        sleep: 'assets/enemies/Slime II/slime-sheet.png',
        wakeup: 'assets/enemies/Slime II/slime-sheet.png'
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
        idle: 'assets/enemies/ghost/ghost-idle.png',
        attack1: 'assets/enemies/ghost/ghost-idle.png',
        attack2: 'assets/enemies/ghost/ghost-idle.png',
        hurt: 'assets/enemies/ghost/ghost-idle.png',
        die: 'assets/enemies/ghost/ghost-idle.png',
        run: 'assets/enemies/ghost/ghost-idle.png',
        sleep: 'assets/enemies/ghost/ghost-idle.png',
        wakeup: 'assets/enemies/ghost/ghost-idle.png'
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
        idle: 'assets/enemies/medusa-idle.png',
        attack1: 'assets/enemies/medusa-idle.png',
        attack2: 'assets/enemies/medusa-idle.png',
        hurt: 'assets/enemies/medusa-idle.png',
        die: 'assets/enemies/medusa-idle.png',
        run: 'assets/enemies/medusa-idle.png',
        sleep: 'assets/enemies/medusa-idle.png',
        wakeup: 'assets/enemies/medusa-idle.png'
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
        idle: 'assets/enemies/Eye-Idle.png',
        attack1: 'assets/enemies/Eye-Idle.png',
        attack2: 'assets/enemies/Eye-Idle.png',
        hurt: 'assets/enemies/Eye-Idle.png',
        die: 'assets/enemies/Eye-Idle.png',
        run: 'assets/enemies/Eye-Idle.png',
        sleep: 'assets/enemies/Eye-Idle.png',
        wakeup: 'assets/enemies/Eye-Idle.png'
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
        idle: 'assets/octopus.png',
        attack1: 'assets/octopus.png',
        attack2: 'assets/octopus.png',
        hurt: 'assets/octopus.png',
        die: 'assets/octopus.png',
        run: 'assets/octopus.png',
        sleep: 'assets/octopus.png',
        wakeup: 'assets/octopus.png'
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
    sprites: {
        idle: 'assets/enemies/alien-spritesheet.png',
        attack1: 'assets/enemies/alien-spritesheet.png',
        attack2: 'assets/enemies/alien-spritesheet.png',
        hurt: 'assets/enemies/alien-spritesheet.png',
        die: 'assets/enemies/alien-spritesheet.png',
        run: 'assets/enemies/alien-spritesheet.png',
        sleep: 'assets/enemies/alien-spritesheet.png',
        wakeup: 'assets/enemies/alien-spritesheet.png'
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
        idle: 'assets/enemies/fire-skull/fire-skull-idle.png',
        attack1: 'assets/enemies/fire-skull/fire-skull-explosion.png',
        attack2: 'assets/enemies/fire-skull/fire-skull-explosion.png',
        hurt: 'assets/enemies/fire-skull/fire-skull-idle.png',
        die: 'assets/enemies/fire-skull/fire-skull-idle.png',
        run: 'assets/enemies/fire-skull/fire-skull-idle.png',
        sleep: 'assets/enemies/fire-skull/fire-skull-idle.png',
        wakeup: 'assets/enemies/fire-skull/fire-skull-idle.png'
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
        idle: 'assets/enemies/ogre/ogre-idle.png',
        attack1: 'assets/enemies/ogre/ogre-attack.png',
        attack2: 'assets/enemies/ogre/ogre-attack.png',
        hurt: 'assets/enemies/ogre/ogre-idle.png',
        die: 'assets/enemies/ogre/ogre-idle.png',
        run: 'assets/enemies/ogre/ogre-idle.png',
        sleep: 'assets/enemies/ogre/ogre-idle.png',
        wakeup: 'assets/enemies/ogre/ogre-idle.png'
    }
};

const ENEMY_TYPES = [LAZY_BAT_DATA, LAZY_BAT_II_DATA, OCTOPUS_DATA, ALIEN_DATA, SLIME_DATA, GHOST_TASK_STOPPER_DATA, MEDUSA_DATA, LAZY_EYE_DATA, FIRE_SKULL_DATA, OGRE_DATA];

// Enemy rotation system
let currentEnemyRotationIndex = 0;

function getNextEnemyFromRotation(availableEnemies) {
    if (!availableEnemies || availableEnemies.length === 0) return null;
    
    // Use round-robin rotation
    const enemy = availableEnemies[currentEnemyRotationIndex % availableEnemies.length];
    currentEnemyRotationIndex++;
    
    return enemy;
}

// Create a scaled enemy for battle
function createRandomEnemy(playerLevel) {
    // Filter enemies available at current level
    let availableEnemies = ENEMY_TYPES.filter(e => playerLevel >= e.minLevel);
    
    // Octopus unlock at level 7
    if (playerLevel < 7) {
        availableEnemies = availableEnemies.filter(e => e.name !== 'Octopus');
    }
    
    // Use rotation system for enemy selection
    const enemyData = getNextEnemyFromRotation(availableEnemies);
    
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
        
        // Update sprite sheet source
        enemy.setSprite(animationKey);
        spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
        
        // Remove all animation classes
        spriteElement.classList.remove('bat-idle', 'bat-attack', 'bat-hurt', 'bat2-idle', 'slime-idle', 'medusa-idle', 'eye-idle', 'ghost-idle', 'procedural-idle', 'procedural-attack');
        
        // Add appropriate animation class based on enemy type
        const isBat = enemy.name === 'Lazy Bat';
        const isBat2 = enemy.name === 'Lazy Bat II';
        const isSlime = enemy.name === 'Slime';
        const isGhost = enemy.name === 'Ghost Task Stopper';
        const isMedusa = enemy.name === 'Medusa';
        const isEye = enemy.name === 'Flying Eye Demon' || enemy.name === 'Lazy Eye';
        const isProcedural = enemy.name === 'Octopus' || enemy.name === 'Alien' || enemy.name === 'Fire Skull' || enemy.name === 'Ogre';
        
        if (animationKey === 'attack1' || animationKey === 'attack2') {
            if (isBat) spriteElement.classList.add('bat-attack');
            else if (isBat2) spriteElement.classList.add('bat2-idle');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            else if (isProcedural) spriteElement.classList.add('procedural-attack');
        } else if (animationKey === 'hurt') {
            if (isBat) spriteElement.classList.add('bat-hurt');
            else if (isBat2) spriteElement.classList.add('bat2-idle');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            else if (isProcedural) spriteElement.classList.add('procedural-idle');
        } else {
            if (isBat) spriteElement.classList.add('bat-idle');
            else if (isBat2) spriteElement.classList.add('bat2-idle');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isEye) spriteElement.classList.add('eye-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            else if (isProcedural) spriteElement.classList.add('procedural-idle');
        }

        setTimeout(() => {
            enemy.setSprite('idle');
            spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
            spriteElement.classList.remove('bat-attack', 'bat-hurt', 'bat2-idle', 'slime-idle', 'medusa-idle', 'eye-idle', 'ghost-idle');
            
            const isBat = enemy.name === 'Lazy Bat';
            const isBat2 = enemy.name === 'Lazy Bat II';
            const isSlime = enemy.name === 'Slime';
            const isGhost = enemy.name === 'Ghost Task Stopper';
            const isMedusa = enemy.name === 'Medusa';
            const isEye = enemy.name === 'Flying Eye Demon' || enemy.name === 'Lazy Eye';
            if (isBat) spriteElement.classList.add('bat-idle');
            else if (isBat2) spriteElement.classList.add('bat2-idle');
            else if (isSlime) spriteElement.classList.add('slime-idle');
            else if (isEye) spriteElement.classList.add('eye-idle');
            else if (isGhost) spriteElement.classList.add('ghost-idle');
            else if (isMedusa) spriteElement.classList.add('medusa-idle');
            
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


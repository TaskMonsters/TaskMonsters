
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
    isAnimatedGif: true,  // Flag to indicate this uses GIF animation
    sprites: {
        idle: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        attack1: 'assets/enemies/Lazy Bat/Bat-Attack1-animated.gif',
        attack2: 'assets/enemies/Lazy Bat/Bat-Attack1-animated.gif',
        hurt: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        die: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        run: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        sleep: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        wakeup: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif'
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
    isAnimatedGif: true,  // Flag to indicate this uses GIF animation
    sprites: {
        idle: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        attack1: 'assets/enemies/Lazy Bat/Bat-Attack1-animated.gif',
        attack2: 'assets/enemies/Lazy Bat/Bat-Attack1-animated.gif',
        hurt: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        die: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        run: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        sleep: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif',
        wakeup: 'assets/enemies/Lazy Bat/Bat-IdleFly-animated.gif'
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
    isAnimatedGif: true,  // Flag to indicate this uses GIF animation
    sprites: {
        idle: 'assets/enemies/Slothful Slime/slime-animated.gif',
        attack1: 'assets/enemies/Slothful Slime/slime-animated.gif',
        attack2: 'assets/enemies/Slothful Slime/slime-animated.gif',
        hurt: 'assets/enemies/Slothful Slime/slime-animated.gif',
        die: 'assets/enemies/Slothful Slime/slime-animated.gif',
        run: 'assets/enemies/Slothful Slime/slime-animated.gif',
        sleep: 'assets/enemies/Slothful Slime/slime-animated.gif',
        wakeup: 'assets/enemies/Slothful Slime/slime-animated.gif'
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
    isAnimatedGif: true,  // Flag to indicate this uses GIF animation
    sprites: {
        idle: 'assets/enemies/Slothful Slime/slime-animated.gif',
        attack1: 'assets/enemies/Slothful Slime/slime-animated.gif',
        attack2: 'assets/enemies/Slothful Slime/slime-animated.gif',
        hurt: 'assets/enemies/Slothful Slime/slime-animated.gif',
        die: 'assets/enemies/Slothful Slime/slime-animated.gif',
        run: 'assets/enemies/Slothful Slime/slime-animated.gif',
        sleep: 'assets/enemies/Slothful Slime/slime-animated.gif',
        wakeup: 'assets/enemies/Slothful Slime/slime-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        attack1: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        attack2: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        hurt: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        die: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        run: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        sleep: 'assets/enemies/Procrastination Drone/drone-animated.gif',
        wakeup: 'assets/enemies/Procrastination Drone/drone-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Medusa/medusa-animated.gif',
        attack1: 'assets/enemies/Medusa/medusa-animated.gif',
        attack2: 'assets/enemies/Medusa/medusa-animated.gif',
        hurt: 'assets/enemies/Medusa/medusa-animated.gif',
        die: 'assets/enemies/Medusa/medusa-animated.gif',
        run: 'assets/enemies/Medusa/medusa-animated.gif',
        sleep: 'assets/enemies/Medusa/medusa-animated.gif',
        wakeup: 'assets/enemies/Medusa/medusa-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Flying Alien/alien-animated.gif',
        attack1: 'assets/enemies/Flying Alien/alien-animated.gif',
        attack2: 'assets/enemies/Flying Alien/alien-animated.gif',
        hurt: 'assets/enemies/Flying Alien/alien-animated.gif',
        die: 'assets/enemies/Flying Alien/alien-animated.gif',
        run: 'assets/enemies/Flying Alien/alien-animated.gif',
        sleep: 'assets/enemies/Flying Alien/alien-animated.gif',
        wakeup: 'assets/enemies/Flying Alien/alien-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        attack1: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        attack2: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        hurt: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        die: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        run: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        sleep: 'assets/enemies/Little Cthulhu/octopus-animated.gif',
        wakeup: 'assets/enemies/Little Cthulhu/octopus-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Alien/alien-idle-animated.gif',
        attack1: 'assets/enemies/Alien/alien-walk-animated.gif',
        attack2: 'assets/enemies/Alien/alien-walk-animated.gif',
        hurt: 'assets/enemies/Alien/alien-idle-animated.gif',
        die: 'assets/enemies/Alien/alien-idle-animated.gif',
        run: 'assets/enemies/Alien/alien-walk-animated.gif',
        sleep: 'assets/enemies/Alien/alien-idle-animated.gif',
        wakeup: 'assets/enemies/Alien/alien-idle-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/The Overthinker/fire-skull-animated.gif',
        attack1: 'assets/enemies/The Overthinker/fire-skull-animated.gif',
        attack2: 'assets/enemies/The Overthinker/fire-skull-animated.gif',
        hurt: 'assets/enemies/The Overthinker/fire-skull-no-fire-animated.gif',
        die: 'assets/enemies/The Overthinker/fire-skull-no-fire-animated.gif',
        run: 'assets/enemies/The Overthinker/fire-skull-animated.gif',
        sleep: 'assets/enemies/The Overthinker/fire-skull-animated.gif',
        wakeup: 'assets/enemies/The Overthinker/fire-skull-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Ogre/ogre-idle-animated.gif',
        attack1: 'assets/enemies/Ogre/ogre-attack-animated.gif',
        attack2: 'assets/enemies/Ogre/ogre-attack-animated.gif',
        hurt: 'assets/enemies/Ogre/ogre-idle-unarmed-animated.gif',
        die: 'assets/enemies/Ogre/ogre-idle-unarmed-animated.gif',
        run: 'assets/enemies/Ogre/ogre-walk-animated.gif',
        sleep: 'assets/enemies/Ogre/ogre-idle-animated.gif',
        wakeup: 'assets/enemies/Ogre/ogre-idle-animated.gif'
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
    isAnimatedGif: true,
    sprites: {
        idle: 'assets/enemies/Chaos Drone/fly-animated.gif',
        attack1: 'assets/enemies/Chaos Drone/fly-animated.gif',
        attack2: 'assets/enemies/Chaos Drone/fly-animated.gif',
        hurt: 'assets/enemies/Chaos Drone/fly-animated.gif',
        die: 'assets/enemies/Chaos Drone/fly-animated.gif',
        run: 'assets/enemies/Chaos Drone/fly-animated.gif',
        sleep: 'assets/enemies/Chaos Drone/fly-animated.gif',
        wakeup: 'assets/enemies/Chaos Drone/fly-animated.gif'
    }
};

// The Overthinker - Special enemy that appears every 4 levels
const OVERTHINKER_DATA = {
    name: 'The Overthinker',
    baseHP: 80,
    baseAttack: 20,
    baseDefense: 15,
    minLevel: 4,
    tier: 'special',
    isOverthinker: true, // Special flag for every-4-levels trigger
    specialArena: 'bg-stone-ruins', // Uses Stone Ruins arena
    frameCount: 8, // 8 frames for idle animation
    attackFrameCount: 8, // 8 frames for attack animation
    hurtFrameCount: 4, // 4 frames for hurt animation
    sprites: {
        idle: 'assets/enemies/overthinker/idle/frame',
        attack1: 'assets/enemies/overthinker/attack/explosion-f',
        attack2: 'assets/enemies/overthinker/attack/explosion-f',
        hurt: 'assets/enemies/overthinker/hurt/frame',
        die: 'assets/enemies/overthinker/hurt/frame',
        run: 'assets/enemies/overthinker/idle/frame',
        sleep: 'assets/enemies/overthinker/idle/frame',
        wakeup: 'assets/enemies/overthinker/idle/frame'
    }
};

// Disruption Dragon enemy data (appears at level 20+)
const DISRUPTION_DRAGON_DATA = {
    name: 'Disruption Dragon',
    baseHP: 120,
    baseAttack: 25,
    baseDefense: 18,
    minLevel: 20,
    tier: 'boss',
    isAnimatedGif: true,
    projectileType: 'bolt',
    hasSpecialAttack: true,
    specialAttackName: 'Disrupt',
    specialAttackChance: 0.3, // 30% chance to use Disrupt attack
    disruptDuration: 3, // Disrupt lasts 3 turns
    disruptDamagePerTurn: 17, // Deals 17 HP per turn during disruption
    damageRange: [20, 30], // Normal attack deals 20-30 damage
    sprites: {
        idle: 'assets/enemies/Disruption Dragon/disruption-dragon.gif',
        attack1: 'assets/enemies/Disruption Dragon/disruption-dragon.gif',
        attack2: 'assets/enemies/Disruption Dragon/disruption-dragon.gif',
        hurt: 'assets/enemies/Disruption Dragon/disruption-dragon.gif',
        die: 'assets/enemies/Disruption Dragon/disruption-dragon.gif'
    },
    projectileSprites: {
        bolt: 'assets/enemies/Disruption Dragon/DisruptionDragon projectile attack/bolt-previewt.gif'
    }
};

const ENEMY_TYPES = [LAZY_BAT_DATA, LAZY_BAT_II_DATA, OCTOPUS_DATA, ALIEN_DATA, SLIME_DATA, GHOST_TASK_STOPPER_DATA, MEDUSA_DATA, LAZY_EYE_DATA, FIRE_SKULL_DATA, OGRE_DATA, FLY_DATA, DISRUPTION_DRAGON_DATA];

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
    // LEVEL OFFSET: Enemies always scale as if player is Level 1 for easier battles
    // This makes battles consistently easy regardless of player level
    const effectiveEnemyLevel = 1;
    
    console.log(`[Enemy] Player Level: ${playerLevel}, Effective Enemy Level: ${effectiveEnemyLevel}`);
    
    // Check if this should be an Overthinker battle (every 4 effective levels: 4, 8, 12, 16, etc.)
    // Only trigger if effective enemy level is divisible by 4 AND we haven't fought Overthinker at this level yet
    const isOverthinkerLevel = effectiveEnemyLevel >= 4 && effectiveEnemyLevel % 4 === 0;
    const lastOverthinkerLevel = parseInt(localStorage.getItem('lastOverthinkerLevel') || '0');
    
    if (isOverthinkerLevel && lastOverthinkerLevel < effectiveEnemyLevel) {
        console.log(`🧠 Overthinker battle triggered at effective enemy level ${effectiveEnemyLevel}!`);
        localStorage.setItem('lastOverthinkerLevel', effectiveEnemyLevel.toString());
        return createOverthinkerEnemy(effectiveEnemyLevel);
    }
    
    // Filter enemies available at effective enemy level (not player level)
    let availableEnemies = ENEMY_TYPES.filter(e => effectiveEnemyLevel >= e.minLevel);
    
    // Octopus unlock at effective enemy level 7 (player level 16)
    if (effectiveEnemyLevel < 7) {
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
    
    // Disruption Dragon special abilities
    if (enemyData.hasSpecialAttack) {
        enemy.hasSpecialAttack = true;
        enemy.specialAttackName = enemyData.specialAttackName;
        enemy.specialAttackChance = enemyData.specialAttackChance;
        enemy.disruptDuration = enemyData.disruptDuration;
        enemy.disruptDamagePerTurn = enemyData.disruptDamagePerTurn;
        enemy.damageRange = enemyData.damageRange;
        enemy.projectileSprites = enemyData.projectileSprites;
    }

    // Scale enemy to effective enemy level (not player level) for balanced difficulty
    enemy.scaleToLevel(effectiveEnemyLevel);
    enemy.level = effectiveEnemyLevel; // Store effective level for XP calculations
    
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
        
        // CRITICAL FIX: For GIF-animated enemies, update the img src if using img element
        if (enemy.isAnimatedGif) {
            enemy.setSprite(animationKey);
            
            // Check if using img element (new approach) or background-image (legacy)
            const imgElement = spriteElement.querySelector('img');
            if (imgElement) {
                imgElement.src = enemy.currentSprite;
            } else {
                spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
            }
            
            // No CSS animation classes needed for GIFs - they animate natively
            setTimeout(() => {
                enemy.setSprite('idle');
                if (imgElement) {
                    imgElement.src = enemy.currentSprite;
                } else {
                    spriteElement.style.backgroundImage = `url('${enemy.currentSprite}')`;
                }
                resolve();
            }, duration);
            return;
        }
        
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


// Create Overthinker enemy (special enemy every 4 effective enemy levels)
// Overthinker scales STRONGER than regular enemies to remain a challenge
// Note: This function receives effectiveEnemyLevel (player level - 9), not raw player level
function createOverthinkerEnemy(effectiveEnemyLevel) {
    const playerLevel = effectiveEnemyLevel; // Alias for clarity in scaling calculations
    const enemyData = OVERTHINKER_DATA;
    
    const enemy = new Enemy(
        enemyData.name,
        enemyData.baseHP,
        enemyData.baseAttack,
        enemyData.baseDefense,
        enemyData.sprites
    );
    
    // Mark as Overthinker for special handling
    enemy.isOverthinker = true;
    enemy.tier = 'special';
    enemy.specialArena = enemyData.specialArena;
    enemy.frameCount = enemyData.frameCount;
    enemy.attackFrameCount = enemyData.attackFrameCount;
    enemy.hurtFrameCount = enemyData.hurtFrameCount;
    
    // Overthinker special abilities
    enemy.canConfuse = true; // Can confuse player monster
    enemy.confuseChance = 0.25; // 25% chance to confuse on attack
    enemy.confuseSelfDamage = [10, 20]; // Confused monster deals 10-20 damage to itself
    enemy.confuseDuration = 2; // Confusion lasts 2 turns
    enemy.variableDamage = true;
    enemy.damageValues = [15, 25]; // Variable damage range
    
    // ENHANCED SCALING: Overthinker gets stronger as player levels up
    // Base stats + aggressive level scaling to remain challenging
    const levelMultiplier = Math.floor(playerLevel / 4); // Gets stronger every 4 levels
    
    // Scale HP more aggressively (base 80 + 15 per level + 20 per tier)
    enemy.maxHP = enemyData.baseHP + (playerLevel * 8) + (levelMultiplier * 25);
    enemy.hp = enemy.maxHP;
    
    // Scale Attack more aggressively (base 20 + 3 per level + 5 per tier)
    enemy.attack = enemyData.baseAttack + (playerLevel * 3) + (levelMultiplier * 8);
    
    // Scale Defense (base 15 + 2 per level + 3 per tier)
    enemy.defense = enemyData.baseDefense + (playerLevel * 2) + (levelMultiplier * 5);
    
    // Scale damage range with level
    const minDamage = 15 + (levelMultiplier * 5);
    const maxDamage = 25 + (levelMultiplier * 8);
    enemy.damageValues = [minDamage, maxDamage];
    
    enemy.level = playerLevel;
    
    console.log(`🧠 Created Overthinker enemy at level ${playerLevel}`);
    console.log(`   HP: ${enemy.hp}, Attack: ${enemy.attack}, Defense: ${enemy.defense}`);
    console.log(`   Damage Range: ${minDamage}-${maxDamage}, Confuse Chance: ${enemy.confuseChance * 100}%`);
    return enemy;
}

// Export to global scope
window.Enemy = Enemy;
window.createRandomEnemy = createRandomEnemy;
window.createOverthinkerEnemy = createOverthinkerEnemy;
window.playEnemyAnimation = playEnemyAnimation;
window.playWakeUpSequence = playWakeUpSequence;
window.OVERTHINKER_DATA = OVERTHINKER_DATA;
window.DISRUPTION_DRAGON_DATA = DISRUPTION_DRAGON_DATA;

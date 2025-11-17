// Asset Configuration
// Complete battle system asset mapping

const ASSET_CONFIG = {
    // Battle Backgrounds (Level-based) - Updated with new backgrounds
    backgrounds: {
        1: 'assets/battle-backgrounds/City Sunset Level 1+.png',
        4: 'assets/battle-backgrounds/Green Arena Level 4+.png',
        6: 'assets/battle-backgrounds/Castle Arena Level 6+.png',
        8: 'assets/battle-backgrounds/Forest Level 6+.png',
        10: 'assets/battle-backgrounds/Night Town Level 10+.png',
        15: 'assets/battle-backgrounds/Hot Town Level 15+.png',
        20: 'assets/battle-backgrounds/Dungeon Level 20+.png',
        25: 'assets/battle-backgrounds/Skull Gates Level 25+.png',
        40: 'assets/battle-backgrounds/Space Arena Level 40+.png',
        50: 'assets/battle-backgrounds/Dark Gothic Castle Level 50+.png',
        60: 'assets/battle-backgrounds/Dusk Arena Level 60+.png'
    },

    // Battle Music (Tier-based)
    music: {
        common: 'assets/sounds/Battle Music Default.mp3',
        elite: 'assets/sounds/Battle mode music 2.mp3',
        boss: 'assets/sounds/Battle mode 3.mp3',
        bossPhase2: 'assets/sounds/Battle mode music 4.mp3',
        victory: 'assets/sounds/User wins battle.mp3',
        defeat: 'assets/sounds/User loses battle.mp3',
        specialReady: 'assets/sounds/Battle mode music 5.mp3' // Special gauge full sound
    },

    // Monster Special Attacks
    monsterSpecials: {
        nova: {
            name: 'Stellar Burst',
            frames: [
                'assets/special-attacks/nova/_0000_Layer-1.png',
                'assets/special-attacks/nova/_0001_Layer-2.png',
                'assets/special-attacks/nova/_0002_Layer-3.png',
                'assets/special-attacks/nova/_0003_Layer-4.png',
                'assets/special-attacks/nova/_0004_Layer-5.png',
                'assets/special-attacks/nova/_0005_Layer-6.png',
                'assets/special-attacks/nova/_0006_Layer-7.png',
                'assets/special-attacks/nova/_0007_Layer-8.png'
            ],
            baseDamage: 30,
            maxDamage: 45,
            effect: 'AoE heavy damage to all enemies'
        },
        benny: {
            name: 'Sonic Boom',
            frames: [
                'assets/special-attacks/benny/_0000_Layer-1.png',
                'assets/special-attacks/benny/_0001_Layer-2.png',
                'assets/special-attacks/benny/_0002_Layer-3.png',
                'assets/special-attacks/benny/_0003_Layer-4.png',
                'assets/special-attacks/benny/_0004_Layer-5.png',
                'assets/special-attacks/benny/_0005_Layer-6.png'
            ],
            baseDamage: 28,
            maxDamage: 42,
            effect: '100% stun for 1 turn'
        },
        luna: {
            name: 'Lunar Eclipse',
            frames: [
                'assets/special-attacks/luna/_0000_Layer-1.png',
                'assets/special-attacks/luna/_0001_Layer-2.png',
                'assets/special-attacks/luna/_0002_Layer-3.png',
                'assets/special-attacks/luna/_0003_Layer-4.png',
                'assets/special-attacks/luna/_0004_Layer-5.png'
            ],
            baseDamage: 28,
            maxDamage: 40,
            effect: '-20% enemy Defense (2 turns)'
        }
    },

    // Enemy Types with tier classification - NEW ENEMIES ONLY
    enemies: {
        // Common Tier (Levels 1-10)
        common: [
            {
                name: 'Lazy Bat',
                folder: 'Lazy Bat',
                baseHP: 50,
                baseAttack: 15,
                baseDefense: 10,
                sprites: {
                    idle: 'Bat-IdleFly.png',
                    attack1: 'Bat-Attack1.png',
                    attack2: 'Bat-Attack2.png',
                    hurt: 'Bat-Hurt.png',
                    die: 'Bat-Die.png',
                    run: 'Bat-Run.png',
                    sleep: 'Bat-Sleep.png',
                    wakeup: 'Bat-WakeUp.png'
                },
                projectile: null
            },
            {
                name: 'Bunny',
                folder: 'Bunny',
                baseHP: 40,
                baseAttack: 12,
                baseDefense: 8,
                sprites: {
                    idle: 'Idle (34x44).png',
                    attack1: 'Bunny Attack',
                    hurt: 'Hit (34x44).png',
                    die: 'Fall.png'
                },
                projectile: null
            },
            {
                name: 'Slime',
                folder: 'Slime II',
                baseHP: 40,
                baseAttack: 12,
                baseDefense: 8,
                sprites: {
                    idle: 'Sprites/slime1.png',
                    attack1: 'Sprites/slime2.png',
                    hurt: 'Sprites/slime3.png',
                    die: 'Sprites/slime4.png'
                },
                projectile: null
            }
        ],
        
        // Elite Tier (Levels 10-25)
        elite: [
            {
                name: 'Medusa',
                folder: 'Medusa',
                baseHP: 80,
                baseAttack: 25,
                baseDefense: 15,
                sprites: {
                    idle: 'frame1.png',
                    attack1: 'Medusa Attack.png',
                    hurt: 'frame2.png',
                    die: 'frame4.png'
                },
                projectile: 'medusa',
                specialAttack: 'petrify'
            },
            {
                name: 'Octopus',
                folder: 'Octopus',
                baseHP: 75,
                baseAttack: 22,
                baseDefense: 18,
                sprites: {
                    idle: 'octopus-1.png',
                    attack1: 'Octopus Attack II.png',
                    hurt: 'octopus-2.png',
                    die: 'octopus-4.png'
                },
                projectile: 'splash',
                specialAttack: 'drench'
            },
            {
                name: 'Fire Skull',
                folder: 'Fire Skull',
                baseHP: 70,
                baseAttack: 28,
                baseDefense: 12,
                sprites: {
                    idle: 'Spritesheets',
                    attack1: 'Fire skull attack',
                    hurt: 'Spritesheets',
                    die: 'Spritesheets'
                },
                projectile: 'fire'
            },
            {
                name: 'Drone',
                folder: 'Drone',
                baseHP: 65,
                baseAttack: 24,
                baseDefense: 14,
                sprites: {
                    idle: 'drone-1.png',
                    attack1: 'Drone Attack.png',
                    hurt: 'drone-2.png',
                    die: 'drone-4.png'
                },
                projectile: 'laser'
            }
        ],
        
        // Boss Tier (Levels 25+)
        boss: [
            {
                name: 'Ogre',
                folder: 'Ogre',
                baseHP: 150,
                baseAttack: 35,
                baseDefense: 25,
                sprites: {
                    idle: 'Spritesheets',
                    attack1: 'Spritesheets',
                    hurt: 'Spritesheets',
                    die: 'Spritesheets'
                },
                projectile: null,
                isBoss: true
            },
            {
                name: 'Robot',
                folder: 'Robot',
                baseHP: 140,
                baseAttack: 32,
                baseDefense: 28,
                sprites: {
                    idle: 'enemy1.png',
                    attack1: 'Robot Attack.png',
                    hurt: 'enemy2.png',
                    die: 'enemy2.png'
                },
                projectile: 'energy',
                isBoss: true
            },
            {
                name: 'Alien Flying',
                folder: 'Alien Flying Enemy',
                baseHP: 135,
                baseAttack: 30,
                baseDefense: 22,
                sprites: {
                    idle: 'spritesheet.png',
                    attack1: 'sprites',
                    hurt: 'spritesheet.png',
                    die: 'spritesheet.png'
                },
                projectile: 'alien',
                isBoss: true
            },
            {
                name: 'Alien Walking',
                folder: 'Alien Walking Enemy',
                baseHP: 145,
                baseAttack: 33,
                baseDefense: 24,
                sprites: {
                    idle: 'Spritesheets',
                    attack1: 'Sprites',
                    hurt: 'Spritesheets',
                    die: 'Spritesheets'
                },
                projectile: 'alien',
                isBoss: true
            },
            {
                name: 'Treant',
                folder: 'Treant',
                baseHP: 160,
                baseAttack: 36,
                baseDefense: 30,
                sprites: {
                    idle: 'Treant1.png',
                    attack1: 'Treant Attack 2.png',
                    hurt: 'Treant2.png',
                    die: 'Treant4.png'
                },
                projectile: 'treant-projectile.png',
                specialAttack: 'poison',
                isBoss: true
            }
        ]
    }
};

// Helper function to get background by player level
function getBackgroundForLevel(level) {
    const levels = Object.keys(ASSET_CONFIG.backgrounds).map(Number).sort((a, b) => a - b);
    let selectedLevel = 1;
    
    for (const lvl of levels) {
        if (level >= lvl) {
            selectedLevel = lvl;
        } else {
            break;
        }
    }
    
    return ASSET_CONFIG.backgrounds[selectedLevel];
}

// Helper function to get enemy tier based on player level
function getEnemyTier(level) {
    if (level < 10) return 'common';
    if (level < 25) return 'elite';
    return 'boss';
}

// Helper function to calculate special attack damage based on level
function calculateSpecialDamage(monsterType, level) {
    const special = ASSET_CONFIG.monsterSpecials[monsterType];
    if (!special) return 0;
    
    // Scale damage from base to max over levels 1-20
    const progress = Math.min(level, 20) / 20;
    const damage = Math.floor(special.baseDamage + (special.maxDamage - special.baseDamage) * progress);
    
    // Level 20+ bonus: +10% damage
    return level >= 20 ? Math.floor(damage * 1.1) : damage;
}

// Export configuration
if (typeof window !== 'undefined') {
    window.ASSET_CONFIG = ASSET_CONFIG;
    window.getBackgroundForLevel = getBackgroundForLevel;
    window.getEnemyTier = getEnemyTier;
    window.calculateSpecialDamage = calculateSpecialDamage;
}

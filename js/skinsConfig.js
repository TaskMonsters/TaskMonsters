/**
 * Skins Configuration
 * Defines all available skins with their properties, animations, and unlock requirements
 */

const SKINS_CONFIG = {
    // IMP SKIN - Level 10, Mid-game skin with fireball attack
    imp: {
        id: 'imp',
        name: 'Fire Imp',
        price: 800,
        levelRequired: 10,
        tier: 'standard',
        emoji: '👹',
        thumbnail: 'assets/skins/imp/thumbnail.png',
        animations: {
            idle: 'assets/skins/imp/Idle.gif',
            walk: 'assets/skins/imp/Walk.gif',
            attack: 'assets/skins/imp/Attack.gif',
            hurt: 'assets/skins/imp/Hurt.gif',
            death: 'assets/skins/imp/Die.gif',
            jump: 'assets/skins/imp/Idle.gif',
            sleep: 'assets/skins/imp/Idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true,  // Flag to indicate this is a seamless animated sprite
        hasFireball: true  // Special flag for fireball attack
    },

    // PIG SKIN - Level 12, Mid-game skin
    pig: {
        id: 'pig',
        name: 'Fire Pig',
        price: 1000,
        levelRequired: 12,
        tier: 'standard',
        emoji: '🐷',
        thumbnail: 'assets/skins/pig/thumbnail.png',
        animations: {
            idle: 'assets/skins/pig/Idle.gif',
            walk: 'assets/skins/pig/Walk.gif',
            attack: 'assets/skins/pig/Attack.gif',
            hurt: 'assets/skins/pig/Hurt.gif',
            death: 'assets/skins/pig/Die.gif',
            jump: 'assets/skins/pig/Idle.gif',
            sleep: 'assets/skins/pig/Idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Flag to indicate this is a seamless animated sprite
    },

    // CAT SKINS - Level 13+ required for most, Level 20+ for premium
    black_cat: {
        id: 'black_cat',
        name: 'Shadow Cat',
        price: 700,
        levelRequired: 13,  // Unlocks at Level 13
        tier: 'standard',
        emoji: '🐈‍⬛',
        thumbnail: 'assets/skins/BlackCatSlimePaid/PNG/Idle.png',
        animations: {
            idle: 'assets/skins/BlackCatSlimePaid/PNG/Idle.png',
            walk: 'assets/skins/BlackCatSlimePaid/PNG/Walk.png',
            attack: 'assets/skins/BlackCatSlimePaid/PNG/Attack.png',
            hurt: 'assets/skins/BlackCatSlimePaid/PNG/Hurt.png',
            death: 'assets/skins/BlackCatSlimePaid/PNG/Death1.png',
            jump: 'assets/skins/BlackCatSlimePaid/PNG/Jump.png',
            sleep: 'assets/skins/BlackCatSlimePaid/PNG/Sleep.png'
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 22,
            hurt: 10,
            death: 12,
            jump: 13,
            sleep: 4
        },
        spriteSheetWidth: {
            idle: 128,
            walk: 128,
            attack: 704,
            hurt: 320,
            death: 384,
            jump: 416,
            sleep: 512
        }
    },
    
    white_cat: {
        id: 'white_cat',
        name: 'Snow Cat',
        price: 700,
        levelRequired: 15,  // Unlocks at Level 15
        tier: 'standard',
        emoji: '🐈',
        thumbnail: 'assets/skins/WhiteCatSlimePaid/PNG/Idle.png',
        animations: {
            idle: 'assets/skins/WhiteCatSlimePaid/PNG/Idle.png',
            walk: 'assets/skins/WhiteCatSlimePaid/PNG/Walk.png',
            attack: 'assets/skins/WhiteCatSlimePaid/PNG/Attack.png',
            hurt: 'assets/skins/WhiteCatSlimePaid/PNG/Hurt.png',
            death: 'assets/skins/WhiteCatSlimePaid/PNG/Death1.png',
            jump: 'assets/skins/WhiteCatSlimePaid/PNG/Jump.png',
            sleep: 'assets/skins/WhiteCatSlimePaid/PNG/Sleep.png'
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 22,
            hurt: 10,
            death: 12,
            jump: 13,
            sleep: 4
        },
        spriteSheetWidth: {
            idle: 128,
            walk: 128,
            attack: 704,
            hurt: 320,
            death: 384,
            jump: 416,
            sleep: 512
        }
    },
    
    brown_cat: {
        id: 'brown_cat',
        name: 'Brown Cat',
        price: 800,
        levelRequired: 18,  // Unlocks at Level 18
        tier: 'standard',
        emoji: '🐱',
        thumbnail: 'assets/skins/BrownCat/CatSlimeIdle.png',
        animations: {
            idle: 'assets/skins/BrownCat/CatSlimeIdle.png',
            walk: 'assets/skins/BrownCat/CatSlimeWalk.png',
            attack: 'assets/skins/BrownCat/CatSlimeAttack.png',
            hurt: 'assets/skins/BrownCat/CatSlimeHurt.png',
            death: 'assets/skins/BrownCat/CatSlimeDie.png',
            jump: 'assets/skins/BrownCat/CatSlimeJump.png',
            sleep: 'assets/skins/BrownCat/CatSlimeSleep-sheet.png'
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 22,
            hurt: 10,
            death: 12,
            jump: 13,
            sleep: 4
        },
        spriteSheetWidth: {
            idle: 128,
            walk: 128,
            attack: 704,
            hurt: 320,
            death: 384,
            jump: 416,
            sleep: 512
        }
    },
    
    baby_blue_cat: {
        id: 'baby_blue_cat',
        name: 'Sky Cat',
        price: 800,
        levelRequired: 19,  // Unlocks at Level 19
        tier: 'standard',
        thumbnail: 'assets/skins/BabyBlueCatSlimePaid/PNG/Idle.png',
        animations: {
            idle: 'assets/skins/BabyBlueCatSlimePaid/PNG/Idle.png',
            walk: 'assets/skins/BabyBlueCatSlimePaid/PNG/Walk.png',
            attack: 'assets/skins/BabyBlueCatSlimePaid/PNG/Attack.png',
            hurt: 'assets/skins/BabyBlueCatSlimePaid/PNG/Hurt.png',
            death: 'assets/skins/BabyBlueCatSlimePaid/PNG/Death1.png',
            jump: 'assets/skins/BabyBlueCatSlimePaid/PNG/Jump.png',
            sleep: 'assets/skins/BabyBlueCatSlimePaid/PNG/Sleep.png'
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 22,
            hurt: 10,
            death: 12,
            jump: 13,
            sleep: 4
        },
        spriteSheetWidth: {
            idle: 128,
            walk: 128,
            attack: 704,
            hurt: 320,
            death: 384,
            jump: 416,
            sleep: 512
        }
    },
    
    // PREMIUM SKINS - Level 20+ required
    rainbow_cat: {
        id: 'rainbow_cat',
        name: 'Rainbow Cat',
        price: 1100,
        levelRequired: 20,  // Unlocks at Level 20
        tier: 'standard',
        thumbnail: 'assets/skins/RainbowCatSlimePaid/PNG/Idle.png',
        animations: {
            idle: 'assets/skins/RainbowCatSlimePaid/PNG/Idle.png',
            walk: 'assets/skins/RainbowCatSlimePaid/PNG/Walk.png',
            attack: 'assets/skins/RainbowCatSlimePaid/PNG/Attack.png',
            hurt: 'assets/skins/RainbowCatSlimePaid/PNG/Hurt.png',
            death: 'assets/skins/RainbowCatSlimePaid/PNG/Death1.png',
            jump: 'assets/skins/RainbowCatSlimePaid/PNG/Jump.png',
            sleep: 'assets/skins/RainbowCatSlimePaid/PNG/Sleep.png'
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 22,
            hurt: 10,
            death: 12,
            jump: 13,
            sleep: 4
        },
        spriteSheetWidth: {
            idle: 128,
            walk: 128,
            attack: 704,
            hurt: 320,
            death: 384,
            jump: 416,
            sleep: 512
        }
    },
    
    demonic_cat: {
        id: 'demonic_cat',
        name: 'Shadow Demon Cat',
        price: 1100,
        levelRequired: 25,  // Unlocks at Level 25
        tier: 'standard',
        thumbnail: 'assets/skins/DemonicCatSlimePaid/PNG/Idle.png',
        animations: {
            idle: 'assets/skins/DemonicCatSlimePaid/PNG/Idle.png',
            walk: 'assets/skins/DemonicCatSlimePaid/PNG/Walk.png',
            attack: 'assets/skins/DemonicCatSlimePaid/PNG/Attack.png',
            hurt: 'assets/skins/DemonicCatSlimePaid/PNG/Hurt.png',
            death: 'assets/skins/DemonicCatSlimePaid/PNG/Death1.png',
            jump: 'assets/skins/DemonicCatSlimePaid/PNG/Jump.png',
            sleep: 'assets/skins/DemonicCatSlimePaid/PNG/Sleep.png'
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 22,
            hurt: 10,
            death: 12,
            jump: 13,
            sleep: 4
        },
        spriteSheetWidth: {
            idle: 128,
            walk: 128,
            attack: 704,
            hurt: 320,
            death: 384,
            jump: 416,
            sleep: 512
        }
    },
    
    // TASK TOAD - Level 25+ required
    task_toad: {
        id: 'task_toad',
        name: 'Task Toad',
        price: 1200,
        levelRequired: 25,  // Unlocks at Level 25
        tier: 'premium',
        emoji: '🐸',
        thumbnail: 'assets/skins/task-toad/idle.png',
        animations: {
            idle: 'assets/skins/task-toad/idle.png',
            walk: 'assets/skins/task-toad/idle.png',
            attack: 'assets/skins/task-toad/attack.png',
            hurt: 'assets/skins/task-toad/idle.png',
            death: 'assets/skins/task-toad/idle.png',
            jump: 'assets/skins/task-toad/jump.png',
            sleep: 'assets/skins/task-toad/idle.png'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Flag to indicate this is a single seamless image
    },
    
    // TASK PHANTOM - Level 30+ required
    task_phantom: {
        id: 'task_phantom',
        name: 'Task Phantom',
        price: 1400,
        levelRequired: 30,  // Unlocks at Level 30
        tier: 'premium',
        emoji: '👻',
        thumbnail: 'assets/skins/task-phantom/idle.png',
        animations: {
            idle: 'assets/skins/task-phantom/idle.png',
            walk: 'assets/skins/task-phantom/idle.png',
            attack: 'assets/skins/task-phantom/idle.png',
            hurt: 'assets/skins/task-phantom/idle.png',
            death: 'assets/skins/task-phantom/idle.png',
            jump: 'assets/skins/task-phantom/idle.png',
            sleep: 'assets/skins/task-phantom/idle.png'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Flag to indicate this is a single seamless image
    },
    
    // JERRY (TASK BUDDY) - Level 15+ required
    jerry: {
        id: 'jerry',
        name: 'Jerry',
        price: 1000,
        levelRequired: 15,
        tier: 'standard',
        emoji: '🪨',
        thumbnail: 'assets/skins/Jerry-thumbnail.png',
        animations: {
            idle: 'assets/skins/Jerry.gif',
            walk: 'assets/skins/Jerry.gif',
            attack: 'assets/skins/Jerry.gif',
            hurt: 'assets/skins/Jerry.gif',
            death: 'assets/skins/Jerry.gif',
            jump: 'assets/skins/Jerry.gif',
            sleep: 'assets/skins/Jerry.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Animated GIF
    },
    
    // ROCKS ANNE - Level 15+ required
    rocks_anne: {
        id: 'rocks_anne',
        name: 'Rocks Anne',
        price: 1000,
        levelRequired: 15,
        tier: 'standard',
        emoji: '🪨',
        thumbnail: 'assets/skins/rocks-anne-thumbnail.png',
        animations: {
            idle: 'assets/skins/rocks-anne.gif',
            walk: 'assets/skins/rocks-anne.gif',
            attack: 'assets/skins/rocks-anne.gif',
            hurt: 'assets/skins/rocks-anne.gif',
            death: 'assets/skins/rocks-anne.gif',
            jump: 'assets/skins/rocks-anne.gif',
            sleep: 'assets/skins/rocks-anne.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Animated GIF
    },
    
    // ROCK STAR - Level 18+ required
    rock_star: {
        id: 'rock_star',
        name: 'Rock Star',
        price: 1000,
        levelRequired: 18,
        tier: 'premium',
        emoji: '⭐',
        thumbnail: 'assets/skins/rock-star-thumbnail.png',
        animations: {
            idle: 'assets/skins/rock-star.gif',
            walk: 'assets/skins/rock-star.gif',
            attack: 'assets/skins/rock-star.gif',
            hurt: 'assets/skins/rock-star.gif',
            death: 'assets/skins/rock-star.gif',
            jump: 'assets/skins/rock-star.gif',
            sleep: 'assets/skins/rock-star.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Animated GIF
    },

    // FUN BIRD - Level 9+ (300 XP)
    fun_bird: {
        id: 'fun_bird',
        name: 'Fun Bird',
        price: 300,
        levelRequired: 9,
        tier: 'standard',
        emoji: '🐦',
        thumbnail: 'assets/skins/fun-bird/thumbnail.png',
        animations: {
            idle: 'assets/skins/fun-bird/idle.png',
            walk: 'assets/skins/fun-bird/walk.png',
            attack: 'assets/skins/fun-bird/attack.png',
            hurt: 'assets/skins/fun-bird/hurt.png',
            death: 'assets/skins/fun-bird/death.png',
            jump: 'assets/skins/fun-bird/jump.png',
            sleep: 'assets/skins/fun-bird/sleep.png'
        },
        frameCount: {
            idle: 7,
            walk: 7,
            attack: 7,
            hurt: 7,
            death: 7,
            jump: 7,
            sleep: 7
        },
        spriteSheetWidth: {
            idle: 224,
            walk: 224,
            attack: 224,
            hurt: 224,
            death: 224,
            jump: 224,
            sleep: 224
        }
    },

    // HUMAN KNIGHT - Level 12 (800 XP)
    human_knight: {
        id: 'human_knight',
        name: 'Human Knight',
        price: 800,
        levelRequired: 12,
        tier: 'standard',
        emoji: '⚔️',
        thumbnail: 'assets/skins/human-knight/thumbnail.png',
        animations: {
            idle: 'assets/skins/human-knight/Idle.gif',
            walk: 'assets/skins/human-knight/Idle.gif',
            attack: 'assets/skins/human-knight/Attack.gif',
            hurt: 'assets/skins/human-knight/Hurt.gif',
            death: 'assets/skins/human-knight/Die.gif',
            jump: 'assets/skins/human-knight/Jump.gif',
            sleep: 'assets/skins/human-knight/Idle.gif',
            roll: 'assets/skins/human-knight/Roll.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1,
            roll: 1
        },
        spriteSheetWidth: {
            idle: 100,
            walk: 100,
            attack: 100,
            hurt: 100,
            death: 100,
            jump: 100,
            sleep: 100,
            roll: 100
        },
        seamlessImage: true,  // Animated GIF
        spriteSize: { width: 100, height: 55 },  // Slightly smaller than main monsters
        scaleFactor: 0.85  // Scale to 85% of default size
    },

    // HUMAN RANGER - Level 12 (800 XP)
    human_ranger: {
        id: 'human_ranger',
        name: 'Human Ranger',
        price: 800,
        levelRequired: 12,
        tier: 'standard',
        emoji: '🏹',
        thumbnail: 'assets/skins/human-ranger/thumbnail.png',
        animations: {
            idle: 'assets/skins/human-ranger/Idle.gif',
            walk: 'assets/skins/human-ranger/Idle.gif',
            attack: 'assets/skins/human-ranger/Attack.gif',
            hurt: 'assets/skins/human-ranger/Hurt.gif',
            death: 'assets/skins/human-ranger/Die.gif',
            jump: 'assets/skins/human-ranger/Jump.gif',
            sleep: 'assets/skins/human-ranger/Idle.gif',
            roll: 'assets/skins/human-ranger/Roll.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1,
            roll: 1
        },
        spriteSheetWidth: {
            idle: 100,
            walk: 100,
            attack: 220,
            hurt: 100,
            death: 100,
            jump: 100,
            sleep: 100,
            roll: 220
        },
        seamlessImage: true,  // Animated GIF
        spriteSize: { width: 100, height: 55 },  // Slightly smaller than main monsters
        scaleFactor: 0.85  // Scale to 85% of default size
    },

    // LADY IMP - Level 16 (900 XP)
    lady_imp: {
        id: 'lady_imp',
        name: 'Lady Imp',
        price: 900,
        levelRequired: 16,
        tier: 'premium',
        emoji: '👿',
        thumbnail: 'assets/skins/lady-imp/thumbnail.png',
        animations: {
            idle: 'assets/skins/lady-imp/Idle.gif',
            walk: 'assets/skins/lady-imp/Walk.gif',
            attack: 'assets/skins/lady-imp/Attack.gif',
            hurt: 'assets/skins/lady-imp/Hurt.gif',
            death: 'assets/skins/lady-imp/Die.gif',
            jump: 'assets/skins/lady-imp/Idle.gif',
            sleep: 'assets/skins/lady-imp/Idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true,  // Animated GIF
        spriteSize: { width: 32, height: 32 }
    },

    // EYE MONSTER - Level 17 (1000 XP)
    eye_monster: {
        id: 'eye_monster',
        name: 'Eye Monster',
        price: 1000,
        levelRequired: 17,
        tier: 'premium',
        emoji: '👁️',
        thumbnail: 'assets/skins/eye-monster/thumbnail.png',
        animations: {
            idle: 'assets/skins/eye-monster/Idle.gif',
            walk: 'assets/skins/eye-monster/Walk.gif',
            attack: 'assets/skins/eye-monster/Attack.gif',
            hurt: 'assets/skins/eye-monster/Hurt.gif',
            death: 'assets/skins/eye-monster/Die.gif',
            jump: 'assets/skins/eye-monster/Idle.gif',
            sleep: 'assets/skins/eye-monster/Idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true,  // Animated GIF
        spriteSize: { width: 32, height: 32 }
    }


};

/**
 * Helper function to get active monster appearance
 * Returns skin animations if equipped, otherwise default monster animations
 */
function getActiveMonsterAppearance(baseMonsterId, equippedSkinId) {
    if (equippedSkinId && SKINS_CONFIG[equippedSkinId]) {
        const skin = SKINS_CONFIG[equippedSkinId];
        // Any skin can be used with any monster
        return {
            animations: skin.animations,
            frameCount: skin.frameCount,
            spriteSheetWidth: skin.spriteSheetWidth || {}, // Actual sprite sheet widths
            spriteSize: skin.spriteSize || { width: 32, height: 32 }, // Default to 32x32 for cat skins
            spriteRow: skin.spriteRow || 0, // Which row to use for multi-directional sprites (Orc)
            animationRows: skin.animationRows || {}, // Which row for each animation (Blob)
            isSkin: true,
            skinId: equippedSkinId
        };
    }
    
    // Return default monster appearance
    const defaultMonsterMap = {
        luna: 'Owlet_Monster',
        benny: 'Dude_Monster',
        nova: 'Pink_Monster'
    };
    
    const prefix = defaultMonsterMap[baseMonsterId] || 'Pink_Monster';
    
    return {
        animations: {
            idle: `assets/heroes/${prefix}_Idle_4.png`,
            walk: `assets/heroes/${prefix}_Walk_4.png`,
            attack: `assets/heroes/${prefix}_Attack_4.png`,
            jump: `assets/heroes/${prefix}_Jump_8.png`,
            roll: `assets/heroes/${prefix}_Roll.png`
        },
        frameCount: {
            idle: 4,
            walk: 4,
            attack: 4,
            jump: 8,
            roll: 6
        },
        isSkin: false,
        skinId: null
    };
}

/**
 * Get all skins (no longer filtered by monster)
 */
function getAllSkins() {
    return Object.values(SKINS_CONFIG);
}

/**
 * Check if a skin is unlocked for the current user
 */
function isSkinUnlocked(skinId, userLevel, ownedSkins) {
    const skin = SKINS_CONFIG[skinId];
    if (!skin) return false;
    
    // Check if user owns the skin
    if (!ownedSkins || !ownedSkins.includes(skinId)) {
        return false;
    }
    
    // Check level requirement
    if (skin.levelRequired && userLevel < skin.levelRequired) {
        return false;
    }
    
    return true;
}

/**
 * Check if a skin can be purchased (level requirement met, but not owned yet)
 */
function canPurchaseSkin(skinId, userLevel, userXP, ownedSkins) {
    const skin = SKINS_CONFIG[skinId];
    if (!skin) return { canPurchase: false, reason: 'Skin not found' };
    
    // Check if already owned
    if (ownedSkins && ownedSkins.includes(skinId)) {
        return { canPurchase: false, reason: 'Already owned' };
    }
    
    // Check level requirement
    if (skin.levelRequired && userLevel < skin.levelRequired) {
        return { 
            canPurchase: false, 
            reason: `Requires Level ${skin.levelRequired}`,
            levelRequired: skin.levelRequired
        };
    }
    
    // Check XP coins
    if (userXP < skin.price) {
        return { 
            canPurchase: false, 
            reason: `Need ${skin.price - userXP} more XP coins`,
            xpNeeded: skin.price - userXP
        };
    }
    
    return { canPurchase: true, reason: 'Available' };
}

// Export for global access
window.SKINS_CONFIG = SKINS_CONFIG;
window.getActiveMonsterAppearance = getActiveMonsterAppearance;
window.getAllSkins = getAllSkins;
window.isSkinUnlocked = isSkinUnlocked;
window.canPurchaseSkin = canPurchaseSkin;

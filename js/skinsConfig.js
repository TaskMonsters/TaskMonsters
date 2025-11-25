/**
 * Skins Configuration
 * Defines all available skins with their properties, animations, and unlock requirements
 */

const SKINS_CONFIG = {
    // CAT SKINS - Level 15+ required for most, Level 20+ for premium
    black_cat: {
        id: 'black_cat',
        name: 'Shadow Cat',
        price: 400,
        levelRequired: 1,  // Starter skin - available from the beginning
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
        price: 400,
        levelRequired: 15,
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
        price: 500,
        levelRequired: 15,
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
        price: 500,
        levelRequired: 15,
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
        price: 800,
        levelRequired: 20,
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
        price: 800,
        levelRequired: 20,
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

// Boss Enemy Definitions
// Bosses appear every 10 levels and cycle through 3 types

// Treant Boss (Level 10, 40, 70, 100...)
const TREANT_BOSS_DATA = {
    name: 'Treant',
    baseHP: 150,
    baseAttack: 30,
    baseDefense: 25,
    minLevel: 10,
    isBoss: true,
    poisonAttack: true,
    poisonDuration: 2, // 2 turns
    sprites: {
        idle: 'assets/bosses/treant/Treant1.png',
        attack1: 'assets/bosses/treant/Treant2.png',
        attack2: 'assets/bosses/treant/Treant3.png',
        hurt: 'assets/bosses/treant/Treant4.png',
        die: 'assets/bosses/treant/Treant4.png'
    }
};

// Sunny Dragon Boss (Level 20, 50, 80, 110...)
const SUNNY_DRAGON_BOSS_DATA = {
    name: 'Sunny Dragon',
    baseHP: 180,
    baseAttack: 18, // Variable 18-40 damage
    baseDefense: 30,
    minLevel: 20,
    isBoss: true,
    variableDamage: true,
    maxDamage: 40,
    canEvade: true,
    evasionChance: 0.25, // 25% chance to evade
    drainAttackGauge: true, // Reduces attack gauge to 5%
    projectileType: 'dragon-bolt',
    sprites: {
        idle: 'assets/bosses/sunny-dragon/sunny-dragon-fly.gif',
        attack1: 'assets/bosses/sunny-dragon/sunny-dragon-fly.gif',
        attack2: 'assets/bosses/sunny-dragon/sunny-dragon-fly.gif',
        hurt: 'assets/bosses/sunny-dragon/sunny-dragon-fly.gif',
        die: 'assets/bosses/sunny-dragon/sunny-dragon-fly.gif'
    }
};

// Mushroom Boss (Level 30, 60, 90, 120...)
const MUSHROOM_BOSS_DATA = {
    name: 'Mushroom',
    baseHP: 200,
    baseAttack: 50,
    baseDefense: 35,
    minLevel: 30,
    isBoss: true,
    mushroomAttack: true, // Throws mushroom emojis
    mushroomEffectDuration: 2, // 2 turns
    mushroomMissChance: 0.3, // 30% chance to miss
    mushroomSkipChance: 0.2, // 20% chance to skip turn
    drainGauges: true, // Slowly decreases both gauges for 2 turns
    sprites: {
        idle: 'assets/bosses/mushroom/Mushroom-Idle.png',
        attack1: 'assets/bosses/mushroom/Mushroom-Attack.png',
        attack2: 'assets/bosses/mushroom/Mushroom-AttackWithStun.png',
        hurt: 'assets/bosses/mushroom/Mushroom-Hit.png',
        die: 'assets/bosses/mushroom/Mushroom-Die.png',
        stun: 'assets/bosses/mushroom/Mushroom-Stun.png'
    }
};

// Boss type array for cycling
const BOSS_TYPES = [TREANT_BOSS_DATA, SUNNY_DRAGON_BOSS_DATA, MUSHROOM_BOSS_DATA];

// Create a boss enemy for battle
function createBossEnemy(playerLevel) {
    // Determine which boss based on level
    // Level 10, 40, 70... → Treant (index 0)
    // Level 20, 50, 80... → Sunny Dragon (index 1)
    // Level 30, 60, 90... → Mushroom (index 2)
    
    const levelMod = (playerLevel / 10) % 3;
    let bossIndex;
    
    if (levelMod === 1) {
        bossIndex = 0; // Treant
    } else if (levelMod === 2) {
        bossIndex = 1; // Sunny Dragon
    } else {
        bossIndex = 2; // Mushroom
    }
    
    const bossData = BOSS_TYPES[bossIndex];
    
    const boss = new Enemy(
        bossData.name,
        bossData.baseHP,
        bossData.baseAttack,
        bossData.baseDefense,
        bossData.sprites
    );
    
    // Add boss flag
    boss.isBoss = true;
    
    // Add special abilities
    if (bossData.poisonAttack) {
        boss.poisonAttack = true;
        boss.poisonDuration = bossData.poisonDuration;
    }
    
    if (bossData.variableDamage) {
        boss.variableDamage = true;
        boss.maxDamage = bossData.maxDamage;
    }
    
    if (bossData.canEvade) {
        boss.canEvade = true;
        boss.evasionChance = bossData.evasionChance;
    }
    
    if (bossData.drainAttackGauge) {
        boss.drainAttackGauge = true;
    }
    
    if (bossData.projectileType) {
        boss.projectileType = bossData.projectileType;
    }
    
    if (bossData.mushroomAttack) {
        boss.mushroomAttack = true;
        boss.mushroomEffectDuration = bossData.mushroomEffectDuration;
        boss.mushroomMissChance = bossData.mushroomMissChance;
        boss.mushroomSkipChance = bossData.mushroomSkipChance;
    }
    
    if (bossData.drainGauges) {
        boss.drainGauges = true;
    }
    
    // Use Smart AI dynamic scaling for bosses (Blueprint v2.0)
    if (window.enemyAI && window.enemyAI.applyDynamicScaling) {
        // Smart AI applies: BaseHP * (1 + 0.1 * UserLevel)
        window.enemyAI.applyDynamicScaling(boss, playerLevel);
    } else {
        // Fallback: Scale boss stats more aggressively
        boss.attack = boss.baseAttack + playerLevel * 3;
        boss.defense = boss.baseDefense + playerLevel * 2;
        boss.maxHP = boss.baseHP + playerLevel * 10;
        boss.hp = boss.maxHP;
    }
    boss.level = playerLevel;
    boss.tier = 'boss'; // Set tier for Smart AI decision making
    
    return boss;
}

// Check if current level should trigger a boss battle
function isBossLevel(playerLevel) {
    return playerLevel % 10 === 0 && playerLevel >= 10;
}

// Get boss arena background based on boss count
function getBossArenaBackground(bossCount) {
    // Alternate between two arenas
    return (bossCount % 2 === 0) ? 'assets/boss-arenas/BossBattleArena1.png' : 'assets/boss-arenas/BossBattleArena2.png';
}

// Export to global scope
window.createBossEnemy = createBossEnemy;
window.isBossLevel = isBossLevel;
window.getBossArenaBackground = getBossArenaBackground;
window.TREANT_BOSS_DATA = TREANT_BOSS_DATA;
window.SUNNY_DRAGON_BOSS_DATA = SUNNY_DRAGON_BOSS_DATA;
window.MUSHROOM_BOSS_DATA = MUSHROOM_BOSS_DATA;

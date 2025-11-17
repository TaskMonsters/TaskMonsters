/**
 * Enemy Tier Selection System
 * Dynamically selects enemies based on player level
 */

const ENEMY_TIER_SYSTEM = {
    // Get appropriate enemy tier based on player level
    getEnemyTier(playerLevel) {
        if (playerLevel < 5) {
            return 'common';
        } else if (playerLevel < 15) {
            // 70% common, 30% elite
            return Math.random() < 0.7 ? 'common' : 'elite';
        } else if (playerLevel < 25) {
            // 50% common, 40% elite, 10% boss
            const roll = Math.random();
            if (roll < 0.5) return 'common';
            if (roll < 0.9) return 'elite';
            return 'boss';
        } else {
            // Level 25+: 30% common, 50% elite, 20% boss
            const roll = Math.random();
            if (roll < 0.3) return 'common';
            if (roll < 0.8) return 'elite';
            return 'boss';
        }
    },
    
    // Get random enemy from tier
    getEnemyByTier(tier) {
        if (!window.ASSET_CONFIG || !window.ASSET_CONFIG.enemies) {
            console.error('ASSET_CONFIG not loaded');
            return null;
        }
        
        const enemies = window.ASSET_CONFIG.enemies;
        
        // assetConfig has enemies organized as: { common: [...], elite: [...], boss: [...] }
        const tierEnemies = enemies[tier];
        
        if (!tierEnemies || tierEnemies.length === 0) {
            console.warn(`No enemies found for tier: ${tier}`);
            return null;
        }
        
        const selectedEnemy = tierEnemies[Math.floor(Math.random() * tierEnemies.length)];
        
        // Build full sprite paths
        const basePath = `assets/enemies/${selectedEnemy.folder}/`;
        const fullSprites = {
            idle: basePath + selectedEnemy.sprites.idle,
            attack: basePath + selectedEnemy.sprites.attack,
            hurt: basePath + selectedEnemy.sprites.hurt,
            die: basePath + selectedEnemy.sprites.die
        };
        
        // Add tier property and full sprite paths
        return { ...selectedEnemy, tier, sprites: fullSprites };
    },
    
    // Select enemy based on player level
    selectEnemy(playerLevel) {
        const tier = this.getEnemyTier(playerLevel);
        const enemy = this.getEnemyByTier(tier);
        
        if (!enemy) {
            console.error('Failed to select enemy');
            return null;
        }
        
        // Scale enemy stats by player level
        const scaledEnemy = this.scaleEnemyStats(enemy, playerLevel, tier);
        
        return scaledEnemy;
    },
    
    // Scale enemy stats based on player level and tier
    scaleEnemyStats(enemy, playerLevel, tier) {
        const baseEnemy = { ...enemy };
        
        // Base stats
        let hp = baseEnemy.hp || 50;
        let attack = baseEnemy.attack || 8;
        let defense = baseEnemy.defense || 3;
        
        // Tier multipliers
        const tierMultipliers = {
            common: { hp: 1.0, attack: 1.0, defense: 1.0 },
            elite: { hp: 1.5, attack: 1.3, defense: 1.2 },
            boss: { hp: 2.5, attack: 1.6, defense: 1.5 }
        };
        
        const multiplier = tierMultipliers[tier] || tierMultipliers.common;
        
        // Level scaling (1-30)
        const levelScale = 1 + (playerLevel - 1) * 0.1; // +10% per level
        
        // Apply scaling
        hp = Math.floor(hp * multiplier.hp * levelScale);
        attack = Math.floor(attack * multiplier.attack * levelScale);
        defense = Math.floor(defense * multiplier.defense * levelScale);
        
        // Ensure minimum stats
        hp = Math.max(20, hp);
        attack = Math.max(5, attack);
        defense = Math.max(2, defense);
        
        // Create Enemy instance with scaled stats
        const enemyData = {
            ...baseEnemy,
            hp,
            maxHP: hp,
            attack,
            defense,
            level: playerLevel,
            tier,
            isEnraged: false,
            enrageThreshold: 0.3 // 30% HP
        };
        
        // Return Enemy instance (not plain object)
        return new Enemy(
            enemyData.name,
            enemyData.hp,
            enemyData.attack,
            enemyData.defense,
            enemyData.sprites,
            enemyData.tier,
            enemyData.level
        );
    },
    
    // Check if enemy should enrage
    checkEnrage(enemy) {
        if (enemy.tier !== 'boss') return false;
        if (enemy.isEnraged) return false;
        
        const hpPercent = enemy.hp / enemy.maxHP;
        
        if (hpPercent <= enemy.enrageThreshold) {
            return true;
        }
        
        return false;
    },
    
    // Apply enrage stat boosts
    applyEnrage(enemy) {
        if (enemy.isEnraged) return enemy;
        
        enemy.isEnraged = true;
        
        // Boost stats by 30%
        enemy.attack = Math.floor(enemy.attack * 1.3);
        enemy.defense = Math.floor(enemy.defense * 1.3);
        
        // Play enrage music
        if (window.battleMusicSystem) {
            window.battleMusicSystem.playBossEnrage();
        }
        
        // Log enrage
        if (window.addBattleLog) {
            window.addBattleLog(`🔥 ${enemy.name} ENRAGED! Attack and Defense increased!`);
        }
        
        return enemy;
    }
};

// Make globally available
window.ENEMY_TIER_SYSTEM = ENEMY_TIER_SYSTEM;

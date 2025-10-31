// Enemy AI Enhancement System
// Adds adaptive healing, smart defense, and weighted encounter progression

(function() {
    'use strict';
    
    // ===== WEIGHTED ENCOUNTER PROGRESSION =====
    
    function getWeightedEnemyPool(playerLevel) {
        const pools = {
            early: ['Lazy Bat', 'Slime'],
            mid: ['Lazy Bat II', 'Alien'],
            advanced: ['Ghost Task Stopper'],
            late: ['Octopus', 'Medusa', 'Fire Skull', 'Lazy Eye', 'Ogre']
        };
        
        let weights = {};
        
        if (playerLevel <= 3) {
            // Levels 1-3: Only early enemies
            weights['Lazy Bat'] = 60;
            weights['Slime'] = 40;
        } else if (playerLevel <= 6) {
            // Levels 4-6: Add mid-tier
            weights['Lazy Bat'] = 30;
            weights['Slime'] = 20;
            weights['Lazy Bat II'] = 30;
            weights['Alien'] = 20;
        } else if (playerLevel <= 9) {
            // Levels 7-9: Add advanced (Octopus unlocks at 7)
            weights['Lazy Bat'] = 15;
            weights['Slime'] = 15;
            weights['Lazy Bat II'] = 20;
            weights['Alien'] = 15;
            weights['Octopus'] = 20;
            weights['Ghost Task Stopper'] = 15;
        } else {
            // Level 10+: All enemies weighted by proximity
            weights['Lazy Bat'] = 8;
            weights['Slime'] = 8;
            weights['Lazy Bat II'] = 12;
            weights['Alien'] = 12;
            weights['Octopus'] = 15;
            weights['Ghost Task Stopper'] = 15;
            weights['Medusa'] = 10;
            weights['Fire Skull'] = 10;
            weights['Lazy Eye'] = 5;
            weights['Ogre'] = 5;
        }
        
        return weights;
    }
    
    function selectWeightedEnemy(playerLevel, availableEnemies) {
        const weights = getWeightedEnemyPool(playerLevel);
        
        // Filter available enemies by weight
        const weightedPool = availableEnemies.filter(e => weights[e.name]);
        
        if (weightedPool.length === 0) {
            // Fallback to random if no weighted enemies
            return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        }
        
        // Calculate total weight
        const totalWeight = weightedPool.reduce((sum, e) => sum + (weights[e.name] || 0), 0);
        
        // Random selection based on weights
        let random = Math.random() * totalWeight;
        
        for (const enemy of weightedPool) {
            random -= weights[enemy.name] || 0;
            if (random <= 0) {
                return enemy;
            }
        }
        
        // Fallback
        return weightedPool[0];
    }
    
    // ===== ADAPTIVE HEALING SYSTEM =====
    
    function calculateHealChance(enemy, playerLevel) {
        const hpRatio = enemy.hp / enemy.maxHP;
        const isLowHealth = hpRatio < 0.4;
        const isMidHealth = hpRatio < 0.7;
        
        // Base heal chance by tier
        let baseHealChance = 0.10; // Default 10%
        
        if (enemy.tier === 'boss') {
            baseHealChance = 0.25;
        } else if (enemy.tier === 'mid') {
            baseHealChance = 0.18;
        }
        
        // Adaptive boost based on HP
        let adaptiveBoost = 0;
        if (isLowHealth) {
            adaptiveBoost = 0.20; // +20% when HP < 40%
        } else if (isMidHealth) {
            adaptiveBoost = 0.10; // +10% when HP < 70%
        }
        
        // Level-based boost (scales every 5 levels, capped at +8%)
        const levelBoost = Math.min(Math.floor(playerLevel / 5) * 0.02, 0.08);
        
        return baseHealChance + adaptiveBoost + levelBoost;
    }
    
    function getMaxHealsForLevel(enemyLevel) {
        // Determine max heals based on enemy level
        if (enemyLevel >= 50) {
            return 6;
        } else if (enemyLevel >= 20) {
            return 5;
        } else if (enemyLevel >= 10) {
            return 3;
        } else {
            return 1; // Level 1-9
        }
    }
    
    function attemptEnemyHeal(enemy, playerLevel) {
        // Initialize heal counter if not present
        if (typeof enemy.healCount === 'undefined') {
            enemy.healCount = 0;
        }
        
        // Get enemy level (use playerLevel as proxy for enemy level if not set)
        const enemyLevel = enemy.level || playerLevel;
        const maxHeals = getMaxHealsForLevel(enemyLevel);
        
        // Check if enemy has reached heal limit
        if (enemy.healCount >= maxHeals) {
            return { healed: false, limitReached: true };
        }
        
        const healChance = calculateHealChance(enemy, playerLevel);
        
        if (Math.random() < healChance) {
            // Heal 10-25% of max HP
            const healAmount = Math.round(enemy.maxHP * (0.10 + Math.random() * 0.15));
            enemy.hp = Math.min(enemy.maxHP, enemy.hp + healAmount);
            enemy.healCount++;
            
            return {
                healed: true,
                amount: healAmount,
                healCount: enemy.healCount,
                maxHeals: maxHeals
            };
        }
        
        return { healed: false };
    }
    
    // ===== SMART DEFENSE SYSTEM =====
    
    function calculateDefenseChance(enemy) {
        const hpRatio = enemy.hp / enemy.maxHP;
        
        // Base defense chance
        let baseDefenseChance = enemy.specialDefense ? (enemy.defenseChance || 0.15) : 0.05;
        
        // Adaptive boost when low HP
        const adaptiveBoost = hpRatio < 0.4 ? 0.10 : (hpRatio < 0.3 ? 0.15 : 0);
        
        return baseDefenseChance + adaptiveBoost;
    }
    
    function attemptEnemyDefense(enemy) {
        const defenseChance = calculateDefenseChance(enemy);
        
        if (Math.random() < defenseChance) {
            enemy.isDefending = true;
            return true;
        }
        
        return false;
    }
    
    // ===== DIFFICULTY SCALING =====
    
    function getDifficultyScaling(playerLevel) {
        // Every 5 levels, increase difficulty (capped)
        const scaleTier = Math.floor(playerLevel / 5);
        
        return {
            healBonus: Math.min(scaleTier * 0.02, 0.10), // +2% per tier, max +10%
            defenseBonus: Math.min(scaleTier * 0.02, 0.10), // +2% per tier, max +10%
            hpBonus: Math.min(scaleTier * 0.05, 0.25) // +5% per tier, max +25%
        };
    }
    
    // ===== EXPORT TO GLOBAL SCOPE =====
    
    window.enemyAI = {
        getWeightedEnemyPool,
        selectWeightedEnemy,
        attemptEnemyHeal,
        attemptEnemyDefense,
        getDifficultyScaling,
        getMaxHealsForLevel
    };
    
    console.log('✅ Enemy AI Enhancement System loaded');
    
})();

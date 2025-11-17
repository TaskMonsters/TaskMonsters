// Smart Enemy AI System (Section 3.2 - Blueprint v2.0)
// Priority-based decision making for strategic, non-random combat
// COMPLETE INTEGRATION - Handles ALL enemy actions

(function() {
    'use strict';
    
    // ===== SMART ENEMY AI DECISION SYSTEM =====
    
    /**
     * Smart Enemy AI - Priority-based decision making
     * The AI executes a sequential, prioritized check of conditions
     * First condition met dictates the action
     */
    function makeSmartDecision(enemy, hero, battleManager) {
        // Get enemy tier for special attack chance
        const tier = enemy.tier || 'common';
        const isBoss = tier === 'boss';
        const isElite = tier === 'elite';
        
        const hpRatio = enemy.hp / enemy.maxHP;
        
        // Initialize heal counter if not present
        if (typeof enemy.healCount === 'undefined') {
            enemy.healCount = 0;
        }
        
        // Get max heals based on enemy level
        const enemyLevel = enemy.level || hero.level;
        const maxHeals = getMaxHealsForLevel(enemyLevel);
        const canHeal = enemy.healCount < maxHeals;
        
        // PRIORITY 1: HEAL
        // Condition: HP < 30% AND healing is available
        // Intent: Survival (40% chance to attempt heal)
        if (hpRatio < 0.30 && canHeal) {
            if (Math.random() < 0.40) {
                return {
                    action: 'heal',
                    reason: 'Survival - Low HP detected'
                };
            }
        }
        
        // PRIORITY 2: DEFEND
        // Condition: Player's last action was high-damage OR Player Attack > Enemy Defense
        // Intent: Mitigation (30% chance, 50% damage reduction)
        const playerAttackHigher = hero.attack > enemy.defense;
        const lastActionHighDamage = battleManager && battleManager.lastPlayerDamage > (enemy.maxHP * 0.15);
        
        if (playerAttackHigher || lastActionHighDamage) {
            if (Math.random() < 0.30) {
                return {
                    action: 'defend',
                    reason: 'Mitigation - Proactive damage reduction',
                    damageReduction: 0.50
                };
            }
        }
        
        // PRIORITY 3: SPECIAL ATTACK
        // Condition: Enemy has special ability AND HP > 50%
        // Intent: Offensive Pressure (Bosses 30%, Elites 15%, Special enemies 20%)
        const hasSpecialAbility = enemy.canPetrify || enemy.poisonAttack || enemy.drainAttackGauge || 
                                   enemy.mushroomAttack || enemy.projectileType;
        
        if (hasSpecialAbility && hpRatio > 0.50) {
            let specialChance = 0.20; // Default for special enemies
            if (isBoss) specialChance = 0.30;
            else if (isElite) specialChance = 0.15;
            
            if (Math.random() < specialChance) {
                return {
                    action: 'special',
                    reason: 'Offensive Pressure - Use special ability when strong'
                };
            }
        }
        
        // PRIORITY 4: DEBUFF/BUFF
        // Condition: Status effect is available AND not currently applied
        // Intent: Control (20% chance)
        const hasStatusAbility = enemy.canStun || enemy.canPoison || enemy.canWeaken || enemy.canBuff;
        const statusNotActive = !enemy.activeStatus;
        
        if (hasStatusAbility && statusNotActive) {
            if (Math.random() < 0.20) {
                return {
                    action: 'status',
                    reason: 'Control - Strategic weakening/strengthening'
                };
            }
        }
        
        // PRIORITY 5: ATTACK
        // Condition: Default action
        // Intent: Standard damage output
        return {
            action: 'attack',
            reason: 'Execution - Standard damage output'
        };
    }
    
    // ===== HEALING SYSTEM =====
    
    function getMaxHealsForLevel(enemyLevel) {
        if (enemyLevel >= 50) return 6;
        if (enemyLevel >= 20) return 5;
        if (enemyLevel >= 10) return 3;
        return 1; // Level 1-9
    }
    
    function executeHeal(enemy, playerLevel) {
        // Lazy Bats cannot heal
        if (enemy.name === 'Lazy Bat' || enemy.name === 'Lazy Bat II') {
            return { healed: false };
        }
        
        // Initialize heal counter
        if (typeof enemy.healCount === 'undefined') {
            enemy.healCount = 0;
        }
        
        const enemyLevel = enemy.level || playerLevel;
        const maxHeals = getMaxHealsForLevel(enemyLevel);
        
        // Check heal limit
        if (enemy.healCount >= maxHeals) {
            return { healed: false, limitReached: true };
        }
        
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
    
    // ===== SPECIAL ATTACK EXECUTION =====
    
    /**
     * Determine which special attack the enemy should use
     */
    function getSpecialAttackType(enemy) {
        // Medusa - Petrify
        if (enemy.canPetrify) {
            return 'petrify';
        }
        
        // Poison attack (Scorpion, etc.)
        if (enemy.poisonAttack) {
            return 'poison';
        }
        
        // Sunny Dragon - Attack gauge drain
        if (enemy.drainAttackGauge) {
            return 'drain_gauge';
        }
        
        // Mushroom - Confusion attack
        if (enemy.mushroomAttack) {
            return 'mushroom';
        }
        
        // Projectile-based enemies (Ghost, etc.)
        if (enemy.projectileType) {
            return 'projectile';
        }
        
        // Default to normal attack
        return 'attack';
    }
    
    // ===== WEIGHTED ENCOUNTER PROGRESSION =====
    
    function getWeightedEnemyPool(playerLevel) {
        let weights = {};
        
        if (playerLevel <= 3) {
            weights['Lazy Bat'] = 60;
            weights['Slime'] = 40;
        } else if (playerLevel <= 6) {
            weights['Lazy Bat'] = 30;
            weights['Slime'] = 20;
            weights['Lazy Bat II'] = 30;
            weights['Alien'] = 20;
        } else if (playerLevel <= 9) {
            weights['Lazy Bat'] = 15;
            weights['Slime'] = 15;
            weights['Lazy Bat II'] = 20;
            weights['Alien'] = 15;
            weights['Octopus'] = 20;
            weights['Ghost Task Stopper'] = 15;
        } else {
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
        const weightedPool = availableEnemies.filter(e => weights[e.name]);
        
        if (weightedPool.length === 0) {
            return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        }
        
        const totalWeight = weightedPool.reduce((sum, e) => sum + (weights[e.name] || 0), 0);
        let random = Math.random() * totalWeight;
        
        for (const enemy of weightedPool) {
            random -= weights[enemy.name] || 0;
            if (random <= 0) {
                return enemy;
            }
        }
        
        return weightedPool[0];
    }
    
    // ===== DYNAMIC SCALING (Section 3.1) =====
    
    function applyDynamicScaling(enemy, userLevel) {
        // Scaling Formula from Blueprint:
        // Enemy HP: BaseHP * (1 + 0.1 * UserLevel)
        // Enemy Attack: BaseAttack * (1 + 0.08 * UserLevel)
        // Enemy Defense: BaseDefense * (1 + 0.05 * UserLevel)
        
        if (!enemy.baseHP) enemy.baseHP = enemy.maxHP;
        if (!enemy.baseAttack) enemy.baseAttack = enemy.attack;
        if (!enemy.baseDefense) enemy.baseDefense = enemy.defense;
        
        enemy.maxHP = Math.floor(enemy.baseHP * (1 + 0.1 * userLevel));
        enemy.hp = enemy.maxHP;
        enemy.attack = Math.floor(enemy.baseAttack * (1 + 0.08 * userLevel));
        enemy.defense = Math.floor(enemy.baseDefense * (1 + 0.05 * userLevel));
        
        return enemy;
    }
    
    // ===== LEGACY COMPATIBILITY WRAPPERS =====
    
    /**
     * Wrapper for heal attempts (maintains compatibility)
     */
    function attemptEnemyHeal(enemy, playerLevel) {
        const hpRatio = enemy.hp / enemy.maxHP;
        
        // Only heal if HP < 30%
        if (hpRatio >= 0.30) {
            return { healed: false };
        }
        
        // 40% chance to heal
        if (Math.random() >= 0.40) {
            return { healed: false };
        }
        
        return executeHeal(enemy, playerLevel);
    }
    
    /**
     * Wrapper for defense attempts (maintains compatibility)
     */
    function attemptEnemyDefense(enemy) {
        // This is called from battleManager if needed
        // Return true if enemy should defend this turn
        return false; // Handled by makeSmartDecision now
    }
    
    // ===== EXPORT TO GLOBAL SCOPE =====
    
    window.enemyAI = {
        // Main decision system
        makeSmartDecision,
        getSpecialAttackType,
        
        // Action execution
        executeHeal,
        
        // Encounter system
        getWeightedEnemyPool,
        selectWeightedEnemy,
        getMaxHealsForLevel,
        
        // Scaling
        applyDynamicScaling,
        
        // Legacy compatibility
        attemptEnemyHeal,
        attemptEnemyDefense
    };
    
    console.log('✅ Smart Enemy AI System loaded (Blueprint v2.0 - FULL INTEGRATION)');
    
})();

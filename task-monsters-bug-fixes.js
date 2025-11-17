/**
 * TASK MONSTERS - BUG FIXES
 * Version: 3.15
 * 
 * Add this script to your index.html right before </body> tag:
 * <script src="task-monsters-bug-fixes.js?v=3.15"></script>
 * 
 * Fixes:
 * 1. Special attack animations not playing
 * 2. Loot system mismatch between battle log and post-battle modal
 * 3. Modal navigation returning to home page
 * 4. Game balance adjustments (stronger enemies, slightly weaker player)
 */

(function() {
    'use strict';
    
    console.log('🔧 Task Monsters Bug Fixes v3.15 loading...');
    
    // ==============================================
    // FIX #1: SPECIAL ATTACK ANIMATION
    // ==============================================
    
    function patchSpecialAttackAnimation() {
        // Wait for battleManager to be available
        const checkBattleManager = setInterval(() => {
            if (window.battleManager && typeof window.battleManager.playerSpecialAttack === 'function') {
                clearInterval(checkBattleManager);
                
                // Store original function
                const originalSpecialAttack = window.battleManager.playerSpecialAttack.bind(window.battleManager);
                
                // Override with animation-enabled version
                window.battleManager.playerSpecialAttack = function() {
                    console.log('⚡ Special Attack triggered!');
                    
                    // Check gauge
                    if (this.specialGauge < 100) {
                        this.addBattleLog('⚡ Special gauge not full! Need 100%');
                        return;
                    }
                    
                    // CRITICAL: Play animation FIRST
                    if (window.specialAttackAnimations && typeof window.specialAttackAnimations.playSpecialAttack === 'function') {
                        console.log('🎬 Playing special attack animation...');
                        window.specialAttackAnimations.playSpecialAttack(this.currentEnemy);
                    } else {
                        console.warn('⚠️ Special attack animations not available');
                    }
                    
                    // Then call original function
                    originalSpecialAttack();
                };
                
                console.log('✅ Fix #1: Special attack animation patched');
            }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkBattleManager), 10000);
    }
    
    // ==============================================
    // FIX #2: LOOT SYSTEM CONSISTENCY
    // ==============================================
    
    function patchLootSystem() {
        const checkBattleManager = setInterval(() => {
            if (window.battleManager && typeof window.battleManager.endBattle === 'function') {
                clearInterval(checkBattleManager);
                
                // Store original function
                const originalEndBattle = window.battleManager.endBattle.bind(window.battleManager);
                
                // Override with fixed loot logic
                window.battleManager.endBattle = function(victory) {
                    if (!victory) {
                        originalEndBattle(false);
                        return;
                    }
                    
                    // Calculate rewards
                    const xpGain = this.calculateXPGain ? this.calculateXPGain() : 50;
                    let actualLootItem = null;
                    
                    // Loot drop chance (20%)
                    const lootRoll = Math.random();
                    if (lootRoll < 0.20) {
                        const lootTable = ['Fireball', 'Potion', 'Hyper Potion', 'Asteroid', 'Prickler'];
                        actualLootItem = lootTable[Math.floor(Math.random() * lootTable.length)];
                        
                        // CRITICAL: Add item to inventory
                        if (actualLootItem === 'Fireball' && typeof gameState !== 'undefined') {
                            gameState.fireballs = (gameState.fireballs || 0) + 1;
                            console.log('🎁 Added Fireball to inventory');
                        } else if (actualLootItem === 'Potion' && typeof gameState !== 'undefined') {
                            gameState.potions = (gameState.potions || 2) + 1;
                            console.log('🎁 Added Potion to inventory');
                        } else if (actualLootItem === 'Hyper Potion' && typeof gameState !== 'undefined') {
                            gameState.hyperPotions = (gameState.hyperPotions || 0) + 1;
                            console.log('🎁 Added Hyper Potion to inventory');
                        } else if (actualLootItem === 'Asteroid' && typeof gameState !== 'undefined') {
                            gameState.asteroids = (gameState.asteroids || 0) + 1;
                            console.log('🎁 Added Asteroid to inventory');
                        } else if (actualLootItem === 'Prickler' && typeof gameState !== 'undefined') {
                            gameState.pricklers = (gameState.pricklers || 0) + 1;
                            console.log('🎁 Added Prickler to inventory');
                        }
                        
                        // Log ONLY when loot actually drops
                        this.addBattleLog(`🎁 Rare loot! Found ${actualLootItem}!`);
                    }
                    
                    // Save game state
                    if (typeof saveGameState === 'function') {
                        saveGameState();
                    }
                    
                    // Show results with correct loot info (null if no loot)
                    if (typeof this.showBattleResults === 'function') {
                        this.showBattleResults(true, xpGain, actualLootItem);
                    }
                };
                
                console.log('✅ Fix #2: Loot system consistency patched');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkBattleManager), 10000);
    }
    
    // ==============================================
    // FIX #3: MODAL NAVIGATION TO HOME
    // ==============================================
    
    function patchModalNavigation() {
        // Create universal modal close function
        window.closeBattleModalFixed = function() {
            console.log('🏠 Closing battle modal and returning to home...');
            
            // Hide battle modal
            const battleModal = document.getElementById('battleModal');
            if (battleModal) {
                battleModal.classList.remove('active');
                battleModal.style.display = 'none';
            }
            
            // Hide battle section
            const battleSection = document.getElementById('battleSection');
            if (battleSection) {
                battleSection.style.display = 'none';
            }
            
            // Show planner section (home)
            const plannerSection = document.getElementById('plannerSection');
            if (plannerSection) {
                plannerSection.style.display = 'block';
            }
            
            // Hide other sections
            ['shopSection', 'inventorySection', 'statsSection'].forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) section.style.display = 'none';
            });
            
            // Refresh UI
            if (typeof updateUI === 'function') {
                updateUI();
            }
            if (typeof updateTasksDisplay === 'function') {
                updateTasksDisplay();
            }
            
            console.log('✅ Returned to home page');
        };
        
        // Attach to all battle-related buttons after DOM loads
        setTimeout(() => {
            const selectors = [
                '.battle-result-btn',
                '.close-battle-btn',
                '.return-home-btn',
                '[onclick*="closeBattle"]',
                'button:contains("Continue")',
                'button:contains("Try Again")',
                'button:contains("Return")'
            ];
            
            selectors.forEach(selector => {
                try {
                    const buttons = document.querySelectorAll(selector);
                    buttons.forEach(btn => {
                        btn.addEventListener('click', window.closeBattleModalFixed);
                        console.log(`🔗 Attached navigation fix to button: ${btn.textContent}`);
                    });
                } catch (e) {
                    // Ignore invalid selectors
                }
            });
        }, 2000);
        
        console.log('✅ Fix #3: Modal navigation patched');
    }
    
    // ==============================================
    // FIX #4: GAME BALANCE ADJUSTMENTS
    // ==============================================
    
    function patchGameBalance() {
        // Patch enemy stats (make stronger)
        const checkEnemyTier = setInterval(() => {
            if (window.enemyTierSystem && window.enemyTierSystem.enemies) {
                clearInterval(checkEnemyTier);
                
                const enemies = window.enemyTierSystem.enemies;
                
                // Increase all enemy stats by 25-30%
                Object.keys(enemies).forEach(enemyKey => {
                    const enemy = enemies[enemyKey];
                    if (enemy.baseHP) {
                        enemy.baseHP = Math.floor(enemy.baseHP * 1.3); // +30% HP
                        enemy.baseAttack = Math.floor((enemy.baseAttack || 10) * 1.25); // +25% Attack
                        enemy.baseDefense = Math.floor((enemy.baseDefense || 5) * 1.25); // +25% Defense
                        console.log(`💪 Buffed ${enemyKey}: HP=${enemy.baseHP}, ATK=${enemy.baseAttack}, DEF=${enemy.baseDefense}`);
                    }
                });
                
                console.log('✅ Fix #4a: Enemy stats increased (25-30% stronger)');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkEnemyTier), 10000);
        
        // Patch player stats (make slightly weaker)
        const checkLevelSystem = setInterval(() => {
            if (window.levelSystem && typeof window.levelSystem.calculatePlayerStats === 'function') {
                clearInterval(checkLevelSystem);
                
                // Store original function
                const originalCalcStats = window.levelSystem.calculatePlayerStats.bind(window.levelSystem);
                
                // Override with nerfed stats
                window.levelSystem.calculatePlayerStats = function(level) {
                    const original = originalCalcStats(level);
                    
                    return {
                        maxHP: Math.floor(original.maxHP * 0.90), // -10% HP
                        attack: Math.floor(original.attack * 0.85), // -15% Attack
                        defense: Math.floor(original.defense * 0.90), // -10% Defense
                        specialPower: original.specialPower || 1.5 // Keep special power
                    };
                };
                
                console.log('✅ Fix #4b: Player stats reduced (10-15% weaker)');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkLevelSystem), 10000);
    }
    
    // ==============================================
    // INITIALIZE ALL FIXES
    // ==============================================
    
    function initializeFixes() {
        console.log('🚀 Initializing bug fixes...');
        
        patchSpecialAttackAnimation();
        patchLootSystem();
        patchModalNavigation();
        patchGameBalance();
        
        console.log('✅ All bug fixes initialized!');
    }
    
    // Run fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFixes);
    } else {
        // DOM already loaded
        initializeFixes();
    }
    
    // Also run after a delay to catch late-loaded scripts
    setTimeout(initializeFixes, 3000);
    
})();

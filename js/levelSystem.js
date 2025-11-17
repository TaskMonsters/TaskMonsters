// Level System with Level 30 Cap and Exponential XP Scaling
// Replaces existing level logic

const LEVEL_SYSTEM = {
    MAX_LEVEL: 50,  // Blueprint v2.0: Level cap increased to 50
    
    // Exponential XP formula with smooth progression
    xpRequiredForLevel(level) {
        if (level >= this.MAX_LEVEL) return Infinity;
        // Smooth curve: starts at 100, increases gradually
        // Formula: 100 * (1.15^level) for smoother progression than 1.2
        return Math.floor(100 * Math.pow(1.15, level));
    },
    
    // Calculate total XP needed to reach a level
    totalXPForLevel(level) {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += this.xpRequiredForLevel(i);
        }
        return total;
    },
    
    // Calculate XP gain from battle
    calculateBattleXP(enemyLevel, actionsUsed) {
        return 50 + (enemyLevel * 10) + Math.floor(actionsUsed / 2);
    },
    
    // Level milestone unlocks
    milestones: {
        5: {
            unlock: 'Elite enemies and secondary battle theme',
            message: '🎵 Elite enemies unlocked! New battle music available.'
        },
        10: {
            unlock: 'Hyper Potion + stronger loot',
            message: '💊 Hyper Potion unlocked! Stronger loot now available.'
        },
        15: {
            unlock: 'Boss encounters unlocked',
            message: '👹 Boss encounters unlocked! Prepare for epic battles!'
        },
        20: {
            unlock: 'Special Attack damage boost (+10%)',
            message: '⚡ Special Attack damage increased by 10%!'
        },
        25: {
            unlock: 'Rare item drops + new battle arena themes',
            message: '🎁 Rare items and new arenas unlocked!'
        },
        30: {
            unlock: 'Advanced Boss encounters and rare items',
            message: '👑 Level 30! Advanced bosses and rare items unlocked!'
        },
        35: {
            unlock: 'Asteroid Attack unlocked',
            message: '🪨 Asteroid Attack unlocked! Massive damage with risk!'
        },
        40: {
            unlock: 'Legendary item drops',
            message: '✨ Legendary items now available!'
        },
        45: {
            unlock: 'Ultimate Boss encounters',
            message: '🔥 Ultimate Bosses unlocked! Prepare for the toughest fights!'
        },
        50: {
            unlock: 'MAX LEVEL – Master Champion Badge and exclusive rewards',
            message: '🏆 MAX LEVEL 50 REACHED! You are a Master Champion! 🎉'
        }
    },
    
    // Check if player can level up
    canLevelUp(currentLevel, currentXP) {
        if (currentLevel >= this.MAX_LEVEL) return false;
        const required = this.xpRequiredForLevel(currentLevel);
        return currentXP >= required;
    },
    
    // Process level up and return milestone info
    levelUp(currentLevel) {
        if (currentLevel >= this.MAX_LEVEL) {
            return {
                success: false,
                message: '🏆 MAX LEVEL REACHED!',
                milestone: null
            };
        }
        
        const newLevel = currentLevel + 1;
        const milestone = this.milestones[newLevel];
        
        return {
            success: true,
            newLevel: newLevel,
            milestone: milestone || null,
            message: milestone ? milestone.message : `Level ${newLevel} reached!`
        };
    },
    
    // Get progress percentage to next level
    getLevelProgress(currentLevel, currentXP) {
        if (currentLevel >= this.MAX_LEVEL) return 100;
        
        const required = this.xpRequiredForLevel(currentLevel);
        return Math.min(100, (currentXP / required) * 100);
    }
};

// Integration with existing game state
function updatePlayerXP(xpGain) {
    if (!gameState || !gameState.hero) {
        console.error('Game state not initialized');
        return;
    }
    
    const hero = gameState.hero;
    
    // Check if already at max level
    if (hero.level >= LEVEL_SYSTEM.MAX_LEVEL) {
        addBattleLog('🏆 Already at MAX LEVEL!');
        showMaxLevelBanner();
        return;
    }
    
    // Add XP
    hero.xp = (hero.xp || 0) + xpGain;
    
    // Show XP gain animation
    showFloatingText(`+${xpGain} XP`, 'xp-gain');
    
    // Check for level up
    while (LEVEL_SYSTEM.canLevelUp(hero.level, hero.xp)) {
        const xpNeeded = LEVEL_SYSTEM.xpRequiredForLevel(hero.level);
        hero.xp -= xpNeeded;
        
        const levelUpResult = LEVEL_SYSTEM.levelUp(hero.level);
        
        if (levelUpResult.success) {
            hero.level = levelUpResult.newLevel;
            
            // Update stats on level up
            hero.maxHp += 10;
            hero.hp = hero.maxHp;
            hero.attack += 2;
            hero.defense += 1;
            
            // Show level up animation
            showLevelUpAnimation(hero.level, levelUpResult.milestone);
            
            // Play level up sound
            if (window.audioManager) {
                window.audioManager.playSound('quest_complete', 0.8);
            }
            
            addBattleLog(`🎉 Level Up! Now Level ${hero.level}!`);
            
            if (levelUpResult.milestone) {
                addBattleLog(levelUpResult.milestone.message);
            }
        }
    }
    
    // Update UI
    if (typeof updateBattleUI === 'function') {
        updateBattleUI(hero, gameState.currentEnemy);
    }
    
    // Save game state
    if (typeof saveGameState === 'function') {
        saveGameState();
    }
}

// Show max level banner
function showMaxLevelBanner() {
    const banner = document.createElement('div');
    banner.className = 'max-level-banner';
    banner.innerHTML = `
        <div class="max-level-content">
            <h2>🏆 MAX LEVEL REACHED! 🏆</h2>
            <p>You've reached Level ${LEVEL_SYSTEM.MAX_LEVEL}!</p>
            <p>Champion Badge Awarded!</p>
        </div>
    `;
    banner.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        z-index: 10000;
        text-align: center;
        color: white;
        animation: maxLevelPulse 2s ease-in-out;
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 1s';
        setTimeout(() => banner.remove(), 1000);
    }, 3000);
}

// Show level up animation
function showLevelUpAnimation(newLevel, milestone) {
    const animation = document.createElement('div');
    animation.className = 'level-up-animation';
    animation.innerHTML = `
        <div class="level-up-content">
            <h2>✨ LEVEL UP! ✨</h2>
            <div class="new-level">Level ${newLevel}</div>
            ${milestone ? `<p class="milestone">${milestone.message}</p>` : ''}
        </div>
    `;
    animation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        z-index: 9999;
        text-align: center;
        color: white;
        animation: levelUpBounce 1.5s ease-out;
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        animation.style.opacity = '0';
        animation.style.transition = 'opacity 0.5s';
        setTimeout(() => animation.remove(), 500);
    }, 2000);
}

// Floating text for XP/damage/etc
function showFloatingText(text, type) {
    const colors = {
        'hp-damage': '#ff4444',
        'hp-heal': '#44ff44',
        'ap-gain': '#4444ff',
        'dp-gain': '#ffff44',
        'xp-gain': '#44ff44',
        'special': '#ffd700'
    };
    
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${colors[type] || '#ffffff'};
        font-size: 32px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        z-index: 9998;
        pointer-events: none;
        animation: floatUp 1.1s ease-out forwards;
    `;
    
    document.body.appendChild(floatingText);
    
    setTimeout(() => floatingText.remove(), 1100);
}

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-100px);
        }
    }
    
    @keyframes levelUpBounce {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
        }
    }
    
    @keyframes maxLevelPulse {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
    }
`;
document.head.appendChild(styleSheet);

// Export to window
if (typeof window !== 'undefined') {
    window.LEVEL_SYSTEM = LEVEL_SYSTEM;
    window.updatePlayerXP = updatePlayerXP;
    window.showFloatingText = showFloatingText;
}

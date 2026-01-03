// Special Attack Handler
// Manages special attack gauge and execution

// Player uses special attack (projectile animation)
async function playerSpecialAttack() {
    console.log('⚡ playerSpecialAttack called');
    
    if (!window.battleManager) {
        console.error('Battle manager not found');
        return;
    }
    
    const manager = window.battleManager;
    
    if (manager.state !== 'player_turn') {
        console.log('❌ Not player turn');
        return;
    }
    
    // Check level requirement (Level 10+)
    const userLevel = window.gameState.jerryLevel || 1;
    if (userLevel < 10) {
        addBattleLog('❌ Special attacks unlock at Level 10!');
        return;
    }
    
    // Check if special attack gauge is full (100)
    const specialGauge = window.gameState.specialAttackGauge || 0;
    if (specialGauge < 100) {
        addBattleLog(`❌ Special attack gauge not full! (${specialGauge}/100)`);
        return;
    }
    
    manager.state = 'animating';
    
    // Reset special attack gauge to 0
    window.gameState.specialAttackGauge = 0;
    updateBattleUI(manager.hero, manager.enemy);
    updateActionButtons(manager.hero);
    
    // Get selected monster
    const selectedMonster = localStorage.getItem('selectedMonster');
    if (!selectedMonster) {
        console.error('No monster selected');
        addBattleLog('❌ No monster selected!');
        manager.state = 'player_turn';
        return;
    }
    
    // Play hero special attack animation
    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    
    // Get monster display name
    const monsterNames = { 'luna': 'Luna', 'nova': 'Nova', 'benny': 'Benny' };
    const monsterName = monsterNames[selectedMonster] || selectedMonster;
    addBattleLog(`✨ ${monsterName} unleashes a special attack!`);
    
    // Play projectile animation
    if (window.playSpecialAttackForMonster) {
        await window.playSpecialAttackForMonster(selectedMonster, heroSprite, enemySprite);
    } else {
        console.warn('Special attack animation function not found');
        await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    // Apply special effects based on monster
    let specialEffect = '';
    let damage = 0;
    
    switch(selectedMonster) {
        case 'luna':
            specialEffect = 'Chaos Curse - Reflect';
            damage = 0; // Luna doesn't deal direct damage
            // Set reflect status for next 3 enemy attacks
            manager.reflectTurns = 3;
            manager.reflectActive = true;
            addBattleLog(`🌙 Luna's Chaos Curse activated! Enemy will damage itself for 3 turns!`);
            break;
        case 'nova':
            specialEffect = 'Energy Blast + Poison';
            damage = 25; // FIX: Reduced from 40 to 25 base damage
            // FIX: Add poison effect - 2 HP/turn for 3 turns
            manager.novaPoisonTurns = 3;
            manager.novaPoisonDamage = 2;
            addBattleLog(`💥 Nova's Energy Blast dealt ${damage} damage!`);
            addBattleLog(`☠️ Enemy is poisoned! Will take 2 damage for 3 turns!`);
            break;
        case 'benny':
            specialEffect = 'Life Absorption';
            damage = 20; // Benny: Fixed 20 damage
            // Heal hero for the damage dealt
            manager.hero.hp = Math.min(manager.hero.maxHP, manager.hero.hp + 20);
            addBattleLog(`💚 Benny absorbed 20 HP from the enemy!`);
            break;
        default:
            specialEffect = 'Special Attack';
            const baseDamage = manager.hero.attack;
            damage = Math.floor(baseDamage * 2.5);
            break;
    }
    
    const isDead = manager.enemy.takeDamage(damage);
    
    // Play special attack sound
    if (window.audioManager) {
        window.audioManager.playSound('third_attack', 0.9);
        if (damage >= 15) {
            window.audioManager.playSound('critical_hit', 0.9);
        }
    }
    
    // Play enemy hurt animation (only if damage was dealt)
    if (damage > 0) {
        await playEnemyAnimation(manager.enemy, 'hurt', 300);
    }
    
    // Don't log damage again if already logged in the switch statement
    if (selectedMonster !== 'luna' && selectedMonster !== 'nova' && selectedMonster !== 'benny') {
        addBattleLog(`💥 ${specialEffect} dealt ${damage} damage!`);
    }
    updateBattleUI(manager.hero, manager.enemy);
    
    // Reset hero sprite to idle
    startHeroAnimation('idle');
    
    // Save game state
    saveGameState();
    
    if (isDead) {
        manager.state = 'victory';
        await manager.endBattle('victory');
    } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        await manager.enemyTurn();
    }
}

// Initialize special attack gauge if not exists
function initSpecialAttackGauge() {
    if (typeof window.gameState.specialAttackGauge === 'undefined') {
        window.gameState.specialAttackGauge = 0;
    }
}

// Increase special attack gauge (called after each regular attack and defend)
function increaseSpecialGauge(amount) {
    if (typeof window.gameState.specialAttackGauge === 'undefined') {
        window.gameState.specialAttackGauge = 0;
    }
    
    // Only increase gauge if level 10 or higher
    const userLevel = window.gameState.jerryLevel || 1;
    if (userLevel < 10) {
        console.log(`⚡ Special gauge locked until Level 10 (current: Level ${userLevel})`);
        return;
    }
    
    window.gameState.specialAttackGauge = Math.min(100, window.gameState.specialAttackGauge + amount);
    console.log(`⚡ Special gauge increased by ${amount} to ${window.gameState.specialAttackGauge}/100`);
    
    // Save state
    if (typeof saveGameState === 'function') {
        saveGameState();
    }
}

// Export functions
window.playerSpecialAttack = playerSpecialAttack;
window.initSpecialAttackGauge = initSpecialAttackGauge;
window.increaseSpecialGauge = increaseSpecialGauge;

/**
 * Special Attack System
 * Implements unique special attacks for Luna, Benny, and Nova
 */

// Play special attack projectile animation
async function playSpecialAttackProjectile(monsterName, fromElement, toElement) {
    return new Promise((resolve) => {
        const projectileGifs = {
            'Luna': 'assets/heroes/LunaSpecialAttackProjectile.gif',
            'Benny': 'assets/heroes/BennySpecialAttackProjectile.gif',
            'Nova': 'assets/heroes/NovaSpecialAttackProjectile.gif'
        };
        
        const gifPath = projectileGifs[monsterName];
        if (!gifPath || !fromElement || !toElement) {
            resolve();
            return;
        }
        
        // Use fixed positioning based on viewport coordinates (works across any container)
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Start: right edge of hero sprite, vertically centered
        const startX = fromRect.right;
        const startY = fromRect.top + fromRect.height / 2 - 20;
        
        // End: center of enemy sprite
        const endX = toRect.left + toRect.width / 2 - 20;
        const endY = toRect.top + toRect.height / 2 - 20;
        
        // Create projectile element using fixed positioning
        const projectile = document.createElement('img');
        projectile.src = gifPath;
        projectile.style.position = 'fixed';
        projectile.style.width = '40px';
        projectile.style.height = '40px';
        projectile.style.zIndex = '99999';
        projectile.style.pointerEvents = 'none';
        projectile.style.imageRendering = 'pixelated';
        projectile.style.imageRendering = '-moz-crisp-edges';
        projectile.style.imageRendering = 'crisp-edges';
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        projectile.style.transition = 'none';
        
        document.body.appendChild(projectile);
        
        // Animate projectile to enemy center
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Trigger transition on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                projectile.style.transition = 'transform 0.55s ease-out';
                projectile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            });
        });
        
        // Remove projectile after animation completes
        setTimeout(() => {
            projectile.remove();
            resolve();
        }, 650);
    });
}

// Player uses special attack
async function playerSpecialAttack() {
    if (!window.battleManager) return;
    
    const manager = window.battleManager;
    
    // === STUN / DAZE CHECK ===
    if (manager.heroStunnedTurns > 0) {
        if (typeof stopTurnTimer === 'function') stopTurnTimer();
        manager.heroStunnedTurns--;
        addBattleLog(`😵 You are stunned! Turn skipped! (${manager.heroStunnedTurns} turns remaining)`);
        updateBattleUI(manager.hero, manager.enemy);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await manager.enemyTurn();
        return;
    }
    
    // FIX: Use gameState.jerryLevel (the actual level source), not manager.hero.level
    const level = window.gameState?.jerryLevel || manager.hero?.level || 1;
    
    // Check if special attack is unlocked (Level 10+)
    if (level < 10) {
        addBattleLog('⚠️ Special Attack unlocks at Level 10!');
        return;
    }
    
    // FIX: Read gauge from gameState directly (element ID was 'specialGaugeText', not 'specialAttackValue')
    const specialGauge = window.gameState?.specialAttackGauge || 0;
    if (specialGauge < 100) {
        addBattleLog('⚠️ Special Attack gauge not full!');
        return;
    }
    
    // Stop turn timer
    if (manager.stopTurnTimer) {
        manager.stopTurnTimer();
    }
    
    // Get DEFAULT monster (not equipped skin) for special attack
    const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
    const monsterNameMap = {
        luna: 'Luna',
        benny: 'Benny',
        nova: 'Nova'
    };
    const monsterName = monsterNameMap[baseMonsterId.toLowerCase()] || 'Nova';
    
    console.log(`[SpecialAttack] Using default monster: ${monsterName} (base: ${baseMonsterId})`);
    
    // Play hero attack animation
    if (window.startHeroAnimation) {
        window.startHeroAnimation('attack1');
    }
    
    // Play projectile animation
    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    await playSpecialAttackProjectile(monsterName, heroSprite, enemySprite);
    
    // Execute special attack based on monster
    let damage = 0;
    let specialEffect = '';
    
    // Damage scales with level: base damage + (level * 2)
    const levelMultiplier = Math.floor(level / 10); // +1 every 10 levels
    
    switch(monsterName) {
        case 'Nova':
            // Nova Spirit: 30 damage + 20 damage for 2 turns
            damage = 30 + (levelMultiplier * 5);
            const burnDamage = 20 + (levelMultiplier * 3);
            manager.burnTurns = 2;
            manager.burnDamage = burnDamage;
            specialEffect = `🔥 Nova Spirit! ${damage} damage + ${burnDamage} burn damage for 2 turns!`;
            break;
            
        case 'Luna':
            // Luna's Eclipse: 20 damage + deflects next enemy attack
            damage = 20 + (levelMultiplier * 4);
            manager.deflectActive = true;
            specialEffect = `🌙 Luna's Eclipse! ${damage} damage + next attack deflected!`;
            break;
            
        case 'Benny':
            // Benny Bubble: Absorbs 40-50 HP + defense immune for 2 turns
            const absorbAmount = Math.floor(Math.random() * 11) + 40 + (levelMultiplier * 5); // 40-50 + level bonus
            damage = absorbAmount;
            const healAmount = Math.min(absorbAmount, manager.hero.maxHP - manager.hero.hp);
            manager.hero.hp = Math.min(manager.hero.hp + healAmount, manager.hero.maxHP);
            manager.defenseImmune = 2;
            specialEffect = `💚 Benny Bubble! Absorbed ${absorbAmount} HP + defense immune for 2 turns!`;
            break;
            
        default:
            // Default special attack
            damage = 25 + (levelMultiplier * 4);
            specialEffect = `⚡ Special Attack! ${damage} damage!`;
    }
    
    // Apply Battle Glove damage boost if active
    damage = manager.applyDamageBoost(damage);
    
    // Apply damage to enemy
    const isDead = manager.enemy.takeDamage(damage);
    
    // Play enemy hurt animation
    if (window.playEnemyAnimation) {
        await window.playEnemyAnimation(manager.enemy, 'hurt', 300);
    }
    
    // Reset special gauge
    if (window.resetSpecialGauge) {
        window.resetSpecialGauge();
    }
    
    // Add battle log
    addBattleLog(specialEffect);
    
    // Update UI
    manager.updateBattleUI();
    
    // Return to idle
    if (window.startHeroAnimation) {
        window.startHeroAnimation('idle');
    }
    
    // Check if enemy died
    if (isDead) {
        await manager.handleVictory();
        return;
    }
    
    // Enemy turn
    await manager.enemyTurn();
}

// Export to global scope
window.playerSpecialAttack = playerSpecialAttack;
window.playSpecialAttackProjectile = playSpecialAttackProjectile;

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
        if (!gifPath) {
            resolve();
            return;
        }
        
        // Create projectile element
        const projectile = document.createElement('img');
        projectile.src = gifPath;
        projectile.style.position = 'absolute';
        projectile.style.width = '40px';
        projectile.style.height = '40px';
        projectile.style.zIndex = '10000';
        projectile.style.pointerEvents = 'none';
        
        // Get positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        projectile.style.left = fromRect.right + 'px';
        projectile.style.top = (fromRect.top + fromRect.height / 2 - 20) + 'px';
        
        document.body.appendChild(projectile);
        
        // Animate projectile
        const deltaX = toRect.left - fromRect.right;
        const deltaY = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);
        
        projectile.style.transition = 'all 0.6s ease-out';
        setTimeout(() => {
            projectile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }, 50);
        
        // Remove projectile after animation
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
    const level = manager.hero.level;
    
    // Check if special attack is unlocked (Level 10+)
    if (level < 10) {
        addBattleLog('⚠️ Special Attack unlocks at Level 10!');
        return;
    }
    
    // Check if special gauge is full
    const specialGauge = parseInt(document.getElementById('specialAttackValue')?.textContent || '0');
    if (specialGauge < 100) {
        addBattleLog('⚠️ Special Attack gauge not full!');
        return;
    }
    
    // Stop turn timer
    if (manager.stopTurnTimer) {
        manager.stopTurnTimer();
    }
    
    // Get active monster
    const appearance = window.getActiveHeroAppearance ? window.getActiveHeroAppearance() : null;
    const monsterName = appearance?.name || 'Nova'; // Default to Nova
    
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

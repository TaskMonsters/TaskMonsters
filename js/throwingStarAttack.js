// Throwing Star Attack Implementation
// This file adds the throwing star attack functionality to the battle system

// Add throwing star method to BattleManager
if (typeof BattleManager !== 'undefined' && BattleManager.prototype) {
    BattleManager.prototype.playerThrowingStar = async function() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for throwing stars!');
            return;
        }

        const throwingStarCount = gameState.battleInventory?.throwing_stars || 0;
        if (throwingStarCount <= 0) {
            addBattleLog('❌ No throwing stars left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;  // Throwing stars cost 25 attack gauge
        gameState.battleInventory.throwing_stars = Math.max(0, gameState.battleInventory.throwing_stars - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play throwing star sound (use fireball sound as placeholder)
        if (window.audioManager) {
            window.audioManager.playSound('fireball', 0.6);
        }

        // Play throwing star spinning animation
        await playThrowingStarAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (15-25 range)
        const damage = Math.floor(Math.random() * 11) + 15; // Random between 15-25
        const isDead = this.enemy.takeDamage(damage);

        // Apply weaken effect to enemy's next attack
        this.enemyAttackWeakened = true;
        this.enemyWeakenAmount = 0.5; // 50% reduction

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`⭐ Throwing star dealt ${damage} damage and weakened enemy!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    };
}

// Throwing star spinning animation
async function playThrowingStarAnimation(heroSprite, enemySprite) {
    const heroRect = heroSprite.getBoundingClientRect();
    const enemyRect = enemySprite.getBoundingClientRect();
    
    const startX = heroRect.right;
    const startY = heroRect.top + heroRect.height / 2;
    const endX = enemyRect.left;
    const endY = enemyRect.top + enemyRect.height / 2;
    
    const projectile = document.createElement('img');
    projectile.src = 'assets/items/throwing_stars/projectile.png';
    projectile.style.position = 'fixed';
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';
    projectile.style.width = '32px';
    projectile.style.height = '32px';
    projectile.style.zIndex = '1000';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.pointerEvents = 'none';
    
    document.body.appendChild(projectile);
    
    const duration = 600;
    const startTime = Date.now();
    
    return new Promise(resolve => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Calculate position
            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;
            
            // Spinning effect - 3 full rotations during flight
            const rotation = progress * 1080; // 3 * 360 degrees
            
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            projectile.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                resolve();
            }
        }
        
        animate();
    });
}

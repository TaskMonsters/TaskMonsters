// Simplified Enemy Animation System
// Uses CSS lunge animation for attacks, hover for idle

function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        const spriteElement = document.getElementById('enemySprite');
        if (!spriteElement) {
            resolve();
            return;
        }
        
        // For attack animations, trigger lunge
        if (animationKey === 'attack1' || animationKey === 'attack2' || animationKey === 'attack') {
            // Remove hover, add lunge
            spriteElement.classList.remove('enemy-hover');
            spriteElement.classList.add('enemy-lunge');
            
            // After lunge completes, restore hover
            setTimeout(() => {
                spriteElement.classList.remove('enemy-lunge');
                spriteElement.classList.add('enemy-hover');
                resolve();
            }, duration);
        } 
        // For hurt animation, flash the sprite
        else if (animationKey === 'hurt') {
            spriteElement.style.opacity = '0.5';
            setTimeout(() => {
                spriteElement.style.opacity = '1';
                resolve();
            }, duration);
        }
        // For all other animations (idle, die, etc.), just wait
        else {
            setTimeout(() => {
                resolve();
            }, duration);
        }
    });
}

// Export to global scope
window.playEnemyAnimation = playEnemyAnimation;

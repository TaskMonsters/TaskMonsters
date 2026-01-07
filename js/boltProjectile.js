// Bolt projectile animation for Disruption Dragon
async function playBoltProjectile(enemySprite, heroSprite, boltImagePath) {
    return new Promise((resolve) => {
        const enemyRect = enemySprite.getBoundingClientRect();
        const heroRect = heroSprite.getBoundingClientRect();
        
        // Create bolt projectile
        const bolt = document.createElement('img');
        bolt.src = boltImagePath || 'assets/enemies/Disruption Dragon/DisruptionDragon projectile attack/bolt-previewt.gif';
        bolt.style.position = 'fixed';
        bolt.style.width = '40px';
        bolt.style.height = '40px';
        bolt.style.left = `${enemyRect.left + enemyRect.width / 2}px`;
        bolt.style.top = `${enemyRect.top + enemyRect.height / 2}px`;
        bolt.style.transform = 'translate(-50%, -50%)';
        bolt.style.zIndex = '1000';
        bolt.style.pointerEvents = 'none';
        bolt.style.filter = 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))';
        
        document.body.appendChild(bolt);
        
        // Animate bolt moving from enemy to hero
        const startX = enemyRect.left + enemyRect.width / 2;
        const startY = enemyRect.top + enemyRect.height / 2;
        const endX = heroRect.left + heroRect.width / 2;
        const endY = heroRect.top + heroRect.height / 2;
        
        const duration = 600; // milliseconds
        const startTime = Date.now();
        
        function animateBolt() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;
            
            bolt.style.left = `${currentX}px`;
            bolt.style.top = `${currentY}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animateBolt);
            } else {
                // Impact effect
                bolt.style.filter = 'drop-shadow(0 0 20px rgba(0, 255, 255, 1))';
                bolt.style.transform = 'translate(-50%, -50%) scale(1.5)';
                bolt.style.opacity = '0';
                bolt.style.transition = 'all 0.2s ease-out';
                
                setTimeout(() => {
                    if (bolt.parentElement) {
                        bolt.parentElement.removeChild(bolt);
                    }
                    resolve();
                }, 200);
            }
        }
        
        animateBolt();
    });
}

// Export to global scope
window.playBoltProjectile = playBoltProjectile;

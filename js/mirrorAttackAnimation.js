// Mirror Attack Animation
// Shows a spinning mirror projectile around the hero when mirror is activated

async function playMirrorAnimation(heroSprite) {
    if (!heroSprite) return;
    
    const heroRect = heroSprite.getBoundingClientRect();
    const centerX = heroRect.left + heroRect.width / 2;
    const centerY = heroRect.top + heroRect.height / 2;
    
    // Create mirror projectile
    const mirror = document.createElement('img');
    mirror.src = 'assets/items/mirror_attack/projectile.png';
    mirror.style.position = 'fixed';
    mirror.style.width = '48px';
    mirror.style.height = '48px';
    mirror.style.zIndex = '1000';
    mirror.style.imageRendering = 'pixelated';
    mirror.style.pointerEvents = 'none';
    
    document.body.appendChild(mirror);
    
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();
    const radius = 60; // Distance from hero
    
    return new Promise(resolve => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                mirror.remove();
                resolve();
                return;
            }
            
            // Circular orbit around hero (2 full rotations)
            const angle = progress * Math.PI * 4; // 4π = 2 full circles
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Spinning effect
            const rotation = progress * 720; // 2 full spins
            
            mirror.style.left = x + 'px';
            mirror.style.top = y + 'px';
            mirror.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            
            // Fade out in last 20%
            if (progress > 0.8) {
                const fadeProgress = (progress - 0.8) / 0.2;
                mirror.style.opacity = 1 - fadeProgress;
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    });
}

// Export to global scope
window.playMirrorAnimation = playMirrorAnimation;

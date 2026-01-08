// Focus Timer Attack Explosion Animation
// Plays explosion animation on enemy when Focus Power is triggered

async function playFocusAttackExplosion() {
    const enemySprite = document.getElementById('enemySprite');
    if (!enemySprite) {
        console.warn('[Focus Attack] Enemy sprite not found');
        return;
    }
    
    // Get enemy position
    const enemyRect = enemySprite.getBoundingClientRect();
    const container = enemySprite.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Create explosion container
    const explosionContainer = document.createElement('div');
    explosionContainer.id = 'focusAttackExplosion';
    explosionContainer.style.position = 'absolute';
    explosionContainer.style.left = `${enemyRect.left - containerRect.left + (enemyRect.width / 2) - 50}px`;
    explosionContainer.style.top = `${enemyRect.top - containerRect.top + (enemyRect.height / 2) - 50}px`;
    explosionContainer.style.width = '100px';
    explosionContainer.style.height = '100px';
    explosionContainer.style.pointerEvents = 'none';
    explosionContainer.style.zIndex = '1000';
    
    // Create img element for animation
    const explosionImg = document.createElement('img');
    explosionImg.style.width = '100%';
    explosionImg.style.height = '100%';
    explosionImg.style.objectFit = 'contain';
    
    explosionContainer.appendChild(explosionImg);
    container.appendChild(explosionContainer);
    
    // Animation frames in order
    const frames = [
        'assets/animations/focus-attack/_0000_Layer-1.png',
        'assets/animations/focus-attack/_0001_Layer-2.png',
        'assets/animations/focus-attack/_0002_Layer-3.png',
        'assets/animations/focus-attack/_0003_Layer-4.png',
        'assets/animations/focus-attack/_0004_Layer-5.png',
        'assets/animations/focus-attack/_0005_Layer-6.png',
        'assets/animations/focus-attack/_0006_Layer-7.png',
        'assets/animations/focus-attack/_0007_Layer-8.png',
        'assets/animations/focus-attack/_0008_Layer-9.png'
    ];
    
    // Play animation frames
    let currentFrame = 0;
    const frameDuration = 80; // 80ms per frame = ~12 fps
    
    return new Promise((resolve) => {
        const animationInterval = setInterval(() => {
            if (currentFrame >= frames.length) {
                clearInterval(animationInterval);
                // Remove explosion container
                explosionContainer.remove();
                resolve();
                return;
            }
            
            explosionImg.src = frames[currentFrame];
            currentFrame++;
        }, frameDuration);
    });
}

// Export to global scope
window.playFocusAttackExplosion = playFocusAttackExplosion;

// ========================================
// SPECIAL ATTACK ANIMATIONS
// ========================================
// These animations trigger only on the 3rd consecutive regular attack
// and only when the monster is level 6 or higher

// Benny Special Attack Animation (4 frames)
async function playBennySpecialAttack(heroElement, enemyElement) {
    if (!heroElement || !enemyElement) {
        console.error('Missing hero or enemy element for special attack animation.');
        return;
    }
    const frames = [
        'assets/special-attacks/benny/_0000_Layer-1.png',
        'assets/special-attacks/benny/_0001_Layer-2.png',
        'assets/special-attacks/benny/_0002_Layer-3.png',
        'assets/special-attacks/benny/_0003_Layer-4.png'
    ];
    
    // Create special attack effect overlay
    const attackEffect = document.createElement('div');
    attackEffect.style.position = 'fixed';
    attackEffect.style.left = '50%';
    attackEffect.style.top = '50%';
    attackEffect.style.transform = 'translate(-50%, -50%)';
    attackEffect.style.width = '200px';
    attackEffect.style.height = '200px';
    attackEffect.style.backgroundSize = 'contain';
    attackEffect.style.backgroundRepeat = 'no-repeat';
    attackEffect.style.backgroundPosition = 'center';
    attackEffect.style.zIndex = '2000';
    attackEffect.style.pointerEvents = 'none';
    document.body.appendChild(attackEffect);
    
    // Play 4-frame animation
    for (let i = 0; i < frames.length; i++) {
        attackEffect.style.backgroundImage = `url('${frames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms per frame
    }
    
    // Flash effect on enemy
    if (enemyElement) {
        enemyElement.style.filter = 'brightness(2) saturate(0)';
        await new Promise(resolve => setTimeout(resolve, 100));
        enemyElement.style.filter = '';
    }
    
    // Remove effect
    attackEffect.remove();
}

// Luna Special Attack Animation (4 frames)
async function playLunaSpecialAttack(heroElement, enemyElement) {
    const frames = [
        'assets/special-attacks/luna/_0000_Layer-1.png',
        'assets/special-attacks/luna/_0001_Layer-2.png',
        'assets/special-attacks/luna/_0002_Layer-3.png',
        'assets/special-attacks/luna/_0003_Layer-4.png'
    ];
    
    // Create special attack effect overlay
    const attackEffect = document.createElement('div');
    attackEffect.style.position = 'fixed';
    attackEffect.style.left = '50%';
    attackEffect.style.top = '50%';
    attackEffect.style.transform = 'translate(-50%, -50%)';
    attackEffect.style.width = '200px';
    attackEffect.style.height = '200px';
    attackEffect.style.backgroundSize = 'contain';
    attackEffect.style.backgroundRepeat = 'no-repeat';
    attackEffect.style.backgroundPosition = 'center';
    attackEffect.style.zIndex = '2000';
    attackEffect.style.pointerEvents = 'none';
    document.body.appendChild(attackEffect);
    
    // Play 4-frame animation
    for (let i = 0; i < frames.length; i++) {
        attackEffect.style.backgroundImage = `url('${frames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms per frame
    }
    
    // Flash effect on enemy
    if (enemyElement) {
        enemyElement.style.filter = 'brightness(2) saturate(0)';
        await new Promise(resolve => setTimeout(resolve, 100));
        enemyElement.style.filter = '';
    }
    
    // Remove effect
    attackEffect.remove();
}

// Nova Special Attack Animation (4 frames)
async function playNovaSpecialAttack(heroElement, enemyElement) {
    const frames = [
        'assets/special-attacks/nova/_0000_Layer-1.png',
        'assets/special-attacks/nova/_0001_Layer-2.png',
        'assets/special-attacks/nova/_0002_Layer-3.png',
        'assets/special-attacks/nova/_0003_Layer-4.png'
    ];
    
    // Create special attack effect overlay
    const attackEffect = document.createElement('div');
    attackEffect.style.position = 'fixed';
    attackEffect.style.left = '50%';
    attackEffect.style.top = '50%';
    attackEffect.style.transform = 'translate(-50%, -50%)';
    attackEffect.style.width = '200px';
    attackEffect.style.height = '200px';
    attackEffect.style.backgroundSize = 'contain';
    attackEffect.style.backgroundRepeat = 'no-repeat';
    attackEffect.style.backgroundPosition = 'center';
    attackEffect.style.zIndex = '2000';
    attackEffect.style.pointerEvents = 'none';
    document.body.appendChild(attackEffect);
    
    // Play 4-frame animation
    for (let i = 0; i < frames.length; i++) {
        attackEffect.style.backgroundImage = `url('${frames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms per frame
    }
    
    // Flash effect on enemy
    if (enemyElement) {
        enemyElement.style.filter = 'brightness(2) saturate(0)';
        await new Promise(resolve => setTimeout(resolve, 100));
        enemyElement.style.filter = '';
    }
    
    // Remove effect
    attackEffect.remove();
}

// Helper function to determine which special attack to play
async function playSpecialAttackForMonster(monsterType, heroElement, enemyElement) {
    switch(monsterType) {
        case 'benny':
            await playBennySpecialAttack(heroElement, enemyElement);
            break;
        case 'luna':
            await playLunaSpecialAttack(heroElement, enemyElement);
            break;
        case 'nova':
            await playNovaSpecialAttack(heroElement, enemyElement);
            break;
        default:
            console.warn(`Unknown monster type: ${monsterType}`);
    }
}

// Export functions to window for global access
window.playBennySpecialAttack = playBennySpecialAttack;
window.playLunaSpecialAttack = playLunaSpecialAttack;
window.playNovaSpecialAttack = playNovaSpecialAttack;
window.playSpecialAttackForMonster = playSpecialAttackForMonster;

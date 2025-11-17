// Monster Special Attack Animations
// Nova: Stellar Burst, Benny: Sonic Boom, Luna: Lunar Eclipse

// Play Nova's Stellar Burst special attack
async function playNovaSpecialAttack(targetElement) {
    if (!ASSET_CONFIG || !ASSET_CONFIG.monsterSpecials.nova) {
        console.error('Nova special attack config not found');
        return;
    }
    
    const special = ASSET_CONFIG.monsterSpecials.nova;
    const frames = special.frames;
    
    // Create full-screen special attack overlay
    const overlay = document.createElement('div');
    overlay.className = 'special-attack-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
        pointer-events: none;
    `;
    
    const animation = document.createElement('div');
    animation.style.cssText = `
        width: 400px;
        height: 400px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        filter: drop-shadow(0 0 30px rgba(255,215,0,0.8));
    `;
    
    overlay.appendChild(animation);
    document.body.appendChild(overlay);
    
    // Show special attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = special.name.toUpperCase();
    nameDisplay.style.cssText = `
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        color: #ffd700;
        font-size: 48px;
        font-weight: bold;
        text-shadow: 0 0 20px #ffd700, 0 0 40px #ff6b6b;
        animation: specialNamePulse 2s ease-in-out;
    `;
    overlay.appendChild(nameDisplay);
    
    // Play animation frames
    for (let i = 0; i < frames.length; i++) {
        animation.style.backgroundImage = `url('${frames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Flash effect for AoE damage
    overlay.style.background = 'rgba(255,215,0,0.8)';
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove overlay
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s';
    await new Promise(resolve => setTimeout(resolve, 500));
    overlay.remove();
}

// Play Benny's Sonic Boom special attack
async function playBennySpecialAttack(targetElement) {
    if (!ASSET_CONFIG || !ASSET_CONFIG.monsterSpecials.benny) {
        console.error('Benny special attack config not found');
        return;
    }
    
    const special = ASSET_CONFIG.monsterSpecials.benny;
    const frames = special.frames;
    
    // Create projectile-style special attack
    const projectile = document.createElement('div');
    projectile.style.cssText = `
        position: fixed;
        width: 200px;
        height: 200px;
        background-size: contain;
        background-repeat: no-repeat;
        z-index: 9999;
        filter: drop-shadow(0 0 20px rgba(100,200,255,0.8));
    `;
    
    // Get positions
    const heroSprite = document.getElementById('heroSprite') || document.querySelector('.hero-sprite');
    const startRect = heroSprite ? heroSprite.getBoundingClientRect() : { left: 100, top: 300 };
    const targetRect = targetElement.getBoundingClientRect();
    
    projectile.style.left = startRect.left + 'px';
    projectile.style.top = startRect.top + 'px';
    
    document.body.appendChild(projectile);
    
    // Show special attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = special.name.toUpperCase();
    nameDisplay.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        color: #64c8ff;
        font-size: 42px;
        font-weight: bold;
        text-shadow: 0 0 20px #64c8ff;
        z-index: 10000;
        animation: specialNamePulse 1.5s ease-out;
    `;
    document.body.appendChild(nameDisplay);
    
    // Animate frames and movement
    const duration = 800;
    const startTime = Date.now();
    let frameIndex = 0;
    
    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update frame
            frameIndex = Math.floor((elapsed / 120) % frames.length);
            projectile.style.backgroundImage = `url('${frames[frameIndex]}')`;
            
            // Move projectile
            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Scale up as it travels
            const scale = 1 + progress * 0.5;
            projectile.style.transform = `scale(${scale})`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Impact effect
                projectile.style.filter = 'brightness(2) drop-shadow(0 0 40px rgba(100,200,255,1))';
                setTimeout(() => {
                    projectile.remove();
                    nameDisplay.remove();
                    resolve();
                }, 300);
            }
        }
        requestAnimationFrame(animate);
    });
}

// Play Luna's Lunar Eclipse special attack
async function playLunaSpecialAttack(targetElement) {
    if (!ASSET_CONFIG || !ASSET_CONFIG.monsterSpecials.luna) {
        console.error('Luna special attack config not found');
        return;
    }
    
    const special = ASSET_CONFIG.monsterSpecials.luna;
    const frames = special.frames;
    
    // Create eclipse overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10000;
        background: radial-gradient(circle, rgba(138,43,226,0.4) 0%, rgba(0,0,0,0.8) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    `;
    
    const animation = document.createElement('div');
    animation.style.cssText = `
        width: 350px;
        height: 350px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        filter: drop-shadow(0 0 30px rgba(138,43,226,0.9));
    `;
    
    overlay.appendChild(animation);
    document.body.appendChild(overlay);
    
    // Show special attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = special.name.toUpperCase();
    nameDisplay.style.cssText = `
        position: absolute;
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
        color: #8a2be2;
        font-size: 44px;
        font-weight: bold;
        text-shadow: 0 0 20px #8a2be2, 0 0 40px #4b0082;
        animation: specialNamePulse 2s ease-in-out;
    `;
    overlay.appendChild(nameDisplay);
    
    // Play animation frames
    for (let i = 0; i < frames.length; i++) {
        animation.style.backgroundImage = `url('${frames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 120));
    }
    
    // Defense down visual effect on enemy
    if (targetElement) {
        targetElement.style.filter = 'brightness(0.6) saturate(0.5)';
        setTimeout(() => {
            targetElement.style.filter = '';
        }, 2000);
    }
    
    // Fade out overlay
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.6s';
    await new Promise(resolve => setTimeout(resolve, 600));
    overlay.remove();
}

// Execute special attack based on monster type
async function executeSpecialAttack(monsterType, targetElement, playerLevel) {
    if (!window.specialGauge || !window.specialGauge.use()) {
        console.error('Special gauge not available or not ready');
        return null; // Gauge not ready
    }
    
    // Calculate damage
    const damage = window.calculateSpecialDamage ? window.calculateSpecialDamage(monsterType, playerLevel) : 30;
    
    // Play appropriate animation
    switch(monsterType.toLowerCase()) {
        case 'nova':
            await playNovaSpecialAttack(targetElement);
            if (window.addBattleLog) {
                addBattleLog(`⭐ ${ASSET_CONFIG.monsterSpecials.nova.name} dealt ${damage} damage!`);
                addBattleLog(`💥 ${ASSET_CONFIG.monsterSpecials.nova.effect}`);
            }
            break;
            
        case 'benny':
            await playBennySpecialAttack(targetElement);
            if (window.addBattleLog) {
                addBattleLog(`🔊 ${ASSET_CONFIG.monsterSpecials.benny.name} dealt ${damage} damage!`);
                addBattleLog(`😵 ${ASSET_CONFIG.monsterSpecials.benny.effect}`);
            }
            break;
            
        case 'luna':
            await playLunaSpecialAttack(targetElement);
            if (window.addBattleLog) {
                addBattleLog(`🌙 ${ASSET_CONFIG.monsterSpecials.luna.name} dealt ${damage} damage!`);
                addBattleLog(`🛡️ ${ASSET_CONFIG.monsterSpecials.luna.effect}`);
            }
            break;
            
        default:
            console.error('Unknown monster type:', monsterType);
            return null;
    }
    
    return {
        damage: damage,
        effect: ASSET_CONFIG.monsterSpecials[monsterType.toLowerCase()].effect
    };
}

// Add CSS animations
const specialStyles = document.createElement('style');
specialStyles.textContent = `
    @keyframes specialNamePulse {
        0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
        }
        100% {
            opacity: 0.8;
            transform: translateX(-50%) scale(1);
        }
    }
`;
document.head.appendChild(specialStyles);

// Export functions
if (typeof window !== 'undefined') {
    window.playNovaSpecialAttack = playNovaSpecialAttack;
    window.playBennySpecialAttack = playBennySpecialAttack;
    window.playLunaSpecialAttack = playLunaSpecialAttack;
    window.executeSpecialAttack = executeSpecialAttack;
}

// Monster Special Attack Projectile Animations
// These projectile animations fly from hero to enemy on every 3rd attack (level 6+)

// Helper function to get battle element positions relative to battle arena
function getBattleElementPositions() {
    const battleArena = document.querySelector('.battle-container');
    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    
    if (!battleArena || !heroSprite || !enemySprite) {
        console.error('❌ Battle elements not found');
        return null;
    }
    
    const arenaRect = battleArena.getBoundingClientRect();
    const heroRect = heroSprite.getBoundingClientRect();
    const enemyRect = enemySprite.getBoundingClientRect();
    
    // Calculate positions relative to battle arena
    const positions = {
        arena: battleArena,
        hero: {
            x: heroRect.left - arenaRect.left + heroRect.width / 2,
            y: heroRect.top - arenaRect.top + heroRect.height / 2
        },
        enemy: {
            x: enemyRect.left - arenaRect.left + enemyRect.width / 2,
            y: enemyRect.top - arenaRect.top + enemyRect.height / 2
        }
    };
    
    console.log('🎯 Battle positions (relative to arena):', positions);
    return positions;
}

// Nova Special Attack - Life Drain (Pink energy projectile)
async function playNovaSpecialAttack(heroElement, enemyElement) {
    console.log('🌟 Nova Special Attack: Life Drain');
    
    const frames = [
        'assets/special-attacks/nova/_0000_Layer-1.png',
        'assets/special-attacks/nova/_0001_Layer-2.png',
        'assets/special-attacks/nova/_0002_Layer-3.png',
        'assets/special-attacks/nova/_0003_Layer-4.png',
        'assets/special-attacks/nova/_0004_Layer-5.png',
        'assets/special-attacks/nova/_0005_Layer-6.png',
        'assets/special-attacks/nova/_0006_Layer-7.png',
        'assets/special-attacks/nova/_0007_Layer-8.png'
    ];
    
    const positions = getBattleElementPositions();
    if (!positions) return;
    
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.style.cssText = `
        position: absolute;
        width: 120px;
        height: 120px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 9999;
        filter: drop-shadow(0 0 20px rgba(255, 105, 180, 0.8));
        pointer-events: none;
        left: ${positions.hero.x - 60}px;
        top: ${positions.hero.y - 60}px;
    `;
    positions.arena.appendChild(projectile);
    
    // Show attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = 'LIFE DRAIN';
    nameDisplay.style.cssText = `
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        color: #ff69b4;
        font-size: 42px;
        font-weight: bold;
        text-shadow: 0 0 20px #ff69b4, 0 0 40px #ff1493;
        z-index: 10000;
        pointer-events: none;
        animation: fadeOut 1.5s ease-out forwards;
    `;
    positions.arena.appendChild(nameDisplay);
    
    // Animate projectile flying to enemy
    const duration = 1800; // Slower for visibility
    const startTime = Date.now();
    
    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cycle through frames (slower frame rate)
            const frameIndex = Math.floor((elapsed / 200) % frames.length);
            projectile.style.backgroundImage = `url('${frames[frameIndex]}')`;
            
            // Move from hero to enemy
            const currentX = positions.hero.x + (positions.enemy.x - positions.hero.x) * progress - 60;
            const currentY = positions.hero.y + (positions.enemy.y - positions.hero.y) * progress - 60;
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Scale up as it travels
            const scale = 1 + progress * 0.6;
            projectile.style.transform = `scale(${scale})`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Impact flash
                projectile.style.filter = 'brightness(2) drop-shadow(0 0 40px rgba(255, 105, 180, 1))';
                setTimeout(() => {
                    projectile.remove();
                    nameDisplay.remove();
                    resolve();
                }, 250);
            }
        }
        requestAnimationFrame(animate);
    });
}

// Benny Special Attack - Stunning Strike (Cyan ring projectile)
async function playBennySpecialAttack(heroElement, enemyElement) {
    console.log('💨 Benny Special Attack: Stunning Strike');
    
    const frames = [
        'assets/special-attacks/benny/_0000_Layer-1.png',
        'assets/special-attacks/benny/_0001_Layer-2.png',
        'assets/special-attacks/benny/_0002_Layer-3.png',
        'assets/special-attacks/benny/_0003_Layer-4.png',
        'assets/special-attacks/benny/_0004_Layer-5.png',
        'assets/special-attacks/benny/_0005_Layer-6.png'
    ];
    
    const positions = getBattleElementPositions();
    if (!positions) return;
    
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.style.cssText = `
        position: absolute;
        width: 100px;
        height: 100px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 9999;
        filter: drop-shadow(0 0 18px rgba(100, 200, 255, 0.8));
        pointer-events: none;
        left: ${positions.hero.x - 50}px;
        top: ${positions.hero.y - 50}px;
    `;
    positions.arena.appendChild(projectile);
    
    // Show attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = 'STUNNING STRIKE';
    nameDisplay.style.cssText = `
        position: absolute;
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
        color: #64c8ff;
        font-size: 40px;
        font-weight: bold;
        text-shadow: 0 0 18px #64c8ff, 0 0 35px #00bfff;
        z-index: 10000;
        pointer-events: none;
        animation: fadeOut 1.5s ease-out forwards;
    `;
    positions.arena.appendChild(nameDisplay);
    
    // Animate projectile flying to enemy
    const duration = 1800; // Slower for visibility
    const startTime = Date.now();
    
    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cycle through frames (slower frame rate)
            const frameIndex = Math.floor((elapsed / 200) % frames.length);
            projectile.style.backgroundImage = `url('${frames[frameIndex]}')`;
            
            // Move from hero to enemy
            const currentX = positions.hero.x + (positions.enemy.x - positions.hero.x) * progress - 50;
            const currentY = positions.hero.y + (positions.enemy.y - positions.hero.y) * progress - 50;
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate and scale
            const rotation = progress * 720; // Two full rotations
            const scale = 1 + progress * 0.5;
            projectile.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Impact flash
                projectile.style.filter = 'brightness(2) drop-shadow(0 0 35px rgba(100, 200, 255, 1))';
                setTimeout(() => {
                    projectile.remove();
                    nameDisplay.remove();
                    resolve();
                }, 250);
            }
        }
        requestAnimationFrame(animate);
    });
}

// Luna Special Attack - Chaos Curse (Purple crescent moon projectile)
async function playLunaSpecialAttack(heroElement, enemyElement) {
    console.log('🌙 Luna Special Attack: Chaos Curse');
    
    const frames = [
        'assets/special-attacks/luna/_0000_Layer-1.png',
        'assets/special-attacks/luna/_0001_Layer-2.png',
        'assets/special-attacks/luna/_0002_Layer-3.png',
        'assets/special-attacks/luna/_0003_Layer-4.png',
        'assets/special-attacks/luna/_0004_Layer-5.png'
    ];
    
    const positions = getBattleElementPositions();
    if (!positions) return;
    
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.style.cssText = `
        position: absolute;
        width: 110px;
        height: 110px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 9999;
        filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.8));
        pointer-events: none;
        left: ${positions.hero.x - 55}px;
        top: ${positions.hero.y - 55}px;
    `;
    positions.arena.appendChild(projectile);
    
    // Show attack name
    const nameDisplay = document.createElement('div');
    nameDisplay.textContent = 'CHAOS CURSE';
    nameDisplay.style.cssText = `
        position: absolute;
        top: 22%;
        left: 50%;
        transform: translateX(-50%);
        color: #8a2be2;
        font-size: 41px;
        font-weight: bold;
        text-shadow: 0 0 20px #8a2be2, 0 0 38px #4b0082;
        z-index: 10000;
        pointer-events: none;
        animation: fadeOut 1.5s ease-out forwards;
    `;
    positions.arena.appendChild(nameDisplay);
    
    // Animate projectile flying to enemy with arc motion
    const duration = 1800; // Slower for visibility
    const startTime = Date.now();
    
    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cycle through frames (slower frame rate)
            const frameIndex = Math.floor((elapsed / 200) % frames.length);
            projectile.style.backgroundImage = `url('${frames[frameIndex]}')`;
            
            // Move from hero to enemy with slight upward arc
            const currentX = positions.hero.x + (positions.enemy.x - positions.hero.x) * progress - 55;
            const arcHeight = Math.sin(progress * Math.PI) * 60; // Arc upward
            const currentY = positions.hero.y + (positions.enemy.y - positions.hero.y) * progress - arcHeight - 55;
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Gentle rotation and scale
            const rotation = progress * 180;
            const scale = 1 + progress * 0.4;
            projectile.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Impact flash
                projectile.style.filter = 'brightness(2) drop-shadow(0 0 38px rgba(138, 43, 226, 1))';
                setTimeout(() => {
                    projectile.remove();
                    nameDisplay.remove();
                    resolve();
                }, 250);
            }
        }
        requestAnimationFrame(animate);
    });
}

// Helper function to determine which special attack to play based on monster type
async function playSpecialAttackForMonster(monsterType, heroElement, enemyElement) {
    console.log(`🎯 Playing special attack for: ${monsterType}`);
    
    switch(monsterType) {
        case 'nova':
            await playNovaSpecialAttack(heroElement, enemyElement);
            break;
        case 'benny':
            await playBennySpecialAttack(heroElement, enemyElement);
            break;
        case 'luna':
            await playLunaSpecialAttack(heroElement, enemyElement);
            break;
        default:
            console.warn(`Unknown monster type: ${monsterType}`);
            // Fallback to a generic animation
            await new Promise(resolve => setTimeout(resolve, 600));
    }
}

// Export to window for global access
window.playNovaSpecialAttack = playNovaSpecialAttack;
window.playBennySpecialAttack = playBennySpecialAttack;
window.playLunaSpecialAttack = playLunaSpecialAttack;
window.playSpecialAttackForMonster = playSpecialAttackForMonster;

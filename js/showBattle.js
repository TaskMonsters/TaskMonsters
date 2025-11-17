// Show Battle Function
// Displays the battle arena and initializes the battle UI

function showBattle(hero, enemy) {
    console.log('🎮 showBattle called with:', { hero, enemy });
    
    // Get battle arena element
    const battleArena = document.getElementById('battleArena');
    if (!battleArena) {
        console.error('Battle arena element not found!');
        return;
    }
    
    // Show the battle arena
    battleArena.classList.remove('hidden');
    battleArena.style.display = 'flex';
    
    // Update hero HP display
    const heroHPText = document.getElementById('heroHP');
    const heroHPBar = document.getElementById('heroHPBar');
    if (heroHPText) {
        heroHPText.textContent = `${hero.hp}/${hero.maxHP}`;
    }
    if (heroHPBar) {
        const hpPercent = (hero.hp / hero.maxHP) * 100;
        heroHPBar.style.width = `${hpPercent}%`;
    }
    
    // Update enemy HP display
    const enemyHPText = document.getElementById('enemyHP');
    const enemyHPBar = document.getElementById('enemyHPBar');
    const enemyNameDisplay = document.getElementById('enemyName');
    
    if (enemyNameDisplay) {
        enemyNameDisplay.textContent = enemy.name;
    }
    if (enemyHPText) {
        enemyHPText.textContent = `${enemy.hp}/${enemy.maxHP}`;
    }
    if (enemyHPBar) {
        const hpPercent = (enemy.hp / enemy.maxHP) * 100;
        enemyHPBar.style.width = `${hpPercent}%`;
    }
    
    // Set enemy sprite using new animation system
    const enemySprite = document.getElementById('enemySprite');
    if (enemySprite && enemy.name) {
        // Use new frame-based animation system
        if (window.startEnemyAnimation) {
            window.startEnemyAnimation(enemy.name, 'idle');
        } else {
            // Fallback to old system
            if (enemy.sprites && enemy.sprites.idle) {
                enemySprite.style.backgroundImage = `url('${enemy.sprites.idle}')`;
                enemySprite.style.backgroundSize = 'contain';
                enemySprite.style.backgroundRepeat = 'no-repeat';
                enemySprite.style.backgroundPosition = 'center';
            }
        }
    }
    
    // Set hero sprite
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
        // Hero sprite is handled by startHeroAnimation in battleInit.js
        // Just ensure it's visible
        heroSprite.style.display = 'block';
    }
    
    console.log('✅ Battle arena displayed successfully');
}

// Hide battle arena
function hideBattle() {
    const battleArena = document.getElementById('battleArena');
    if (battleArena) {
        battleArena.classList.add('hidden');
        battleArena.style.display = 'none';
    }
}

// Export to global scope
window.showBattle = showBattle;
window.hideBattle = hideBattle;

console.log('✅ showBattle function loaded and exported to window');

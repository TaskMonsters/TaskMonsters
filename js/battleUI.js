// Battle UI Manager for Task Monsters

// Show battle arena with fade-in animation
function showBattle(hero, enemy) {
    const arena = document.getElementById('battleArena');
    arena.classList.remove('hidden');
    
    // Initialize UI elements
    updateBattleUI(hero, enemy);
    updateBattleButtonsVisibility();
}

// Update battle button visibility based on inventory
function updateBattleButtonsVisibility() {
    const inventory = gameState.battleInventory || {};
    const unlockedItems = gameState.unlockedBattleItems || [];
    
    // Fireball button - only show if ever unlocked
    const fireballBtn = document.getElementById('btnFireball');
    const fireballCount = document.getElementById('fireballCount');
    const fireballQty = inventory.fireball || 0;
    if (unlockedItems.includes('fireball')) {
        fireballBtn.style.display = '';
        fireballCount.textContent = `(${fireballQty})`;
    } else {
        fireballBtn.style.display = 'none';
    }
    
    // Potion button - only show if ever unlocked
    const potionBtn = document.getElementById('btnPotion');
    const potionCount = document.getElementById('potionCount');
    const potionQty = inventory.health_potion || 0;
    if (unlockedItems.includes('health_potion')) {
        potionBtn.style.display = '';
        potionCount.textContent = `(${potionQty})`;
    } else {
        potionBtn.style.display = 'none';
    }
    
    // Attack+ button - only show if ever unlocked
    const attackRefillBtn = document.getElementById('btnAttackRefill');
    const attackRefillCount = document.getElementById('attackRefillCount');
    const attackRefillQty = inventory.attack_refill || 0;
    if (unlockedItems.includes('attack_refill')) {
        attackRefillBtn.style.display = '';
        attackRefillCount.textContent = `(${attackRefillQty})`;
    } else {
        attackRefillBtn.style.display = 'none';
    }
    
    // Defense+ button - only show if ever unlocked
    const defenseRefillBtn = document.getElementById('btnDefenseRefill');
    const defenseRefillCount = document.getElementById('defenseRefillCount');
    const defenseRefillQty = inventory.defense_refill || 0;
    if (unlockedItems.includes('defense_refill')) {
        defenseRefillBtn.style.display = '';
        defenseRefillCount.textContent = `(${defenseRefillQty})`;
    } else {
        defenseRefillBtn.style.display = 'none';
    }
    
    // Invisibility Cloak button - only show if ever unlocked
    const invisibilityCloakBtn = document.getElementById('btnInvisibilityCloak');
    const invisibilityCloakCount = document.getElementById('invisibilityCloakCount');
    const invisibilityCloakQty = inventory.invisibility_cloak || 0;
    if (unlockedItems.includes('invisibility_cloak')) {
        invisibilityCloakBtn.style.display = '';
        invisibilityCloakCount.textContent = `(${invisibilityCloakQty})`;
    } else {
        invisibilityCloakBtn.style.display = 'none';
    }
}

// Update battle UI elements (HP, gauges, sprites)
function updateBattleUI(hero, enemy) {
    // Update hero HP
    const heroHPBar = document.getElementById('heroHPBar');
    const heroHPText = document.getElementById('heroHPText');
    const heroHPPercent = (hero.hp / hero.maxHP) * 100;
    heroHPBar.style.width = heroHPPercent + '%';
    heroHPText.textContent = `${hero.hp}/${hero.maxHP}`;

    // Update enemy HP
    const enemyHPBar = document.getElementById('enemyHPBar');
    const enemyHPText = document.getElementById('enemyHPText');
    const enemyHPPercent = (enemy.hp / enemy.maxHP) * 100;
    enemyHPBar.style.width = enemyHPPercent + '%';
    enemyHPText.textContent = `${enemy.hp}/${enemy.maxHP}`;

    // Update gauges
    const attackGaugeBar = document.getElementById('attackGaugeBar');
    const attackGaugeText = document.getElementById('attackGaugeText');
    attackGaugeBar.style.width = battleManager.attackGauge + '%';
    attackGaugeText.textContent = `${battleManager.attackGauge}/100`;

    const defenseGaugeBar = document.getElementById('defenseGaugeBar');
    const defenseGaugeText = document.getElementById('defenseGaugeText');
    defenseGaugeBar.style.width = battleManager.defenseGauge + '%';
    defenseGaugeText.textContent = `${battleManager.defenseGauge}/100`;
}

// Update action button availability
function updateActionButtons(hero) {
    const btnAttack = document.getElementById('btnAttack');
    const btnDefend = document.getElementById('btnDefend');
    const btnFireball = document.getElementById('btnFireball');
    const btnPotion = document.getElementById('btnPotion');

    // Attack requires 10 attack gauge
    btnAttack.disabled = battleManager.attackGauge < 10;

    // Defend requires 20 defense gauge
    btnDefend.disabled = battleManager.defenseGauge < 20;

    // Fireball requires 20 attack gauge AND inventory
    const fireballCount = gameState.battleInventory?.fireball || 0;
    const fireballCountSpan = btnFireball.querySelector('.item-count');
    if (fireballCountSpan) {
        fireballCountSpan.textContent = `(${fireballCount})`;
    }
    btnFireball.disabled = battleManager.attackGauge < 20 || fireballCount === 0;
    
    // Spark requires 25 attack gauge AND inventory (unlocked at level 7)
    const btnSpark = document.getElementById('btnSpark');
    if (btnSpark) {
        if (hero.level >= 7) {
            btnSpark.style.display = '';
            const sparkCount = gameState.battleInventory?.spark || 0;
            const sparkCountSpan = btnSpark.querySelector('.item-count');
            if (sparkCountSpan) {
                sparkCountSpan.textContent = `(${sparkCount})`;
            }
            btnSpark.disabled = battleManager.attackGauge < 25 || sparkCount === 0;
        } else {
            btnSpark.style.display = 'none';
        }
    }

    // Bomb requires 20 attack gauge AND inventory (unlocked at level 3)
    const btnBomb = document.getElementById('btnBomb');
    if (btnBomb) {
        if (hero.level >= 3) {
            btnBomb.style.display = '';
            const bombCount = gameState.battleInventory?.bomb || 0;
            const bombCountSpan = btnBomb.querySelector('.item-count');
            if (bombCountSpan) {
                bombCountSpan.textContent = `(${bombCount})`;
            }
            btnBomb.disabled = battleManager.attackGauge < 20 || bombCount === 0;
        } else {
            btnBomb.style.display = 'none';
        }
    }

    // Freeze requires 35 attack gauge AND inventory (unlocked at level 8)
    const btnFreeze = document.getElementById('btnFreeze');
    if (btnFreeze) {
        if (hero.level >= 8) {
            btnFreeze.style.display = '';
            const freezeCount = gameState.battleInventory?.freeze || 0;
            const freezeCountSpan = btnFreeze.querySelector('.item-count');
            if (freezeCountSpan) {
                freezeCountSpan.textContent = `(${freezeCount})`;
            }
            btnFreeze.disabled = battleManager.attackGauge < 35 || freezeCount === 0;
        } else {
            btnFreeze.style.display = 'none';
        }
    }

    // Potion requires inventory
    const potionCount = gameState.battleInventory?.health_potion || 0;
    const potionCountSpan = btnPotion.querySelector('.item-count');
    if (potionCountSpan) {
        potionCountSpan.textContent = `(${potionCount})`;
    }
    btnPotion.disabled = potionCount === 0;
    
    // Attack+ refill
    const btnAttackRefill = document.getElementById('btnAttackRefill');
    if (btnAttackRefill) {
        const attackRefillCount = gameState.battleInventory?.attack_refill || 0;
        const attackRefillCountSpan = btnAttackRefill.querySelector('.item-count');
        if (attackRefillCountSpan) {
            attackRefillCountSpan.textContent = `(${attackRefillCount})`;
        }
        btnAttackRefill.disabled = attackRefillCount === 0;
    }
    
    // Defense+ refill
    const btnDefenseRefill = document.getElementById('btnDefenseRefill');
    if (btnDefenseRefill) {
        const defenseRefillCount = gameState.battleInventory?.defense_refill || 0;
        const defenseRefillCountSpan = btnDefenseRefill.querySelector('.item-count');
        if (defenseRefillCountSpan) {
            defenseRefillCountSpan.textContent = `(${defenseRefillCount})`;
        }
        btnDefenseRefill.disabled = defenseRefillCount === 0;
    }
    
    // Invisibility Cloak
    const btnInvisibilityCloak = document.getElementById('btnInvisibilityCloak');
    if (btnInvisibilityCloak) {
        const invisibilityCloakCount = gameState.battleInventory?.invisibility_cloak || 0;
        const invisibilityCloakCountSpan = btnInvisibilityCloak.querySelector('.item-count');
        if (invisibilityCloakCountSpan) {
            invisibilityCloakCountSpan.textContent = `(${invisibilityCloakCount})`;
        }
        btnInvisibilityCloak.disabled = invisibilityCloakCount === 0;
    }
}

// Add message to battle log
function addBattleLog(message) {
    const log = document.getElementById('battleLog');
    log.innerHTML += `<div>${message}</div>`;
    log.scrollTop = log.scrollHeight;
}

// Fireball Projectile Animation
async function playFireballAnimation(startElement, targetElement) {
    const projectile = document.getElementById('fireballProjectile');
    const explosion = document.getElementById('explosionEffect');

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // Make fireball larger
    projectile.style.width = '80px';
    projectile.style.height = '80px';
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 40 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 40 + 'px';
    projectile.classList.remove('hidden');

    // Use new single fireball sprite
    projectile.style.backgroundImage = 'url("assets/battle-items/fireball.png")';
    projectile.style.backgroundSize = 'contain';
    
    // Rotate fireball for effect
    let rotation = 0;
    const frameInterval = setInterval(() => {
        rotation += 15;
        projectile.style.transform = `rotate(${rotation}deg)`;
    }, 100);

    // Animate projectile movement
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 40;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 40;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Stop frame animation
                clearInterval(frameInterval);

                // Hide projectile
                projectile.classList.add('hidden');

                // Play explosion
                playExplosionAnimation(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Waveform Projectile Animation (Ghost enemy attack)
async function playWaveformAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'waveform-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 16 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 16 + 'px';

    // Animate projectile movement
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 16;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 16;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile
                projectile.remove();
                resolve();
            }
        }

        requestAnimationFrame(animate);
    });
}

// Spark Projectile Animation (Player level 7+ attack)
async function playSparkAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'spark-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 16 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 16 + 'px';

    // Animate projectile movement
    const duration = 600;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 16;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 16;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile
                projectile.remove();
                resolve();
            }
        }

        requestAnimationFrame(animate);
    });
}

// Bomb Projectile Animation
async function playBombAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'bomb-projectile';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/bomb/bomb1.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 20 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 20 + 'px';

    // Animate projectile movement with arc
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in-out)
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 20;
            const arc = Math.sin(progress * Math.PI) * 100; // Arc height
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 20 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate bomb
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show explosion
                projectile.remove();
                playBombExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Bomb Explosion Animation
async function playBombExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    // Explosion frames from the Bomb folder
    const explosionFrames = [
        'assets/battle-items/bomb/Bomb Explosion/explosion-d1.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d2.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d3.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d4.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d5.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d6.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d7.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d8.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d9.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d10.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d11.png',
        'assets/battle-items/bomb/Bomb Explosion/explosion-d12.png'
    ];

    // Play each frame
    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    explosion.remove();
}

// Freeze Projectile Animation
async function playFreezeAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'freeze-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Ice shot frames
    const shotFrames = [
        'assets/battle-items/freeze/shot-1.png',
        'assets/battle-items/freeze/shot-2.png',
        'assets/battle-items/freeze/shot-3.png'
    ];
    let frameIndex = 0;

    // Animate projectile movement
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Cycle through animation frames
            frameIndex = Math.floor((elapsed / 100) % shotFrames.length);
            projectile.style.backgroundImage = `url('${shotFrames[frameIndex]}')`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show freeze impact
                projectile.remove();
                playFreezeImpact(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Freeze Impact Animation
async function playFreezeImpact(targetRect) {
    const impact = document.createElement('div');
    impact.style.width = '100px';
    impact.style.height = '100px';
    impact.style.position = 'fixed';
    impact.style.left = targetRect.left + targetRect.width / 2 - 50 + 'px';
    impact.style.top = targetRect.top + targetRect.height / 2 - 50 + 'px';
    impact.style.backgroundSize = 'contain';
    impact.style.backgroundRepeat = 'no-repeat';
    impact.style.zIndex = '1001';
    document.body.appendChild(impact);

    // Impact frames from the freeze folder
    const impactFrames = [
        'assets/battle-items/freeze/shot-hit copy/shot-hit-1.png',
        'assets/battle-items/freeze/shot-hit copy/shot-hit-2.png',
        'assets/battle-items/freeze/shot-hit copy/shot-hit-3.png'
    ];

    // Play each frame multiple times for freeze effect
    for (let loop = 0; loop < 2; loop++) {
        for (let i = 0; i < impactFrames.length; i++) {
            impact.style.backgroundImage = `url('${impactFrames[i]}')`;
            await new Promise(resolve => setTimeout(resolve, 80));
        }
    }

    impact.remove();
}

// Explosion Animation
async function playExplosionAnimation(targetRect) {
    const explosion = document.getElementById('explosionEffect');

    // Position explosion at target
    explosion.style.left = targetRect.left + targetRect.width / 2 - 40 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 40 + 'px';
    explosion.classList.remove('hidden');

    // Explosion frames
    const explosionFrames = [
        'assets/battle-items/bomb-explosion1.png',
        'assets/battle-items/bomb-explosion2.png',
        'assets/battle-items/bomb-explosion4.png',
        'assets/battle-items/bomb-explosion5.png',
        'assets/battle-items/bomb-explosion6.png'
    ];

    // Play each frame
    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 80));
    }

    // Hide explosion
    explosion.classList.add('hidden');
}

// Update battle shop display
function updateBattleShopDisplay() {
    const shopContainer = document.getElementById('battleShopContainer');
    if (!shopContainer) return;

    const items = [
        { name: 'Fireball', cost: 20, emoji: '🔥', key: 'fireball' },
        { name: 'Health Potion', cost: 15, emoji: '💚', key: 'health_potion' },
        { name: 'Invisibility Cloak', cost: 40, emoji: '🥷🏼', key: 'invisibility_cloak', levelRequired: 3 }
    ];

    shopContainer.innerHTML = items.map(item => `
        <div class="shop-item" data-item="${item.key}" data-cost="${item.cost}">
            <div class="shop-item-icon">${item.emoji}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-cost">${item.cost} XP</div>
            </div>
            <button class="shop-buy-btn" onclick="buyBattleItem('${item.key}', ${item.cost})">Buy</button>
        </div>
    `).join('');
}

// Update battle inventory display with intuitive grid layout
function updateBattleInventoryDisplay() {
    const inventoryContainer = document.getElementById('battleInventoryContainer');
    if (!inventoryContainer) return;

    const inventory = gameState.battleInventory || { fireball: 0, health_potion: 0, invisibility_cloak: 0 };

    inventoryContainer.innerHTML = `
        <div class="inventory-grid">
            <div class="inventory-slot">
                <div class="inventory-slot-icon">🔥</div>
                <div class="inventory-slot-name">Fireball</div>
                <div class="inventory-slot-count">${inventory.fireball}</div>
            </div>
            <div class="inventory-slot">
                <div class="inventory-slot-icon">💚</div>
                <div class="inventory-slot-name">Health Potion</div>
                <div class="inventory-slot-count">${inventory.health_potion}</div>
            </div>
            <div class="inventory-slot">
                <div class="inventory-slot-icon">🥷🏼</div>
                <div class="inventory-slot-name">Invisibility Cloak</div>
                <div class="inventory-slot-count">${inventory.invisibility_cloak}</div>
            </div>
        </div>
    `;
}

// Buy battle item
function buyBattleItem(itemKey, cost) {
    if (itemKey === 'invisibility_cloak' && gameState.level < 3) {
        alert('You need Level 3 to buy the Invisibility Cloak!');
        return;
    }
    if (gameState.xpBalance < cost) {
        alert('Not enough XP Balance!');
        return;
    }

    gameState.xpBalance -= cost;
    gameState.xp = Math.max(0, (gameState.xp || 0) - cost);
    gameState.battleInventory[itemKey]++;
    
    if (!gameState.unlockedBattleItems.includes(itemKey)) {
        gameState.unlockedBattleItems.push(itemKey);
    }
    
    saveGameState();
    updateBattleShopDisplay();
    updateBattleInventoryDisplay();
    
    // Update XP display if function exists
    if (typeof updateTasksDisplay === 'function') {
        updateTasksDisplay();
    }
}



// Export to global scope
window.showBattle = showBattle;
window.updateBattleUI = updateBattleUI;
window.updateGauges = updateGauges;
window.hideBattle = hideBattle;
window.addBattleLog = addBattleLog;
window.animateFireball = animateFireball;
window.playFireballAnimation = playFireballAnimation;
window.playWaveformAnimation = playWaveformAnimation;
window.playSparkAnimation = playSparkAnimation;
window.playBombAnimation = playBombAnimation;
window.playFreezeAnimation = playFreezeAnimation;
window.updateBattleButtons = updateBattleButtons;
window.updateBattleShopDisplay = updateBattleShopDisplay;
window.updateBattleInventoryDisplay = updateBattleInventoryDisplay;
window.buyBattleItem = buyBattleItem;


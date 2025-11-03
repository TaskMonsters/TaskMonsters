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
    // Ensure battleInventory exists
    if (!gameState.battleInventory) {
        gameState.battleInventory = {
            fireball: 0,
            spark: 0,
            health_potion: 2,
            attack_refill: 2,
            defense_refill: 2,
            invisibility_cloak: 0,
            prickler: 0,
            freeze: 0,
            blue_flame: 0,
            procrastination_ghost: 0
        };
    }
    
    // Ensure unlockedBattleItems exists
    if (!gameState.unlockedBattleItems) {
        gameState.unlockedBattleItems = ['health_potion', 'attack_refill', 'defense_refill'];
    }
    
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
    
    // Prickler button - only show if ever unlocked
    const pricklerBtn = document.getElementById('btnPrickler');
    const pricklerCount = document.getElementById('pricklerCount');
    const pricklerQty = inventory.prickler || 0;
    if (unlockedItems.includes('prickler')) {
        pricklerBtn.style.display = '';
        pricklerCount.textContent = `(${pricklerQty})`;
    } else {
        pricklerBtn.style.display = 'none';
    }
    
    // Spark button - only show if ever unlocked
    const sparkBtn = document.getElementById('btnSpark');
    const sparkCount = document.getElementById('sparkCount');
    const sparkQty = inventory.spark || 0;
    if (unlockedItems.includes('spark')) {
        sparkBtn.style.display = '';
        sparkCount.textContent = `(${sparkQty})`;
    } else {
        sparkBtn.style.display = 'none';
    }
    
    // Freeze button - only show if ever unlocked
    const freezeBtn = document.getElementById('btnFreeze');
    const freezeCount = document.getElementById('freezeCount');
    const freezeQty = inventory.freeze || 0;
    if (unlockedItems.includes('freeze')) {
        freezeBtn.style.display = '';
        freezeCount.textContent = `(${freezeQty})`;
    } else {
        freezeBtn.style.display = 'none';
    }
    
    // Blue Flame button - only show if ever unlocked
    const blueFlameBtn = document.getElementById('btnBlueFlame');
    const blueFlameCount = document.getElementById('blueFlameCount');
    const blueFlameQty = inventory.blue_flame || 0;
    if (unlockedItems.includes('blue_flame')) {
        blueFlameBtn.style.display = '';
        blueFlameCount.textContent = `(${blueFlameQty})`;
    } else {
        blueFlameBtn.style.display = 'none';
    }
    
    // Procrastination Ghost button - only show if ever unlocked
    const ghostBtn = document.getElementById('btnProcrastinationGhost');
    const ghostCount = document.getElementById('procrastinationGhostCount');
    const ghostQty = inventory.procrastination_ghost || 0;
    if (unlockedItems.includes('procrastination_ghost')) {
        ghostBtn.style.display = '';
        ghostCount.textContent = `(${ghostQty})`;
    } else {
        ghostBtn.style.display = 'none';
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

    // Asteroid requires 15 attack gauge AND inventory (unlocked at level 1)
    const btnAsteroid = document.getElementById('btnAsteroid');
    if (btnAsteroid) {
        if (gameState.unlockedBattleItems?.includes('asteroid_attack')) {
            btnAsteroid.style.display = '';
            const asteroidCount = gameState.battleInventory?.asteroid_attack || 0;
            const asteroidCountSpan = btnAsteroid.querySelector('.item-count');
            if (asteroidCountSpan) {
                asteroidCountSpan.textContent = `(${asteroidCount})`;
            }
            btnAsteroid.disabled = battleManager.attackGauge < 15 || asteroidCount === 0;
        } else {
            btnAsteroid.style.display = 'none';
        }
    }

    // Prickler requires 20 attack gauge AND inventory (unlocked at level 3)
    const btnPrickler = document.getElementById('btnPrickler');
    if (btnPrickler) {
        if (gameState.unlockedBattleItems?.includes('prickler')) {
            btnPrickler.style.display = '';
            const pricklerCount = gameState.battleInventory?.prickler || 0;
            const pricklerCountSpan = btnPrickler.querySelector('.item-count');
            if (pricklerCountSpan) {
                pricklerCountSpan.textContent = `(${pricklerCount})`;
            }
            btnPrickler.disabled = battleManager.attackGauge < 20 || pricklerCount === 0;
        } else {
            btnPrickler.style.display = 'none';
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
    
    // Hyper Potion requires inventory
    const btnHyperPotion = document.getElementById('btnHyperPotion');
    if (btnHyperPotion) {
        const hyperPotionCount = gameState.battleInventory?.hyper_potion || 0;
        const hyperPotionCountSpan = btnHyperPotion.querySelector('.item-count');
        if (hyperPotionCountSpan) {
            hyperPotionCountSpan.textContent = `(${hyperPotionCount})`;
        }
        btnHyperPotion.disabled = hyperPotionCount === 0;
    }
    
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
    
    // Mirror Attack (unlocked at level 40)
    const btnMirrorAttack = document.getElementById('btnMirrorAttack');
    if (btnMirrorAttack) {
        if (hero.level >= 40) {
            btnMirrorAttack.style.display = '';
            const mirrorAttackCount = gameState.battleInventory?.mirror_attack || 0;
            const mirrorAttackCountSpan = btnMirrorAttack.querySelector('.item-count');
            if (mirrorAttackCountSpan) {
                mirrorAttackCountSpan.textContent = `(${mirrorAttackCount})`;
            }
            btnMirrorAttack.disabled = mirrorAttackCount === 0;
        } else {
            btnMirrorAttack.style.display = 'none';
        }
    }
    
    // Blue Flame (unlocked at level 12)
    const btnBlueFlame = document.getElementById('btnBlueFlame');
    if (btnBlueFlame) {
        if (hero.level >= 12) {
            btnBlueFlame.style.display = '';
            const blueFlameCount = gameState.battleInventory?.blue_flame || 0;
            const blueFlameCountSpan = btnBlueFlame.querySelector('.item-count');
            if (blueFlameCountSpan) {
                blueFlameCountSpan.textContent = `(${blueFlameCount})`;
            }
            btnBlueFlame.disabled = battleManager.attackGauge < 20 || blueFlameCount === 0;
        } else {
            btnBlueFlame.style.display = 'none';
        }
    }
    
    // Procrastination Ghost (unlocked at level 15)
    const btnProcrastinationGhost = document.getElementById('btnProcrastinationGhost');
    if (btnProcrastinationGhost) {
        if (hero.level >= 15) {
            btnProcrastinationGhost.style.display = '';
            const procrastinationGhostCount = gameState.battleInventory?.procrastination_ghost || 0;
            const procrastinationGhostCountSpan = btnProcrastinationGhost.querySelector('.item-count');
            if (procrastinationGhostCountSpan) {
                procrastinationGhostCountSpan.textContent = `(${procrastinationGhostCount})`;
            }
            btnProcrastinationGhost.disabled = battleManager.attackGauge < 25 || procrastinationGhostCount === 0;
        } else {
            btnProcrastinationGhost.style.display = 'none';
        }
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

// Asteroid Projectile Animation
async function playAsteroidAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'asteroid-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/projectiles/asteroid-projectile.png")';
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

    // Animate projectile movement with arc
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in)
            const eased = progress * progress;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const arc = Math.sin(progress * Math.PI) * 80; // Arc height
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate asteroid
            projectile.style.transform = `rotate(${progress * 720}deg)`;

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

// Prickler Projectile Animation
async function playPricklerAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'prickler-projectile';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/prickler/prickler.png")';
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
            
            // Rotate prickler
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show explosion
                projectile.remove();
                playPricklerExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Prickler Nuclear Explosion Animation
async function playPricklerExplosion(targetRect) {
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

    // Nuclear explosion frames from the Prickler folder
    const explosionFrames = [
        'assets/battle-items/prickler/Prickler Explosion/explosion-d1.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d2.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d3.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d4.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d5.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d6.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d7.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d8.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d9.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d10.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d11.png',
        'assets/battle-items/prickler/Prickler Explosion/explosion-d12.png'
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

    // Ice shot frames (8-frame animation)
    const shotFrames = [
        'assets/battle-items/freeze/_0000_Layer-1.png',
        'assets/battle-items/freeze/_0001_Layer-2.png',
        'assets/battle-items/freeze/_0002_Layer-3.png',
        'assets/battle-items/freeze/_0003_Layer-4.png',
        'assets/battle-items/freeze/_0004_Layer-5.png',
        'assets/battle-items/freeze/_0005_Layer-6.png',
        'assets/battle-items/freeze/_0006_Layer-7.png',
        'assets/battle-items/freeze/_0007_Layer-8.png'
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

    // Use fireball-explosion3.png as the explosion visual
    explosion.style.backgroundImage = 'url("assets/battle-items/fireball-explosion3.png")';
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    
    // Fade in explosion
    explosion.style.opacity = '1';
    explosion.style.transform = 'scale(0.5)';
    
    // Animate explosion scale and fade
    await new Promise(resolve => {
        let frame = 0;
        const maxFrames = 8;
        const interval = setInterval(() => {
            frame++;
            const progress = frame / maxFrames;
            explosion.style.transform = `scale(${0.5 + progress * 0.5})`;
            explosion.style.opacity = `${1 - progress * 0.5}`;
            
            if (frame >= maxFrames) {
                clearInterval(interval);
                resolve();
            }
        }, 60);
    });

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
    if (gameState.xpCoins < cost) {
        alert('Not enough XP Coins!');
        return;
    }

    gameState.xpCoins -= cost;
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
window.hideBattle = hideBattle;
window.addBattleLog = addBattleLog;
window.animateFireball = animateFireball;
window.playFireballAnimation = playFireballAnimation;
window.playWaveformAnimation = playWaveformAnimation;
window.playSparkAnimation = playSparkAnimation;
window.playPricklerAnimation = playPricklerAnimation;
window.playFreezeAnimation = playFreezeAnimation;
window.updateBattleButtons = updateBattleButtons;
window.updateBattleShopDisplay = updateBattleShopDisplay;
window.updateBattleInventoryDisplay = updateBattleInventoryDisplay;
window.buyBattleItem = buyBattleItem;


// Splash Projectile Animation (Octopus drench attack)
async function playSplashAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'splash-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 32 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 32 + 'px';
    projectile.style.width = '64px';
    projectile.style.height = '64px';
    projectile.style.backgroundImage = 'url("assets/splash-attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 600;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 32 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 32 + 'px';
            projectile.style.opacity = 1 - progress * 0.3;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 200);
            }
        }
        animate();
    });
}

// Alien Projectile Animation
async function playAlienProjectile(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'alien-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 24 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 24 + 'px';
    projectile.style.width = '48px';
    projectile.style.height = '48px';
    projectile.style.backgroundImage = 'url("assets/alien-projectile.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 500;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 24 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 24 + 'px';
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 200);
            }
        }
        animate();
    });
}

// Export functions
window.playSplashAnimation = playSplashAnimation;
window.playAlienProjectile = playAlienProjectile;

// Lazy Bat Rock Projectile Animation
async function playBatRockProjectile(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'bat-rock-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 16 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 16 + 'px';
    projectile.style.width = '32px';
    projectile.style.height = '32px';
    projectile.style.backgroundImage = 'url("assets/bat-rock-projectile.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 500;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 16 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 16 + 'px';
            projectile.style.transform = `rotate(${progress * 720}deg)`; // Two full rotations

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 100);
            }
        }
        animate();
    });
}

// Export function
window.playBatRockProjectile = playBatRockProjectile;

// Fire Skull Explosion Animation
async function playFireExplosion(startElement, targetElement) {
    const explosion = document.createElement('div');
    explosion.className = 'fire-explosion';
    document.body.appendChild(explosion);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position explosion at target
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 32 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 32 + 'px';
    explosion.style.width = '64px';
    explosion.style.height = '64px';
    explosion.style.backgroundImage = 'url("assets/enemies/fire-skull/fire-skull-explosion.png")';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.imageRendering = 'pixelated';
    explosion.style.zIndex = '10000';
    explosion.style.animation = 'explosionFlash 0.5s ease-out';

    return new Promise((resolve) => {
        setTimeout(() => {
            explosion.style.opacity = '0';
            setTimeout(() => {
                explosion.remove();
                resolve();
            }, 200);
        }, 500);
    });
}

// Export function
window.playFireExplosion = playFireExplosion;

// Blue Flame Animation
async function playBlueFlameAnimation(startElement, targetElement) {
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const projectile = document.createElement('div');
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.right + 'px';
    projectile.style.top = (startRect.top + startRect.height / 2 - 16) + 'px';
    projectile.style.width = '32px';
    projectile.style.height = '32px';
    projectile.style.backgroundImage = 'url(assets/blue-flame-spritesheet.png)';
    projectile.style.backgroundSize = '128px 32px'; // 4 frames
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '1000';
    projectile.style.pointerEvents = 'none';
    projectile.style.animation = 'blueFlameMove 0.5s linear, blueFlameAnimate 0.2s steps(4) infinite';
    
    document.body.appendChild(projectile);

    // Animate to target
    const deltaX = targetRect.left - startRect.right;
    const duration = 500;
    const deltaY = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2);
    
    projectile.style.setProperty('--deltaX', deltaX + 'px');
    projectile.style.setProperty('--deltaY', deltaY + 'px');

    await new Promise(resolve => setTimeout(resolve, 500));

    projectile.remove();
    
    // Play fireball explosion on impact (same as Fireball)
    await playExplosionAnimation(targetRect);
}

// Procrastination Ghost Animation
async function playProcrastinationGhostAnimation(startElement, targetElement) {
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const projectile = document.createElement('div');
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.right + 'px';
    projectile.style.top = (startRect.top + startRect.height / 2 - 16) + 'px';
    projectile.style.width = '32px';
    projectile.style.height = '32px';
    projectile.style.backgroundImage = 'url(assets/procrastination-ghost-projectile.png)';
    projectile.style.backgroundSize = 'contain';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '1000';
    projectile.style.pointerEvents = 'none';
    projectile.style.opacity = '0.8';
    projectile.style.animation = 'ghostFloat 0.6s ease-in-out';
    
    document.body.appendChild(projectile);

    // Animate to target with floating motion
    const deltaX = targetRect.left - startRect.right;
    const deltaY = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2);
    
    projectile.style.setProperty('--deltaX', deltaX + 'px');
    projectile.style.setProperty('--deltaY', deltaY + 'px');

    await new Promise(resolve => setTimeout(resolve, 600));

    // Ghost effect on impact
    targetElement.style.filter = 'brightness(0.7) grayscale(0.5)';
    setTimeout(() => {
        targetElement.style.filter = '';
    }, 300);

    projectile.remove();
}

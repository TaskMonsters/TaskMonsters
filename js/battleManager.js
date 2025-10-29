// Battle Manager - State Machine and Combat Logic

const BattleState = {
    INITIALIZING: 'initializing',
    PLAYER_TURN: 'player_turn',
    ENEMY_TURN: 'enemy_turn',
    ANIMATING: 'animating',
    VICTORY: 'victory',
    DEFEAT: 'defeat',
    FLED: 'fled'
};

class BattleManager {
    constructor() {
        this.state = BattleState.INITIALIZING;
        this.hero = null;
        this.enemy = null;
        this.attackGauge = 0;
        this.defenseGauge = 0;
        this.battleLog = [];
        this.hasEvade = false;
    }

    // Initialize battle with hero and enemy
    async startBattle(heroData, enemyData) {
        this.state = BattleState.INITIALIZING;
        this.hero = heroData;
        this.enemy = enemyData;
        this.attackGauge = 100;  // Start with full attack gauge
        this.defenseGauge = 100; // Start with full defense gauge
        this.battleLog = [];
        this.attackCount = 0;    // Track attack count for walk+attack animation

        // Set battle background based on level with rotation
        const battleContainer = document.querySelector('.battle-container');
        battleContainer.classList.remove('bg-forest', 'bg-night-town', 'bg-city', 'bg-temple', 'bg-ocean', 'bg-skull-gate');
        
        // Determine available arenas based on level
        const availableArenas = [];
        if (this.hero.level >= 1) availableArenas.push('bg-city'); // city_sunset at level 1
        if (this.hero.level >= 2) availableArenas.push('bg-ocean');
        if (this.hero.level >= 5) availableArenas.push('bg-temple');
        if (this.hero.level >= 12) availableArenas.push('bg-night-town');
        if (this.hero.level >= 13) availableArenas.push('bg-skull-gate'); // Skull Gate at level 13+
        
        // Alternating encounter system: rotate through available arenas
        if (!window.battleArenaIndex) window.battleArenaIndex = 0;
        const arenaClass = availableArenas[window.battleArenaIndex % availableArenas.length];
        battleContainer.classList.add(arenaClass);
        window.battleArenaIndex++;
        
        // Play battle music
        if (window.audioManager) {
            window.audioManager.playMusic('battleMusic', 0.4);
        }

        // Show battle arena
        showBattle(this.hero, this.enemy);

        // Initialize enemy sprite with correct size class
        if (typeof initEnemySprite === 'function') {
            initEnemySprite(this.enemy);
        }

        // Play wake up sequence
        addBattleLog(`💤 A ${this.enemy.name} appears!`);
        await playWakeUpSequence(this.enemy);
        addBattleLog('⚔️ Battle Start!');

        // Enemy attacks first
        await this.enemyTurn();
    }

    // Player attacks
    async playerAttack() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 10) {
            addBattleLog('❌ Not enough attack gauge!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 10;
        this.attackCount++;
        updateBattleUI(this.hero, this.enemy);

        // Play hero attack animation
        // Every 3rd attack uses walk+attack animation with movement
        if (this.attackCount % 3 === 0 && this.attackCount > 0) {
            const heroSprite = document.getElementById('heroSprite');
            const originalLeft = heroSprite.style.left || '0px';
            
            // Start walk+attack animation
            startHeroAnimation('walk-attack');
            
            // Move hero forward toward enemy (150px to the right)
            heroSprite.style.transition = 'left 0.45s ease-out';
            heroSprite.style.left = '150px';
            
            // Wait for walk and attack to complete
            await new Promise(resolve => setTimeout(resolve, 450));
            
            // Move back to original position
            heroSprite.style.transition = 'left 0.45s ease-in';
            heroSprite.style.left = originalLeft;
            
            await new Promise(resolve => setTimeout(resolve, 450));
            heroSprite.style.transition = '';
        } else {
            startHeroAnimation('attack1');
            await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms
        }

        // Check if enemy evades (Ghost ability)
        if (this.enemy.canEvade && Math.random() < this.enemy.evasionChance) {
            addBattleLog(`👻 ${this.enemy.name} evaded your attack!`);
            updateBattleUI(this.hero, this.enemy);
            
            // Reset hero sprite to idle
            startHeroAnimation('idle');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
            return;
        }
        
        // Calculate damage using base attack (level-based)
        // Enemy defense reduces damage slightly but not too much
        const baseDamage = this.hero.attack;
        const defenseReduction = Math.floor(this.enemy.defense * 0.1); // Only 10% of enemy defense
        const damage = Math.max(baseDamage - defenseReduction, Math.floor(baseDamage * 0.8)); // At least 80% of base damage
        const isDead = this.enemy.takeDamage(damage);

        // Play attack sound
        if (window.audioManager) {
            window.audioManager.playSound('monsterAttack', 0.6);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`💥 You dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player uses spark (unlocked at level 7)
    async playerSpark() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for spark!');
            return;
        }

        const sparkCount = gameState.battleInventory?.spark || 0;
        if (sparkCount <= 0) {
            addBattleLog('❌ No sparks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;  // Spark costs 25 attack gauge
        gameState.battleInventory.spark--;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for spark
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play spark animation
        const heroSprite = document.getElementById('heroSprite');
        const enemySprite = document.getElementById('enemySprite');
        await playSparkAnimation(heroSprite, enemySprite);

        // Calculate damage (slightly less than fireball)
        const damage = Math.floor((this.hero.attack * 2.2) - (this.enemy.defense / 3));
        const isDead = this.enemy.takeDamage(damage);

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`⚡ Spark dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Save game state
        saveGameState();

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player defends - activates defense mode
    async playerDefend() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        if (this.defendBlocked > 0) {
            addBattleLog(`❌ Defend is blocked for ${this.defendBlocked} more turn(s)!`);
            return;
        }

        this.state = BattleState.ANIMATING;
        this.defendActive = true; // Flag to use defense gauge on next hit
        
        addBattleLog('🛡️ Defense stance activated!');
        updateBattleUI(this.hero, this.enemy);

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses fireball
    async playerFireball() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        if (this.fireballBlocked) {
            addBattleLog('❌ Fireball is blocked by Drench!');
            return;
        }
        
        if (this.attackGauge < 30) {
            addBattleLog('❌ Need 30 attack gauge for fireball!');
            return;
        }

        const fireballCount = gameState.battleInventory?.fireball || 0;
        if (fireballCount <= 0) {
            addBattleLog('❌ No fireballs left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 30;  // Fireball costs 30 attack gauge
        gameState.battleInventory.fireball--;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for fireball
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play fireball sound
        if (window.audioManager) {
            window.audioManager.playSound('fireball', 0.7);
        }

        // Play fireball animation
        await playFireballAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (2x multiplier)
        const damage = Math.max(5, Math.floor((this.hero.attack - this.enemy.defense / 2) * 2));
        const isDead = this.enemy.takeDamage(damage);

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🔥 Fireball dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player uses bomb
    async playerBomb() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 20) {
            addBattleLog('❌ Need 20 attack gauge for bomb!');
            return;
        }

        const bombCount = gameState.battleInventory?.bomb || 0;
        if (bombCount <= 0) {
            addBattleLog('❌ No bombs left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 20;  // Bomb costs 20 attack gauge
        gameState.battleInventory.bomb--;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for bomb
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play bomb animation
        await playBombAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (moderate damage)
        const damage = Math.floor((this.hero.attack * 1.8) - (this.enemy.defense / 3));
        const isDead = this.enemy.takeDamage(damage);

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`💣 Bomb dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player uses freeze (deals damage and skips enemy turn)
    async playerFreeze() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 35) {
            addBattleLog('❌ Need 35 attack gauge for freeze!');
            return;
        }

        const freezeCount = gameState.battleInventory?.freeze || 0;
        if (freezeCount <= 0) {
            addBattleLog('❌ No freeze attacks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 35;  // Freeze costs 35 attack gauge
        gameState.battleInventory.freeze--;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for freeze
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play freeze animation
        await playFreezeAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage
        const damage = Math.floor((this.hero.attack * 1.7) - (this.enemy.defense / 3));
        const isDead = this.enemy.takeDamage(damage);

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`❄️ Freeze dealt ${damage} damage and froze the enemy!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            // Enemy is frozen, skip their turn and go back to player turn
            addBattleLog('❄️ Enemy is frozen and cannot move!');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Refill gauges slightly for next turn
            this.attackGauge = Math.min(100, this.attackGauge + 15);
            this.defenseGauge = Math.min(100, this.defenseGauge + 15);
            
            this.state = BattleState.PLAYER_TURN;
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
        }
    }

    // Player uses potion
    async playerPotion() {
        console.log('🧪 playerPotion called');
        console.log('Battle state:', this.state);
        console.log('gameState.battleInventory:', gameState.battleInventory);
        
        if (this.state !== BattleState.PLAYER_TURN) {
            console.log('❌ Not player turn, state is:', this.state);
            return;
        }

        const potionCount = gameState.battleInventory?.health_potion || 0;
        console.log('Potion count:', potionCount);
        
        if (potionCount <= 0) {
            addBattleLog('❌ No potions left!');
            console.log('❌ No potions in inventory');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.health_potion--;
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        const healAmount = 30;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        
        addBattleLog(`💚 Healed ${healAmount} HP!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800)); // 8 frames * 100ms
        
        // Reset to idle
        startHeroAnimation('idle');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.enemyTurn();
    }

    // Player flees
    async playerFlee() {
        if (this.state !== BattleState.PLAYER_TURN) return;

        this.state = BattleState.FLED;
        addBattleLog('🏃 You fled from battle!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await this.endBattle('fled');
    }

    // Player uses attack refill
    async playerAttackRefill() {
        if (this.state !== BattleState.PLAYER_TURN) return;

        const refillCount = gameState.battleInventory?.attack_refill || 0;
        if (refillCount <= 0) {
            addBattleLog('❌ No attack refills left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.attack_refill--;
        
        const refillAmount = 50;
        this.attackGauge = Math.min(100, this.attackGauge + refillAmount);
        
        addBattleLog(`⚡ Restored ${refillAmount} attack gauge!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses defense refill
    async playerDefenseRefill() {
        if (this.state !== BattleState.PLAYER_TURN) return;

        const refillCount = gameState.battleInventory?.defense_refill || 0;
        if (refillCount <= 0) {
            addBattleLog('❌ No defense refills left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.defense_refill--;
        
        // Play item use sound
        if (window.audioManager) {
            window.audioManager.playSound('useItemBattle', 0.6);
        }
        
        const refillAmount = 50;
        this.defenseGauge = Math.min(100, this.defenseGauge + refillAmount);
        
        addBattleLog(`🛡️ Restored ${refillAmount} defense gauge!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses invisibility cloak
    async playerInvisibilityCloak() {
        if (this.state !== BattleState.PLAYER_TURN) return;

        const cloakCount = gameState.battleInventory?.invisibility_cloak || 0;
        if (cloakCount <= 0) {
            addBattleLog('❌ No Invisibility Cloaks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.invisibility_cloak--;
        this.hasEvade = true;
        
        addBattleLog('🥷🏼 Invisibility Cloak activated! You will evade the next attack.');
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses Blue Flame
    async playerBlueFlame() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 20) {
            addBattleLog('❌ Need 20 attack gauge for Blue Flame!');
            return;
        }

        const blueFlameCount = gameState.battleInventory?.blue_flame || 0;
        if (blueFlameCount <= 0) {
            addBattleLog('❌ No Blue Flames left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 20;
        gameState.battleInventory.blue_flame--;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play blue flame animation
        await playBlueFlameAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (20 base damage)
        const damage = 20;
        const isDead = this.enemy.takeDamage(damage);
        addBattleLog(`🔵🔥 Blue Flame dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
        }
    }

    // Player uses Procrastination Ghost
    async playerProcrastinationGhost() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for Procrastination Ghost!');
            return;
        }

        const ghostCount = gameState.battleInventory?.procrastination_ghost || 0;
        if (ghostCount <= 0) {
            addBattleLog('❌ No Procrastination Ghosts left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;
        gameState.battleInventory.procrastination_ghost--;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play procrastination ghost animation
        await playProcrastinationGhostAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate variable damage (10-16)
        const damage = Math.floor(Math.random() * 7) + 10; // Random between 10-16
        const isDead = this.enemy.takeDamage(damage);
        addBattleLog(`👻 Procrastination Ghost dealt ${damage} damage and made enemy skip next turn!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            // Enemy skips turn, go back to player
            addBattleLog('👻 Enemy is procrastinating and skips their turn!');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Refill gauges slightly for next turn
            this.attackGauge = Math.min(100, this.attackGauge + 15);
            this.defenseGauge = Math.min(100, this.defenseGauge + 15);
            
            this.state = BattleState.PLAYER_TURN;
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
        }
    }

    // Enemy turn
    async enemyTurn() {
        this.state = BattleState.ENEMY_TURN;

        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if enemy can petrify (Medusa)
        const canPetrify = this.enemy.canPetrify && Math.random() < (this.enemy.petrifyChance || 0.3);
        
        if (canPetrify) {
            // Petrify attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show Medusa projectile if available
            if (this.enemy.projectileType === 'medusa') {
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playMedusaProjectile(enemySprite, heroSprite);
            }
            
            addBattleLog(`💎 ${this.enemy.name}'s gaze petrifies you! Turn skipped!`);
            
            // Show stone effect on hero
            const heroSprite = document.getElementById('heroSprite');
            const stoneEffect = document.createElement('div');
            stoneEffect.style.position = 'absolute';
            stoneEffect.style.fontSize = '3rem';
            stoneEffect.style.animation = 'pulse 1s ease-in-out';
            stoneEffect.textContent = '🗿';
            heroSprite.parentElement.appendChild(stoneEffect);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            stoneEffect.remove();
            
            // Enemy gets another turn (player is petrified)
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.enemyTurn();
            return;
        }

        // Check if enemy can cast sleep (Lazy Eye)
        const canCastSleep = this.enemy.canSleep && Math.random() < 0.3; // 30% chance
        
        if (canCastSleep) {
            // Sleep attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            addBattleLog(`😴 ${this.enemy.name} cast Sleep! You skip your next turn!`);
            
            // Show Z emojis on hero
            const heroSprite = document.getElementById('heroSprite');
            const sleepEmojis = document.createElement('div');
            sleepEmojis.style.position = 'absolute';
            sleepEmojis.style.fontSize = '2rem';
            sleepEmojis.style.animation = 'float 2s ease-in-out';
            sleepEmojis.textContent = '💤 💤 💤';
            heroSprite.parentElement.appendChild(sleepEmojis);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            sleepEmojis.remove();
            
            // Enemy gets another turn
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.enemyTurn();
            return;
        }
        
        // Check for Octopus drench attack (50% chance)
        const useDrench = this.enemy.drenchAttack && Math.random() < 0.5;
        
        // Check for Octopus hug attack (30% chance)
        const useHug = this.enemy.hugAttack && !useDrench && Math.random() < 0.3;
        
        if (useDrench) {
            // Drench attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show splash projectile
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playSplashAnimation(enemySprite, heroSprite);
            
            // Apply drench effect: 10 damage + block fireball for 1 turn
            this.hero.hp = Math.max(0, this.hero.hp - 10);
            this.fireballBlocked = true;
            addBattleLog(`💦 ${this.enemy.name}'s Drench attack dealt 10 damage and blocked fireball!`);
            
            // Play hero hurt animation
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 2000));
            startHeroAnimation('idle');
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.state = BattleState.PLAYER_TURN;
            return;
        } else if (useHug) {
            // Hug attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Apply hug effect: block defend for 2 turns
            this.defendBlocked = 2;
            addBattleLog(`🐙 ${this.enemy.name}'s Hug blocked defend for 2 turns!`);
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            return;
        }
        
        // Normal attack
        await playEnemyAnimation(this.enemy, 'attack1', 600);
        
        // If Lazy Bat, shoot rock projectile
        if (this.enemy.name === 'Lazy Bat') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playBatRockProjectile(enemySprite, heroSprite);
        }
        
        // If ghost enemy, shoot waveform projectile
        if (this.enemy.projectileType === 'waveform') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playWaveformAnimation(enemySprite, heroSprite);
        }
        
        // If alien enemy, shoot alien projectile
        if (this.enemy.projectileType === 'alien') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playAlienProjectile(enemySprite, heroSprite);
        }
        
        // If Fire Skull, show explosion animation
        if (this.enemy.projectileType === 'fire-explosion') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playFireExplosion(enemySprite, heroSprite);
        }

        // Check if Invisibility Cloak is active
        if (this.hasEvade) {
            addBattleLog('🥷🏼 Your monster used the Invisibility Cloak and evaded the attack!');
            this.hasEvade = false;
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            return;
        }
        
        // Play enemy attack sound
        if (window.audioManager) {
            window.audioManager.playSound('enemyAttack', 0.6);
        }

        // Calculate damage
        let damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
        
        // Alien variable damage (5 or 15)
        if (this.enemy.variableDamage) {
            damage = Math.random() < 0.5 ? 5 : 15;
        }
        
        // Apply damage cap if enemy has one
        if (this.enemy.maxDamage) {
            damage = Math.min(damage, this.enemy.maxDamage);
        }
        
        // Check if defend was active - use defense gauge instead of HP
        if (this.defendActive && this.defenseGauge > 0) {
            const gaugeUsed = Math.min(damage, this.defenseGauge);
            this.defenseGauge -= gaugeUsed;
            const remainingDamage = damage - gaugeUsed;
            if (remainingDamage > 0) {
                this.hero.hp = Math.max(0, this.hero.hp - remainingDamage);
                addBattleLog(`🛡️ Blocked ${gaugeUsed} damage! Took ${remainingDamage} damage!`);
            } else {
                addBattleLog(`🛡️ Blocked all ${damage} damage!`);
            }
            this.defendActive = false;
        } else {
            this.hero.hp = Math.max(0, this.hero.hp - damage);
        }

        // Play hero hurt animation if took damage
        if (damage > 0 || this.hero.hp < 30) {
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds as requested
        } else {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        addBattleLog(`💢 ${this.enemy.name} dealt ${damage} damage!`);
        
        // Slime drain effects
        if (this.enemy.drainEnergy) {
            const energyDrain = 15;
            this.attackGauge = Math.max(0, this.attackGauge - energyDrain);
            addBattleLog(`💧 ${this.enemy.name} drained ${energyDrain} energy!`);
        }
        
        if (this.enemy.drainDefense) {
            const defenseDrain = 12;
            this.defenseGauge = Math.max(0, this.defenseGauge - defenseDrain);
            addBattleLog(`💧 ${this.enemy.name} weakened your defense by ${defenseDrain}!`);
        }
        
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        if (this.hero.hp <= 0) {
            this.state = BattleState.DEFEAT;
            await this.endBattle('defeat');
        } else {
            // Decrement block counters
            if (this.fireballBlocked) {
                this.fireballBlocked = false;
            }
            if (this.defendBlocked > 0) {
                this.defendBlocked--;
            }
            
            this.state = BattleState.PLAYER_TURN;
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
        }
    }

    // End battle
    async endBattle(result) {
        let xpGained = 0;
        let xpLost = 0;
        
        if (result === 'victory') {
            addBattleLog(`🎉 VICTORY! You defeated the ${this.enemy.name}!`);
            
            // Calculate XP reward based on enemy level
            xpGained = Math.floor(15 + (this.enemy.level * 5));
            
            // Award XP
            if (window.gameState && typeof window.addJerryXP === 'function') {
                window.addJerryXP(xpGained);
            }
            
            // Track battle win
            if (window.gameState) {
                window.gameState.battlesWon = (window.gameState.battlesWon || 0) + 1;
                if (typeof saveGameState === 'function') {
                    saveGameState();
                }
            }
            
            // Play enemy die animation
            await playEnemyAnimation(this.enemy, 'die', 1000);
            
            // Show friendly victory message
            await new Promise(resolve => setTimeout(resolve, 500));
            alert(`🎉 Victory!\n\nYou defeated the ${this.enemy.name}!\n\n✨ +${xpGained} XP earned!\n\nGreat job, keep it up! 💪`);
            
        } else if (result === 'defeat') {
            addBattleLog('💫 DEFEAT! You were defeated...');
            
            // Calculate XP loss (smaller penalty)
            xpLost = Math.floor(5 + (this.enemy.level * 2));
            
            // Deduct XP (but don't go below 0)
            if (window.gameState) {
                window.gameState.jerryXP = Math.max(0, (window.gameState.jerryXP || 0) - xpLost);
            }
            
            // Track battle loss
            if (window.gameState) {
                window.gameState.battlesLost = (window.gameState.battlesLost || 0) + 1;
                if (typeof saveGameState === 'function') {
                    saveGameState();
                }
            }
            
            // Play hero death animation
            startHeroAnimation('death');
            await new Promise(resolve => setTimeout(resolve, 1200)); // 8 frames * 150ms
            
            // Show friendly defeat message
            alert(`💫 Defeat...\n\nThe ${this.enemy.name} was too strong this time.\n\n📉 -${xpLost} XP lost\n\nDon't give up! Train harder and try again! 🔥`);
            
        } else if (result === 'fled') {
            addBattleLog('🏃 You fled from battle!');
        }

        // Refill gauges after battle
        if (result === 'victory' || result === 'fled') {
            this.hero.attackGauge = 100;
            this.hero.defenseGauge = 100;
            updateBattleUI(this.hero, this.enemy);
            saveGameState();
        }

        // Stop battle music
        if (window.audioManager) {
            window.audioManager.stopMusic();
        }

        // Fade out after 2 seconds
        setTimeout(() => {
            document.getElementById('battleLog').innerHTML = '';
            const arena = document.getElementById('battleArena');
            arena.classList.add('hidden');
        }, 2000);
    }
}

// Global battle manager instance
let battleManager = null;

// Initialize battle manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        battleManager = new BattleManager();
        window.battleManager = battleManager;
        console.log('Battle Manager initialized');
    });
} else {
    battleManager = new BattleManager();
    window.battleManager = battleManager;
    console.log('Battle Manager initialized');
}


// Battle Manager - State Machine and Combat Logic

console.log('📜 battleManager.js is loading...');

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
        this.hasReflect = false;
        this.enemyAttackCount = 0;  // Track enemy attack count for every 5th attack sound
    }

    // Initialize battle with hero and enemy
    async startBattle(heroData, enemyData) {
        // Check if enemy was created successfully
        if (!enemyData) {
            console.error('❌ Cannot start battle: Enemy data is null!');
            console.error('This usually means createRandomEnemy() failed.');
            console.error('Check that ASSET_CONFIG.enemies is loaded.');
            return;
        }
        
        console.log('✅ Starting battle with:', { hero: heroData, enemy: enemyData });
        
        this.state = BattleState.INITIALIZING;
        this.hero = heroData;
        this.enemy = enemyData;
        this.attackGauge = 100;  // Start with full attack gauge
        this.defenseGauge = 100; // Start with full defense gauge
        this.battleLog = [];
        this.attackCount = 0;    // Track attack count for walk+attack animation
        this.enemyAttackCount = 0;  // Reset enemy attack count for every 5th attack sound
        
        // Verify gameState inventory is loaded
        // Sync main inventory to battle inventory
        if (!window.gameState.battleInventory) {
            window.gameState.battleInventory = {};
        }
        
        // Sync items from main inventory to battle inventory
        if (window.gameState.inventory) {
            // Copy all items from main inventory
            window.gameState.battleInventory.potion = window.gameState.inventory.potion || 0;
            window.gameState.battleInventory.hyper_potion = window.gameState.inventory.hyper_potion || 0;
            window.gameState.battleInventory.fireball = window.gameState.inventory.fireball || 0;
            window.gameState.battleInventory.spark = window.gameState.inventory.spark || 0;
            window.gameState.battleInventory.attack_refill = window.gameState.inventory.attack_refill || 0;
            window.gameState.battleInventory.defense_refill = window.gameState.inventory.defense_refill || 0;
            console.log('✅ Synced inventory to battle:', window.gameState.battleInventory);
        } else {
            // Fallback: initialize with defaults
            window.gameState.battleInventory = {
                potion: 0,
                hyper_potion: 0,
                fireball: 0,
                spark: 0,
                attack_refill: 0,
                defense_refill: 0
            };
        }
        
        if (!window.gameState.unlockedBattleItems) {
            console.warn('Unlocked battle items not found, initializing...');
            window.gameState.unlockedBattleItems = ['health_potion', 'attack_refill', 'defense_refill'];
        }
        
        // Boss status effects
        this.poisonTurns = 0;
        this.poisonDamage = 0;
        this.poisonGaugeDrain = 0;
        this.mushroomTurns = 0;
        this.mushroomMissChance = 0;
        this.mushroomSkipChance = 0;
        this.mushroomGaugeDrain = 0;
        this.enemyFrozenTurns = 0;  // Freeze effect from Freeze Attack
        this.invisibilityTurns = 0;  // Invisibility Cloak effect

        // Set battle background based on level with rotation
        const battleContainer = document.querySelector('.battle-container');
        battleContainer.classList.remove('bg-forest', 'bg-night-town', 'bg-city', 'bg-temple', 'bg-ocean', 'bg-skull-gate', 'bg-space');
        
        // Determine available arenas based on level
        const availableArenas = [];
        if (this.hero.level >= 1) availableArenas.push('bg-city'); // city_sunset at level 1
        if (this.hero.level >= 2) availableArenas.push('bg-ocean');
        if (this.hero.level >= 5) availableArenas.push('bg-temple');
        if (this.hero.level >= 8) availableArenas.push('bg-space'); // New space background at level 8+
        if (this.hero.level >= 12) availableArenas.push('bg-night-town');
        if (this.hero.level >= 13) availableArenas.push('bg-skull-gate'); // Skull Gate at level 13+
        
        // Alternating encounter system: rotate through available arenas
        if (!window.battleArenaIndex) window.battleArenaIndex = 0;
        const arenaClass = availableArenas[window.battleArenaIndex % availableArenas.length];
        console.log(`🏞️ Battle Arena #${window.battleArenaIndex + 1}: ${arenaClass} (Available: ${availableArenas.join(', ')})`);
        battleContainer.classList.add(arenaClass);
        window.battleArenaIndex++;
        
        // Initialize new battle systems
        if (window.specialGauge) {
            window.specialGauge.init();
        }
        if (window.battleMusicSystem) {
            window.battleMusicSystem.init();
            const tier = window.getEnemyTier ? window.getEnemyTier(this.hero.level) : 'common';
            window.battleMusicSystem.playBattleMusic(tier);
        } else if (window.audioManager) {
            window.audioManager.playBattleMusic();
        }
        if (window.battleBackgroundSystem) {
            window.battleBackgroundSystem.init();
            window.battleBackgroundSystem.loadBackgroundForLevel(this.hero.level);
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
        
        // Enemy attacks first (will set state to PLAYER_TURN when done)
        await this.enemyTurn();
    }

    // Player attacks
    async playerAttack() {
        console.log('🎯 playerAttack called! Current state:', this.state, 'Expected:', BattleState.PLAYER_TURN);
        if (this.state !== BattleState.PLAYER_TURN) {
            console.warn('❌ Attack blocked - not player turn. State:', this.state);
            return;
        }
        if (this.actionInProgress) {
            console.warn('❌ Attack blocked - action already in progress');
            return;
        }
        this.actionInProgress = true;
        console.log('✅ Attack proceeding...');
        
        try {
        // Process poison effect
        if (this.poisonTurns > 0) {
            this.hero.hp = Math.max(0, this.hero.hp - this.poisonDamage);
            this.attackGauge = Math.max(0, this.attackGauge - this.poisonGaugeDrain);
            this.defenseGauge = Math.max(0, this.defenseGauge - this.poisonGaugeDrain);
            addBattleLog(`☠️ Poison drained ${this.poisonDamage} HP and ${this.poisonGaugeDrain} from each gauge!`);
            this.poisonTurns--;
            
            // Play hurt animation for poison damage
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 2000));
            startHeroAnimation('idle');
            
            updateBattleUI(this.hero, this.enemy);
            
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
                return;
            }
        }
        
        // Process mushroom effect
        if (this.mushroomTurns > 0) {
            this.attackGauge = Math.max(0, this.attackGauge - this.mushroomGaugeDrain);
            this.defenseGauge = Math.max(0, this.defenseGauge - this.mushroomGaugeDrain);
            addBattleLog(`🍄 Mushroom effect drained ${this.mushroomGaugeDrain} from each gauge!`);
            
            // Check for skip turn
            if (Math.random() < this.mushroomSkipChance) {
                addBattleLog(`😵 Mushroom effect made you skip your turn!`);
                this.mushroomTurns--;
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                await this.enemyTurn();
                return;
            }
        }
        
        if (this.attackGauge < 10) {
            addBattleLog('❌ Not enough attack gauge!');
            return;
        }

        // Don't change state to ANIMATING - keep as PLAYER_TURN
        // This allows buttons to remain clickable during animation
        this.attackGauge -= 10;
        this.attackCount++;
        updateBattleUI(this.hero, this.enemy);

        // Play hero attack animation
        // Every 3rd attack uses special animation if level >= 6, otherwise walk+attack
        if (this.attackCount % 3 === 0 && this.attackCount > 0) {
            const heroSprite = document.getElementById('heroSprite');
            const enemySprite = document.getElementById('enemySprite');
            const heroLevel = gameState.level || 1;
            const selectedMonster = localStorage.getItem('selectedMonster');
            
            // Check if level is 6 or higher and special attack animation exists
            if (heroLevel >= 6 && selectedMonster && window.playSpecialAttackForMonster) {
                // Play special attack animation for this monster
                addBattleLog(`✨ ${this.hero.name} unleashes a special attack!`);
                await window.playSpecialAttackForMonster(selectedMonster, heroSprite, enemySprite);
            } else {
                // Use regular walk+attack animation
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
            }
        } else {
            startHeroAnimation('attack1');
            await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms
            // Immediately return to idle after attack animation completes
            startHeroAnimation('idle');
        }

        // Check for mushroom miss effect
        if (this.mushroomTurns > 0 && Math.random() < this.mushroomMissChance) {
            addBattleLog(`😵 Mushroom effect made you miss!`);
            this.mushroomTurns--;
            updateBattleUI(this.hero, this.enemy);
            
            // Reset hero sprite to idle
            startHeroAnimation('idle');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
            return;
        }
        
        // Check if enemy evades (Ghost ability or Sunny Dragon)
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
        let damage = Math.max(baseDamage - defenseReduction, Math.floor(baseDamage * 0.8)); // At least 80% of base damage
        
        // Apply Power Boost buff if active
        if (this.attackBuffTurns > 0) {
            const buffBonus = Math.floor(damage * this.attackBuffPercent);
            damage += buffBonus;
            addBattleLog(`⚡ Power Boost adds +${buffBonus} damage! (${this.attackBuffTurns} turns left)`);
            this.attackBuffTurns--;
        }
        
        // Add special attack bonus damage (8 damage) if level >= 6 and 3rd attack
        const heroLevel = gameState.level || 1;
        const selectedMonster = localStorage.getItem('selectedMonster');
        if (this.attackCount % 3 === 0 && heroLevel >= 6 && selectedMonster && window.playSpecialAttackForMonster) {
            damage += 8; // Special attack bonus damage
            addBattleLog(`💥 Special attack deals +8 bonus damage!`);
        }
        
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
        // Fill special gauge on attack
        if (window.specialGauge) {
            window.specialGauge.fillOnAttack();
        }

        // Play attack sounds
        if (window.audioManager) {
            // Play new monster regular attack sound for non-special attacks
            window.audioManager.playSound('enemy_regular_attack', 0.8);
            
            // Play every 3rd attack sound
            if (this.attackCount % 3 === 0 && this.attackCount > 0) {
                window.audioManager.playSound('third_attack', 0.8);
            }
            
            // Play critical hit sound for damage >= 10
            if (damage >= 10) {
                window.audioManager.playSound('critical_hit', 0.8);
            }
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`💥 You dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        if (isDead) {
            this.state = BattleState.VICTORY;
            this.actionInProgress = false;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            this.actionInProgress = false;
            await this.enemyTurn();
        }
        } catch (error) {
            console.error('❌ Error in playerAttack:', error);
            this.actionInProgress = false;
            this.state = BattleState.PLAYER_TURN;
            addBattleLog('❌ An error occurred during attack!');
        }
    }

    // Player uses special attack (monster-specific)
    async playerSpecialAttack() {
        console.log('⚡ playerSpecialAttack called! Current state:', this.state, 'Expected:', BattleState.PLAYER_TURN);
        if (this.state !== BattleState.PLAYER_TURN) {
            console.warn('❌ Special Attack blocked - not player turn. State:', this.state);
            return;
        }
        if (this.actionInProgress) {
            console.warn('❌ Special Attack blocked - action already in progress');
            return;
        }
        
        // Check if special gauge is ready
        if (!window.specialGauge || !window.specialGauge.isReady) {
            addBattleLog('❌ Special Attack not ready yet!');
            return;
        }
        
        this.actionInProgress = true;
        console.log('✅ Special Attack proceeding...');
        
        try {
        this.state = BattleState.ANIMATING;
        
        // Get monster type from localStorage
        const selectedMonster = localStorage.getItem('selectedMonster') || 'nova';
        const monsterType = selectedMonster.toLowerCase();
        
        // Get enemy sprite element
        const enemySprite = document.getElementById('enemySprite');
        
        // Execute special attack animation and get result
        const result = await window.executeSpecialAttack(monsterType, enemySprite, this.hero.level);
        
        if (!result) {
            this.state = BattleState.PLAYER_TURN;
            this.actionInProgress = false;
            return;
        }
        
        // Apply damage
        const isDead = this.enemy.takeDamage(result.damage);
        
        // Apply special effects based on monster
        if (monsterType === 'benny') {
            // Stun enemy for 1 turn
            this.enemy.stunned = true;
            this.enemy.stunnedTurns = 1;
        } else if (monsterType === 'luna') {
            // Reduce enemy defense by 20% for 2 turns
            this.enemy.defenseReduction = 0.2;
            this.enemy.defenseReductionTurns = 2;
        }
        
        // Don't fill special gauge on special attack - it should reset
        // if (window.specialGauge) {
        //     window.specialGauge.fillOnAttack();
        // }
        
        // Play critical hit sound
        if (window.audioManager) {
            window.audioManager.playSound('critical_hit', 0.8);
        }
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        updateBattleUI(this.hero, this.enemy);
        
        // Save game state
        saveGameState();
        
        // Reset hero sprite to idle
        startHeroAnimation('idle');
        
        if (isDead) {
            this.state = BattleState.VICTORY;
            this.actionInProgress = false;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            this.actionInProgress = false;
            await this.enemyTurn();
        }
        } catch (error) {
            console.error('❌ Error in playerSpecialAttack:', error);
            this.actionInProgress = false;
            this.state = BattleState.PLAYER_TURN;
            addBattleLog('❌ An error occurred during special attack!');
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
        gameState.battleInventory.spark = Math.max(0, gameState.battleInventory.spark - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for spark
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play spark animation
        const heroSprite = document.getElementById('heroSprite');
        const enemySprite = document.getElementById('enemySprite');
        await playSparkAnimation(heroSprite, enemySprite);
        
        // Play spark attack sound
        if (window.audioManager) {
            window.audioManager.playSound('spark_attack', 0.8);
        }

        // Blueprint v2.0: Spark Orb deals 100 damage with 10% double hit chance
        let damage = 100;
        const doubleHit = Math.random() < 0.10;
        
        let isDead = this.enemy.takeDamage(damage);
        
        if (doubleHit && !isDead) {
            addBattleLog('⚡⚡ DOUBLE HIT!');
            await new Promise(resolve => setTimeout(resolve, 300));
            isDead = this.enemy.takeDamage(damage);
            damage = damage * 2; // For log display
        }
        
        // Play critical hit sound for damage >= 10 (Spark always deals 18-20)
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

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
        
        // Play defend sound
        if (window.audioManager) {
            window.audioManager.playSound('defend', 0.7);
        }
        
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
        gameState.battleInventory.fireball = Math.max(0, gameState.battleInventory.fireball - 1);
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

        // Calculate damage (15-18 range as per spec)
        const damage = Math.floor(Math.random() * 4) + 15; // Random between 15-18
        const isDead = this.enemy.takeDamage(damage);

        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }

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

    // Player uses prickler
    // Player uses asteroid attack
    async playerAsteroid() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 15) {
            addBattleLog('❌ Need 15 attack gauge for asteroid!');
            return;
        }

        const asteroidCount = gameState.battleInventory?.asteroid_attack || 0;
        if (asteroidCount <= 0) {
            addBattleLog('❌ No asteroids left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 15;  // Asteroid costs 15 attack gauge
        gameState.battleInventory.asteroid_attack = Math.max(0, gameState.battleInventory.asteroid_attack - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play asteroid sound
        if (window.audioManager) {
            window.audioManager.playSound('asteroid_attack', 0.8);
        }

        // Play asteroid animation
        await playAsteroidAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Blueprint v2.0: Asteroid deals 150 damage with 10% miss chance
        const missChance = 0.10;
        
        if (Math.random() < missChance) {
            addBattleLog('💨 Asteroid missed!');
            startHeroAnimation('idle');
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
            return;
        }
        
        const damage = 150;
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
        // Play critical hit sound for damage >= 10
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🪨 Asteroid Attack dealt ${damage} damage!`);
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

    async playerPrickler() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 20) {
            addBattleLog('❌ Need 20 attack gauge for prickler!');
            return;
        }

        const pricklerCount = gameState.battleInventory?.prickler || 0;
        if (pricklerCount <= 0) {
            addBattleLog('❌ No pricklers left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 20;  // Prickler costs 20 attack gauge
        gameState.battleInventory.prickler = Math.max(0, gameState.battleInventory.prickler - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for prickler
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play prickler animation
        await playPricklerAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play prickler attack sound
        if (window.audioManager) {
            window.audioManager.playSound('prickler_attack', 0.8);
        }

        // Blueprint v2.0: Prickler deals 50 damage + applies Poison (5 dmg/turn for 3 turns)
        const damage = 50;
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
        // Apply poison debuff
        if (!isDead) {
            this.enemy.poisonTurns = 3;
            this.enemy.poisonDamage = 5;
            addBattleLog('🦠 Enemy is poisoned! (5 damage per turn for 3 turns)');
        }
        
        // Play critical hit sound for damage >= 10 (Prickler always deals 10-15)
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`💣 Prickler dealt ${damage} damage!`);
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
        gameState.battleInventory.freeze = Math.max(0, gameState.battleInventory.freeze - 1);
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
        
        // Play freeze attack sound
        if (window.audioManager) {
            window.audioManager.playSound('freeze_attack', 0.8);
        }

        // Enhanced Freeze: Deals 50 damage and freezes enemy for 2-3 turns based on level
        const damage = 50;
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
        // Freeze effect: 2 turns at level < 20, 3 turns at level >= 20
        const playerLevel = gameState.jerryLevel || 1;
        const freezeTurns = playerLevel >= 20 ? 3 : 2;
        
        if (!isDead) {
            this.enemyFrozenTurns = freezeTurns;
            addBattleLog(`❄️ Enemy is frozen for ${freezeTurns} turns!`);
            
            // Apply visual freeze effect
            if (window.applyFreezeEffect) {
                window.applyFreezeEffect(true);
            }
        }
        
        // Play critical hit sound for damage >= 10
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`❄️ Freeze dealt ${damage} damage!`);
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
        gameState.battleInventory.health_potion = Math.max(0, gameState.battleInventory.health_potion - 1);
        
        // Play potion use sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.7);
        }
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        // Blueprint v2.0: Heal 25% of Monster's Max HP
        const healAmount = Math.floor(this.hero.maxHP * 0.25);
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        
        // Show floating heal text
        if (window.showFloatingText) {
            window.showFloatingText(`+${healAmount} HP`, 'hp-heal', document.getElementById('heroSprite'));
        }
        
        addBattleLog(`💚 Healed ${healAmount} HP!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);;

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800)); // 8 frames * 100ms
        
        // Reset to idle
        startHeroAnimation('idle');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.enemyTurn();
    }

    // Player uses hyper potion
    async playerHyperPotion() {
        console.log('❤️‍🩹 playerHyperPotion called');
        console.log('Battle state:', this.state);
        
        if (this.state !== BattleState.PLAYER_TURN) {
            console.log('❌ Not player turn, state is:', this.state);
            return;
        }

        const hyperPotionCount = gameState.battleInventory?.hyper_potion || 0;
        console.log('Hyper Potion count:', hyperPotionCount);
        
        if (hyperPotionCount <= 0) {
            addBattleLog('❌ No hyper potions left!');
            console.log('❌ No hyper potions in inventory');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.hyper_potion = Math.max(0, gameState.battleInventory.hyper_potion - 1);
        
        // Play potion use sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.7);
        }
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        const healAmount = 50;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        
        // Show floating heal text
        if (window.showFloatingText) {
            window.showFloatingText(`+${healAmount} HP`, 'hp-heal', document.getElementById('heroSprite'));
        }
        
        addBattleLog(`💚 Hyper Potion healed ${healAmount} HP!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800));
        
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
            addBattleLog('❌ No Power Boosts left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.attack_refill = Math.max(0, gameState.battleInventory.attack_refill - 1);
        
        // Play potion/power boost sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.8);
        }
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        // Blueprint v2.0: Power Boost increases Monster's Attack by 20% for 3 turns
        this.attackBuffPercent = 0.20;
        this.attackBuffTurns = 3;
        
        // Show floating attack boost text
        if (window.showFloatingText) {
            window.showFloatingText(`+20% ATK`, 'attack-up', document.getElementById('heroSprite'));
        }
        
        addBattleLog(`⚡ Power Boost activated! Attack increased by 20% for 3 turns!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Reset to idle
        startHeroAnimation('idle');
        
        await new Promise(resolve => setTimeout(resolve, 200));
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
        gameState.battleInventory.defense_refill = Math.max(0, gameState.battleInventory.defense_refill - 1);
        
        // Play defense boost sound
        if (window.audioManager) {
            window.audioManager.playSound('defense_boost', 0.7);
        }
        
        const refillAmount = 50;
        this.defenseGauge = Math.min(100, this.defenseGauge + refillAmount);
        
        // Show floating defense boost text
        if (window.showFloatingText) {
            window.showFloatingText(`+${refillAmount} DEF`, 'defense-up', document.getElementById('heroSprite'));
        }
        
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
        gameState.battleInventory.invisibility_cloak = Math.max(0, gameState.battleInventory.invisibility_cloak - 1);
        
        // Invisibility lasts for 2 turns
        this.invisibilityTurns = 2;
        
        // Play invisibility cloak sound
        if (window.audioManager) {
            window.audioManager.playSound('cloak_use', 0.8);
        }
        
        // Make hero vanish
        if (window.applyInvisibilityEffect) {
            window.applyInvisibilityEffect(true);
        }
        
        addBattleLog('🤟🏻 Invisibility Cloak activated! You are invisible for 2 turns.');
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses Mirror Attack
    async playerMirrorAttack() {
        if (this.state !== BattleState.PLAYER_TURN) return;

        const mirrorCount = gameState.battleInventory?.mirror_attack || 0;
        if (mirrorCount <= 0) {
            addBattleLog('❌ No Mirror Attacks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.mirror_attack = Math.max(0, gameState.battleInventory.mirror_attack - 1);
        
        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Play mirror sound
        if (window.audioManager) {
            window.audioManager.playSound('mirror_attack', 0.8);
        }
        
        // Play mirror animation
        await playMirrorAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Blueprint v2.0: Mirror deals 75 damage + reflects 50% of damage taken next turn
        const damage = 75;
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
        // Apply reflect buff
        if (!isDead) {
            this.hasReflect = true;
            this.reflectPercent = 0.50;
            addBattleLog('🪞 Mirror dealt 75 damage! Next damage taken will be reflected 50%!');
        } else {
            addBattleLog('🪞 Mirror dealt 75 damage!');
        }
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);
        
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
        gameState.battleInventory.blue_flame = Math.max(0, gameState.battleInventory.blue_flame - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play blue flame sound
        if (window.audioManager) {
            window.audioManager.playSound('blue_flame_attack', 0.8);
        }

        // Play blue flame animation
        await playBlueFlameAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (20 base damage)
        const damage = 20;
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
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
        gameState.battleInventory.procrastination_ghost = Math.max(0, gameState.battleInventory.procrastination_ghost - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play procrastination ghost sound
        if (window.audioManager) {
            window.audioManager.playSound('procrastination_ghost_attack', 0.8);
        }

        // Play procrastination ghost animation
        await playProcrastinationGhostAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate variable damage (18-22 range, skips 1 turn)
        const damage = Math.floor(Math.random() * 5) + 18; // Random between 18-22
        const isDead = this.enemy.takeDamage(damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('enemySprite'));
        }
        
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

    // Player uses Poison Leaf
    async playerPoisonLeaf() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for Poison Leaf!');
            return;
        }

        const poisonLeafCount = gameState.battleInventory?.poison_leaf || 0;
        if (poisonLeafCount <= 0) {
            addBattleLog('❌ No Poison Leaves left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;
        gameState.battleInventory.poison_leaf = Math.max(0, gameState.battleInventory.poison_leaf - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play poison leaf sound
        if (window.audioManager) {
            window.audioManager.playSound('poison_leaf_attack', 0.8);
        }

        // Play poison leaf animation
        await playPoisonLeafAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Apply poison effect: 10 damage per turn for 4 turns
        if (!this.enemy.poisonTurns) {
            this.enemy.poisonTurns = 4;
            this.enemy.poisonDamage = 10;
        } else {
            // Stack poison duration
            this.enemy.poisonTurns += 4;
            this.enemy.poisonDamage = Math.max(this.enemy.poisonDamage || 0, 10);
        }
        
        addBattleLog(`🍃 Poison Leaf applied! Enemy will take 10 damage per turn for 4 turns!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Enemy turn
    async enemyTurn() {
        this.state = BattleState.ENEMY_TURN;
        
        // Check if enemy is frozen
        if (this.enemyFrozenTurns && this.enemyFrozenTurns > 0) {
            this.enemyFrozenTurns--;
            addBattleLog(`❄️ ${this.enemy.name} is frozen! (${this.enemyFrozenTurns} turns left)`);
            
            // Remove freeze effect if no turns left
            if (this.enemyFrozenTurns === 0) {
                addBattleLog(`❄️ ${this.enemy.name} thawed out!`);
                if (window.applyFreezeEffect) {
                    window.applyFreezeEffect(false);
                }
            }
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            return;
        }
        
        // Process poison damage on enemy (from Prickler)
        if (this.enemy.poisonTurns && this.enemy.poisonTurns > 0) {
            const poisonDamage = this.enemy.poisonDamage || 5;
            this.enemy.hp = Math.max(0, this.enemy.hp - poisonDamage);
            addBattleLog(`🦠 ${this.enemy.name} takes ${poisonDamage} poison damage!`);
            this.enemy.poisonTurns--;
            updateBattleUI(this.hero, this.enemy);
            
            if (this.enemy.hp <= 0) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Check for boss enrage
        if (window.ENEMY_TIER_SYSTEM && window.ENEMY_TIER_SYSTEM.checkEnrage(this.enemy)) {
            this.enemy = window.ENEMY_TIER_SYSTEM.applyEnrage(this.enemy);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        
        // === SMART AI DECISION SYSTEM ===
        // All enemy actions are now decided by the Smart AI
        if (window.enemyAI) {
            const decision = window.enemyAI.makeSmartDecision(this.enemy, this.hero, this);
            
            console.log(`🤖 Enemy AI Decision: ${decision.action} - ${decision.reason}`);
            
            // Execute the decided action
            switch (decision.action) {
                case 'heal':
                    await this.executeEnemyHeal();
                    return;
                    
                case 'defend':
                    await this.executeEnemyDefend();
                    return;
                    
                case 'special':
                    await this.executeEnemySpecial();
                    return;
                    
                case 'status':
                    await this.executeEnemyStatus();
                    return;
                    
                case 'attack':
                default:
                    await this.executeEnemyAttack();
                    return;
            }
        }
        
        // Fallback if AI not loaded (should never happen)
        console.warn('⚠️ Enemy AI not loaded, using fallback attack');
        await this.executeEnemyAttack();
    }
    
    // ===== ENEMY ACTION EXECUTION METHODS =====
    
    // Execute enemy heal action
    async executeEnemyHeal() {
        const playerLevel = gameState.level || 1;
        const healResult = window.enemyAI.executeHeal(this.enemy, playerLevel);
        
        if (healResult.healed) {
            addBattleLog(`💚 ${this.enemy.name} regenerates ${healResult.amount} HP!`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        this.state = BattleState.PLAYER_TURN;
        addBattleLog('⚔️ Your turn!');
    }
    
    // Execute enemy defend action
    async executeEnemyDefend() {
        addBattleLog(`🛡️ ${this.enemy.name} braces for impact!`);
        
        // Set defense flag for next player attack
        this.enemy.isDefending = true;
        this.enemy.defenseReduction = 0.50; // 50% damage reduction
        
        updateBattleUI(this.hero, this.enemy);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.state = BattleState.PLAYER_TURN;
        addBattleLog('⚔️ Your turn!');
    }
    
    // Execute enemy special attack
    async executeEnemySpecial() {
        const specialType = window.enemyAI.getSpecialAttackType(this.enemy);
        
        switch (specialType) {
            case 'petrify':
                await this.enemyPetrifyAttack();
                break;
            case 'poison':
                await this.enemyPoisonAttack();
                break;
            case 'drain_gauge':
                await this.enemyDrainGaugeAttack();
                break;
            case 'mushroom':
                await this.enemyMushroomAttack();
                break;
            default:
                await this.executeEnemyAttack();
                break;
        }
    }
    
    // Execute enemy status effect
    async executeEnemyStatus() {
        // Check for Octopus drench attack (50% chance)
        const useDrench = this.enemy.drenchAttack && Math.random() < 0.5;
        
        // Check for Octopus hug attack (30% chance)
        const useHug = this.enemy.hugAttack && !useDrench && Math.random() < 0.3;
        
        // Check for sleep (Lazy Eye)
        const useSleep = this.enemy.canSleep && Math.random() < 0.3;
        
        if (useDrench) {
            await this.enemyDrenchAttack();
        } else if (useHug) {
            await this.enemyHugAttack();
        } else if (useSleep) {
            await this.enemySleepAttack();
        } else {
            // Fallback to normal attack
            await this.executeEnemyAttack();
        }
    }
    
    // Execute normal enemy attack
    async executeEnemyAttack() {
        await this.executeEnemyNormalAttack();
    }
    
    // End battle
    async endBattle(result) {
        let xpGained = 0;
        let xpLost = 0;
        
        if (result === 'victory') {
            addBattleLog(`🎉 VICTORY! You defeated the ${this.enemy.name}!`);
            
            // Play victory music from new battle music syst        // Stop battle music
        if (window.battleMusicSystem) {
            window.battleMusicSystem.stopBattleMusic();
        } else if (window.audioManager) {
            window.audioManager.stopBattleMusic();
        }
        
        // Hide battle arena to return to main app
        if (window.hideBattle) {
            window.hideBattle();
        }    }
            
            // Calculate XP reward using new system
            if (window.LEVEL_SYSTEM) {
                const actionsUsed = this.attackCount || 0;
                xpGained = window.LEVEL_SYSTEM.calculateBattleXP(this.enemy.level, actionsUsed);
            } else {
                xpGained = Math.floor(15 + (this.enemy.level * 5));
            }
            
            // Blueprint v2.0: Ensure minimum 50 XP reward
            xpGained = Math.max(50, xpGained);
            
            // Blueprint v2.0: Tiered Loot Drop System (70% Common, 25% Uncommon, 5% Rare)
            const lootRoll = Math.random();
            let lootTier = 'Common';
            let lootMultiplier = 1.0;
            
            if (lootRoll < 0.05) {
                // 5% Rare
                lootTier = 'Rare';
                lootMultiplier = 2.5;
                addBattleLog('✨✨ RARE LOOT DROP! ✨✨');
            } else if (lootRoll < 0.30) {
                // 25% Uncommon (5% + 25% = 30%)
                lootTier = 'Uncommon';
                lootMultiplier = 1.5;
                addBattleLog('💎 Uncommon Loot Drop!');
            } else {
                // 70% Common
                lootTier = 'Common';
                lootMultiplier = 1.0;
            }
            
            // Apply loot multiplier to XP
            xpGained = Math.floor(xpGained * lootMultiplier);
            
            // Award loot items based on tier
            let lootItems = [];
            if (window.inventoryManager) {
                if (lootTier === 'Rare') {
                    // Rare: 2-3 random items
                    const itemCount = Math.random() < 0.5 ? 2 : 3;
                    const possibleItems = ['potion', 'hyper_potion', 'fireball'];
                    for (let i = 0; i < itemCount; i++) {
                        const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                        window.inventoryManager.addItem(item, 1);
                        lootItems.push(item);
                    }
                } else if (lootTier === 'Uncommon') {
                    // Uncommon: 1-2 items
                    const itemCount = Math.random() < 0.6 ? 1 : 2;
                    const possibleItems = ['potion', 'fireball'];
                    for (let i = 0; i < itemCount; i++) {
                        const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                        window.inventoryManager.addItem(item, 1);
                        lootItems.push(item);
                    }
                } else {
                    // Common: 1 item (60% chance)
                    if (Math.random() < 0.6) {
                        window.inventoryManager.addItem('potion', 1);
                        lootItems.push('potion');
                    }
                }
                
                if (lootItems.length > 0) {
                    const itemNames = lootItems.map(id => {
                        if (id === 'potion') return 'Potion';
                        if (id === 'hyper_potion') return 'Hyper Potion';
                        if (id === 'fireball') return 'Fireball';
                        return id;
                    });
                    addBattleLog(`📦 Loot: ${itemNames.join(', ')}`);
                }
                
                // Save inventory after adding items
                if (typeof saveGameState === 'function') {
                    saveGameState();
                }
            }
            
            // Award XP using new system
            if (window.updatePlayerXP) {
                window.updatePlayerXP(xpGained);
            } else if (window.gameState && typeof window.addJerryXP === 'function') {
                window.addJerryXP(xpGained);
            }
            
            // Track battle win
            if (window.gameState) {
                window.gameState.battlesWon = (window.gameState.battlesWon || 0) + 1;
                
                // Track battle streak
                window.gameState.battleStreak = (window.gameState.battleStreak || 0) + 1;
                
                // Check achievements
                if (window.achievementTracker) {
                    window.achievementTracker.checkAchievements();
                }
                
                if (typeof saveGameState === 'function') {
                    saveGameState();
                }
            }
            
            // Play enemy die animation
            await playEnemyAnimation(this.enemy, 'die', 1000);
            
            // Play dust animation and hide enemy
            await this.playDustAnimation();
            
            // Play loot drop animation (P1: QA Report)
            await new Promise(resolve => setTimeout(resolve, 300));
            if (window.playLootDropAnimation) {
                await window.playLootDropAnimation(lootTier, xpGained);
            }
            
            // Show friendly victory message
            await new Promise(resolve => setTimeout(resolve, 200));
            const itemsMessage = lootItems.length > 0 ? `\n\n📦 Loot: ${lootItems.map(id => {
                if (id === 'potion') return 'Potion';
                if (id === 'hyper_potion') return 'Hyper Potion';
                if (id === 'fireball') return 'Fireball';
                return id;
            }).join(', ')}` : '\n\n🚫 No loot this time';
            alert(`🎉 Victory!\n\nYou defeated the ${this.enemy.name}!${itemsMessage}\n\n✨ +${xpGained} XP earned!\n\nGreat job, keep it up! 💪`);
            
        } else if (result === 'defeat') {
            addBattleLog('💫 DEFEAT! You were defeated...');
            
            // Play defeat music from new battle music system
            if (window.battleMusicSystem) {
                window.battleMusicSystem.playDefeat();
            }
            
            // Calculate XP loss (smaller penalty)
            xpLost = Math.floor(5 + (this.enemy.level * 2));
            
            // Deduct XP (but don't go below 0)
            if (window.gameState) {
                window.gameState.jerryXP = Math.max(0, (window.gameState.jerryXP || 0) - xpLost);
            }
            
            // Track battle loss
            if (window.gameState) {
                window.gameState.battlesLost = (window.gameState.battlesLost || 0) + 1;
                
                // Reset battle streak on loss
                window.gameState.battleStreak = 0;
                
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

        // Handle stat preservation based on battle result
        if (result === 'victory' || result === 'fled') {
            // Victory or fled: preserve current HP/attack/defense, refill gauges
            if (window.gameState) {
                window.gameState.health = this.hero.hp;
                window.gameState.attack = this.hero.attack;
                window.gameState.defense = this.hero.defense;
            }
            this.hero.attackGauge = 100;
            this.hero.defenseGauge = 100;
            updateBattleUI(this.hero, this.enemy);
            saveGameState();
        } else if (result === 'defeat') {
            // Defeat: restore HP/attack/defense to full
            if (window.gameState) {
                window.gameState.health = 100;
                const level = window.gameState.jerryLevel || 1;
                // Restore attack based on level
                let baseDamage;
                if (level >= 15) {
                    baseDamage = 13;
                } else if (level >= 10) {
                    baseDamage = 10;
                } else {
                    baseDamage = 6;
                }
                window.gameState.attack = baseDamage;
                window.gameState.defense = 5 + level;
            }
            this.hero.attackGauge = 100;
            this.hero.defenseGauge = 100;
            saveGameState();
        }



        // Ensure all music is stopped
        if (window.audioManager) {
            window.audioManager.stopMusic();
        }

        // Return to main app immediately after alert
        document.getElementById('battleLog').innerHTML = '';
        const arena = document.getElementById('battleArena');
        arena.classList.add('hidden');
        
        // Refresh main app UI
        if (typeof updateTasksDisplay === 'function') {
            updateTasksDisplay();
        }
        if (typeof updateJerryDisplay === 'function') {
            updateJerryDisplay();
        }
    }
    
    // Play dust animation when enemy is defeated
    async playDustAnimation() {
        const enemySprite = document.getElementById('enemySprite');
        if (!enemySprite) return;
        
        // Get enemy position
        const enemyRect = enemySprite.getBoundingClientRect();
        const container = enemySprite.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Hide enemy sprite
        enemySprite.style.opacity = '0';
        
        // Create dust sprite element
        const dustSprite = document.createElement('div');
        dustSprite.style.position = 'absolute';
        dustSprite.style.left = enemySprite.style.left || '0px';
        dustSprite.style.bottom = '0px';
        dustSprite.style.width = '32px';
        dustSprite.style.height = '32px';
        dustSprite.style.backgroundImage = 'url(assets/dust-spritesheet.png)';
        dustSprite.style.backgroundSize = '192px 32px'; // 6 frames * 32px width
        dustSprite.style.backgroundRepeat = 'no-repeat';
        dustSprite.style.imageRendering = 'pixelated';
        container.appendChild(dustSprite);
        
        // Animate through 6 frames (192px / 32px = 6 frames)
        let frame = 0;
        const frameCount = 6;
        const frameDuration = 100; // 100ms per frame
        
        const animateFrame = () => {
            if (frame < frameCount) {
                dustSprite.style.backgroundPosition = `-${frame * 32}px 0px`;
                frame++;
                setTimeout(animateFrame, frameDuration);
            } else {
                // Remove dust sprite after animation completes
                dustSprite.remove();
            }
        };
        
        animateFrame();
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, frameCount * frameDuration));
    }
    
    // ===== ENEMY SPECIAL ATTACK METHODS =====
    
    // Medusa petrify attack
    async enemyPetrifyAttack() {
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
    }
    
    // Poison attack (Treant boss)
    async enemyPoisonAttack() {
        await playEnemyAnimation(this.enemy, 'attack1', 600);
                const damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
        this.hero.hp = Math.max(0, this.hero.hp - damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('heroSprite'));
        }
        
        // Fill special gauge when taking damage (+10%)
        if (window.specialGauge && damage > 0) {
            window.specialGauge.fillOnDamage();
        }
        
        // Apply poison effect: 3 damage per turn for 4 turnsonTurns = this.enemy.poisonDuration || 2;
        this.poisonDamage = 5; // HP drain per turn
        this.poisonGaugeDrain = 10; // Gauge drain per turn
        
        addBattleLog(`🌳 ${this.enemy.name} dealt ${damage} damage and poisoned you!`);
        addBattleLog(`☠️ Poison will drain HP and gauges for ${this.poisonTurns} turns!`);
        
        startHeroAnimation('hurt');
        await new Promise(resolve => setTimeout(resolve, 2000));
        startHeroAnimation('idle');
        
        updateBattleUI(this.hero, this.enemy);
        
        if (this.hero.hp <= 0) {
            this.state = BattleState.DEFEAT;
            await this.endBattle('defeat');
        } else {
            this.state = BattleState.PLAYER_TURN;
            console.log('✅ State set to PLAYER_TURN after enemy attack');
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
        }
    }
    
    // Sunny Dragon attack gauge drain
    async enemyDrainGaugeAttack() {
        await playEnemyAnimation(this.enemy, 'attack1', 600);
        
        // Show dragon bolt projectile
        const enemySprite = document.getElementById('enemySprite');
        const heroSprite = document.getElementById('heroSprite');
        await playDragonBoltProjectile(enemySprite, heroSprite);
        
        // Variable damage 18-40
        const damage = Math.floor(Math.random() * 23) + 18;
        this.hero.hp = Math.max(0, this.hero.hp - damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('heroSprite'));
        }
        
        // Fill special gauge when taking damage (+10%)
        if (window.specialGauge && damage > 0) {
            window.specialGauge.fillOnDamage();
        }
        
        // Drain attack gauge to 5%
        this.attackGauge = 5;
        
        addBattleLog(`🐉 ${this.enemy.name} dealt ${damage} damage!`);
        addBattleLog(`⚡ Your attack gauge was drained to 5%!`);
        
        startHeroAnimation('hurt');
        await new Promise(resolve => setTimeout(resolve, 2000));
        startHeroAnimation('idle');
        
        updateBattleUI(this.hero, this.enemy);
        
        if (this.hero.hp <= 0) {
            this.state = BattleState.DEFEAT;
            await this.endBattle('defeat');
        } else {
            this.state = BattleState.PLAYER_TURN;
            console.log('✅ State set to PLAYER_TURN after enemy attack');
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
        }
    }
    
    // Mushroom confusion attack
    async enemyMushroomAttack() {
        await playEnemyAnimation(this.enemy, 'attack2', 600);
        
        // Show mushroom emoji projectiles
        const enemySprite = document.getElementById('enemySprite');
        const heroSprite = document.getElementById('heroSprite');
        await playMushroomProjectile(enemySprite, heroSprite);
        
        const damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
        this.hero.hp = Math.max(0, this.hero.hp - damage);
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('heroSprite'));
        }
        
        // Fill special gauge when taking damage (+10%)
        if (window.specialGauge && damage > 0) {
            window.specialGauge.fillOnDamage();
        }
        
        // Apply mushroom effect: 30% miss chance, 20% skip turn, 10 gauge drain per turn for 3 turnshroomEffectDuration || 2;
        this.mushroomMissChance = this.enemy.mushroomMissChance || 0.3;
        this.mushroomSkipChance = this.enemy.mushroomSkipChance || 0.2;
        this.mushroomGaugeDrain = 8; // Gauge drain per turn
        
        addBattleLog(`🍄 ${this.enemy.name} threw mushrooms dealing ${damage} damage!`);
        addBattleLog(`😵 Mushroom effect: attacks may miss or skip turns for ${this.mushroomTurns} turns!`);
        
        startHeroAnimation('hurt');
        await new Promise(resolve => setTimeout(resolve, 2000));
        startHeroAnimation('idle');
        
        updateBattleUI(this.hero, this.enemy);
        
        if (this.hero.hp <= 0) {
            this.state = BattleState.DEFEAT;
            await this.endBattle('defeat');
        } else {
            this.state = BattleState.PLAYER_TURN;
            console.log('✅ State set to PLAYER_TURN after enemy attack');
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
        }
    }
    
    // Octopus drench attack
    async enemyDrenchAttack() {
        await playEnemyAnimation(this.enemy, 'attack1', 600);
        
        // Show splash projectile
        const enemySprite = document.getElementById('enemySprite');
        const heroSprite = document.getElementById('heroSprite');
        await playSplashAnimation(enemySprite, heroSprite);
        
        // Apply drench effect: 10 damage + block fireball for 1 turn
        this.hero.hp = Math.max(0, this.hero.hp - 10);
        
        // Fill special gauge when taking damage (+10%)
        if (window.specialGauge) {
            window.specialGauge.fillOnDamage();
        }
        
        this.fireballBlocked = true;
        addBattleLog(`💦 ${this.enemy.name}'s Drench attack dealt 10 damage and blocked fireball!`);
        
        // Play hero hurt animation
        startHeroAnimation('hurt');
        await new Promise(resolve => setTimeout(resolve, 2000));
        startHeroAnimation('idle');
        
        updateBattleUI(this.hero, this.enemy);
        
        if (this.hero.hp <= 0) {
            this.state = BattleState.DEFEAT;
            await this.endBattle('defeat');
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.state = BattleState.PLAYER_TURN;
            addBattleLog('⚔️ Your turn!');
        }
    }
    
    // Octopus hug attack
    async enemyHugAttack() {
        await playEnemyAnimation(this.enemy, 'attack1', 600);
        
        // Apply hug effect: block defend for 2 turns
        this.defendBlocked = 2;
        addBattleLog(`🐙 ${this.enemy.name}'s Hug blocked defend for 2 turns!`);
        
        updateBattleUI(this.hero, this.enemy);
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.state = BattleState.PLAYER_TURN;
        addBattleLog('⚔️ Your turn!');
    }
    
    // Lazy Eye sleep attack
    async enemySleepAttack() {
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
    }
    
    // Normal enemy attack
    async executeEnemyNormalAttack() {
        // Play enemy attack animation using new system
        if (window.startEnemyAnimation) {
            window.startEnemyAnimation(this.enemy.name, 'attack');
            await new Promise(resolve => setTimeout(resolve, 600));
            window.startEnemyAnimation(this.enemy.name, 'idle');
        } else {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
        }
        
        // Play enemy-specific attack sound
        if (window.audioManager) {
            const enemyName = this.enemy.name.toLowerCase().replace(/\s+/g, '_');
            const soundMap = {
                'bunny': 'bunny_attack',
                'ogre': 'ogre_attack',
                'alien_walking': 'alien_walking_attack',
                'alien_flying': 'alien_flying_attack',
                'drone': 'drone_attack',
                'robot': 'robot_attack',
                'lazy_bat': 'lazy_bat_attack',
                'slime': 'enemy_attack_default',
                'medusa': 'enemy_attack_default',
                'octopus': 'enemy_attack_default',
                'fire_skull': 'enemy_attack_default',
                'treant': 'enemy_attack_default'
            };
            const soundKey = soundMap[enemyName] || 'enemy_attack_default';
            window.audioManager.playSound(soundKey, 0.7);
        }
        
        // Show projectiles based on enemy type
        if (this.enemy.projectileType === 'waveform') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playWaveformAnimation(enemySprite, heroSprite);
        }
        
        if (this.enemy.projectileType === 'alien') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playAlienProjectile(enemySprite, heroSprite);
        }
        
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
            addBattleLog('⚔️ Your turn!');
            return;
        }
        
        // Check if Mirror Attack is active
        if (this.hasReflect) {
            const damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            this.hero.hp = Math.max(0, this.hero.hp - damage);
            
            // Show floating damage text
            if (window.showFloatingText) {
                window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('heroSprite'));
            }
            
            // Fill special gauge when taking damage (+10%)
            if (window.specialGauge && damage > 0) {
                window.specialGauge.fillOnDamage();
            }
            
            addBattleLog(`${this.enemy.name} dealt ${damage} damage!`);
            
            // Play hero hurt animation
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 500));
            startHeroAnimation('idle');
            
            updateBattleUI(this.hero, this.enemy);
            
            // Calculate and apply reflected damage
            const reflectedDamage = Math.floor(damage * this.reflectPercent);
            this.hasReflect = false;
            
            const isDead = this.enemy.takeDamage(reflectedDamage);
            addBattleLog(`🔄 ${this.enemy.name} took ${reflectedDamage} reflected damage!`);
            
            // Play enemy hurt animation
            await playEnemyAnimation(this.enemy, 'hurt', 300);
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            addBattleLog('⚔️ Your turn!');
            return;
        }
        
        // Check if hero is invisible
        if (this.invisibilityTurns && this.invisibilityTurns > 0) {
            this.invisibilityTurns--;
            addBattleLog(`🤟🏻 You are invisible! ${this.enemy.name}'s attack missed! (${this.invisibilityTurns} turns left)`);
            
            // Make hero reappear if invisibility ends
            if (this.invisibilityTurns === 0) {
                addBattleLog(`🤟🏻 You reappeared!`);
                if (window.applyInvisibilityEffect) {
                    window.applyInvisibilityEffect(false);
                }
            }
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            return;
        }
        
        // Increment enemy attack counter
        this.enemyAttackCount++;
        
        // Play enemy attack sound for all enemies
        if (window.audioManager) {
            // Check if this is a low-level enemy (Lazy Bat or Slime)
            const isLowLevelEnemy = this.enemy.name === 'Lazy Bat' || this.enemy.name === 'Slime';
            
            // Play every 5th attack sound
            if (this.enemyAttackCount % 5 === 0) {
                window.audioManager.playSound('enemy_fifth_attack', 0.8);
            } else if (isLowLevelEnemy) {
                // Play low-level enemy attack sound for Lazy Bat and Slime
                window.audioManager.playSound('enemy_low_level_attack', 0.8);
            } else {
                // Play regular enemy attack sound for all other enemies
                window.audioManager.playSound('enemy_regular_attack', 0.8);
            }
        }
        
        // Calculate damage
        let damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
        
        // Apply enemy defense reduction if defending
        if (this.enemy.isDefending) {
            damage = Math.floor(damage * (1 - this.enemy.defenseReduction));
            this.enemy.isDefending = false;
            addBattleLog(`🛡️ ${this.enemy.name}'s defense reduced damage!`);
        }
        
        // Check if player is defending - use defense gauge instead of HP
        if (this.defendActive) {
            this.defendActive = false; // Reset defend flag
            
            // Defense gauge absorbs the damage
            if (this.defenseGauge >= damage) {
                // Defense gauge fully absorbs the damage
                this.defenseGauge -= damage;
                addBattleLog(`🛡️ Your defense absorbed ${damage} damage! (Defense gauge: ${this.defenseGauge}/100)`);
                damage = 0; // No HP damage
            } else {
                // Defense gauge partially absorbs, rest goes to HP
                const absorbed = this.defenseGauge;
                const remaining = damage - absorbed;
                this.defenseGauge = 0;
                this.hero.hp = Math.max(0, this.hero.hp - remaining);
                addBattleLog(`🛡️ Your defense absorbed ${absorbed} damage, ${remaining} damage to HP!`);
                damage = remaining;
            }
        } else {
            // Normal damage to HP
            this.hero.hp = Math.max(0, this.hero.hp - damage);
        }
        
        // Only log damage if it actually hit HP
        if (damage > 0) {
            addBattleLog(`${this.enemy.name} dealt ${damage} damage!`);
        }
        
        // Show floating damage text
        if (window.showFloatingText) {
            window.showFloatingText(`-${damage} HP`, 'hp-damage', document.getElementById('heroSprite'));
        }
        
        // Fill special gauge when taking damage (+10%)
        if (window.specialGauge && damage > 0) {
            window.specialGauge.fillOnDamage();
        }
        
        // Play hero hurt animation
        startHeroAnimation('hurt');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for Octopus defense drain
        if (this.enemy.drainDefense) {
            const defenseDrain = 10;
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
            console.log('✅ State set to PLAYER_TURN after enemy attack');
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
        }
    }
}

// Global battle manager instance
let battleManager = null;

// Initialize battle manager when DOM is ready (SIMPLIFIED VERSION - matches v2.11)
console.log('🔵 battleManager.js: Initializing...');
console.log('🔵 document.readyState:', document.readyState);

if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOM to load...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎮 DOM loaded, creating BattleManager...');
        battleManager = new BattleManager();
        window.battleManager = battleManager;
        console.log('✅ Battle Manager initialized successfully!');
        console.log('✅ window.battleManager:', window.battleManager);
    });
} else {
    console.log('✅ DOM already loaded, creating BattleManager immediately...');
    battleManager = new BattleManager();
    window.battleManager = battleManager;
    console.log('✅ Battle Manager initialized successfully!');
    console.log('✅ window.battleManager:', window.battleManager);
}


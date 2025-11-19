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
        this.initialized = false;  // Track initialization state
        this.state = BattleState.INITIALIZING;
        this.hero = null;
        this.enemy = null;
        this.attackGauge = 0;
        this.defenseGauge = 0;
        this.battleLog = [];
        this.hasEvade = false;
        this.hasReflect = false;
        this.enemyAttackCount = 0;  // Track enemy attack count for every 5th attack sound
        this.reflectTurns = 0;  // Luna's reflect effect turns remaining
        this.reflectActive = false;  // Luna's reflect effect active flag
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
        this.enemyAttackCount = 0;  // Reset enemy attack count for every 5th attack sound
        
        // Verify gameState inventory is loaded
        if (!window.gameState.battleInventory) {
            console.warn('Battle inventory not found, initializing...');
            window.gameState.battleInventory = {
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
        
        if (!window.gameState.unlockedBattleItems) {
            console.warn('Unlocked battle items not found, initializing...');
            window.gameState.unlockedBattleItems = ['health_potion', 'attack_refill', 'defense_refill'];
        }
        
        // Initialize special attack gauge if not exists
        if (window.initSpecialAttackGauge) {
            window.initSpecialAttackGauge();
        }
        
        // Boss status effects
        this.poisonTurns = 0;
        this.poisonDamage = 0;
        this.poisonGaugeDrain = 0;
        this.mushroomTurns = 0;
        this.mushroomMissChance = 0;
        this.mushroomSkipChance = 0;
        this.mushroomGaugeDrain = 0;

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
        battleContainer.classList.add(arenaClass);
        window.battleArenaIndex++;
        
        // Play alternating battle music
        if (window.audioManager) {
            window.audioManager.playBattleMusic();
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
        
        // Process poison effect
        if (this.poisonTurns > 0) {
            this.hero.hp = Math.max(0, this.hero.hp - this.poisonDamage);
            this.attackGauge = Math.max(0, this.attackGauge - this.poisonGaugeDrain);
            this.defenseGauge = Math.max(0, this.defenseGauge - this.poisonGaugeDrain);
            addBattleLog(`☠️ Poison drained ${this.poisonDamage} HP and ${this.poisonGaugeDrain} from each gauge!`);
            this.poisonTurns--;
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

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 10;
        this.attackCount++;
        updateBattleUI(this.hero, this.enemy);

        // Play hero attack animation (regular attack only)
        startHeroAnimation('attack1');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

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
        
        const isDead = this.enemy.takeDamage(damage);
        
        // Increase special attack gauge by 15 per attack
        if (window.increaseSpecialGauge) {
            window.increaseSpecialGauge(15);
            // Update action buttons to enable special attack button if gauge is full
            updateActionButtons(this.hero);
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

        // Calculate damage (18-20 range, melee strike)
        const damage = Math.floor(Math.random() * 3) + 18; // Random between 18-20
        const isDead = this.enemy.takeDamage(damage);
        
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
        
          // Increase special attack gauge by 10 per defend
        if (window.increaseSpecialGauge) {
            window.increaseSpecialGauge(10);
            // Update action buttons to enable special attack button if gauge is full
            updateActionButtons(this.hero);
        }
        
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

        // Play asteroid animation
        await playAsteroidAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (fixed 12 damage)
        const damage = 12;
        const isDead = this.enemy.takeDamage(damage);
        
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

        // Calculate damage (10-15 range with nuclear explosion)
        const damage = Math.floor(Math.random() * 6) + 10; // Random between 10-15
        const isDead = this.enemy.takeDamage(damage);
        
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

        // Calculate damage (10 damage, skips 2 turns)
        const damage = 10;
        const isDead = this.enemy.takeDamage(damage);
        
        // Play critical hit sound for damage >= 10
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

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
        gameState.battleInventory.health_potion = Math.max(0, gameState.battleInventory.health_potion - 1);
        
        // Play potion use sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.7);
        }
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        const healAmount = 20;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        
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
            addBattleLog('❌ No attack refills left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.attack_refill = Math.max(0, gameState.battleInventory.attack_refill - 1);
        
        // Play potion/power boost sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.8);
        }
        
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
        gameState.battleInventory.defense_refill = Math.max(0, gameState.battleInventory.defense_refill - 1);
        
        // Play defense boost sound
        if (window.audioManager) {
            window.audioManager.playSound('defense_boost', 0.7);
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
        gameState.battleInventory.invisibility_cloak = Math.max(0, gameState.battleInventory.invisibility_cloak - 1);
        this.hasEvade = true;
        
        // Play invisibility cloak sound
        if (window.audioManager) {
            window.audioManager.playSound('cloak_use', 0.8);
        }
        
        addBattleLog('🤟🏻 Invisibility Cloak activated! You will evade the next attack.');
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
        this.hasReflect = true;
        
        // Play mirror sound (using cloak sound as placeholder)
        if (window.audioManager) {
            window.audioManager.playSound('cloak_use', 0.8);
        }
        
        addBattleLog('🪞 Mirror Attack activated! Enemy\'s next attack will be reflected!');
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
        gameState.battleInventory.blue_flame = Math.max(0, gameState.battleInventory.blue_flame - 1);
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
        gameState.battleInventory.procrastination_ghost = Math.max(0, gameState.battleInventory.procrastination_ghost - 1);
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

        // Calculate variable damage (18-22 range, skips 1 turn)
        const damage = Math.floor(Math.random() * 5) + 18; // Random between 18-22
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
        
        // === ADAPTIVE HEALING AI ===
        if (window.enemyAI && this.enemy.hp < this.enemy.maxHP) {
            const playerLevel = gameState.level || 1;
            const healResult = window.enemyAI.attemptEnemyHeal(this.enemy, playerLevel);
            
            if (healResult.healed) {
                addBattleLog(`💚 ${this.enemy.name} regenerates ${healResult.amount} HP!`);
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                return;
            }
        }
        
        // === SMART DEFENSE AI ===
        if (window.enemyAI) {
            const willDefend = window.enemyAI.attemptEnemyDefense(this.enemy);
            
            if (willDefend) {
                addBattleLog(`🛡️ ${this.enemy.name} braces for impact!`);
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                return;
            }
        }

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
        
        // Boss special attacks
        if (this.enemy.isBoss) {
            // Treant poison attack
            if (this.enemy.poisonAttack) {
                await playEnemyAnimation(this.enemy, 'attack1', 600);
                
                const damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
                this.hero.hp = Math.max(0, this.hero.hp - damage);
                
                // Apply poison effect for 2 turns
                this.poisonTurns = this.enemy.poisonDuration;
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
                    await new Promise(resolve => setTimeout(resolve, 500));
                    addBattleLog('⚔️ Your turn!');
                }
                return;
            }
            
            // Sunny Dragon attack gauge drain
            if (this.enemy.drainAttackGauge) {
                await playEnemyAnimation(this.enemy, 'attack1', 600);
                
                // Show dragon bolt projectile
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playDragonBoltProjectile(enemySprite, heroSprite);
                
                // Variable damage 18-40
                const damage = Math.floor(Math.random() * 23) + 18;
                this.hero.hp = Math.max(0, this.hero.hp - damage);
                
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
                    await new Promise(resolve => setTimeout(resolve, 500));
                    addBattleLog('⚔️ Your turn!');
                }
                return;
            }
            
            // Mushroom special attack
            if (this.enemy.mushroomAttack) {
                await playEnemyAnimation(this.enemy, 'attack2', 600);
                
                // Show mushroom emoji projectiles
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playMushroomProjectile(enemySprite, heroSprite);
                
                const damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
                this.hero.hp = Math.max(0, this.hero.hp - damage);
                
                // Apply mushroom effect for 2 turns
                this.mushroomTurns = this.enemy.mushroomEffectDuration;
                this.mushroomMissChance = this.enemy.mushroomMissChance;
                this.mushroomSkipChance = this.enemy.mushroomSkipChance;
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
                    await new Promise(resolve => setTimeout(resolve, 500));
                    addBattleLog('⚔️ Your turn!');
                }
                return;
            }
        }
        
        // Normal attack
        await playEnemyAnimation(this.enemy, 'attack1', 600);
        
        // Lazy Bat no longer shoots projectiles (removed per user request)
        
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
        
        // Check if Mirror Attack is active
        if (this.hasReflect) {
            addBattleLog('🪞 Mirror Attack reflected the attack back!');
            this.hasReflect = false;
            
            // Calculate damage that would have been dealt to hero
            const reflectedDamage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            
            // Apply damage to enemy instead
            const isDead = this.enemy.takeDamage(reflectedDamage);
            addBattleLog(`🔄 ${this.enemy.name} took ${reflectedDamage} reflected damage!`);
            
            // Play enemy hurt animation
            await playEnemyAnimation(this.enemy, 'hurt', 300);
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
            }
            return;
        }
        
        // Check if Luna's Chaos Curse (Reflect) is active
        if (this.reflectActive && this.reflectTurns > 0) {
            addBattleLog(`🌙 Chaos Curse active! Enemy damages itself! (${this.reflectTurns} turns left)`);
            
            // Calculate damage that would have been dealt to hero
            const reflectedDamage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            
            // Apply damage to enemy instead
            const isDead = this.enemy.takeDamage(reflectedDamage);
            addBattleLog(`🔮 ${this.enemy.name} took ${reflectedDamage} damage from its own attack!`);
            
            // Play enemy hurt animation
            await playEnemyAnimation(this.enemy, 'hurt', 300);
            
            // Decrement reflect turns
            this.reflectTurns--;
            if (this.reflectTurns <= 0) {
                this.reflectActive = false;
                addBattleLog('✨ Chaos Curse effect ended!');
            }
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
            }
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
                window.audioManager.playSound('enemy_attack_low_level', 0.7);
            } else {
                // Play regular monster attack sound for other enemies
                window.audioManager.playSound('enemy_regular_attack', 0.8);
            }
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
            
            // Play victory sound
            if (window.audioManager) {
                window.audioManager.playSound('battle_victory', 0.8);
            }
            
            // Calculate XP reward based on enemy level
            xpGained = Math.floor(15 + (this.enemy.level * 5));
            
            // Award XP
            if (window.gameState && typeof window.addJerryXP === 'function') {
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
            
            // Generate and add loot drops
            await new Promise(resolve => setTimeout(resolve, 500));
            let lootDrops = [];
            if (window.lootSystem) {
                lootDrops = window.lootSystem.generateLoot(this.enemy);
                console.log('🎁 Loot drops:', lootDrops);
                
                // Add loot to inventory (BACKEND FUNCTION)
                window.lootSystem.addLootToInventory(lootDrops);
                
                // Update battle UI to reflect new inventory counts
                updateActionButtons(this.hero);
                
                // Show loot modal
                window.lootSystem.showLootModal(lootDrops, xpGained, this.enemy.name);
            } else {
                // Fallback to alert if loot system not loaded
                alert(`🎉 Victory!\n\nYou defeated the ${this.enemy.name}!\n\n✨ +${xpGained} XP earned!\n\nGreat job, keep it up! 💪`);
            }
            
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

        // Fade out after 2 seconds
        setTimeout(() => {
            document.getElementById('battleLog').innerHTML = '';
            const arena = document.getElementById('battleArena');
            arena.classList.add('hidden');
        }, 2000);
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
}

// Global battle manager instance
let battleManager = null;

// Initialize battle manager immediately
function initBattleManager() {
    if (window.battleManager && window.battleManager.initialized) {
        console.log('⚠️ Battle Manager already initialized');
        return;
    }
    
    console.log('🔧 Initializing Battle Manager...');
    battleManager = new BattleManager();
    window.battleManager = battleManager;
    
    // Set initialized flag explicitly
    window.battleManager.initialized = true;
    
    console.log('✅ Battle Manager initialized and ready', {
        initialized: window.battleManager.initialized,
        exists: !!window.battleManager,
        readyState: document.readyState
    });
}

// Try multiple initialization strategies
console.log('📜 battleManager.js loaded, readyState:', document.readyState);

// Strategy 1: Initialize immediately
initBattleManager();

// Strategy 2: Also listen for DOMContentLoaded in case we're early
if (document.readyState === 'loading') {
    console.log('📋 Also listening for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initBattleManager);
}

// Strategy 3: Also listen for window load as a fallback
window.addEventListener('load', function() {
    if (!window.battleManager || !window.battleManager.initialized) {
        console.log('🔄 Retry initialization on window load...');
        initBattleManager();
    }
});


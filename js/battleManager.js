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
        this.inBattle = false;  // Track if battle is currently active (for quest giver prevention)
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
        this.enemyFrozenTurns = 0;  // Freeze effect turns remaining
        this.focusAttackUsed = false;  // Track if focus timer special attack has been used this battle
        
        // CRITICAL: Track special attack usage to ensure 3+ uses per battle
        this.specialAttackUsageCount = {};
        this.enemyTurnCount = 0;
        this.minimumSpecialAttackUses = 3;
        
        // Turn timer system
        this.turnTimerDuration = 3000; // Default 3 seconds
        this.turnTimerInterval = null;
        this.turnTimerStartTime = null;
        this.turnTimerReduced = false; // Flag for Time Sting effect
    }

    // Initialize battle with hero and enemy
    async startBattle(heroData, enemyData) {
        // CRITICAL: Prevent battle from starting if quest giver is active
        if (window.questGiver && window.questGiver.activeQuest) {
            console.log('[Battle] Quest giver is active, battle will not start');
            return;
        }
        
        const questGiverUI = document.getElementById('questGiverUI');
        if (questGiverUI && !questGiverUI.classList.contains('hidden')) {
            console.log('[Battle] Quest giver UI is visible, battle will not start');
            return;
        }
        
        // Set battle active flag
        this.inBattle = true;
        console.log('[Battle] Battle started, inBattle flag set to true');
        
        // Check if battle tutorial should be shown (first battle only)
        if (window.battleTutorial && BattleTutorial.shouldShowTutorial()) {
            console.log('⚔️ First battle detected, showing tutorial');
            window.battleTutorial.show();
            // Wait for tutorial to complete before starting battle
            await new Promise(resolve => {
                const checkTutorial = setInterval(() => {
                    if (localStorage.getItem('battleTutorialCompleted') === 'true') {
                        clearInterval(checkTutorial);
                        resolve();
                    }
                }, 500);
            });
        }
        
        // Check if this is a Gloom encounter and show special modal
        if (enemyData.isGloomEncounter && window.showGloomEncounterModal) {
            console.log('🌑 Gloom encounter detected! Showing special modal...');
            window.showGloomEncounterModal();
            // Wait for modal to be dismissed
            await new Promise(resolve => {
                const checkModal = setInterval(() => {
                    if (!document.getElementById('gloomEncounterModal')) {
                        clearInterval(checkModal);
                        resolve();
                    }
                }, 100);
            });
        }
        
        this.state = BattleState.INITIALIZING;
        this.hero = heroData;
        this.enemy = enemyData;
        this.attackGauge = 100;  // Start with full attack gauge
        this.defenseGauge = 100; // Start with full defense gauge
        this.battleLog = [];
        this.attackCount = 0;    // Track attack count for walk+attack animation
        this.enemyAttackCount = 0;  // Reset enemy attack count for every 5th attack sound
        
        // CRITICAL: Initialize special attack tracking for this battle
        this.specialAttackUsageCount = {};
        this.enemyTurnCount = 0;
        
        // Initialize tracking for all enemy special abilities
        if (enemyData.poisonAttack) this.specialAttackUsageCount['poison'] = 0;
        if (enemyData.mushroomAttack) this.specialAttackUsageCount['mushroom'] = 0;
        if (enemyData.canPetrify) this.specialAttackUsageCount['petrify'] = 0;
        if (enemyData.canSleep) this.specialAttackUsageCount['sleep'] = 0;
        if (enemyData.drenchAttack) this.specialAttackUsageCount['drench'] = 0;
        if (enemyData.hugAttack) this.specialAttackUsageCount['hug'] = 0;
        if (enemyData.timeStingAttack) this.specialAttackUsageCount['timeSting'] = 0;
        if (enemyData.gaugeStealAttack) this.specialAttackUsageCount['gaugeSteal'] = 0;
        if (enemyData.overthinkerAttack) this.specialAttackUsageCount['overthink'] = 0;
        
        // Overthink effect state (Overthinker enemy special attack)
        this.overthinkActive = false;
        this.overthinkTurns = 0;
        this.overthinkBackfireDamage = 0;
        
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
                procrastination_ghost: 0,
                lightning: 0,
                honey_trap: 0,
                throwing_stars: 0,
                star_shield: 0,
                mirror_attack: 0
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
        
        // Hide special attack gauge and button if below Level 10
        const userLevel = parseInt(localStorage.getItem('level')) || 1;
        const specialGaugeContainer = document.getElementById('specialAttackGaugeContainer');
        const specialAttackBtn = document.getElementById('btnSpecialAttack');
        
        if (userLevel < 10) {
            if (specialGaugeContainer) specialGaugeContainer.style.display = 'none';
            if (specialAttackBtn) specialAttackBtn.style.display = 'none';
        } else {
            if (specialGaugeContainer) specialGaugeContainer.style.display = 'block';
            if (specialAttackBtn) specialAttackBtn.style.display = 'block';
        }
        
        // Boss status effects
        this.poisonTurns = 0;
        this.poisonDamage = 0;
        this.poisonGaugeDrain = 0;
        this.mushroomTurns = 0;
        this.mushroomMissChance = 0;
        this.mushroomSkipChance = 0;
        this.mushroomGaugeDrain = 0;

        // CRITICAL: Use proper BattleArenasManager for level-based arena rotation
        if (!window.battleArenasManager) {
            window.battleArenasManager = new BattleArenasManager();
        }
        
        // Select arena based on player level using the arena manager
        const playerLevel = this.hero.level || 1;
        const selectedArenaId = window.battleArenasManager.selectArena(playerLevel);
        const arenaConfig = window.battleArenasManager.getArena(selectedArenaId);
        
        console.log(`[Battle] Selected arena: ${arenaConfig.name} (Level ${playerLevel})`);
        
        // Apply arena background to battle scene
        const battleScene = document.getElementById('battleScene');
        if (battleScene && arenaConfig) {
            battleScene.style.backgroundImage = `url('${arenaConfig.background}')`;
            battleScene.style.backgroundSize = 'cover';
            battleScene.style.backgroundPosition = 'center bottom';
            battleScene.style.backgroundRepeat = 'no-repeat';
            console.log(`[Battle] Arena background set: ${arenaConfig.background}`);
        }
        
        // Play alternating battle music
        if (window.audioManager) {
            window.audioManager.playBattleMusic();
        }

        // Show battle arena
        showBattle(this.hero, this.enemy);

        // Render hero sprite
        if (typeof renderHeroSprite === 'function') {
            renderHeroSprite();
        }
        
        // Preload all skin animations to prevent flicker
        if (window.preloadSkinAnimations && window.getActiveHeroAppearance) {
            const appearance = window.getActiveHeroAppearance();
            if (appearance && appearance.isSkin) {
                console.log('[Battle] Preloading skin animations to prevent flicker');
                window.preloadSkinAnimations(appearance);
            }
        }

        // Initialize enemy sprite with correct size class
        if (typeof initEnemySprite === 'function') {
            initEnemySprite(this.enemy);
        }

        // Play wake up sequence
        addBattleLog(`💤 A ${this.enemy.name} appears!`);
        console.log('[Battle] About to call playWakeUpSequence');
        
        try {
            await playWakeUpSequence(this.enemy);
            console.log('[Battle] playWakeUpSequence completed');
        } catch (error) {
            console.error('[Battle] playWakeUpSequence error:', error);
        }
        
        addBattleLog('⚔️ Battle Start!');
        console.log('[Battle] Starting enemy turn');

        // Enemy attacks first (stable behavior)
        await this.enemyTurn();
        console.log('[Battle] Enemy turn completed, state:', this.state);
    }

    // Helper: Apply damage to hero with animation
    applyHeroDamage(damage) {
        this.hero.hp = Math.max(0, this.hero.hp - damage);
        if (window.showBattleDamageAnimation) {
            window.showBattleDamageAnimation('heroSprite', damage);
        }
        
        // Add flicker animation when hero takes damage
        const heroSprite = document.getElementById('heroSprite');
        if (heroSprite && damage > 0) {
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                heroSprite.style.opacity = heroSprite.style.opacity === '0.3' ? '1' : '0.3';
                flickerCount++;
                if (flickerCount >= 12) { // 6 flickers (12 opacity changes) over 2 seconds
                    clearInterval(flickerInterval);
                    heroSprite.style.opacity = '1'; // Ensure sprite is visible at end
                }
            }, 167); // 167ms * 12 = ~2 seconds
        }
    }
    
    // Helper: Apply damage to enemy with animation
    applyEnemyDamage(damage) {
        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        if (window.showBattleDamageAnimation) {
            window.showBattleDamageAnimation('enemySprite', damage);
        }
    }
    
    // Helper: Heal hero with animation
    healHero(amount) {
        const oldHp = this.hero.hp;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + amount);
        const actualHeal = this.hero.hp - oldHp;
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('heroSprite', actualHeal);
        }
    }
    
    // Helper: Heal enemy with animation
    healEnemy(amount) {
        const oldHp = this.enemy.hp;
        this.enemy.hp = Math.min(this.enemy.maxHP, this.enemy.hp + amount);
        const actualHeal = this.enemy.hp - oldHp;
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('enemySprite', actualHeal);
        }
    }

    // Player attacks
    async playerAttack() {
        console.log('[Battle] playerAttack called, current state:', this.state);
        if (this.state !== BattleState.PLAYER_TURN) {
            console.warn('[Battle] playerAttack blocked - not player turn');
            return;
        }
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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
        
        // Process Overthink backfire effect
        if (this.overthinkActive && this.overthinkTurns > 0) {
            this.overthinkTurns--;
            if (this.overthinkTurns === 0) {
                // BACKFIRE! User's attack damages themselves
                addBattleLog(`💥 BACKFIRE! Your attack turned against you!`);
                addBattleLog(`🤯 Overthink effect caused ${this.overthinkBackfireDamage} damage to yourself!`);
                
                this.hero.hp = Math.max(0, this.hero.hp - this.overthinkBackfireDamage);
                this.overthinkActive = false;
                
                // Play hurt animation
                startHeroAnimation('hurt');
                await new Promise(resolve => setTimeout(resolve, 1500));
                startHeroAnimation('idle');
                
                updateBattleUI(this.hero, this.enemy);
                
                if (this.hero.hp <= 0) {
                    this.state = BattleState.DEFEAT;
                    await this.endBattle('defeat');
                    return;
                }
                
                // Still costs attack gauge
                this.attackGauge = Math.max(0, this.attackGauge - 10);
                updateBattleUI(this.hero, this.enemy);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.enemyTurn();
                return;
            } else {
                addBattleLog(`💭 Overthink: ${this.overthinkTurns} turn(s) until backfire...`);
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
        
        // Check if enemy evades (Ghost ability, Sunny Dragon, Fly, or Gloom)
        if ((this.enemy.canEvade || this.enemy.evasionAbility) && Math.random() < this.enemy.evasionChance) {
            const evasionEmoji = this.enemy.name === 'The Gloom' ? '🌑' : (this.enemy.name === 'Fly Drone' ? '🪰' : '👻');
            addBattleLog(`${evasionEmoji} ${this.enemy.name} evaded your attack!`);
            updateBattleUI(this.hero, this.enemy);
            
            // Reset hero sprite to idle
            startHeroAnimation('idle');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
            return;
        }
        
        // Check if Gloom deflects the attack (25% chance)
        if (this.enemy.canDeflect && Math.random() < this.enemy.deflectChance) {
            addBattleLog(`🛡️ The Gloom deflected your attack back at you!`);
            
            // Calculate damage that would have been dealt
            const baseDamage = this.hero.attack;
            const maxDamage = baseDamage + 10;
            const deflectedDamage = Math.floor(Math.random() * (maxDamage - baseDamage + 1)) + baseDamage;
            
            // Apply damage to hero instead
            this.hero.hp = Math.max(0, this.hero.hp - deflectedDamage);
            if (window.showBattleDamageAnimation) {
                window.showBattleDamageAnimation('heroSprite', deflectedDamage);
            }
            addBattleLog(`💥 You took ${deflectedDamage} damage from your own attack!`);
            updateBattleUI(this.hero, this.enemy);
            
            // Reset hero sprite to idle
            startHeroAnimation('idle');
            
            // Check if hero died from deflected damage
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
            return;
        }
        
        // Calculate damage using base attack (level-based) with randomization
        // Damage range: baseDamage to baseDamage + 10 (e.g., Level 10: 15-25 damage)
        const baseDamage = this.hero.attack;
        const maxDamage = baseDamage + 10;
        const randomDamage = Math.floor(Math.random() * (maxDamage - baseDamage + 1)) + baseDamage;
        
        // Enemy defense reduces damage slightly
        const defenseReduction = Math.floor(this.enemy.defense * 0.1); // Only 10% of enemy defense
        let damage = Math.max(randomDamage - defenseReduction, Math.floor(randomDamage * 0.8)); // At least 80% of damage
        
        // Focus Timer Special Attack: Random chance to trigger overpowered attack
        const focusMinutes = window.gameState?.totalFocusMinutes || 0;
        const maxFocusAttack = Math.min(Math.floor(focusMinutes / 10), 35); // Max 35 damage at 350 minutes
        const hasFocusAttack = maxFocusAttack >= 25 && !this.focusAttackUsed;
        
        if (hasFocusAttack) {
            // 20% chance to trigger focus attack on regular attack
            const triggerChance = Math.random();
            if (triggerChance <= 0.2) {
                this.focusAttackUsed = true;
                damage = maxFocusAttack; // Override with focus attack damage
                addBattleLog(`🔥 FOCUS POWER UNLEASHED! Massive ${damage} damage!`);
            }
        }
        
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
        
        // Fire Pig Projectile Attack on 3rd attack
        if (this.attackCount % 3 === 0 && this.attackCount > 0) {
            const equippedSkin = window.gameState?.equippedSkinId;
            if (equippedSkin === 'fire_pig') {
                await this.playFirePigProjectile();
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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

        // Calculate damage (50-65 range, melee strike - INCREASED)
        const damage = Math.floor(Math.random() * 16) + 50; // Random between 50-65
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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
        
        // Play defense boost visual animation (same as defense refill)
        await this.playDefenseBoostAnimation();
        
        addBattleLog('🛡️ Defense stance activated!');
        updateBattleUI(this.hero, this.enemy);

        await new Promise(resolve => setTimeout(resolve, 500));
        await this.enemyTurn();
    }

    // Player uses fireball
    async playerFireball() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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

        // Calculate damage (45-60 range - INCREASED)
        const damage = Math.floor(Math.random() * 16) + 45; // Random between 45-60
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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

        // Calculate damage (25 damage)
        const damage = 25;
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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

        // Calculate damage (35-50 range with nuclear explosion - INCREASED)
        const damage = Math.floor(Math.random() * 16) + 35; // Random between 35-50
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

    // Player uses freeze (freezes enemy for 2 turns - NO DAMAGE, COSTS 80% ATTACK GAUGE)
    async playerFreeze() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

        const freezeCount = gameState.battleInventory?.freeze || 0;
        if (freezeCount <= 0) {
            addBattleLog('❌ No freeze attacks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        
        // FREEZE COSTS 80% OF ATTACK GAUGE
        const freezeCost = Math.floor(this.attackGauge * 0.80);
        this.attackGauge = Math.max(0, this.attackGauge - freezeCost);
        addBattleLog(`❄️ Freeze used ${freezeCost} attack gauge!`);
        
        // Set flag to prevent gauge refill during frozen turns
        this.freezeActiveNoRefill = true;
        
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

        // NO DAMAGE - Freeze only stops enemy from attacking
        addBattleLog('❄️ Enemy is frozen for 2 turns!');
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        // Set enemy frozen for 2 turns
        this.enemyFrozenTurns = 2;
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // NO GAUGE RESTORATION - Freeze does not refill any gauges
        
        this.state = BattleState.PLAYER_TURN;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);
        
        // FIX: Start turn timer
        if (typeof startTurnTimer === 'function') {
            const timerDuration = this.turnTimerReduced ? 1000 : 3000;
            startTurnTimer(timerDuration);
            this.turnTimerReduced = false;
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
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
        
        // Play potion visual animation
        await this.playPotionAnimation();
        
        const healAmount = 20;
        const oldHp = this.hero.hp;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        const actualHeal = this.hero.hp - oldHp;
        
        // Show heal animation
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('heroSprite', actualHeal);
        }
        
        addBattleLog(`💚 Healed ${actualHeal} HP!`);
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
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
        
        // Play potion visual animation
        await this.playPotionAnimation();
        
        const healAmount = 50;
        const oldHp = this.hero.hp;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        const actualHeal = this.hero.hp - oldHp;
        
        // Show heal animation
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('heroSprite', actualHeal);
        }
        
        addBattleLog(`💚 Hyper Potion healed ${actualHeal} HP!`);
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

        this.state = BattleState.FLED;
        addBattleLog('🏃 You fled from battle!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await this.endBattle('fled');
    }

    // Player uses attack refill
    async playerAttackRefill() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

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
        
        // Play attack boost visual animation
        await this.playAttackBoostAnimation();
        
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

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
        
        // Play defense boost visual animation
        await this.playDefenseBoostAnimation();
        
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

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
        
        // Play hero roll animation
        if (window.playHeroRollAnimation) {
            await window.playHeroRollAnimation();
        }
        
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 500));
        await this.enemyTurn();
    }

    // Player uses Mirror Attack
    async playerMirrorAttack() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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
        
        // Play blue flame sound
        if (window.audioManager) {
            window.audioManager.playSound('fireball', 0.7); // Use fireball sound for blue flame
        }

        // Calculate damage (50-70 base damage - INCREASED)
        const damage = Math.floor(Math.random() * 21) + 50; // 50-70 damage
        const isDead = this.enemy.takeDamage(damage);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
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

    // Player uses Lightning Bolt
    async playerLightningBolt() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for Lightning Bolt!');
            return;
        }

        const lightningCount = gameState.battleInventory?.lightning || 0;
        if (lightningCount <= 0) {
            addBattleLog('❌ No Lightning Bolts left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;
        gameState.battleInventory.lightning = Math.max(0, gameState.battleInventory.lightning - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero cast animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play dramatic lightning bolt animation
        if (window.playLightningBoltAnimation) {
            await playLightningBoltAnimation(
                document.getElementById('heroSprite'),
                document.getElementById('enemySprite')
            );
        } else {
            // Fallback to spark animation if lightning animation not loaded
            await playSparkAnimation(
                document.getElementById('heroSprite'),
                document.getElementById('enemySprite')
            );
        }
        
        // Play thunder sound
        if (window.audioManager) {
            window.audioManager.playSound('critical_hit', 0.9);
        }

        // Calculate damage (70-90 damage)
        const damage = Math.floor(Math.random() * 21) + 70;
        const isDead = this.enemy.takeDamage(damage);
        
        // Restore 20 attack gauge
        this.attackGauge = Math.min(100, this.attackGauge + 20);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`⚡ Lightning Bolt dealt ${damage} damage and restored 20 attack gauge!`);
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

    // Player uses Star Shield
    async playerStarShield() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 30) {
            addBattleLog('❌ Need 30 attack gauge for Star Shield!');
            return;
        }

        const starShieldCount = gameState.battleInventory?.star_shield || 0;
        if (starShieldCount <= 0) {
            addBattleLog('❌ No Star Shields left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 30;
        gameState.battleInventory.star_shield = Math.max(0, gameState.battleInventory.star_shield - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Activate star shield (blocks next 2 attacks)
        this.starShieldActive = true;
        this.starShieldCharges = 2;

        // Play hero cast animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        addBattleLog('🌟 Star Shield activated! (2 charges)');
        addBattleLog('🛡️ Next 2 enemy attacks will be blocked completely!');
        
        // Play shield sound
        if (window.audioManager) {
            window.audioManager.playSound('defend', 0.8);
        }

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800));
        await this.enemyTurn();
    }

    // Player uses Honey Trap
    async playerHoneyTrap() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 20) {
            addBattleLog('❌ Need 20 attack gauge for Honey Trap!');
            return;
        }

        const honeyCount = gameState.battleInventory?.honey_trap || 0;
        if (honeyCount <= 0) {
            addBattleLog('❌ No Honey Traps left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 20;
        gameState.battleInventory.honey_trap = Math.max(0, gameState.battleInventory.honey_trap - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play honey projectile animation
        if (window.playHoneypotAnimation) {
            await window.playHoneypotAnimation(
                document.getElementById('heroSprite'),
                document.getElementById('enemySprite')
            );
        } else {
            // Fallback to prickler animation if honeypot not available
            await playPricklerAnimation(
                document.getElementById('heroSprite'),
                document.getElementById('enemySprite')
            );
        }

        // Calculate damage (30-40 damage)
        const damage = Math.floor(Math.random() * 11) + 30;
        const isDead = this.enemy.takeDamage(damage);
        
        // Apply honey slow effect (reduces enemy damage by 30% for 3 turns)
        this.honeySlowActive = true;
        this.honeySlowTurns = 3;
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🍯 Honey Trap dealt ${damage} damage!`);
        addBattleLog('🐝 Enemy is slowed! Damage reduced by 30% for 3 turns!');
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

    // Player uses Throwing Stars
    async playerThrowingStars() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 15) {
            addBattleLog('❌ Need 15 attack gauge for Throwing Stars!');
            return;
        }

        const throwingStarsCount = gameState.battleInventory?.throwing_stars || 0;
        if (throwingStarsCount <= 0) {
            addBattleLog('❌ No Throwing Stars left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 15;
        gameState.battleInventory.throwing_stars = Math.max(0, gameState.battleInventory.throwing_stars - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play throwing star projectile animation
        if (window.playThrowingStarAnimation) {
            await window.playThrowingStarAnimation(
                document.getElementById('heroSprite'),
                document.getElementById('enemySprite')
            );
        }

        // Calculate damage (15-25 range)
        const damage = Math.floor(Math.random() * 11) + 15;
        const isDead = this.enemy.takeDamage(damage);
        
        // Apply weaken effect (reduces enemy's next attack by 50%)
        this.enemyWeakened = true;
        this.enemyWeakenAmount = 0.5;
        
        // Play critical hit sound for damage >= 10
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`⭐ Throwing Stars dealt ${damage} damage!`);
        addBattleLog(`💫 Enemy's next attack will be weakened by 50%!`);
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
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
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
        
        // Play ghost sound
        if (window.audioManager) {
            window.audioManager.playSound('spark_attack', 0.6); // Use spark sound for ghost
        }

        // Calculate variable damage (40-50 range, skips 1 turn - INCREASED)
        const damage = Math.floor(Math.random() * 11) + 40; // Random between 40-50
        const isDead = this.enemy.takeDamage(damage);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
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
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
        }
    }

    // Enemy turn
    async enemyTurn() {
        console.log('[Battle] enemyTurn called, setting state to ENEMY_TURN');
        this.state = BattleState.ENEMY_TURN;
        
        // CRITICAL: Increment enemy turn counter
        this.enemyTurnCount++;

        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if enemy is frozen
        if (this.enemyFrozenTurns > 0) {
            this.enemyFrozenTurns--;
            addBattleLog(`❄️ Enemy is frozen! (${this.enemyFrozenTurns} turns remaining)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Skip enemy turn and return to player turn
            this.state = BattleState.PLAYER_TURN;
            
            // NO GAUGE REFILL during frozen turns - gauge stays depleted until player uses power boost
            // (Freeze costs 80% attack gauge and it should STAY that way)
            
            // Clear the no-refill flag when freeze effect ends
            if (this.enemyFrozenTurns <= 0) {
                this.freezeActiveNoRefill = false;
            }
            
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            
            // Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // Apply Nova's burn damage at start of enemy turn (from Nova Spirit special attack)
        if (this.burnTurns > 0) {
            const burnDmg = this.burnDamage || 20;
            const isDead = this.enemy.takeDamage(burnDmg);
            addBattleLog(`🔥 Burn dealt ${burnDmg} damage! (${this.burnTurns} turns left)`);
            
            this.burnTurns--;
            if (this.burnTurns <= 0) {
                addBattleLog('✨ Burn effect ended!');
            }
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // FIX: Apply Nova's poison damage at start of enemy turn
        if (this.novaPoisonTurns > 0) {
            const poisonDamage = this.novaPoisonDamage || 2;
            const isDead = this.enemy.takeDamage(poisonDamage);
            addBattleLog(`☠️ Poison dealt ${poisonDamage} damage! (${this.novaPoisonTurns} turns left)`);
            
            this.novaPoisonTurns--;
            if (this.novaPoisonTurns <= 0) {
                addBattleLog('✨ Poison effect ended!');
            }
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // === ADAPTIVE HEALING AI ===
        if (window.enemyAI && this.enemy.hp < this.enemy.maxHP) {
            const playerLevel = gameState.level || 1;
            const healResult = window.enemyAI.attemptEnemyHeal(this.enemy, playerLevel);
            
            if (healResult.healed) {
                // Show heal animation above enemy
                if (window.showBattleHealAnimation) {
                    window.showBattleHealAnimation('enemySprite', healResult.amount);
                }
                
                addBattleLog(`💚 ${this.enemy.name} regenerates ${healResult.amount} HP!`);
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
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
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
                return;
            }
        }

        // CRITICAL: Check if we need to force special attacks (ensure 3+ uses)
        const needsMoreSpecialAttacks = this.shouldForceSpecialAttack();
        
        // Check if enemy can petrify (Medusa)
        // Force petrify if needed (100% chance), otherwise use probability
        const canPetrify = this.enemy.canPetrify && (
            (needsMoreSpecialAttacks && this.specialAttackUsageCount['petrify'] < this.minimumSpecialAttackUses) ||
            (!needsMoreSpecialAttacks && Math.random() < (this.enemy.petrifyChance || 0.3))
        );
        
        if (canPetrify) {
            // CRITICAL: Track special attack usage
            this.specialAttackUsageCount['petrify'] = (this.specialAttackUsageCount['petrify'] || 0) + 1;
            console.log(`[Battle] Petrify used ${this.specialAttackUsageCount['petrify']} time(s)`);
            
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
        // Force sleep if needed (100% chance), otherwise use probability
        const canCastSleep = this.enemy.canSleep && (
            (needsMoreSpecialAttacks && this.specialAttackUsageCount['sleep'] < this.minimumSpecialAttackUses) ||
            (!needsMoreSpecialAttacks && Math.random() < 0.3)
        );
        
        if (canCastSleep) {
            // CRITICAL: Track special attack usage
            this.specialAttackUsageCount['sleep'] = (this.specialAttackUsageCount['sleep'] || 0) + 1;
            console.log(`[Battle] Sleep used ${this.specialAttackUsageCount['sleep']} time(s)`);
            
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
        
        // Check for Octopus drench attack
        // Force drench if needed (100% chance), otherwise use probability
        const useDrench = this.enemy.drenchAttack && (
            (needsMoreSpecialAttacks && this.specialAttackUsageCount['drench'] < this.minimumSpecialAttackUses) ||
            (!needsMoreSpecialAttacks && Math.random() < 0.5)
        );
        
        // Check for Octopus hug attack
        // Force hug if needed (100% chance), otherwise use probability
        const useHug = this.enemy.hugAttack && !useDrench && (
            (needsMoreSpecialAttacks && this.specialAttackUsageCount['hug'] < this.minimumSpecialAttackUses) ||
            (!needsMoreSpecialAttacks && Math.random() < 0.3)
        );
        
        if (useDrench) {
            // CRITICAL: Track special attack usage
            this.specialAttackUsageCount['drench'] = (this.specialAttackUsageCount['drench'] || 0) + 1;
            console.log(`[Battle] Drench used ${this.specialAttackUsageCount['drench']} time(s)`);
            
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
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        } else if (useHug) {
            // CRITICAL: Track special attack usage
            this.specialAttackUsageCount['hug'] = (this.specialAttackUsageCount['hug'] || 0) + 1;
            console.log(`[Battle] Hug used ${this.specialAttackUsageCount['hug']} time(s)`);
            
            // Hug attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Apply hug effect: block defend for 2 turns
            this.defendBlocked = 2;
            addBattleLog(`🐙 ${this.enemy.name}'s Hug blocked defend for 2 turns!`);
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // Boss special attacks
        if (this.enemy.isBoss) {
            // Treant poison attack
            // Force poison if needed (100% chance)
            const shouldUsePoison = this.enemy.poisonAttack && (
                (needsMoreSpecialAttacks && this.specialAttackUsageCount['poison'] < this.minimumSpecialAttackUses) ||
                (!needsMoreSpecialAttacks && Math.random() < 0.6)
            );
            
            if (shouldUsePoison) {
                // CRITICAL: Track special attack usage
                this.specialAttackUsageCount['poison'] = (this.specialAttackUsageCount['poison'] || 0) + 1;
                console.log(`[Battle] Poison used ${this.specialAttackUsageCount['poison']} time(s)`);
                
                await playEnemyAnimation(this.enemy, 'attack1', 600);
                
                // Use correct damage range
                const damage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                    ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                    : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
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
                    
                    // FIX: Start turn timer
                    if (typeof startTurnTimer === 'function') {
                        const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                        startTurnTimer(timerDuration);
                        this.turnTimerReduced = false;
                    }
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
                    
                    // FIX: Start turn timer
                    if (typeof startTurnTimer === 'function') {
                        const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                        startTurnTimer(timerDuration);
                        this.turnTimerReduced = false;
                    }
                }
                return;
            }
            
            // Mushroom special attack
            // Force mushroom if needed (100% chance)
            const shouldUseMushroom = this.enemy.mushroomAttack && (
                (needsMoreSpecialAttacks && this.specialAttackUsageCount['mushroom'] < this.minimumSpecialAttackUses) ||
                (!needsMoreSpecialAttacks && Math.random() < 0.6)
            );
            
            if (shouldUseMushroom) {
                // CRITICAL: Track special attack usage
                this.specialAttackUsageCount['mushroom'] = (this.specialAttackUsageCount['mushroom'] || 0) + 1;
                console.log(`[Battle] Mushroom used ${this.specialAttackUsageCount['mushroom']} time(s)`);
                
                await playEnemyAnimation(this.enemy, 'attack2', 600);
                
                // Show mushroom emoji projectiles
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playMushroomProjectile(enemySprite, heroSprite);
                
                // Use correct damage range
                const damage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                    ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                    : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
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
                    
                    // FIX: Start turn timer
                    if (typeof startTurnTimer === 'function') {
                        const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                        startTurnTimer(timerDuration);
                        this.turnTimerReduced = false;
                    }
                }
                return;
            }
        }
        
        // OVERTHINKER SPECIAL ATTACK: Overthink - Makes user's next attack backfire at a random turn
        // Force overthink if needed (100% chance), otherwise use probability
        const shouldUseOverthink = this.enemy.canOverthink && (
            (needsMoreSpecialAttacks && this.specialAttackUsageCount['overthink'] < this.minimumSpecialAttackUses) ||
            (!needsMoreSpecialAttacks && Math.random() < 0.4)
        );
        
        if (shouldUseOverthink) {
            // CRITICAL: Track special attack usage
            this.specialAttackUsageCount['overthink'] = (this.specialAttackUsageCount['overthink'] || 0) + 1;
            console.log(`[Battle] Overthink used ${this.specialAttackUsageCount['overthink']} time(s)`);
            
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show thought bubble projectile effect
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (enemySprite && heroSprite) {
                const thoughtBubble = document.createElement('div');
                thoughtBubble.innerHTML = '🤯💭';
                thoughtBubble.style.cssText = `
                    position: absolute;
                    font-size: 40px;
                    z-index: 1000;
                    animation: thoughtFloat 1s ease-out forwards;
                `;
                
                // Add animation keyframes
                if (!document.getElementById('overthinkStyle')) {
                    const style = document.createElement('style');
                    style.id = 'overthinkStyle';
                    style.textContent = `
                        @keyframes thoughtFloat {
                            0% { transform: translateX(0) scale(1); opacity: 1; }
                            50% { transform: translateX(-100px) scale(1.5); opacity: 1; }
                            100% { transform: translateX(-200px) scale(0.5); opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                const enemyRect = enemySprite.getBoundingClientRect();
                thoughtBubble.style.left = enemyRect.left + 'px';
                thoughtBubble.style.top = enemyRect.top + 'px';
                document.body.appendChild(thoughtBubble);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                thoughtBubble.remove();
            }
            
            // Apply Overthink effect: user's next attack will backfire at a random turn (1-3 turns)
            this.overthinkActive = true;
            this.overthinkTurns = Math.floor(Math.random() * 3) + 1; // 1-3 turns until backfire
            this.overthinkBackfireDamage = Math.floor(Math.random() * 16) + 15; // 15-30 backfire damage
            
            addBattleLog(`🤯 ${this.enemy.name} used Overthink!`);
            addBattleLog(`💭 Your next attack will backfire in ${this.overthinkTurns} turn(s)!`);
            
            // Play sound effect
            if (window.audioManager) {
                window.audioManager.playSound('error', 0.6);
            }
            
            updateBattleUI(this.hero, this.enemy);
            
            this.state = BattleState.PLAYER_TURN;
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
            
            // Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // FIX: Alien's Time Sting attack
        if (this.enemy.timeStingAttack && Math.random() < (this.enemy.timeStingChance || 0.25)) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show alien projectile
            if (this.enemy.projectileType === 'alien') {
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playAlienProjectile(enemySprite, heroSprite);
            }
            
            // Deal light damage (5-8)
            const damage = Math.floor(Math.random() * 4) + 5;
            this.hero.hp = Math.max(0, this.hero.hp - damage);
            
            // Set flag to reduce timer on next turn
            this.turnTimerReduced = true;
            
            addBattleLog(`⏱️ ${this.enemy.name} used Time Sting! Dealt ${damage} damage!`);
            addBattleLog('⚠️ Your next turn will have only 1 second!');
            
            // Play time sting sound effect
            if (window.audioManager) {
                window.audioManager.playSound('error', 0.6);
            }
            
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
                
                // FIX: Start turn timer (will be 1 second due to Time Sting)
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    // Don't reset flag here - it should persist for this turn
                }
            }
            return;
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
        
        // If Fly enemy, shoot fly spit projectile
        if (this.enemy.projectileType === 'fly-spit') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.createProjectile) {
                await window.createProjectile('fly-spit', enemySprite, heroSprite);
            }
        }
        
        // Vampire bolt projectile
        if (this.enemy.projectileType === 'vampire-bolt') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.playVampireBoltAnimation) {
                await window.playVampireBoltAnimation(enemySprite, heroSprite);
            }
        }
        
        // Drone projectile
        if (this.enemy.projectileType === 'drone-projectile') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.playDroneProjectileAnimation) {
                await window.playDroneProjectileAnimation(enemySprite, heroSprite);
            }
        }
        
        // Mushroom projectile
        if (this.enemy.projectileType === 'mushroom') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.playMushroomProjectileAnimation) {
                await window.playMushroomProjectileAnimation(enemySprite, heroSprite);
            }
        }
        
        // Cthulhu explosion
        if (this.enemy.projectileType === 'cthulhu-explosion') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.playCthulhuExplosionAnimation) {
                await window.playCthulhuExplosionAnimation(enemySprite, heroSprite);
            }
        }
        
        // Treant explosion
        if (this.enemy.projectileType === 'treant-explosion') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.playTreantExplosionAnimation) {
                await window.playTreantExplosionAnimation(enemySprite, heroSprite);
            }
        }

        // Check if Invisibility Cloak is active
        if (this.hasEvade) {
            addBattleLog('🥷🏼 Your monster used the Invisibility Cloak and evaded the attack!');
            this.hasEvade = false;
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // Check if Mirror Attack is active
        if (this.hasReflect) {
            addBattleLog('🪞 Mirror Attack reflected the attack back!');
            this.hasReflect = false;
            
            // Calculate damage that would have been dealt to hero (using correct damage range)
            const reflectedDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            
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
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
            }
            return;
        }
        
        // Check if Luna's Chaos Curse (Reflect) is active
        if (this.reflectActive && this.reflectTurns > 0) {
            addBattleLog(`🌙 Chaos Curse active! Enemy damages itself! (${this.reflectTurns} turns left)`);
            
            // Calculate damage that would have been dealt to hero (using correct damage range)
            const reflectedDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            
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
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
            }
            return;
        }
        
        // Check for Gloom self-heal ability (20% chance, max 3 times per battle)
        if (this.enemy.canSelfHeal && this.enemy.selfHealCount < this.enemy.selfHealMax) {
            // Only heal if HP is below 50%
            if (this.enemy.hp < this.enemy.maxHP * 0.5 && Math.random() < 0.20) {
                this.enemy.selfHealCount++;
                const healAmount = this.enemy.selfHealAmount;
                const oldHp = this.enemy.hp;
                this.enemy.hp = Math.min(this.enemy.maxHP, this.enemy.hp + healAmount);
                const actualHeal = this.enemy.hp - oldHp;
                
                if (actualHeal > 0 && window.showBattleHealAnimation) {
                    window.showBattleHealAnimation('enemySprite', actualHeal);
                }
                
                addBattleLog(`💜 The Gloom absorbed dark energy and healed ${actualHeal} HP! (${this.enemy.selfHealCount}/${this.enemy.selfHealMax} heals used)`);
                updateBattleUI(this.hero, this.enemy);
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Gloom still gets to attack after healing
            }
        }
        
        // Check for Gloom power absorption (20% chance to absorb 30 attack gauge)
        if (this.enemy.canAbsorbPower && Math.random() < this.enemy.absorbChance) {
            const absorbAmount = this.enemy.absorbAmount;
            const oldGauge = this.attackGauge;
            this.attackGauge = Math.max(0, this.attackGauge - absorbAmount);
            const actualAbsorbed = oldGauge - this.attackGauge;
            
            addBattleLog(`⚡ The Gloom absorbed ${actualAbsorbed} attack power from you!`);
            updateBattleUI(this.hero, this.enemy);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
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

        // Calculate damage using enemy's damage range (FIXED)
        let damage;
        
        // Use attackDamageMin and attackDamageMax if available (correct approach)
        if (this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined) {
            const min = this.enemy.attackDamageMin;
            const max = this.enemy.attackDamageMax;
            damage = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        // Fly specific damage values (9 or 17) - legacy support
        else if (this.enemy.damageValues && this.enemy.damageValues.length === 2) {
            damage = Math.random() < 0.5 ? this.enemy.damageValues[0] : this.enemy.damageValues[1];
        }
        // Alien variable damage (5 or 15) - legacy support
        else if (this.enemy.variableDamage) {
            damage = Math.random() < 0.5 ? 5 : 15;
        }
        // Fallback to old formula (should rarely be used now)
        else {
            damage = Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
        }
        
        // Apply damage cap if enemy has one
        if (this.enemy.maxDamage) {
            damage = Math.min(damage, this.enemy.maxDamage);
        }
        
        // Apply Honey Trap slow effect (reduces damage by 30%)
        if (this.honeySlowActive && this.honeySlowTurns > 0) {
            const originalDamage = damage;
            damage = Math.floor(damage * 0.7); // 30% damage reduction
            addBattleLog(`🍯 Enemy is slowed! Damage reduced from ${originalDamage} to ${damage}! (${this.honeySlowTurns} turns left)`);
            this.honeySlowTurns--;
            
            if (this.honeySlowTurns <= 0) {
                this.honeySlowActive = false;
                addBattleLog('🍯 Honey Trap effect wore off!');
            }
        }
        
        // Apply Throwing Stars weakening effect (reduces damage by 50%)
        if (this.enemyWeakened && this.enemyWeakenAmount > 0) {
            const originalDamage = damage;
            damage = Math.floor(damage * (1 - this.enemyWeakenAmount)); // 50% damage reduction
            addBattleLog(`💫 Throwing Stars weakened the enemy! Damage reduced from ${originalDamage} to ${damage}!`);
            this.enemyWeakened = false;
            this.enemyWeakenAmount = 0;
        }
        
        // Apply Luna's Eclipse deflect effect (deflects damage back to enemy)
        if (this.deflectActive) {
            addBattleLog(`🌙 Luna's Eclipse deflects ${damage} damage back to the enemy!`);
            const isDead = this.enemy.takeDamage(damage);
            this.deflectActive = false;
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            
            // Skip the rest of enemy attack since damage was deflected
            this.state = BattleState.PLAYER_TURN;
            this.attackGauge = Math.min(100, this.attackGauge + 15);
            this.defenseGauge = Math.min(100, this.defenseGauge + 15);
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // Check if Star Shield is active
        if (this.starShieldActive && this.starShieldCharges > 0) {
            this.starShieldCharges--;
            addBattleLog(`🌟 Star Shield blocked all ${damage} damage! (${this.starShieldCharges} charges left)`);
            
            if (this.starShieldCharges <= 0) {
                this.starShieldActive = false;
                addBattleLog('✨ Star Shield expired!');
            }
            
            updateBattleUI(this.hero, this.enemy);
        }
        // Check if defend was active - use defense gauge instead of HP
        else if (this.defendActive && this.defenseGauge > 0) {
            // Check if Benny's defense immune is active (defense gauge won't decrease)
            if (this.defenseImmune > 0) {
                addBattleLog(`💨 Benny Bubble! Defense immune - blocked all ${damage} damage! (${this.defenseImmune} turns left)`);
                this.defenseImmune--;
                if (this.defenseImmune <= 0) {
                    addBattleLog('✨ Defense immunity ended!');
                }
            } else {
                const gaugeUsed = Math.min(damage, this.defenseGauge);
                this.defenseGauge -= gaugeUsed;
                const remainingDamage = damage - gaugeUsed;
                if (remainingDamage > 0) {
                    this.applyHeroDamage(remainingDamage);
                    addBattleLog(`🛡️ Blocked ${gaugeUsed} damage! Took ${remainingDamage} damage!`);
                } else {
                    addBattleLog(`🛡️ Blocked all ${damage} damage!`);
                }
            }
            this.defendActive = false;
        } else {
            this.applyHeroDamage(damage);
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
            console.log('[Battle] State set to PLAYER_TURN');
            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
            
            // Update action buttons to enable them
            if (typeof updateActionButtons === 'function') {
                updateActionButtons(this.hero);
                console.log('[Battle] updateActionButtons called');
            }
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                // Reset the reduced flag after applying it
                this.turnTimerReduced = false;
            }
        }
    }

    // End battle
    async endBattle(result) {
        let xpGained = 0;
        let xpLost = 0;
        
        if (result === 'victory') {
            addBattleLog(`🎉 VICTORY! You defeated the ${this.enemy.name}!`);
            
            // Check if this was a Gloom victory
            if (this.enemy.isGloomEncounter) {
                console.log('🌑 Gloom defeated! Marking as defeated...');
                if (window.gameState) {
                    window.gameState.gloomDefeated = true;
                    if (typeof saveGameState === 'function') {
                        saveGameState();
                    }
                }
            }
            
            // Play victory sound effect
            if (window.audioManager) {
                window.audioManager.playSound('battle_victory', 0.8);
            }
            
            // Play battle win music
            if (window.audioManager) {
                window.audioManager.playBattleWinMusic();
            }
            
            // Calculate XP reward based on enemy level
            const enemyLevel = this.enemy.level || this.enemy.baseLevel || 1;
            xpGained = Math.floor(15 + (enemyLevel * 5));
            console.log(`[Battle] XP Calculation: enemyLevel=${enemyLevel}, xpGained=${xpGained}`);
            
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
                
                // Ensure xpGained is valid
                if (isNaN(xpGained) || xpGained === null || xpGained === undefined) {
                    console.error('[Battle] XP calculation failed, using default');
                    xpGained = 20; // Default XP
                }
                
                console.log(`[Battle] Showing loot modal with XP: ${xpGained}`);
                
                // Show Gloom victory modal first if this was a Gloom encounter
                if (this.enemy.isGloomEncounter && window.showGloomVictoryModal) {
                    console.log('🏆 Showing Gloom victory modal...');
                    window.showGloomVictoryModal();
                    
                    // Wait for Gloom victory modal to be dismissed
                    await new Promise(resolve => {
                        const checkModal = setInterval(() => {
                            if (!document.getElementById('gloomVictoryModal')) {
                                clearInterval(checkModal);
                                resolve();
                            }
                        }, 100);
                    });
                }
                
                // Show loot modal
                window.lootSystem.showLootModal(lootDrops, xpGained, this.enemy.name);
                
                // Dispatch Guardian event after loot modal (Guardian appears on map page)
                // The loot modal should handle showing the map page after it closes
                setTimeout(() => {
                    const guardianEvent = new CustomEvent('battleVictory', {
                        detail: {
                            level: window.gameState.jerryLevel || 1,
                            enemy: this.enemy.name,
                            isFirstBattle: (window.gameState.battlesWon === 1),
                            justLeveledUp: window.gameState.justLeveledUp || false,
                            previousLevel: window.gameState.previousLevel || null
                        }
                    });
                    document.dispatchEvent(guardianEvent);
                    console.log('[Guardian] Battle victory event dispatched');
                }, 100);
            } else {
                // Fallback to alert if loot system not loaded
                alert(`🎉 Victory!\n\nYou defeated the ${this.enemy.name}!\n\n✨ +${xpGained} XP earned!\n\nGreat job, keep it up! 💪`);
            }
            
        } else if (result === 'defeat') {
            addBattleLog('💫 DEFEAT! You were defeated...');
            
            // Play battle lose music
            if (window.audioManager) {
                window.audioManager.playBattleLoseMusic();
            }
            
            // Calculate XP loss (smaller penalty)
            const enemyLevel = this.enemy.level || this.enemy.baseLevel || 1;
            xpLost = Math.floor(5 + (enemyLevel * 2));
            console.log(`[Battle] XP Loss Calculation: enemyLevel=${enemyLevel}, xpLost=${xpLost}`);
            
            // Deduct XP (but don't go below 0)
            if (window.gameState) {
                window.gameState.jerryXP = Math.max(0, (window.gameState.jerryXP || 0) - xpLost);
            }
            
            // Calculate and apply loot loss
            let lootLost = [];
            if (window.gameState && window.gameState.battleInventory) {
                const inventory = window.gameState.battleInventory;
                const lootableItems = ['health_potion', 'hyper_potion', 'attack_refill', 'defense_refill'];
                
                // Randomly lose 1-2 items (if available)
                const itemsToLose = Math.floor(Math.random() * 2) + 1;
                
                for (let i = 0; i < itemsToLose; i++) {
                    // Pick a random item that the player has
                    const availableItems = lootableItems.filter(item => inventory[item] > 0);
                    if (availableItems.length > 0) {
                        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                        inventory[randomItem] = Math.max(0, inventory[randomItem] - 1);
                        lootLost.push(randomItem);
                    }
                }
                
                console.log('[Battle] Loot lost on defeat:', lootLost);
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
            
            // Show custom defeat modal (matching victory modal style)
            this.showDefeatModal(this.enemy.name, xpLost, lootLost);
            
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



        // FIX: Only stop battle loop music, NOT win/lose music
        // Win/lose music will play until user returns to home page
        if (window.audioManager) {
            window.audioManager.stopAllBattleMusic();
            // DO NOT stop win/lose music here - it should continue playing
        }

        // Reset battle active flag
        this.inBattle = false;
        console.log('[Battle] Battle ended, inBattle flag set to false');
        
        // CRITICAL: Clear battle state to allow external code to modify heroSprite again
        if (typeof window.clearBattleState === 'function') {
            window.clearBattleState();
        }
        
        // Fade out after 2 seconds
        setTimeout(() => {
            document.getElementById('battleLog').innerHTML = '';
            const arena = document.getElementById('battleArena');
            arena.classList.add('hidden');
            
            // Clear cached battle appearance to allow skin changes between battles
            if (window.cachedBattleAppearance !== undefined) {
                window.cachedBattleAppearance = null;
            }
            
            // FIXED: Stop all battle music when arena is hidden
            // This ensures music stops even if user navigates away without clicking Continue
            if (window.audioManager) {
                window.audioManager.stopAllBattleMusic();
                window.audioManager.stopBattleOutcomeMusic();
            }
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
        
        // Temporarily hide enemy sprite for dust animation
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
        
        // CRITICAL: Reset enemy sprite opacity for next battle
        // This ensures the enemy sprite will be visible when the next battle starts
        enemySprite.style.opacity = '1';
    }
    
    // Show defeat modal (matching victory modal style with sadder tone)
    showDefeatModal(enemyName, xpLost, lootLost = []) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'defeatModalOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #666;
            border-radius: 16px;
            padding: 20px;
            max-width: 340px;
            width: 85%;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
            animation: scaleIn 0.3s ease-out;
            color: white;
            text-align: center;
        `;

        // Defeat title
        const title = document.createElement('h2');
        title.textContent = '💫 Defeat... 💫';
        title.style.cssText = `
            font-size: 28px;
            margin: 0 0 8px 0;
            color: #888;
            text-shadow: 0 0 10px rgba(136, 136, 136, 0.5);
        `;

        // Enemy text
        const enemyText = document.createElement('p');
        enemyText.textContent = `The ${enemyName} was too strong this time.`;
        enemyText.style.cssText = `
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #c0c0c0;
        `;

        // XP lost
        const xpText = document.createElement('div');
        xpText.textContent = `📉 -${xpLost} XP lost`;
        xpText.style.cssText = `
            font-size: 20px;
            margin: 0 0 12px 0;
            color: #ff6b6b;
            font-weight: bold;
        `;
        
        // Loot lost (if any)
        let lootText = null;
        if (lootLost.length > 0) {
            lootText = document.createElement('div');
            const lootNames = lootLost.map(item => {
                return item.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            });
            lootText.textContent = `💔 Lost: ${lootNames.join(', ')}`;
            lootText.style.cssText = `
                font-size: 16px;
                margin: 0 0 16px 0;
                color: #ff9999;
                font-weight: 600;
            `;
        }

        // Encouragement message
        const encouragement = document.createElement('p');
        encouragement.textContent = "Don't give up! Train harder and try again! 🔥";
        encouragement.style.cssText = `
            font-size: 15px;
            margin: 0 0 16px 0;
            color: #e0e0e0;
            line-height: 1.4;
        `;

        // OK button
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 40px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.2s ease;
        `;

        okButton.onmouseover = () => {
            okButton.style.transform = 'translateY(-2px)';
            okButton.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
        };

        okButton.onmouseout = () => {
            okButton.style.transform = 'translateY(0)';
            okButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        };

        okButton.onclick = () => {
            // CRITICAL: Stop ALL battle music (defeat music + any lingering battle music)
            if (window.audioManager) {
                window.audioManager.stopBattleOutcomeMusic();
                window.audioManager.stopAllBattleMusic();
                console.log('[DefeatModal] Stopped all battle music');
            }
            overlay.remove();
        };

        modal.appendChild(title);
        modal.appendChild(enemyText);
        modal.appendChild(xpText);
        if (lootText) {
            modal.appendChild(lootText);
        }
        modal.appendChild(encouragement);
        modal.appendChild(okButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add animations if not already present
        if (!document.getElementById('defeatModalAnimations')) {
            const style = document.createElement('style');
            style.id = 'defeatModalAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * CRITICAL: Determine if we should force special attacks
     * Ensures each special attack is used at least 3 times per battle
     */
    shouldForceSpecialAttack() {
        // Check if any tracked special attack hasn't been used enough
        for (const attackType in this.specialAttackUsageCount) {
            if (this.specialAttackUsageCount[attackType] < this.minimumSpecialAttackUses) {
                // Force special attacks if we're past turn 5 and haven't used them enough
                if (this.enemyTurnCount >= 5) {
                    console.log(`[Battle] Forcing special attacks - ${attackType} only used ${this.specialAttackUsageCount[attackType]} time(s)`);
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Play Fire Pig Projectile Attack Animation
     * Triggered on every 3rd attack when Fire Pig skin is equipped
     */
    async playFirePigProjectile() {
        const battleContainer = document.querySelector('.battle-container');
        if (!battleContainer) return;
        
        // Create projectile element
        const projectile = document.createElement('img');
        projectile.src = 'assets/projectiles/FirePigProjectileAttack.png';
        projectile.style.cssText = `
            position: absolute;
            width: 48px;
            height: 48px;
            left: 20%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            image-rendering: pixelated;
            pointer-events: none;
        `;
        
        battleContainer.appendChild(projectile);
        
        // Animate projectile from hero to enemy
        const startX = 20;
        const endX = 75;
        const duration = 600; // 600ms animation
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out cubic for smooth deceleration
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentX = startX + (endX - startX) * easeProgress;
                
                projectile.style.left = `${currentX}%`;
                
                // Add slight rotation for effect
                projectile.style.transform = `translate(-50%, -50%) rotate(${progress * 360}deg)`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Create impact effect
                    projectile.style.opacity = '0';
                    projectile.style.transform = `translate(-50%, -50%) scale(2)`;
                    projectile.style.transition = 'all 0.2s ease';
                    
                    setTimeout(() => {
                        projectile.remove();
                        resolve();
                    }, 200);
                }
            };
            
            animate();
        });
    }

    /**
     * Play Potion Animation
     * Shows a potion effect rising up from the hero
     */
    async playPotionAnimation() {
        const heroSprite = document.getElementById('heroSprite');
        if (!heroSprite) return;
        
        const battleContainer = document.querySelector('.battle-container');
        if (!battleContainer) return;
        
        // Create potion animation element
        const potionEffect = document.createElement('img');
        potionEffect.src = 'assets/battle-items/Potion Animation.gif';
        potionEffect.style.cssText = `
            position: absolute;
            width: 64px;
            height: 64px;
            left: 25%;
            top: 60%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            image-rendering: pixelated;
            pointer-events: none;
            opacity: 1;
        `;
        
        battleContainer.appendChild(potionEffect);
        
        // Animate upward and fade out
        return new Promise(resolve => {
            const duration = 800;
            const startTime = Date.now();
            const startTop = 60;
            const endTop = 40;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentTop = startTop - (startTop - endTop) * progress;
                potionEffect.style.top = `${currentTop}%`;
                potionEffect.style.opacity = `${1 - progress}`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    potionEffect.remove();
                    resolve();
                }
            };
            
            animate();
        });
    }

    /**
     * Play Attack Boost Animation
     * Shows attack boost effect on the hero
     */
    async playAttackBoostAnimation() {
        const heroSprite = document.getElementById('heroSprite');
        if (!heroSprite) return;
        
        const battleContainer = document.querySelector('.battle-container');
        if (!battleContainer) return;
        
        // Create attack boost animation element
        const boostEffect = document.createElement('img');
        boostEffect.src = 'assets/battle-items/Attack Boost Animation.gif';
        boostEffect.style.cssText = `
            position: absolute;
            width: 80px;
            height: 80px;
            left: 25%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            image-rendering: pixelated;
            pointer-events: none;
            opacity: 1;
        `;
        
        battleContainer.appendChild(boostEffect);
        
        // Show for duration then fade out
        return new Promise(resolve => {
            setTimeout(() => {
                boostEffect.style.transition = 'opacity 0.3s';
                boostEffect.style.opacity = '0';
                setTimeout(() => {
                    boostEffect.remove();
                    resolve();
                }, 300);
            }, 700);
        });
    }

    /**
     * Play Defense Boost Animation
     * Shows shield effect on the hero
     */
    async playDefenseBoostAnimation() {
        const heroSprite = document.getElementById('heroSprite');
        if (!heroSprite) return;
        
        const battleContainer = document.querySelector('.battle-container');
        if (!battleContainer) return;
        
        // Create defense boost effect (using energy vacuum as shield effect)
        const shieldEffect = document.createElement('img');
        shieldEffect.src = 'assets/battle-items/Energy Vacuum.gif';
        shieldEffect.style.cssText = `
            position: absolute;
            width: 96px;
            height: 96px;
            left: 25%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            image-rendering: pixelated;
            pointer-events: none;
            opacity: 0.9;
        `;
        
        battleContainer.appendChild(shieldEffect);
        
        // Pulse and fade out
        return new Promise(resolve => {
            setTimeout(() => {
                shieldEffect.style.transition = 'opacity 0.3s, transform 0.3s';
                shieldEffect.style.opacity = '0';
                shieldEffect.style.transform = 'translate(-50%, -50%) scale(1.3)';
                setTimeout(() => {
                    shieldEffect.remove();
                    resolve();
                }, 300);
            }, 700);
        });
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


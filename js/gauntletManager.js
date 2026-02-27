/**
 * gauntletManager.js — Monster Arena Gauntlet
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the Gauntlet mini-game: wave-based endless battles, enemy scaling,
 * XP/coin rewards, gauntlet item effects, 20% task-completion trigger, and
 * first-time onboarding modals (same pattern as battleTutorial.js).
 *
 * Integration points:
 *   • window.gauntletManager  — exposed globally
 *   • window.maybeTriggerGauntlet(source) — called from completeTask / completeQuickTask
 *   • BattleManager.startBattle(enemy, { gauntletWave, onComplete }) — wave callback
 *   • window.audioManager.playBattleMusic(trackIndex) — random battle music
 *   • window.gameState.gauntlet — persistent state
 */

'use strict';

class GauntletManager {

    // ─── Constants ───────────────────────────────────────────────────────────

    static TUTORIAL_KEY = 'gauntlet_tutorial_shown_v1';

    // XP reward per wave cleared (base; multiplied by xp_boost if active)
    static BASE_XP_PER_WAVE = 15;
    // Coin reward per wave cleared (base; multiplied by loot_boost if active)
    static BASE_COINS_PER_WAVE = 8;
    // Boss wave interval
    static BOSS_WAVE_INTERVAL = 10;
    // Trigger probability on task completion (20%)
    static TRIGGER_CHANCE = 0.20;

    // Enemy tier thresholds: { minWave, tier }
    static WAVE_TIERS = [
        { minWave: 1,  tier: 1, label: 'Tier 1 — Rookie Enemies' },
        { minWave: 6,  tier: 2, label: 'Tier 2 — Seasoned Enemies' },
        { minWave: 11, tier: 3, label: 'Tier 3 — Elite Enemies' },
        { minWave: 21, tier: 4, label: 'Tier 4 — Legendary Enemies' },
        { minWave: 31, tier: 5, label: 'Tier 5 — Mythic Enemies' },
    ];

    // HP scaling per wave (additive bonus on top of base enemy HP)
    static HP_SCALE_PER_WAVE = 6;
    // Attack scaling per wave
    static ATK_SCALE_PER_WAVE = 2;

    // Tutorial slides (same structure as battleTutorial.js)
    static TUTORIAL_SLIDES = [
        {
            icon: '🏟️',
            title: 'Welcome to the Monster Arena!',
            body: 'The Gauntlet is an endless wave-based battle mode. Fight as many enemies as you can — each wave gets harder. Your best wave is saved forever!'
        },
        {
            icon: '🌊',
            title: 'Waves & Bosses',
            body: 'Enemies grow stronger every wave. Every 10th wave is a Boss Wave — a much tougher enemy with boosted stats. Survive as long as possible!'
        },
        {
            icon: '🛒',
            title: 'Gauntlet Items',
            body: 'Buy special Gauntlet items in the Shop:\n✨ XP Booster — 2× XP\n🛡 Shield Rune — survive one killing blow\n🔥 Elemental Orb — 3× damage on boss waves\n💎 Revive Crystal — resurrect with 50 HP\n💰 Loot Bag — 2× coin rewards'
        },
        {
            icon: '🎁',
            title: 'Rewards',
            body: 'You earn XP and coins for every wave you clear. The further you go, the bigger the reward. A bonus is added for reaching wave milestones (10, 20, 30…)!'
        },
        {
            icon: '🏟️',
            title: 'How to Trigger',
            body: 'You can start a run any time from the Arena tab. The Gauntlet also has a 20% chance to trigger automatically when you complete a task — so keep grinding!'
        }
    ];

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        this._isRunning   = false;
        this._currentWave = 0;
        this._totalXP     = 0;
        this._totalCoins  = 0;
        this._runEffects  = {};   // active effects for the current run
        this._usedRevive  = false;
        this._musicTrack  = null;
        this._runHistory  = this._loadRunHistory();
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    /** Called when user taps "Enter the Arena" button or via 20% trigger */
    async startRun(fromTrigger = false) {
        if (this._isRunning) return;

        // Show onboarding if first time
        if (!localStorage.getItem(GauntletManager.TUTORIAL_KEY)) {
            const proceed = await this._showTutorial();
            if (!proceed) return;
            localStorage.setItem(GauntletManager.TUTORIAL_KEY, '1');
        }

        // Consume gauntlet items from inventory
        this._runEffects  = this._consumeGauntletItems();
        this._isRunning   = true;
        this._currentWave = 0;
        this._totalXP     = 0;
        this._totalCoins  = 0;
        this._usedRevive  = false;

        // Pick a random battle music track and play it
        this._playRandomMusic();

        // Update gameState run count
        const gs = window.gameState;
        if (gs && gs.gauntlet) {
            gs.gauntlet.totalRuns = (gs.gauntlet.totalRuns || 0) + 1;
            gs.gauntlet.lastRunTimestamp = Date.now();
        }

        this.refreshUI();
        this._advanceWave();
    }

    /** Refresh the Arena tab UI with current stats */
    refreshUI() {
        const gs = window.gameState;
        if (!gs || !gs.gauntlet) return;

        const el = id => document.getElementById(id);

        // Stats
        this._setText('gauntletHighestWave', gs.gauntlet.highestWave || 0);
        this._setText('gauntletWeeklyBest',  this._getWeeklyBest());
        this._setText('gauntletTotalRuns',   gs.gauntlet.totalRuns || 0);

        // Active effects chips
        const effectsRow = el('gauntletActiveEffects');
        if (effectsRow) {
            effectsRow.innerHTML = '';
            const inv = gs.battleInventory || {};
            const chips = [
                { key: 'xp_booster',    emoji: '✨', label: 'XP Boost' },
                { key: 'shield_rune',   emoji: '🛡', label: 'Shield Rune' },
                { key: 'elemental_orb', emoji: '🔥', label: 'Elemental Orb' },
                { key: 'revive_crystal',emoji: '💎', label: 'Revive Crystal' },
                { key: 'loot_bag',      emoji: '💰', label: 'Loot Bag' },
            ];
            chips.forEach(c => {
                const qty = inv[c.key] || 0;
                if (qty > 0) {
                    const chip = document.createElement('div');
                    chip.className = 'gauntlet-effect-chip';
                    chip.textContent = `${c.emoji} ${c.label} ×${qty}`;
                    effectsRow.appendChild(chip);
                }
            });
        }

        // Wave info (only shown during a run)
        const waveInfo = el('gauntletWaveInfo');
        if (waveInfo) waveInfo.style.display = this._isRunning ? 'block' : 'none';
        if (this._isRunning) {
            this._setText('gauntletCurrentWave', this._currentWave);
            this._setText('gauntletWaveSubLabel', this._getWaveTierLabel(this._currentWave));
        }

        // Start button
        const btn = el('gauntletStartBtn');
        if (btn) {
            btn.disabled = this._isRunning;
            btn.textContent = this._isRunning ? `⚔️ Wave ${this._currentWave} in progress…` : '⚔️ Enter the Arena';
        }

        // Run history
        this._renderRunHistory();
    }

    // ─── Wave Engine ─────────────────────────────────────────────────────────

    _advanceWave() {
        this._currentWave++;
        const isBoss = (this._currentWave % GauntletManager.BOSS_WAVE_INTERVAL === 0);
        const enemy  = this._buildWaveEnemy(this._currentWave, isBoss);

        // Show wave transition banner
        this._showWaveBanner(this._currentWave, enemy.name, isBoss);

        // Update UI
        this.refreshUI();

        // Start the battle after the banner animation (1.8 s)
        setTimeout(() => {
            this._launchBattle(enemy, isBoss);
        }, 1900);
    }

    _launchBattle(enemy, isBoss) {
        const manager = window.battleManager;
        if (!manager) {
            console.warn('[Gauntlet] battleManager not found');
            this._endRun(false);
            return;
        }

        // Apply boss_slayer effect: triple damage on boss waves
        if (isBoss && this._runEffects.boss_slayer) {
            enemy._gauntletBossSlayer = true;
        }

        manager.startBattle(enemy, {
            gauntletWave: this._currentWave,
            isBossWave:   isBoss,
            onComplete:   (result) => this._onWaveComplete(result, isBoss),
        });
    }

    _onWaveComplete(result, isBoss) {
        if (result === 'victory') {
            // Award wave rewards
            const xpMult   = this._runEffects.xp_boost   ? 2 : 1;
            const coinMult = this._runEffects.loot_boost  ? 2 : 1;
            const bossBonus = isBoss ? 3 : 1;

            const xpEarned    = Math.round(GauntletManager.BASE_XP_PER_WAVE   * xpMult   * bossBonus * (1 + this._currentWave * 0.1));
            const coinsEarned = Math.round(GauntletManager.BASE_COINS_PER_WAVE * coinMult * bossBonus * (1 + this._currentWave * 0.05));

            this._totalXP    += xpEarned;
            this._totalCoins += coinsEarned;

            // Update highest wave
            const gs = window.gameState;
            if (gs && gs.gauntlet) {
                if (this._currentWave > (gs.gauntlet.highestWave || 0)) {
                    gs.gauntlet.highestWave = this._currentWave;
                }
                gs.gauntlet.totalWavesCleared = (gs.gauntlet.totalWavesCleared || 0) + 1;
            }

            // Continue to next wave
            this._advanceWave();

        } else {
            // Defeat — check for revive crystal
            if (this._runEffects.revive && !this._usedRevive) {
                this._usedRevive = true;
                this._runEffects.revive = false;
                this._triggerRevive();
            } else {
                this._endRun(false);
            }
        }
    }

    _triggerRevive() {
        // Heal player to 50 HP and continue
        const gs = window.gameState;
        if (gs) gs.health = 50;
        if (window.updateHealthBar) window.updateHealthBar();

        this._showReviveBanner(() => {
            this._advanceWave();
        });
    }

    _endRun(abandoned = false) {
        this._isRunning = false;

        // Stop music
        if (window.audioManager && window.audioManager.stopBattleMusic) {
            window.audioManager.stopBattleMusic();
        }

        // Update weekly high score
        const gs = window.gameState;
        if (gs && gs.gauntlet) {
            if (this._currentWave > (gs.gauntlet.weeklyHighScore || 0)) {
                gs.gauntlet.weeklyHighScore = this._currentWave;
            }
        }

        // Award total XP and coins
        const milestone = this._getMilestoneBonus(this._currentWave);
        const finalXP    = this._totalXP    + milestone.xp;
        const finalCoins = this._totalCoins + milestone.coins;

        if (finalXP > 0 && typeof window.addJerryXP === 'function') {
            window.addJerryXP(finalXP);
        }
        if (finalCoins > 0 && gs) {
            gs.xpCoins = (gs.xpCoins || 0) + finalCoins;
            if (typeof window.updateXPDisplay === 'function') window.updateXPDisplay();
        }

        // Save run to history
        this._saveRunEntry(this._currentWave, finalXP, finalCoins);

        // Save game state
        if (typeof window.saveGameState === 'function') window.saveGameState();

        if (!abandoned) {
            this._showResultModal(this._currentWave, finalXP, finalCoins, milestone);
        }

        this.refreshUI();
    }

    // ─── Enemy Building ───────────────────────────────────────────────────────

    _buildWaveEnemy(wave, isBoss) {
        const tier    = this._getTierForWave(wave);
        const baseEnemy = this._pickEnemyForTier(tier, isBoss);

        // Deep-clone so we don't mutate the template
        const enemy = JSON.parse(JSON.stringify(baseEnemy));

        // Scale stats
        const scale = wave - 1;
        enemy.hp    = Math.round((enemy.hp    || 80)  + scale * GauntletManager.HP_SCALE_PER_WAVE);
        enemy.maxHp = enemy.hp;
        enemy.attack = Math.round((enemy.attack || 10) + scale * GauntletManager.ATK_SCALE_PER_WAVE);

        // Boss waves: additional 50% stat boost
        if (isBoss) {
            enemy.hp     = Math.round(enemy.hp     * 1.5);
            enemy.maxHp  = enemy.hp;
            enemy.attack = Math.round(enemy.attack * 1.5);
            enemy.name   = `👹 ${enemy.name}`;
            enemy.isBossWaveEnemy = true;
        }

        enemy._gauntletWave = wave;
        return enemy;
    }

    _getTierForWave(wave) {
        let tier = 1;
        for (const t of GauntletManager.WAVE_TIERS) {
            if (wave >= t.minWave) tier = t.tier;
        }
        return tier;
    }

    _pickEnemyForTier(tier, isBoss) {
        // Use BATTLE_ENEMIES / BOSS_ENEMIES from the existing enemy system
        const allEnemies = (typeof BATTLE_ENEMIES !== 'undefined') ? Object.values(BATTLE_ENEMIES) : [];
        const bossEnemies = (typeof BOSS_ENEMIES   !== 'undefined') ? Object.values(BOSS_ENEMIES)  : [];

        if (isBoss && bossEnemies.length > 0) {
            // Pick a random boss
            return bossEnemies[Math.floor(Math.random() * bossEnemies.length)];
        }

        // Filter by tier (use minLevel as a proxy: tier 1 = minLevel 1-5, etc.)
        const tierMinLevel = (tier - 1) * 5 + 1;
        const tierMaxLevel = tier * 5;
        let pool = allEnemies.filter(e => {
            const ml = e.minLevel || 1;
            return ml >= tierMinLevel && ml <= tierMaxLevel;
        });

        // Fallback: use any enemy if pool is empty
        if (pool.length === 0) pool = allEnemies;
        if (pool.length === 0) {
            // Ultimate fallback: synthesise a generic enemy
            return {
                id: `gauntlet_enemy_${tier}`,
                name: `Wave ${this._currentWave} Enemy`,
                emoji: '👾',
                hp: 80 + tier * 20,
                maxHp: 80 + tier * 20,
                attack: 8 + tier * 3,
                defense: 2 + tier,
                minLevel: tierMinLevel,
                tier: tier,
                xpReward: 10 * tier,
                coinReward: 5 * tier,
            };
        }

        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ─── Gauntlet Item Consumption ────────────────────────────────────────────

    _consumeGauntletItems() {
        const gs  = window.gameState;
        const inv = gs ? (gs.battleInventory || {}) : {};
        const effects = {
            xp_boost:    false,
            death_shield: false,
            boss_slayer:  false,
            revive:       false,
            loot_boost:   false,
        };

        const consume = (key, effectKey) => {
            if ((inv[key] || 0) > 0) {
                inv[key]--;
                effects[effectKey] = true;
            }
        };

        consume('xp_booster',     'xp_boost');
        consume('shield_rune',    'death_shield');
        consume('elemental_orb',  'boss_slayer');
        consume('revive_crystal', 'revive');
        consume('loot_bag',       'loot_boost');

        // Sync to gauntlet activeEffects
        if (gs && gs.gauntlet) {
            gs.gauntlet.activeEffects = { ...effects };
        }

        return effects;
    }

    // ─── Rewards ─────────────────────────────────────────────────────────────

    _getMilestoneBonus(wave) {
        // Bonus XP and coins for reaching wave milestones
        const milestones = [
            { wave: 5,  xp: 50,   coins: 25  },
            { wave: 10, xp: 150,  coins: 75  },
            { wave: 20, xp: 400,  coins: 200 },
            { wave: 30, xp: 800,  coins: 400 },
            { wave: 50, xp: 2000, coins: 1000 },
        ];
        let bonus = { xp: 0, coins: 0 };
        for (const m of milestones) {
            if (wave >= m.wave) bonus = { xp: m.xp, coins: m.coins };
        }
        return bonus;
    }

    // ─── Music ────────────────────────────────────────────────────────────────

    _playRandomMusic() {
        if (!window.audioManager) return;
        try {
            // Pick a random track index from the battle music list
            const trackCount = (window.audioManager.battleTracks || []).length || 5;
            const trackIndex = Math.floor(Math.random() * trackCount);
            if (typeof window.audioManager.playBattleMusic === 'function') {
                window.audioManager.playBattleMusic(trackIndex);
            }
        } catch (e) {
            // Silently ignore audio errors
        }
    }

    // ─── 20% Task-Completion Trigger ─────────────────────────────────────────

    maybeAutoTrigger(source) {
        if (this._isRunning) return false;
        if (Math.random() > GauntletManager.TRIGGER_CHANCE) return false;

        // Small delay so the task completion animation finishes first
        setTimeout(() => {
            this._showAutoTriggerPrompt(source);
        }, 2500);
        return true;
    }

    _showAutoTriggerPrompt(source) {
        const overlay = document.createElement('div');
        overlay.className = 'gauntlet-result-overlay';
        overlay.innerHTML = `
            <div class="gauntlet-result-modal" style="max-width:320px;">
                <span class="gauntlet-result-icon">🏟️</span>
                <div class="gauntlet-result-title">Arena Challenge!</div>
                <div class="gauntlet-result-sub" style="margin-bottom:20px;">
                    Your task completion has triggered a Monster Arena Gauntlet challenge!<br><br>
                    Do you want to enter the Arena now?
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="gauntlet-result-btn" style="flex:1;background:linear-gradient(135deg,#7c3aed,#4f46e5);"
                        id="gauntletAutoAccept">⚔️ Enter Arena</button>
                    <button class="gauntlet-result-btn" style="flex:1;background:rgba(255,255,255,0.1);color:#ccc;"
                        id="gauntletAutoDecline">Not Now</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        document.getElementById('gauntletAutoAccept').onclick = () => {
            overlay.remove();
            this.startRun(true);
        };
        document.getElementById('gauntletAutoDecline').onclick = () => {
            overlay.remove();
        };
    }

    // ─── Onboarding Tutorial ─────────────────────────────────────────────────

    _showTutorial() {
        return new Promise(resolve => {
            let slideIndex = 0;
            const slides = GauntletManager.TUTORIAL_SLIDES;

            const overlay = document.createElement('div');
            overlay.className = 'gauntlet-tutorial-overlay';
            document.body.appendChild(overlay);

            const render = () => {
                const s = slides[slideIndex];
                const isLast = slideIndex === slides.length - 1;
                overlay.innerHTML = `
                    <div class="gauntlet-tutorial-modal">
                        <button onclick="this.closest('.gauntlet-tutorial-overlay').remove()" 
                            style="position:absolute;top:12px;right:16px;background:none;border:none;color:#a78bfa;font-size:22px;cursor:pointer;z-index:1;">✕</button>
                        <div style="font-size:52px;margin-bottom:12px;">${s.icon}</div>
                        <div style="font-size:19px;font-weight:800;color:#e9d5ff;margin-bottom:10px;">${s.title}</div>
                        <div style="font-size:14px;color:#c4b5fd;line-height:1.6;margin-bottom:20px;white-space:pre-line;">${s.body}</div>
                        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:18px;">
                            ${slides.map((_, i) => `<div style="width:8px;height:8px;border-radius:50%;background:${i===slideIndex?'#a78bfa':'rgba(167,139,250,0.3)'};"></div>`).join('')}
                        </div>
                        <div style="display:flex;gap:10px;">
                            ${slideIndex > 0 ? `<button id="gtPrev" class="gauntlet-result-btn" style="flex:1;background:rgba(255,255,255,0.1);color:#ccc;">← Back</button>` : ''}
                            <button id="gtNext" class="gauntlet-result-btn" style="flex:${slideIndex>0?1:1};">
                                ${isLast ? '⚔️ Start Run!' : 'Next →'}
                            </button>
                        </div>
                    </div>`;

                overlay.querySelector('#gtNext').onclick = () => {
                    if (isLast) { overlay.remove(); resolve(true); }
                    else { slideIndex++; render(); }
                };
                const prev = overlay.querySelector('#gtPrev');
                if (prev) prev.onclick = () => { slideIndex--; render(); };
                // X button resolves false (cancel)
                overlay.querySelector('button[style*="position:absolute"]').onclick = () => {
                    overlay.remove(); resolve(false);
                };
            };
            render();
        });
    }

    // ─── Wave Transition Banner ───────────────────────────────────────────────

    _showWaveBanner(wave, enemyName, isBoss) {
        const banner = document.createElement('div');
        banner.className = 'gauntlet-wave-banner';
        banner.innerHTML = `
            <div class="gauntlet-wave-banner-inner">
                <div class="gauntlet-wave-banner-label">${isBoss ? '👹 BOSS WAVE' : 'WAVE'}</div>
                <div class="gauntlet-wave-banner-number">${wave}</div>
                <div class="gauntlet-wave-banner-enemy">${enemyName}</div>
            </div>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 2000);
    }

    // ─── Revive Banner ────────────────────────────────────────────────────────

    _showReviveBanner(onDone) {
        const banner = document.createElement('div');
        banner.className = 'gauntlet-result-overlay';
        banner.innerHTML = `
            <div class="gauntlet-result-modal" style="max-width:300px;">
                <span class="gauntlet-result-icon">💎</span>
                <div class="gauntlet-result-title">Revive Crystal!</div>
                <div class="gauntlet-result-sub">Your Revive Crystal shattered — you've been restored to 50 HP! The battle continues…</div>
            </div>`;
        document.body.appendChild(banner);
        setTimeout(() => { banner.remove(); onDone(); }, 2200);
    }

    // ─── Result Modal ─────────────────────────────────────────────────────────

    _showResultModal(wave, xp, coins, milestone) {
        const isNewBest = wave >= (window.gameState?.gauntlet?.highestWave || 0);
        const overlay = document.createElement('div');
        overlay.className = 'gauntlet-result-overlay';
        overlay.innerHTML = `
            <div class="gauntlet-result-modal">
                <span class="gauntlet-result-icon">${isNewBest ? '🏆' : '⚔️'}</span>
                <div class="gauntlet-result-title">${isNewBest ? 'New Record!' : 'Run Complete!'}</div>
                <div class="gauntlet-result-wave">${wave}</div>
                <div class="gauntlet-result-sub">Waves Cleared</div>
                <div class="gauntlet-result-rewards">
                    <div class="gauntlet-result-reward-row">
                        <span>✨ XP Earned</span>
                        <span class="gauntlet-result-reward-val">+${xp}</span>
                    </div>
                    <div class="gauntlet-result-reward-row">
                        <span>💰 Coins Earned</span>
                        <span class="gauntlet-result-reward-val">+${coins}</span>
                    </div>
                    ${milestone.xp > 0 ? `
                    <div class="gauntlet-result-reward-row" style="border-top:1px solid rgba(124,58,237,0.3);margin-top:6px;padding-top:6px;">
                        <span>🎯 Milestone Bonus</span>
                        <span class="gauntlet-result-reward-val">+${milestone.xp} XP / +${milestone.coins} coins</span>
                    </div>` : ''}
                </div>
                <button class="gauntlet-result-btn" id="gauntletResultClose">Continue</button>
            </div>`;
        document.body.appendChild(overlay);
        document.getElementById('gauntletResultClose').onclick = () => {
            overlay.remove();
            this.refreshUI();
        };
    }

    // ─── Run History ─────────────────────────────────────────────────────────

    _loadRunHistory() {
        try {
            return JSON.parse(localStorage.getItem('gauntlet_run_history') || '[]');
        } catch { return []; }
    }

    _saveRunEntry(wave, xp, coins) {
        this._runHistory.unshift({
            wave,
            xp,
            coins,
            date: new Date().toLocaleDateString()
        });
        // Keep last 20 runs
        this._runHistory = this._runHistory.slice(0, 20);
        try {
            localStorage.setItem('gauntlet_run_history', JSON.stringify(this._runHistory));
        } catch { /* storage full */ }
    }

    _renderRunHistory() {
        const container = document.getElementById('gauntletRunHistory');
        if (!container) return;
        if (this._runHistory.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:16px;">No runs yet. Enter the Arena!</p>';
            return;
        }
        container.innerHTML = this._runHistory.map(r => `
            <div class="gauntlet-run-entry">
                <span class="gauntlet-run-wave">Wave ${r.wave}</span>
                <span class="gauntlet-run-xp">+${r.xp} XP / +${r.coins} coins</span>
                <span class="gauntlet-run-date">${r.date}</span>
            </div>`).join('');
    }

    // ─── Weekly High Score ────────────────────────────────────────────────────

    _getWeeklyBest() {
        const gs = window.gameState;
        if (!gs || !gs.gauntlet) return 0;
        // Reset weekly score if last run was more than 7 days ago
        const last = gs.gauntlet.lastRunTimestamp;
        if (last && (Date.now() - last) > 7 * 24 * 60 * 60 * 1000) {
            gs.gauntlet.weeklyHighScore = 0;
        }
        return gs.gauntlet.weeklyHighScore || 0;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    _getWaveTierLabel(wave) {
        let label = 'Tier 1 — Rookie Enemies';
        for (const t of GauntletManager.WAVE_TIERS) {
            if (wave >= t.minWave) label = t.label;
        }
        return label;
    }

    _setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    window.gauntletManager = new GauntletManager();

    // Expose the 20% trigger function for completeTask / completeQuickTask
    window.maybeTriggerGauntlet = (source) => {
        return window.gauntletManager.maybeAutoTrigger(source);
    };
});

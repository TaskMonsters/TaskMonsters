/**
 * Battle Trigger System
 * Blueprint v2.0 Section 1.1: 35% base chance, 50% with Battle Mode enabled
 */

class BattleTrigger {
    constructor() {
        this.baseChance = 0.35;  // 35% base chance
        this.boostedChance = 0.50;  // 50% with Battle Mode enabled
    }

    /**
     * Determine if a battle should be triggered
     * @returns {boolean} True if battle should trigger
     */
    shouldTriggerBattle() {
        // Check if Battle Mode is enabled in settings
        const battleModeEnabled = gameState?.battleModeEnabled || false;
        
        // Use boosted chance if Battle Mode is enabled, otherwise use base chance
        const chance = battleModeEnabled ? this.boostedChance : this.baseChance;
        
        // Roll the dice
        const roll = Math.random();
        const shouldTrigger = roll < chance;
        
        console.log(`Battle Trigger: Mode=${battleModeEnabled ? 'Boosted' : 'Base'}, Chance=${(chance * 100)}%, Roll=${(roll * 100).toFixed(1)}%, Trigger=${shouldTrigger}`);
        
        return shouldTrigger;
    }

    /**
     * Get the current battle trigger chance as a percentage
     * @returns {number} Chance as percentage (35 or 50)
     */
    getCurrentChance() {
        const battleModeEnabled = gameState?.battleModeEnabled || false;
        return battleModeEnabled ? 50 : 35;
    }

    /**
     * Enable Battle Mode (50% chance)
     */
    enableBattleMode() {
        if (gameState) {
            gameState.battleModeEnabled = true;
            saveGameState();
            console.log('Battle Mode enabled: 50% battle chance');
        }
    }

    /**
     * Disable Battle Mode (35% chance)
     */
    disableBattleMode() {
        if (gameState) {
            gameState.battleModeEnabled = false;
            saveGameState();
            console.log('Battle Mode disabled: 35% battle chance');
        }
    }

    /**
     * Toggle Battle Mode
     */
    toggleBattleMode() {
        if (gameState) {
            gameState.battleModeEnabled = !gameState.battleModeEnabled;
            saveGameState();
            const mode = gameState.battleModeEnabled ? 'enabled (50%)' : 'disabled (35%)';
            console.log(`Battle Mode ${mode}`);
            return gameState.battleModeEnabled;
        }
        return false;
    }
}

// Create singleton instance
const battleTrigger = new BattleTrigger();

// Expose globally
window.battleTrigger = battleTrigger;

console.log('Battle Trigger System initialized (35% base / 50% boosted)');

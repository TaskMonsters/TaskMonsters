// ===================================
// LOOT DROP SYSTEM
// Handles enemy loot drops and inventory management
// ===================================

class LootSystem {
    constructor() {
        this.lootTables = this.initializeLootTables();
    }

    // Initialize loot tables for different enemy tiers
    initializeLootTables() {
        return {
            // Early game enemies (Level 1-4)
            early: {
                dropChance: 0.6, // 60% chance to drop something
                items: [
                    { id: 'health_potion', weight: 40, minQty: 1, maxQty: 2 },
                    { id: 'attack_refill', weight: 30, minQty: 1, maxQty: 1 },
                    { id: 'defense_refill', weight: 30, minQty: 1, maxQty: 1 }
                ]
            },
            // Mid game enemies (Level 5-9)
            mid: {
                dropChance: 0.7, // 70% chance
                items: [
                    { id: 'health_potion', weight: 30, minQty: 1, maxQty: 2 },
                    { id: 'attack_refill', weight: 25, minQty: 1, maxQty: 2 },
                    { id: 'defense_refill', weight: 25, minQty: 1, maxQty: 2 },
                    { id: 'fireball', weight: 15, minQty: 1, maxQty: 1 },
                    { id: 'spark', weight: 5, minQty: 1, maxQty: 1 }
                ]
            },
            // Late game enemies (Level 10+)
            late: {
                dropChance: 0.8, // 80% chance
                items: [
                    { id: 'health_potion', weight: 25, minQty: 2, maxQty: 3 },
                    { id: 'hyper_potion', weight: 10, minQty: 1, maxQty: 1 },
                    { id: 'attack_refill', weight: 20, minQty: 1, maxQty: 2 },
                    { id: 'defense_refill', weight: 20, minQty: 1, maxQty: 2 },
                    { id: 'fireball', weight: 10, minQty: 1, maxQty: 2 },
                    { id: 'spark', weight: 5, minQty: 1, maxQty: 2 },
                    { id: 'prickler', weight: 5, minQty: 1, maxQty: 1 },
                    { id: 'freeze', weight: 5, minQty: 1, maxQty: 1 }
                ]
            },
            // Boss enemies
            boss: {
                dropChance: 1.0, // 100% chance - bosses always drop
                items: [
                    { id: 'health_potion', weight: 20, minQty: 2, maxQty: 4 },
                    { id: 'hyper_potion', weight: 15, minQty: 1, maxQty: 2 },
                    { id: 'attack_refill', weight: 15, minQty: 2, maxQty: 3 },
                    { id: 'defense_refill', weight: 15, minQty: 2, maxQty: 3 },
                    { id: 'fireball', weight: 10, minQty: 2, maxQty: 3 },
                    { id: 'spark', weight: 5, minQty: 1, maxQty: 2 },
                    { id: 'prickler', weight: 5, minQty: 1, maxQty: 2 },
                    { id: 'freeze', weight: 5, minQty: 1, maxQty: 2 },
                    { id: 'blue_flame', weight: 5, minQty: 1, maxQty: 1 },
                    { id: 'invisibility_cloak', weight: 3, minQty: 1, maxQty: 1 },
                    { id: 'procrastination_ghost', weight: 2, minQty: 1, maxQty: 1 }
                ]
            }
        };
    }

    // Generate loot drops for defeated enemy
    generateLoot(enemy) {
        const tier = enemy.tier || 'early';
        const lootTable = this.lootTables[tier];
        
        if (!lootTable) {
            console.warn(`Unknown enemy tier: ${tier}`);
            return [];
        }

        // Check if enemy drops anything
        if (Math.random() > lootTable.dropChance) {
            return []; // No drops this time
        }

        // Calculate how many items to drop (1-3 items based on tier)
        let numDrops = 1;
        if (tier === 'mid') numDrops = Math.random() < 0.4 ? 2 : 1;
        if (tier === 'late') numDrops = Math.random() < 0.6 ? 2 : (Math.random() < 0.3 ? 3 : 1);
        if (tier === 'boss') numDrops = Math.random() < 0.8 ? 3 : 2;

        const drops = [];
        const droppedItems = new Set(); // Prevent duplicate item types in single drop

        for (let i = 0; i < numDrops; i++) {
            const item = this.selectRandomItem(lootTable.items);
            if (item && !droppedItems.has(item.id)) {
                const quantity = Math.floor(Math.random() * (item.maxQty - item.minQty + 1)) + item.minQty;
                drops.push({
                    id: item.id,
                    quantity: quantity
                });
                droppedItems.add(item.id);
            }
        }

        return drops;
    }

    // Select random item based on weighted probability
    selectRandomItem(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= item.weight;
            if (random <= 0) {
                return item;
            }
        }

        return items[0]; // Fallback
    }

    // Add loot to player's battle inventory (BACKEND FUNCTION)
    addLootToInventory(drops) {
        if (!window.gameState.battleInventory) {
            window.gameState.battleInventory = {
                fireball: 0,
                spark: 0,
                health_potion: 0,
                hyper_potion: 0,
                attack_refill: 0,
                defense_refill: 0,
                invisibility_cloak: 0,
                prickler: 0,
                freeze: 0,
                blue_flame: 0,
                procrastination_ghost: 0
            };
        }

        // Add each dropped item to inventory
        drops.forEach(drop => {
            if (window.gameState.battleInventory.hasOwnProperty(drop.id)) {
                window.gameState.battleInventory[drop.id] += drop.quantity;
                console.log(`✅ Added ${drop.quantity}x ${drop.id} to battle inventory`);
            } else {
                console.warn(`Unknown item ID: ${drop.id}`);
            }
        });

        // Unlock items in battle if not already unlocked
        if (!window.gameState.unlockedBattleItems) {
            window.gameState.unlockedBattleItems = ['health_potion', 'attack_refill', 'defense_refill'];
        }

        drops.forEach(drop => {
            if (!window.gameState.unlockedBattleItems.includes(drop.id)) {
                window.gameState.unlockedBattleItems.push(drop.id);
                console.log(`🔓 Unlocked ${drop.id} for battle use`);
            }
        });

        // Save game state
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
    }

    // Get item display name and emoji
    getItemDisplayInfo(itemId) {
        const itemInfo = {
            health_potion: { name: 'Health Potion', emoji: '💚' },
            hyper_potion: { name: 'Hyper Potion', emoji: '❤️‍🩹' },
            attack_refill: { name: 'Attack Refill', emoji: '⚡' },
            defense_refill: { name: 'Defense Refill', emoji: '🛡️' },
            fireball: { name: 'Fireball', emoji: '🔥' },
            spark: { name: 'Spark', emoji: '⚡' },
            prickler: { name: 'Prickler', emoji: '💣' },
            freeze: { name: 'Freeze', emoji: '❄️' },
            blue_flame: { name: 'Blue Flame', emoji: '🔵' },
            invisibility_cloak: { name: 'Invisibility Cloak', emoji: '🥷' },
            procrastination_ghost: { name: 'Procrastination Ghost', emoji: '👻' }
        };

        return itemInfo[itemId] || { name: itemId, emoji: '❓' };
    }

    // Show loot drop modal
    showLootModal(drops, xpGained, enemyName) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'lootModalOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
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
            border: 3px solid #ffd700;
            border-radius: 16px;
            padding: 20px;
            max-width: 340px;
            width: 85%;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            animation: scaleIn 0.3s ease-out;
            color: white;
            text-align: center;
        `;

        // Victory title
        const title = document.createElement('h2');
        title.textContent = '🎉 VICTORY! 🎉';
        title.style.cssText = `
            font-size: 28px;
            margin: 0 0 8px 0;
            color: #ffd700;
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
        `;

        // Enemy defeated text
        const enemyText = document.createElement('p');
        enemyText.textContent = `You defeated the ${enemyName}!`;
        enemyText.style.cssText = `
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #e0e0e0;
        `;

        // XP gained
        const xpText = document.createElement('div');
        xpText.textContent = `✨ +${xpGained} XP`;
        xpText.style.cssText = `
            font-size: 20px;
            margin: 0 0 16px 0;
            color: #9acd32;
            font-weight: bold;
        `;

        modal.appendChild(title);
        modal.appendChild(enemyText);
        modal.appendChild(xpText);

        // Loot section
        if (drops.length > 0) {
            const lootTitle = document.createElement('h3');
            lootTitle.textContent = '💎 Loot Drops';
            lootTitle.style.cssText = `
                font-size: 20px;
                margin: 0 0 10px 0;
                color: #00d4ff;
            `;
            modal.appendChild(lootTitle);

            const lootContainer = document.createElement('div');
            lootContainer.style.cssText = `
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 14px;
            `;

            drops.forEach(drop => {
                const info = this.getItemDisplayInfo(drop.id);
                const lootItem = document.createElement('div');
                lootItem.style.cssText = `
                    font-size: 17px;
                    margin: 6px 0;
                    color: #ffffff;
                    animation: slideInLeft 0.4s ease-out;
                `;
                lootItem.textContent = `${info.emoji} ${info.name} x${drop.quantity}`;
                lootContainer.appendChild(lootItem);
            });

            modal.appendChild(lootContainer);
        } else {
            const noLoot = document.createElement('p');
            noLoot.textContent = 'No items dropped this time.';
            noLoot.style.cssText = `
                font-size: 18px;
                margin: 0 0 20px 0;
                color: #999;
                font-style: italic;
            `;
            modal.appendChild(noLoot);
        }

        // Continue button
        const continueBtn = document.createElement('button');
        continueBtn.textContent = 'Continue';
        continueBtn.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 32px;
            font-size: 17px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        `;

        continueBtn.onmouseover = () => {
            continueBtn.style.transform = 'scale(1.05)';
            continueBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        };

        continueBtn.onmouseout = () => {
            continueBtn.style.transform = 'scale(1)';
            continueBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        };

        continueBtn.onclick = () => {
            // FIX: Stop victory music when user clicks Continue
            if (window.audioManager) {
                window.audioManager.stopBattleOutcomeMusic();
            }
            overlay.remove();
            
            // FIX: Restart main app monster animation after battle
            if (window.spriteAnimationManager && window.skinsManager) {
                const baseMonster = window.gameState.baseMonster || 'cat';
                // FIX: Always get equippedSkinId from gameState to prevent skin unequip bug
                const equippedSkinId = window.gameState.equippedSkinId || window.skinsManager.equippedSkinId;
                // Sync skinsManager with gameState
                window.skinsManager.equippedSkinId = equippedSkinId;
                window.spriteAnimationManager.updateAllMonsterVisuals(baseMonster, equippedSkinId);
            }
            
            // FIX: Update HP display after battle
            if (typeof updateJerryDisplay === 'function') {
                updateJerryDisplay();
            }
        };

        modal.appendChild(continueBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add CSS animations
        if (!document.getElementById('lootModalStyles')) {
            const style = document.createElement('style');
            style.id = 'lootModalStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize global loot system
window.lootSystem = new LootSystem();

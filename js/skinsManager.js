/**
 * Skins Manager
 * Handles skin purchasing, equipping, and rendering across the app
 */

class SkinsManager {
    constructor() {
        this.ownedSkins = [];
        this.equippedSkinId = null;
        this.currentBaseMonster = null;
    }
    
    /**
     * Initialize skins system from saved state
     */
    init() {
        // Load from gameState
        if (window.gameState) {
            this.ownedSkins = window.gameState.ownedSkins || [];
            this.equippedSkinId = window.gameState.equippedSkinId || null;
        }
        
        // Get current base monster
        this.currentBaseMonster = localStorage.getItem('selectedMonster') || 'nova';
        
        console.log('[SkinsManager] Initialized:', {
            ownedSkins: this.ownedSkins,
            equippedSkinId: this.equippedSkinId,
            baseMonster: this.currentBaseMonster
        });
    }
    
    /**
     * Purchase a skin
     */
    purchaseSkin(skinId) {
        const skin = window.SKINS_CONFIG[skinId];
        if (!skin) {
            console.error('[SkinsManager] Skin not found:', skinId);
            return { success: false, message: 'Skin not found' };
        }
        
        const userLevel = window.gameState.jerryLevel || 1;
        const userXP = window.gameState.jerryXP || 0;
        
        // Check if can purchase
        const purchaseCheck = window.canPurchaseSkin(skinId, userLevel, userXP, this.ownedSkins);
        
        if (!purchaseCheck.canPurchase) {
            return { success: false, message: purchaseCheck.reason };
        }
        
        // Deduct XP
        window.gameState.jerryXP -= skin.price;
        
        // Add to owned skins
        if (!this.ownedSkins.includes(skinId)) {
            this.ownedSkins.push(skinId);
        }
        
        // Save to gameState
        window.gameState.ownedSkins = this.ownedSkins;
        window.saveGameState();
        
        console.log('[SkinsManager] Purchased skin:', skinId);
        
        return { 
            success: true, 
            message: `${skin.name} purchased!`,
            skinId: skinId
        };
    }
    
    /**
     * Equip a skin
     */
    equipSkin(skinId) {
        const skin = window.SKINS_CONFIG[skinId];
        if (!skin) {
            console.error('[SkinsManager] Skin not found:', skinId);
            return { success: false, message: 'Skin not found' };
        }
        
        // Check if owned
        if (!this.ownedSkins.includes(skinId)) {
            return { success: false, message: 'You don\'t own this skin' };
        }
        
        // Any skin can be equipped to any monster - no compatibility check
        
        // Equip the skin
        this.equippedSkinId = skinId;
        window.gameState.equippedSkinId = skinId;
        window.saveGameState();
        
        // Update all monster visuals
        this.updateAllMonsterVisuals();
        
        console.log('[SkinsManager] Equipped skin:', skinId);
        
        return { 
            success: true, 
            message: `${skin.name} equipped!`,
            skinId: skinId
        };
    }
    
    /**
     * Unequip current skin (revert to default)
     */
    unequipSkin() {
        this.equippedSkinId = null;
        window.gameState.equippedSkinId = null;
        window.saveGameState();
        
        // Update all monster visuals to default
        this.updateAllMonsterVisuals();
        
        console.log('[SkinsManager] Unequipped skin');
        
        return { success: true, message: 'Reverted to default appearance' };
    }
    
    /**
     * Update all monster visuals across the app
     */
    updateAllMonsterVisuals() {
        const appearance = window.getActiveMonsterAppearance(this.currentBaseMonster, this.equippedSkinId);
        const spriteSize = appearance.spriteSize || { width: 32, height: 32 };
        
        // Update main hero sprite - render all skins at same size as cats
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            mainHeroSprite.src = appearance.animations.idle;
            mainHeroSprite.style.width = '32px';
            mainHeroSprite.style.height = '32px';
            mainHeroSprite.style.objectFit = 'none';
            
            // For multi-directional sprites, set object-position to show front-facing row
            const spriteRow = appearance.spriteRow || 0;
            const animationRows = appearance.animationRows || {};
            
            // Determine which row to use (Orc uses spriteRow, Blob uses animationRows.idle)
            const rowIndex = animationRows.idle !== undefined ? animationRows.idle : spriteRow;
            const yOffset = rowIndex * (appearance.spriteSize?.height || 32);
            mainHeroSprite.style.objectPosition = `0 -${yOffset}px`;
            
            mainHeroSprite.style.transform = 'scale(4)';
            
            // Only animate if there's more than 1 frame
            if (appearance.frameCount.idle > 1) {
                mainHeroSprite.style.animation = `hero-idle-anim 0.8s steps(${appearance.frameCount.idle}) infinite`;
            } else {
                mainHeroSprite.style.animation = 'none';
            }
        }
        
        // Update focus timer sprite - render all skins at same size as cats
        const focusTimerSprite = document.getElementById('focusTimerMonsterSprite');
        if (focusTimerSprite) {
            focusTimerSprite.src = appearance.animations.idle;
            focusTimerSprite.style.width = '32px';
            focusTimerSprite.style.height = '32px';
            focusTimerSprite.style.objectFit = 'none';
            focusTimerSprite.style.overflow = 'hidden';
            focusTimerSprite.style.imageRendering = 'pixelated';
            
            // For multi-directional sprites, set object-position to show front-facing row
            const spriteRow = appearance.spriteRow || 0;
            const animationRows = appearance.animationRows || {};
            
            // Determine which row to use (Orc uses spriteRow, Blob uses animationRows.idle)
            const rowIndex = animationRows.idle !== undefined ? animationRows.idle : spriteRow;
            const yOffset = rowIndex * (appearance.spriteSize?.height || 32);
            focusTimerSprite.style.objectPosition = `0 -${yOffset}px`;
            
            // Set proper object-fit to clip the sprite to exactly 32x32
            focusTimerSprite.style.objectFit = 'none';
            focusTimerSprite.style.objectPosition = '0 0';
            
            focusTimerSprite.style.transform = 'scale(4)';
            focusTimerSprite.style.transformOrigin = 'center center';
            
            // Only animate if there's more than 1 frame
            if (appearance.frameCount.idle > 1) {
                focusTimerSprite.style.animation = `hero-idle-anim 0.8s steps(${appearance.frameCount.idle}) infinite`;
            } else {
                focusTimerSprite.style.animation = 'none';
            }
        }
        
        // Update battle sprite if in battle
        const heroSprite = document.getElementById('heroSprite');
        if (heroSprite) {
            heroSprite.src = appearance.animations.idle;
        }
        
        console.log('[SkinsManager] Updated all monster visuals');
    }
    
    /**
     * Get current equipped skin info
     */
    getEquippedSkin() {
        if (!this.equippedSkinId) return null;
        return window.SKINS_CONFIG[this.equippedSkinId] || null;
    }
    
    /**
     * Get all owned skins
     */
    getOwnedSkins() {
        return this.ownedSkins.map(skinId => window.SKINS_CONFIG[skinId]).filter(Boolean);
    }
    
    /**
     * Render skins shop grid
     */
    renderSkinsShop() {
        const grid = document.getElementById('skinsShopGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const userLevel = window.gameState.jerryLevel || 1;
        const userXP = window.gameState.jerryXP || 0;
        
        // Get all skins sorted by level requirement and price
        const allSkins = Object.values(window.SKINS_CONFIG).sort((a, b) => {
            if (a.levelRequired !== b.levelRequired) {
                return a.levelRequired - b.levelRequired;
            }
            return a.price - b.price;
        });
        
        allSkins.forEach(skin => {
            const isOwned = this.ownedSkins.includes(skin.id);
            const isEquipped = this.equippedSkinId === skin.id;
            const purchaseCheck = window.canPurchaseSkin(skin.id, userLevel, userXP, this.ownedSkins);
            const isLocked = skin.levelRequired > userLevel;
            
            const card = document.createElement('div');
            card.className = 'shop-item-card skin-card';
            
            if (isEquipped) {
                card.style.border = '2px solid #4CAF50';
                card.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
            } else if (isLocked) {
                card.style.opacity = '0.5';
                card.style.cursor = 'not-allowed';
            }
            
            // Tier badge
            const tierBadge = skin.tier === 'premium' 
                ? '<div style="position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">PREMIUM</div>'
                : '';
            
            // Unified button state logic
            let buttonHTML = '';
            let equippedBadge = '';
            
            if (isLocked) {
                // State 1: Locked by Level
                buttonHTML = `<button class="shop-buy-btn" disabled style="background: rgba(50, 50, 50, 0.6); border: 1px solid rgba(80, 80, 80, 0.5); color: rgba(150, 150, 150, 0.7); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: not-allowed; width: 100%; letter-spacing: 0.3px;">🔒 Level ${skin.levelRequired}</button>`;
            } else if (!isOwned) {
                // State 2: Unlocked, Not Purchased Yet
                if (userXP >= skin.price) {
                    buttonHTML = `<button class="shop-buy-btn" onclick="window.skinsManager.purchaseSkinFromShop('${skin.id}')" style="background: rgba(40, 40, 40, 0.8); border: 1px solid rgba(80, 80, 80, 0.6); color: rgba(200, 200, 200, 0.95); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; width: 100%; transition: all 0.2s ease; letter-spacing: 0.3px;" onmouseover="this.style.background='rgba(60, 60, 60, 0.9)'; this.style.borderColor='rgba(100, 100, 100, 0.7)'" onmouseout="this.style.background='rgba(40, 40, 40, 0.8)'; this.style.borderColor='rgba(80, 80, 80, 0.6)'">Buy Now</button>`;
                } else {
                    buttonHTML = `<button class="shop-buy-btn" disabled style="background: rgba(50, 50, 50, 0.6); border: 1px solid rgba(80, 80, 80, 0.5); color: rgba(150, 150, 150, 0.7); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: not-allowed; width: 100%; letter-spacing: 0.3px;">Need ${skin.price - userXP} XP</button>`;
                }
            } else if (isEquipped) {
                // State 4: Owned and Currently Equipped
                equippedBadge = '<div style="background: rgba(76, 175, 80, 0.15); color: rgba(139, 195, 74, 0.9); padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 500; margin-top: 10px; text-align: center; border: 1px solid rgba(76, 175, 80, 0.3); letter-spacing: 0.5px;">✓ Equipped</div>';
                buttonHTML = `<button class="shop-buy-btn" onclick="window.skinsManager.unequipSkinFromShop()" style="background: rgba(60, 30, 30, 0.7); border: 1px solid rgba(180, 60, 60, 0.5); color: rgba(239, 83, 80, 0.9); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; width: 100%; transition: all 0.2s ease; letter-spacing: 0.3px;" onmouseover="this.style.background='rgba(80, 40, 40, 0.8)'; this.style.borderColor='rgba(200, 80, 80, 0.6)'" onmouseout="this.style.background='rgba(60, 30, 30, 0.7)'; this.style.borderColor='rgba(180, 60, 60, 0.5)'">Unequip</button>`;
            } else {
                // State 3: Owned but NOT Equipped
                buttonHTML = `<button class="shop-buy-btn" onclick="window.skinsManager.equipSkinFromShop('${skin.id}')" style="background: rgba(30, 60, 40, 0.7); border: 1px solid rgba(76, 175, 80, 0.5); color: rgba(139, 195, 74, 0.9); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; width: 100%; transition: all 0.2s ease; letter-spacing: 0.3px;" onmouseover="this.style.background='rgba(40, 80, 50, 0.8)'; this.style.borderColor='rgba(100, 195, 100, 0.6)'" onmouseout="this.style.background='rgba(30, 60, 40, 0.7)'; this.style.borderColor='rgba(76, 175, 80, 0.5)'">Equip</button>`;
            }
            
            card.innerHTML = `
                <div style="position: relative;">
                    ${tierBadge}
                    <div style="width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; overflow: hidden; position: relative;">
                        <div style="width: 80px; height: 80px; position: relative; overflow: hidden;">
                            <img src="${skin.thumbnail}" 
                                 style="position: absolute; 
                                        top: 0; 
                                        left: 0; 
                                        width: ${(skin.spriteSize?.width || 32) * 4}px; 
                                        height: ${(skin.spriteSize?.height || 32) * (skin.animationRows ? 6 : 1)}px; 
                                        object-fit: none; 
                                        object-position: 0 ${(skin.animationRows?.idle || 0) * (skin.spriteSize?.height || 32)}px; 
                                        image-rendering: pixelated; 
                                        transform: scale(2.5); 
                                        transform-origin: top left;" 
                                 alt="${skin.name}">
                        </div>
                    </div>
                </div>
                <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${skin.name}</div>
                <div style="font-size: 14px; color: #4CAF50; font-weight: 700; margin-top: 8px;">${skin.price} XP Coins</div>
                ${equippedBadge}
                <div style="margin-top: 12px;">
                    ${buttonHTML}
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
    
    /**
     * Render owned skins in inventory (DEPRECATED - removed from UI)
     */
    renderSkinsInventory() {
        // Inventory section removed - equip/unequip now on shop cards
        return;
        /*
        const grid = document.getElementById('skinsInventoryGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const ownedSkins = this.getOwnedSkins();
        
        if (ownedSkins.length === 0) {
            grid.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">No skins owned yet. Visit the Shop to purchase skins!</div>';
            return;
        }
        
        ownedSkins.forEach(skin => {
            const isEquipped = this.equippedSkinId === skin.id;
            
            const card = document.createElement('div');
            card.className = 'shop-item-card skin-card';
            
            if (isEquipped) {
                card.style.border = '2px solid #4CAF50';
                card.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
            }
            
            let buttonHTML = '';
            if (isEquipped) {
                buttonHTML = '<button class="shop-buy-btn" onclick="window.skinsManager.unequipSkinFromInventory()" style="background: #f44336;">Unequip</button>';
            } else {
                buttonHTML = `<button class="shop-buy-btn" onclick="window.skinsManager.equipSkinFromInventory('${skin.id}')">Equip</button>`;
            }
            
            card.innerHTML = `
                <div style="width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; overflow: hidden;">
                    <img src="${skin.thumbnail}" alt="${skin.name}" style="max-width: 100%; max-height: 100%; image-rendering: pixelated; transform: scale(2);">
                </div>
                <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${skin.name}</div>
                ${isEquipped ? '<div style="background: rgba(76, 175, 80, 0.2); color: #4CAF50; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-top: 8px;">✓ Currently Equipped</div>' : ''}
                <div style="margin-top: 12px;">
                    ${buttonHTML}
                </div>
            `;
            
            grid.appendChild(card);
        });
        */
    }
    
    /**
     * UI wrapper methods for onclick handlers
     */
    purchaseSkinFromShop(skinId) {
        const result = this.purchaseSkin(skinId);
        
        if (result.success) {
            window.showSuccessMessage('🎨 Skin Purchased!', result.message);
            this.renderSkinsShop();
            this.renderSkinsInventory();
            window.updateXPDisplay();
        } else {
            window.showSuccessMessage('❌ Cannot Purchase', result.message);
        }
    }
    
    /**
     * Equip skin from shop UI
     */
    equipSkinFromShop(skinId) {
        const result = this.equipSkin(skinId);
        
        if (result.success) {
            window.showSuccessMessage('✨ Skin Equipped!', result.message);
            this.renderSkinsShop();
        } else {
            window.showSuccessMessage('❌ Cannot Equip', result.message);
        }
    }
    
    /**
     * Unequip skin from shop UI
     */
    unequipSkinFromShop() {
        const result = this.unequipSkin();
        
        if (result.success) {
            window.showSuccessMessage('✨ Skin Unequipped!', result.message);
            this.renderSkinsShop();
        }
    }
    
    /**
     * Equip skin from inventory UI
     */
    equipSkinFromInventory(skinId) {
        const result = this.equipSkin(skinId);
        
        if (result.success) {
            window.showSuccessMessage('✨ Skin Equipped!', result.message);
            this.renderSkinsInventory();
        } else {
            window.showSuccessMessage('❌ Cannot Equip', result.message);
        }
    }
    
    /**
     * Unequip skin from inventory UI
     */
    unequipSkinFromInventory() {
        const result = this.unequipSkin();
        
        if (result.success) {
            window.showSuccessMessage('👾 Default Appearance', result.message);
            this.renderSkinsInventory();
        }
    }
}

// Initialize global skins manager
window.skinsManager = new SkinsManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.skinsManager) {
        window.skinsManager.init();
    }
});

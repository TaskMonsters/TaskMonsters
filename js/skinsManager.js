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
        
        // Apply equipped skin visuals if a skin is equipped
        if (this.equippedSkinId) {
            console.log('[SkinsManager] Applying equipped skin on init:', this.equippedSkinId);
            this.updateAllMonsterVisuals();
        }
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
            // FIX: Force GIF animation restart by adding cache-busting timestamp
            const skin = window.SKINS_CONFIG[this.equippedSkinId];
            const isGif = skin && skin.seamlessImage;
            
            // Store current src to check if it's changing
            const currentSrc = mainHeroSprite.src;
            const newSrc = appearance.animations.idle;
            const needsReload = currentSrc.split('?')[0] !== newSrc.split('?')[0];
            
            // For GIFs, add timestamp to force reload and restart animation
            if (isGif) {
                mainHeroSprite.src = newSrc + '?t=' + Date.now();
            } else {
                mainHeroSprite.src = newSrc;
            }
            
            // CRITICAL FIX: GIFs need different styling than sprite sheets
            if (isGif) {
                // GIF animations: Show full image with contain
                mainHeroSprite.style.width = 'auto';
                mainHeroSprite.style.height = 'auto';
                mainHeroSprite.style.maxWidth = '128px';
                mainHeroSprite.style.maxHeight = '128px';
                mainHeroSprite.style.objectFit = 'contain';
                mainHeroSprite.style.objectPosition = 'center';
            } else {
                // Sprite sheets: Crop to single frame
                mainHeroSprite.style.width = `${spriteSize.width}px`;
                mainHeroSprite.style.height = `${spriteSize.height}px`;
                mainHeroSprite.style.objectFit = 'none';
                
                // For multi-directional sprites, set object-position to show front-facing row
                const spriteRow = appearance.spriteRow || 0;
                const animationRows = appearance.animationRows || {};
                
                // Determine which row to use (Orc uses spriteRow, Blob uses animationRows.idle)
                const rowIndex = animationRows.idle !== undefined ? animationRows.idle : spriteRow;
                const yOffset = rowIndex * spriteSize.height;
                mainHeroSprite.style.objectPosition = `0 -${yOffset}px`;
            }
            
            // FIX: Don't scale the sprite element - this causes multi-frame display
            // The sprite should be displayed at its natural size
            mainHeroSprite.style.transform = 'scale(4)'; // Fixed scale for all skins
            
            // Only use CSS animation for sprite sheets, NOT for GIF animations
            if (isGif) {
                // GIF animation - no CSS animation needed
                mainHeroSprite.style.animation = 'none';
            } else if (appearance.frameCount.idle > 1) {
                // Sprite sheet animation - force restart by removing and re-adding
                mainHeroSprite.style.animation = 'none';
                // Force reflow to restart animation
                void mainHeroSprite.offsetWidth;
                mainHeroSprite.style.animation = `hero-idle-anim 0.8s steps(${appearance.frameCount.idle}) infinite`;
            } else {
                // Single frame - no animation
                mainHeroSprite.style.animation = 'none';
            }
            
            console.log('[SkinsManager] Main hero sprite updated, animation restarted');
        }
        
        // Update focus timer sprite - render all skins at same size as cats
        const focusTimerSprite = document.getElementById('focusTimerMonsterSprite');
        if (focusTimerSprite) {
            // FIX: Force GIF animation restart by adding cache-busting timestamp
            const skinFocus = window.SKINS_CONFIG[this.equippedSkinId];
            const isGifFocus = skinFocus && skinFocus.seamlessImage;
            
            // For GIFs, add timestamp to force reload and restart animation
            if (isGifFocus) {
                focusTimerSprite.src = appearance.animations.idle + '?t=' + Date.now();
            } else {
                focusTimerSprite.src = appearance.animations.idle;
            }
            
            // CRITICAL FIX: GIFs need different styling than sprite sheets
            if (isGifFocus) {
                // GIF animations: Show full image with contain
                focusTimerSprite.style.width = 'auto';
                focusTimerSprite.style.height = 'auto';
                focusTimerSprite.style.maxWidth = '128px';
                focusTimerSprite.style.maxHeight = '128px';
                focusTimerSprite.style.objectFit = 'contain';
                focusTimerSprite.style.objectPosition = 'center';
            } else {
                // Sprite sheets: Crop to single frame
                focusTimerSprite.style.width = `${spriteSize.width}px`;
                focusTimerSprite.style.height = `${spriteSize.height}px`;
                focusTimerSprite.style.objectFit = 'none';
                focusTimerSprite.style.overflow = 'hidden';
                focusTimerSprite.style.imageRendering = 'pixelated';
                
                // For multi-directional sprites, set object-position to show front-facing row
                const spriteRow = appearance.spriteRow || 0;
                const animationRows = appearance.animationRows || {};
                
                // Determine which row to use (Orc uses spriteRow, Blob uses animationRows.idle)
                const rowIndex = animationRows.idle !== undefined ? animationRows.idle : spriteRow;
                const yOffset = rowIndex * spriteSize.height;
                focusTimerSprite.style.objectPosition = `0 -${yOffset}px`;
            }
            
            // FIX: Use fixed scale to prevent multi-frame display
            focusTimerSprite.style.transform = 'scale(4)';
            focusTimerSprite.style.transformOrigin = 'center center';
            
            // Only use CSS animation for sprite sheets, NOT for GIF animations
            if (isGifFocus) {
                // GIF animation - no CSS animation needed
                focusTimerSprite.style.animation = 'none';
            } else if (appearance.frameCount.idle > 1) {
                // Sprite sheet animation - force restart by removing and re-adding
                focusTimerSprite.style.animation = 'none';
                // Force reflow to restart animation
                void focusTimerSprite.offsetWidth;
                focusTimerSprite.style.animation = `hero-idle-anim 0.8s steps(${appearance.frameCount.idle}) infinite`;
            } else {
                // Single frame - no animation
                focusTimerSprite.style.animation = 'none';
            }
            
            console.log('[SkinsManager] Focus timer sprite updated, animation restarted');
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
        const isEgg = window.gameState.isEgg === true;
        
        // If player is in egg form, show info banner but still allow viewing skins
        if (isEgg) {
            const infoBanner = document.createElement('div');
            infoBanner.style.cssText = 'text-align: center; padding: 20px; margin-bottom: 20px; background: rgba(255, 152, 0, 0.1); border: 1px solid rgba(255, 152, 0, 0.3); border-radius: 12px; color: #FF9800;';
            infoBanner.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">🥚</div>
                <p style="font-size: 14px; margin: 0;">Your monster is in egg form. Reach <strong>Level 5</strong> to equip skins!</p>
                <p style="font-size: 12px; margin-top: 5px; opacity: 0.8;">Current Level: ${userLevel}</p>
            `;
            grid.appendChild(infoBanner);
        }
        
        // Get all skins sorted by price (lowest to highest)
        const allSkins = Object.values(window.SKINS_CONFIG).sort((a, b) => {
            return a.price - b.price;
        });
        
        allSkins.forEach(skin => {
            const isOwned = this.ownedSkins.includes(skin.id);
            const isEquipped = this.equippedSkinId === skin.id;
            const purchaseCheck = window.canPurchaseSkin(skin.id, userLevel, userXP, this.ownedSkins);
            const isLocked = !isOwned && (skin.levelRequired > userLevel);
            
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
            // Premium badge removed per user request
            const tierBadge = '';
            
            // Unified button state logic
            let buttonHTML = '';
            let equippedBadge = '';
            let lockSectionHTML = '';
            
            if (isLocked) {
                // State 1: Locked by Level - Show lock section instead of button
                lockSectionHTML = `
                    <div class="shop-item-lock-section">
                        <div class="shop-item-lock-icon">🔒</div>
                        <div class="shop-item-lock-text">Level ${skin.levelRequired}</div>
                    </div>
                `;
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
                if (isEgg) {
                    buttonHTML = `<button class="shop-buy-btn" disabled style="background: rgba(50, 50, 50, 0.6); border: 1px solid rgba(80, 80, 80, 0.5); color: rgba(150, 150, 150, 0.7); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: not-allowed; width: 100%; letter-spacing: 0.3px;">🥚 Hatch First</button>`;
                } else {
                    buttonHTML = `<button class="shop-buy-btn" onclick="window.skinsManager.unequipSkinFromShop()" style="background: rgba(60, 30, 30, 0.7); border: 1px solid rgba(180, 60, 60, 0.5); color: rgba(239, 83, 80, 0.9); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; width: 100%; transition: all 0.2s ease; letter-spacing: 0.3px;" onmouseover="this.style.background='rgba(80, 40, 40, 0.8)'; this.style.borderColor='rgba(200, 80, 80, 0.6)'" onmouseout="this.style.background='rgba(60, 30, 30, 0.7)'; this.style.borderColor='rgba(180, 60, 60, 0.5)'">Unequip</button>`;
                }
            } else {
                // State 3: Owned but NOT Equipped
                if (isEgg) {
                    buttonHTML = `<button class="shop-buy-btn" disabled style="background: rgba(50, 50, 50, 0.6); border: 1px solid rgba(80, 80, 80, 0.5); color: rgba(150, 150, 150, 0.7); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: not-allowed; width: 100%; letter-spacing: 0.3px;">🥚 Hatch First</button>`;
                } else {
                    buttonHTML = `<button class="shop-buy-btn" onclick="window.skinsManager.equipSkinFromShop('${skin.id}')" style="background: rgba(30, 60, 40, 0.7); border: 1px solid rgba(76, 175, 80, 0.5); color: rgba(139, 195, 74, 0.9); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; width: 100%; transition: all 0.2s ease; letter-spacing: 0.3px;" onmouseover="this.style.background='rgba(40, 80, 50, 0.8)'; this.style.borderColor='rgba(100, 195, 100, 0.6)'" onmouseout="this.style.background='rgba(30, 60, 40, 0.7)'; this.style.borderColor='rgba(76, 175, 80, 0.5)'">Equip</button>`;
                }
            }
            
            // Determine thumbnail style based on skin type
            let thumbnailHTML = '';
            if (skin.id === 'imp') {
                // For Imp skin: Show thumbnail with rounded corners matching other skins
                thumbnailHTML = `
                    <div class="shop-item-emoji" style="width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; overflow: hidden;">
                        <img src="${skin.thumbnail}" 
                             style="max-width: 80px; 
                                    max-height: 80px; 
                                    width: auto; 
                                    height: auto; 
                                    object-fit: contain; 
                                    image-rendering: pixelated; 
                                    transform: scale(1.8); 
                                    border-radius: 8px;" 
                             alt="${skin.name}">
                    </div>
                `;
            } else if (skin.seamlessImage) {
                // For seamless single-image skins (Task Toad, Task Phantom)
                // Task Toad needs vertical adjustment due to transparent space in sprite
                const translateY = skin.id === 'task-toad' ? ' translateY(-20px)' : '';
                thumbnailHTML = `
                    <div class="shop-item-emoji" style="width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; overflow: visible;">
                        <img src="${skin.thumbnail}" 
                             style="max-width: 80px; 
                                    max-height: 80px; 
                                    width: auto; 
                                    height: auto; 
                                    object-fit: contain; 
                                    image-rendering: pixelated; 
                                    transform: scale(1.8)${translateY};" 
                             alt="${skin.name}">
                    </div>
                `;
            } else {
                // For sprite sheet skins (all other skins)
                thumbnailHTML = `
                    <div class="shop-item-emoji" style="width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; overflow: hidden; position: relative;">
                        <div style="width: 80px; height: 80px; position: relative; overflow: hidden;">
                            <img src="${skin.thumbnail}" 
                                 style="position: absolute; 
                                        top: 0; 
                                        left: 0; 
                                        width: ${(skin.spriteSize?.width || 32) * 4}px; 
                                        height: ${(skin.spriteSize?.height || 32) * (skin.totalAnimationRows || 6)}px; 
                                        object-fit: none; 
                                        object-position: 0 ${(skin.animationRows?.idle || 0) * (skin.spriteSize?.height || 32)}px; 
                                        image-rendering: pixelated; 
                                        transform: scale(2.5); 
                                        transform-origin: top left;" 
                                 alt="${skin.name}">
                        </div>
                    </div>
                `;
            }
            
            card.innerHTML = `
                <div style="position: relative;">
                    ${tierBadge}
                    ${thumbnailHTML}
                </div>
                <div class="shop-item-name">${skin.name}</div>
                <div class="shop-item-cost">${skin.price} XP Coins</div>
                ${equippedBadge}
                ${lockSectionHTML}
                ${buttonHTML}
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
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
    <img src="${skin.thumbnail}" alt="${skin.name}" 
         style="width: ${skin.spriteSize?.width || 32}px; 
                height: ${skin.spriteSize?.height || 32}px; 
                object-fit: none; 
                object-position: 0 0; 
                image-rendering: pixelated; 
                transform: scale(3); 
                transform-origin: center center;">
</div>
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

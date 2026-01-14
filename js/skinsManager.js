/**
 * Skins Manager
 * Handles skin purchasing, equipping, and rendering across the app
 * REFACTORED: 100% GIF-based animations only. No sprite sheets.
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
        
        console.log('[SkinsManager] Initialized (GIF-ONLY MODE):', {
            ownedSkins: this.ownedSkins,
            equippedSkinId: this.equippedSkinId,
            baseMonster: this.currentBaseMonster
        });
        
        // CRITICAL: Ensure DOM is ready before updating visuals
        this.ensureSpriteReady(() => {
            this.updateAllMonsterVisuals();
        });
    }
    
    /**
     * Ensure sprite element exists and is ready (with retry mechanism)
     */
    ensureSpriteReady(callback, retries = 10) {
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        
        if (mainHeroSprite) {
            callback();
        } else if (retries > 0) {
            setTimeout(() => {
                this.ensureSpriteReady(callback, retries - 1);
            }, 100);
        } else {
            console.error('[SkinsManager] Failed to find mainHeroSprite');
        }
    }
    
    /**
     * Update all monster visuals across the app - GIF ONLY
     */
    updateAllMonsterVisuals() {
        console.log('[SkinsManager] Updating visuals (GIF-ONLY)');
        
        // Sync state
        this.equippedSkinId = window.gameState?.equippedSkinId || null;
        
        // Get appearance (should return GIF paths)
        const appearance = window.getActiveMonsterAppearance(this.currentBaseMonster, this.equippedSkinId);
        const idleGif = appearance.animations.idle;
        
        // 1. Update Main Hero Sprite
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            this.applyGifToElement(mainHeroSprite, idleGif, 4); // Scale 4 for home page
        }
        
        // 2. Update Focus Timer Sprite
        const focusTimerSprite = document.getElementById('focusTimerMonsterSprite');
        if (focusTimerSprite) {
            this.applyGifToElement(focusTimerSprite, idleGif, 3); // Scale 3 for focus timer
        }
        
        // 3. Update Battle Sprite (if battle is active)
        const battleHeroSprite = document.getElementById('battleHeroSprite');
        if (battleHeroSprite) {
            this.applyGifToElement(battleHeroSprite, idleGif, 3.5); // Scale 3.5 for battle
        }
    }
    
    /**
     * Helper to apply GIF styling to an element
     */
    applyGifToElement(element, gifPath, scale) {
        // Force reload to ensure animation starts
        element.src = gifPath + '?t=' + Date.now();
        
        // Reset all sprite-sheet related styles
        element.style.setProperty('width', '32px', 'important');
        element.style.setProperty('height', '32px', 'important');
        element.style.setProperty('object-fit', 'contain', 'important');
        element.style.setProperty('object-position', 'center', 'important');
        element.style.setProperty('image-rendering', 'pixelated', 'important');
        
        // Apply scaling
        element.style.setProperty('transform', `scale(${scale})`, 'important');
        element.style.setProperty('transform-origin', 'bottom center', 'important');
        
        // Ensure visibility
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('display', 'block', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        
        // REMOVE ALL CSS ANIMATIONS - The GIF handles its own animation
        element.style.setProperty('animation', 'none', 'important');
        element.style.setProperty('transition', 'none', 'important');
        
        console.log(`[SkinsManager] Applied GIF: ${gifPath} to ${element.id}`);
    }

    /**
     * Render the skins shop UI
     */
    renderSkinsShop() {
        const grid = document.getElementById('skinsShopGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // Use getAllSkins() function from skinsConfig
        const allSkins = window.getAllSkins ? window.getAllSkins() : [];
        const userLevel = window.gameState.jerryLevel || 1;
        const userXP = window.gameState.jerryXP || 0;
        
        if (allSkins.length === 0) {
            grid.innerHTML = '<div class="no-skins">No skins available in the shop.</div>';
            return;
        }
        
        // Sort skins by level requirement (lowest to highest)
        allSkins.sort((a, b) => {
            const levelA = a.levelRequired || 1;
            const levelB = b.levelRequired || 1;
            return levelA - levelB;
        });

        allSkins.forEach(skin => {
            const isOwned = this.ownedSkins.includes(skin.id);
            const isEquipped = this.equippedSkinId === skin.id;
            const isLocked = !isOwned && (userLevel < (skin.levelRequired || 1));
            
            // Basic purchase check
            const canPurchase = userXP >= skin.price && !isLocked;
            
            const card = document.createElement('div');
            card.className = `skin-card ${isEquipped ? 'equipped' : ''} ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}`;
            
            // Thumbnail display logic
            let thumbnailHTML = '';
            if (isLocked) {
                // Show question mark for locked skins
                thumbnailHTML = `<div class="skin-thumbnail locked-thumbnail"><div class="locked-icon">❓</div></div>`;
            } else {
                // Show actual skin image (unlocked skins only)
                const skinImage = skin.thumbnail || skin.animations?.idle || `assets/skins/${skin.id}/thumbnail.png`;
                thumbnailHTML = `<div class="skin-thumbnail"><img src="${skinImage}" class="skin-img" onerror="this.style.display='none'"></div>`;
            }
            
            // Button logic
            let buttonHTML = '';
            if (isEquipped) {
                buttonHTML = `<button class="skin-btn-new equipped" onclick="window.skinsManager.unequipSkin()">✓ Equipped</button>`;
            } else if (isOwned) {
                buttonHTML = `<button class="skin-btn-new equip" onclick="window.skinsManager.equipSkin('${skin.id}')">EQUIP</button>`;
            } else if (isLocked) {
                buttonHTML = `<div class="skin-locked-text">🔒 Level ${skin.levelRequired || 1}</div>`;
            } else if (canPurchase) {
                buttonHTML = `<div class="skin-price">${skin.price} XP Coins</div><button class="skin-btn-new buy" onclick="window.skinsManager.buySkin('${skin.id}', ${skin.price})">EQUIP</button>`;
            } else {
                buttonHTML = `<div class="skin-price">${skin.price} XP Coins</div><button class="skin-btn-new locked" disabled>EQUIP</button>`;
            }
            
            card.innerHTML = `
                ${thumbnailHTML}
                <div class="skin-name-new">${skin.name}</div>
                ${buttonHTML}
            `;
            
            grid.appendChild(card);
        });
    }

    /**
     * Buy a skin
     */
    buySkin(skinId, price) {
        if (window.gameState.jerryXP < price) return;
        
        window.gameState.jerryXP -= price;
        this.ownedSkins.push(skinId);
        window.gameState.ownedSkins = this.ownedSkins;
        
        window.saveGameState();
        window.updateAllDisplays();
        this.renderSkinsShop();
        
        // Play sound if available
        if (window.audioManager) window.audioManager.playSound('buy');
    }

    /**
     * Equip a skin
     */
    equipSkin(skinId) {
        if (!this.ownedSkins.includes(skinId)) return { success: false };
        this.equippedSkinId = skinId;
        window.gameState.equippedSkinId = skinId;
        window.saveGameState();
        this.updateAllMonsterVisuals();
        this.renderSkinsShop();
        return { success: true };
    }

    /**
     * Unequip a skin
     */
    unequipSkin() {
        this.equippedSkinId = null;
        window.gameState.equippedSkinId = null;
        window.saveGameState();
        this.updateAllMonsterVisuals();
        this.renderSkinsShop();
        return { success: true };
    }
}

// Global instance
window.skinsManager = new SkinsManager();

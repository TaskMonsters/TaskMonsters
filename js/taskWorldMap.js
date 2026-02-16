/**
 * Task World Map Page
 * Shows after battle victories with Guardian message
 * Displays user's progress through the 50-level journey from village to dark castle
 */

class TaskWorldMap {
    constructor() {
        this.isShowing = false;
        this.pathCoordinates = this.initializePathCoordinates();
        console.log('[TaskWorldMap] Task World Map System initialized with 50-position path');
    }
    
    /**
     * Initialize the 50-position path coordinates
     * Path goes from starting village (level 1) to dark castle (level 50)
     * Coordinates are percentages of map dimensions (0-100)
     */
    initializePathCoordinates() {
        return {
            // Starting Village (Levels 1-5) - Bottom Left
            // Village with red houses at bottom left
            1: { x: 12, y: 82 },
            2: { x: 14, y: 78 },
            3: { x: 16, y: 74 },
            4: { x: 18, y: 70 },
            5: { x: 20, y: 66 },
            
            // Enchanted Forest (Levels 6-14) - Left side, winding upward
            // Green forest area with trees
            6: { x: 22, y: 62 },
            7: { x: 18, y: 58 },
            8: { x: 16, y: 54 },
            9: { x: 18, y: 50 },
            10: { x: 22, y: 46 },
            11: { x: 26, y: 42 },
            12: { x: 30, y: 46 },
            13: { x: 34, y: 50 },
            14: { x: 38, y: 54 },
            
            // Golden Desert (Levels 15-26) - Center-right, lower area
            // Yellow sandy area with pyramids
            15: { x: 42, y: 58 },
            16: { x: 46, y: 62 },
            17: { x: 50, y: 66 },
            18: { x: 54, y: 70 },
            19: { x: 58, y: 72 },
            20: { x: 62, y: 70 },
            21: { x: 66, y: 66 },
            22: { x: 70, y: 62 },
            23: { x: 68, y: 58 },
            24: { x: 64, y: 54 },
            25: { x: 60, y: 50 },
            26: { x: 58, y: 46 },
            
            // Frozen Mountain Pass (Levels 27-39) - Upper center-right
            // Gray mountains with snow peaks
            27: { x: 60, y: 42 },
            28: { x: 62, y: 38 },
            29: { x: 64, y: 34 },
            30: { x: 66, y: 30 },
            31: { x: 68, y: 26 },
            32: { x: 70, y: 30 },
            33: { x: 72, y: 34 },
            34: { x: 74, y: 38 },
            35: { x: 76, y: 34 },
            36: { x: 78, y: 30 },
            37: { x: 76, y: 26 },
            38: { x: 74, y: 22 },
            39: { x: 72, y: 20 },
            
            // Dark Castle (Levels 40-50) - Top right
            // Purple castle at top right
            40: { x: 74, y: 18 },
            41: { x: 76, y: 16 },
            42: { x: 78, y: 14 },
            43: { x: 80, y: 16 },
            44: { x: 82, y: 18 },
            45: { x: 80, y: 20 },
            46: { x: 78, y: 18 },
            47: { x: 76, y: 16 },
            48: { x: 78, y: 14 },
            49: { x: 80, y: 12 },
            50: { x: 82, y: 14 }  // Castle throne (final boss)
        };
    }
    
    /**
     * Get position for a given level
     */
    getPositionForLevel(level) {
        // Clamp level between 1 and 50
        const clampedLevel = Math.max(1, Math.min(50, level));
        return this.pathCoordinates[clampedLevel];
    }
    
    /**
     * Show map page after battle victory
     */
    show(context) {
        if (this.isShowing) {
            console.log('[TaskWorldMap] Map already showing, skipping');
            return;
        }
        
        this.isShowing = true;
        console.log('[TaskWorldMap] Showing map page with context:', context);
        
        const { level, previousLevel, petName, isFirstBattle, enemyName, justLeveledUp } = context;
        
        // Create map overlay
        const overlay = document.createElement('div');
        overlay.id = 'taskWorldMapOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            animation: fadeIn 0.5s ease;
            overflow-y: auto;
            padding: 20px;
        `;
        
        // Create content container
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 900px;
            width: 100%;
            text-align: center;
            position: relative;
        `;
        
        // Title
        const title = document.createElement('h1');
        title.textContent = 'TASK WORLD';
        title.style.cssText = `
            color: white;
            font-size: 48px;
            font-weight: 700;
            margin: 0 0 24px 0;
            text-shadow: 0 4px 8px rgba(0,0,0,0.5);
            letter-spacing: 2px;
        `;
        container.appendChild(title);
        
        // Map container (for positioning monster sprite)
        const mapContainer = document.createElement('div');
        mapContainer.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 0 auto 24px auto;
        `;
        
        // Map image
        const mapImg = document.createElement('img');
        mapImg.src = 'assets/task_world_map.png';
        mapImg.alt = 'Task World Map';
        mapImg.style.cssText = `
            width: 100%;
            height: auto;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            border: 3px solid rgba(255, 255, 255, 0.3);
            display: block;
        `;
        mapContainer.appendChild(mapImg);
        
        // Add monster sprite at current position
        const position = this.getPositionForLevel(level);
        const monsterSprite = this.createMonsterSprite(position, petName);
        mapContainer.appendChild(monsterSprite);
        
        // If just leveled up, animate from previous position
        if (justLeveledUp && previousLevel) {
            const previousPosition = this.getPositionForLevel(previousLevel);
            this.animateMonsterMovement(monsterSprite, previousPosition, position);
        }
        
        container.appendChild(mapContainer);
        
        // Level indicator
        const levelIndicator = document.createElement('div');
        levelIndicator.style.cssText = `
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
            padding: 16px 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        `;
        
        const currentRegion = window.guardianNarrative ? window.guardianNarrative.getCurrentRegion(level) : null;
        const regionText = currentRegion ? currentRegion.name : this.getRegionName(level);
        
        levelIndicator.innerHTML = `
            <div style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                Level ${level} ${petName ? `- ${petName}` : ''}
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 18px;">
                📍 ${regionText}
            </div>
        `;
        container.appendChild(levelIndicator);
        
        // Add Continue button
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 48px;
            font-size: 20px;
            font-weight: 700;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin-top: 24px;
        `;
        continueButton.onmouseover = () => {
            continueButton.style.transform = 'scale(1.05)';
            continueButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        };
        continueButton.onmouseout = () => {
            continueButton.style.transform = 'scale(1)';
            continueButton.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
        };
        continueButton.onclick = () => {
            // Hide the world map overlay
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            // Call returnToMainApp if it exists
            if (typeof returnToMainApp === 'function') {
                returnToMainApp();
            }
        };
        container.appendChild(continueButton);
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Add animations if not already present
        if (!document.getElementById('taskWorldMapAnimations')) {
            const style = document.createElement('style');
            style.id = 'taskWorldMapAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes monsterBounce {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -60%) scale(1.1); }
                }
                
                @keyframes monsterMove {
                    0% { opacity: 1; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show Guardian message after a brief delay
        setTimeout(() => {
            if (window.guardianNarrative) {
                const message = window.guardianNarrative.getMapMessage(context);
                window.guardianNarrative.showMapMessage(message);
            }
        }, 1500);
    }
    
    /**
     * Create monster sprite element at given position
     */
    createMonsterSprite(position, petName) {
        const sprite = document.createElement('img');
        
        // Get the selected monster type
        const selectedMonster = localStorage.getItem('selectedMonster') || 'nova';
        
        // Check if user has equipped skin
        const equippedSkin = localStorage.getItem('equippedSkin');
        
        if (equippedSkin && equippedSkin !== 'none') {
            // Use equipped skin
            sprite.src = `assets/skins/${equippedSkin}.png`;
        } else {
            // Use default monster animation (capitalize first letter)
            const monsterName = selectedMonster.charAt(0).toUpperCase() + selectedMonster.slice(1);
            sprite.src = `assets/heroes/${monsterName}_idle.gif`;
        }
        
        sprite.alt = petName || 'Monster';
        sprite.style.cssText = `
            position: absolute;
            left: ${position.x}%;
            top: ${position.y}%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            image-rendering: pixelated;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
            z-index: 10;
            animation: monsterBounce 1.5s ease-in-out infinite;
        `;
        
        return sprite;
    }
    
    /**
     * Animate monster movement from previous position to new position
     */
    animateMonsterMovement(sprite, fromPosition, toPosition) {
        // Start at previous position
        sprite.style.left = `${fromPosition.x}%`;
        sprite.style.top = `${fromPosition.y}%`;
        sprite.style.transition = 'left 1.5s ease-in-out, top 1.5s ease-in-out';
        
        // Animate to new position after a brief delay
        setTimeout(() => {
            sprite.style.left = `${toPosition.x}%`;
            sprite.style.top = `${toPosition.y}%`;
        }, 500);
    }
    
    /**
     * Get region name based on level
     */
    getRegionName(level) {
        if (level >= 1 && level <= 5) return 'Peaceful Village';
        if (level >= 6 && level <= 14) return 'Enchanted Forest';
        if (level >= 15 && level <= 26) return 'Golden Desert';
        if (level >= 27 && level <= 39) return 'Frozen Mountain Pass';
        if (level >= 40 && level <= 50) return 'Dark Castle';
        return 'Unknown Region';
    }
    
    /**
     * Hide map page
     */
    hide() {
        const overlay = document.getElementById('taskWorldMapOverlay');
        if (overlay) {
            overlay.remove();
        }
        this.isShowing = false;
        console.log('[TaskWorldMap] Map page hidden');
    }
}

// Initialize global Task World Map instance
window.taskWorldMap = new TaskWorldMap();

// Listen for battle victory events to show map
document.addEventListener('battleVictory', (event) => {
    console.log('[TaskWorldMap] Battle victory event received, showing map');
    
    // Show map page
    window.taskWorldMap.show(event.detail);
});

// Return to main app function
function returnToMainApp() {
    console.log('[TaskWorldMap] Returning to main app');
    
    // Hide map page
    if (window.taskWorldMap) {
        window.taskWorldMap.hide();
    }
    
    // Hide battle container
    const battleContainer = document.getElementById('battleContainer');
    if (battleContainer) {
        battleContainer.classList.add('hidden');
    }
    
    // Show main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.classList.remove('hidden');
    }
    
    // Resume home page music
    if (window.audioManager) {
        window.audioManager.resumeHomeMusic();
    }
}

// Make returnToMainApp globally accessible
window.returnToMainApp = returnToMainApp;

console.log('[TaskWorldMap] Task World Map System loaded with 50-position path');

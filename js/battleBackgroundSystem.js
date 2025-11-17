// Battle Background System
// Dynamic level-based arena backgrounds with fade transitions

class BattleBackgroundSystem {
    constructor() {
        this.currentBackground = null;
        this.container = null;
    }
    
    // Initialize background system
    init() {
        // Target the battle-container (not battle-arena which is the full screen overlay)
        this.container = document.querySelector('.battle-container') ||
                        document.querySelector('#battleArena .battle-container') ||
                        document.querySelector('#battle-screen');
        
        if (!this.container) {
            console.error('Battle arena container not found');
            return;
        }
        
        // Ensure container has proper styling for backgrounds
        this.container.style.position = 'relative';
        this.container.style.backgroundSize = 'cover';
        this.container.style.backgroundPosition = 'center';
        this.container.style.backgroundRepeat = 'no-repeat';
        this.container.style.transition = 'background-image 1s ease-in-out';
    }
    
    // Load background based on player level
    loadBackgroundForLevel(playerLevel) {
        const backgroundPath = getBackgroundForLevel(playerLevel);
        this.setBackground(backgroundPath);
    }
    
    // Set specific background with fade transition
    setBackground(backgroundPath) {
        if (!this.container) {
            console.error('Container not initialized');
            return;
        }
        
        // Don't reload same background
        if (this.currentBackground === backgroundPath) {
            return;
        }
        
        // Preload image
        const img = new Image();
        img.onload = () => {
            // Fade out
            this.container.style.opacity = '0';
            
            setTimeout(() => {
                // Change background
                this.container.style.backgroundImage = `url('${backgroundPath}')`;
                this.currentBackground = backgroundPath;
                
                // Fade in
                this.container.style.opacity = '1';
            }, 500);
        };
        
        img.onerror = () => {
            console.error('Failed to load background:', backgroundPath);
        };
        
        img.src = backgroundPath;
    }
    
    // Get current background
    getCurrentBackground() {
        return this.currentBackground;
    }
    
    // Clear background
    clearBackground() {
        if (this.container) {
            this.container.style.backgroundImage = 'none';
            this.currentBackground = null;
        }
    }
}

// Create global instance
const battleBackgroundSystem = new BattleBackgroundSystem();

// Export to window
if (typeof window !== 'undefined') {
    window.BattleBackgroundSystem = BattleBackgroundSystem;
    window.battleBackgroundSystem = battleBackgroundSystem;
}

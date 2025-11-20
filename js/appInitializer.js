/**
 * App Initializer
 * Manages the correct initialization flow for Task Monsters app
 */

class AppInitializer {
    constructor() {
        this.isFirstTime = false;
        this.questGiverDue = false;
        this.initialized = false;
    }
    
    /**
     * Main initialization method
     * Coordinates the entire app startup sequence
     */
    async initialize() {
        if (this.initialized) {
            console.warn('[AppInit] Already initialized');
            return;
        }
        
        console.log('[AppInit] Starting initialization...');
        
        try {
            // 1. Load game state first
            if (window.loadGameState) {
                window.loadGameState();
            }
            
            // 2. Check if this is first time user
            this.isFirstTime = !localStorage.getItem('hasChosenMonster') || 
                               localStorage.getItem('hasChosenMonster') !== 'true';
            
            // 3. Check if quest giver is due
            this.questGiverDue = window.checkQuestGiverOnLoad && window.checkQuestGiverOnLoad();
            
            console.log('[AppInit] First time:', this.isFirstTime, 'Quest due:', this.questGiverDue);
            
            // 4. Wait for loading screen to complete (3 seconds)
            await this.waitForLoadingScreen();
            
            // 5. Show appropriate flow based on state
            if (this.isFirstTime) {
                await this.showOnboardingFlow();
            } else if (this.questGiverDue) {
                await this.showQuestGiverFlow();
            } else {
                this.showMainApp();
            }
            
            this.initialized = true;
            console.log('[AppInit] Initialization complete');
            
        } catch (error) {
            console.error('[AppInit] Error during initialization:', error);
            // Fallback: just show the main app
            this.showMainApp();
        }
    }
    
    /**
     * Wait for loading screen to finish
     */
    waitForLoadingScreen() {
        return new Promise(resolve => {
            console.log('[AppInit] Waiting for loading screen...');
            setTimeout(() => {
                console.log('[AppInit] Loading screen complete');
                resolve();
            }, 3100); // 3000ms loading screen + 100ms buffer
        });
    }
    
    /**
     * Show onboarding flow for first-time users
     */
    async showOnboardingFlow() {
        console.log('[AppInit] Showing onboarding flow');
        
        // Keep main app hidden during onboarding (removed - was hiding onboarding overlay too)
        // document.documentElement.style.visibility = 'hidden';
        
        // Show onboarding overlay
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            console.log('[AppInit] Onboarding overlay displayed');
        } else {
            console.error('[AppInit] Onboarding overlay not found');
            this.showMainApp();
            return;
        }
        
        // Wait for user to complete onboarding
        await this.waitForOnboardingComplete();
        console.log('[AppInit] Onboarding completed');
        
        // After onboarding, check if quest giver is due
        if (this.questGiverDue) {
            await this.showQuestGiverFlow();
        } else {
            this.showMainApp();
        }
    }
    
    /**
     * Wait for onboarding to be completed
     */
    waitForOnboardingComplete() {
        return new Promise(resolve => {
            console.log('[AppInit] Waiting for onboarding completion...');
            
            // Poll for onboarding completion
            const checkInterval = setInterval(() => {
                const hasChosen = localStorage.getItem('hasChosenMonster');
                if (hasChosen === 'true') {
                    clearInterval(checkInterval);
                    console.log('[AppInit] Onboarding completion detected');
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 minutes (user might have left)
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('[AppInit] Onboarding timeout - showing main app anyway');
                resolve();
            }, 300000);
        });
    }
    
    /**
     * Show quest giver flow
     */
    async showQuestGiverFlow() {
        console.log('[AppInit] Showing quest giver flow');
        
        // Keep main app hidden until quest giver is handled
        document.documentElement.style.visibility = 'hidden';
        
        // Show quest giver modal (the prompt asking if user wants a quest)
        if (window.questGiver) {
            window.questGiver.show();
            console.log('[AppInit] Quest giver modal displayed');
        } else {
            console.error('[AppInit] Quest giver not available');
            this.showMainApp();
        }
        
        // Note: Quest giver will handle:
        // - Showing the quest UI when user clicks "Yes"
        // - Revealing main app when dismissed or "No" is clicked
    }
    
    /**
     * Show main app (final step)
     */
    showMainApp() {
        console.log('[AppInit] Showing main app');
        
        // Reveal the main app UI
        document.documentElement.style.visibility = 'visible';
        
        // Generate daily challenge if not already done
        if (window.generateDailyChallenge) {
            window.generateDailyChallenge();
        }
        
        console.log('[AppInit] Main app visible');
    }
    
    /**
     * Reset initialization state (for testing/debugging)
     */
    reset() {
        this.initialized = false;
        this.isFirstTime = false;
        this.questGiverDue = false;
        console.log('[AppInit] Reset complete');
    }
}

// Create global instance
window.appInitializer = new AppInitializer();

// Export for debugging
window.resetAppInitializer = () => {
    window.appInitializer.reset();
    console.log('[AppInit] Initializer reset - reload page to test');
};

console.log('[AppInit] AppInitializer loaded and ready');

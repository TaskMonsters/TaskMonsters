/**
 * AudioManager - Complete Audio System with Sound Effects Only
 * Optimized for low-power devices (iPhone 8+)
 * Features: Full sound effects library (battle music removed)
 */

class AudioManager {
    constructor() {
        // Audio state
        this.enabled = localStorage.getItem('soundEnabled') !== 'false'; // Default ON
        
        // Track active sounds for cleanup
        this.activeSounds = new Set();
        
        // Volume settings
        this.sfxVolume = 1.0;    // Full volume for sound effects
        
        // Sound effects library
        this.sounds = {
            // Regular attack (user melee)
            regular_attack: 'assets/sounds/regular attack sound.mp3',
            
            // Special attacks
            spark_attack: 'assets/sounds/Spark Attack sound.mp3',
            prickler_attack: 'assets/sounds/Prickler.mp3',
            freeze_attack: 'assets/sounds/Freeze attack sound.mp3',
            
            // Items
            cloak_use: 'assets/sounds/Invisibility Cloak sound.mp3',
            potion_use: 'assets/sounds/Anytime user uses potion or power boost.mp3',
            
            // Battle events
            enemy_regular_attack: 'assets/sounds/monsterregularattacksound.mp3',
            enemy_fifth_attack: 'assets/sounds/enemyevery5thattacksound.mp3',
            enemy_strong_attack: 'assets/sounds/Stronger enemy attack sound.mp3',
            critical_hit: 'assets/sounds/When users monster deals over 10 damage.mp3',
            third_attack: 'assets/sounds/every 3rd attack by users monsters.mp3',
            battle_victory: 'assets/sounds/when user wins any battle.mp3',
            
            // UI sounds
            quest_complete: 'assets/sounds/Quest Giver Task Complete Accepted sound.mp3',
            taskComplete: 'assets/sounds/taskComplete.mp3',
            shopPurchase: 'assets/sounds/shopPurchase.mp3',
            useItemOutside: 'assets/sounds/useItemOutside.mp3'
        };
        
        // Cache for loaded audio elements
        this.audioCache = {};
        
        // Initialize on first user interaction (required for iOS)
        this.initialized = false;
    }
    
    /**
     * Initialize AudioContext on first user interaction
     * Required for iOS audio playback
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.initialized = true;
            console.log('[AudioManager] Initialized with sound effects only');
        } catch (error) {
            console.warn('[AudioManager] Initialization skipped:', error.message);
        }
    }
    
    /**
     * Play a sound effect (one-shot, non-looping)
     * @param {string} soundId - Sound identifier from this.sounds
     * @param {number} volume - Optional volume override (0-1)
     */
    playSound(soundId, volume = null) {
        if (!this.enabled || !this.sounds[soundId]) return;
        
        // Ensure initialized
        this.init();
        
        try {
            // Create or reuse audio element
            let audio = this.audioCache[soundId];
            if (!audio) {
                audio = new Audio(this.sounds[soundId]);
                audio.volume = volume !== null ? volume : this.sfxVolume;
                this.audioCache[soundId] = audio;
            }
            
            // Clone for concurrent playback
            const soundInstance = audio.cloneNode();
            soundInstance.volume = volume !== null ? volume : this.sfxVolume;
            
            // Track active sound
            this.activeSounds.add(soundInstance);
            
            // Remove from active set when finished
            soundInstance.addEventListener('ended', () => {
                this.activeSounds.delete(soundInstance);
            });
            
            // Play asynchronously
            soundInstance.play().catch(err => {
                console.warn(`[AudioManager] Sound playback failed for ${soundId}:`, err.message);
                this.activeSounds.delete(soundInstance);
            });
            
        } catch (error) {
            console.warn(`[AudioManager] Error playing sound ${soundId}:`, error.message);
        }
    }
    
    /**
     * Play battle music - DISABLED (music removed)
     * This method is kept for compatibility but does nothing
     */
    playBattleMusic() {
        console.log('[AudioManager] Battle music disabled - sound effects only');
        return;
    }
    
    /**
     * Play quest giver music - DISABLED (music removed)
     * This method is kept for compatibility but does nothing
     */
    playQuestMusic() {
        console.log('[AudioManager] Quest music disabled - sound effects only');
        return;
    }
    
    /**
     * Stop current background music - DISABLED (music removed)
     * This method is kept for compatibility but does nothing
     */
    stopMusic() {
        console.log('[AudioManager] No music to stop - sound effects only');
        return;
    }
    
    /**
     * Stop all sounds (effects only)
     */
    stopAll() {
        // Stop all active sound effects
        this.activeSounds.forEach(sound => {
            try {
                sound.pause();
                sound.currentTime = 0;
            } catch (error) {
                // Ignore errors on cleanup
            }
        });
        
        this.activeSounds.clear();
    }
    
    /**
     * Toggle audio on/off
     * @param {boolean} on - True to enable, false to disable
     */
    toggleAudio(on) {
        this.enabled = on;
        localStorage.setItem('soundEnabled', on);
        
        if (!on) {
            this.stopAll();
        }
        
        return this.enabled;
    }
    
    /**
     * Legacy compatibility methods
     */
    toggleSound() {
        return this.toggleAudio(!this.enabled);
    }
    
    toggleMute() {
        return this.toggleAudio(!this.enabled);
    }
    
    mute() {
        this.toggleAudio(false);
    }
    
    unmute() {
        this.toggleAudio(true);
    }
    
    setSoundEnabled(enabled) {
        this.toggleAudio(enabled);
    }
    
    /**
     * Legacy compatibility - loadAllSounds
     */
    async loadAllSounds() {
        console.log('[AudioManager] Using lazy loading - sounds load on-demand');
        return Object.keys(this.sounds).length + 2; // sounds + 2 battle tracks
    }
    
    /**
     * Handle visibility change - DISABLED (no music to pause)
     * This method is kept for compatibility but does nothing
     */
    handleVisibilityChange() {
        // No music to pause/resume
        return;
    }
}

// Create global AudioManager instance
window.audioManager = new AudioManager();

// Handle tab visibility for battery saving
document.addEventListener('visibilitychange', () => {
    window.audioManager.handleVisibilityChange();
});

// Initialize on first user interaction
document.addEventListener('click', () => {
    window.audioManager.init();
}, { once: true });

console.log('[AudioManager] Loaded with sound effects only (battle music removed)');

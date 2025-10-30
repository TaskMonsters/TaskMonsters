/**
 * AudioManager - Complete Audio System with Alternating Battle Music
 * Optimized for low-power devices (iPhone 8+)
 * Features: Alternating battle tracks, full sound effects, independent toggles
 */

class AudioManager {
    constructor() {
        // Audio state
        this.enabled = localStorage.getItem('soundEnabled') !== 'false'; // Default ON
        this.musicEnabled = true;
        this.currentBattleTrack = 1; // Alternates between 1 and 2
        
        // Track active sounds for cleanup
        this.activeSounds = new Set();
        this.currentMusic = null;
        
        // Volume settings
        this.musicVolume = 0.4;  // Low volume for background music
        this.sfxVolume = 1.0;    // Full volume for sound effects
        
        // Sound file paths - Battle Music (Alternating)
        this.battleMusic = {
            track1: new Audio('assets/sounds/BattleArenamusic1(lowvolume).mp3'),
            track2: new Audio('assets/sounds/BattleArenamusic2(lowvolume).mp3')
        };
        
        // Configure battle music tracks
        Object.values(this.battleMusic).forEach(track => {
            track.loop = true;
            track.volume = this.musicVolume;
            track.preload = 'auto';
        });
        
        // Quest giver music
        this.questMusic = new Audio('assets/sounds/Quest Giver Mode music.mp3');
        this.questMusic.loop = true;
        this.questMusic.volume = this.musicVolume;
        this.questMusic.preload = 'auto';
        
        // Sound effects library
        this.sounds = {
            // Special attacks
            spark_attack: 'assets/sounds/Spark Attack sound.mp3',
            prickler_attack: 'assets/sounds/Prickler.mp3',
            freeze_attack: 'assets/sounds/Freeze attack sound.mp3',
            
            // Items
            cloak_use: 'assets/sounds/Invisibility Cloak sound.mp3',
            potion_use: 'assets/sounds/Anytime user uses potion or power boost.mp3',
            
            // Battle events
            enemy_strong_attack: 'assets/sounds/Stronger enemy attack sound.mp3',
            critical_hit: 'assets/sounds/When users monster deals over 10 damage.mp3',
            third_attack: 'assets/sounds/every 3rd attack by users monsters.mp3',
            battle_victory: 'assets/sounds/when user wins any battle.mp3',
            
            // UI sounds
            quest_complete: 'assets/sounds/Quest Giver Task Complete:Accepted sound.mp3',
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
            // Preload battle music
            Object.values(this.battleMusic).forEach(track => {
                track.load();
            });
            
            // Safari unlock - play and pause immediately
            Object.values(this.battleMusic).forEach(track => {
                track.play().then(() => track.pause()).catch(() => {});
            });
            
            this.initialized = true;
            console.log('[AudioManager] Initialized with alternating battle music');
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
     * Play alternating battle music
     * Switches between track1 and track2 each time a battle starts
     */
    playBattleMusic() {
        if (!this.enabled || !this.musicEnabled) return;
        
        // Ensure initialized
        this.init();
        
        try {
            // Stop any currently playing music
            this.stopMusic();
            
            // Select next track (alternates)
            const nextTrack = this.currentBattleTrack === 1 ? this.battleMusic.track1 : this.battleMusic.track2;
            
            console.log(`[AudioManager] Playing battle music track ${this.currentBattleTrack}`);
            
            // Set volume and loop
            nextTrack.volume = this.musicVolume;
            nextTrack.loop = true;
            nextTrack.currentTime = 0;
            
            // Play the track
            nextTrack.play().catch(err => {
                console.warn('[AudioManager] Battle music playback failed:', err.message);
            });
            
            this.currentMusic = nextTrack;
            
            // Alternate for next battle
            this.currentBattleTrack = this.currentBattleTrack === 1 ? 2 : 1;
            
        } catch (error) {
            console.warn('[AudioManager] Error playing battle music:', error.message);
        }
    }
    
    /**
     * Play quest giver music
     */
    playQuestMusic() {
        if (!this.enabled || !this.musicEnabled) return;
        
        // Ensure initialized
        this.init();
        
        try {
            // Stop any currently playing music
            this.stopMusic();
            
            this.questMusic.volume = this.musicVolume;
            this.questMusic.loop = true;
            this.questMusic.currentTime = 0;
            
            this.questMusic.play().catch(err => {
                console.warn('[AudioManager] Quest music playback failed:', err.message);
            });
            
            this.currentMusic = this.questMusic;
            
        } catch (error) {
            console.warn('[AudioManager] Error playing quest music:', error.message);
        }
    }
    
    /**
     * Stop current background music
     */
    stopMusic() {
        // Stop all battle tracks
        Object.values(this.battleMusic).forEach(track => {
            try {
                track.pause();
                track.currentTime = 0;
            } catch (error) {
                // Ignore errors on cleanup
            }
        });
        
        // Stop quest music
        try {
            this.questMusic.pause();
            this.questMusic.currentTime = 0;
        } catch (error) {
            // Ignore errors on cleanup
        }
        
        this.currentMusic = null;
    }
    
    /**
     * Stop all sounds (music + effects)
     */
    stopAll() {
        this.stopMusic();
        
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
     * Pause audio when tab is hidden (battery saving)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause music when tab hidden
            if (this.currentMusic && !this.currentMusic.paused) {
                this.currentMusic.pause();
                this.currentMusic._wasPlayingBeforeHide = true;
            }
        } else {
            // Resume music when tab visible
            if (this.currentMusic && this.currentMusic._wasPlayingBeforeHide) {
                this.currentMusic.play().catch(() => {});
                this.currentMusic._wasPlayingBeforeHide = false;
            }
        }
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

console.log('[AudioManager] Loaded with alternating battle music system');

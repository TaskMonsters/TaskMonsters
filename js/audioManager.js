/**
 * AudioManager - Complete Audio System with Sound Effects and Music
 * Optimized for low-power devices (iPhone 8+)
 * Features: Full sound effects library and background music
 */

class AudioManager {
    constructor() {
        // Audio state
        this.enabled = localStorage.getItem("soundEnabled") !== "false"; // Default ON
        this.battleMusicAudio = null; // New property for battle music
        this.battleMusicVolume = 0.4; // Default volume for battle music

        // Track active sounds for cleanup
        this.activeSounds = new Set();

        // Volume settings
        this.sfxVolume = 1.0; // Full volume for sound effects

        // Sound effects library
        this.sounds = {
            // Regular attack (user melee)
            regular_attack: "assets/sounds/regular attack sound.mp3",

            // Special attacks
            spark_attack: "assets/sounds/Spark Attack sound.mp3",
            prickler_attack: "assets/sounds/Prickler.mp3",
            freeze_attack: "assets/sounds/Freeze attack sound.mp3",

            // Items
            cloak_use: "assets/sounds/Invisibility Cloak sound.mp3",
            potion_use: "assets/sounds/potionUse.mp3", // New potion sound

            // Battle events
            enemy_regular_attack: "assets/sounds/monsterregularattacksound.mp3",
            enemy_fifth_attack: "assets/sounds/enemyevery5thattacksound.mp3",
            enemy_strong_attack: "assets/sounds/Stronger enemy attack sound.mp3",
            enemy_attack_low_level: "assets/sounds/enemyattacksound2.mp3",
            critical_hit: "assets/sounds/When users monster deals over 10 damage.mp3",
            third_attack: "assets/sounds/every 3rd attack by users monsters.mp3",
            battle_victory: "assets/sounds/when user wins any battle.mp3",

            // Defense sounds
            defend: "assets/sounds/Defend.mp3",
            defense_boost: "assets/sounds/Defenseboost.mp3",

            // UI sounds
            quest_complete: "assets/sounds/Quest Giver Task Complete Accepted sound.mp3",
            taskComplete: "assets/sounds/taskComplete.mp3",
            shopPurchase: "assets/sounds/shopPurchase.mp3",
            useItemOutside: "assets/sounds/useItemOutside.mp3",
            focus_timer_complete: "assets/sounds/Focustimerdonesound.mp3",
        };

        // Music tracks (separate from sound effects)
        this.music = {
            quest_giver: "assets/sounds/Quest Giver Mode music.mp3",
            battle: "assets/sounds/battlemodemusic.mp3", // New battle music
        };

        // Current music track
        this.currentMusic = null;

        // Cache for loaded audio elements
        this.audioCache = {};

        // Initialize on first user interaction (required for iOS)
        this.initialized = false;
    }

    /**
     * Get sound enabled status
     */
    get soundEnabled() {
        return this.enabled;
    }

    /**
     * Initialize AudioContext on first user interaction
     * Required for iOS audio playback
     */
    init() {
        if (this.initialized) return;

        try {
            this.initialized = true;
            console.log("[AudioManager] Initialized with sound effects and music");
        } catch (error) {
            console.warn("[AudioManager] Initialization skipped:", error.message);
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
            soundInstance.addEventListener("ended", () => {
                this.activeSounds.delete(soundInstance);
            });

            // Play asynchronously
            soundInstance.play().catch((err) => {
                console.warn(`[AudioManager] Sound playback failed for ${soundId}:`, err.message);
                this.activeSounds.delete(soundInstance);
            });
        } catch (error) {
            console.warn(`[AudioManager] Error playing sound ${soundId}:`, error.message);
        }
    }

    /**
     * Play battle music
     * This method starts the battle music, which loops in the background
     */
    playBattleMusic() {
        if (!this.enabled || !this.music.battle) return;

        // Stop any currently playing music
        this.stopMusic();

        try {
            this.battleMusicAudio = new Audio(this.music.battle);
            this.battleMusicAudio.volume = this.battleMusicVolume;
            this.battleMusicAudio.loop = true;

            this.battleMusicAudio.play().catch((err) => {
                console.warn("[AudioManager] Battle music playback failed:", err.message);
                this.battleMusicAudio = null;
            });

            console.log("[AudioManager] Battle music started");
        } catch (error) {
            console.warn("[AudioManager] Error playing battle music:", error.message);
        }
    }

    /**
     * Play quest giver music
     */
    playQuestMusic() {
        if (!this.enabled || !this.music.quest_giver) return;

        // Stop any currently playing music
        this.stopMusic();

        try {
            this.currentMusic = new Audio(this.music.quest_giver);
            this.currentMusic.volume = 0.4; // Lower volume for background music
            this.currentMusic.loop = true;

            this.currentMusic.play().catch((err) => {
                console.warn("[AudioManager] Quest music playback failed:", err.message);
                this.currentMusic = null;
            });

            console.log("[AudioManager] Quest giver music started");
        } catch (error) {
            console.warn("[AudioManager] Error playing quest music:", error.message);
        }
    }

    /**
     * Stop current background music (Quest or Battle)
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
                this.currentMusic = null;
                console.log("[AudioManager] Quest Music stopped");
            } catch (error) {
                console.warn("[AudioManager] Error stopping quest music:", error.message);
            }
        }

        if (this.battleMusicAudio) {
            try {
                this.battleMusicAudio.pause();
                this.battleMusicAudio.currentTime = 0;
                this.battleMusicAudio = null;
                console.log("[AudioManager] Battle Music stopped");
            } catch (error) {
                console.warn("[AudioManager] Error stopping battle music:", error.message);
            }
        }
    }

    /**
     * Stop all sounds (effects and music)
     */
    stopAll() {
        // Stop all active sound effects
        this.activeSounds.forEach((sound) => {
            try {
                sound.pause();
                sound.currentTime = 0;
            } catch (error) {
                // Ignore errors on cleanup
            }
        });

        this.activeSounds.clear();

        // Stop music
        this.stopMusic();
    }

    /**
     * Toggle audio on/off
     * @param {boolean} on - True to enable, false to disable
     */
    toggleAudio(on) {
        this.enabled = on;
        localStorage.setItem("soundEnabled", on);

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
        console.log("[AudioManager] Using lazy loading - sounds load on-demand");
        return Object.keys(this.sounds).length + 2; // sounds + 2 music tracks
    }

    /**
     * Handle visibility change
     * This method pauses or resumes music when the tab visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.currentMusic) this.currentMusic.pause();
            if (this.battleMusicAudio) this.battleMusicAudio.pause();
        } else {
            if (this.currentMusic) this.currentMusic.play().catch(err => console.warn('[AudioManager] Quest music resume failed:', err.message));
            if (this.battleMusicAudio) this.battleMusicAudio.play().catch(err => console.warn('[AudioManager] Battle music resume failed:', err.message));
        }
    }
}

// Create global AudioManager instance
window.audioManager = new AudioManager();

// Handle tab visibility for battery saving
document.addEventListener("visibilitychange", () => {
    window.audioManager.handleVisibilityChange();
});

// Initialize on first user interaction
document.addEventListener("click", () => {
    window.audioManager.init();
}, { once: true });

console.log("[AudioManager] Loaded with sound effects and music.");

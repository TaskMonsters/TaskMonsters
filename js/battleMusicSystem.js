// Battle Music System
// Dynamic tier-based music with smooth transitions

class BattleMusicSystem {
    constructor() {
        this.currentTrack = null;
        this.currentAudio = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.fadeInterval = null;
    }
    
    // Initialize music system
    init() {
        // Check if audio manager exists
        if (window.audioManager) {
            this.volume = window.audioManager.musicVolume || 0.5;
        }
    }
    
    // Play battle music based on tier
    playBattleMusic(tier, isEnraged = false) {
        let trackPath;
        
        switch(tier) {
            case 'common':
                trackPath = ASSET_CONFIG.music.common;
                break;
            case 'elite':
                trackPath = ASSET_CONFIG.music.elite;
                break;
            case 'boss':
                trackPath = isEnraged ? ASSET_CONFIG.music.bossPhase2 : ASSET_CONFIG.music.boss;
                break;
            default:
                trackPath = ASSET_CONFIG.music.common;
        }
        
        // Don't restart if same track is playing
        if (this.currentTrack === trackPath && this.isPlaying) {
            return;
        }
        
        this.switchTrack(trackPath);
    }
    
    // Switch to a new track with fade transition
    switchTrack(newTrackPath) {
        // Fade out current track
        if (this.currentAudio && this.isPlaying) {
            this.fadeOut(() => {
                this.playTrack(newTrackPath);
            });
        } else {
            this.playTrack(newTrackPath);
        }
    }
    
    // Play a specific track
    playTrack(trackPath) {
        // Stop current track
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        // Create new audio element
        this.currentAudio = new Audio(trackPath);
        this.currentAudio.loop = true;
        this.currentAudio.volume = 0;
        this.currentTrack = trackPath;
        
        // Play and fade in
        this.currentAudio.play().then(() => {
            this.isPlaying = true;
            this.fadeIn();
        }).catch(error => {
            console.error('Error playing battle music:', error);
        });
    }
    
    // Fade in current track
    fadeIn() {
        if (!this.currentAudio) return;
        
        const targetVolume = this.volume;
        const steps = 20;
        const increment = targetVolume / steps;
        const interval = 50;
        
        let currentStep = 0;
        
        this.fadeInterval = setInterval(() => {
            if (currentStep >= steps || !this.currentAudio) {
                clearInterval(this.fadeInterval);
                if (this.currentAudio) {
                    this.currentAudio.volume = targetVolume;
                }
                return;
            }
            
            this.currentAudio.volume = Math.min(targetVolume, increment * currentStep);
            currentStep++;
        }, interval);
    }
    
    // Fade out current track
    fadeOut(callback) {
        if (!this.currentAudio) {
            if (callback) callback();
            return;
        }
        
        const startVolume = this.currentAudio.volume;
        const steps = 20;
        const decrement = startVolume / steps;
        const interval = 50;
        
        let currentStep = 0;
        
        this.fadeInterval = setInterval(() => {
            if (currentStep >= steps || !this.currentAudio) {
                clearInterval(this.fadeInterval);
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio = null;
                }
                this.isPlaying = false;
                if (callback) callback();
                return;
            }
            
            this.currentAudio.volume = Math.max(0, startVolume - (decrement * currentStep));
            currentStep++;
        }, interval);
    }
    
    // Play victory music
    playVictory() {
        this.fadeOut(() => {
            const victoryAudio = new Audio(ASSET_CONFIG.music.victory);
            victoryAudio.volume = this.volume;
            victoryAudio.play().catch(error => {
                console.error('Error playing victory music:', error);
            });
        });
    }
    
    // Play defeat music
    playDefeat() {
        this.fadeOut(() => {
            const defeatAudio = new Audio(ASSET_CONFIG.music.defeat);
            defeatAudio.volume = this.volume;
            defeatAudio.play().catch(error => {
                console.error('Error playing defeat music:', error);
            });
        });
    }
    
    // Stop all music
    stop() {
        this.fadeOut();
    }
    
    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
    }
    
    // Trigger boss enrage music
    triggerEnrage() {
        if (this.currentTrack === ASSET_CONFIG.music.boss) {
            this.switchTrack(ASSET_CONFIG.music.bossPhase2);
            addBattleLog('🔥 Boss entered ENRAGE MODE! Music intensifies!');
        }
    }
}

// Create global instance
const battleMusicSystem = new BattleMusicSystem();

// Export to window
if (typeof window !== 'undefined') {
    window.BattleMusicSystem = BattleMusicSystem;
    window.battleMusicSystem = battleMusicSystem;
}

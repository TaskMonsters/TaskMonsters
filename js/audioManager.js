/**
 * AudioManager.js
 * Handles the loading and playback of all game sounds and music.
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.music = {};
        this.currentMusicSource = null;
        this.isMusicPlaying = false;
        this.basePath = 'assets/sounds/';
        this.soundEnabled = true;
        this.initialized = false;
        
        // Load sound preference from localStorage
        const savedPreference = localStorage.getItem('soundEnabled');
        if (savedPreference !== null) {
            this.soundEnabled = savedPreference === 'true';
        }
    }

    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 AudioContext initialized');
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
        }
    }

    async loadSound(name, filename) {
        if (!this.audioContext) {
            await this.init();
        }
        
        const path = this.basePath + filename;
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (name.includes('Music')) {
                this.music[name] = audioBuffer;
            } else {
                this.sounds[name] = audioBuffer;
            }
            console.log(`✓ Loaded audio: ${name}`);
            return true;
        } catch (error) {
            console.warn(`Missing sound: ${name}`);
            return false;
        }
    }

    playSound(name, volume = 1.0) {
        if (!this.soundEnabled || !this.initialized) return;
        
        // Resume AudioContext if suspended (required by browser autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const buffer = this.sounds[name];
        if (!buffer) {
            console.warn(`Sound not loaded: ${name}`);
            return;
        }

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start(0);
        } catch (error) {
            console.error(`Error playing sound ${name}:`, error);
        }
    }

    playMusic(name, volume = 0.5) {
        if (!this.soundEnabled || !this.initialized) return;
        
        // Resume AudioContext if suspended (required by browser autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const buffer = this.music[name];
        if (!buffer) {
            console.warn(`Music not loaded: ${name}`);
            return;
        }

        try {
            // Stop any currently playing music
            this.stopMusic();

            this.currentMusicSource = this.audioContext.createBufferSource();
            this.currentMusicSource.buffer = buffer;
            this.currentMusicSource.loop = true;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;

            this.currentMusicSource.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            this.currentMusicSource.start(0);
            this.isMusicPlaying = true;
        } catch (error) {
            console.error(`Error playing music ${name}:`, error);
        }
    }

    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.stop();
                this.currentMusicSource.disconnect();
            } catch (error) {
                // Source may already be stopped
            }
            this.currentMusicSource = null;
            this.isMusicPlaying = false;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        
        if (!this.soundEnabled) {
            this.stopMusic();
        } else {
            // Resume AudioContext when sound is enabled
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('🔊 Audio enabled - AudioContext resumed');
                });
            }
        }
        
        return this.soundEnabled;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('soundEnabled', enabled.toString());
        
        if (!enabled) {
            this.stopMusic();
        } else {
            // Resume AudioContext when sound is enabled
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('🔊 Audio enabled - AudioContext resumed');
                });
            }
        }
    }

    async loadAllSounds() {
        await this.init();
        
        const soundMap = {
            // Sound Effects
            'monsterAttack': 'monsterAttack.mp3',
            'fireball': 'fireball.mp3',
            'useItemBattle': 'useItemBattle.mp3',
            'useItemOutside': 'useItemOutside.mp3',
            'shopPurchase': 'shopPurchase.mp3',
            'enemyAttack': 'enemyAttack.mp3',
            'taskComplete': 'taskComplete.mp3',
            
            // Music
            'battleMusic': 'battleMusic.mp3',
            'questGiver': 'questGiver.mp3'
        };

        const loadPromises = Object.keys(soundMap).map(name => 
            this.loadSound(name, soundMap[name])
        );

        const results = await Promise.allSettled(loadPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
        console.log(`🔊 Audio system initialized: ${successCount}/${results.length} files loaded`);
        
        return successCount;
    }
}

// Create global audioManager instance
const audioManager = new AudioManager();
window.audioManager = audioManager;

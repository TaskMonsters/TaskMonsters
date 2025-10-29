/**
 * AudioManager.js
 * Handles the loading and playback of all game sounds and music.
 */

class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.music = {};
        this.currentMusicSource = null;
        this.isMusicPlaying = false;
        this.basePath = 'assets/audio/'; // Path to the audio files
    }

    async loadSound(name, filename) {
        const path = this.basePath + filename;
        try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (name.includes('Music')) {
                this.music[name] = audioBuffer;
            } else {
                this.sounds[name] = audioBuffer;
            }
            console.log(`Loaded audio: ${name}`);
        } catch (error) {
            console.error(`Error loading audio file ${path}:`, error);
        }
    }

    playSound(name, volume = 1.0) {
        const buffer = this.sounds[name];
        if (!buffer) {
            console.warn(`Sound not loaded: ${name}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
    }

    playMusic(name, volume = 0.5) {
        const buffer = this.music[name];
        if (!buffer) {
            console.warn(`Music not loaded: ${name}`);
            return;
        }

        // Stop any currently playing music
        this.stopMusic();

        this.currentMusicSource = this.audioContext.createBufferSource();
        this.currentMusicSource.buffer = buffer;
        this.currentMusicSource.loop = true; // Music should loop

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume;

        this.currentMusicSource.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        this.currentMusicSource.start(0);
        this.isMusicPlaying = true;
    }

    stopMusic() {
        if (this.currentMusicSource) {
            this.currentMusicSource.stop();
            this.currentMusicSource.disconnect();
            this.currentMusicSource = null;
            this.isMusicPlaying = false;
        }
    }

    async loadAllSounds() {
        const soundMap = {
            // Sound Effects
            'monsterAttack': 'Monster Attack.mp3',
            'fireball': 'Fireball.mp3',
            'useItemBattle': 'When users use any item during a battle or use items outside of battle.mp3',
            'useItemOutsideBattle': 'When users use any item outside of battle mode.mp3',
            'shopPurchase': 'When users buy any item from the shop or themes pages.mp3',
            'enemyAttack': 'Enemy Attack.mp3',
            'taskComplete': 'Quick Task & Regular Task Completion.mp3',
            
            // Music
            'battleMusic': 'Battle Mode Music.mp3',
            'questGiverMusic': 'Quest Giver Mode.mp3'
        };

        const loadPromises = Object.keys(soundMap).map(name => 
            this.loadSound(name, soundMap[name])
        );

        await Promise.all(loadPromises);
    }
}

// Create global audioManager instance
const audioManager = new AudioManager();
window.audioManager = audioManager;


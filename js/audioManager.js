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
        this.basePath = '../upload/'; // Path to the uploaded audio files
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
            'monsterAttack': 'MonsterAttack.mp3',
            'fireball': 'Fireball.mp3',
            'useItemBattle': 'Whenusersuseanyitemduringabattleoruseitemsoutsideofbattle.mp3',
            'useItemOutsideBattle': 'Whenusersuseanyitemoutsideofbattlemode.mp3',
            'shopPurchase': 'Whenusersbuyanyitemfromtheshoporthemespages.mp3',
            'enemyAttack': 'EnemyAttack.mp3',
            'taskComplete': 'QuickTask&RegularTaskCompletion.mp3',
            
            // Music
            'battleMusic': 'BattleModeMusic.mp3',
            'questGiverMusic': 'QuestGiverMode.mp3'
        };

        const loadPromises = Object.keys(soundMap).map(name => 
            this.loadSound(name, soundMap[name])
        );

        await Promise.all(loadPromises);
    }
}

export const audioManager = new AudioManager();


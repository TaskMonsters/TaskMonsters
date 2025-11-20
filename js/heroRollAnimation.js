// ========================================
// HERO ROLL ANIMATION SYSTEM
// ========================================
// Handles roll animation for Cloak/Invisibility Cloak action
// Uses sprites from Hero Animations pack

// Roll animation configuration for each hero/monster
const ROLL_ANIMATION_CONFIG = {
    Pink_Monster: {
        sprite: 'assets/heroes/Pink_Monster_Roll.png',
        frames: 6,
        frameWidth: 32,
        frameHeight: 32,
        frameDuration: 100 // ms per frame
    },
    Owlet_Monster: {
        sprite: 'assets/heroes/Owlet_Monster_Roll.png',
        frames: 6,
        frameWidth: 32,
        frameHeight: 32,
        frameDuration: 100
    },
    Dude_Monster: {
        sprite: 'assets/heroes/Dude_Monster_Roll.png',
        frames: 6,
        frameWidth: 32,
        frameHeight: 32,
        frameDuration: 100
    }
};

// Track if roll animation is currently playing
let isRolling = false;

/**
 * Play roll animation for the current hero
 * @param {Function} onComplete - Callback when animation completes
 * @returns {Promise} Resolves when animation completes
 */
async function playHeroRollAnimation(onComplete = null) {
    if (isRolling) {
        console.warn('Roll animation already playing');
        return;
    }
    
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('Hero sprite element not found');
        return;
    }
    
    // Get current hero/monster type
    const spritePrefix = localStorage.getItem('heroSpritePrefix') || 'Pink_Monster';
    const config = ROLL_ANIMATION_CONFIG[spritePrefix];
    
    if (!config) {
        console.error(`No roll animation config for: ${spritePrefix}`);
        return;
    }
    
    isRolling = true;
    
    // Store original animation state
    const originalBackgroundImage = heroSprite.style.backgroundImage;
    const originalBackgroundSize = heroSprite.style.backgroundSize;
    const originalAnimation = heroSprite.style.animation;
    
    // Set up roll animation
    const totalWidth = config.frames * config.frameWidth;
    heroSprite.style.backgroundImage = `url('${config.sprite}')`;
    heroSprite.style.backgroundSize = `${totalWidth}px ${config.frameHeight}px`;
    heroSprite.style.backgroundRepeat = 'no-repeat';
    heroSprite.style.width = `${config.frameWidth}px`;
    heroSprite.style.height = `${config.frameHeight}px`;
    heroSprite.style.imageRendering = 'pixelated';
    
    // Animate through frames
    const totalDuration = config.frames * config.frameDuration;
    let currentFrame = 0;
    
    return new Promise((resolve) => {
        const frameInterval = setInterval(() => {
            const xPos = -(currentFrame * config.frameWidth);
            heroSprite.style.backgroundPosition = `${xPos}px 0`;
            
            currentFrame++;
            
            if (currentFrame >= config.frames) {
                clearInterval(frameInterval);
                
                // Return to idle animation
                returnToIdleAnimation(heroSprite, spritePrefix);
                
                isRolling = false;
                
                if (onComplete) {
                    onComplete();
                }
                
                resolve();
            }
        }, config.frameDuration);
    });
}

/**
 * Return hero to idle animation after roll
 * @param {HTMLElement} heroSprite - Hero sprite element
 * @param {string} spritePrefix - Hero type prefix
 */
function returnToIdleAnimation(heroSprite, spritePrefix) {
    // Use the existing startHeroAnimation function if available
    if (typeof window.startHeroAnimation === 'function') {
        window.startHeroAnimation('idle');
    } else {
        // Fallback: set idle sprite manually
        heroSprite.style.backgroundImage = `url('assets/heroes/${spritePrefix}_Idle_4.png')`;
        heroSprite.style.backgroundSize = '128px 32px'; // 4 frames * 32px
        heroSprite.style.width = '32px';
        heroSprite.style.height = '32px';
        heroSprite.style.animation = 'hero-idle-anim 0.8s steps(4) infinite';
    }
}

/**
 * Check if roll animation is currently playing
 * @returns {boolean}
 */
function isRollAnimationPlaying() {
    return isRolling;
}

// Export to window
window.playHeroRollAnimation = playHeroRollAnimation;
window.isRollAnimationPlaying = isRollAnimationPlaying;

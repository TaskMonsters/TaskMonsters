// Enemy Sprite Initialization for Battle
// FIXED: Uses animated GIFs when available, static PNG fallback otherwise
// CRITICAL: Prevents sprite sheet rows from displaying - uses static fallback if animation fails

function initEnemySprite(enemyData) {
    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement) return;
    
    // CRITICAL: Reset all visibility and display properties
    spriteElement.style.opacity = '1';
    spriteElement.style.display = 'block';
    spriteElement.style.visibility = 'visible';
    
    // Clear all classes and start fresh
    spriteElement.className = 'sprite enemy-sprite';
    spriteElement.innerHTML = '';
    
    // Remove any animations that could cause sprite sheet display issues
    spriteElement.style.animation = 'none';
    
    // Determine the correct image to use
    let imageToUse = '';
    let enemySize = 'medium'; // default size class
    let isAnimatedGif = false;
    let isSpriteSheet = false;
    let spriteSheetConfig = null;
    
    // PRIORITY 1: Check if this is The Overthinker (uses sprite sheet)
    if (enemyData.name === 'The Overthinker' && enemyData.frameCount) {
        imageToUse = 'assets/enemies/overthinker/overthinker-idle-sheet.png';
        isSpriteSheet = true;
        enemySize = 'large';
        spriteSheetConfig = {
            frameCount: enemyData.frameCount || 8,
            frameWidth: 96,
            frameHeight: 112,
            totalWidth: 768 // 96 * 8
        };
        console.log(`[Enemy] Using sprite sheet for ${enemyData.name}`);
    }
    
    // PRIORITY 2: Use animated GIF if enemy has isAnimatedGif flag and sprites.idle is a GIF
    if (enemyData.isAnimatedGif && enemyData.sprites && enemyData.sprites.idle && 
        enemyData.sprites.idle.toLowerCase().endsWith('.gif')) {
        imageToUse = enemyData.sprites.idle;
        isAnimatedGif = true;
        console.log(`[Enemy] Using animated GIF for ${enemyData.name}: ${imageToUse}`);
    }
    
    // PRIORITY 3: Map enemies to their known working images (static PNGs or GIFs)
    if (!imageToUse) {
        if (enemyData.name === 'Lazy Bat' || enemyData.name === 'Lazy Bat II') {
            imageToUse = 'assets/enemies/Lazy Bat/Bat-IdleFly.png';
            enemySize = 'large';
        } else if (enemyData.name === 'Slime' || enemyData.name === 'Slime II') {
            imageToUse = 'assets/enemies/Slothful Slime/slime-animated.gif';
            isAnimatedGif = true;
            enemySize = 'slime';
        } else if (enemyData.name === 'Ghost Task Stopper') {
            imageToUse = 'assets/enemies/Procrastination Drone/drone-animated.gif';
            isAnimatedGif = true;
            enemySize = 'small';
        } else if (enemyData.name === 'Medusa') {
            imageToUse = 'assets/enemies/Medusa/medusa-idle.png';
            enemySize = 'small';
        } else if (enemyData.name === 'Flying Eye Demon' || enemyData.name === 'Lazy Eye') {
            imageToUse = 'assets/enemies/flying-eye-idle.png';
            enemySize = 'medium';
        } else if (enemyData.name === 'Fire Skull') {
            imageToUse = 'assets/enemies/fire-skull.png';
            enemySize = 'large';
        } else if (enemyData.name === 'Ogre') {
            imageToUse = 'assets/enemies/Ogre/Sprites/Idle/ogre-idle1.png';
            enemySize = 'large';
        } else if (enemyData.name === 'Octopus') {
            imageToUse = 'assets/enemies/octopus.png';
            enemySize = 'large';
        } else if (enemyData.name === 'Alien') {
            // Use the animated GIF for Alien
            imageToUse = 'assets/enemies/Alien/alien-idle-animated.gif';
            isAnimatedGif = true;
            enemySize = 'medium';
        } else if (enemyData.name === 'Treant') {
            imageToUse = 'assets/enemies/Treant/treant-idle.png';
            enemySize = 'large';
        } else if (enemyData.name === 'Disruption Dragon') {
            imageToUse = 'assets/enemies/Disruption Dragon/disruption-dragon.gif';
            isAnimatedGif = true;
            enemySize = 'xlarge';
        } else if (enemyData.name === 'Sunny Dragon') {
            imageToUse = 'assets/enemies/dragon.png';
            enemySize = 'large';
        } else if (enemyData.name === 'Fly Drone') {
            imageToUse = 'assets/enemies/fly.png';
            enemySize = 'small';
        } else if (enemyData.name === 'Mushroom') {
            imageToUse = 'assets/enemies/mushroom.png';
            enemySize = 'large';
        } else {
            // Fallback: try to use idle sprite from enemyData
            imageToUse = enemyData.sprites?.idle || 'assets/enemies/default-enemy.png';
            enemySize = 'medium';
        }
    }
    
    // CRITICAL: For sprite sheets, apply proper CSS animation to prevent rows showing
    if (isSpriteSheet && spriteSheetConfig) {
        // Create an img element for sprite sheet
        const imgElement = document.createElement('img');
        imgElement.src = imageToUse;
        imgElement.alt = enemyData.name;
        
        // CRITICAL: Set exact dimensions to show only one frame
        imgElement.style.width = `${spriteSheetConfig.frameWidth}px`;
        imgElement.style.height = `${spriteSheetConfig.frameHeight}px`;
        imgElement.style.objectFit = 'none';
        imgElement.style.objectPosition = '0 0';
        imgElement.style.imageRendering = 'pixelated';
        
        // Clear background and add img element
        spriteElement.style.backgroundImage = 'none';
        spriteElement.innerHTML = '';
        spriteElement.appendChild(imgElement);
        
        // Force reflow to ensure styles are applied
        void imgElement.offsetHeight;
        
        // Apply CSS animation inline immediately
        const animDuration = 1.0; // 1 second for 8 frames
        const animName = `enemy-idle-${spriteSheetConfig.frameCount}frames`;
        imgElement.style.animation = `${animName} ${animDuration}s steps(${spriteSheetConfig.frameCount}) infinite`;
        
        // Create keyframes dynamically if they don't exist
        const styleId = `enemy-anim-${spriteSheetConfig.frameCount}`;
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            const endPos = -(spriteSheetConfig.totalWidth - spriteSheetConfig.frameWidth);
            style.textContent = `
                @keyframes ${animName} {
                    from { object-position: 0 0; }
                    to { object-position: ${endPos}px 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log(`[Enemy] Initialized sprite sheet: ${enemyData.name} with ${spriteSheetConfig.frameCount} frames`);
    } else if (isAnimatedGif) {
        // CRITICAL: For animated GIFs, use <img> element instead of background-image
        // This ensures proper GIF animation without sprite sheet issues
        // Create an img element for proper GIF animation
        const imgElement = document.createElement('img');
        imgElement.src = imageToUse;
        imgElement.alt = enemyData.name;
        imgElement.style.width = '100%';
        imgElement.style.height = '100%';
        imgElement.style.objectFit = 'contain';
        imgElement.style.imageRendering = 'pixelated';
        
        // Clear background and add img element
        spriteElement.style.backgroundImage = 'none';
        spriteElement.innerHTML = '';
        spriteElement.appendChild(imgElement);
        
        // Add error handler for fallback to static image
        imgElement.onerror = function() {
            console.warn(`[Enemy] GIF failed to load for ${enemyData.name}, using static fallback`);
            spriteElement.innerHTML = '';
            applyStaticFallback(spriteElement, enemyData);
        };
        
        console.log(`[Enemy] Initialized animated GIF: ${enemyData.name} with ${imageToUse}`);
    } else {
        // Use background-image for static images
        spriteElement.style.backgroundImage = `url('${imageToUse}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.backgroundPosition = 'center';
        spriteElement.style.backgroundRepeat = 'no-repeat';
        spriteElement.style.imageRendering = 'pixelated';
        
        console.log(`[Enemy] Initialized static image: ${enemyData.name} with ${imageToUse}`);
    }
    
    // Add size class
    spriteElement.classList.add(`enemy-size-${enemySize}`);
    
    // Add hover animation class (will be defined in CSS)
    spriteElement.classList.add('enemy-hover');
}

// Static fallback function - uses known working static images
function applyStaticFallback(spriteElement, enemyData) {
    let fallbackImage = 'assets/enemies/default-enemy.png';
    
    // Map to known static fallbacks
    const staticFallbacks = {
        'Alien': 'assets/enemies/Alien/Sprites/Idle/frame1.png',
        'Lazy Bat': 'assets/enemies/Lazy Bat/Bat-IdleFly.png',
        'Lazy Bat II': 'assets/enemies/Lazy Bat/Bat-IdleFly.png',
        'Slime': 'assets/enemies/Slothful Slime/slime-animated.gif',
        'Slime II': 'assets/enemies/Slothful Slime/slime-animated.gif',
        'Ghost Task Stopper': 'assets/enemies/Procrastination Drone/drone-animated.gif',
        'Medusa': 'assets/enemies/Medusa/medusa-idle.png',
        'Flying Eye Demon': 'assets/enemies/flying-eye-idle.png',
        'Lazy Eye': 'assets/enemies/flying-eye-idle.png',
        'Fire Skull': 'assets/enemies/fire-skull.png',
        'Ogre': 'assets/enemies/Ogre/Sprites/Idle/ogre-idle1.png',
        'Octopus': 'assets/enemies/octopus.png',
        'Treant': 'assets/enemies/Treant/treant-idle.png',
        'Sunny Dragon': 'assets/enemies/dragon.png',
        'Fly Drone': 'assets/enemies/fly.png',
        'Mushroom': 'assets/enemies/mushroom.png'
    };
    
    if (staticFallbacks[enemyData.name]) {
        fallbackImage = staticFallbacks[enemyData.name];
    }
    
    spriteElement.style.backgroundImage = `url('${fallbackImage}')`;
    spriteElement.style.backgroundSize = 'contain';
    spriteElement.style.backgroundPosition = 'center';
    spriteElement.style.backgroundRepeat = 'no-repeat';
    spriteElement.style.imageRendering = 'pixelated';
    
    console.log(`[Enemy] Applied static fallback for ${enemyData.name}: ${fallbackImage}`);
}

// Export to global scope
window.initEnemySprite = initEnemySprite;
window.applyStaticFallback = applyStaticFallback;

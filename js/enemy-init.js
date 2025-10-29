// Enemy Sprite Initialization for Battle
// Determines correct sprite class based on enemy type

function initEnemySprite(enemyData) {
    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement) return;
    
    // Remove old classes
    spriteElement.className = 'sprite';
    
    // Determine enemy type and apply appropriate class
    if (enemyData.name === 'Lazy Bat') {
        // Bat sprites: 64×64 frames
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '576px 64px'; // 9 frames × 64px = 576px
        spriteElement.classList.add('bat-idle');
    } else if (enemyData.name === 'Lazy Bat II') {
        // Lazy Bat II sprites: 32×32 frames, 4 frames
        spriteElement.classList.add('enemy-sprite-small');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '128px 32px'; // 4 frames × 32px = 128px
        spriteElement.classList.add('bat2-idle');
    } else if (enemyData.name === 'Slime') {
        // Slime sprites: 118×79 frames, 4 frames
        spriteElement.classList.add('enemy-sprite-slime');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '472px 79px'; // 4 frames × 118px = 472px
        spriteElement.classList.add('slime-idle');
    } else if (enemyData.name === 'Ghost Task Stopper') {
        // Ghost sprites: 32×32 frames, 6 frames
        spriteElement.classList.add('enemy-sprite-small');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '192px 32px'; // 6 frames × 32px = 192px
        spriteElement.classList.add('ghost-idle');
    } else if (enemyData.name === 'Medusa') {
        // Medusa sprites: 32×32 frames, 4 frames
        spriteElement.classList.add('enemy-sprite-small');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '128px 32px'; // 4 frames × 32px = 128px
        spriteElement.classList.add('medusa-idle');
    } else if (enemyData.name === 'Flying Eye Demon' || enemyData.name === 'Lazy Eye') {
        // Flying Eye sprites: 48×48 frames
        spriteElement.classList.add('enemy-sprite-medium');
        spriteElement.style.backgroundImage = `url('assets/enemies/flying-eye-idle-sheet.png')`;
        spriteElement.style.backgroundSize = '384px 48px'; // 8 frames × 48px = 384px
        spriteElement.classList.add('eye-idle');
    } else if (enemyData.name === 'Fire Skull') {
        // Fire Skull: single sprite with procedural animation
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2.5)';
        spriteElement.classList.add('procedural-idle');
    } else if (enemyData.name === 'Ogre') {
        // Ogre: large enemy with procedural animation
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(3)';
        spriteElement.classList.add('procedural-idle');
    } else if (enemyData.name === 'Octopus') {
        // Octopus: single sprite with procedural animation
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('procedural-idle');
    } else if (enemyData.name === 'Alien') {
        // Alien: 8-frame spritesheet animation (83×64 per frame)
        spriteElement.classList.add('enemy-sprite-alien');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '664px 64px'; // 8 frames × 83px = 664px
        spriteElement.style.transform = 'scale(1.5)';
        spriteElement.classList.add('alien-idle-animated');
    } else if (enemyData.name === 'Treant') {
        // Treant Boss: single animated sprite
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(3.5)';
        spriteElement.classList.add('procedural-idle');
    } else if (enemyData.name === 'Sunny Dragon') {
        // Sunny Dragon Boss: GIF animation
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(3)';
        spriteElement.style.imageRendering = 'pixelated';
        spriteElement.classList.add('boss-animated');
    } else if (enemyData.name === 'Mushroom') {
        // Mushroom Boss: single animated sprite
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(3.5)';
        spriteElement.classList.add('procedural-idle');
    } else {
        // Default fallback with procedural animation
        spriteElement.classList.add('enemy-sprite-large');
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('procedural-idle');
    }
}

// Export to global scope
window.initEnemySprite = initEnemySprite;


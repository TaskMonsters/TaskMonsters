// Enemy Sprite Initialization for Battle
// Properly handles spritesheets and single-frame sprites
// Each enemy displays ONE FRAME at a time, animated via CSS

function initEnemySprite(enemyData) {
    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement) return;
    
    // Remove old classes and reset styles
    spriteElement.className = 'sprite';
    spriteElement.style = '';
    
    // Common settings
    spriteElement.style.backgroundRepeat = 'no-repeat';
    spriteElement.style.imageRendering = 'pixelated';
    spriteElement.style.backgroundPosition = '0 0';
    
    // Configure based on enemy type
    const name = enemyData.name;
    
    if (name === 'Lazy Bat') {
        // Spritesheet: 9 frames, 64x64 each, total 576x64
        spriteElement.style.width = '64px';
        spriteElement.style.height = '64px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '576px 64px';
        spriteElement.classList.add('enemy-sprite-large');
    }
    else if (name === 'Bunny') {
        // Spritesheet: 8 frames, 34x44 each, total 272x44
        spriteElement.style.width = '34px';
        spriteElement.style.height = '44px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '272px 44px';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-medium');
    }
    else if (name === 'Slime') {
        // Spritesheet: 4 frames, 118x79 each, total 472x79
        spriteElement.style.width = '118px';
        spriteElement.style.height = '79px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '472px 79px';
        spriteElement.classList.add('enemy-sprite-medium');
    }
    else if (name === 'Ogre') {
        // Spritesheet: 12 frames, 48x80 each, total 576x80
        spriteElement.style.width = '48px';
        spriteElement.style.height = '80px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '576px 80px';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-large');
    }
    else if (name === 'Fire Skull') {
        // Spritesheet: 6 frames, 36x70 each, total 216x70
        spriteElement.style.width = '36px';
        spriteElement.style.height = '70px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '216px 70px';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-large');
    }
    else if (name === 'Medusa') {
        // Single frame: 32x32
        spriteElement.style.width = '32px';
        spriteElement.style.height = '32px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-small', 'procedural-idle');
    }
    else if (name === 'Octopus') {
        // Single frame: 28x37
        spriteElement.style.width = '28px';
        spriteElement.style.height = '37px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-medium', 'procedural-idle');
    }
    else if (name === 'Treant') {
        // Single frame: 80x84 (uses frameFiles but we show one at a time)
        spriteElement.style.width = '80px';
        spriteElement.style.height = '84px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-large', 'procedural-idle');
    }
    else if (name === 'Drone') {
        // Single frame: 55x52 (uses frameFiles)
        spriteElement.style.width = '55px';
        spriteElement.style.height = '52px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-medium', 'procedural-idle');
    }
    else if (name === 'Robot') {
        // Single frame: 22x24 (uses frameFiles)
        spriteElement.style.width = '22px';
        spriteElement.style.height = '24px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.transform = 'scale(3)';
        spriteElement.classList.add('enemy-sprite-medium', 'procedural-idle');
    }
    else if (name === 'Alien Walking' || name === 'Alien Flying') {
        // Spritesheet: 4 frames, 48x48 each, total 192x48
        spriteElement.style.width = '48px';
        spriteElement.style.height = '48px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = '192px 48px';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-large');
    }
    else {
        // Default fallback for new enemies
        spriteElement.style.width = '64px';
        spriteElement.style.height = '64px';
        spriteElement.style.backgroundImage = `url('${enemyData.sprites.idle}')`;
        spriteElement.style.backgroundSize = 'contain';
        spriteElement.style.backgroundPosition = 'center';
        spriteElement.style.transform = 'scale(2)';
        spriteElement.classList.add('enemy-sprite-large', 'procedural-idle');
        
        console.log('Enemy sprite initialized (default):', name, enemyData.sprites.idle);
    }
    
    console.log('Enemy sprite initialized:', name);
}

// Export to global scope
window.initEnemySprite = initEnemySprite;

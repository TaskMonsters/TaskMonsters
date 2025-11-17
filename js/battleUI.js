// Updated Fireball Projectile Animation with new assets
async function playFireballAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'fireball-projectile';
    projectile.style.width = '60px';
    projectile.style.height = '60px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/projectiles/Fireball Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 30 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 30 + 'px';

    // Animate projectile movement with arc
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in)
            const eased = progress * progress;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 30;
            const arc = Math.sin(progress * Math.PI) * 60; // Arc height
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 30 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Slight rotation for effect
            projectile.style.transform = `rotate(${progress * 180}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile
                projectile.remove();
                
                // Play explosion
                playFireballExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Fireball Explosion Animation (6 frames)
async function playFireballExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Fireball Explosion/Explosion 1.png',
        'assets/battle-items/shop-attacks/Fireball Explosion/Explosion 2.png',
        'assets/battle-items/shop-attacks/Fireball Explosion/Explosion 3.png',
        'assets/battle-items/shop-attacks/Fireball Explosion/Explosion 4.png',
        'assets/battle-items/shop-attacks/Fireball Explosion/Explosion 5.png',
        'assets/battle-items/shop-attacks/Fireball Explosion/Explosion 6.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    explosion.remove();
}

// Spark Projectile Animation (Player level 7+ attack)
async function playSparkAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'spark-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/shop-attacks/Spark Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Animate projectile movement (fast, straight line)
    const duration = 500;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (linear for electric speed)
            const eased = progress;

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playSparkExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Spark Explosion Animation (9 frames)
async function playSparkExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Spark Explosion/_0000_Layer-1.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0001_Layer-2.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0002_Layer-3.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0003_Layer-4.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0004_Layer-5.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0005_Layer-6.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0006_Layer-7.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0007_Layer-8.png',
        'assets/battle-items/shop-attacks/Spark Explosion/_0008_Layer-9.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    explosion.remove();
}

// Asteroid Projectile Animation
async function playAsteroidAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'asteroid-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/shop-attacks/Asteroid Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Animate projectile movement with arc
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in-out)
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const arc = Math.sin(progress * Math.PI) * 80;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate asteroid
            projectile.style.transform = `rotate(${progress * 720}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playAsteroidExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Asteroid Explosion Animation (4 frames)
async function playAsteroidExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Asteroid Explosion/explosion1.png',
        'assets/battle-items/shop-attacks/Asteroid Explosion/explosion2.png',
        'assets/battle-items/shop-attacks/Asteroid Explosion/explosion3.png',
        'assets/battle-items/shop-attacks/Asteroid Explosion/explosion4.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 80));
    }

    explosion.remove();
}

// Prickler Projectile Animation
async function playPricklerAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'prickler-projectile';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/projectiles/Prickler Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 20 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 20 + 'px';

    // Animate projectile movement with arc
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in-out)
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 20;
            const arc = Math.sin(progress * Math.PI) * 100;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 20 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate prickler
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playPricklerExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Prickler Explosion Animation (9 frames)
async function playPricklerExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation1.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation2.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation3.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation4.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation5.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation6.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation7.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation8.png',
        'assets/battle-items/projectiles/Prickler Explosion/sprites/explosion-animation9.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    explosion.remove();
}

// Freeze Projectile Animation
async function playFreezeAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'freeze-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/shop-attacks/Freeze Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Animate projectile movement
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playFreezeExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Freeze Explosion Animation (8 frames)
async function playFreezeExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Freeze Explosion/_0000_Layer-1.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0001_Layer-2.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0002_Layer-3.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0003_Layer-4.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0004_Layer-5.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0005_Layer-6.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0006_Layer-7.png',
        'assets/battle-items/shop-attacks/Freeze Explosion/_0007_Layer-8.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    explosion.remove();
}

// Blue Flame Projectile Animation
async function playBlueFlameAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'blue-flame-projectile';
    projectile.style.width = '60px';
    projectile.style.height = '60px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/projectiles/Blue Flame.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 30 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 30 + 'px';

    // Animate projectile movement with arc
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in)
            const eased = progress * progress;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 30;
            const arc = Math.sin(progress * Math.PI) * 60;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 30 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Slight rotation for effect
            projectile.style.transform = `rotate(${progress * 180}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playBlueFlameExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Blue Flame Explosion Animation (3 frames)
async function playBlueFlameExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/projectiles/Blue Flame Explosion/Sprites/frame1.png',
        'assets/battle-items/projectiles/Blue Flame Explosion/Sprites/frame2.png',
        'assets/battle-items/projectiles/Blue Flame Explosion/Sprites/frame3.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    explosion.remove();
}

// Mirror Attack Animation (with 180° rotation effect)
async function playMirrorAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'mirror-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/shop-attacks/Mirror Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Animate projectile movement
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // 180° mirror spin rotation effect
            projectile.style.transform = `rotateY(${progress * 180}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playMirrorExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Mirror Explosion Animation (7 frames)
async function playMirrorExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-1.png',
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-2.png',
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-3.png',
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-4.png',
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-5.png',
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-6.png',
        'assets/battle-items/shop-attacks/Mirror Explosion/Sprites/hits-5-7.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    explosion.remove();
}

// Poison Leaf Attack Animation (with spiral rotation)
async function playPoisonLeafAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'poison-leaf-projectile';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/shop-attacks/Poison Leaf Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 20 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 20 + 'px';

    // Animate projectile movement
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 20;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 20;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Spiral rotation along Y-axis for leaf-spin effect
            projectile.style.transform = `rotateY(${progress * 720}deg) rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playPoisonLeafExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Poison Leaf Explosion Animation (5 frames)
async function playPoisonLeafExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Poison Leaf Explosion/enemy-death-1.png',
        'assets/battle-items/shop-attacks/Poison Leaf Explosion/enemy-death-2.png',
        'assets/battle-items/shop-attacks/Poison Leaf Explosion/enemy-death-3.png',
        'assets/battle-items/shop-attacks/Poison Leaf Explosion/enemy-death-4.png',
        'assets/battle-items/shop-attacks/Poison Leaf Explosion/enemy-death-5.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 80));
    }

    explosion.remove();
}

// Procrastination Ghost Attack Animation
async function playProcrastinationGhostAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'ghost-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/shop-attacks/Procrastination Ghost Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Animate projectile movement with floating effect
    const duration = 900;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in-out)
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Calculate position with wave motion
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const wave = Math.sin(progress * Math.PI * 3) * 20; // Wave motion
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25 + wave;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Gentle rotation
            projectile.style.transform = `rotate(${progress * 90}deg)`;
            // Fade effect
            projectile.style.opacity = 0.7 + Math.sin(progress * Math.PI * 4) * 0.3;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playProcrastinationGhostExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Procrastination Ghost Explosion Animation (7 frames)
async function playProcrastinationGhostExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-1.png',
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-2.png',
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-3.png',
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-4.png',
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-5.png',
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-6.png',
        'assets/battle-items/shop-attacks/Procrastination Ghost Explosion/power-up-7.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    explosion.remove();
}

// Export all functions to window for global access
window.playFireballAnimation = playFireballAnimation;
window.playSparkAnimation = playSparkAnimation;
window.playAsteroidAnimation = playAsteroidAnimation;
window.playPricklerAnimation = playPricklerAnimation;
window.playFreezeAnimation = playFreezeAnimation;
window.playBlueFlameAnimation = playBlueFlameAnimation;
window.playMirrorAnimation = playMirrorAnimation;
window.playPoisonLeafAnimation = playPoisonLeafAnimation;
window.playProcrastinationGhostAnimation = playProcrastinationGhostAnimation;

// Update battle UI elements (HP, gauges, sprites)
function updateBattleUI(hero, enemy) {
    if (!hero || !enemy) return;
    
    // Update hero HP
    const heroHPBar = document.getElementById('heroHPBar');
    const heroHPText = document.getElementById('heroHPText');
    if (heroHPBar && heroHPText) {
        const heroHPPercent = (hero.hp / hero.maxHP) * 100;
        heroHPBar.style.width = heroHPPercent + '%';
        heroHPText.textContent = `${hero.hp}/${hero.maxHP}`;
    }

    // Update enemy HP
    const enemyHPBar = document.getElementById('enemyHPBar');
    const enemyHPText = document.getElementById('enemyHPText');
    if (enemyHPBar && enemyHPText) {
        const enemyHPPercent = (enemy.hp / enemy.maxHP) * 100;
        enemyHPBar.style.width = enemyHPPercent + '%';
        enemyHPText.textContent = `${enemy.hp}/${enemy.maxHP}`;
    }

    // Update gauges (access from global battleManager)
    if (window.battleManager) {
        const attackGaugeBar = document.getElementById('attackGaugeBar');
        const attackGaugeText = document.getElementById('attackGaugeText');
        if (attackGaugeBar && attackGaugeText) {
            attackGaugeBar.style.width = window.battleManager.attackGauge + '%';
            attackGaugeText.textContent = `${window.battleManager.attackGauge}/100`;
        }

        const defenseGaugeBar = document.getElementById('defenseGaugeBar');
        const defenseGaugeText = document.getElementById('defenseGaugeText');
        if (defenseGaugeBar && defenseGaugeText) {
            defenseGaugeBar.style.width = window.battleManager.defenseGauge + '%';
            defenseGaugeText.textContent = `${window.battleManager.defenseGauge}/100`;
        }
    }
}

// Export to global scope
window.updateBattleUI = updateBattleUI;

// Poison Leaf Projectile Animation
async function playPoisonLeafAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'poison-leaf-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/battle-items/projectiles/Poison Leaf Attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.zIndex = '1000';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';

    // Animate projectile movement with gentle arc
    const duration = 750;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position with gentle arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const arc = Math.sin(progress * Math.PI) * 40;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Gentle rotation like a falling leaf
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                playPoisonLeafExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Poison Leaf Explosion Animation (5 frames)
async function playPoisonLeafExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/battle-items/projectiles/Poison Leaf Explosion/enemy-death-1.png',
        'assets/battle-items/projectiles/Poison Leaf Explosion/enemy-death-2.png',
        'assets/battle-items/projectiles/Poison Leaf Explosion/enemy-death-3.png',
        'assets/battle-items/projectiles/Poison Leaf Explosion/enemy-death-4.png',
        'assets/battle-items/projectiles/Poison Leaf Explosion/enemy-death-5.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 80));
    }

    explosion.remove();
}

// Update action button availability and visibility
function updateActionButtons(hero) {
    if (!hero || !window.battleManager) return;
    
    const btnAttack = document.getElementById('btnAttack');
    const btnDefend = document.getElementById('btnDefend');
    
    // Attack requires 10 attack gauge
    if (btnAttack) btnAttack.disabled = battleManager.attackGauge < 10;
    
    // Defend requires 20 defense gauge
    if (btnDefend) btnDefend.disabled = battleManager.defenseGauge < 20;
    
    // Fireball
    const btnFireball = document.getElementById('btnFireball');
    if (btnFireball) {
        const fireballCount = gameState.battleInventory?.fireball || 0;
        const fireballCountSpan = btnFireball.querySelector('.item-count');
        if (fireballCountSpan) fireballCountSpan.textContent = `(${fireballCount})`;
        btnFireball.disabled = battleManager.attackGauge < 30 || fireballCount === 0;
    }
    
    // Spark
    const btnSpark = document.getElementById('btnSpark');
    if (btnSpark) {
        if (gameState.unlockedBattleItems?.includes('spark')) {
            btnSpark.style.display = '';
            const sparkCount = gameState.battleInventory?.spark || 0;
            const sparkCountSpan = btnSpark.querySelector('.item-count');
            if (sparkCountSpan) sparkCountSpan.textContent = `(${sparkCount})`;
            btnSpark.disabled = battleManager.attackGauge < 25 || sparkCount === 0;
        } else {
            btnSpark.style.display = 'none';
        }
    }
    
    // Asteroid
    const btnAsteroid = document.getElementById('btnAsteroid');
    if (btnAsteroid) {
        if (gameState.unlockedBattleItems?.includes('asteroid_attack')) {
            btnAsteroid.style.display = '';
            const asteroidCount = gameState.battleInventory?.asteroid_attack || 0;
            const asteroidCountSpan = btnAsteroid.querySelector('.item-count');
            if (asteroidCountSpan) asteroidCountSpan.textContent = `(${asteroidCount})`;
            btnAsteroid.disabled = battleManager.attackGauge < 15 || asteroidCount === 0;
        } else {
            btnAsteroid.style.display = 'none';
        }
    }
    
    // Prickler
    const btnPrickler = document.getElementById('btnPrickler');
    if (btnPrickler) {
        if (gameState.unlockedBattleItems?.includes('prickler')) {
            btnPrickler.style.display = '';
            const pricklerCount = gameState.battleInventory?.prickler || 0;
            const pricklerCountSpan = btnPrickler.querySelector('.item-count');
            if (pricklerCountSpan) pricklerCountSpan.textContent = `(${pricklerCount})`;
            btnPrickler.disabled = battleManager.attackGauge < 20 || pricklerCount === 0;
        } else {
            btnPrickler.style.display = 'none';
        }
    }
    
    // Freeze
    const btnFreeze = document.getElementById('btnFreeze');
    if (btnFreeze) {
        if (gameState.unlockedBattleItems?.includes('freeze')) {
            btnFreeze.style.display = '';
            const freezeCount = gameState.battleInventory?.freeze || 0;
            const freezeCountSpan = btnFreeze.querySelector('.item-count');
            if (freezeCountSpan) freezeCountSpan.textContent = `(${freezeCount})`;
            btnFreeze.disabled = battleManager.attackGauge < 35 || freezeCount === 0;
        } else {
            btnFreeze.style.display = 'none';
        }
    }
    
    // Blue Flame
    const btnBlueFlame = document.getElementById('btnBlueFlame');
    if (btnBlueFlame) {
        if (gameState.unlockedBattleItems?.includes('blue_flame')) {
            btnBlueFlame.style.display = '';
            const blueFlameCount = gameState.battleInventory?.blue_flame || 0;
            const blueFlameCountSpan = btnBlueFlame.querySelector('.item-count');
            if (blueFlameCountSpan) blueFlameCountSpan.textContent = `(${blueFlameCount})`;
            btnBlueFlame.disabled = battleManager.attackGauge < 20 || blueFlameCount === 0;
        } else {
            btnBlueFlame.style.display = 'none';
        }
    }
    
    // Procrastination Ghost
    const btnProcrastinationGhost = document.getElementById('btnProcrastinationGhost');
    if (btnProcrastinationGhost) {
        if (gameState.unlockedBattleItems?.includes('procrastination_ghost')) {
            btnProcrastinationGhost.style.display = '';
            const ghostCount = gameState.battleInventory?.procrastination_ghost || 0;
            const ghostCountSpan = btnProcrastinationGhost.querySelector('.item-count');
            if (ghostCountSpan) ghostCountSpan.textContent = `(${ghostCount})`;
            btnProcrastinationGhost.disabled = battleManager.attackGauge < 25 || ghostCount === 0;
        } else {
            btnProcrastinationGhost.style.display = 'none';
        }
    }
    
    // Poison Leaf
    const btnPoisonLeaf = document.getElementById('btnPoisonLeaf');
    if (btnPoisonLeaf) {
        if (gameState.unlockedBattleItems?.includes('poison_leaf')) {
            btnPoisonLeaf.style.display = '';
            const poisonLeafCount = gameState.battleInventory?.poison_leaf || 0;
            const poisonLeafCountSpan = btnPoisonLeaf.querySelector('.item-count');
            if (poisonLeafCountSpan) poisonLeafCountSpan.textContent = `(${poisonLeafCount})`;
            btnPoisonLeaf.disabled = battleManager.attackGauge < 25 || poisonLeafCount === 0;
        } else {
            btnPoisonLeaf.style.display = 'none';
        }
    }
    
    // Mirror Attack
    const btnMirrorAttack = document.getElementById('btnMirrorAttack');
    if (btnMirrorAttack) {
        if (gameState.unlockedBattleItems?.includes('mirror_attack')) {
            btnMirrorAttack.style.display = '';
            const mirrorCount = gameState.battleInventory?.mirror_attack || 0;
            const mirrorCountSpan = btnMirrorAttack.querySelector('.item-count');
            if (mirrorCountSpan) mirrorCountSpan.textContent = `(${mirrorCount})`;
            btnMirrorAttack.disabled = battleManager.attackGauge < 20 || mirrorCount === 0;
        } else {
            btnMirrorAttack.style.display = 'none';
        }
    }
    
    // Health Potion
    const btnPotion = document.getElementById('btnPotion');
    if (btnPotion) {
        const potionCount = gameState.battleInventory?.health_potion || 0;
        const potionCountSpan = btnPotion.querySelector('.item-count');
        if (potionCountSpan) potionCountSpan.textContent = `(${potionCount})`;
        btnPotion.disabled = potionCount === 0;
    }
    
    // Hyper Potion
    const btnHyperPotion = document.getElementById('btnHyperPotion');
    if (btnHyperPotion) {
        const hyperPotionCount = gameState.battleInventory?.hyper_potion || 0;
        const hyperPotionCountSpan = btnHyperPotion.querySelector('.item-count');
        if (hyperPotionCountSpan) hyperPotionCountSpan.textContent = `(${hyperPotionCount})`;
        btnHyperPotion.disabled = hyperPotionCount === 0;
    }
    
    // Attack Refill (Power Boost)
    const btnAttackRefill = document.getElementById('btnAttackRefill');
    if (btnAttackRefill) {
        const attackRefillCount = gameState.battleInventory?.attack_refill || 0;
        const attackRefillCountSpan = btnAttackRefill.querySelector('.item-count');
        if (attackRefillCountSpan) attackRefillCountSpan.textContent = `(${attackRefillCount})`;
        btnAttackRefill.disabled = attackRefillCount === 0;
    }
    
    // Defense Refill
    const btnDefenseRefill = document.getElementById('btnDefenseRefill');
    if (btnDefenseRefill) {
        const defenseRefillCount = gameState.battleInventory?.defense_refill || 0;
        const defenseRefillCountSpan = btnDefenseRefill.querySelector('.item-count');
        if (defenseRefillCountSpan) defenseRefillCountSpan.textContent = `(${defenseRefillCount})`;
        btnDefenseRefill.disabled = defenseRefillCount === 0;
    }
    
    // Invisibility Cloak
    const btnInvisibilityCloak = document.getElementById('btnInvisibilityCloak');
    if (btnInvisibilityCloak) {
        const cloakCount = gameState.battleInventory?.invisibility_cloak || 0;
        const cloakCountSpan = btnInvisibilityCloak.querySelector('.item-count');
        if (cloakCountSpan) cloakCountSpan.textContent = `(${cloakCount})`;
        btnInvisibilityCloak.disabled = cloakCount === 0;
    }
}

// Export to global scope
window.updateActionButtons = updateActionButtons;


// Apply freeze visual effect to enemy sprite
function applyFreezeEffect(frozen) {
    const enemySprite = document.getElementById('enemySprite');
    if (!enemySprite) return;
    
    if (frozen) {
        // Apply frozen visual effect
        enemySprite.style.filter = 'brightness(1.5) saturate(0.5) hue-rotate(180deg)';
        enemySprite.style.boxShadow = '0 0 30px rgba(100, 200, 255, 0.8), inset 0 0 20px rgba(150, 220, 255, 0.6)';
        enemySprite.style.border = '3px solid rgba(150, 220, 255, 0.9)';
        enemySprite.style.animation = 'freeze-pulse 1.5s ease-in-out infinite';
        
        // Add freeze overlay
        const freezeOverlay = document.createElement('div');
        freezeOverlay.id = 'freezeOverlay';
        freezeOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, 
                rgba(150, 220, 255, 0.3) 0%, 
                rgba(100, 200, 255, 0.2) 50%, 
                rgba(150, 220, 255, 0.3) 100%);
            pointer-events: none;
            z-index: 10;
            animation: freeze-shimmer 2s ease-in-out infinite;
        `;
        enemySprite.style.position = 'relative';
        enemySprite.appendChild(freezeOverlay);
        
        // Add CSS animations if not already added
        if (!document.getElementById('freezeAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'freezeAnimationStyles';
            style.textContent = `
                @keyframes freeze-pulse {
                    0%, 100% {
                        filter: brightness(1.5) saturate(0.5) hue-rotate(180deg);
                    }
                    50% {
                        filter: brightness(1.8) saturate(0.3) hue-rotate(180deg);
                    }
                }
                
                @keyframes freeze-shimmer {
                    0%, 100% {
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 0.9;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        // Remove frozen visual effect
        enemySprite.style.filter = '';
        enemySprite.style.boxShadow = '';
        enemySprite.style.border = '';
        enemySprite.style.animation = '';
        
        // Remove freeze overlay
        const freezeOverlay = document.getElementById('freezeOverlay');
        if (freezeOverlay) {
            freezeOverlay.remove();
        }
    }
}

// Export to global scope
window.applyFreezeEffect = applyFreezeEffect;


// Apply invisibility visual effect to hero sprite
function applyInvisibilityEffect(invisible) {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) return;
    
    if (invisible) {
        // Make hero semi-transparent and add shimmer effect
        heroSprite.style.opacity = '0.3';
        heroSprite.style.filter = 'blur(1px)';
        heroSprite.style.animation = 'invisibility-shimmer 1s ease-in-out infinite';
        
        // Add CSS animation if not already added
        if (!document.getElementById('invisibilityAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'invisibilityAnimationStyles';
            style.textContent = `
                @keyframes invisibility-shimmer {
                    0%, 100% {
                        opacity: 0.2;
                        filter: blur(1px);
                    }
                    50% {
                        opacity: 0.4;
                        filter: blur(2px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        // Make hero fully visible again
        heroSprite.style.opacity = '1';
        heroSprite.style.filter = '';
        heroSprite.style.animation = '';
    }
}

// Export to global scope
window.applyInvisibilityEffect = applyInvisibilityEffect;


// Floating text animation system for battle stat changes
function showFloatingText(text, type, targetElement) {
    if (!targetElement) return;
    
    const floatingText = document.createElement('div');
    floatingText.className = `floating-battle-text floating-${type}`;
    floatingText.textContent = text;
    
    // Get target position
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position above the sprite
    floatingText.style.cssText = `
        position: fixed;
        left: ${targetRect.left + targetRect.width / 2}px;
        top: ${targetRect.top - 20}px;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        pointer-events: none;
        z-index: 2000;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        animation: float-up 1.5s ease-out forwards;
    `;
    
    // Color coding based on type
    switch(type) {
        case 'hp-damage':
            floatingText.style.color = '#ff4444';
            break;
        case 'hp-heal':
            floatingText.style.color = '#44ff44';
            break;
        case 'attack-up':
            floatingText.style.color = '#ffaa00';
            break;
        case 'attack-down':
            floatingText.style.color = '#ff8800';
            break;
        case 'defense-up':
            floatingText.style.color = '#4488ff';
            break;
        case 'defense-down':
            floatingText.style.color = '#6666ff';
            break;
        case 'special':
            floatingText.style.color = '#ff00ff';
            break;
        default:
            floatingText.style.color = '#ffffff';
    }
    
    document.body.appendChild(floatingText);
    
    // Add CSS animation if not already added
    if (!document.getElementById('floatingTextStyles')) {
        const style = document.createElement('style');
        style.id = 'floatingTextStyles';
        style.textContent = `
            @keyframes float-up {
                0% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                70% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-60px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after animation
    setTimeout(() => {
        floatingText.remove();
    }, 1500);
}

// Export to global scope
window.showFloatingText = showFloatingText;


// Loot Drop Visual and Sound Effect (P1: QA Report)
window.playLootDropAnimation = async function(lootTier, xpAmount) {
    const battleScreen = document.getElementById('battleScreen');
    if (!battleScreen) return;
    
    // Create loot drop container
    const lootContainer = document.createElement('div');
    lootContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 3000;
        text-align: center;
        pointer-events: none;
    `;
    
    // Create loot icon based on tier
    const lootIcon = document.createElement('div');
    lootIcon.style.cssText = `
        font-size: 80px;
        margin-bottom: 20px;
        animation: lootDrop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    // Set icon and color based on tier
    let icon = '💰';
    let color = '#ffd700';
    let glowColor = 'rgba(255, 215, 0, 0.6)';
    
    if (lootTier === 'Rare') {
        icon = '✨💎✨';
        color = '#ff00ff';
        glowColor = 'rgba(255, 0, 255, 0.8)';
    } else if (lootTier === 'Uncommon') {
        icon = '💎';
        color = '#00ffff';
        glowColor = 'rgba(0, 255, 255, 0.6)';
    }
    
    lootIcon.textContent = icon;
    
    // Create XP text
    const xpText = document.createElement('div');
    xpText.style.cssText = `
        font-size: 36px;
        font-weight: bold;
        color: ${color};
        text-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor};
        animation: lootPulse 1s ease-in-out infinite;
    `;
    xpText.textContent = `+${xpAmount} XP`;
    
    // Create tier text
    const tierText = document.createElement('div');
    tierText.style.cssText = `
        font-size: 24px;
        font-weight: bold;
        color: ${color};
        margin-top: 10px;
        text-shadow: 0 0 10px ${glowColor};
    `;
    tierText.textContent = lootTier === 'Common' ? '' : `${lootTier} Loot!`;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes lootDrop {
            0% {
                transform: translateY(-100px) scale(0);
                opacity: 0;
            }
            50% {
                transform: translateY(10px) scale(1.2);
            }
            100% {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes lootPulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
        
        @keyframes lootSparkle {
            0%, 100% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1) rotate(180deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add sparkle particles for rare/uncommon loot
    if (lootTier !== 'Common') {
        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('div');
            const angle = (i / 12) * 360;
            const distance = 100;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;
            
            sparkle.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                font-size: 20px;
                transform: translate(-50%, -50%);
                animation: lootSparkle 1.5s ease-in-out ${i * 0.1}s infinite;
            `;
            sparkle.textContent = '✨';
            sparkle.style.setProperty('--x', `${x}px`);
            sparkle.style.setProperty('--y', `${y}px`);
            
            lootContainer.appendChild(sparkle);
        }
    }
    
    // Assemble elements
    lootContainer.appendChild(lootIcon);
    lootContainer.appendChild(xpText);
    lootContainer.appendChild(tierText);
    battleScreen.appendChild(lootContainer);
    
    // Play loot drop sound
    if (window.audioManager) {
        if (lootTier === 'Rare') {
            window.audioManager.playSound('rare_loot', 0.9);
        } else if (lootTier === 'Uncommon') {
            window.audioManager.playSound('uncommon_loot', 0.8);
        } else {
            window.audioManager.playSound('loot_drop', 0.7);
        }
    }
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Fade out
    lootContainer.style.transition = 'opacity 0.5s';
    lootContainer.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clean up
    lootContainer.remove();
    style.remove();
};

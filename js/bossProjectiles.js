// Boss Projectile Animations

// Dragon Bolt Projectile (Sunny Dragon)
async function playDragonBoltProjectile(fromElement, toElement) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const container = fromElement.parentElement;
    
    // Create bolt sprite container
    const bolt = document.createElement('div');
    bolt.style.position = 'absolute';
    bolt.style.width = '32px';
    bolt.style.height = '32px';
    bolt.style.left = (fromRect.left - container.getBoundingClientRect().left + fromRect.width / 2) + 'px';
    bolt.style.top = (fromRect.top - container.getBoundingClientRect().top + fromRect.height / 2) + 'px';
    bolt.style.zIndex = '100';
    bolt.style.pointerEvents = 'none';
    
    // Animate through bolt frames
    const boltFrames = [
        'assets/bosses/sunny-dragon/bolt1.png',
        'assets/bosses/sunny-dragon/bolt2.png',
        'assets/bosses/sunny-dragon/bolt3.png',
        'assets/bosses/sunny-dragon/bolt4.png'
    ];
    
    let currentFrame = 0;
    bolt.style.backgroundImage = `url('${boltFrames[currentFrame]}')`;
    bolt.style.backgroundSize = 'contain';
    bolt.style.backgroundRepeat = 'no-repeat';
    bolt.style.imageRendering = 'pixelated';
    
    container.appendChild(bolt);
    
    // Animate frame cycling
    const frameInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % boltFrames.length;
        bolt.style.backgroundImage = `url('${boltFrames[currentFrame]}')`;
    }, 100);
    
    // Calculate trajectory
    const startX = fromRect.left - container.getBoundingClientRect().left + fromRect.width / 2;
    const startY = fromRect.top - container.getBoundingClientRect().top + fromRect.height / 2;
    const endX = toRect.left - container.getBoundingClientRect().left + toRect.width / 2;
    const endY = toRect.top - container.getBoundingClientRect().top + toRect.height / 2;
    
    // Animate movement
    return new Promise(resolve => {
        let progress = 0;
        const duration = 600;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            
            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;
            
            bolt.style.left = currentX + 'px';
            bolt.style.top = currentY + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                clearInterval(frameInterval);
                bolt.remove();
                resolve();
            }
        }
        
        animate();
    });
}

// Mushroom Emoji Projectile (Mushroom Boss)
async function playMushroomProjectile(fromElement, toElement) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const container = fromElement.parentElement;
    
    // Create multiple mushroom emojis
    const mushrooms = [];
    const mushroomCount = 5;
    
    for (let i = 0; i < mushroomCount; i++) {
        const mushroom = document.createElement('div');
        mushroom.style.position = 'absolute';
        mushroom.style.fontSize = '2rem';
        mushroom.style.left = (fromRect.left - container.getBoundingClientRect().left + fromRect.width / 2) + 'px';
        mushroom.style.top = (fromRect.top - container.getBoundingClientRect().top + fromRect.height / 2) + 'px';
        mushroom.style.zIndex = '100';
        mushroom.style.pointerEvents = 'none';
        mushroom.textContent = '🍄';
        
        container.appendChild(mushroom);
        mushrooms.push(mushroom);
    }
    
    // Calculate trajectory
    const startX = fromRect.left - container.getBoundingClientRect().left + fromRect.width / 2;
    const startY = fromRect.top - container.getBoundingClientRect().top + fromRect.height / 2;
    const endX = toRect.left - container.getBoundingClientRect().left + toRect.width / 2;
    const endY = toRect.top - container.getBoundingClientRect().top + toRect.height / 2;
    
    // Animate each mushroom with slight offset
    return new Promise(resolve => {
        let completed = 0;
        
        mushrooms.forEach((mushroom, index) => {
            let progress = 0;
            const duration = 600;
            const startTime = Date.now() + (index * 80); // Stagger start times
            const offsetX = (Math.random() - 0.5) * 40; // Random spread
            const offsetY = (Math.random() - 0.5) * 40;
            
            function animate() {
                const elapsed = Date.now() - startTime;
                if (elapsed < 0) {
                    requestAnimationFrame(animate);
                    return;
                }
                
                progress = Math.min(elapsed / duration, 1);
                
                const currentX = startX + (endX - startX) * progress + offsetX;
                const currentY = startY + (endY - startY) * progress + offsetY;
                
                // Add rotation
                mushroom.style.transform = `rotate(${progress * 360 * 2}deg)`;
                mushroom.style.left = currentX + 'px';
                mushroom.style.top = currentY + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    mushroom.remove();
                    completed++;
                    if (completed === mushroomCount) {
                        resolve();
                    }
                }
            }
            
            animate();
        });
    });
}

// Splash Animation (Octopus Drench Attack)
async function playSplashAnimation(fromElement, toElement) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const container = fromElement.parentElement;
    
    // Create multiple water droplets
    const droplets = [];
    const dropletCount = 8;
    
    for (let i = 0; i < dropletCount; i++) {
        const droplet = document.createElement('div');
        droplet.style.position = 'absolute';
        droplet.style.fontSize = '1.5rem';
        droplet.style.left = (fromRect.left - container.getBoundingClientRect().left + fromRect.width / 2) + 'px';
        droplet.style.top = (fromRect.top - container.getBoundingClientRect().top + fromRect.height / 2) + 'px';
        droplet.style.zIndex = '100';
        droplet.style.pointerEvents = 'none';
        droplet.textContent = '💧';
        
        container.appendChild(droplet);
        droplets.push(droplet);
    }
    
    // Calculate trajectory
    const startX = fromRect.left - container.getBoundingClientRect().left + fromRect.width / 2;
    const startY = fromRect.top - container.getBoundingClientRect().top + fromRect.height / 2;
    const endX = toRect.left - container.getBoundingClientRect().left + toRect.width / 2;
    const endY = toRect.top - container.getBoundingClientRect().top + toRect.height / 2;
    
    // Animate each droplet with arc trajectory
    return new Promise(resolve => {
        let completed = 0;
        
        droplets.forEach((droplet, index) => {
            let progress = 0;
            const duration = 700;
            const startTime = Date.now() + (index * 60); // Stagger start times
            const offsetX = (Math.random() - 0.5) * 60; // Random spread
            const arcHeight = 50 + Math.random() * 30; // Arc height
            
            function animate() {
                const elapsed = Date.now() - startTime;
                if (elapsed < 0) {
                    requestAnimationFrame(animate);
                    return;
                }
                
                progress = Math.min(elapsed / duration, 1);
                
                // Arc trajectory
                const currentX = startX + (endX - startX) * progress + offsetX;
                const arc = Math.sin(progress * Math.PI) * arcHeight;
                const currentY = startY + (endY - startY) * progress - arc;
                
                // Scale down as it travels
                const scale = 1 - progress * 0.3;
                droplet.style.transform = `scale(${scale})`;
                droplet.style.left = currentX + 'px';
                droplet.style.top = currentY + 'px';
                droplet.style.opacity = 1 - progress * 0.5;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    droplet.remove();
                    completed++;
                    if (completed === dropletCount) {
                        // Create splash effect on hero
                        const splash = document.createElement('div');
                        splash.style.position = 'absolute';
                        splash.style.fontSize = '3rem';
                        splash.style.left = endX + 'px';
                        splash.style.top = endY + 'px';
                        splash.style.zIndex = '100';
                        splash.style.pointerEvents = 'none';
                        splash.textContent = '💦';
                        splash.style.transform = 'translate(-50%, -50%)';
                        container.appendChild(splash);
                        
                        // Fade out splash
                        setTimeout(() => {
                            splash.style.transition = 'opacity 0.3s';
                            splash.style.opacity = '0';
                            setTimeout(() => splash.remove(), 300);
                        }, 200);
                        
                        resolve();
                    }
                }
            }
            
            animate();
        });
    });
}

// Export to global scope
window.playDragonBoltProjectile = playDragonBoltProjectile;
window.playMushroomProjectile = playMushroomProjectile;
window.playSplashAnimation = playSplashAnimation;

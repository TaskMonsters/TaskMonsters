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

// Export to global scope
window.playDragonBoltProjectile = playDragonBoltProjectile;
window.playMushroomProjectile = playMushroomProjectile;

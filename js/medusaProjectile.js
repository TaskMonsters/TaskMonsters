// Medusa Projectile Animation for Task Monsters

async function playMedusaProjectile(fromElement, toElement) {
    return new Promise((resolve) => {
        // Get positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create projectile element
        const projectile = document.createElement('div');
        projectile.className = 'medusa-projectile';
        projectile.style.position = 'fixed';
        projectile.style.left = fromRect.left + fromRect.width / 2 + 'px';
        projectile.style.top = fromRect.top + fromRect.height / 2 + 'px';
        projectile.style.width = '32px';
        projectile.style.height = '32px';
        projectile.style.backgroundImage = 'url(assets/enemies/medusa-attack.png)';
        projectile.style.backgroundSize = 'contain';
        projectile.style.backgroundRepeat = 'no-repeat';
        projectile.style.imageRendering = 'pixelated';
        projectile.style.zIndex = '10000';
        projectile.style.transition = 'all 0.6s ease-out';
        projectile.style.transform = 'scale(1)';
        projectile.style.opacity = '1';
        
        document.body.appendChild(projectile);
        
        // Animate to target after a brief delay
        setTimeout(() => {
            projectile.style.left = toRect.left + toRect.width / 2 + 'px';
            projectile.style.top = toRect.top + toRect.height / 2 + 'px';
            projectile.style.transform = 'scale(1.5) rotate(360deg)';
        }, 50);
        
        // Remove projectile and resolve after animation
        setTimeout(() => {
            projectile.style.opacity = '0';
            projectile.style.transform = 'scale(0.5)';
            setTimeout(() => {
                projectile.remove();
                resolve();
            }, 200);
        }, 700);
    });
}

// Waveform Projectile Animation (Drone, Robot)
async function playWaveformAnimation(fromElement, toElement) {
    return new Promise((resolve) => {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create waveform projectile
        const projectile = document.createElement('div');
        projectile.style.position = 'fixed';
        projectile.style.left = fromRect.left + fromRect.width / 2 + 'px';
        projectile.style.top = fromRect.top + fromRect.height / 2 + 'px';
        projectile.style.width = '40px';
        projectile.style.height = '20px';
        projectile.style.fontSize = '30px';
        projectile.textContent = '〰️';
        projectile.style.zIndex = '10000';
        projectile.style.transition = 'all 0.5s linear';
        projectile.style.opacity = '1';
        
        document.body.appendChild(projectile);
        
        // Animate to target
        setTimeout(() => {
            projectile.style.left = toRect.left + toRect.width / 2 + 'px';
            projectile.style.top = toRect.top + toRect.height / 2 + 'px';
        }, 50);
        
        // Remove and resolve
        setTimeout(() => {
            projectile.style.opacity = '0';
            setTimeout(() => {
                projectile.remove();
                resolve();
            }, 200);
        }, 600);
    });
}

// Alien Projectile Animation
async function playAlienProjectile(fromElement, toElement) {
    return new Promise((resolve) => {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create alien projectile (green energy ball)
        const projectile = document.createElement('div');
        projectile.style.position = 'fixed';
        projectile.style.left = fromRect.left + fromRect.width / 2 + 'px';
        projectile.style.top = fromRect.top + fromRect.height / 2 + 'px';
        projectile.style.width = '24px';
        projectile.style.height = '24px';
        projectile.style.borderRadius = '50%';
        projectile.style.background = 'radial-gradient(circle, #00ff00, #00aa00)';
        projectile.style.boxShadow = '0 0 10px #00ff00';
        projectile.style.zIndex = '10000';
        projectile.style.transition = 'all 0.5s ease-out';
        projectile.style.opacity = '1';
        
        document.body.appendChild(projectile);
        
        // Animate to target
        setTimeout(() => {
            projectile.style.left = toRect.left + toRect.width / 2 + 'px';
            projectile.style.top = toRect.top + toRect.height / 2 + 'px';
            projectile.style.transform = 'scale(1.5)';
        }, 50);
        
        // Remove and resolve
        setTimeout(() => {
            projectile.style.opacity = '0';
            projectile.style.transform = 'scale(0.2)';
            setTimeout(() => {
                projectile.remove();
                resolve();
            }, 200);
        }, 600);
    });
}

// Fire Explosion Animation (Fire Skull)
async function playFireExplosion(fromElement, toElement) {
    return new Promise((resolve) => {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create fire projectile
        const projectile = document.createElement('div');
        projectile.style.position = 'fixed';
        projectile.style.left = fromRect.left + fromRect.width / 2 + 'px';
        projectile.style.top = fromRect.top + fromRect.height / 2 + 'px';
        projectile.style.width = '32px';
        projectile.style.height = '32px';
        projectile.style.fontSize = '32px';
        projectile.textContent = '🔥';
        projectile.style.zIndex = '10000';
        projectile.style.transition = 'all 0.6s ease-out';
        projectile.style.opacity = '1';
        
        document.body.appendChild(projectile);
        
        // Animate to target
        setTimeout(() => {
            projectile.style.left = toRect.left + toRect.width / 2 + 'px';
            projectile.style.top = toRect.top + toRect.height / 2 + 'px';
            projectile.style.transform = 'scale(2) rotate(360deg)';
        }, 50);
        
        // Explosion effect
        setTimeout(() => {
            projectile.textContent = '💥';
            projectile.style.transform = 'scale(3)';
            projectile.style.opacity = '0.8';
        }, 650);
        
        // Remove and resolve
        setTimeout(() => {
            projectile.style.opacity = '0';
            setTimeout(() => {
                projectile.remove();
                resolve();
            }, 200);
        }, 900);
    });
}

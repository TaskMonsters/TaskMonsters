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

// ========================================
// UNIFIED PROJECTILE SYSTEM
// ========================================
// Single source of truth for all battle projectiles
// Uses assets from Shop Battle Item Attacks pack

// Projectile configuration - maps attack types to asset paths
const PROJECTILE_CONFIG = {
    fireball: {
        sprite: 'assets/projectiles/FireballAttack.png',
        width: 80,
        height: 80,
        duration: 800,
        rotation: true
    },
    spark: {
        sprite: 'assets/projectiles/SparkAttack.png',
        width: 60,
        height: 60,
        duration: 600,
        rotation: false
    },
    waveform: {
        sprite: 'assets/projectiles/waveform/waveform-spritesheet.png',
        width: 32,
        height: 32,
        duration: 700,
        rotation: false,
        spritesheet: true,
        frames: 4
    },
    alien: {
        sprite: 'assets/projectiles/alien-projectile.png',
        width: 48,
        height: 48,
        duration: 900,
        rotation: true
    },
    prickler: {
        sprite: 'assets/projectiles/PricklerAttack.png',
        width: 70,
        height: 70,
        duration: 700,
        rotation: true
    },
    freeze: {
        sprite: 'assets/projectiles/FreezeAttack.png',
        width: 75,
        height: 75,
        duration: 800,
        rotation: false
    },
    blue_flame: {
        sprite: 'assets/projectiles/BlueFlame.png',
        width: 85,
        height: 85,
        duration: 850,
        rotation: true
    },
    asteroid: {
        sprite: 'assets/projectiles/AsteroidAttack.png',
        width: 90,
        height: 90,
        duration: 750,
        rotation: true
    },
    procrastination_ghost: {
        sprite: 'assets/projectiles/ProcrastinationGhostAttack.png',
        width: 80,
        height: 80,
        duration: 900,
        rotation: false
    },
    poison_leaf: {
        sprite: 'assets/projectiles/PoisonLeafAttack.png',
        width: 65,
        height: 65,
        duration: 750,
        rotation: true
    },
    mirror: {
        sprite: 'assets/projectiles/MirrorAttack.png',
        width: 70,
        height: 70,
        duration: 800,
        rotation: false
    }
};

// Active projectile tracker - prevents duplicate spawns
let activeProjectiles = new Set();

/**
 * Create and animate a single projectile from start to target
 * @param {string} type - Projectile type from PROJECTILE_CONFIG
 * @param {HTMLElement} startElement - Starting position element
 * @param {HTMLElement} targetElement - Target position element
 * @param {Function} onComplete - Optional callback when animation completes
 * @returns {Promise} Resolves when animation completes
 */
async function createProjectile(type, startElement, targetElement, onComplete = null) {
    const config = PROJECTILE_CONFIG[type];
    
    if (!config) {
        console.error(`Unknown projectile type: ${type}`);
        return;
    }
    
    // Prevent duplicate projectiles of the same type
    const projectileId = `${type}_${Date.now()}`;
    if (activeProjectiles.has(type)) {
        console.warn(`Projectile ${type} already active, skipping duplicate`);
        return;
    }
    
    activeProjectiles.add(type);
    
    // Create projectile element
    const projectile = document.createElement('div');
    projectile.className = `projectile-${type}`;
    projectile.style.cssText = `
        position: fixed;
        width: ${config.width}px;
        height: ${config.height}px;
        background-image: url('${config.sprite}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        image-rendering: pixelated;
        pointer-events: none;
        z-index: 10000;
    `;
    
    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position at start
    const halfWidth = config.width / 2;
    const halfHeight = config.height / 2;
    projectile.style.left = (startRect.left + startRect.width / 2 - halfWidth) + 'px';
    projectile.style.top = (startRect.top + startRect.height / 2 - halfHeight) + 'px';
    
    document.body.appendChild(projectile);
    
    // Animate projectile
    const startTime = Date.now();
    let rotation = 0;
    
    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / config.duration, 1);
            
            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - halfWidth;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - halfHeight;
            
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Apply rotation if enabled
            if (config.rotation) {
                rotation += 10;
                projectile.style.transform = `rotate(${rotation}deg)`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - cleanup
                projectile.remove();
                activeProjectiles.delete(type);
                
                if (onComplete) {
                    onComplete();
                }
                
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
}

/**
 * Clear all active projectiles (for battle cleanup)
 */
function clearAllProjectiles() {
    activeProjectiles.clear();
    // Remove any lingering projectile elements
    document.querySelectorAll('[class^="projectile-"]').forEach(el => el.remove());
}

// Export to window
window.createProjectile = createProjectile;
window.clearAllProjectiles = clearAllProjectiles;
window.PROJECTILE_CONFIG = PROJECTILE_CONFIG;

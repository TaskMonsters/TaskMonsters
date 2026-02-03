// Lightning Bolt Animation - Dramatic lightning strike effect

async function playLightningBoltAnimation(startElement, targetElement) {
    console.log('⚡ Lightning Bolt animation starting');
    
    // Create lightning bolt container
    const lightningContainer = document.createElement('div');
    lightningContainer.style.position = 'fixed';
    lightningContainer.style.top = '0';
    lightningContainer.style.left = '0';
    lightningContainer.style.width = '100%';
    lightningContainer.style.height = '100%';
    lightningContainer.style.pointerEvents = 'none';
    lightningContainer.style.zIndex = '10000';
    document.body.appendChild(lightningContainer);
    
    // Get target position
    const targetRect = targetElement.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    
    // Create multiple lightning bolts for dramatic effect
    const boltCount = 3;
    const bolts = [];
    
    for (let i = 0; i < boltCount; i++) {
        const bolt = document.createElement('div');
        bolt.style.position = 'absolute';
        bolt.style.width = '4px';
        bolt.style.height = '100%';
        bolt.style.background = 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 20%, #4af 40%, #fff 60%, rgba(255,255,255,0) 100%)';
        bolt.style.left = (targetX + (Math.random() - 0.5) * 40) + 'px';
        bolt.style.top = '0';
        bolt.style.opacity = '0';
        bolt.style.filter = 'blur(1px)';
        bolt.style.boxShadow = '0 0 20px #4af, 0 0 40px #4af, 0 0 60px #4af';
        bolt.style.animation = `lightning-strike-${i} 0.6s ease-out`;
        lightningContainer.appendChild(bolt);
        bolts.push(bolt);
    }
    
    // Add keyframe animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes lightning-strike-0 {
            0% { opacity: 0; transform: scaleY(0); }
            10% { opacity: 1; transform: scaleY(1); }
            20% { opacity: 0.8; }
            30% { opacity: 1; }
            40% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes lightning-strike-1 {
            0% { opacity: 0; transform: scaleY(0); }
            15% { opacity: 1; transform: scaleY(1); }
            25% { opacity: 0.7; }
            35% { opacity: 1; }
            45% { opacity: 0.5; }
            100% { opacity: 0; }
        }
        @keyframes lightning-strike-2 {
            0% { opacity: 0; transform: scaleY(0); }
            20% { opacity: 1; transform: scaleY(1); }
            30% { opacity: 0.6; }
            40% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes lightning-flash {
            0% { opacity: 0; }
            10% { opacity: 0.8; }
            20% { opacity: 0.3; }
            30% { opacity: 0.7; }
            40% { opacity: 0.2; }
            50% { opacity: 0.6; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Create screen flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'radial-gradient(circle at ' + targetX + 'px ' + targetY + 'px, rgba(100, 180, 255, 0.6) 0%, rgba(100, 180, 255, 0.3) 30%, transparent 60%)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.animation = 'lightning-flash 0.6s ease-out';
    document.body.appendChild(flash);
    
    // Create impact effect at target
    const impact = document.createElement('div');
    impact.style.position = 'fixed';
    impact.style.left = (targetX - 50) + 'px';
    impact.style.top = (targetY - 50) + 'px';
    impact.style.width = '100px';
    impact.style.height = '100px';
    impact.style.borderRadius = '50%';
    impact.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(100,180,255,0.6) 40%, transparent 70%)';
    impact.style.boxShadow = '0 0 30px #4af, 0 0 60px #4af, 0 0 90px #4af';
    impact.style.pointerEvents = 'none';
    impact.style.zIndex = '10001';
    impact.style.opacity = '0';
    lightningContainer.appendChild(impact);
    
    // Animate impact
    setTimeout(() => {
        impact.style.transition = 'all 0.3s ease-out';
        impact.style.opacity = '1';
        impact.style.transform = 'scale(1.5)';
        
        setTimeout(() => {
            impact.style.opacity = '0';
            impact.style.transform = 'scale(2)';
        }, 150);
    }, 100);
    
    // Create electric particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = targetX + 'px';
        particle.style.top = targetY + 'px';
        particle.style.width = '3px';
        particle.style.height = '3px';
        particle.style.borderRadius = '50%';
        particle.style.background = '#4af';
        particle.style.boxShadow = '0 0 10px #4af';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10001';
        lightningContainer.appendChild(particle);
        
        const angle = (i / 12) * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        const duration = 400 + Math.random() * 200;
        
        setTimeout(() => {
            particle.style.transition = `all ${duration}ms ease-out`;
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
        }, 100);
    }
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Clean up
    lightningContainer.remove();
    flash.remove();
    style.remove();
    
    console.log('⚡ Lightning Bolt animation complete');
}

// Export function
window.playLightningBoltAnimation = playLightningBoltAnimation;

/**
 * BATTLE HP ANIMATIONS
 * Shows floating damage and heal numbers above sprites during battle
 * 
 * POSITIONING STRATEGY:
 * - Anchored relative to sprite wrapper (parent container)
 * - Positioned LOWER and closer to sprite for better visibility
 * - Animation constrained to stay within battle arena bounds
 * - Responsive to different sprite scales and screen sizes
 */

// Show damage animation above a sprite (-HP in red)
function showBattleDamageAnimation(spriteId, damage) {
    console.log(`[HP Animation] showBattleDamageAnimation called: spriteId=${spriteId}, damage=${damage}`);
    const sprite = document.getElementById(spriteId);
    if (!sprite) {
        console.error(`[HP Animation] Sprite not found: ${spriteId}`);
        return;
    }
    if (!sprite.parentElement) {
        console.error(`[HP Animation] Sprite has no parent: ${spriteId}`);
        return;
    }
    
    // Get sprite wrapper for positioning context
    const spriteWrapper = sprite.parentElement;
    
    // Create damage text element
    const damageText = document.createElement('div');
    damageText.textContent = `-${damage} HP`;
    damageText.className = 'hp-animation-text';
    
    // Core positioning: anchor to sprite wrapper with safe positioning
    damageText.style.position = 'absolute';
    damageText.style.left = '50%';
    
    // CRITICAL FIX: Position LOWER (closer to sprite) to avoid clipping
    // Changed from -20px to 10px to position within visible sprite area
    damageText.style.top = '10px';
    
    // Transform for centering and animation
    damageText.style.transform = 'translateX(-50%)';
    damageText.style.transformOrigin = 'center top';
    
    // Styling
    damageText.style.fontSize = '24px';
    damageText.style.fontWeight = 'bold';
    damageText.style.color = '#ef4444'; // Red color
    damageText.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)';
    damageText.style.pointerEvents = 'none';
    damageText.style.zIndex = '1000';
    damageText.style.whiteSpace = 'nowrap';
    
    // Performance optimization
    damageText.style.willChange = 'transform, opacity';
    
    // CRITICAL FIX: Reduced float distance to keep animation within arena bounds
    // Changed from xpFloat (translateY -80px) to custom animation with -50px
    damageText.style.animation = 'hpFloatDamage 2s ease-out forwards';
    
    // Add to sprite's parent container (sprite-wrapper)
    spriteWrapper.appendChild(damageText);
    
    // Remove after animation completes
    setTimeout(() => {
        if (damageText.parentElement) {
            damageText.parentElement.removeChild(damageText);
        }
    }, 2000);
}

// Show heal animation above a sprite (+HP in blue)
function showBattleHealAnimation(spriteId, healAmount) {
    console.log(`[HP Animation] showBattleHealAnimation called: spriteId=${spriteId}, healAmount=${healAmount}`);
    const sprite = document.getElementById(spriteId);
    if (!sprite) {
        console.error(`[HP Animation] Sprite not found: ${spriteId}`);
        return;
    }
    if (!sprite.parentElement) {
        console.error(`[HP Animation] Sprite has no parent: ${spriteId}`);
        return;
    }
    
    // Get sprite wrapper for positioning context
    const spriteWrapper = sprite.parentElement;
    
    // Create heal text element
    const healText = document.createElement('div');
    healText.textContent = `+${healAmount} HP`;
    healText.className = 'hp-animation-text';
    
    // Core positioning: anchor to sprite wrapper with safe positioning
    healText.style.position = 'absolute';
    healText.style.left = '50%';
    
    // CRITICAL FIX: Position LOWER (closer to sprite) to avoid clipping
    // Changed from -20px to 10px to position within visible sprite area
    healText.style.top = '10px';
    
    // Transform for centering and animation
    healText.style.transform = 'translateX(-50%)';
    healText.style.transformOrigin = 'center top';
    
    // Styling
    healText.style.fontSize = '24px';
    healText.style.fontWeight = 'bold';
    healText.style.color = '#3b82f6'; // Blue color
    healText.style.textShadow = '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)';
    healText.style.pointerEvents = 'none';
    healText.style.zIndex = '1000';
    healText.style.whiteSpace = 'nowrap';
    
    // Performance optimization
    healText.style.willChange = 'transform, opacity';
    
    // CRITICAL FIX: Reduced float distance to keep animation within arena bounds
    // Changed from xpFloat (translateY -80px) to custom animation with -50px
    healText.style.animation = 'hpFloatHeal 2s ease-out forwards';
    
    // Add to sprite's parent container (sprite-wrapper)
    spriteWrapper.appendChild(healText);
    
    // Remove after animation completes
    setTimeout(() => {
        if (healText.parentElement) {
            healText.parentElement.removeChild(healText);
        }
    }, 2000);
}

// Expose functions globally
window.showBattleDamageAnimation = showBattleDamageAnimation;
window.showBattleHealAnimation = showBattleHealAnimation;

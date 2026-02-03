/**
 * BATTLE HP ANIMATIONS
 * Shows floating damage and heal numbers above sprites during battle
 * 
 * POSITIONING STRATEGY:
 * - Same size for both hero and enemy (24px font)
 * - Positioned above the sprite wrapper (negative top value)
 * - Animation floats upward and fades out
 * - Appended to sprite-container for proper visibility
 */

// Show damage animation above a sprite (-HP in red)
function showBattleDamageAnimation(spriteId, damage) {
    console.log(`[HP Animation] showBattleDamageAnimation called: spriteId=${spriteId}, damage=${damage}`);
    const sprite = document.getElementById(spriteId);
    if (!sprite) {
        console.error(`[HP Animation] Sprite not found: ${spriteId}`);
        return;
    }
    
    // Get the sprite-container (grandparent) for positioning context
    // Structure: sprite-container > sprite-wrapper > heroSprite/enemySprite
    const spriteWrapper = sprite.parentElement;
    if (!spriteWrapper) {
        console.error(`[HP Animation] Sprite wrapper not found for: ${spriteId}`);
        return;
    }
    
    const spriteContainer = spriteWrapper.parentElement;
    if (!spriteContainer) {
        console.error(`[HP Animation] Sprite container not found for: ${spriteId}`);
        return;
    }
    
    // Create damage text element
    const damageText = document.createElement('div');
    damageText.textContent = `-${damage} HP`;
    damageText.className = 'hp-animation-text hp-damage-text';
    
    // Core positioning: anchor to sprite container
    damageText.style.cssText = `
        position: absolute;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #ff4444;
        text-shadow: 
            2px 2px 0 #000,
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            0 0 10px rgba(255, 68, 68, 0.8),
            0 0 20px rgba(255, 68, 68, 0.5);
        pointer-events: none;
        z-index: 10000;
        white-space: nowrap;
        animation: hpFloatDamage 2s ease-out forwards;
    `;
    
    // Add to sprite container (not wrapper) for proper visibility
    spriteContainer.appendChild(damageText);
    console.log(`[HP Animation] Damage text appended to container for ${spriteId}`);
    
    // Remove after animation completes
    setTimeout(() => {
        if (damageText.parentElement) {
            damageText.parentElement.removeChild(damageText);
        }
    }, 2000);
}

// Show heal animation above a sprite (+HP in green)
function showBattleHealAnimation(spriteId, healAmount) {
    console.log(`[HP Animation] showBattleHealAnimation called: spriteId=${spriteId}, healAmount=${healAmount}`);
    const sprite = document.getElementById(spriteId);
    if (!sprite) {
        console.error(`[HP Animation] Sprite not found: ${spriteId}`);
        return;
    }
    
    // Get the sprite-container (grandparent) for positioning context
    const spriteWrapper = sprite.parentElement;
    if (!spriteWrapper) {
        console.error(`[HP Animation] Sprite wrapper not found for: ${spriteId}`);
        return;
    }
    
    const spriteContainer = spriteWrapper.parentElement;
    if (!spriteContainer) {
        console.error(`[HP Animation] Sprite container not found for: ${spriteId}`);
        return;
    }
    
    // Create heal text element
    const healText = document.createElement('div');
    healText.textContent = `+${healAmount} HP`;
    healText.className = 'hp-animation-text hp-heal-text';
    
    // Core positioning: anchor to sprite container
    healText.style.cssText = `
        position: absolute;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #44ff44;
        text-shadow: 
            2px 2px 0 #000,
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            0 0 10px rgba(68, 255, 68, 0.8),
            0 0 20px rgba(68, 255, 68, 0.5);
        pointer-events: none;
        z-index: 10000;
        white-space: nowrap;
        animation: hpFloatHeal 2s ease-out forwards;
    `;
    
    // Add to sprite container (not wrapper) for proper visibility
    spriteContainer.appendChild(healText);
    console.log(`[HP Animation] Heal text appended to container for ${spriteId}`);
    
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

console.log('[HP Animation] Battle HP Animations loaded');

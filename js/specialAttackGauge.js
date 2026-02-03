/**
 * Special Attack Gauge System
 * Manages the special attack gauge that fills up during battle
 */

// Initialize special attack gauge
function initSpecialAttackGauge() {
    if (!window.gameState) {
        window.gameState = {};
    }
    
    // Initialize gauge to 0 if not exists
    if (typeof window.gameState.specialAttackGauge === 'undefined') {
        window.gameState.specialAttackGauge = 0;
    }
    
    updateSpecialAttackDisplay();
    console.log('[SpecialAttackGauge] Initialized:', window.gameState.specialAttackGauge);
}

// Increase special attack gauge
function increaseSpecialGauge(amount) {
    if (!window.gameState) {
        window.gameState = {};
    }
    
    // Initialize if doesn't exist
    if (typeof window.gameState.specialAttackGauge === 'undefined') {
        window.gameState.specialAttackGauge = 0;
    }
    
    // Increase gauge (max 100)
    window.gameState.specialAttackGauge = Math.min(100, window.gameState.specialAttackGauge + amount);
    
    updateSpecialAttackDisplay();
    
    console.log(`[SpecialAttackGauge] Increased by ${amount}. Current: ${window.gameState.specialAttackGauge}/100`);
}

// Reset special attack gauge to 0
function resetSpecialGauge() {
    if (!window.gameState) {
        window.gameState = {};
    }
    
    window.gameState.specialAttackGauge = 0;
    updateSpecialAttackDisplay();
    
    console.log('[SpecialAttackGauge] Reset to 0');
}

// Update special attack gauge display
function updateSpecialAttackDisplay() {
    const specialGauge = window.gameState?.specialAttackGauge || 0;
    // Get user level - check both jerryLevel and localStorage
    let userLevel = window.gameState?.jerryLevel || 1;
    const storedLevel = parseInt(localStorage.getItem('level')) || 1;
    userLevel = Math.max(userLevel, storedLevel);
    console.log('[SpecialAttackGauge] User level:', userLevel, '(gameState:', window.gameState?.jerryLevel, ', localStorage:', storedLevel, ')');
    
    // Update gauge value text
    const specialAttackValue = document.getElementById('specialAttackValue');
    if (specialAttackValue) {
        specialAttackValue.textContent = `${Math.ceil(specialGauge)}/100`;
    }
    
    // Update gauge text
    const specialGaugeText = document.getElementById('specialGaugeText');
    if (specialGaugeText) {
        specialGaugeText.textContent = `${Math.ceil(specialGauge)}/100`;
    }
    
    // Update gauge bar
    const specialAttackBar = document.getElementById('specialAttackBar');
    const specialGaugeBar = document.getElementById('specialGaugeBar');
    
    if (specialAttackBar) {
        specialAttackBar.style.width = `${specialGauge}%`;
    }
    if (specialGaugeBar) {
        specialGaugeBar.style.width = `${specialGauge}%`;
    }
    
    // Show/hide gauge based on level
    const specialGaugeContainer = document.getElementById('specialAttackGaugeContainer');
    if (specialGaugeContainer) {
        if (userLevel >= 10) {
            specialGaugeContainer.style.display = 'block';
        } else {
            specialGaugeContainer.style.display = 'none';
        }
    }
    
    // Update button state
    const specialAttackBtn = document.getElementById('btnSpecialAttack');
    if (specialAttackBtn) {
        if (userLevel < 10) {
            specialAttackBtn.style.display = 'none';
        } else {
            specialAttackBtn.style.display = 'block';
            specialAttackBtn.disabled = specialGauge < 100;
            
            // Update button text
            specialAttackBtn.textContent = `⚡ Special Attack (${Math.ceil(specialGauge)}/100)`;
            
            // Highlight when ready
            if (specialGauge >= 100) {
                specialAttackBtn.classList.add('special-ready');
                specialAttackBtn.style.background = 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)';
                specialAttackBtn.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
            } else {
                specialAttackBtn.classList.remove('special-ready');
                specialAttackBtn.style.background = '';
                specialAttackBtn.style.boxShadow = '';
            }
        }
    }
}

// Export to global scope
window.initSpecialAttackGauge = initSpecialAttackGauge;
window.increaseSpecialGauge = increaseSpecialGauge;
window.resetSpecialGauge = resetSpecialGauge;
window.updateSpecialAttackDisplay = updateSpecialAttackDisplay;

console.log('[SpecialAttackGauge] Special Attack Gauge System loaded');

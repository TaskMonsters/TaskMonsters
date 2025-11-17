// Special Gauge System for Monster Special Attacks
// Fills +15% per attack, +10% when damaged
// Triggers monster-specific special attacks

class SpecialGaugeSystem {
    constructor() {
        this.gauge = 0; // 0-100
        this.maxGauge = 100;
        this.isReady = false;
        this.fillPerAttack = 15;
        this.fillPerDamage = 10;
        this.gaugeElement = null;
        this.readyFlashInterval = null;
    }
    
    // Initialize gauge UI
    init() {
        this.createGaugeUI();
        this.reset();
    }
    
    // Create gauge UI element matching attack/defense gauge style
    createGaugeUI() {
        // Check if gauge already exists
        if (document.getElementById('special-gauge-container')) {
            this.gaugeElement = document.getElementById('special-gauge-fill');
            return;
        }
        
        const container = document.createElement('div');
        container.className = 'gauge';
        container.id = 'special-gauge-container';
        container.innerHTML = `
            <div class="gauge-label">
                <span>💫 Special Attack</span>
                <span id="special-gauge-text">0/100</span>
            </div>
            <div class="gauge-bar-bg">
                <div id="special-gauge-fill" class="gauge-bar-fill special-gauge-fill" style="width: 0%;"></div>
            </div>
        `;
        
        // Add rainbow gradient animation styles
        const styles = `
            <style>
                .special-gauge-fill {
                    background: linear-gradient(90deg, #4169E1 0%, #9370DB 50%, #FFD700 100%) !important;
                    background-size: 200% 100%;
                    animation: gaugeShimmer 2s linear infinite;
                    transition: width 0.3s ease-out;
                }
                
                .special-gauge-fill.ready {
                    animation: gaugeShimmer 0.5s linear infinite, gaugePulse 1s ease-in-out infinite;
                }
                
                @keyframes gaugeShimmer {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 0%; }
                }
                
                @keyframes gaugePulse {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.5); }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
        
        // Insert gauge into gauge-container as the first gauge
        const gaugeContainer = document.querySelector('.gauge-container');
        if (gaugeContainer) {
            // Insert as first child in gauge container
            gaugeContainer.insertBefore(container, gaugeContainer.firstChild);
        } else {
            console.warn('gauge-container not found, appending to body');
            document.body.appendChild(container);
        }
        
        this.gaugeElement = document.getElementById('special-gauge-fill');
    }
    
    // Fill gauge by amount
    fill(amount) {
        this.gauge = Math.min(this.maxGauge, this.gauge + amount);
        this.updateUI();
        
        // Check if ready
        if (this.gauge >= this.maxGauge && !this.isReady) {
            this.setReady();
        }
    }
    
    // Fill gauge after player attacks
    fillOnAttack() {
        this.fill(this.fillPerAttack);
        showFloatingText(`+${this.fillPerAttack}% Special`, 'special');
    }
    
    // Fill gauge when player takes damage
    fillOnDamage() {
        this.fill(this.fillPerDamage);
        showFloatingText(`+${this.fillPerDamage}% Special`, 'special');
    }
    
    // Update gauge UI
    updateUI() {
        if (!this.gaugeElement) return;
        
        const percentage = (this.gauge / this.maxGauge) * 100;
        this.gaugeElement.style.width = `${percentage}%`;
        
        const textElement = document.getElementById('special-gauge-text');
        if (textElement) {
            textElement.textContent = `${Math.floor(this.gauge)}/${this.maxGauge}`;
        }
    }
    
    // Set gauge to ready state
    setReady() {
        this.isReady = true;
        this.gaugeElement.classList.add('ready');
        
        // Enable special attack button
        const specialBtn = document.getElementById('btnSpecialAttack');
        if (specialBtn) {
            specialBtn.disabled = false;
            specialBtn.classList.add('ready');
        }
        
        // Play ready sound if available
        if (window.audioManager && window.audioManager.playSpecialReady) {
            window.audioManager.playSpecialReady();
        }
        
        // Show floating text
        showFloatingText('⚡ SPECIAL READY! ⚡', 'special-ready');
    }
    
    // Use special attack (reset gauge)
    use() {
        if (!this.isReady) return false;
        
        this.reset();
        return true;
    }
    
    // Reset gauge
    reset() {
        this.gauge = 0;
        this.isReady = false;
        
        if (this.gaugeElement) {
            this.gaugeElement.classList.remove('ready');
        }
        
        // Disable special attack button
        const specialBtn = document.getElementById('btnSpecialAttack');
        if (specialBtn) {
            specialBtn.disabled = true;
            specialBtn.classList.remove('ready');
        }
        
        this.updateUI();
    }
}

// Initialize and export
const specialGauge = new SpecialGaugeSystem();
window.specialGauge = specialGauge;

console.log('✅ Special Gauge System loaded');

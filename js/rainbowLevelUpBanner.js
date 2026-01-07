/**
 * Rainbow Gradient Level-Up Banner
 * Shows a colorful animated banner when the monster levels up
 */

function showRainbowLevelUpBanner(level) {
    const banner = document.createElement('div');
    banner.className = 'rainbow-levelup-banner';
    
    banner.innerHTML = `
        <div class="rainbow-levelup-content">
            <div class="rainbow-levelup-emoji">🎉</div>
            <div class="rainbow-levelup-text">
                <div class="rainbow-levelup-title">LEVEL UP!</div>
                <div class="rainbow-levelup-subtitle">Now Level ${level}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Play level up sound if available
    if (window.audioManager && window.audioManager.playSound) {
        window.audioManager.playSound('level_up', 0.7);
    }
    
    // Remove after animation
    setTimeout(() => {
        banner.style.animation = 'slideOutUp 0.5s ease-in forwards';
        setTimeout(() => banner.remove(), 500);
    }, 3000);
}

// Add CSS styles
const rainbowStyles = document.createElement('style');
rainbowStyles.textContent = `
    .rainbow-levelup-banner {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        animation: slideInDown 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .rainbow-levelup-content {
        background: linear-gradient(
            135deg,
            #FF6B6B 0%,
            #FFD93D 20%,
            #6BCF7F 40%,
            #4D96FF 60%,
            #9B59B6 80%,
            #FF6B6B 100%
        );
        background-size: 200% 200%;
        animation: rainbowGradient 3s ease infinite;
        padding: 20px 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(255, 255, 255, 0.2) inset;
        display: flex;
        align-items: center;
        gap: 15px;
        border: 3px solid rgba(255, 255, 255, 0.3);
    }
    
    .rainbow-levelup-emoji {
        font-size: 48px;
        animation: bounce 0.6s ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
    }
    
    .rainbow-levelup-text {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .rainbow-levelup-title {
        font-size: 32px;
        font-weight: 900;
        color: white;
        text-shadow: 
            0 0 10px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(255, 255, 255, 0.3),
            2px 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 2px;
        text-transform: uppercase;
    }
    
    .rainbow-levelup-subtitle {
        font-size: 18px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    @keyframes rainbowGradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    
    @keyframes slideInDown {
        from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
    }
    
    @keyframes bounce {
        0%, 100% {
            transform: translateY(0) scale(1);
        }
        50% {
            transform: translateY(-10px) scale(1.1);
        }
    }
    
    /* Mobile responsive */
    @media (max-width: 600px) {
        .rainbow-levelup-content {
            padding: 15px 30px;
        }
        
        .rainbow-levelup-emoji {
            font-size: 36px;
        }
        
        .rainbow-levelup-title {
            font-size: 24px;
        }
        
        .rainbow-levelup-subtitle {
            font-size: 14px;
        }
    }
`;

document.head.appendChild(rainbowStyles);

// Export to global scope
window.showRainbowLevelUpBanner = showRainbowLevelUpBanner;

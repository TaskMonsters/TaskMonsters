// rainbowLevelUpBanner.js
// Rainbow level-up banner animation for Task Monsters

(function() {
    'use strict';

    /**
     * Show a rainbow level-up banner animation
     * @param {number} level - The new level reached
     */
    function showRainbowLevelUpBanner(level) {
        try {
            // Create banner element
            const banner = document.createElement('div');
            banner.id = 'rainbowLevelUpBanner';
            banner.style.cssText = [
                'position: fixed',
                'top: 0',
                'left: 0',
                'width: 100%',
                'z-index: 99999',
                'text-align: center',
                'padding: 18px 0',
                'font-size: 1.5rem',
                'font-weight: 800',
                'letter-spacing: 2px',
                'background: linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff,#8b00ff)',
                'background-size: 200% auto',
                'color: #fff',
                'text-shadow: 0 2px 8px rgba(0,0,0,0.5)',
                'animation: rainbowSlide 1.5s linear infinite, bannerFadeIn 0.4s ease',
                'pointer-events: none',
            ].join(';');

            banner.textContent = `🌈 LEVEL UP! You reached Level ${level}! 🌈`;

            // Inject keyframes if not already present
            if (!document.getElementById('rainbowBannerStyles')) {
                const style = document.createElement('style');
                style.id = 'rainbowBannerStyles';
                style.textContent = `
                    @keyframes rainbowSlide {
                        0%   { background-position: 0% center; }
                        100% { background-position: 200% center; }
                    }
                    @keyframes bannerFadeIn {
                        from { opacity: 0; transform: translateY(-100%); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(banner);

            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (banner && banner.parentNode) {
                    banner.style.transition = 'opacity 0.4s ease';
                    banner.style.opacity = '0';
                    setTimeout(() => {
                        if (banner && banner.parentNode) {
                            banner.parentNode.removeChild(banner);
                        }
                    }, 400);
                }
            }, 3000);

        } catch (err) {
            console.warn('[RainbowBanner] Could not show level-up banner:', err);
        }
    }

    // Expose globally
    window.showRainbowLevelUpBanner = showRainbowLevelUpBanner;

    console.log('[RainbowBanner] Loaded');
})();

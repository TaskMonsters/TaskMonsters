/**
 * Gloom Boss Encounter and Victory Modals
 * Special modals for The Gloom final boss encounters
 */

// Show Gloom encounter modal when battle starts
function showGloomEncounterModal() {
    const modal = document.createElement('div');
    modal.id = 'gloomEncounterModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease-in;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a0033 0%, #2d1b4e 50%, #1a0033 100%);
        border: 3px solid #8b5cf6;
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 0 50px rgba(139, 92, 246, 0.5), inset 0 0 30px rgba(139, 92, 246, 0.2);
        animation: glowPulse 2s ease-in-out infinite;
    `;
    
    content.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">
            👁️‍🗨️
        </div>
        <h1 style="color: #a78bfa; font-size: 42px; margin-bottom: 20px; text-shadow: 0 0 20px rgba(167, 139, 250, 0.8);">
            The Gloom Appears
        </h1>
        <p style="color: #e9d5ff; font-size: 20px; line-height: 1.6; margin-bottom: 15px;">
            You've made it this far, brave warrior! The shadowy force you heard about during your journey has finally revealed itself.
        </p>
        <p style="color: #c4b5fd; font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
            <strong style="color: #a78bfa;">The Gloom</strong> represents the ultimate challenge—procrastination, self-doubt, and distraction combined into one powerful entity.
        </p>
        <p style="color: #ddd6fe; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
            But you've trained for this. You've defeated countless enemies, completed hundreds of tasks, and grown stronger with each victory. <strong style="color: #fbbf24;">You are ready.</strong>
        </p>
        <p style="color: #fef3c7; font-size: 22px; font-weight: bold; margin-bottom: 30px; text-shadow: 0 0 10px rgba(251, 191, 36, 0.6);">
            ⚔️ Believe in yourself. You've got this! ⚔️
        </p>
        <button id="gloomEncounterContinue" style="
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            color: white;
            border: none;
            padding: 18px 50px;
            font-size: 22px;
            font-weight: bold;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(139, 92, 246, 0.6)';" 
           onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(139, 92, 246, 0.4)';">
            Face The Gloom
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 50px rgba(139, 92, 246, 0.5), inset 0 0 30px rgba(139, 92, 246, 0.2); }
            50% { box-shadow: 0 0 70px rgba(139, 92, 246, 0.8), inset 0 0 40px rgba(139, 92, 246, 0.4); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
    `;
    document.head.appendChild(style);
    
    // Button click handler
    document.getElementById('gloomEncounterContinue').addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 500);
    });
    
    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
}

// Show Gloom victory modal when player defeats The Gloom
function showGloomVictoryModal() {
    const modal = document.createElement('div');
    modal.id = 'gloomVictoryModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease-in;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
        border: 4px solid #f59e0b;
        border-radius: 20px;
        padding: 50px;
        max-width: 650px;
        text-align: center;
        box-shadow: 0 0 60px rgba(245, 158, 11, 0.6), inset 0 0 40px rgba(252, 211, 77, 0.3);
        animation: victoryGlow 2s ease-in-out infinite;
    `;
    
    content.innerHTML = `
        <div style="font-size: 100px; margin-bottom: 25px; animation: bounce 1s ease-in-out infinite;">
            🏆
        </div>
        <h1 style="color: #92400e; font-size: 48px; margin-bottom: 25px; text-shadow: 0 2px 10px rgba(146, 64, 14, 0.3);">
            INCREDIBLE VICTORY!
        </h1>
        <p style="color: #78350f; font-size: 24px; line-height: 1.6; margin-bottom: 20px; font-weight: bold;">
            You defeated The Gloom! 🎉
        </p>
        <p style="color: #92400e; font-size: 20px; line-height: 1.7; margin-bottom: 20px;">
            This is an <strong>amazing accomplishment</strong>! You've conquered the ultimate challenge and proven that you can overcome any obstacle.
        </p>
        <p style="color: #78350f; font-size: 19px; line-height: 1.7; margin-bottom: 20px;">
            Every task you completed, every enemy you defeated, every moment you pushed forward—it all led to this victory. <strong style="color: #b45309;">You are unstoppable!</strong>
        </p>
        <p style="color: #92400e; font-size: 20px; line-height: 1.7; margin-bottom: 25px;">
            Remember this feeling. You have the power to achieve anything you set your mind to. Keep going, keep growing, and keep conquering! 💪✨
        </p>
        <p style="color: #b45309; font-size: 22px; font-weight: bold; margin-bottom: 35px; text-shadow: 0 2px 8px rgba(180, 83, 9, 0.3);">
            🌟 You are a true champion! 🌟
        </p>
        <button id="gloomVictoryContinue" style="
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            padding: 20px 55px;
            font-size: 24px;
            font-weight: bold;
            border-radius: 14px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(245, 158, 11, 0.5);
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 7px 25px rgba(245, 158, 11, 0.7)';" 
           onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 5px 20px rgba(245, 158, 11, 0.5)';">
            Continue Your Journey
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes victoryGlow {
            0%, 100% { box-shadow: 0 0 60px rgba(245, 158, 11, 0.6), inset 0 0 40px rgba(252, 211, 77, 0.3); }
            50% { box-shadow: 0 0 80px rgba(245, 158, 11, 0.9), inset 0 0 50px rgba(252, 211, 77, 0.5); }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.1); }
        }
    `;
    document.head.appendChild(style);
    
    // Play victory music
    if (window.audioManager) {
        window.audioManager.playSound('battle_win', 0.8);
    }
    
    // Button click handler
    document.getElementById('gloomVictoryContinue').addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 500);
    });
}

// Export functions
window.showGloomEncounterModal = showGloomEncounterModal;
window.showGloomVictoryModal = showGloomVictoryModal;

/**
 * Mood Tracker System - Tooltip Style
 * Displays a speech bubble tooltip for users to track their mood with emoji buttons
 * Appears every hour and can be triggered by tapping the monster
 * Saves mood history to localStorage and displays on Habits page with filters
 */

const SAD_STREAK_ENCOURAGEMENT_MESSAGES = [
    "I'm still right here with you, and we can take this one small moment at a time.",
    "You do not have to be cheerful to be worthy of love, rest, and gentleness.",
    "Even on heavy days, you are still doing something brave by checking in.",
    "I know this stretch feels hard, but I am proud of you for staying with yourself.",
    "You are allowed to slow down. You are allowed to breathe. I am not going anywhere.",
    "This sadness is a feeling, not a verdict about who you are.",
    "You have made it through difficult days before, and I believe in your next small step.",
    "If today feels blurry, let me be a tiny reminder that you are deeply cared for.",
    "You do not need to fix everything tonight. We can just be gentle for a minute.",
    "I wish I could hand you a warm blanket and tell you that you are doing enough.",
    "Please be soft with yourself today. Your heart has been carrying a lot.",
    "I see the sad streak, and I also see how strong you are for continuing to show up.",
    "You are not behind. You are not broken. You are a person having a hard moment.",
    "Let's make the goal very small: one breath, one sip of water, one kind thought.",
    "You deserve comfort just as much on your worst days as on your best ones.",
    "I am holding space for you, even if all you can do right now is exist.",
    "Your feelings are real, but they are not the whole story of you.",
    "There is nothing weak about needing tenderness. Tenderness is how we heal.",
    "If your energy is low, then tiny progress is still beautiful progress.",
    "I care about you on the messy days too, especially the messy days.",
    "You are allowed to rest without earning it first.",
    "I hope you let this moment be smaller than your whole day.",
    "Even if your spark feels quiet, it is still there. I can feel it.",
    "You do not have to carry every heavy thing alone tonight.",
    "If all you do is make it through this hour, that still counts.",
    "I know your heart is tired. Let me remind you that tired hearts still deserve hope.",
    "The fact that you checked in tells me there is still a part of you reaching for care.",
    "Some days survival is the win. I am proud of you for surviving this one.",
    "You are worthy of patience while you find your footing again.",
    "Take your time. Healing and steadiness do not need to be rushed.",
    "You are more than this streak, more than this moment, more than this ache.",
    "I would sit quietly beside you if I could. Since I can't, please take this love instead.",
    "There is no shame in having a hard week. You are still lovable exactly as you are.",
    "Let tonight be gentle. Let tomorrow ask less of you. Let me cheer for you anyway.",
    "I'm proud of you for being honest about your feelings instead of hiding from them.",
    "When your mind is heavy, small comforts matter. Please choose one for yourself.",
    "You have permission to pause, regroup, and be human.",
    "If things feel dim right now, I will keep being your little light until it passes.",
    "You are not failing. You are feeling, and feelings can be very heavy.",
    "I hope you talk to yourself the way I would: gently, lovingly, and without blame.",
    "Your softness is not a flaw. It is one of the most beautiful things about you.",
    "We can aim for comfort, not perfection, just for tonight.",
    "You still matter on the days when your smile is harder to find.",
    "Maybe this is a good moment for water, a stretch, or one deep breath with me.",
    "I know this streak is long, but long streaks end too. This feeling will move someday.",
    "You are allowed to need extra care. That does not make you a burden.",
    "I believe there is still something gentle waiting for you on the other side of today.",
    "Even a tiny bit of hope is enough for us to hold onto together.",
    "You are loved in the quiet moments, the tired moments, and the tearful moments too.",
    "Thank you for staying. Thank you for checking in. That matters more than you know."
];

class MoodTracker {
    constructor() {
        this.moods = [
            { emoji: '😊', name: 'Happy', value: 'happy' },
            { emoji: '😢', name: 'Sad', value: 'sad' },
            { emoji: '🫤', name: 'Meh', value: 'meh' },
            { emoji: '😡', name: 'Angry', value: 'angry' }
        ];
        
        this.autoPopupInterval = 30 * 60 * 1000; // 30 minutes
        this.lastPopupTime = null;
        this.intervalId = null;
        
        this.init();
    }
    
    init() {
        console.log('[MoodTracker] Initializing...');
        
        // Create tooltip HTML
        this.createTooltip();
        
        // Add monster click listener
        this.addMonsterClickListener();
        
        // Start auto-popup timer
        this.startAutoPopup();
        
        // Load last popup time from localStorage
        const saved = localStorage.getItem('moodTrackerLastPopup');
        if (saved) {
            this.lastPopupTime = parseInt(saved);
        }
        
        console.log('[MoodTracker] Initialized successfully');
    }
    
    createTooltip() {
        // Check if tooltip already exists
        if (document.getElementById('moodTrackerTooltip')) {
            console.log('[MoodTracker] Tooltip already exists');
            return;
        }
        
        const tooltipHTML = `
            <div id="moodTrackerTooltip" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                margin-bottom: 5px;
                background-color: #2a2a3e;
                border: 2px solid #8b5cf6;
                border-radius: 17px;
                padding: 18px 20px;
                max-width: 320px;
                min-width: 290px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                opacity: 0;
                display: none;
                transition: opacity 0.3s ease, transform 0.3s ease;
                transform-origin: bottom center;
                z-index: 10000;
                word-wrap: break-word;
                overflow-wrap: break-word;
            ">

                
                <!-- Close Button -->
                <button id="moodTrackerCloseBtn" style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                    transition: color 0.2s;
                " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#ccc'">×</button>
                
                <!-- Title -->
                <h3 style="
                    color: #ffffff;
                    text-align: center;
                    margin: 0 0 14px 0;
                    font-size: 17px;
                    font-weight: 700;
                ">How are you feeling?</h3>
                
                <!-- Emoji Buttons -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 7px;
                    margin-bottom: 10px;
                ">
                    ${this.moods.map(mood => `
                        <button class="mood-btn-tooltip" data-mood="${mood.value}" style="
                            background: rgba(255, 255, 255, 0.1);
                            border: 2px solid rgba(139, 92, 246, 0.3);
                            border-radius: 12px;
                            padding: 14px 8px;
                            font-size: 32px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 6px;
                            min-height: 72px;
                        " onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.borderColor='#8b5cf6'; this.style.transform='scale(1.08)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(139, 92, 246, 0.3)'; this.style.transform='scale(1)'">
                            <span>${mood.emoji}</span>
                            <span style="font-size: 11px; color: #ccc; font-weight: 600;">${mood.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Optional Note -->
                <textarea id="moodNoteTooltip" placeholder="Add a note (optional)..." style="
                    width: 100%;
                    min-height: 60px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-radius: 10px;
                    padding: 10px 12px;
                    color: #ffffff;
                    font-size: 14px;
                    resize: vertical;
                    font-family: inherit;
                    box-sizing: border-box;
                    margin-top: 4px;
                "></textarea>
            </div>
        `;
        
        // Find monster container and append tooltip
        const monsterContainer = document.querySelector('.monster-container');
        if (monsterContainer) {
            monsterContainer.insertAdjacentHTML('beforeend', tooltipHTML);
            
            // Add event listeners
            document.getElementById('moodTrackerCloseBtn').addEventListener('click', () => this.hideTooltip());
            
            // Add mood button listeners
            document.querySelectorAll('.mood-btn-tooltip').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mood = e.currentTarget.dataset.mood;
                    this.saveMood(mood);
                });
            });
            
            console.log('[MoodTracker] Tooltip created and attached to monster container');
        } else {
            console.warn('[MoodTracker] Monster container not found, retrying in 1s');
            setTimeout(() => this.createTooltip(), 1000);
        }
    }
    
    showTooltip() {
        console.log('[MoodTracker] Showing tooltip');
        const tooltip = document.getElementById('moodTrackerTooltip');
        if (tooltip) {
            tooltip.style.display = 'block';
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) scale(1)';
            }, 10);
            
            // Clear previous note
            const noteField = document.getElementById('moodNoteTooltip');
            if (noteField) {
                noteField.value = '';
            }
            
            // Update last popup time
            this.lastPopupTime = Date.now();
            localStorage.setItem('moodTrackerLastPopup', this.lastPopupTime.toString());
        }
    }
    
    hideTooltip() {
        console.log('[MoodTracker] Hiding tooltip');
        const tooltip = document.getElementById('moodTrackerTooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateX(-50%) scale(0.95)';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 300);
        }
    }
    
    saveMood(moodValue) {
        console.log('[MoodTracker] Saving mood:', moodValue);
        
        const note = document.getElementById('moodNoteTooltip')?.value || '';
        const moodData = this.moods.find(m => m.value === moodValue);
        
        const entry = {
            mood: moodValue,
            emoji: moodData.emoji,
            name: moodData.name,
            note: note,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        // Get existing moods
        const moods = this.getMoodHistory();
        moods.unshift(entry); // Add to beginning
        
        // Keep only last 100 entries
        if (moods.length > 100) {
            moods.length = 100;
        }
        
        // Save to localStorage
        localStorage.setItem('moodHistory', JSON.stringify(moods));
        
        // Hide tooltip
        this.hideTooltip();
        
        // Trigger mood history update on Habits page
        if (typeof window.updateMoodHistoryDisplay === 'function') {
            window.updateMoodHistoryDisplay();
        }
        
        // Play monster animation based on mood
        this.playMoodAnimation(moodValue);
        
        // Show streak-based encouragement modal for repeated sad moods
        this.handleSadStreakEncouragement(moodValue);
        
        // Show confirmation message
        this.showConfirmation(moodData.emoji, moodData.name);
        
        console.log('[MoodTracker] Mood saved successfully');
    }
    
    showConfirmation(emoji, name) {
        // Show a brief confirmation message
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(167, 139, 250, 0.95) 100%);
            color: #fff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 15px;
            z-index: 10001;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            animation: slideDown 0.3s ease-out;
            font-weight: 500;
        `;
        confirmation.textContent = `${emoji} Mood tracked: ${name}`;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => confirmation.remove(), 300);
        }, 2000);
    }
    
    getMoodHistory() {
        const saved = localStorage.getItem('moodHistory');
        return saved ? JSON.parse(saved) : [];
    }

    getConsecutiveMoodStreak(targetMood) {
        const moods = this.getMoodHistory();
        let streak = 0;

        for (const entry of moods) {
            if (!entry || entry.mood !== targetMood) break;
            streak++;
        }

        return streak;
    }

    getRandomSadStreakMessage() {
        const index = Math.floor(Math.random() * SAD_STREAK_ENCOURAGEMENT_MESSAGES.length);
        return SAD_STREAK_ENCOURAGEMENT_MESSAGES[index];
    }

    ensureSadStreakModalStyles() {
        if (document.getElementById('sadStreakEncouragementStyles')) return;

        const style = document.createElement('style');
        style.id = 'sadStreakEncouragementStyles';
        style.textContent = `
            @keyframes sadStreakFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes sadStreakModalPop {
                from { opacity: 0; transform: translateY(16px) scale(0.96); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes sadStreakMonsterJump {
                0%, 100% { transform: translateY(0); }
                18% { transform: translateY(-14px); }
                34% { transform: translateY(0); }
                52% { transform: translateY(-9px); }
                68% { transform: translateY(0); }
                84% { transform: translateY(-5px); }
            }
        `;

        document.head.appendChild(style);
    }

    showSadStreakEncouragementModal(streakCount) {
        if (document.getElementById('sadStreakEncouragementOverlay')) return;

        this.ensureSadStreakModalStyles();

        const currentSprite = document.getElementById('mainHeroSprite');
        const isEgg = window.gameState?.isEgg || false;
        const petName = window.gameState?.rockName || localStorage.getItem('monsterName') || 'Your Task Monster';
        const spriteSrc = currentSprite?.src || '';
        const encouragement = this.getRandomSadStreakMessage();

        const overlay = document.createElement('div');
        overlay.id = 'sadStreakEncouragementOverlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(5, 10, 25, 0.78);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            z-index: 12000;
            animation: sadStreakFadeIn 0.25s ease-out;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            width: min(92vw, 460px);
            max-height: 90vh;
            overflow-y: auto;
            background: linear-gradient(160deg, #1b1835 0%, #1b2a4a 55%, #16213e 100%);
            border: 2px solid rgba(196, 181, 253, 0.45);
            border-radius: 24px;
            box-shadow: 0 22px 70px rgba(0, 0, 0, 0.4);
            color: #ffffff;
            padding: 22px 20px 20px;
            position: relative;
            animation: sadStreakModalPop 0.28s ease-out;
        `;

        const closeModal = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 180);
        };

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
        `;
        closeButton.onclick = closeModal;

        const badge = document.createElement('div');
        badge.textContent = `${petName} noticed you might need some kindness`;
        badge.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(167, 139, 250, 0.18);
            border: 1px solid rgba(196, 181, 253, 0.26);
            color: #ddd6fe;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 14px;
            max-width: calc(100% - 48px);
        `;

        const title = document.createElement('h3');
        title.textContent = 'A gentle message for you';
        title.style.cssText = `
            margin: 0 0 10px 0;
            font-size: 24px;
            line-height: 1.2;
        `;

        const streakText = document.createElement('p');
        streakText.textContent = `You have logged ${streakCount} sad moods in a row. I just wanted to check in with something soft.`;
        streakText.style.cssText = `
            margin: 0 0 16px 0;
            color: rgba(255, 255, 255, 0.78);
            font-size: 14px;
            line-height: 1.6;
        `;

        const messageBubble = document.createElement('div');
        messageBubble.textContent = encouragement;
        messageBubble.style.cssText = `
            background: linear-gradient(135deg, rgba(244, 114, 182, 0.16), rgba(167, 139, 250, 0.14));
            border: 1px solid rgba(244, 114, 182, 0.22);
            border-radius: 18px;
            padding: 18px 16px;
            font-size: 16px;
            line-height: 1.7;
            color: #ffffff;
            margin-bottom: 18px;
        `;

        const spriteStage = document.createElement('div');
        spriteStage.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 12px 10px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            margin-bottom: 18px;
        `;

        const spriteLabel = document.createElement('div');
        spriteLabel.textContent = `${petName} is cheering for you`;
        spriteLabel.style.cssText = `
            font-size: 13px;
            color: #c4b5fd;
            font-weight: 600;
            text-align: center;
        `;

        const sprite = document.createElement('img');
        sprite.alt = `${petName} encouragement`; 
        sprite.src = spriteSrc;
        sprite.style.cssText = `
            width: ${isEgg ? '86px' : '112px'};
            height: ${isEgg ? '86px' : '112px'};
            object-fit: contain;
            object-position: center;
            image-rendering: pixelated;
            animation: sadStreakMonsterJump 1.35s ease-in-out infinite;
            transform-origin: center bottom;
            filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.26));
        `;

        const footerText = document.createElement('p');
        footerText.textContent = 'Try one tiny kind thing for yourself next: water, a stretch, a breath, or simply resting for a minute.';
        footerText.style.cssText = `
            margin: 0 0 18px 0;
            color: rgba(255, 255, 255, 0.75);
            font-size: 13px;
            line-height: 1.6;
            text-align: center;
        `;

        const acknowledgeButton = document.createElement('button');
        acknowledgeButton.type = 'button';
        acknowledgeButton.textContent = 'Thanks, buddy';
        acknowledgeButton.style.cssText = `
            width: 100%;
            border: none;
            border-radius: 14px;
            padding: 14px 16px;
            background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
            color: #ffffff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 10px 22px rgba(167, 139, 250, 0.28);
        `;
        acknowledgeButton.onclick = closeModal;

        spriteStage.appendChild(sprite);
        spriteStage.appendChild(spriteLabel);
        modal.appendChild(closeButton);
        modal.appendChild(badge);
        modal.appendChild(title);
        modal.appendChild(streakText);
        modal.appendChild(messageBubble);
        modal.appendChild(spriteStage);
        modal.appendChild(footerText);
        modal.appendChild(acknowledgeButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeModal();
        });
    }

    handleSadStreakEncouragement(moodValue) {
        const storageKey = 'sadStreakEncouragementShown';

        if (moodValue !== 'sad') {
            localStorage.removeItem(storageKey);
            return;
        }

        const sadStreak = this.getConsecutiveMoodStreak('sad');

        if (sadStreak < 3) {
            localStorage.removeItem(storageKey);
            return;
        }

        if (localStorage.getItem(storageKey) === 'true') {
            return;
        }

        localStorage.setItem(storageKey, 'true');
        setTimeout(() => this.showSadStreakEncouragementModal(sadStreak), 250);
    }
    
    addMonsterClickListener() {
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            mainHeroSprite.style.cursor = 'pointer';
            mainHeroSprite.addEventListener('click', () => {
                console.log('[MoodTracker] Monster clicked, showing tooltip');
                // Dismiss the "Tap me" mood prompt if it is currently visible
                const moodPrompt = document.getElementById('taskPalTooltip');
                if (moodPrompt && moodPrompt.classList.contains('mood-prompt')) {
                    clearTimeout(window._moodPromptTimer);
                    moodPrompt.classList.remove('visible', 'mood-prompt');
                }
                this.showTooltip();
            });
            console.log('[MoodTracker] Monster click listener added');
        } else {
            console.warn('[MoodTracker] mainHeroSprite not found, retrying in 1s');
            setTimeout(() => this.addMonsterClickListener(), 1000);
        }
    }
    
    startAutoPopup() {
        console.log('[MoodTracker] Starting auto-popup timer (30 minutes)');
        
        // Clear existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Set up interval
        this.intervalId = setInterval(() => {
            console.log('[MoodTracker] Auto-popup triggered');
            this.showTooltip();
        }, this.autoPopupInterval);
    }
    
    stopAutoPopup() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[MoodTracker] Auto-popup stopped');
        }
    }
    
    applyJumpTransform(sprite, baseTransform, originalTransform) {
        sprite.style.setProperty('transition', 'transform 0.3s ease', 'important');
        sprite.style.setProperty('transform', `${baseTransform === 'none' ? '' : baseTransform} translateY(-20px)`.trim(), 'important');
        
        setTimeout(() => {
            sprite.style.setProperty('transform', `${baseTransform === 'none' ? '' : baseTransform} translateY(0)`.trim(), 'important');
        }, 300);
        
        setTimeout(() => {
            sprite.style.setProperty('transform', originalTransform || baseTransform, 'important');
            sprite.style.setProperty('transition', '', 'important');
        }, 600);
    }

    applyEggHappyAnimation(sprite, baseTransform, originalTransform) {
        const resolvedBase = baseTransform === 'none' ? '' : baseTransform;
        const jiggleFrames = [
            `${resolvedBase} translate(-3px, -4px) rotate(-3deg)`.trim(),
            `${resolvedBase} translate(3px, -8px) rotate(3deg)`.trim(),
            `${resolvedBase} translate(-2px, -6px) rotate(-2deg)`.trim(),
            `${resolvedBase} translate(2px, -3px) rotate(2deg)`.trim(),
            `${resolvedBase} translate(0, 0) rotate(0deg)`.trim()
        ];

        sprite.style.setProperty('transition', 'transform 0.14s ease-in-out', 'important');
        sprite.style.setProperty('transform-origin', 'center bottom', 'important');

        jiggleFrames.forEach((frame, index) => {
            setTimeout(() => {
                sprite.style.setProperty('transform', frame, 'important');
            }, index * 140);
        });

        setTimeout(() => {
            sprite.style.setProperty('transform', originalTransform || baseTransform, 'important');
            sprite.style.setProperty('transition', '', 'important');
        }, jiggleFrames.length * 140);
    }

    playMoodAnimation(moodValue) {
        console.log('[MoodTracker] Playing animation for mood:', moodValue);
        
        const sprite = document.getElementById('mainHeroSprite');
        if (!sprite) {
            console.warn('[MoodTracker] Main hero sprite not found');
            return;
        }
        
        // Get current monster and skin info
        const selectedMonster = localStorage.getItem('selectedMonster') || 'Pink_Monster';
        const equippedSkinId = window.gameState?.equippedSkinId || null;
        const isEgg = window.gameState?.isEgg || false;
        
        // Store original state
        const originalSrc = sprite.src;
        const originalAnimation = sprite.style.animation;
        const originalTransform = sprite.style.transform;
        
        // HAPPY MOOD: Jump animation
        if (moodValue === 'happy') {
            console.log('[MoodTracker] Playing JUMP animation for happy mood');
            
            // Get current transform to preserve it (handles scale(2), scale(4), scale(5), or none)
            const currentTransform = sprite.style.transform || 'none';
            const baseTransform = currentTransform.includes('translateY') 
                ? currentTransform.split('translateY')[0].trim() 
                : currentTransform;

            if (isEgg) {
                console.log('[MoodTracker] Egg form detected - using egg-only jumble animation');
                sprite.src = originalSrc;
                this.applyEggHappyAnimation(sprite, baseTransform, originalTransform);
                return;
            }

            // Determine jump GIF
            let jumpGif = null;
            const appearance = window.getActiveHeroAppearance ? window.getActiveHeroAppearance() : null;
            
            if (appearance && appearance.animations && appearance.animations.jump) {
                jumpGif = appearance.animations.jump;
            } else {
                // Fallback for default monsters
                const prefixToName = { 'Pink_Monster': 'Nova', 'Owlet_Monster': 'Luna', 'Dude_Monster': 'Benny' };
                const monsterName = prefixToName[selectedMonster] || 'Nova';
                jumpGif = `assets/heroes/${monsterName}_jump.gif`;
            }

            if (jumpGif) {
                // Use Jump GIF
                const jumpImage = new Image();
                jumpImage.onload = () => {
                    sprite.src = jumpGif;
                    sprite.style.setProperty('transition', 'transform 0.3s ease', 'important');
                    sprite.style.setProperty('transform', `${baseTransform === 'none' ? '' : baseTransform} translateY(-20px)`.trim(), 'important');
                    
                    setTimeout(() => {
                        sprite.style.setProperty('transform', `${baseTransform === 'none' ? '' : baseTransform} translateY(0)`.trim(), 'important');
                    }, 300);
                    
                    setTimeout(() => {
                        sprite.src = originalSrc;
                        sprite.style.setProperty('transform', originalTransform || baseTransform, 'important');
                        sprite.style.setProperty('transition', '', 'important');
                    }, 2000);
                };
                jumpImage.onerror = () => {
                    // Fallback to transform only
                    this.applyJumpTransform(sprite, baseTransform, originalTransform);
                };
                jumpImage.src = jumpGif;
            } else {
                // Transform only (for eggs or if no jump GIF found)
                this.applyJumpTransform(sprite, baseTransform, originalTransform);
            }
        } 
        // OTHER MOODS: Flicker/fade effect
        else {
            console.log('[MoodTracker] Playing FLICKER animation for', moodValue, 'mood');
            
            // Create flicker effect using opacity
            let flickerCount = 0;
            const maxFlickers = 6; // 3 full cycles (on/off) over 2 seconds
            const flickerInterval = 333; // ~333ms per flicker
            
            const flickerEffect = setInterval(() => {
                if (flickerCount >= maxFlickers) {
                    clearInterval(flickerEffect);
                    // CRITICAL: Always restore to full opacity
                    sprite.style.setProperty('opacity', '1', 'important');
                    console.log('[MoodTracker] Flicker animation complete, opacity restored to 1');
                    return;
                }
                
                // Toggle opacity between 0.3 and 1
                sprite.style.opacity = (flickerCount % 2 === 0) ? '0.3' : '1';
                flickerCount++;
            }, flickerInterval);
            
            // Safety timeout: Force opacity back to 1 after 3 seconds
            setTimeout(() => {
                if (sprite) {
                    sprite.style.setProperty('opacity', '1', 'important');
                    console.log('[MoodTracker] Safety timeout: opacity forced to 1');
                }
            }, 3000);
        }
    }
}

const MOOD_TRACKER_GRAPH_CONFIG = [
    { value: 'happy', name: 'Happy', emoji: '😊', color: '#4ade80' },
    { value: 'sad', name: 'Sad', emoji: '😢', color: '#60a5fa' },
    { value: 'meh', name: 'Meh', emoji: '🫤', color: '#facc15' },
    { value: 'angry', name: 'Angry', emoji: '😡', color: '#f87171' }
];

window.moodChartMonthOffset = 0;

function ensureMoodChartUI() {
    let container = document.getElementById('moodChartContainer');
    if (container) return container;

    const moodTab = document.getElementById('moodTab');
    if (!moodTab) return null;

    const graphCard = document.createElement('div');
    graphCard.className = 'card';
    graphCard.id = 'moodChartCard';
    graphCard.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
            <div>
                <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">Monthly Mood Graph</div>
                <div style="font-size: 13px; color: var(--text-secondary);">Defaults to the current month. Use the arrows to view previous months.</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button id="moodChartPrevBtn" class="btn-secondary" onclick="changeMoodChartMonth(-1)" style="font-size: 12px; padding: 8px 12px;">←</button>
                <div id="moodChartMonthLabel" style="min-width: 120px; text-align: center; font-size: 14px; font-weight: 600; color: #fff;">Current Month</div>
                <button id="moodChartNextBtn" class="btn-secondary" onclick="changeMoodChartMonth(1)" style="font-size: 12px; padding: 8px 12px;">→</button>
            </div>
        </div>
        <div id="moodChartContainer"></div>
    `;

    const referenceCard = document.getElementById('moodHistoryContainer')?.closest('.card');
    if (referenceCard && referenceCard.parentNode) {
        referenceCard.parentNode.insertBefore(graphCard, referenceCard);
    } else {
        moodTab.appendChild(graphCard);
    }

    return document.getElementById('moodChartContainer');
}

function getStoredMoodHistory() {
    try {
        const saved = localStorage.getItem('moodHistory');
        const moods = saved ? JSON.parse(saved) : [];
        return Array.isArray(moods) ? moods : [];
    } catch (error) {
        console.warn('[MoodTracker] Failed to parse mood history:', error);
        return [];
    }
}

function getMoodEntryTimestamp(entry) {
    return entry?.timestamp || (entry?.date ? new Date(entry.date).getTime() : 0);
}

function getMoodChartMonthDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + (window.moodChartMonthOffset || 0), 1);
}

window.renderMoodChart = function() {
    const container = ensureMoodChartUI();
    if (!container) return;

    const monthLabel = document.getElementById('moodChartMonthLabel');
    const nextButton = document.getElementById('moodChartNextBtn');
    const monthDate = getMoodChartMonthDate();
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getTime();
    const nextMonthStart = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).getTime();
    const counts = Object.fromEntries(MOOD_TRACKER_GRAPH_CONFIG.map(mood => [mood.value, 0]));

    getStoredMoodHistory().forEach(entry => {
        const timestamp = getMoodEntryTimestamp(entry);
        if (timestamp >= monthStart && timestamp < nextMonthStart && counts[entry.mood] !== undefined) {
            counts[entry.mood] += 1;
        }
    });

    const highestCount = Math.max(...Object.values(counts), 0);
    const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (monthLabel) {
        monthLabel.textContent = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    if (nextButton) {
        nextButton.disabled = (window.moodChartMonthOffset || 0) >= 0;
        nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
        nextButton.style.cursor = nextButton.disabled ? 'not-allowed' : 'pointer';
    }

    if (totalCount === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 28px 16px; color: #999; border: 1px solid rgba(139, 92, 246, 0.16); border-radius: 12px; background: rgba(255, 255, 255, 0.03);">
                <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
                <div style="color: #fff; font-weight: 600; margin-bottom: 6px;">No moods logged for this month</div>
                <div style="font-size: 13px; color: var(--text-secondary);">Log a mood to see your monthly graph here.</div>
            </div>
        `;
        return;
    }

    container.innerHTML = MOOD_TRACKER_GRAPH_CONFIG.map(mood => {
        const count = counts[mood.value];
        const width = highestCount > 0 && count > 0 ? Math.max((count / highestCount) * 100, 12) : 0;

        return `
            <div style="display: grid; grid-template-columns: minmax(132px, auto) 1fr 32px; align-items: center; column-gap: 20px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; padding-right: 10px; color: #fff; font-weight: 600; font-size: 14px; white-space: nowrap;">
                    <span style="font-size: 22px; line-height: 1;">${mood.emoji}</span>
                    <span>${mood.name}</span>
                </div>
                <div style="height: 18px; border-radius: 999px; background: rgba(255, 255, 255, 0.07); overflow: hidden;">
                    <div style="height: 100%; width: ${width}%; min-width: ${count > 0 ? '18px' : '0'}; border-radius: 999px; background: ${mood.color};"></div>
                </div>
                <div style="text-align: right; color: #fff; font-weight: 700; font-size: 14px;">${count}</div>
            </div>
        `;
    }).join('');
};

window.changeMoodChartMonth = function(delta) {
    const nextOffset = (window.moodChartMonthOffset || 0) + delta;
    window.moodChartMonthOffset = nextOffset > 0 ? 0 : nextOffset;
    window.renderMoodChart();
};

// Global function to update mood history display
window.updateMoodHistoryDisplay = function() {
    const container = document.getElementById('moodHistoryContainer');
    if (!container) return;

    const dateFilter = document.getElementById('moodDateFilter')?.value || 'all';
    const moodFilter = document.getElementById('moodTypeFilter')?.value || 'all';
    let moods = getStoredMoodHistory();

    window.renderMoodChart();

    console.log('[MoodTracker] Filtering moods - Date:', dateFilter, 'Mood:', moodFilter, 'Total:', moods.length);

    if (dateFilter !== 'all') {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        moods = moods.filter(entry => {
            const entryTime = getMoodEntryTimestamp(entry);
            if (!entryTime) return false;

            if (dateFilter === 'today') {
                return entryTime >= todayStart;
            } else if (dateFilter === 'week') {
                return entryTime >= todayStart - (7 * 24 * 60 * 60 * 1000);
            } else if (dateFilter === 'month') {
                return entryTime >= todayStart - (30 * 24 * 60 * 60 * 1000);
            }

            return true;
        });
    }

    if (moodFilter !== 'all') {
        moods = moods.filter(entry => entry.mood && entry.mood.toLowerCase() === moodFilter.toLowerCase());
    }

    if (moods.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <p>No mood entries found</p>
                <p style="font-size: 13px; margin-top: 8px;">Start tracking your mood to see your history here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = moods.map(entry => {
        const date = new Date(getMoodEntryTimestamp(entry));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="font-size: 32px;">${entry.emoji}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${entry.name}</div>
                        <div style="font-size: 12px; color: #999;">${dateStr} at ${timeStr}</div>
                    </div>
                </div>
                ${entry.note ? `
                    <div style="
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: 12px;
                        color: #ccc;
                        font-size: 13px;
                        line-height: 1.5;
                    ">${entry.note}</div>
                ` : ''}
            </div>
        `;
    }).join('');
};

// Initialize mood tracker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.moodTracker = new MoodTracker();
    });
} else {
    window.moodTracker = new MoodTracker();
}

window.initMoodHistoryFilters = function() {
    console.log('[MoodTracker] Initializing mood history filters');

    ensureMoodChartUI();

    const dateFilter = document.getElementById('moodDateFilter');
    const moodFilter = document.getElementById('moodTypeFilter');

    if (dateFilter) {
        dateFilter.onchange = () => {
            console.log('[MoodTracker] Date filter changed:', dateFilter.value);
            window.updateMoodHistoryDisplay();
        };
    }

    if (moodFilter) {
        moodFilter.onchange = () => {
            console.log('[MoodTracker] Mood filter changed:', moodFilter.value);
            window.updateMoodHistoryDisplay();
        };
    }

    window.updateMoodHistoryDisplay();
    console.log('[MoodTracker] Filters initialized and display updated');
};

window.initHabitMoodFilters = window.initMoodHistoryFilters;
window.initMoodFilters = window.initMoodHistoryFilters;

// Auto-initialize when switching to Habits tab
const originalShowPage = window.showPage;
if (typeof originalShowPage === 'function') {
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        
        // If switching to habits page, initialize mood display
        if (pageId === 'habits') {
            setTimeout(() => {
                window.initMoodHistoryFilters();
            }, 100);
        }
    };
}

// Also initialize if already on habits page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const habitsPage = document.getElementById('habits');
            if (habitsPage && habitsPage.style.display !== 'none') {
                window.initMoodHistoryFilters();
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        const habitsPage = document.getElementById('habits');
        if (habitsPage && habitsPage.style.display !== 'none') {
            window.initMoodHistoryFilters();
        }
    }, 500);
}

// ─── Reset Mood Tracker ────────────────────────────────────────────────────────
window.resetMoodTracker = function() {
    if (!confirm('Are you sure you want to reset all mood tracking data? This cannot be undone.')) return;

    // Clear from localStorage (single source of truth)
    localStorage.removeItem('moodHistory');
    console.log('[MoodTracker] Mood history cleared from localStorage');

    // Refresh the mood history display
    if (typeof window.updateMoodHistoryDisplay === 'function') {
        window.updateMoodHistoryDisplay();
    }

    // Show success notification
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage('🔄 Mood data reset!', 'All mood history has been cleared');
    } else if (typeof showNotification === 'function') {
        showNotification('🔄 Mood history cleared!', 'success');
    } else {
        alert('Mood history has been reset.');
    }
};

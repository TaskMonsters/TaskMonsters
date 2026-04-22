/**
 * Mood Tracker System - Tooltip Style
 * Displays a speech bubble tooltip for users to track their mood with emoji buttons
 * Appears every hour and can be triggered by tapping the monster
 * Saves mood history to localStorage and displays on Habits page with filters
 */

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

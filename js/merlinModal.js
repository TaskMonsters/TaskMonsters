/**
 * Merlin Intro Modal + Mood Tracker Post-Decline Logic
 * AAA-Level Performance | Cinematic Transitions | Memory-Safe
 * 
 * Shows modal on app load with Quest/Quiz/No options.
 * When "No" is selected, Mood Tracker remains visible for exactly 120 seconds
 * before fading out cinematically.
 */

// Global timer reference for memory-safe cleanup
window.moodTrackerTimer = null;
window.moodTrackerFadeTimer = null;

window.addEventListener('load', () => {
    const modal = document.getElementById('merlinModal');
    const questBtn = document.getElementById('merlinQuestBtn');
    const quizBtn = document.getElementById('merlinQuizBtn');
    const noBtn = document.getElementById('merlinNoBtn');
    
    // Show modal on load
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
    
    /**
     * Handle Quest or Quiz selection
     * Standard flow - hide modal and show mood tracker
     */
    const proceedWithChoice = () => {
        // Hide modal with smooth transition
        if (modal) {
            modal.style.transition = 'opacity 0.3s ease-out';
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                modal.style.opacity = '';
            }, 300);
        }
        
        // Show mood tracker immediately
        if (window.showMoodTracker) {
            window.showMoodTracker();
        }
    };
    
    /**
     * Handle "No" selection - Elite Mood Tracker Logic
     * Keeps mood tracker visible for exactly 120 seconds with cinematic fade-out
     */
    const declineQuest = () => {
        // Clear any existing timers for memory safety
        clearMoodTrackerTimers();
        
        // Hide modal with smooth transition
        if (modal) {
            modal.style.transition = 'opacity 0.3s ease-out';
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                modal.style.opacity = '';
            }, 300);
        }
        
        // Show mood tracker immediately
        const tooltip = document.getElementById('taskPalTooltip');
        if (tooltip && window.showMoodTracker) {
            window.showMoodTracker();
            
            // Ensure tooltip is fully visible and interactive
            tooltip.style.opacity = '1';
            tooltip.style.pointerEvents = 'auto';
            tooltip.style.transition = 'none'; // Remove transition during active phase
            
            // Start 120-second countdown
            window.moodTrackerTimer = setTimeout(() => {
                cinematicFadeOut(tooltip);
            }, 120000); // 120 seconds = 2 minutes
        }
    };
    
    /**
     * Cinematic fade-out with cubic ease-out curve
     * AAA-level polish - smooth, intentional, game-like
     */
    function cinematicFadeOut(element) {
        if (!element) return;
        
        // Apply cinematic transition (1s cubic ease-out)
        element.style.transition = 'opacity 1s cubic-bezier(0.33, 1, 0.68, 1)';
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
        
        // Clean up after fade completes
        window.moodTrackerFadeTimer = setTimeout(() => {
            element.classList.remove('visible');
            element.style.transition = '';
            element.style.opacity = '';
            element.style.pointerEvents = '';
        }, 1000); // Match transition duration
    }
    
    /**
     * Memory-safe timer cleanup
     * Prevents memory leaks and ensures consistent behavior on re-trigger
     */
    function clearMoodTrackerTimers() {
        if (window.moodTrackerTimer) {
            clearTimeout(window.moodTrackerTimer);
            window.moodTrackerTimer = null;
        }
        if (window.moodTrackerFadeTimer) {
            clearTimeout(window.moodTrackerFadeTimer);
            window.moodTrackerFadeTimer = null;
        }
    }
    
    // Attach event listeners
    if (questBtn) {
        questBtn.addEventListener('click', proceedWithChoice);
    }
    
    if (quizBtn) {
        quizBtn.addEventListener('click', proceedWithChoice);
    }
    
    if (noBtn) {
        noBtn.addEventListener('click', declineQuest);
    }
    
    // Cleanup timers when modal reopens (if implemented in future)
    if (modal) {
        modal.addEventListener('show', clearMoodTrackerTimers);
    }
});

/**
 * Enhanced selectMood to handle timer cancellation
 * When user selects a mood during the 2-minute window, cancel the fade-out
 */
if (window.selectMood) {
    const originalSelectMood = window.selectMood;
    window.selectMood = function(moodKey) {
        // Cancel pending timers - user has interacted
        if (window.moodTrackerTimer) {
            clearTimeout(window.moodTrackerTimer);
            window.moodTrackerTimer = null;
        }
        if (window.moodTrackerFadeTimer) {
            clearTimeout(window.moodTrackerFadeTimer);
            window.moodTrackerFadeTimer = null;
        }
        
        // Call original function
        return originalSelectMood.call(this, moodKey);
    };
}

// Export for external use
window.clearMoodTrackerTimers = function() {
    if (window.moodTrackerTimer) {
        clearTimeout(window.moodTrackerTimer);
        window.moodTrackerTimer = null;
    }
    if (window.moodTrackerFadeTimer) {
        clearTimeout(window.moodTrackerFadeTimer);
        window.moodTrackerFadeTimer = null;
    }
};

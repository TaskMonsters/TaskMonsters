/**
 * Merlin Intro Modal + Habit Tracker Delay
 * Only keeping the Habit Tracker Delay logic as per safety rules.
 */

window.addEventListener('load', () => {
    const habitTracker = document.getElementById('habitTracker');
    
    // Delay habit tracker transition by 120 seconds (2 minutes)
    if (habitTracker) {
        habitTracker.style.transition = 'opacity 0.5s ease';
        habitTracker.style.opacity = '1';
        
        setTimeout(() => {
            habitTracker.style.opacity = '';
        }, 120000); // 120 seconds (2 minutes)
    }
});

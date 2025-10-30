/**
 * Merlin Intro Modal + Habit Tracker Delay
 * Shows modal on app load, delays habit tracker transition by 120s (2 minutes)
 */

window.addEventListener('load', () => {
    const modal = document.getElementById('merlinModal');
    const questBtn = document.getElementById('merlinQuestBtn');
    const quizBtn = document.getElementById('merlinQuizBtn');
    const habitTracker = document.getElementById('habitTracker');
    
    // Show modal on load
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
    
    const proceed = () => {
        // Hide modal
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        
        // Delay habit tracker transition by 120 seconds (2 minutes)
        if (habitTracker) {
            habitTracker.style.transition = 'opacity 0.5s ease';
            habitTracker.style.opacity = '1';
            
            setTimeout(() => {
                habitTracker.style.opacity = '';
            }, 120000); // 120 seconds (2 minutes)
        }
    };
    
    if (questBtn) {
        questBtn.addEventListener('click', proceed);
    }
    
    if (quizBtn) {
        quizBtn.addEventListener('click', proceed);
    }
});

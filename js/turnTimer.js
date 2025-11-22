// Turn Timer System for Battle Mode

// Start turn timer
function startTurnTimer(duration = 5000) {
    const timerElement = document.getElementById('turnTimer');
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');
    
    if (!timerElement || !timerBar || !timerText) {
        console.error('Turn timer elements not found');
        return;
    }
    
    // Stop any existing timer
    stopTurnTimer();
    
    // Show timer
    timerElement.classList.remove('hidden');
    timerElement.classList.remove('warning');
    
    // Set initial values
    const durationSeconds = Math.ceil(duration / 1000);
    timerText.textContent = durationSeconds;
    timerBar.style.width = '100%';
    
    // Store start time and duration
    window.battleManager.turnTimerStartTime = Date.now();
    window.battleManager.turnTimerDuration = duration;
    
    // Update timer every 50ms for smooth animation
    window.battleManager.turnTimerInterval = setInterval(() => {
        const elapsed = Date.now() - window.battleManager.turnTimerStartTime;
        const remaining = Math.max(0, duration - elapsed);
        const progress = remaining / duration;
        
        // Update bar width
        timerBar.style.width = (progress * 100) + '%';
        
        // Update text (show seconds remaining)
        const secondsRemaining = Math.ceil(remaining / 1000);
        timerText.textContent = secondsRemaining;
        
        // Add warning style when 1 second or less remaining
        if (remaining <= 1000 && !timerElement.classList.contains('warning')) {
            timerElement.classList.add('warning');
        }
        
        // Time's up!
        if (remaining <= 0) {
            stopTurnTimer();
            onTurnTimerExpired();
        }
    }, 50);
}

// Stop turn timer
function stopTurnTimer() {
    const timerElement = document.getElementById('turnTimer');
    
    if (window.battleManager && window.battleManager.turnTimerInterval) {
        clearInterval(window.battleManager.turnTimerInterval);
        window.battleManager.turnTimerInterval = null;
    }
    
    if (timerElement) {
        timerElement.classList.add('hidden');
        timerElement.classList.remove('warning');
    }
}

// Handle timer expiration
function onTurnTimerExpired() {
    console.log('⏰ Turn timer expired!');
    
    // Only auto-skip if still in player turn
    if (window.battleManager && window.battleManager.state === BattleState.PLAYER_TURN) {
        addBattleLog('⏰ Time\'s up! Turn skipped.');
        
        // Play timeout sound
        if (window.audioManager) {
            window.audioManager.playSound('error', 0.5);
        }
        
        // Force enemy turn
        window.battleManager.state = BattleState.ANIMATING;
        setTimeout(() => {
            window.battleManager.enemyTurn();
        }, 500);
    }
}

// Export functions to window
window.startTurnTimer = startTurnTimer;
window.stopTurnTimer = stopTurnTimer;
window.onTurnTimerExpired = onTurnTimerExpired;

// Turn Timer System for Battle Mode - Battle Log Version

// Start turn timer
function startTurnTimer(duration = 5000) {
    // Stop any existing timer
    stopTurnTimer();
    
    // Store start time and duration
    if (!window.battleManager) {
        console.error('BattleManager not found');
        return;
    }
    
    window.battleManager.turnTimerStartTime = Date.now();
    window.battleManager.turnTimerDuration = duration;
    window.battleManager.turnTimerLastSecond = Math.ceil(duration / 1000);
    
    // Add initial timer message to battle log
    const initialSeconds = Math.ceil(duration / 1000);
    addBattleLog(`⏱️ Your turn! (${initialSeconds}s remaining)`);
    
    // Update timer every second
    window.battleManager.turnTimerInterval = setInterval(() => {
        const elapsed = Date.now() - window.battleManager.turnTimerStartTime;
        const remaining = Math.max(0, duration - elapsed);
        const secondsRemaining = Math.ceil(remaining / 1000);
        
        // Update battle log when second changes
        if (secondsRemaining !== window.battleManager.turnTimerLastSecond && secondsRemaining > 0) {
            window.battleManager.turnTimerLastSecond = secondsRemaining;
            
            // Different message based on time remaining
            if (secondsRemaining === 1) {
                addBattleLog(`⏰ 1 second left!`);
                // Play warning sound
                if (window.audioManager) {
                    window.audioManager.play('error');
                }
            } else if (secondsRemaining <= 3) {
                addBattleLog(`⏱️ ${secondsRemaining}s remaining...`);
            }
        }
        
        // Time's up!
        if (remaining <= 0) {
            stopTurnTimer();
            onTurnTimerExpired();
        }
    }, 100);  // Check every 100ms for accuracy
}

// Stop turn timer
function stopTurnTimer() {
    if (window.battleManager && window.battleManager.turnTimerInterval) {
        clearInterval(window.battleManager.turnTimerInterval);
        window.battleManager.turnTimerInterval = null;
        window.battleManager.turnTimerLastSecond = null;
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
            window.audioManager.play('error');
        }
        
        // Trigger enemy turn after a short delay
        setTimeout(() => {
            if (window.battleManager && window.battleManager.state === BattleState.PLAYER_TURN) {
                window.battleManager.enemyTurn();
            }
        }, 500);
    }
}

// Reduce timer (for Time Sting ability)
function reduceTimer(newDuration) {
    if (!window.battleManager || !window.battleManager.turnTimerStartTime) {
        console.warn('No active timer to reduce');
        return;
    }
    
    // Calculate how much time has already elapsed
    const elapsed = Date.now() - window.battleManager.turnTimerStartTime;
    
    // If new duration is less than elapsed time, expire immediately
    if (newDuration <= elapsed) {
        stopTurnTimer();
        onTurnTimerExpired();
    } else {
        // Adjust the start time so remaining time equals newDuration
        window.battleManager.turnTimerStartTime = Date.now() - (window.battleManager.turnTimerDuration - newDuration);
        window.battleManager.turnTimerDuration = newDuration;
        
        const secondsRemaining = Math.ceil((newDuration - elapsed) / 1000);
        addBattleLog(`⚡ Timer reduced to ${secondsRemaining}s!`);
    }
}

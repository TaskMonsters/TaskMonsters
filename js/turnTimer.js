// Enemy Attack Timer - 3 seconds for enemy to attack if player delays

// Start enemy attack countdown (3 seconds)
function startTurnTimer(duration = 3000) {
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
    
    // NO initial timer message - timer is invisible to user
    
    // Update timer every 100ms
    window.battleManager.turnTimerInterval = setInterval(() => {
        const elapsed = Date.now() - window.battleManager.turnTimerStartTime;
        const remaining = Math.max(0, duration - elapsed);
        const secondsRemaining = Math.ceil(remaining / 1000);
        
        // NO battle log updates - timer is silent
        
        // Time's up! Enemy attacks
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

// Handle timer expiration - enemy attacks automatically
function onTurnTimerExpired() {
    console.log('⏰ Enemy attack timer expired - enemy attacks!');
    
    // Only auto-attack if still in player turn
    if (window.battleManager && window.battleManager.state === BattleState.PLAYER_TURN) {
        addBattleLog('💥 Enemy attacks while you hesitate!');
        
        // Play warning sound
        if (window.audioManager) {
            window.audioManager.play('error');
        }
        
        // Trigger enemy turn immediately
        setTimeout(() => {
            if (window.battleManager && window.battleManager.state === BattleState.PLAYER_TURN) {
                window.battleManager.enemyTurn();
            }
        }, 300);
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
    }
}

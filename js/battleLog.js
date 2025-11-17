// Battle Log System
// Displays battle messages and events

function addBattleLog(message) {
    const battleLog = document.getElementById('battleLog');
    if (!battleLog) {
        console.warn('Battle log element not found');
        return;
    }
    
    // Create log entry
    const logEntry = document.createElement('div');
    logEntry.className = 'battle-log-entry';
    logEntry.textContent = message;
    
    // Add to log (newest at bottom)
    battleLog.appendChild(logEntry);
    
    // Auto-scroll to bottom
    battleLog.scrollTop = battleLog.scrollHeight;
    
    // Limit log entries to last 20
    const entries = battleLog.querySelectorAll('.battle-log-entry');
    if (entries.length > 20) {
        entries[0].remove();
    }
    
    console.log('📝 Battle log:', message);
}

function clearBattleLog() {
    const battleLog = document.getElementById('battleLog');
    if (battleLog) {
        battleLog.innerHTML = '';
    }
}

// Export to global scope
window.addBattleLog = addBattleLog;
window.clearBattleLog = clearBattleLog;

console.log('✅ Battle log system loaded');

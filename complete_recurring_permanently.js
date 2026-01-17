// Function to permanently complete a recurring task (no next occurrence)
function completeRecurringTaskPermanently(index) {
    const task = gameState.tasks[index];
    if (!task) return;
    
    if (!task.recurring) {
        showSuccessMessage('⚠️ This is not a recurring task!');
        return;
    }
    
    // Check if all subtasks are completed
    if (task.subtasks && task.subtasks.length > 0) {
        const allCompleted = task.subtasks.every(st => st.completed);
        if (!allCompleted) {
            showSuccessMessage('⚠️ Please complete all subtasks first!');
            return;
        }
    }
    
    // Confirm with user
    if (!confirm(`Are you sure you want to permanently finish this recurring task?\n\n"${task.title}"\n\nThis will complete it and stop all future occurrences.`)) {
        return;
    }
    
    // Stop focus timer when any task is completed
    if (focusActive) {
        console.log('⏱️ Focus Timer: Recurring task permanently completed - stopping timer');
        stopFocusTimer(false);
        showSuccessMessage('⏱️ Focus Timer stopped', 'Task completed!');
    }
    
    // Clear notifications for this task
    if (window.notificationManager) {
        window.notificationManager.clearTaskNotifications(index);
    }
    
    // Store old level for level up detection
    const oldLevel = gameState.level;
    
    // Track today's completions
    const today = new Date().toDateString();
    if (gameState.lastDayTracked !== today) {
        gameState.completedTasksToday = 0;
        gameState.lastDayTracked = today;
    }
    gameState.completedTasksToday++;
    
    // Update streak
    updateStreak();
    
    // Award 80 points for task completion
    let basePoints = 80;
    
    // Add points and health
    gameState.taskPoints += basePoints;
    const oldHealth = gameState.health;
    gameState.health = Math.min(100, gameState.health + 10);
    gameState.completedTasks++;
    
    // Refill battle gauges
    if (window.battleManager) {
        window.battleManager.attackGauge = Math.min(100, window.battleManager.attackGauge + 20);
        window.battleManager.defenseGauge = Math.min(100, window.battleManager.defenseGauge + 15);
        console.log(`⚔️ Battle gauges refilled! Attack: ${window.battleManager.attackGauge}/100, Defense: ${window.battleManager.defenseGauge}/100`);
    }
    
    // Add XP
    let xpToAdd = Math.ceil(basePoints * 0.8);
    if (gameState.xpBoostActive) {
        xpToAdd *= 2;
        gameState.xpBoostActive = false;
        delete gameState.xpBoostExpiry;
        showSuccessMessage('⭐ XP Boost consumed! 2x XP earned!');
    }
    addJerryXP(xpToAdd);
    
    // Track achievement progress
    if (window.achievementTracker) {
        window.achievementTracker.trackTaskCompletion(task, false);
        window.achievementTracker.trackOnTimeTask(task);
    }
    
    // Track habit completion
    if (window.trackTaskCompletion) {
        window.trackTaskCompletion(task, false);
    }
    
    // Update habits display
    if (window.updateHabitsDisplay) {
        window.updateHabitsDisplay();
    }
    
    // Remove task permanently (no next occurrence)
    gameState.tasks.splice(index, 1);
    
    // Update daily challenge progress
    updateChallengeProgress(task, false);
    
    // Show completion message
    showSuccessMessage('🏁 Recurring task finished!', `+${basePoints} points earned!`);
    
    saveGameState();
    checkAndUpdateEnergy();
    
    // Refresh background
    if (typeof window.refreshBackground === 'function') {
        window.refreshBackground();
    }
    
    updateUI();
    updateTasksDisplay();
    updateQuickTasksDisplay();
    
    // Play completion sound
    if (window.audioManager) {
        window.audioManager.playSound('taskComplete', 0.7);
    }
    
    // Fire confetti
    if (window.fireConfetti) {
        window.fireConfetti();
    }
}

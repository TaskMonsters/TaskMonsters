// Subtasks Manager for Task Monsters
// ===================================

class SubtasksManager {
    constructor() {
        // Subtasks are stored within parent tasks
        // This manager provides helper methods
    }

    // Add subtask to a parent task
    addSubtask(parentTaskIndex, subtaskTitle) {
        if (!window.gameState || !window.gameState.tasks) return null;
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask) return null;

        // Initialize subtasks array if it doesn't exist
        if (!parentTask.subtasks) {
            parentTask.subtasks = [];
        }

        const subtask = {
            id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: subtaskTitle,
            completed: false,
            createdAt: new Date().toISOString()
        };

        parentTask.subtasks.push(subtask);
        
        if (typeof saveGameState === 'function') {
            saveGameState();
        }

        this.updateTaskDisplay(parentTaskIndex);
        return subtask;
    }

    // Complete a subtask
    completeSubtask(parentTaskIndex, subtaskId) {
        if (!window.gameState || !window.gameState.tasks) return false;
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks) return false;

        const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
        if (!subtask) return false;

        subtask.completed = true;
        subtask.completedAt = new Date().toISOString();

        // Award mini XP for subtask completion (20% of parent task points)
        const miniXP = Math.ceil((parentTask.points || 5) * 0.2);
        if (window.gameState) {
            window.gameState.xpCoins = (window.gameState.xpCoins || 0) + miniXP;
            console.log(`✅ Subtask completed! +${miniXP} XP`);
        }

        // Play subtle completion sound
        if (window.audioManager) {
            window.audioManager.playSound('taskComplete', 0.3);
        }

        // Check if all subtasks are complete
        const allComplete = parentTask.subtasks.every(st => st.completed);
        if (allComplete && !parentTask.completed) {
            // Show notification suggesting to complete parent task
            if (typeof showNotification === 'function') {
                showNotification('🎉 All subtasks complete! Ready to finish the main task?', 'success');
            }
        }

        if (typeof saveGameState === 'function') {
            saveGameState();
        }

        // Force immediate UI update to sync the gauge
        this.updateSubtaskProgressBar(parentTaskIndex);
        this.updateTaskDisplay(parentTaskIndex);
        return true;
    }

    // Toggle subtask completion based on checkbox state
    toggleSubtask(parentTaskIndex, subtaskId, isChecked) {
        if (isChecked) {
            return this.completeSubtask(parentTaskIndex, subtaskId);
        } else {
            return this.uncompleteSubtask(parentTaskIndex, subtaskId);
        }
    }

    // Uncomplete a subtask
    uncompleteSubtask(parentTaskIndex, subtaskId) {
        if (!window.gameState || !window.gameState.tasks) return false;
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks) return false;

        const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
        if (!subtask) return false;

        subtask.completed = false;
        delete subtask.completedAt;

        if (typeof saveGameState === 'function') {
            saveGameState();
        }

        // Force immediate UI update to sync the gauge
        this.updateSubtaskProgressBar(parentTaskIndex);
        this.updateTaskDisplay(parentTaskIndex);
        return true;
    }

    // Delete a subtask
    deleteSubtask(parentTaskIndex, subtaskId) {
        if (!window.gameState || !window.gameState.tasks) return false;
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks) return false;

        parentTask.subtasks = parentTask.subtasks.filter(st => st.id !== subtaskId);

        if (typeof saveGameState === 'function') {
            saveGameState();
        }

        this.updateTaskDisplay(parentTaskIndex);
        return true;
    }

    // Edit subtask title
    editSubtask(parentTaskIndex, subtaskId, newTitle) {
        if (!window.gameState || !window.gameState.tasks) return false;
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks) return false;

        const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
        if (!subtask) return false;

        subtask.title = newTitle;

        if (typeof saveGameState === 'function') {
            saveGameState();
        }

        this.updateTaskDisplay(parentTaskIndex);
        return true;
    }

    // Get subtask progress
    getProgress(parentTaskIndex) {
        if (!window.gameState || !window.gameState.tasks) return { completed: 0, total: 0, percentage: 0 };
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks) return { completed: 0, total: 0, percentage: 0 };

        const total = parentTask.subtasks.length;
        const completed = parentTask.subtasks.filter(st => st.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }

    // Render subtasks for a task
    renderSubtasks(parentTaskIndex) {
        if (!window.gameState || !window.gameState.tasks) return '';
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks || parentTask.subtasks.length === 0) {
            return '';
        }

        const progress = this.getProgress(parentTaskIndex);

        return `
            <div class="subtasks-container">
                <div class="subtasks-header">
                    <span class="subtasks-label">Subtasks</span>
                    <span class="subtasks-progress">${progress.completed}/${progress.total}</span>
                </div>
                <div class="subtasks-progress-bar">
                    <div class="subtasks-progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <div class="subtasks-list">
                    ${parentTask.subtasks.map(subtask => this.renderSubtask(parentTaskIndex, subtask)).join('')}
                </div>
                <button class="subtask-add-btn" onclick="promptAddSubtask(${parentTaskIndex})">
                    + Add Subtask
                </button>
            </div>
        `;
    }

    // Render a single subtask
    renderSubtask(parentTaskIndex, subtask) {
        return `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                <label class="subtask-checkbox">
                    <input type="checkbox" 
                           ${subtask.completed ? 'checked' : ''}
                           onchange="window.subtasksManager.toggleSubtask(${parentTaskIndex}, '${subtask.id}', this.checked)">
                    <span class="subtask-checkmark"></span>
                </label>
                <span class="subtask-title ${subtask.completed ? 'completed' : ''}">${subtask.title}</span>
                <div class="subtask-actions">
                    <button class="subtask-action-btn" onclick="promptEditSubtask(${parentTaskIndex}, '${subtask.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="subtask-action-btn" onclick="window.subtasksManager.deleteSubtask(${parentTaskIndex}, '${subtask.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Update the display of a specific task
    updateTaskDisplay(parentTaskIndex) {
        // Trigger a full task display update
        if (typeof updateTasksDisplay === 'function') {
            updateTasksDisplay();
        }
    }

    // Update subtask progress bar immediately (for real-time sync)
    updateSubtaskProgressBar(parentTaskIndex) {
        if (!window.gameState || !window.gameState.tasks) return;
        
        const parentTask = window.gameState.tasks[parentTaskIndex];
        if (!parentTask || !parentTask.subtasks) return;

        const progress = this.getProgress(parentTaskIndex);
        
        // Find the progress bar element for this specific task
        const taskCards = document.querySelectorAll('.task-card');
        if (taskCards[parentTaskIndex]) {
            const progressFill = taskCards[parentTaskIndex].querySelector('.subtasks-progress-fill');
            const progressText = taskCards[parentTaskIndex].querySelector('.subtasks-progress');
            
            if (progressFill) {
                progressFill.style.width = `${progress.percentage}%`;
            }
            if (progressText) {
                progressText.textContent = `${progress.completed}/${progress.total}`;
            }
            
            console.log(`📊 Subtask gauge updated: ${progress.completed}/${progress.total} (${progress.percentage}%)`);
        }
    }
}

// Initialize subtasks manager
window.subtasksManager = new SubtasksManager();

// Global helper functions for UI
window.promptAddSubtask = function(parentTaskIndex) {
    const title = prompt('Enter subtask title:');
    if (title && title.trim()) {
        window.subtasksManager.addSubtask(parentTaskIndex, title.trim());
    }
};

window.promptEditSubtask = function(parentTaskIndex, subtaskId) {
    const parentTask = window.gameState.tasks[parentTaskIndex];
    const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const newTitle = prompt('Edit subtask title:', subtask.title);
    if (newTitle && newTitle.trim() && newTitle !== subtask.title) {
        window.subtasksManager.editSubtask(parentTaskIndex, subtaskId, newTitle.trim());
    }
};

// Enhance the existing task completion to check subtasks
const originalCompleteTask = window.completeTask;
if (originalCompleteTask) {
    window.completeTask = function(index) {
        const task = window.gameState.tasks[index];
        
        // Check if task has incomplete subtasks - block completion if any are incomplete
        if (task && task.subtasks && task.subtasks.length > 0) {
            const incompleteSubtasks = task.subtasks.filter(st => !st.completed);
            if (incompleteSubtasks.length > 0) {
                // Don't show confirmation, just block and show message
                if (window.showSuccessMessage) {
                    window.showSuccessMessage('⚠️ Complete all subtasks first!');
                }
                return;
            }
        }

        // Call original function
        originalCompleteTask(index);
    };
}

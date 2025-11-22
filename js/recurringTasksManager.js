// Recurring Tasks Manager for Task Monsters
// ===================================

class RecurringTasksManager {
    constructor() {
        this.recurringTasks = this.loadRecurringTasks();
        this.init();
    }

    // Load recurring tasks from localStorage
    loadRecurringTasks() {
        try {
            const stored = localStorage.getItem('recurringTasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recurring tasks:', error);
            return [];
        }
    }

    // Save recurring tasks to localStorage
    saveRecurringTasks() {
        try {
            localStorage.setItem('recurringTasks', JSON.stringify(this.recurringTasks));
        } catch (error) {
            console.error('Error saving recurring tasks:', error);
        }
    }

    // Initialize - check for tasks that need to be created
    init() {
        this.checkAndCreateDueTasks();
        // Check every hour for new tasks
        setInterval(() => this.checkAndCreateDueTasks(), 60 * 60 * 1000);
    }

    // Add a new recurring task template
    addRecurringTask(taskTemplate) {
        const recurringTask = {
            id: `recurring_${Date.now()}`,
            ...taskTemplate,
            isRecurring: true,
            recurrence: taskTemplate.recurrence || {
                type: 'daily', // daily, weekly, monthly, custom
                interval: 1, // every X days/weeks/months
                daysOfWeek: [], // for weekly: [0-6] where 0=Sunday
                dayOfMonth: null, // for monthly: 1-31
                time: '09:00', // default time to create task
            },
            nextDueDate: this.calculateNextDueDate(taskTemplate.recurrence),
            lastCreated: null,
            createdCount: 0,
            active: true
        };

        this.recurringTasks.push(recurringTask);
        this.saveRecurringTasks();
        this.updateDisplay();
        return recurringTask;
    }

    // Calculate next due date based on recurrence pattern
    calculateNextDueDate(recurrence, fromDate = new Date()) {
        const next = new Date(fromDate);
        
        switch (recurrence.type) {
            case 'daily':
                next.setDate(next.getDate() + (recurrence.interval || 1));
                break;
                
            case 'weekly':
                // Find next occurrence of specified days
                const targetDays = recurrence.daysOfWeek || [];
                if (targetDays.length === 0) {
                    next.setDate(next.getDate() + 7 * (recurrence.interval || 1));
                } else {
                    let found = false;
                    for (let i = 1; i <= 14; i++) {
                        next.setDate(next.getDate() + 1);
                        if (targetDays.includes(next.getDay())) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        next.setDate(next.getDate() + 7);
                    }
                }
                break;
                
            case 'monthly':
                const targetDay = recurrence.dayOfMonth || 1;
                next.setMonth(next.getMonth() + (recurrence.interval || 1));
                next.setDate(Math.min(targetDay, this.getDaysInMonth(next)));
                break;
                
            case 'custom':
                // Custom interval in days
                next.setDate(next.getDate() + (recurrence.customDays || 1));
                break;
        }

        // Set time
        if (recurrence.time) {
            const [hours, minutes] = recurrence.time.split(':');
            next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        return next.toISOString();
    }

    // Get days in month
    getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    // Check if any recurring tasks are due and create them
    checkAndCreateDueTasks() {
        const now = new Date();
        let tasksCreated = 0;

        this.recurringTasks.forEach(recurringTask => {
            if (!recurringTask.active) return;

            const nextDue = new Date(recurringTask.nextDueDate);
            
            // If next due date has passed, create the task
            if (now >= nextDue) {
                this.createTaskInstance(recurringTask);
                
                // Update next due date
                recurringTask.lastCreated = now.toISOString();
                recurringTask.createdCount++;
                recurringTask.nextDueDate = this.calculateNextDueDate(
                    recurringTask.recurrence,
                    nextDue
                );
                
                tasksCreated++;
            }
        });

        if (tasksCreated > 0) {
            this.saveRecurringTasks();
            if (typeof updateTasksDisplay === 'function') {
                updateTasksDisplay();
            }
            console.log(`✅ Created ${tasksCreated} recurring task(s)`);
        }
    }

    // Create an actual task instance from recurring template
    createTaskInstance(recurringTask) {
        if (!window.gameState) return;

        const task = {
            title: recurringTask.title,
            description: recurringTask.description || '',
            category: recurringTask.category,
            difficulty: recurringTask.difficulty,
            priority: recurringTask.priority,
            points: recurringTask.points,
            dueDate: this.calculateTaskDueDate(recurringTask),
            createdAt: new Date().toISOString(),
            completed: false,
            isFromRecurring: true,
            recurringTaskId: recurringTask.id
        };

        window.gameState.tasks.push(task);
        window.gameState.totalTasksCreated = (window.gameState.totalTasksCreated || 0) + 1;

        // Schedule notifications
        if (window.notificationManager && task.dueDate) {
            const taskIndex = window.gameState.tasks.length - 1;
            window.notificationManager.scheduleTaskNotifications(task, taskIndex);
        }

        if (typeof saveGameState === 'function') {
            saveGameState();
        }

        console.log('📅 Created recurring task instance:', task.title);
    }

    // Calculate when this task instance is due
    calculateTaskDueDate(recurringTask) {
        const recurrence = recurringTask.recurrence;
        const dueDate = new Date();

        // Set time
        if (recurrence.time) {
            const [hours, minutes] = recurrence.time.split(':');
            dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        // Add buffer time based on recurrence type
        switch (recurrence.type) {
            case 'daily':
                // Due by end of day
                dueDate.setHours(23, 59, 59, 999);
                break;
            case 'weekly':
                // Due in 7 days
                dueDate.setDate(dueDate.getDate() + 7);
                break;
            case 'monthly':
                // Due in 30 days
                dueDate.setDate(dueDate.getDate() + 30);
                break;
        }

        return dueDate.toISOString();
    }

    // Toggle recurring task active status
    toggleRecurringTask(taskId) {
        const task = this.recurringTasks.find(t => t.id === taskId);
        if (task) {
            task.active = !task.active;
            this.saveRecurringTasks();
            this.updateDisplay();
        }
    }

    // Edit recurring task
    editRecurringTask(taskId, updates) {
        const task = this.recurringTasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
            // Recalculate next due date if recurrence changed
            if (updates.recurrence) {
                task.nextDueDate = this.calculateNextDueDate(updates.recurrence);
            }
            this.saveRecurringTasks();
            this.updateDisplay();
        }
    }

    // Delete recurring task
    deleteRecurringTask(taskId) {
        this.recurringTasks = this.recurringTasks.filter(t => t.id !== taskId);
        this.saveRecurringTasks();
        this.updateDisplay();
    }

    // Get human-readable recurrence description
    getRecurrenceDescription(recurrence) {
        const { type, interval, daysOfWeek, dayOfMonth, time } = recurrence;
        
        let desc = '';
        
        switch (type) {
            case 'daily':
                desc = interval === 1 ? 'Every day' : `Every ${interval} days`;
                break;
                
            case 'weekly':
                if (daysOfWeek && daysOfWeek.length > 0) {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const days = daysOfWeek.map(d => dayNames[d]).join(', ');
                    desc = `Every ${days}`;
                } else {
                    desc = interval === 1 ? 'Every week' : `Every ${interval} weeks`;
                }
                break;
                
            case 'monthly':
                desc = `Monthly on day ${dayOfMonth || 1}`;
                break;
                
            case 'custom':
                desc = `Every ${recurrence.customDays} days`;
                break;
        }

        if (time) {
            desc += ` at ${time}`;
        }

        return desc;
    }

    // Update display of recurring tasks
    updateDisplay() {
        const container = document.getElementById('recurringTasksList');
        const card = document.getElementById('recurringTasksCard');
        
        if (!container) return;
        
        // Show/hide card based on whether there are recurring tasks
        if (card) {
            card.style.display = this.recurringTasks.length > 0 ? 'block' : 'none';
        }

        if (this.recurringTasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Recurring Tasks</div>
                    <div style="font-size: 14px;">Create recurring tasks to automate your routine!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recurringTasks.map(task => this.renderRecurringTask(task)).join('');
    }

    // Render a single recurring task
    renderRecurringTask(task) {
        const nextDue = new Date(task.nextDueDate);
        const timeUntil = this.getTimeUntil(nextDue);
        const recurrenceDesc = this.getRecurrenceDescription(task.recurrence);
        
        const categoryEmojis = {
            work: '💼', learning: '🎓', home: '🏠', finance: '💰',
            goals: '🎯', projects: '🛠️', errands: '🚗', digital: '📱',
            creative: '🎨', social: '🤝🏽'
        };

        return `
            <div class="recurring-task-card ${task.active ? '' : 'inactive'}">
                <div class="recurring-task-header">
                    <div class="recurring-task-icon">${categoryEmojis[task.category] || '📋'}</div>
                    <div class="recurring-task-info">
                        <div class="recurring-task-title">${task.title}</div>
                        <div class="recurring-task-recurrence">${recurrenceDesc}</div>
                    </div>
                    <label class="recurring-task-toggle">
                        <input type="checkbox" ${task.active ? 'checked' : ''} 
                               onchange="window.recurringTasksManager.toggleRecurringTask('${task.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="recurring-task-details">
                    <span class="recurring-task-badge">${task.difficulty}</span>
                    <span class="recurring-task-badge">${task.category}</span>
                    <span class="recurring-task-points">+${task.points} pts</span>
                </div>
                ${task.active ? `
                    <div class="recurring-task-next">
                        Next: ${timeUntil}
                    </div>
                ` : ''}
                <div class="recurring-task-stats">
                    Created ${task.createdCount} times
                </div>
                <div class="recurring-task-actions">
                    <button class="btn-icon" onclick="editRecurringTask('${task.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="deleteRecurringTask('${task.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Get human-readable time until next occurrence
    getTimeUntil(date) {
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) return 'Overdue';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `in ${days}d ${hours}h`;
        if (hours > 0) return `in ${hours}h ${minutes}m`;
        return `in ${minutes}m`;
    }
}

// Initialize recurring tasks manager
window.recurringTasksManager = new RecurringTasksManager();

// Global functions for UI
window.editRecurringTask = function(taskId) {
    // Open edit modal (to be implemented in HTML)
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (task && typeof openRecurringTaskModal === 'function') {
        openRecurringTaskModal(task);
    }
};

window.deleteRecurringTask = function(taskId) {
    if (confirm('Delete this recurring task? Future instances will not be created.')) {
        window.recurringTasksManager.deleteRecurringTask(taskId);
    }
};

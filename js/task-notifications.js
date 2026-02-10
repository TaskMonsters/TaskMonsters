/**
 * Task Notifications Manager
 * Handles background checking and sending notifications for tasks approaching due time
 * Notifications sent at: 20, 15, 10, 5, and 2 minutes before due time
 */

class TaskNotificationsManager {
    constructor() {
        this.checkInterval = null;
        this.notificationThresholds = [20, 15, 10, 5, 2]; // Minutes before due time
        this.sentNotifications = new Map(); // Track sent notifications to avoid duplicates
        this.isInitialized = false;
    }

    /**
     * Initialize the notification system
     */
    async init() {
        if (this.isInitialized) return;

        console.log('[TaskNotifications] Initializing...');

        // Initialize Firebase if available
        if (window.initializeFirebase) {
            await window.initializeFirebase();
            window.setupForegroundMessageHandler();
        }

        // Load sent notifications from localStorage
        this.loadSentNotifications();

        // Start background checking
        this.startBackgroundCheck();

        this.isInitialized = true;
        console.log('[TaskNotifications] Initialized successfully');
    }

    /**
     * Start background timer to check tasks every minute
     */
    startBackgroundCheck() {
        // Clear existing interval if any
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Check immediately
        this.checkTasksAndNotify();

        // Then check every 30 seconds (more responsive than 1 minute)
        this.checkInterval = setInterval(() => {
            this.checkTasksAndNotify();
        }, 30000); // 30 seconds

        console.log('[TaskNotifications] Background checking started (every 30s)');
    }

    /**
     * Stop background checking
     */
    stopBackgroundCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[TaskNotifications] Background checking stopped');
        }
    }

    /**
     * Check all tasks and send notifications for those approaching due time
     */
    checkTasksAndNotify() {
        // Check if notifications are enabled
        if (!window.gameState || !window.gameState.notifications) {
            return;
        }

        // Get all active tasks with due dates
        const tasks = window.gameState.tasks || [];
        const now = new Date();

        tasks.forEach((task, index) => {
            // Skip completed tasks or tasks without due dates
            if (task.completed || !task.dueDate) {
                return;
            }

            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();
            const minutesDiff = Math.floor(timeDiff / (1000 * 60));

            // Check if task is within any notification threshold
            this.notificationThresholds.forEach(threshold => {
                // Only notify if exactly at threshold (within 1 minute window)
                if (minutesDiff === threshold || (minutesDiff <= threshold && minutesDiff > threshold - 1)) {
                    const notificationKey = `${task.id || index}_${threshold}`;
                    
                    // Check if we've already sent this notification
                    if (!this.sentNotifications.has(notificationKey)) {
                        this.sendTaskNotification(task, threshold);
                        this.sentNotifications.set(notificationKey, Date.now());
                        this.saveSentNotifications();
                    }
                }
            });

            // Clean up old notification records for completed/overdue tasks
            if (minutesDiff < 0) {
                this.cleanupTaskNotifications(task.id || index);
            }
        });
    }

    /**
     * Send notification for a specific task
     */
    sendTaskNotification(task, minutesRemaining) {
        const title = `⏰ Task Due in ${minutesRemaining} Minutes!`;
        const body = `"${task.title}" is due soon. Time to get it done!`;

        console.log('[TaskNotifications] Sending notification:', title, body);

        // Send local notification (works even without Firebase)
        if (window.sendLocalNotification) {
            window.sendLocalNotification(title, body);
        } else {
            // Fallback to basic notification
            this.sendBasicNotification(title, body);
        }

        // Play notification sound if audio is enabled
        if (window.audioManager && window.gameState.soundEnabled) {
            window.audioManager.playSound('notification');
        }
    }

    /**
     * Fallback basic notification
     */
    sendBasicNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    body: body,
                    icon: 'assets/Pink_Monster_idle.gif',
                    tag: 'task-reminder'
                });

                setTimeout(() => notification.close(), 10000);
                
                notification.onclick = function() {
                    window.focus();
                    notification.close();
                };
            } catch (error) {
                console.error('[TaskNotifications] Error sending basic notification:', error);
            }
        }
    }

    /**
     * Clean up notification records for a specific task
     */
    cleanupTaskNotifications(taskId) {
        this.notificationThresholds.forEach(threshold => {
            const key = `${taskId}_${threshold}`;
            this.sentNotifications.delete(key);
        });
        this.saveSentNotifications();
    }

    /**
     * Load sent notifications from localStorage
     */
    loadSentNotifications() {
        try {
            const saved = localStorage.getItem('sentTaskNotifications');
            if (saved) {
                const data = JSON.parse(saved);
                this.sentNotifications = new Map(Object.entries(data));
                
                // Clean up old entries (older than 24 hours)
                const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                for (const [key, timestamp] of this.sentNotifications.entries()) {
                    if (timestamp < oneDayAgo) {
                        this.sentNotifications.delete(key);
                    }
                }
            }
        } catch (error) {
            console.error('[TaskNotifications] Error loading sent notifications:', error);
            this.sentNotifications = new Map();
        }
    }

    /**
     * Save sent notifications to localStorage
     */
    saveSentNotifications() {
        try {
            const data = Object.fromEntries(this.sentNotifications);
            localStorage.setItem('sentTaskNotifications', JSON.stringify(data));
        } catch (error) {
            console.error('[TaskNotifications] Error saving sent notifications:', error);
        }
    }

    /**
     * Clear all sent notification records
     */
    clearAllNotifications() {
        this.sentNotifications.clear();
        localStorage.removeItem('sentTaskNotifications');
        console.log('[TaskNotifications] All notification records cleared');
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        try {
            if (!('Notification' in window)) {
                console.warn('[TaskNotifications] Notifications not supported');
                return false;
            }

            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('[TaskNotifications] Permission granted');
                
                // Initialize Firebase if available
                if (window.requestNotificationPermission) {
                    await window.requestNotificationPermission();
                }
                
                return true;
            } else {
                console.warn('[TaskNotifications] Permission denied');
                return false;
            }
        } catch (error) {
            console.error('[TaskNotifications] Permission error:', error);
            return false;
        }
    }
}

// Create global instance
window.taskNotificationsManager = new TaskNotificationsManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.taskNotificationsManager.init();
    });
} else {
    window.taskNotificationsManager.init();
}

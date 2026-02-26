/**
 * Task Notifications Manager
 * Handles background polling and sending notifications for tasks approaching due time.
 * Notifications sent at: 20, 15, 10, 5, and 2 minutes before due time.
 *
 * This manager works alongside notificationManager.js:
 *   - notificationManager  → setTimeout-based precise scheduling (primary)
 *   - taskNotificationsManager → setInterval polling fallback (safety net)
 *
 * The polling approach catches edge cases where setTimeout was cleared
 * (e.g., page reload, task edit) and ensures no threshold is missed.
 */

class TaskNotificationsManager {
    constructor() {
        this.checkInterval = null;
        this.notificationThresholds = [20, 15, 10, 5, 2]; // Minutes before due time
        this.sentNotifications = new Map(); // Track sent notifications to avoid duplicates
        this.isInitialized = false;
        // Polling window: how many seconds on either side of a threshold counts as a hit.
        // With a 30s poll interval, a ±45s window guarantees every threshold is caught
        // even if the timer fires slightly early or late.
        this.WINDOW_SECONDS = 45;
    }

    /**
     * Initialize the notification system
     */
    async init() {
        if (this.isInitialized) return;

        console.log('[TaskNotifications] Initializing...');

        // Load previously sent notifications from localStorage
        this.loadSentNotifications();

        // Start the background polling loop
        this.startBackgroundCheck();

        this.isInitialized = true;
        console.log('[TaskNotifications] Initialized successfully');
    }

    /**
     * Start background timer to check tasks every 30 seconds
     */
    startBackgroundCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Run an immediate check, then every 30 seconds
        this.checkTasksAndNotify();

        this.checkInterval = setInterval(() => {
            this.checkTasksAndNotify();
        }, 30 * 1000); // 30 seconds

        console.log('[TaskNotifications] Background polling started (every 30s)');
    }

    /**
     * Stop background polling
     */
    stopBackgroundCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[TaskNotifications] Background polling stopped');
        }
    }

    /**
     * Check all tasks and send notifications for those approaching due time.
     *
     * A notification is triggered when the real time remaining until due is
     * within WINDOW_SECONDS of a threshold value. Using a window (rather than
     * an exact match) ensures the notification fires even if the 30s timer
     * fires a few seconds early or late.
     */
    checkTasksAndNotify() {
        // Bail out if notifications are disabled in game settings
        if (!window.gameState || !window.gameState.notifications) {
            return;
        }

        const tasks = window.gameState.tasks || [];
        const now = Date.now();
        const windowMs = this.WINDOW_SECONDS * 1000;

        tasks.forEach((task, index) => {
            // Skip completed tasks or tasks without due dates
            if (task.completed || !task.dueDate) {
                return;
            }

            const dueTime = new Date(task.dueDate).getTime();
            const msRemaining = dueTime - now;

            // Skip overdue tasks and clean up their records
            if (msRemaining < 0) {
                this.cleanupTaskNotifications(task.id || index);
                return;
            }

            this.notificationThresholds.forEach(threshold => {
                const thresholdMs = threshold * 60 * 1000;
                const diff = msRemaining - thresholdMs; // positive = not yet at threshold

                // Fire if we are within ±WINDOW_SECONDS of the threshold
                if (Math.abs(diff) <= windowMs) {
                    const notificationKey = `${task.id || index}_${threshold}`;

                    if (!this.sentNotifications.has(notificationKey)) {
                        this.sendTaskNotification(task, threshold);
                        this.sentNotifications.set(notificationKey, Date.now());
                        this.saveSentNotifications();
                    }
                }
            });
        });
    }

    /**
     * Send a notification for a specific task
     */
    sendTaskNotification(task, minutesRemaining) {
        const title = `\u23F0 Task Due in ${minutesRemaining} Minute${minutesRemaining === 1 ? '' : 's'}!`;
        const body = `"${task.title}" is due soon. Time to get it done!`;

        console.log('[TaskNotifications] Sending notification:', title);

        // Prefer the primary notificationManager if available
        if (window.notificationManager) {
            const taskId = task.id || task.title;
            const uniqueTag = `task-monsters-poll-${taskId}-${minutesRemaining}min`;
            window.notificationManager.sendNotification(
                title,
                body,
                'assets/logo/favicon.png',
                uniqueTag
            );
            return;
        }

        // Fallback: use sendLocalNotification from firebase-config.js if loaded
        if (window.sendLocalNotification) {
            window.sendLocalNotification(title, body);
            return;
        }

        // Last-resort fallback: direct Notification API
        this.sendBasicNotification(title, body);
    }

    /**
     * Last-resort basic notification (no dependency on other modules)
     */
    sendBasicNotification(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        try {
            const notification = new Notification(title, {
                body: body,
                icon: 'assets/Pink_Monster_idle.gif',
                tag: `task-reminder-basic-${Date.now()}` // unique tag to avoid replacement
            });

            setTimeout(() => {
                try { notification.close(); } catch (_) {}
            }, 10000);

            notification.onclick = function () {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('[TaskNotifications] Error sending basic notification:', error);
        }
    }

    /**
     * Remove sent-notification records for a specific task (called when task is overdue/completed)
     */
    cleanupTaskNotifications(taskId) {
        let changed = false;
        this.notificationThresholds.forEach(threshold => {
            const key = `${taskId}_${threshold}`;
            if (this.sentNotifications.has(key)) {
                this.sentNotifications.delete(key);
                changed = true;
            }
        });
        if (changed) this.saveSentNotifications();
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

                // Purge entries older than 24 hours
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
     * Persist sent notifications to localStorage
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
     * Clear all sent-notification records (used when notifications are disabled)
     */
    clearAllNotifications() {
        this.sentNotifications.clear();
        localStorage.removeItem('sentTaskNotifications');
        console.log('[TaskNotifications] All notification records cleared');
    }

    /**
     * Request notification permission (delegates to notificationManager if available)
     */
    async requestPermission() {
        if (window.notificationManager) {
            return window.notificationManager.requestPermission();
        }

        if (!('Notification' in window)) {
            console.warn('[TaskNotifications] Notifications not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('[TaskNotifications] Permission granted');
                return true;
            }
            console.warn('[TaskNotifications] Permission denied');
            return false;
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
        // Small delay to ensure gameState is loaded first
        setTimeout(() => window.taskNotificationsManager.init(), 2000);
    });
} else {
    setTimeout(() => window.taskNotificationsManager.init(), 2000);
}

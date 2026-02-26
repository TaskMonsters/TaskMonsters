// ===================================
// NOTIFICATION MANAGER
// Push notifications for task reminders
// ===================================

class NotificationManager {
    constructor() {
        this.notificationIntervals = new Map(); // Store timeouts for each task
        this.permissionGranted = false;
        // NOTE: Do NOT auto-request permission in constructor.
        // Permission is requested only when the user explicitly enables
        // notifications via the Settings toggle (toggleNotifications).
        this._syncPermissionState();
    }

    // Sync permissionGranted with the current browser permission state
    // without prompting the user.
    _syncPermissionState() {
        if (!('Notification' in window)) {
            return;
        }
        this.permissionGranted = (Notification.permission === 'granted');
    }

    // Request notification permission (called by the Settings toggle)
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('[NotificationManager] Notifications not supported in this browser');
            return false;
        }

        // If already granted, just sync state and return true
        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            return true;
        }

        // If previously denied, we cannot re-prompt; direct the user to browser settings
        if (Notification.permission === 'denied') {
            console.warn('[NotificationManager] Permission was previously denied');
            this.permissionGranted = false;
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permissionGranted = (permission === 'granted');
            console.log('[NotificationManager] Permission result:', permission);
            return this.permissionGranted;
        } catch (err) {
            console.error('[NotificationManager] requestPermission error:', err);
            this.permissionGranted = false;
            return false;
        }
    }

    // Send a notification
    // Uses a unique tag per task+threshold so notifications are never
    // silently replaced by the browser's deduplication logic.
    sendNotification(title, body, icon, uniqueTag) {
        // Guard: notifications must be enabled in game settings
        if (!window.gameState || !window.gameState.notifications) {
            return;
        }

        // Re-sync permission state in case it changed externally
        this._syncPermissionState();

        if (!this.permissionGranted) {
            console.warn('[NotificationManager] Permission not granted – cannot send notification');
            return;
        }

        const notifIcon = icon || 'assets/logo/favicon.png';
        // Each notification gets a unique tag so they stack instead of replacing each other
        const notifTag = uniqueTag || ('task-monsters-' + Date.now());

        try {
            const notification = new Notification(title, {
                body: body,
                icon: notifIcon,
                badge: notifIcon,
                tag: notifTag,
                requireInteraction: false,
                silent: false
            });

            // Auto-close after 10 seconds
            setTimeout(() => {
                try { notification.close(); } catch (_) {}
            }, 10000);

            notification.onclick = function () {
                window.focus();
                notification.close();
            };

            console.log('[NotificationManager] Sent:', title);
        } catch (error) {
            console.error('[NotificationManager] Error sending notification:', error);
        }
    }

    // Schedule notifications for a task at 20, 15, 10, 5, and 2 minutes before due
    scheduleTaskNotifications(task, taskIndex) {
        // Clear any existing scheduled notifications for this task first
        this.clearTaskNotifications(taskIndex);

        if (!task.dueDate) {
            return;
        }

        // Only schedule if notifications are currently enabled
        if (!window.gameState || !window.gameState.notifications) {
            return;
        }

        const dueTime = new Date(task.dueDate).getTime();
        const now = Date.now();

        // Notification thresholds in minutes before due time
        const thresholds = [20, 15, 10, 5, 2];

        thresholds.forEach(minutes => {
            const notificationTime = dueTime - (minutes * 60 * 1000);
            const delay = notificationTime - now;

            // Only schedule if the notification time is still in the future
            if (delay > 0) {
                const taskId = task.id || taskIndex;
                // Unique tag per task + threshold prevents browser deduplication
                const uniqueTag = `task-monsters-${taskId}-${minutes}min`;

                const timeoutId = setTimeout(() => {
                    this.sendNotification(
                        `\u23F0 Task Due in ${minutes} Minute${minutes === 1 ? '' : 's'}!`,
                        `"${task.title}" is due in ${minutes} minute${minutes === 1 ? '' : 's'}. Time to finish up!`,
                        'assets/logo/favicon.png',
                        uniqueTag
                    );
                }, delay);

                // Store timeout ID keyed by taskIndex → minutes
                if (!this.notificationIntervals.has(taskIndex)) {
                    this.notificationIntervals.set(taskIndex, new Map());
                }
                this.notificationIntervals.get(taskIndex).set(minutes, timeoutId);

                console.log(
                    `[NotificationManager] Scheduled ${minutes}min reminder for "${task.title}" ` +
                    `(fires in ${Math.round(delay / 1000)}s)`
                );
            }
        });
    }

    // Clear all scheduled notifications for a specific task
    clearTaskNotifications(taskIndex) {
        if (this.notificationIntervals.has(taskIndex)) {
            const taskIntervals = this.notificationIntervals.get(taskIndex);
            taskIntervals.forEach(timeoutId => {
                clearTimeout(timeoutId);
            });
            this.notificationIntervals.delete(taskIndex);
        }
    }

    // Clear and reschedule notifications for all active tasks
    rescheduleAllNotifications() {
        // Clear all existing timeouts
        this.notificationIntervals.forEach((taskIntervals) => {
            taskIntervals.forEach(timeoutId => {
                clearTimeout(timeoutId);
            });
        });
        this.notificationIntervals.clear();

        // Reschedule for every active task that has a due date
        if (window.gameState && window.gameState.tasks) {
            window.gameState.tasks.forEach((task, index) => {
                if (!task.completed && task.dueDate) {
                    this.scheduleTaskNotifications(task, index);
                }
            });
        }

        console.log('[NotificationManager] All notifications rescheduled');
    }

    // Cancel every scheduled notification timeout
    clearAllNotifications() {
        this.notificationIntervals.forEach((taskIntervals) => {
            taskIntervals.forEach(timeoutId => {
                clearTimeout(timeoutId);
            });
        });
        this.notificationIntervals.clear();
        console.log('[NotificationManager] All notifications cleared');
    }
}

// Initialize notification manager globally
window.notificationManager = new NotificationManager();

// When the page loads, if notifications were previously enabled and permission
// is already granted, reschedule all task notifications automatically.
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.gameState && window.gameState.notifications) {
            // Re-sync permission state (no prompt)
            window.notificationManager._syncPermissionState();

            if (window.notificationManager.permissionGranted) {
                window.notificationManager.rescheduleAllNotifications();
                console.log('[NotificationManager] Auto-rescheduled on page load');
            } else {
                // Permission was revoked externally; disable notifications in state
                console.warn('[NotificationManager] Permission lost – disabling notifications');
                window.gameState.notifications = false;
                if (window.saveGameState) window.saveGameState();
                if (window.updateSettingsDisplay) window.updateSettingsDisplay();
            }
        }
    }, 1500); // Wait for gameState to be fully loaded
});

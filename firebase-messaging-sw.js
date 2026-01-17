/**
 * Firebase Cloud Messaging Service Worker
 * Handles push notifications when the app is in the background
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_Y5V35a0PPpj1dbFM6-FSWUPgWdGXhiA",
    authDomain: "taskmonsters-d2b42.firebaseapp.com",
    projectId: "taskmonsters-d2b42",
    storageBucket: "taskmonsters-d2b42.firebasestorage.app",
    messagingSenderId: "608700693426",
    appId: "1:608700693426:web:62eee03afb7d16a5ca82ab",
    measurementId: "G-40NHKEG48H"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Task Reminder';
    const notificationOptions = {
        body: payload.notification?.body || 'A task is due soon!',
        icon: '/assets/Pink_Monster_idle.gif',
        badge: '/assets/Pink_Monster_idle.gif',
        tag: 'task-reminder',
        requireInteraction: false,
        data: payload.data
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked');
    event.notification.close();
    
    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes('task-monsters') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

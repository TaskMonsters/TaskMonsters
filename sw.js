/**
 * Task Monsters – Service Worker
 *
 * Responsibilities:
 *  1. Cache core app assets for offline use (PWA shell)
 *  2. Handle Web Push events so notifications fire even when the app is closed
 *  3. Handle notificationclick to bring the app into focus
 */

const CACHE_NAME = 'task-monsters-v1';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './assets/logo/favicon.png',
    './assets/Pink_Monster_idle.gif',
];

// ─── Install ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                // Non-fatal: some assets may not exist yet
                console.warn('[SW] Pre-cache partial failure (non-fatal):', err);
            });
        }).then(() => {
            // Activate immediately without waiting for old SW to be removed
            return self.skipWaiting();
        })
    );
});

// ─── Activate ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// ─── Fetch (network-first with cache fallback) ───────────────────────────────

self.addEventListener('fetch', (event) => {
    // Only handle GET requests for same-origin resources
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache a copy of successful responses
                if (response && response.status === 200) {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
                }
                return response;
            })
            .catch(() => {
                // Network failed – try the cache
                return caches.match(event.request);
            })
    );
});

// ─── Push (background push notifications) ───────────────────────────────────

self.addEventListener('push', (event) => {
    console.log('[SW] Push event received');

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (_) {
            data = { title: 'Task Reminder', body: event.data.text() };
        }
    }

    const title   = (data.notification && data.notification.title) || data.title || '\u23F0 Task Reminder';
    const options = {
        body:             (data.notification && data.notification.body) || data.body || 'A task is due soon!',
        icon:             (data.notification && data.notification.icon) || './assets/logo/favicon.png',
        badge:            './assets/logo/favicon.png',
        tag:              data.tag || ('task-reminder-push-' + Date.now()),
        requireInteraction: false,
        data:             { url: self.location.origin }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click ──────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) || self.location.origin;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus an existing window if one is open
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

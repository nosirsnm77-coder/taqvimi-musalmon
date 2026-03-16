const CACHE_NAME = 'islamic-calendar-v3';
const ASSETS = [
    './',
    './index.html',
    './namoz.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Насб кардан — кэш кардани файлҳо
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Фаъолсозӣ — пок кардани кэши кӯҳна
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys
                .filter(k => k !== CACHE_NAME)
                .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Ҷавоб додан — аввал кэш, баъд шабака
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(() => caches.match('./index.html'))
    );
});

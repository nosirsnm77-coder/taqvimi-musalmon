const CACHE_NAME = 'islamic-calendar-v8';
const ASSETS = [
    './',
    './index.html',
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

// Ҷавоб додан
self.addEventListener('fetch', event => {
    let url = new URL(event.request.url);

    // API дархостҳоро ҲЕҶ ГОҲ кэш накун — ҳамеша аз шабака гир
    if (url.hostname !== location.hostname) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response('Offline', { status: 503 });
            })
        );
        return;
    }

    // Барои файлҳои худӣ: аввал шабака, баъд кэш (network-first)
    event.respondWith(
        fetch(event.request).then(response => {
            let clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
        }).catch(() => {
            return caches.match(event.request).then(cached => {
                return cached || caches.match('./index.html');
            });
        })
    );
});

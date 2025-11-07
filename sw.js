// Network-only Service Worker
// This SW intentionally does NOT cache responses. Every fetch request
// is forwarded to the network. On failure we return a 503 or a small
// offline HTML for navigations.

self.addEventListener('install', (event) => {
    // Do not pre-cache anything. Activate immediately.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim clients so pages are controlled immediately.
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests. For all requests, perform a network fetch
    // and never store responses in the cache.
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Always return the live network response (do not cache it).
                return networkResponse;
            })
            .catch(() => {
                // Network failed. For navigation requests provide a minimal
                // offline HTML so the user sees something helpful.
                if (event.request.mode === 'navigate') {
                    return new Response(
                        '<!doctype html><meta charset="utf-8"><title>オフライン</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#000;color:#fff}</style><div><h1>オフラインです</h1><p>サーバーに接続できません。ネットワーク接続を確認してください。</p></div>',
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/html' }
                        }
                    );
                }

                // For non-navigation requests return a generic 503 response.
                return new Response('ネットワークエラー: オンラインでアクセスしてください', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            })
    );
});

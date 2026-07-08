self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Intercept requests to Cloudinary
    if (url.hostname === 'res.cloudinary.com') {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Cache Hit: Serve the cached image
                    return cachedResponse;
                }
                
                // Cache Miss: Return a local SVG placeholder response without hitting the network
                return new Response(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
                        <rect width="100%" height="100%" fill="#eeeeee"/>
                        <text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#666666" dominant-baseline="middle" text-anchor="middle">
                            Image Temporarily Offline
                        </text>
                    </svg>`,
                    {
                        status: 200,
                        headers: { 'Content-Type': 'image/svg+xml' }
                    }
                );
            })
        );
    }
});

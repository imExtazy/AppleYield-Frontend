// Minimal SW: only register to make app installable, no fetch interception
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
// Keep a no-op fetch handler to satisfy some PWA checks, but don't intercept
self.addEventListener('fetch', () => {
  // no-op
});



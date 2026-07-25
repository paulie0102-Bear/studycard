const CACHE_NAME = 'smartcards-v1.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://raw.githubusercontent.com/paulie0102-Bear/studycard/refs/heads/main/paw.png'
];

// 安裝並快取檔案
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 攔截網路請求，優先使用快取內容
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

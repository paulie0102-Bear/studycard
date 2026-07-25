const CACHE_NAME = 'smartcards-v1.1'; // 👈 每次修改 GitHub 時改這裡 (例如 v1.2)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://raw.githubusercontent.com/paulie0102-Bear/studycard/refs/heads/main/paw.png'
];

// 1. 安裝並快取新檔案，並強制新的 Service Worker 立即接管 (skipWaiting)
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 強制跳過等待，立刻啟用新 SW
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. 激活新 SW 時，自動刪除所有舊版本的快取 (刪除舊的 smartcards-v1)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 正在刪除舊快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 讓所有打開的頁面立刻受新 SW 控制
  );
});

// 3. 網路優先 (Network First)，失敗時才用快取 (最適合經常更新的 WebApp)
self.addEventListener('fetch', (e) => {
  // 只處理 HTTP/HTTPS 請求
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // 如果網路請求成功，順便更新快取
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 當沒網路（離線）時，才拿手機儲存的快取備份
        return caches.match(e.request);
      })
  );
});

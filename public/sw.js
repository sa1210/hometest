// サービスワーカーのインストール時
self.addEventListener('install', (event) => {
  console.log('[Service Worker] install イベント');
  // キャッシュ等の事前準備がある場合はここで
  event.waitUntil(self.skipWaiting()); // 即時反映したい場合
});

// サービスワーカーのアクティベート時
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] activate イベント');
  event.waitUntil(self.clients.claim()); // クライアントが旧SWから置き換わるのを待機
});

// プッシュ通知を受信した時
self.addEventListener('push', (event) => {
  console.log('[Service Worker] push イベント受信', event);

  let notificationData = {};
  if (event.data) {
    notificationData = event.data.json(); 
  }

  // 通知の内容を設定
  const title = notificationData.title || 'デフォルトタイトル';
  const options = {
    body: notificationData.body || 'デフォルト本文',
    icon: 'icon-192.png',
    data: {
      url: notificationData.url || '/' // 通知クリック時に開くURLなど
    }
  };

  // 通知を表示
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知がクリックされた時
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] notificationclick イベント', event);
  event.notification.close();
  // 通知の data に設定した URL を開く
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

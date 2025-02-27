const publicVAPIDKey = 'BHb6FBE_wYcxHRHL0EdJyedKZVFBDQJZf2wZRSQeYuIha3RscvPwv77sXQdqctCHFVQAMgJpMrkoigcPx37kQMM'; 
// VAPID鍵ペアは後ほどサーバー側で生成します

// ページ読み込み時
window.addEventListener('load', async () => {
  // サービスワーカーを登録
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker registered:', reg);
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }

  const subscribeBtn = document.getElementById('subscribeBtn');
  subscribeBtn.addEventListener('click', async () => {
    // 通知許可をリクエスト
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('通知が許可されませんでした');
      return;
    }
    // プッシュ通知のサブスクリプションを作成
    const subscription = await subscribeUserToPush();
    if (subscription) {
      console.log('[フロント] 取得したサブスクリプション:', subscription);
      // サーバーに subscription を送信（データベースに保存、またはその場で送信など）
      await sendSubscriptionToServer(subscription);
    }
  });
});

// ユーザーをプッシュ通知にサブスクライブする
async function subscribeUserToPush() {
  const reg = await navigator.serviceWorker.ready;
  return await reg.pushManager.subscribe({
    userVisibleOnly: true, // 常に通知が表示されるように
    applicationServerKey: urlBase64ToUint8Array(publicVAPIDKey)
  });
}

// サブスクリプション情報をサーバーに送る(ここでは仮)
async function sendSubscriptionToServer(subscription) {
  const res = await fetch('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
  if (res.ok) {
    console.log('[フロント] サブスクリプション情報をサーバーへ送信しました');
  } else {
    console.error('[フロント] サブスクライブ情報の送信に失敗', res.status);
  }
}

// VAPID鍵は Base64 で扱う必要があるため変換
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

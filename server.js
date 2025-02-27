const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// 先ほど生成した VAPID 鍵
const publicVapidKey = 'BHb6FBE_wYcxHRHL0EdJyedKZVFBDQJZf2wZRSQeYuIha3RscvPwv77sXQdqctCHFVQAMgJpMrkoigcPx37kQMM';
const privateVapidKey = 'mfnobmkDESuS2DiALozWHks6ZOU8noNFCwsI30rtS3w';

// Web Push の設定
webPush.setVapidDetails(
  'mailto:sa@3bitter.com', // 適当なメールアドレス
  publicVapidKey,
  privateVapidKey
);

app.use(express.static('public'));  // /public にフロントのファイルを配置する想定
app.use(bodyParser.json());

// サブスクリプション情報を受け取り保持
let subscriptions = []; // 簡易的にメモリ保存(実運用ではDB等を使う)

// サブスクライブエンドポイント
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  console.log('[サーバー] 受け取ったサブスクリプション:', subscription);

  // 重複チェックも省略して簡単に配列に保存
  subscriptions.push(subscription);

  res.status(201).json({});
});

// テストで送信するエンドポイント
app.get('/sendNotification', async (req, res) => {
  // 送る通知データ
  const payload = JSON.stringify({
    title: 'Hello from Server!',
    body: 'これはサーバーからのプッシュ通知テストです。',
    url: 'https://example.com/'
  });

  // 登録されているすべての購読者に送る(テスト用)
  const sendAll = subscriptions.map(sub => {
    return webPush.sendNotification(sub, payload)
      .catch(err => {
        console.error('[サーバー] プッシュ送信エラー:', err);
      });
  });

  await Promise.all(sendAll);

  res.send('通知を送信しました！');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

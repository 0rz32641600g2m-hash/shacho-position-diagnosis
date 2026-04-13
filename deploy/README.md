# デプロイ手順

## 1. Next.js 側

1. `.env.production.example` をもとに `.env.production` を作成
2. `WORDPRESS_API_USER` と `WORDPRESS_API_APP_PASSWORD` を設定
3. 本番サーバーへこのリポジトリを配置
4. `deploy/start-production.sh` で起動

## 2. WordPress 側

1. `wordpress-plugin/yourbrain-shindan-bridge/` を `wp-content/plugins/` に配置
2. 管理画面でプラグインを有効化
3. API 用の WordPress ユーザーを作成
4. そのユーザーに Application Password を発行

## 3. Web サーバー

1. `deploy/nginx-yourbrain-shindan.conf` の内容を Nginx に追加
2. `https://yourbrain.jp/shindan/` へアクセスして表示確認
3. 診断送信後、WordPress 管理画面の「社長の形勢診断」にデータが入ることを確認

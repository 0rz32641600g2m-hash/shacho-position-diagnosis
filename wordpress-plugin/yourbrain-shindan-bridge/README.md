# YourBrain Shindan Bridge

WordPress 側で診断結果をカスタムテーブルへ保存し、管理画面で一覧表示するためのプラグインです。

## 役割

- `wp_yourbrain_shindan_submissions` テーブル作成
- REST API
  - `POST /wp-json/yourbrain-shindan/v1/submissions`
  - `GET /wp-json/yourbrain-shindan/v1/submissions/{id}`
- WordPress 管理画面に「社長の形勢診断」一覧を追加

## 想定構成

- Next.js アプリ: `https://yourbrain.jp/shindan/`
- WordPress REST: `https://yourbrain.jp/wp-json/yourbrain-shindan/v1`
- Next.js から WordPress へ Application Password 付きで保存

## 導入手順

1. このフォルダを `wp-content/plugins/yourbrain-shindan-bridge/` へ配置
2. WordPress 管理画面でプラグインを有効化
3. API 用ユーザーの Application Password を作成
4. Next.js 側に以下を設定

```env
NEXT_PUBLIC_BASE_PATH=/shindan
WORDPRESS_API_BASE=https://yourbrain.jp/wp-json/yourbrain-shindan/v1
WORDPRESS_API_USER=yourbrain-api-user
WORDPRESS_API_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

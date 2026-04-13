# `shindan.yourbrain.jp` 公開手順

## 推奨構成

- WordPress 本体: `https://yourbrain.jp` の Xserver 共用サーバー
- 診断アプリ: `https://shindan.yourbrain.jp` の別 Node 実行環境
- 保存先: `https://yourbrain.jp/wp-json/yourbrain-shindan/v1`

共用レンタルサーバー単体では Next.js の常駐 + `/shindan/` リバースプロキシが重いため、
診断アプリはサブドメインで分けるのが現実的です。

## DNS

`shindan.yourbrain.jp` を診断アプリのホスト先へ向けます。

例:
- Vercel の場合: 指定された CNAME
- VPS の場合: サーバー IP

## Next.js 側の環境変数

`.env.production`:

```env
NEXT_PUBLIC_BASE_PATH=
WORDPRESS_API_BASE=https://yourbrain.jp/wp-json/yourbrain-shindan/v1
WORDPRESS_API_USER=yourbrain_shindan_api
WORDPRESS_API_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=production
```

## デプロイ先候補

### 1. Vercel

- GitHub 連携でデプロイ
- `shindan.yourbrain.jp` を Vercel に向ける
- 環境変数を Vercel に設定

### 2. VPS

- `shindan-app-release.tar.gz` を VPS に配置
- `bash deploy/start-production.sh`
- Nginx で `server_name shindan.yourbrain.jp;`

## VPS の Nginx 例

```nginx
server {
  listen 80;
  server_name shindan.yourbrain.jp;

  location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

## WordPress 側

- `yourbrain-shindan-bridge` プラグインを有効化済み
- API ユーザー `yourbrain_shindan_api` を作成済み
- Application Password を Next.js 側へ設定

## 動作確認

1. `https://shindan.yourbrain.jp` が開く
2. 診断送信できる
3. WordPress 管理画面の「社長の形勢診断」に保存される
4. 結果ページの `id` 付き URL を開き直しても表示される

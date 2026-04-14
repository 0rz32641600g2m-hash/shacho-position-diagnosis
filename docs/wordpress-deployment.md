# 社長の形勢診断 本番化メモ

## 構成

- 推奨公開URL: `https://shindan.yourbrain.jp`
- 配信: Next.js は別 Node 実行環境で公開
- 保存先: WordPress カスタムテーブル
- 一覧管理: WordPress 管理画面

## Next.js 側

- `NEXT_PUBLIC_BASE_PATH=`
- `output: "standalone"` で本番化
- 保存APIは WordPress REST に転送
- 環境変数は `.env.production.example` をベースに設定

## WordPress 側

- `wordpress-plugin/yourbrain-shindan-bridge/` を配置
- 有効化でカスタムテーブル作成
- `wp-config.php` に共有トークンを設定

```php
define('YOURBRAIN_SHINDAN_API_TOKEN', 'replace-with-shared-secret');
```

- Vercel 側にも同じ `WORDPRESS_API_TOKEN` を設定
- `Authorization` ヘッダーではなく独自トークンを優先利用
- `wp-json` の POST が 403 の場合は `wp-admin/admin-post.php` へ自動フォールバック

## 公開方式

- Xserver 共用サーバーでは Next.js 常駐 + `/shindan/` 配下リバースプロキシは非推奨
- `shindan.yourbrain.jp` を別 Node 実行環境へ向ける構成を推奨
- 詳細は [subdomain-deployment.md](/Users/kawamorinariakira/Desktop/Claude%20Code/社長の形勢診断/docs/subdomain-deployment.md)

## 起動例

```bash
cp .env.production.example .env.production
bash deploy/start-production.sh
```

## 実装済み

- 事前情報入力
- 利用規約 / プライバシーポリシー
- 診断保存API
- WordPress カスタムテーブル保存用プラグイン
- WordPress 管理画面一覧

## 次の実装候補

- WordPress 管理画面で詳細画面
- WordPress 管理画面で詳細表示
- CSV エクスポート
- メール通知
- 予約導線との接続

# YourBrain Shindan Bridge

WordPress 側で診断結果をカスタムテーブルへ保存し、管理画面で一覧表示するためのプラグインです。

## 役割

- `wp_yourbrain_shindan_submissions` テーブル作成
- REST API
  - `POST /wp-json/yourbrain-shindan/v1/submissions`
  - `GET /wp-json/yourbrain-shindan/v1/submissions/{id}`
- フォールバック保存口
  - `POST /wp-admin/admin-post.php?action=yourbrain_shindan_submit`
- WordPress 管理画面に「社長の形勢診断」一覧を追加

## 想定構成

- Next.js アプリ: `https://shindan.yourbrain.jp`
- WordPress REST: `https://yourbrain.jp/wp-json/yourbrain-shindan/v1`
- Next.js から WordPress へ共有トークン付きで保存

## 導入手順

1. このフォルダを `wp-content/plugins/yourbrain-shindan-bridge/` へ配置
2. WordPress 管理画面でプラグインを有効化
3. `wp-config.php` に共有トークンを追加
4. Next.js 側に以下を設定

```env
NEXT_PUBLIC_BASE_PATH=
WORDPRESS_API_BASE=https://yourbrain.jp/wp-json/yourbrain-shindan/v1
WORDPRESS_API_TOKEN=replace-with-shared-secret
```

`wp-config.php` には同じ値を追加します。

```php
define('YOURBRAIN_SHINDAN_API_TOKEN', 'replace-with-shared-secret');
```

## 補足

- 管理画面からの閲覧は従来どおり `manage_options` 権限で保護されます
- 外部連携は `X-Yourbrain-Shindan-Token` ヘッダーか `?token=` で認証できます
- Xserver 側で `wp-json` の POST が 403 になる場合は、アプリ側が `admin-post.php` に自動でフォールバックします
- 既存の Application Password 認証も残しているため、ローカル確認はそのまま使えます

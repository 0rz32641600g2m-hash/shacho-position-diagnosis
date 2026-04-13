# 公開前チェックリスト

## WordPress

- `yourbrain-shindan-bridge` プラグインを配置した
- プラグインを有効化した
- 管理画面に「社長の形勢診断」が出る
- API ユーザー `yourbrain_shindan_api` が存在する
- Application Password を発行した

## Next.js

- `.env.production` に Application Password を設定した
- `NEXT_PUBLIC_BASE_PATH=/shindan` になっている
- `npm run build` が通る
- `PORT=3100 npm run start` で起動できる

## Nginx

- `/shindan/` の location を追加した
- 設定テストが通る
- リロード後に `https://yourbrain.jp/shindan/` が開く

## 動作確認

- 事前情報入力ができる
- 利用規約 / プライバシーポリシーが開く
- 診断送信後に結果画面へ遷移する
- WordPress 管理画面に送信データが保存される

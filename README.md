# blog-and-app

ミニメモアプリ + 日付別ミニブログ（Markdown運用）

## ブログ運用

1. `posts/YYYY-MM-DD.md` を追加（例: `posts/2026-02-26.md`）
2. （ローカル確認したい場合）ビルド実行

```bash
npm run build:blog
```

3. `posts/*.md` を commit/push

- GitHub Actions が自動で `blog/*.html` を生成して commit します
- 一覧: `blog/index.html`
- 各記事: `blog/YYYY-MM-DD.html`


## 投稿フォーマット

```md
---
title: タイトル
date: 2026-02-26
---

## やったこと
- ...

## 分かったこと
- ...

## 学び
- ...
```

# simple-api-node

Node.js + ExpressによるシンプルなWebAPI実装

## ブランチ情報

- main
  - シンプルなAPIのみ実装

## 利用方法

```bash
git clone https://github.com/eizaburo/simple-api-node.git
cd simple-web-node
npm install
node index.mjs
```


## API仕様

### GET /

トップページ。動作確認用。

- **レスポンス**: `Hello Node.js`（テキスト）

---

### POST /contacts

新規コンタクト登録。

- **リクエストボディ** (JSON):

| フィールド | 型 | バリデーション |
|---|---|---|
| title | string | 1〜10文字 |
| email | string | メールアドレス形式 |
| message | string | 1〜20文字 |

- **レスポンス (200)**:
```json
{
  "status": "success",
  "message": "受け取り保存しました",
  "data": { "id": 1, "title": "件名", "email": "a@example.com", "message": "本文" }
}
```

- **レスポンス (400)**: バリデーションエラー
```json
{ "status": "error", "message": "titleの値が不正です。" }
```

---

### GET /contacts

全コンタクトデータ取得。

- **レスポンス (200)**:
```json
{
  "status": "success",
  "message": "全データを返します",
  "data": [{ "id": 1, "title": "件名", "email": "a@example.com", "message": "本文" }]
}
```

## 動作確認（例）

新規登録

```bash
curl -X POST \
-H "Content-Type: application/json" \
-d '{"title":"hoge", "email":"hoge@hoge.com", "message":"hogehoge"}' \
http://localhost:3000/contacts
```

登録データ収録

```bash
curl -X GET http://localhost:3000/contacts
```

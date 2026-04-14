# API テスト（curl コマンド）

ベースURL: `http://localhost:3333`

---

## 1. ルート確認（GET /）

サーバーが起動しているか確認します。

```bash
curl http://localhost:3333/
```

**期待レスポンス:**
```
Hello Node.js
```

---

## 2. JWT認証 — トークン取得（POST /login）

AccessToken を取得します。以降の `/contacts` 系リクエストすべてに必要です。

```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"id":"hogehoge","password":"fugafuga"}'
```

**期待レスポンス:**
```json
{
  "status": "success",
  "accessToken": "<JWT文字列>"
}
```

取得したトークンをシェル変数に保存しておくと以降のコマンドで使い回せます（`jq` が必要）。

```bash
TOKEN=$(curl -s -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"id":"hogehoge","password":"fugafuga"}' | jq -r '.accessToken')
```

---

## 3. JWT認証 — トークン検証（GET /contacts）

取得した AccessToken を使って保護されたエンドポイントにアクセスします。

```bash
curl http://localhost:3333/contacts \
  -H "Authorization: Bearer $TOKEN"
```

**期待レスポンス:**
```json
{
  "status": "success",
  "message": "全データを返します",
  "data": []
}
```

---

## 4. 新規登録（POST /contacts）

新しい連絡先を1件登録します。

```bash
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "テスト", "email": "test@example.com", "message": "こんにちは"}'
```

**期待レスポンス:**
```json
{
  "status": "success",
  "message": "受け取り保存しました",
  "data": {
    "id": 1,
    "title": "テスト",
    "email": "test@example.com",
    "message": "こんにちは"
  }
}
```

---

## 5. 全データ取得（GET /contacts）

登録済みの全件を取得します。

```bash
curl http://localhost:3333/contacts \
  -H "Authorization: Bearer $TOKEN"
```

**期待レスポンス:**
```json
{
  "status": "success",
  "message": "全データを返します",
  "data": [
    {
      "id": 1,
      "title": "テスト",
      "email": "test@example.com",
      "message": "こんにちは"
    }
  ]
}
```

---

## 6. 指定データ取得（GET /contacts/:id）

IDを指定して1件取得します。

```bash
curl http://localhost:3333/contacts/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待レスポンス:**
```json
{
  "status": "success",
  "message": "指定データを返します",
  "data": {
    "id": 1,
    "title": "テスト",
    "email": "test@example.com",
    "message": "こんにちは"
  }
}
```

---

## 7. 指定データ更新（PUT /contacts/:id）

IDを指定して1件更新します。

```bash
curl -X PUT http://localhost:3333/contacts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "更新後", "email": "updated@example.com", "message": "更新しました"}'
```

**期待レスポンス:**
```json
{
  "status": "success",
  "message": "データを更新しました",
  "data": {
    "id": 1,
    "title": "更新後",
    "email": "updated@example.com",
    "message": "更新しました"
  }
}
```

---

## 8. 指定データ削除（DELETE /contacts/:id）

IDを指定して1件削除します。

```bash
curl -X DELETE http://localhost:3333/contacts/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待レスポンス:**
```json
{
  "status": "success",
  "message": "データを削除しました",
  "data": {
    "id": 1
  }
}
```

---

---

# 異常系テスト

## 認証エラー（401）

### POST /login — ID またはパスワードが違う

```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"id":"wronguser","password":"wrongpass"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "IDまたはパスワードが違います。" }
```

---

### GET /contacts — トークンなし

```bash
curl http://localhost:3333/contacts
```

**期待レスポンス:**
```json
{ "status": "error", "message": "トークンがありません。" }
```

---

### GET /contacts — トークンが無効

```bash
curl http://localhost:3333/contacts \
  -H "Authorization: Bearer invalidtoken"
```

**期待レスポンス:**
```json
{ "status": "error", "message": "トークンが無効です。" }
```

---

## バリデーションエラー（400）

### POST /contacts — title が空

```bash
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "", "email": "test@example.com", "message": "こんにちは"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "titleの値が不正です。" }
```

---

### POST /contacts — title が11文字以上（上限10文字）

```bash
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "あいうえおかきくけこさ", "email": "test@example.com", "message": "こんにちは"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "titleの値が不正です。" }
```

---

### POST /contacts — email の形式が不正

```bash
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "テスト", "email": "not-an-email", "message": "こんにちは"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "emailの値が不正です。" }
```

---

### POST /contacts — message が空

```bash
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "テスト", "email": "test@example.com", "message": ""}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "messageの値が不正です。" }
```

---

### POST /contacts — message が21文字以上（上限20文字）

```bash
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "テスト", "email": "test@example.com", "message": "あいうえおかきくけこさしすせそたちつてとな"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "messageの値が不正です。" }
```

---

### PUT /contacts/:id — バリデーションエラー（email 不正）

```bash
curl -X PUT http://localhost:3333/contacts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "更新後", "email": "invalid", "message": "更新しました"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "emailの値が不正です。" }
```

---

## 存在しないIDへのアクセス（404）

### GET /contacts/:id — 存在しないID

```bash
curl http://localhost:3333/contacts/9999 \
  -H "Authorization: Bearer $TOKEN"
```

**期待レスポンス:**
```json
{ "status": "error", "message": "指定されたデータが見つかりません。" }
```

---

### PUT /contacts/:id — 存在しないID

```bash
curl -X PUT http://localhost:3333/contacts/9999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "更新後", "email": "updated@example.com", "message": "更新しました"}'
```

**期待レスポンス:**
```json
{ "status": "error", "message": "指定されたデータが見つかりません。" }
```

---

### DELETE /contacts/:id — 存在しないID

```bash
curl -X DELETE http://localhost:3333/contacts/9999 \
  -H "Authorization: Bearer $TOKEN"
```

**期待レスポンス:**
```json
{ "status": "error", "message": "指定されたデータが見つかりません。" }
```

---

## 通しテスト（順番に実行）

上記を順番に実行することで、認証 + CRUD 全操作を一通り確認できます。

```bash
# 0. トークン取得
TOKEN=$(curl -s -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"id":"hogehoge","password":"fugafuga"}' | jq -r '.accessToken')

# 1. 登録
curl -X POST http://localhost:3333/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "テスト", "email": "test@example.com", "message": "こんにちは"}'

# 2. 全件取得
curl http://localhost:3333/contacts \
  -H "Authorization: Bearer $TOKEN"

# 3. 1件取得
curl http://localhost:3333/contacts/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. 更新
curl -X PUT http://localhost:3333/contacts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "更新後", "email": "updated@example.com", "message": "更新しました"}'

# 5. 削除
curl -X DELETE http://localhost:3333/contacts/1 \
  -H "Authorization: Bearer $TOKEN"
```

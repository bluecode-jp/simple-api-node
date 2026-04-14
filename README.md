# simple-api-node

シンプルなWebAPIのサンプル実装（Node.js）

>言語はJavaScript。フレームワークはExpressを利用。

## ブランチ情報

- main
  - シンプルなWebUIと連携する基本実装

## 開発・動作確認環境

- macOS(Apple Silico)
- Node.js（24.x）

## 利用方法

```bash
git clone https://github.com/bluecode-jp/simple-api-node.git
cd simple-web-node
npm install

# 鍵生成
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# API実行
node index.mjs
```
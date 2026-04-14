import express from 'express';
import db from './db.mjs';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

// RSA鍵の読み込み（RS256用）
const privateKey = readFileSync('./keys/private.pem');
const publicKey  = readFileSync('./keys/public.pem');


// expressのインスタンスを生成
const app = express();
// jsonを扱えるように設定（現時点では不要）
app.use(express.json());

// CORS対応
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// 認証ミドルウェア（JWT検証）
const authenticate = (req, res, next) => {
    // Authorizationヘッダーを取得
    const authHeader = req.headers['authorization'];
    // Bearerをスペースで区切り、後者だけをtokenとして取得
    const token = authHeader ? authHeader.split(' ')[1] : null;
    if (!token)
        return res.status(401).json({ status: "error", message: "トークンがありません。" });
    try {
        // 公開鍵を使って署名を検証
        req.user = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        next();
    } catch {
        return res.status(401).json({ status: "error", message: "トークンが無効です。" });
    }
};

// /contacts 以下のルートすべてに認証を適用
app.use('/contacts', authenticate);

// ログインAPI（AccessToken発行）
app.post("/login", (req, res) => {

    // IDとPasswordを取得
    const { id = "", password = "" } = req.body || {};

    // ID, Passsword認証。本当はデータベースの情報（Passwordはハッシュ値）等と比較
    if (id !== 'hogehoge' || password !== 'fugafuga')
        return res.status(401).json({ status: "error", message: "IDまたはパスワードが違います。" });

    // ペイロードを指定（expはjsonwebtokenライブラリが自動付与。有効期限は10分）
    const accessToken = jwt.sign({ sub: id, type: 'access' },privateKey,{ algorithm: 'RS256', expiresIn: '10m' });

    // access tokenを返す
    res.json({ status: "success", accessToken });
});

// バリデーション用の正規表現作成
const regex_title = /^.{1,10}$/;
const regex_email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const regex_message = /^.{1,20}$/;

// rootにアクセスしたときの対応実装
app.get("/", (req, res) => {
    res.send("Hello Node.js");
});

// 新規登録API（CREATE）
app.post("/contacts", async (req, res) => {

    // テスト用にSleep処理を追加（数値は適宜調整：1000ms = 1秒）
    await new Promise(resolve => setTimeout(resolve, 1000));

    // jsonの値を受け取って分割代入
    // 正規表現が正しく機能するために、初期値として""を設定（null, undefinedを防止）
    // null, undefinedはregex.testで、test("null"), test("undefined")と評価されるためマッチしてしまう
    const { title = "", email = "", message = "" } = req.body || {};

    // バリデーション（正規表現利用）
    // if(!title || !regex_title.test(title)){}でもnull, undefinedに対応可能
    if (!regex_title.test(title))
        return res.status(400).json({ status: "error", message: "titleの値が不正です。" });
    if (!regex_email.test(email))
        return res.status(400).json({ status: "error", message: "emailの値が不正です。" });
    if (!regex_message.test(message))
        return res.status(400).json({ status: "error", message: "messageの値が不正です。" });


    // db処理（INSERT）
    try {
        const result = db.prepare(`insert into contacts(title, email, message) values
                                (?, ?, ?)`).run(title, email, message);

        // レスポンス
        res.json({
            status: "success",
            message: "受け取り保存しました",
            data: { id: result.lastInsertRowid, title, email, message }
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }

});

// 全データ返却API（READ_ALL）
app.get("/contacts", (req, res) => {

    // db処理（SELECT）
    try {
        const rows = db.prepare(`select * from contacts`).all();

        // レスポンス
        res.json({
            status: "success",
            message: "全データを返します",
            data: rows
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }

});


// 指定データ返却API（READ_ID）
app.get("/contacts/:id", (req, res) => {

    const { id } = req.params;

    // db処理（SELECT）
    try {
        const row = db.prepare(`select * from contacts where id = ?`).get(id);

        if (!row)
            return res.status(404).json({ status: "error", message: "指定されたデータが見つかりません。" });

        // レスポンス
        res.json({
            status: "success",
            message: "指定データを返します",
            data: row
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }

});

// 指定データ更新API（UPDATE）
app.put("/contacts/:id", (req, res) => {

    const { id } = req.params;
    const { title = "", email = "", message = "" } = req.body || {};

    // バリデーション
    if (!regex_title.test(title))
        return res.status(400).json({ status: "error", message: "titleの値が不正です。" });
    if (!regex_email.test(email))
        return res.status(400).json({ status: "error", message: "emailの値が不正です。" });
    if (!regex_message.test(message))
        return res.status(400).json({ status: "error", message: "messageの値が不正です。" });

    // db処理（UPDATE）
    try {
        const result = db.prepare(`update contacts set title = ?, email = ?, message = ? where id = ?`).run(title, email, message, id);

        if (result.changes === 0)
            return res.status(404).json({ status: "error", message: "指定されたデータが見つかりません。" });

        // レスポンス
        res.json({
            status: "success",
            message: "データを更新しました",
            data: { id: Number(id), title, email, message }
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }

});

// 指定データ削除API（DELETE）
app.delete("/contacts/:id", (req, res) => {

    const { id } = req.params;

    // db処理（DELETE）
    try {
        const result = db.prepare(`delete from contacts where id = ?`).run(id);

        if (result.changes === 0)
            return res.status(404).json({ status: "error", message: "指定されたデータが見つかりません。" });

        // レスポンス
        res.json({
            status: "success",
            message: "データを削除しました",
            data: { id: Number(id) }
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }

});


// 3333番ポートでリッスン開始（サーバスタート）
app.listen(3333, () => {
    console.log("Server start.");
});
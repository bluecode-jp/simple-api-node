import express from 'express';
import db from './db.mjs';

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

// バリデーション用の正規表現作成
const regex_title = /^.{1,10}$/;
const regex_email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const regex_message = /^.{1,20}$/;

// rootにアクセスしたときの対応実装
app.get("/", (req, res) => {
    res.send("Hello Node.js");
});

// 新規登録API
app.post("/contacts", (req, res) => {

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

// 全データ返却API
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

// 3333番ポートでリッスン開始（サーバスタート）
app.listen(3333, () => {
    console.log("Server start.");
});
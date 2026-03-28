// sqlite操作パッケージインポート
import Database from 'better-sqlite3';

// sqliteのインスタンス生成
const db = new Database("testdb");
// ロック発生しにくいモードに設定
db.pragma("journal_mode = WAL");

// db,table生成（なければ）
db.exec(`create table if not exists contacts(
            id integer primary key autoincrement,
            title text,
            email text,
            message text,
            created_at text default (datetime('now'))
    )`);

// 初期データ投入（もしなければ）
db.exec(`insert or ignore into contacts(title, email, message) values
            ('hoge','hoge@hoge.local','hogehoge')
    `);

// 外部からも利用できるようにexport
export default db;
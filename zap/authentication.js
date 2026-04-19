// OWASP ZAP - Script-Based Authentication Script
// 対象API: POST /login
// 認証方式: ID/Password → JWT (RS256) AccessToken
//
// 【スクリプトの役割】
// ZAP がスキャン前に呼び出す「ログイン処理」を定義する。
// ZAP は authenticate() の戻り値 (HttpMessage) を見て認証成否を判定し、
// 以降のスキャンリクエストに session_management.js が Bearer トークンを付与する。
//
// 【ZAP GUI での設定箇所】
//   Context → Authentication → Script-based Authentication
//     └── Script Parameters: Login URL = http://localhost:3333/login
//   Context → Users → [ユーザー追加]
//     ├── Username: (ログインID)
//     └── Password: (パスワード)
//   ※ getCredentialsParamsNames() が返すフィールドが Users 画面に表示される。
//      スクリプトを変更した場合は既存ユーザーを再作成すること。

function authenticate(helper, paramsValues, credentials) {
    // スクリプトパラメータからログインURLを取得
    var loginUrl = paramsValues.get("Login URL");

    // ZAP の Users パネルに入力された認証情報を取得
    // ※ paramsValues ではなく credentials から取得しないと null になる
    var username = credentials.getParam("Username");
    var password = credentials.getParam("Password");

    // ログインAPIのリクエストボディを組み立て
    var body = JSON.stringify({
        id:       username,
        password: password
    });

    // HTTPリクエストを構築（URI・メソッド・HTTPバージョンを指定）
    var requestUri = new org.apache.commons.httpclient.URI(loginUrl, true);
    var requestHeader = new org.parosproxy.paros.network.HttpRequestHeader(
        org.parosproxy.paros.network.HttpRequestHeader.POST,
        requestUri,
        org.parosproxy.paros.network.HttpHeader.HTTP11
    );
    requestHeader.setHeader("Content-Type", "application/json");
    requestHeader.setContentLength(body.length);

    // メッセージにヘッダーとボディをセットして送信
    var msg = helper.prepareMessage();
    msg.setRequestHeader(requestHeader);
    msg.setRequestBody(body);

    print("送信body: " + body);
    helper.sendAndReceive(msg, false);

    print("認証リクエスト送信: " + loginUrl);
    print("レスポンスコード: " + msg.getResponseHeader().getStatusCode());
    print("レスポンスbody: " + msg.getResponseBody().toString());

    // msg を ZAP に返す。ZAP はこれを使って：
    //   1. ステータスコード等で認証成否を判定する
    //   2. sessionWrapper にラップして session_management.js の extractWebSession() に渡す
    //      (スクリプト間で直接渡るのではなく ZAP が仲介する)
    return msg;
}

// ZAP GUI の「Script-based Authentication」設定画面に表示される必須パラメータ
function getRequiredParamsNames() {
    return ["Login URL"];
}

function getOptionalParamsNames() {
    return [];
}

// Users & Roles 画面の各ユーザーに入力させる認証情報フィールド
function getCredentialsParamsNames() {
    return ["Username", "Password"];
}

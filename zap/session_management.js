// OWASP ZAP - Session Management Script
// 対象API: Authorization: Bearer <accessToken>
// 認証レスポンス: { "status": "success", "accessToken": "..." }
//
// 【スクリプトの役割】
// authentication.js でログインした後の「セッション維持」を担当する。
//   1. extractWebSession()         : ログインレスポンスから accessToken を取り出して保存
//   2. processMessageToMatchSession(): スキャン中の全リクエストに Bearer トークンを付与
//   3. clearWebSessionIdentifiers() : セッションをクリア（ログアウト相当）
//
// 【ZAP GUI での設定箇所】
//   Context → Session Management → Script-based Session Management

// ログインレスポンスから accessToken を抽出してセッションに保存
// authentication.js の authenticate() が返した HttpMessage に対して ZAP が呼び出す
function extractWebSession(sessionWrapper) {
    var response = sessionWrapper.getHttpMessage().getResponseBody().toString();
    try {
        var json = JSON.parse(response);
        if (json.accessToken) {
            // セッションストアに保存。processMessageToMatchSession() で参照する
            sessionWrapper.getSession().setValue("accessToken", json.accessToken);
            print("accessToken を取得しました");
        }
    } catch (e) {
        print("レスポンスのパースに失敗しました: " + e);
    }
}

// セッション情報をクリア（ログアウト・セッション再作成時に ZAP が呼び出す）
function clearWebSessionIdentifiers(sessionWrapper) {
    sessionWrapper.getSession().setValue("accessToken", null);
    sessionWrapper.getHttpMessage().getRequestHeader().setHeader("Authorization", null);
}

// スキャン中の各リクエストに Authorization: Bearer ヘッダーを付与する
// ZAP がリクエストを送信する直前に呼び出す
function processMessageToMatchSession(sessionWrapper) {
    var token = sessionWrapper.getSession().getValue("accessToken");
    if (token) {
        sessionWrapper.getHttpMessage().getRequestHeader()
            .setHeader("Authorization", "Bearer " + token);
    }
}

function getRequiredParamsNames() {
    return [];
}

function getOptionalParamsNames() {
    return [];
}

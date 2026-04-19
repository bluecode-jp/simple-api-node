// OWASP ZAP - Session Management Script
// 対象API: Authorization: Bearer <accessToken>
// 認証レスポンス: { "status": "success", "accessToken": "..." }

// 認証レスポンスから accessToken を抽出してセッションに保存
function extractWebSession(sessionWrapper) {
    var response = sessionWrapper.getHttpMessage().getResponseBody().toString();
    try {
        var json = JSON.parse(response);
        if (json.accessToken) {
            sessionWrapper.getSession().setValue("accessToken", json.accessToken);
            print("accessToken を取得しました");
        }
    } catch (e) {
        print("レスポンスのパースに失敗しました: " + e);
    }
}

// セッション情報をクリア（ログアウト時）
function clearWebSessionIdentifiers(sessionWrapper) {
    sessionWrapper.getSession().setValue("accessToken", null);
    sessionWrapper.getHttpMessage().getRequestHeader().setHeader("Authorization", null);
}

// 各リクエストに Authorization ヘッダーを付与
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

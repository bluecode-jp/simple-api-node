// OWASP ZAP - Script-Based Authentication Script
// 対象API: POST /login
// 認証方式: ID/Password → JWT (RS256) AccessToken

function authenticate(helper, paramsValues, credentials) {
    var loginUrl = paramsValues.get("Login URL");

    var body = JSON.stringify({
        id:       credentials.getUsername(),
        password: credentials.getPassword()
    });

    var requestUri = new org.apache.commons.httpclient.URI(loginUrl, true);
    var requestHeader = new org.parosproxy.paros.network.HttpRequestHeader(
        org.parosproxy.paros.network.HttpRequestHeader.POST,
        requestUri,
        org.parosproxy.paros.network.HttpHeader.HTTP11
    );
    requestHeader.setHeader("Content-Type", "application/json");
    requestHeader.setContentLength(body.length);

    var msg = helper.prepareMessage();
    msg.setRequestHeader(requestHeader);
    msg.setRequestBody(body);

    helper.sendAndReceive(msg, false);

    print("認証リクエスト送信: " + loginUrl);
    print("レスポンスコード: " + msg.getResponseHeader().getStatusCode());

    return msg;
}

// ZAP GUI の「Script-based Authentication」設定画面に表示される必須パラメータ
function getRequiredParamsNames() {
    return ["Login URL"];
}

function getOptionalParamsNames() {
    return [];
}

function getCredentialsParamsNames() {
    return [];
}

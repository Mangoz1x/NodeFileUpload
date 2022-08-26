const mysql = require("./../../api/sql");

const pApis = {
    render: (req) => require("./render").render(req),
    delete: (req) => require("./delete").deleteApi(req),
    getCookie: (req) => require("./getCookie").getCookie(req),
    verifyUser: (userid, session) => require("./verifyUser").verifyUser(userid, session), 
    upload: (req) => require("./upload").upload(req),
    getFiles: (userid, session) => require("./getFiles").getFiles(userid, session),
    login: (body) => require("./login").login(body),
    createTwoFa: (a, b, c) => require("./createTwoFa").createTwoFa(a, b, c),
    checkTwoFa: (uuid, sess, code) => require("./checkTwoFa").checkTwoFa(uuid, sess, code),
    logout: (data) => require("./logout").logoutUser(data),
    prepareFile: (query) => require("./prepareFile").prepareFile(query),
    shareFile: (query) => require("./shareFile").shareFile(query),
    runAccMod: (userid, token, body) => require("./runAccMod").runAccMod(userid, token, body)
};

exports.checkTwoFa = async (uuid, sess, code) => {
    if (!(uuid || sess || code)) return { err: "missing-data" };

    let ver = await mysql.select("users", { userId: uuid });
    let ses = await mysql.select("sessions", { userId: uuid, token: sess });
    
    if (ver?.length == 0 || ses?.length == 0) return {err: "no-user-sess"};
    
    let nth = ver?.[ver?.length - 1];
    let code_q = await mysql.select("auth", { userId: uuid });
    let c_nth = code_q?.[code_q?.length - 1];

    if (nth?.["2fa"] == "0") return { err: "2fa-disabled" };
    if (c_nth == code) return { code: "valid" };

    return { err: "invalid-code" };
}

module.exports;
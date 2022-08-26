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

exports.runAccMod = async (userId, token, body) => {
    if (!(userId || token || body)) return { err: "missing-info" };

    let ver = await mysql.select("users", { userId: userId });
    let ses = await mysql.select("sessions", { userId: userId, token: token });
    if (ver?.length == 0 || ses?.length == 0) return { err: "acc-not-logged" };

    if (body?.updateAuth) {
        if (!(body?.updateAuth == "0" || body?.updateAuth == "1" || body?.updateAuth == 0 || body?.updateAuth == 1)) return { err: "invalid-update-value" };

        await mysql.update("users", { "2fa": body?.updateAuth }, { userId: userId });
        await mysql.delete("auth", { userId: userId });

        return {
            status: "updated",
            mod: {
                updateAuth: true,
                updateValue: body?.updateAuth
            }
        }
    }
};

module.exports;
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

exports.createTwoFa = async (q, gen, sess) => {
    let codem = Math.floor(Math.random() * 1000000);
    let nth = q?.[q?.length - 1];

    let code_q = await mysql.select("auth", { userId: nth?.userId });

    if (code_q.length > 0) return {
        authentication: true,
        codeG: code_q?.[code_q?.length - 1]?.authcode
    };
    
    if (nth?.["2fa"] == 0) return { "2fa": false };
    if (gen == true) await mysql.insert("auth", { userId: nth?.userId, "authcode": codem });

    return {
        authentication: true,
        codeG: codem
    };
};

module.exports;
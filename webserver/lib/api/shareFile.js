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

exports.shareFile = async (query) => {
    if (!(query)) return { stat: "false-intity-existance" };

    let q_res = await mysql.query("new_files", {
        fileId: query,
        publicity: "public" 
    });

    if (q_res?.length == 0) return { stat: "false-db-query" };
    return {
        userId: q_res?.[q_res?.length - 1]?.userId || q_res?.[0]?.userId,
        fileId: q_res?.[q_res?.length - 1]?.fileId || q_res?.[0]?.fileId
    }
};

module.exports;
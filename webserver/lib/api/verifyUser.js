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

exports.verifyUser = async (userid, session) => {
    if (!(userid || session)) return { err: "empty-fields" };

    let user_q = await mysql.select("users", { userid: userid });
    let sess_q = await mysql.select("sessions", { token: session });

    if (user_q?.length == 0) return { err: "no-user" };
    if (sess_q?.length == 0) return { err: "no-session" };

    return { 
        session: "active",
        data: {
            user_q: user_q,
            sess_q: sess_q
        }
    };
};

module.exports;
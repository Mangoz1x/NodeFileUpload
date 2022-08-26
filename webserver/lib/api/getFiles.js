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

exports.getFiles = async (userid, session) => {
    let response = await pApis?.verifyUser(userid, session);
    if (!(response?.session == "active")) return { err: "inactive-session" };

    let query = await mysql.select("new_files", { userid: userid });
    let foldersQ = await mysql.select("folders", { userid: userid });
    let totalSizeTakenBytes = 0;
    let totalSizeTakenMB = 0;
    let accountStorageMaxGB = 20; 

    for (let i in query) {
        totalSizeTakenBytes = (totalSizeTakenBytes + parseInt(query?.[i]?.size));
    }

    totalSizeTakenMB = totalSizeTakenBytes / 1024 / 1024;

    return {
        files: query,
        folders: foldersQ,
        totalSizeTakenBytes: totalSizeTakenBytes || 0,
        totalSizeTakenMB: totalSizeTakenMB || 0,
        accountStorageMaxGB: accountStorageMaxGB
    };
};

module.exports;
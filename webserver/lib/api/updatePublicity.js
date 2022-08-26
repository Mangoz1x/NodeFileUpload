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

exports.updatePublicity = async (req) => {
    if (!(req || req?.body || req?.body?.fileid || req?.body?.newPublicity || req?.body?.curPublicity || req?.body?.session || req?.body?.userid)) return { err: "invalid-api-call-data" };
    let ver_req = await pApis?.verifyUser(req?.body?.userid, req?.body?.session);

    if (!(ver_req?.session == "active")) return { err: "inactive_session" };
    let newPub = "";

    if (req?.body?.newPublicity == "private" || req?.body?.newPublicity == "public") {
        newPub = req?.body?.newPublicity;
    } else {
        newPub = "private";
    }

    let r_res = await mysql.update("new_files", {
        publicity: newPub 
    }, {
        fileId: req?.body?.fileid,
        userId: req?.body?.userid,
    });
    
    if (r_res?.length == 0) return { stat: "no-changes" };
    
    return {
        updated: true,
        data: r_res 
    }
};

module.exports;
const cdnServers = require("./../../cdn.json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require("form-data");

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

exports.saveDoc = async (req) => {
    if (!(req?.files?.file)) return { err: "no-file" };
    let responses = [];

    cdnServers?.forEach(async (item, i) => {  
        const form = new FormData();

        form.append('file', req?.files?.file?.data, {
            contentType: req?.files?.file?.mimetype,
            name: 'file',
            filename: req?.files?.file?.name,
        });

        form.append("userid", req?.body?.userid);
        form.append("session", req?.body?.session);
        form.append("textid", req?.body?.textid);

        let res = await fetch(`${item}/save-text`, {
            method: "POST",
            body: form,
        });

        res = await res.text();
        responses?.push({ response: res });
    });

    return responses;
};

module.exports;
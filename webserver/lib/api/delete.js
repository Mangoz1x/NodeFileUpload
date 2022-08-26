const cdnServers = require("./../../cdn.json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

exports.deleteApi = async (req) => {
    let responses = [];

    cdnServers?.forEach(async (item, i) => {  
        let res = await fetch(`${item}/delete`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(req.body)
        });

        res = await res.json();
        responses.push(res);
    });

    return responses;
};

module.exports;
const cdnServers = require("./../../cdn.json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const mysql = require("./../../api/sql");
const crypto = require("crypto");

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

exports.createFolder = async (req) => {
    if (!(req?.body?.name)) return { err: "invalid-json-data" };


    let folderIdGen = crypto.randomBytes(Math.floor(Math.random() * (128 - 58) + 58)).toString("hex");
    let dbl = await mysql.insert("folders", { 
        userId: req?.body?.userid, 
        folderId: folderIdGen,
        name: req?.body?.name  
    });
    
    return { response: dbl };
};

exports.action = async (req) => {
    if (req?.body?.createFolder) return await this.createFolder(req);

    return { err: "invalid-entry" };
};

module.exports;
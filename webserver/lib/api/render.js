const cdnServers = require("./../../cdn.json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { Readable } = require('stream');

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

exports.render = async (req) => {
    let cookie_data = {
        userId: pApis.getCookie(req)?.userId || req?.query?.userid,
        token: pApis.getCookie(req)?.token || req?.query?.token
    };

    let q = await pApis?.verifyUser(cookie_data?.userId, cookie_data?.token);
    if (!(q?.session == "active") && req?.query?.usp != "sharing") return { err: "invalid-session" };

    let send_data = {
        userid: req?.query?.usp != "sharing" ? cookie_data?.userId : "usp-sharing",
        token: req?.query?.usp != "sharing" ? cookie_data?.token : "usp-sharing",
        fileid: req?.query?.fileid,
        usp: req?.query?.usp || "none",
        renderPfp: req?.query?.renderPfp || "false"
    };
   
    let res = await fetch(`${cdnServers?.[0]}/render-api`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(send_data)
    });

    let blobRes = await res.blob();
    let arrBuff = await blobRes.arrayBuffer();
    let buffRes = Buffer.from(arrBuff);
    let blobType = blobRes?.type.split(";")?.[0];

    const readable = new Readable()
    readable._read = () => {};
    readable.push(buffRes);
    readable.push(null)

    return {
        buff: buffRes,
        type: blobType,
        userid: cookie_data?.userId,
        size: blobRes?.size,
        stream: readable
    }
};

module.exports;
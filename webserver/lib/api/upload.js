const mysql = require("./../../api/sql");
const cdnServers = require("./../../cdn.json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');  
const e = require("express");

const getFilesStorage = (userid, session) => require("./getFiles")?.getFiles(userid, session);

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

exports.upload = async (req) => {
    if (!(req?.body?.userid || req?.body?.session)) return { err: "empty-fields"};
    let userid = req?.body?.userid;
    let session = req?.body?.session;

    let verify = await pApis?.verifyUser(userid, session);
    if (!(verify?.session == "active")) return { err: "inactive_session" };

    let ogStorageQuery = await getFilesStorage(userid, session);

    let accStorageData = {
        totalSizeTakenMB: ogStorageQuery?.totalSizeTakenMB,
        accountStorageMaxGB: ogStorageQuery?.accountStorageMaxGB 
    };

    if (accStorageData?.totalSizeTakenMB / 1000 > accStorageData?.accountStorageMaxGB) {
        return { err: "acc-storage-limit-reached" };
    } else if ((accStorageData?.totalSizeTakenMB / 1000) + req?.files?.file?.size / 1024 / 1024 / 1000 > accStorageData?.accountStorageMaxGB) {
        return { err: "acc-storage-limit-reached" };
    }

    let responses = [];

    for (let i = 0; i < cdnServers?.length; i++) {
        let item = cdnServers?.[i];
        const form = new FormData();

        form.append('file', req?.files?.file?.data, {
            contentType: req?.files?.file?.mimetype,
            name: 'file',
            filename: req?.files?.file?.name,
        });

        form.append("userid", req?.body?.userid);
        form.append("session", req?.body?.session);
        form.append("ispfp", req?.body?.ispfp || "false");

        let res = await fetch(`${item}/upload`, {
            method: "POST",
            body: form,
        });

        try {
            res = await res.json() || await res.text();
        } catch (err) {
            res = await res.text();
        }

        if (res?.status == "file-uploaded") {
            await mysql.insert("new_files", {
                name: res?.name,
                mime: res?.mime,
                encoding: res?.encoding,
                userid: res?.userid,
                size: res?.size,
                fileid: res?.fileid,
                date: new Date().getTime(),
                extension: res?.extension,
                md5: res?.md5,
                publicity: "private"
            });
        }

        responses.push(res);
    }

    return responses;
};

module.exports;
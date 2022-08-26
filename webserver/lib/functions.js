// const mysql = require("./../api/sql");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// const fs = require('fs');
// const mailer = require("./../mail/mail.js")
// const cdnServers = require("./../cdn.json");
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const FormData = require('form-data');  
// const axios = require('axios');
// const { Duplex } = require("stream");
// const { Readable } = require('stream');

const pApis = {
    render: (req) => require("./api/render").render(req),
    delete: (req) => require("./api/delete").deleteApi(req),
    getCookie: (req) => require("./api/getCookie").getCookie(req),
    verifyUser: (userid, session) => require("./api/verifyUser").verifyUser(userid, session), 
    upload: (req) => require("./api/upload").upload(req),
    getFiles: (userid, session) => require("./api/getFiles").getFiles(userid, session),
    login: (body) => require("./api/login").login(body),
    googleLogin: (body) => require("./api/login").googleLogin(body),
    createTwoFa: (a, b, c) => require("./api/createTwoFa").createTwoFa(a, b, c),
    checkTwoFa: (uuid, sess, code) => require("./api/checkTwoFa").checkTwoFa(uuid, sess, code),
    logout: (data) => require("./api/logout").logoutUser(data),
    prepareFile: (query) => require("./api/prepareFile").prepareFile(query),
    shareFile: (query) => require("./api/shareFile").shareFile(query),
    runAccMod: (userid, token, body) => require("./api/runAccMod").runAccMod(userid, token, body), 
    getDoc: (req) => require("./api/getDoc").getDoc(req),
    saveDoc: (req) => require("./api/saveDoc").saveDoc(req),
    updatePublicity: (req) => require("./api/updatePublicity").updatePublicity(req),
    signup: (body) => require("./api/signup.js").signup(body),
    publicFolder: (req) => require("./api/folder.js").action(req)
};

exports.render = async (req) => await pApis?.render(req);
exports.delete = async (req) => await pApis?.delete(req);
exports.upload = async (req) => await pApis?.upload(req);

exports.getCookie = (req) => pApis?.getCookie(req);
exports.verify_user = async (userid, session) => await pApis?.verifyUser(userid, session);
exports.getFiles = async (userid, session) => await pApis?.getFiles(userid, session);

exports.login = async (body) => await pApis?.login(body);
exports.googleLogin = async (body) => await pApis?.googleLogin(body);
exports.signup = async (body) => await pApis?.signup(body);

exports.createtwofa = async (q, gen, sess) => await pApis?.createTwoFa(q, gen, sess);
exports.checktwofa = async (uuid, sess, code) => await pApis?.checkTwoFa(uuid, sess, code); 
exports.logoutUser = async (data) => await pApis?.logout(data);

exports.prepareFile = (query) => pApis?.prepareFile(query);
exports.shareFile = async (query) => await pApis?.shareFile(query);
exports.runAccMod = async (userId, token, body) => await pApis?.runAccMod(userId, token, body);

exports.getDoc = async (req) => await pApis?.getDoc(req);
exports.saveDoc = async (req) => await pApis?.saveDoc(req);
exports.updatePublicity = async (req) => await pApis?.updatePublicity(req);
exports.publicFolder = async (req) => await pApis?.publicFolder(req);

module.exports;
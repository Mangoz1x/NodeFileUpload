const cdnServers = require("./../cdn.json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { Readable } = require('stream');
const mysql = require("./../api/sql");
const FormData = require('form-data');  
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mailer = require("./../mail/mail.js")

exports.verifyUser = async (userid, session) => {
    if (!(userid || session)) return { err: "empty-fields" };

    let user_q = await mysql.select("users", { userid: userid });
    let sess_q = await mysql.select("sessions", { token: session });

    if (user_q?.length == 0) return { err: "no-user" };
    if (sess_q?.length == 0) return { err: "no-session" };

    return { session: "active" };
};

exports.getCookie = (req) => {
    let cookie = req?.headers?.cookie;
    let split_cookie = cookie?.split("; ");

    let c_obj = {};
    for (let i = 0; i < split_cookie?.length; i++) {
        let obj_push = split_cookie?.[i]?.split("=");
        if (obj_push?.length == 2) c_obj[obj_push?.[0]] = obj_push?.[1];
    } 

    return c_obj;
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

exports.getFiles = async (userid, session) => {
    let response = await this?.verifyUser(userid, session);
    if (!(response?.session == "active")) return { err: "inactive-session" };

    let query = await mysql.select("new_files", { userid: userid });

    return {
        files: query
    };
};

exports.runAccMod = async (userId, token, body) => {
    if (!(userId || token || body)) return { err: "missing-info" };

    let ver = await mysql.select("users", { userId: userId });
    let ses = await mysql.select("sessions", { userId: userId, token: token });
    if (ver?.length == 0 || ses?.length == 0) return { err: "acc-not-logged" };

    if (body?.updateAuth) {
        if (!(body?.updateAuth == "0" || body?.updateAuth == "1" || body?.updateAuth == 0 || body?.updateAuth == 1)) return { err: "invalid-update-value" };

        await mysql.update("users", { "2fa": body?.updateAuth }, { userId: userId });
        await mysql.delete("auth", { userId: userId });

        return {
            status: "updated",
            mod: {
                updateAuth: true,
                updateValue: body?.updateAuth
            }
        }
    }
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

exports.prepareFile = (query) => {
    if (query?.q == "VClip" && query?.plat == "win32") {
        return `./dl/win32/VClip.zip`;
    } else {
        return `unknown`;
    }
};

exports.logoutUser = async (data) => {
    await mysql.delete("sessions", { token: data?.token, userId: data?.userId });
};

exports.checkTwoFa = async (uuid, sess, code) => {
    if (!(uuid || sess || code)) return { err: "missing-data" };

    let ver = await mysql.select("users", { userId: uuid });
    let ses = await mysql.select("sessions", { userId: uuid, token: sess });
    
    if (ver?.length == 0 || ses?.length == 0) return {err: "no-user-sess"};
    
    let nth = ver?.[ver?.length - 1];
    let code_q = await mysql.select("auth", { userId: uuid });
    let c_nth = code_q?.[code_q?.length - 1];

    if (nth?.["2fa"] == "0") return { err: "2fa-disabled" };
    if (c_nth == code) return { code: "valid" };

    return { err: "invalid-code" };
}

exports.createTwoFa = async (q, gen, sess) => {
    let codem = Math.floor(Math.random() * 1000000);
    let nth = q?.[q?.length - 1];

    let code_q = await mysql.select("auth", { userId: nth?.userId });

    if (code_q.length > 0) return {
        authentication: true,
        codeG: code_q?.[code_q?.length - 1]?.authcode
    };
    
    if (nth?.["2fa"] == 0) return { "2fa": false };
    if (gen == true) await mysql.insert("auth", { userId: nth?.userId, "authcode": codem });

    return {
        authentication: true,
        codeG: codem
    };
};

exports.login = async (body) => {
    if (body?.checkAuthStatus) {
        let user_q = await mysql.select("users", { username: body?.username });
        if (user_q?.length == 0) return { err: "no-user" };
        return { status: user_q[user_q?.length - 1]?.["2fa"] };
    }

    if (body?.checkUsername) {
        let user_q = await mysql.select("users", { username: body?.username });
        if (user_q.length == 0) return { err: "no-user" };
        return { err: "none" };
    }

    if (!(body?.username || body?.password)) return { err: "missing-info" };

    let user_q = await mysql.select("users", { username: body?.username });
    if (user_q.length == 0) return { err: "no-user" };
    if (!(bcrypt.compareSync(body?.password, user_q?.[user_q.length - 1]?.password))) return { err: "no-user" };

    let nth = user_q?.[user_q?.length - 1];
    let sess_q = await mysql.select("sessions", { userId: nth?.userId });
    let token = crypto.randomBytes(Math.floor(Math.random() * (128 - 58) + 58)).toString("hex");

    if (body?.checkAuth == "true") return { auth: nth?.["2fa"] };
    if (nth?.["2fa"] == "0") {
        if (sess_q?.length > 0) return {
            token: sess_q?.[sess_q?.length - 1]?.token,
            userid: nth?.userId,
            email: nth?.mail,
            publicid: nth?.publicId,
            privateid: nth?.privateId,
            username: nth?.username,
            birthdate: nth?.birthday,
            name: nth?.fullName,
            accId: nth?.id,
            created: nth?.created 
        };

        await mysql.insert("sessions", {
            token: token,
            userId: nth?.userId 
        });

        return {
            token: token,
            userid: nth?.userId,
            email: nth?.mail,
            publicid: nth?.publicId,
            privateid: nth?.privateId,
            username: nth?.username,
            birthdate: nth?.birthday,
            name: nth?.fullName,
            accId: nth?.id,
            created: nth?.created 
        };
    }

    let sessortok = sess_q?.length == 0 ? token : "none";
    let verify = await this?.createTwoFa(user_q, true, sessortok);
    let code = verify?.codeG;
    
    if (body?.send == "send") {
        mailer.mail(nth?.mail, "2FA CODE", `
            ${code}
        `);

        return { stat: "email-sent" };
    }

    if (body?.code && !(code == body?.code)) {
        return { err: "invalid-code" };
    }

    if (!(body?.code)) return { err: "no-code" };

    if (sess_q?.length > 0) {
        await mysql.delete("auth", { userId: nth?.userId });

        return {
            token: sess_q?.[sess_q?.length - 1]?.token,
            userid: nth?.userId,
            email: nth?.mail,
            publicid: nth?.publicId,
            privateid: nth?.privateId,
            username: nth?.username,
            important_key: code,
            birthdate: nth?.birthday,
            name: nth?.fullName,
            accId: nth?.id,
            created: nth?.created 
        };
    };

    await mysql.insert("sessions", {
        token: token,
        userId: nth?.userId 
    });

    await mysql.delete("auth", { userId: nth?.userId });

    return {
        token: token,
        userid: nth?.userId,
        email: nth?.mail,
        publicid: nth?.publicId,
        privateid: nth?.privateId,
        important_key: code,
        username: nth?.username,
        birthdate: nth?.birthday,
        name: nth?.fullName,
        accId: nth?.id,
        created: nth?.created 
    };
};

exports.upload = async (req) => {
    if (!(req?.body?.userid || req?.body?.session)) return { err: "empty-fields"};
    let userid = req?.body?.userid;
    let session = req?.body?.session;

    let verify = await this?.verifyUser(userid, session);
    if (!(verify?.session == "active")) return { err: "inactive_session" };

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

        console.log(res)

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
    });

    return responses;
};

exports.render = async (req) => {
    let cookie_data = {
        userId: this.getCookie(req)?.userId || req?.query?.userid,
        token: this.getCookie(req)?.token || req?.query?.token
    };

    let q = await this.verifyUser(cookie_data?.userId, cookie_data?.token);
    if (!(q?.session == "active")) return { err: "invalid-session" };

    let send_data = {
        userid: cookie_data?.userId,
        token: cookie_data?.token,
        fileid: req?.query?.fileid,
        usp: req?.query?.usp || "none",
        renderPfp: req?.query?.renderPfp || "false"
    };
   
    let res = await fetch(`${cdnServers[0]}/render-api`, {
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
const mysql = require("./../../api/sql");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mailer = require("./../../mail/mail.js")

const CLIENT_ID = "198499681155-691p76be8kc5r79vtbrtnib70f68joo8.apps.googleusercontent.com";

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

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

const loginGoogleUser = (userid) => require("./google-login-js/loginGoogleUser").loginGoogleUser(userid); 
const signUpGoogleUser = (userid, email, email_verified, pictureUrl, name, username) => require("./google-login-js/signUpGoogleUser").signUpGoogleUser(userid, email, email_verified, pictureUrl, name, username);

exports.googleLogin = async (body) => {
    let id_token = body?.credential;
    if (!id_token) return { err: "missing-token-id" };

    let ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID
    }).catch(err => { return { error: err } });

    if (ticket?.error) return { jwtTicketErr: ticket?.error };

    const payload = ticket?.getPayload();
    const userid = payload?.["sub"];
    const email = payload?.["email"];
    const email_verified = payload?.["email_verified"];
    const pictureUrl = payload?.["picture"];
    const name = payload?.["name"];
    const username = payload?.["name"];

    if (!(userid || email || email_verified || pictureUrl || name || username ))
        return { err: "google-api-data-invalid__TYPE=internal-server-err__client_err=false" };

    let checkUserExistance = await mysql.select("users", {
        userId: userid,
        mail: email,
    });

    if (checkUserExistance?.length > 0) {
        return await loginGoogleUser(userid);
    } else {
        return await signUpGoogleUser(userid, email, email_verified, pictureUrl, name, username);
    }
};

exports.login = async (body) => {
    if (body?.checkAuthStatus) {
        let user_q = await mysql.select("users", { mail: body?.mail });
        if (user_q?.length == 0) return { err: "no-user" };
        return { status: user_q[user_q?.length - 1]?.["2fa"] };
    }

    if (body?.checkUsername) {
        let user_q = await mysql.select("users", { mail: body?.mail });
        if (user_q.length == 0) return { err: "no-user" };
        return { err: "none" };
    }

    if (!(body?.username || body?.password)) return { err: "missing-info" };

    let user_q = await mysql.select("users", { mail: body?.mail });
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
    let verify = await pApis?.createTwoFa(user_q, true, sessortok);
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

module.exports;
const mysql = require("./../../api/sql");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mailer = require("./../../mail/mail.js")

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

exports.signup = async (body) => {
    // password, username, userId, privateId, publicId, fullName, mail, verified (FOR GOOGLE ALWAYS TRUE), verification, birthday, created, 2fa, 2faCode
    if (body?.authType && body?.authType !== "google") return { err: "invalid-auth_type" };
    
    let password = body?.password;
    let username = body?.username;
    let fullName = body?.fullName;
    let mail = body?.mail;
    let verified = body?.authType || "false";
    let verification = body?.authType || "0";
    let birthday = body?.birthday;
    let tfa = "0";
    let tfaCode = "";
    
    if (!(password || username || fullName || mail || birthday)) 
        return { err: "missing-fields" };
    
    let hpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
    
    if (username?.length > 512 || password?.length > 512) 
        return { err: "invalid-char-length" };
    
    if (password?.length < 7)
        return { err: "invalid-pwd-length" };
    
    if (!password?.trim()) 
        return { err: "invalid-pwd" };

    if ((username?.replace(/^[a-zA-Z0-9_]*$/g, "") != "" || !(username?.length > 2 || username?.length < 30))) 
        return { err: "username-invalid" };  
    
    if (mail?.length < 3 || mail?.length > 512)
        return { err: "invalid-email" };

    if (!mailer?.testEmail(mail)) 
        return { err: "mail-invalid-chars" };

    if (fullName?.length < 2 || fullName.length > 512) 
        return { err: "name-length-invalid" };
        
    let nBirthday = new Date(birthday);
    let today = new Date();
    let age = today.getFullYear() - nBirthday.getFullYear();
    let m = today.getMonth() - nBirthday.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < nBirthday.getDate())) {
        age--;
    }

    if (age < 13) return { err: "invalid-age" };

    let userId = crypto.randomBytes(Math.floor(Math.random() * (128 - 58) + 58)).toString("hex");
    let privateId = crypto.randomBytes(Math.floor(Math.random() * (58 - 25) + 25)).toString("hex");
    let publicId = crypto.randomBytes(Math.floor(Math.random() * (58 - 25) + 25)).toString("hex");
    let session = crypto.randomBytes(Math.floor(Math.random() * (368 - 224) + 224)).toString("hex");
    let created = Date.now();

    let accCheck = await mysql.select("users", {
        mail: mail
    });

    if (accCheck?.length > 0) return { err: "email-in-use" };

    // AFTER CHECKS
    await mysql.insert("sessions", {
        token: session,
        userId: userId
    }).catch(error => { throw error; });

    await mysql.insert("users", {
        password: hpassword,
        fullName: fullName,
        username: username,
        userId: userId,
        privateId: privateId,
        publicId: publicId,
        mail: mail,
        verified: verified,
        verification: verification,
        birthday: nBirthday.getTime(),
        created: created,
        "2fa": tfa
    }).catch(error => { throw error; });

    return {
        token: session,
        userid: userId,
        email: mail,
        publicid: publicId,
        privateid: privateId,
        username: username,
        birthdate: birthday,
        name: fullName,
        accId: "new_acc",
        created: created,
        createdAcc: true
    };
};

module.exports;
const mysql = require("./../../../api/sql");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

exports.signUpGoogleUser = async (userid, email, email_verified, pictureUrl, name, username) => {
    let privateId = crypto.randomBytes(Math.floor(Math.random() * (58 - 25) + 25)).toString("hex");
    let publicId = crypto.randomBytes(Math.floor(Math.random() * (58 - 25) + 25)).toString("hex");
    let session = crypto.randomBytes(Math.floor(Math.random() * (368 - 224) + 224)).toString("hex");
    let created = Date.now();

    let passKey = userid + session + created;
    let hpassword = bcrypt.hashSync(passKey, bcrypt.genSaltSync(12));

    let emailExists = await mysql.select("users", {
        mail: email 
    });

    if (emailExists?.length > 0) return { err: "email-in-use" };

    await mysql.insert("users", {
        password: hpassword,
        username: username,
        fullName: name,
        userId: userid,
        privateId: privateId,
        publicId: publicId,
        mail: email,
        verified: email_verified,
        verification: "0",
        birthday: "private",
        created: created,
        "2fa": "0",
        googleAcc: "true",
        pfpImgSrc: pictureUrl
    });

    await mysql.insert("sessions", {
        token: session,
        userId: userid
    }).catch(error => { throw error; });

    return {
        accCreated: true,
        token: session,
        userid: userid,
        email: email,
        publicid: publicId,
        privateid: privateId,
        username: username,
        birthdate: "private",
        name: name,
        accId: "new_google_signin",
        created: created,
        
        data: {
            username: username,
            fullName: name,
            userId: userid,
            privateId: privateId,
            publicId: publicId,
            mail: email,
            verified: email_verified,
            verification: "0",
            birthday: "private",
            created: created,
            "2fa": "0",
            googleAcc: "true",
            pfpImgSrc: pictureUrl
        }
    }
};  

module.exports;
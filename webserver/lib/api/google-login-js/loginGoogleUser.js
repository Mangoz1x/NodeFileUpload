const mysql = require("./../../../api/sql");
const crypto = require("crypto");

exports.loginGoogleUser = async (userid) => {
    const userId = userid;
    const uriToken = crypto.randomBytes(Math.floor(Math.random() * (128 - 58) + 58)).toString("hex");

    await mysql.insert("sessions", {
        userId: userid,
        token: uriToken
    }); 

    let accResponse = await mysql.select("users", {
        userId: userid 
    });

    let nth = accResponse?.[accResponse?.length - 1];
    
    return {
        token: uriToken,
        userid: userId,
        email: nth?.mail,
        publicid: nth?.publicId,
        privateid: nth?.privateId,
        username: nth?.username,
        birthdate: nth?.birthday,
        name: nth?.fullName,
        accId: nth?.id,
        created: nth?.created 
    };
};  

module.exports;
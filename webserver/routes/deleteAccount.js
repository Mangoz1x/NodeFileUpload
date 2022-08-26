const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const func = require("./../lib/functions");
const bcrypt = require("bcrypt");
const mysql = require("./../api/sql");
const mailer = require("./../mail/mail");
const app = express();
dotenv.config({ path: './../.env' });

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.json());
app.options('*', cors())
app.set('view engine', 'hbs');

app.post("/delete-account", async (req, res) => {
    let b = req?.body;
    if (!(b?.uuid || b?.token)) return res.send({"err": "missing-info"});
    
    let uuid = b?.uuid;
    let tok = b?.token;
    
    let q = await func.verify_user(uuid, tok);
    if (!(q?.session == "active")) return res.send({"err": "session-inactive"});
    if (b?.sendMail) {
        let code = (Math.random() + 1).toString(36).substring(7);
        await mysql.insert("account_del_codes", { userId: uuid, code: code });

        mailer.mail(q?.data?.user_q?.[q?.data?.user_q?.length - 1]?.mail, "Account deletion request", code);
        return;
    }

    let pwd = b?.pwd;

    let result = await mysql.select("account_del_codes", { userId: uuid });
    if (result?.[result?.length - 1]?.code != pwd) return res.send({"err": "invalid-pwd"});  

    await mysql.delete("users", { userId: uuid });
    await mysql.delete("auth", { userId: uuid });
    await mysql.delete("folders", { userId: uuid });
    await mysql.delete("new_files", { userid: uuid });
    await mysql.delete("sessions", { userId: uuid });
    await mysql.delete("user_account_files", { userId: uuid });
    await mysql.delete("account_del_codes", { userId: uuid });

    res.clearCookie("code");
    res.clearCookie("email");
    res.clearCookie("privateId");
    res.clearCookie("publicId");
    res.clearCookie("token");
    res.clearCookie("userId");
    res.clearCookie("username");
    res.clearCookie("name");
    res.clearCookie("birthdate");
    res.clearCookie("created");

    res.send({"response": "deleted"});
});

module.exports = app;
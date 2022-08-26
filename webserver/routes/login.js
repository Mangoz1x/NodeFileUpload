const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const func = require("./../lib/functions");

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

app.post("/login", cors(), async (req, res) => {
    let result = { err: "unknown" };
    
    if (!(req?.body?.googleLogin || req?.query?.googleLogin)) {
        result = await func.login(req?.body);
    } else {
        result = await func.googleLogin(req?.body);

        res.cookie("token", result?.token);
        res.cookie("email", result?.email);
        res.cookie("privateId", result?.privateid);
        res.cookie("publicId", result?.publicid);
        res.cookie("userId", result?.userid);
        res.cookie("code", "");
        res.cookie("username", result?.username);
        res.cookie("name", result?.name);
        res.cookie("birthdate", result?.birthdate);
        res.cookie("created", result?.created);
        res.cookie("usedGoogleAuth", true);

        return res.redirect("/");;
    }

    res.send(result);
});

module.exports = app;
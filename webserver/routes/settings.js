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

app.get("/settings", async (req, res) => {
    let cookie_data = func.getCookie(req);
    let q = await func.verify_user(cookie_data?.userId, cookie_data?.token);

    if (!(q?.session == "active")) return res.render("login");

    if (q?.data?.user_q?.[q?.data?.user_q?.length - 1]?.googleAcc == "true") {
        res.render("settings", {
            pfpSrc: q?.data?.user_q?.[q?.data?.user_q?.length - 1]?.pfpImgSrc,
            username: q?.data?.user_q?.[q?.data?.user_q?.length - 1]?.username
        });
    } else {
        res.render("settings", {
            username: q?.data?.user_q?.[q?.data?.user_q?.length - 1]?.username
        });
    }
});

module.exports = app;
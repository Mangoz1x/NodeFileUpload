const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const func = require("./../lib/functions");
const mysql = require("./../api/sql");

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

app.get("/admin", async (req, res) => {
    let cookie_data = func.getCookie(req);
    let q = await func.verify_user(cookie_data?.userId, cookie_data?.token);

    if (!(q?.session == "active")) return res.render("login");
    let account_info = q?.data?.user_q?.[0];
    if (account_info?.authority !== "owner") return res.redirect("/");

    let allUsers = await mysql.select("users", { authority: "" });

    res.render("admin", {
        users: JSON.stringify(allUsers)
    });
});

module.exports = app;
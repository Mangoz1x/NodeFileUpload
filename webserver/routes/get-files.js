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

app.post("/get-files", cors(), async (req, res) => {
    if (!(req?.body?.userid || req?.body?.session)) return res.send({ err: "missing-data" });

    let user_ver = await func.verify_user(req?.body?.userid, req?.body?.session);
    if (!(user_ver?.session == "active")) return res.send({ err: "inactive-session" });

    let userfiles = await func.getFiles(req?.body?.userid, req?.body?.session);
    res.send(userfiles);
});

module.exports = app;
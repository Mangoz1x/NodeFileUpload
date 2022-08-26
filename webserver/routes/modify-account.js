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

app.post("/modify-account", cors(), async (req, res) => {
    if (!(req?.body)) return res.send({ err: "no-body" });
    if (!(req?.body?.userId || req?.body?.token)) return res.send({ err: "missing-acc-info" });

    let result = await func.runAccMod(req?.body?.userId, req?.body?.token, req?.body);
    res.send(result);
});

module.exports = app;
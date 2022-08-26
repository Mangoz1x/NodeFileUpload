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

app.post("/upload", cors(), async (req, res) => {
    let responses = await func.upload(req);
    res.send(responses);
});

module.exports = app;
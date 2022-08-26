const express = require("express");
const file_upload = require("express-fileupload");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const func = require("./../lib/functions");

const app = express();
dotenv.config({ path: './.env' });

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.json());
app.options('*', cors())
app.set('view engine', 'hbs');

app.use(file_upload({
    limits: {
        fileSize: 1024 * 1024 * 1000 // 1 GB
    },
    abortOnLimit: true,
}));

app.post("/delete", cors(), async (req, res) => {
    let responses = await func.delete(req);
    res.send(responses);
});

module.exports = app;
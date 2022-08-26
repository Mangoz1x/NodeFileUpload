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

app.get("/share/:fileId", async (req, res) => {
    let q = await mysql.select("new_files", { 
        fileid: req?.params?.fileId 
    });

    if (q?.length == 0) return res.render("share", { err: `query-length=${q?.length}` });
    if (!q?.[q?.length - 1]) return res.render("share", { err: `query-length=${q?.length}` });
    if (q?.[q?.length - 1]?.publicity == "private") return res.render("share", { err: `file-private=true` });

    q = q?.[q?.length - 1];

    let data = {
        id: q?.id,
        name: q?.name,
        mime: q?.mime,
        encoding: q?.encoding,
        fileid: q?.fileid,
        extension: q?.extension,
    };

    res.render("share", {
        fileId: req?.params?.fileId,
        query: data
    });
});

module.exports = app;
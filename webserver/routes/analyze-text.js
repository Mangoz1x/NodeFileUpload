const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const func = require("./../lib/functions");
const analyzer = require("./../lib/text-analyzer");

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

app.post("/analyze-text", cors(), async (req, res) => {
    if (!req?.files && !(req?.body?.sType)) return res.status(400).send({ err: "no-file" });
    const userid = req?.body?.userid;
    const session = req?.body?.session;
    const textfile = req?.files?.file;
    const textid = req?.body?.textid;
    const type = req?.body?.sType;
    const comment = req?.body?.comment;
    const useAdvancedSearch = req?.body?.advancedSearch || false;

    let test_user = await func.verify_user(userid, session);
    if (!(test_user?.session == "active")) return res.send({ err: "invalid-user-data" });

    let result;

    if (type && type == "getComments") {
        result = await analyzer.comments(userid, session, textid);
    } else if (type && type == "advancedSearch" && useAdvancedSearch && !(useAdvancedSearch == false)) {
        result = await analyzer.advancedSearch(useAdvancedSearch);
    } else if (type && type == "delComment") {
        result = await analyzer.delComment(comment, userid, session, textid);
    } else if (type && type == "setComment" && comment) {
        result = await analyzer.setComment(comment, userid, session, textid);
    } else { 
        result = await analyzer.analyze(textfile, userid, session, textid);
    }
    
    res.send({ 
        result
    });
});

module.exports = app;
const express = require('express');
const file_upload = require("express-fileupload");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const mysql = require("./api/sql");
const fs = require('fs');
const func = require("./functions");

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
        fileSize: 1024 * 1024 * 2000 // 2 GB
    },
    abortOnLimit: true,
}));

app.post("/upload", cors(), async (req, res) => {
    if (!req?.files) return res.status(400).send({ err: "no-file" });
    const file = req?.files?.file;
    const name = file?.name;
    const data = file?.data;
    const size = file?.size;
    const mime = file?.mimetype;
    const encoding = file?.encoding;
    const md5 = file?.md5;
    const userid = req?.body?.userid;
    const session = req?.body?.session;
    const ispfp = req?.body?.ispfp || false;
    
    let test_user = await func.verify_user(userid, session);
    if (!(test_user?.session == "active")) return res.end("invalid-user-data");

    let upl = await func.upload(file, name, data, size, mime, encoding, md5, userid, session, ispfp);
    return res.send(upl);
});

app.post("/get-doc", cors(), async (req, res) => {
    const userid = req?.body?.userid;
    const session = req?.body?.session;
    const textid = req?.body?.textid;

    if (!(userid || session || textid)) return res.status(400).send({ err: "missing-data" });

    let test_user = await func.verify_user(userid, session);
    if (!(test_user?.session == "active")) return res.end("invalid-user-data");

    let save = await func.getText(userid, textid);
    if (save?.err) return res.end("no-results");

    if (!(fs.existsSync(`./uploads/${userid}/${save?.[save?.length - 1]?.fileid}.${save?.[save?.length - 1]?.extension || "txt"}`))) {
        return res.send({ err: "file-exist-false" });
    }
    
    res.sendFile(`uploads/${userid}/${save?.[save?.length - 1]?.fileid}.${save?.[save?.length - 1]?.extension}`, { root: __dirname })
});

app.post("/save-text", cors(), async (req, res) => {
    if (!req?.files) return res.status(400).send({ err: "no-file" });
    const userid = req?.body?.userid;
    const session = req?.body?.session;
    const textfile = req?.files?.file;
    const textid = req?.body?.textid;
    
    let test_user = await func.verify_user(userid, session);
    if (!(test_user?.session == "active")) return res.end("invalid-user-data");

    let save = await func.saveText(textfile, userid, session, textid);
    res.end(save)
});

app.post("/delete", cors(), async (req, res) => {
    if (!req?.body?.fileid) return res.send({ err: "missing-info" });

    let cookie_data = {
        userId: req?.body?.userid || "none",
        token: req?.body?.session || "none"
    };

    let q = await func.verify_user(cookie_data?.userId, cookie_data?.token);
    if (!(q?.session == "active")) return res.send({ err: "invalid-session" });

    let file_arr = req?.body?.fileid;
    let ext_arr = req?.body?.ext;
    file_arr = file_arr.split(",");
    ext_arr = ext_arr.split(",");

    let delete_multiple = await func.deleteMultiple(cookie_data?.userId, file_arr, ext_arr);
    return res.send(delete_multiple);
});

app.post("/render-api", cors(), async (req, res) => {
    if (!(req?.body?.fileid) && !(req?.body?.renderPfp || req?.body?.renderPfp == "true")) return res.send({ err: "no-fileid" });
    if (!(req?.body?.userid)) return res.send({ err: "userid-missing" });

    if (req?.body?.usp == "sharing") {
        let check_file_stat = await func.shareFile(req?.body?.fileid);
        if (!(check_file_stat?.stat == "public")) return res.send("file_private");    

        if (!(fs.existsSync(`./uploads/${check_file_stat?.bigQuery?.userid}/${check_file_stat?.bigQuery?.fileid}.${check_file_stat?.bigQuery?.extension}`))) return res.send({ err: "file-does-not-exist" });
        return res.sendFile(`uploads/${check_file_stat?.bigQuery?.userid}/${check_file_stat?.bigQuery?.fileid}.${check_file_stat?.bigQuery?.extension}`, { root: __dirname });
    }

    let cookie_data = {
        userId: req?.body?.userid,
        token: req?.body?.token
    };

    if (req?.body?.renderPfp == "true") {
        let uuid_q = await mysql.select("users", { userId: cookie_data?.userId });
        if (uuid_q?.length == 0) return res.send({ err: "no-user" });
        if (!(fs.existsSync(`${__dirname}/profile-uploads/${cookie_data?.userId}/pfp.png`))) {
            return res.sendFile(`profile-uploads/default/pfp.png`, { root: __dirname });
        }
        
        if (!(fs.existsSync(`${__dirname}/profile-uploads/${cookie_data?.userId}`))) return res.send({ err: "no-pfp-folder" });
        return res.sendFile(`profile-uploads/${cookie_data?.userId}/pfp.png`, { root: __dirname });
    } 

    let q = await func.verify_user(cookie_data?.userId, cookie_data?.token);
    if (!(q?.session == "active")) return res.send({ err: "invalid-session" });

    let file_q = await mysql.select("new_files", { userid: cookie_data?.userId, fileid: req?.body?.fileid });
    if (file_q.length == 0) return res.send({ err: "file-cannot-be-found-db" });
    let nth = file_q[file_q.length - 1];

    if (!(fs.existsSync(`./uploads/${cookie_data?.userId}/${req?.body?.fileid}.${nth?.extension}`))) return res.send({ err: "file-does-not-exist" });

    res.sendFile(`uploads/${cookie_data?.userId}/${req?.body?.fileid}.${nth?.extension}`, { root: __dirname });
});

app.listen(8000);

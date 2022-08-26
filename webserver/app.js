const express = require('express');

const file_upload = require("express-fileupload");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const https = require("https");
const fs = require("fs")

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

const deleteRoute = require("./routes/delete");
const uploadRoute = require("./routes/upload");
const getDocRoute = require("./routes/get-doc");
const saveDocRoute = require("./routes/save-text");
const renderRoute = require("./routes/render");
const renderApiRoute = require("./routes/render-api");
const loginRoute = require("./routes/login");
const modifyAccountRoute = require("./routes/modify-account");
const getFilesRoute = require("./routes/get-files");
const analyzeTextRoute = require("./routes/analyze-text");
const logoutRoute = require("./routes/logout");
const indexRoute = require("./routes/index")
const editRoute = require("./routes/edit");
const loginRenderRoute = require("./routes/login-render");
const settingsRoute = require("./routes/settings");
const dlGuiRoute = require("./routes/dl-gui");
const dlRoute = require("./routes/dl");
const shareRoute = require("./routes/share");
const updatePublicityRoute = require("./routes/update-publicity");
const signupRoute = require("./routes/signup");
const signupGuiRoute = require("./routes/signupGui");
const folderRoute = require("./routes/folder");
const adminRoute = require("./routes/admin");
const deleteAccountRoute = require("./routes/deleteAccount");

app.post("/delete", cors(), deleteRoute);
app.post("/upload", cors(), uploadRoute);
app.post("/get-doc", cors(), getDocRoute);
app.post("/save-text", cors(), saveDocRoute);
app.post("/login", cors(), loginRoute);
app.post("/signup", cors(), signupRoute);
app.post("/modify-account", cors(), modifyAccountRoute);
app.post("/get-files", cors(), getFilesRoute);
app.post("/analyze-text", cors(), analyzeTextRoute);
app.post("/update-publicity", cors(), updatePublicityRoute);
app.post("/folder", cors(), folderRoute);
app.post("/delete-account", deleteAccountRoute);
app.get("/render", cors(), renderRoute);
app.get("/render-api", cors(), renderApiRoute);
app.get("/logout", logoutRoute);
app.get("/", indexRoute);
app.get("/edit", editRoute);
app.get("/login", loginRenderRoute);
app.get("/signup", signupGuiRoute);
app.get("/settings", settingsRoute);
app.get("/dl-gui", dlGuiRoute);
app.get("/dl", dlRoute);
app.get("/share/:fileId", shareRoute);

app.use((error, req, res, next) => {
    res.send({ err: error });
})

app.get("*", (req, res) => {
    res.status(404).render("err/404.hbs", { 
        err: "404",
        pref: "Not found" 
    });
});

let options = {
    key: fs.readFileSync('./cert/privkey.pem', 'utf8'),
    cert: fs.readFileSync('./cert/cert.pem', 'utf8'),
};

https.createServer(options, app).listen(443, function(){
    console.log("Express server listening on port " + 443);
});

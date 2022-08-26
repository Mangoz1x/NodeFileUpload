const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const path = require('path');
const func = require("./../lib/functions");
const StreamRange = require("range-stream");

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

app.get("/render-api", cors(), async (req, res) => {
    try {
        const range = req?.headers?.["range"] || "bytes=0-";

        if (!range) {
            return res.status(400).send({ err: "Requires range header"});
        }

        let responses = await func.render(req);

        let CHUNK_SIZE = 10 ** 6;
        let start = Number(range.replace(/\D/g, ""));
        let end = Math.min(start + CHUNK_SIZE, responses?.size - 1); 
        let ST = responses?.type;

        if (ST?.includes("video") || ST?.includes("audio")) {
            res.setHeader("Content-Range", `bytes ${start}-${(end - 1)}/${responses?.size}`);
            res.setHeader("Accept-Ranges", "bytes")
            res.setHeader("Content-Length", end - start + 1);
            res.setHeader("Content-Type", responses?.type);
            res.status(206);
    
            return responses?.stream?.pipe(StreamRange(start, end)).pipe(res);
        } 

        if (responses?.err) return res.send(responses);

        res.setHeader("Content-Type", responses?.type || "image/png");
        responses?.stream?.pipe(res);
    } catch (err) {
        console.log(err)
    }
});

module.exports = app;
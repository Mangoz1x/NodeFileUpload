const mysql = require("./api/sql");
const crypto = require("crypto");
const fs = require('fs');

exports.shareFile = async (fileid) => {
    let q = await mysql.select("new_files", {
        fileId: fileid,
        publicity: "public"
    });

    console.log(q?.[0])

    return {
        stat: q?.[0]?.publicity,
        bigQuery: q?.[0]
    };
};

exports.getCookie = (req) => {
    let cookie = req?.headers?.cookie;
    let split_cookie = cookie?.split("; ");

    let c_obj = {};
    for (let i = 0; i < split_cookie?.length; i++) {
        let obj_push = split_cookie?.[i]?.split("=");
        if (obj_push?.length == 2) c_obj[obj_push?.[0]] = obj_push?.[1];
    } 

    return c_obj;
};

exports.verify_user = async (userid, session) => {
    if (!(userid || session)) return { err: "empty-fields" };

    let user_q = await mysql.select("users", { userid: userid });
    let sess_q = await mysql.select("sessions", { token: session });

    if (user_q?.length == 0) return { err: "no-user" };
    if (sess_q?.length == 0) return { err: "no-session" };

    return { session: "active" };
};

exports.deleteMultiple = async (userid, del_files, ext) => {
    for (let i = 0; i < del_files?.length; i++) {
        await mysql.delete("new_files", { userId: userid, fileId: del_files?.[i] });

        let comb = `${del_files?.[i]}.${ext}`;
        if (fs.existsSync(`./uploads/${userid}/${comb}`)) fs.unlinkSync(`./uploads/${userid}/${comb}`);
    }

    return { deleted: del_files?.length };
};

exports.upload = async (file, name, data, size, mime, encoding, md5, userid, session, ispfp) => {
    if (!(file || name || data || size || mime || encoding || md5 || userid || session)) return { err: "empty-fields"};

    let verify = await this.verify_user(userid, session);
    if (!(verify?.session == "active")) return { err: "inactive_session" };

    if (ispfp && ispfp != false && ispfp != "false") {
        const extension = name.split(".").pop();
        const path = `./profile-uploads/${userid}/pfp.png`;
        const allowedExt = ["png", "jpg", "jpeg", "gif", "heiv"];

        allowedExt?.forEach((item, i) => {
            if (extension?.toLowerCase() != allowedExt?.[i]) 
                return { err: "invalid-extension" };
        });

        if ((size / 1024 / 1024) > 10) return { err: "file-size-to-large" };
        if (!fs.existsSync(`./profile-uploads/${userid}`)) fs.mkdirSync(`./profile-uploads/${userid}`);

        file.mv(path, (err) => {
            if (err) return err;
        });

        return {
            status: "pfp-saved"
        };
    }

    const extension = name.split(".").pop();
    const new_name = ((new Date().getTime()).toString(36)) + Math.floor(new Date().valueOf() * Math.random());
    const path = `./uploads/${userid}/${new_name}.${extension}`;
    let upl_data = {};

    if (!fs.existsSync(`./uploads/${userid}`)) fs.mkdirSync(`./uploads/${userid}`);

    file.mv(path, (err) => {
        if (err) return err;

        upl_data.err = false;
        upl_data.path = false;
    });

    return {
        status: "file-uploaded",
        fileid: new_name,
        name: name,
        mime: mime,
        encoding: encoding,
        userid: userid,
        size: size,
        extension: extension,
        md5: md5
    };
};

exports.getText = async (userid, textid) => {
    if (!(userid || textid)) return { err: "empty-fields"};

    let exist_q = await mysql.select("new_files", {
        userId: userid,
        fileId: textid
    });

    if (exist_q?.length >= 1) {
        return exist_q;
    } else {
        return { err: "no-file" };
    }
};

exports.saveText = async (file, userid, session, textid) => {
    if (!(file || userid || session || textid)) return { err: "empty-fields"};

    let name = file?.name;
    let mime = file?.mimetype || "err";
    let encoding = file?.encoding;
    let size = file?.size;
    let md5 = file?.md5;

    let exist_q = await mysql.select("new_files", {
        userId: userid,
        fileId: textid
    });

    if (exist_q.length > 0) {
        const extension = name.split(".").pop();
        const path = `./uploads/${userid}/${textid}.${extension}`;

        file.mv(path, (err) => {
            if (err) return err;
        });

        return "saved";
    };

    const extension = name.split(".").pop();
    const path = `./uploads/${userid}/${textid}.${extension}`;
    let upl_data = {};

    if (!fs.existsSync(`./uploads/${userid}`)) fs.mkdirSync(`./uploads/${userid}`);

    file.mv(path, (err) => {
        if (err) return err;

        upl_data.err = false;
        upl_data.path = false;
    });

    await mysql.insert("new_files", {
        name: name,
        mime: mime,
        encoding: encoding,
        userid: userid,
        size: size,
        fileid: textid,
        date: new Date().getTime(),
        extension: extension,
        md5: md5
    });

    return "file-uploaded";
};

module.exports;
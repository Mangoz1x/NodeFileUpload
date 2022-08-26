let coord = { x: 0, y: 0 };

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }

    return true;
}

const render_custom_dim = (fileid, blankedit) => {
    let ctx = document.getElementById("canvas-edit");
    let ogctx = document.getElementById("canvas-edit");
    let image = new Image();
    
    if (!ctx?.getContext) return;
    ctx = ctx.getContext('2d');
    let canvas = ctx?.canvas;
    let canvas_width_res = document.getElementById("canvas-width-res");
    let canvas_height_res = document.getElementById("canvas-height-res");
    let canvas_zoom = document.getElementById("canvas-zoom");
    
    if (blankedit == "new-edit") {
        canvas.style.backgroundColor = "#fff";
        document.getElementById("ring-fixed-loader").style.display = "none"; 
    } else {
        canvas.style.backgroundColor = "#222";
        document.getElementById("ring-fixed-loader").style.display = "block";
    }

    image.addEventListener("load", () => {
        document.getElementById("ring-fixed-loader").style.display = "none";

        ogctx.width = canvas_width_res?.value;
        ogctx.height = canvas_height_res?.value;
    
        canvas.style.width = `calc(100% * ${canvas_zoom.value / 100} - 80px)`;
        canvas.style.height = `calc(100% * ${canvas_zoom.value / 100} - 80px)`;

        let hRatio = canvas?.width / image?.width;
        let vRatio = canvas?.height / image?.height;
        let ratio = Math.min(hRatio, vRatio);

        let centerShift_x = (canvas?.width - image?.width * ratio) / 2;
        let centerShift_y = (canvas?.height - image?.height * ratio) / 2;  

        ctx.drawImage(image, 0, 0, image?.width, image?.height, centerShift_x, centerShift_y, image?.width * ratio, image?.height * ratio);
        ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
    });

    image.src = `/render?fileid=${fileid}`;

    const draw = (e) => {
        let line_color = document.getElementById("color-picker").value;
        let line_depth = document.getElementById("line-depth").value;

        ctx.beginPath();

        ctx.lineWidth = line_depth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = line_color;

        ctx.moveTo(coord.x, coord.y);

        reposition(e);

        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
    
    const start = (e) => {       
        document.addEventListener("mousemove", draw);
        reposition(e);
    }
    
    const reposition = (evt) => {
        let rect = canvas.getBoundingClientRect(),
        scaleX = canvas?.width / rect?.width,
        scaleY = canvas?.height / rect?.height;
        
        coord.x = (evt.clientX - rect.left) * scaleX;
        coord.y = (evt.clientY - rect.top) * scaleY;
    }
    
    const stop = () => {
        document.removeEventListener('mousemove', draw);
    };

    document.addEventListener('mousedown', start);
    document.addEventListener('mouseup', stop);
};

const load_img = (fileid, blankedit) => {  
    let ctx = document.getElementById("canvas-edit");
    let ogctx = document.getElementById("canvas-edit");
    let image = new Image();

    if (!ctx?.getContext) return;
    ctx = ctx.getContext('2d');
    let canvas = ctx?.canvas;
    let canvas_width_res = document.getElementById("canvas-width-res");
    let canvas_height_res = document.getElementById("canvas-height-res");

    if (blankedit == "new-edit") {
        canvas.style.backgroundColor = "#fff";
        document.getElementById("ring-fixed-loader").style.display = "none"; 
        canvas.width = "1920";
        canvas.height = "1080";
    } else {
        canvas.style.backgroundColor = "#222";
        document.getElementById("ring-fixed-loader").style.display = "block";
    }

    canvas.style.width = `calc(100% - 80px)`;
    canvas.style.height = `calc(100% - 80px)`;

    image.addEventListener("load", () => {
        document.getElementById("ring-fixed-loader").style.display = "none";

        canvas_width_res.value = image?.width;
        canvas_height_res.value = image?.height;
        

        ogctx.width = (image?.width);
        ogctx.height = (image?.height);

        let hRatio = canvas?.width / image?.width;
        let vRatio = canvas?.height / image?.height;
        let ratio = Math.min(hRatio, vRatio);

        let centerShift_x = (canvas?.width - image?.width * ratio) / 2;
        let centerShift_y = (canvas?.height - image?.height * ratio) / 2;  

        ctx.drawImage(image, 0, 0, image?.width, image?.height, centerShift_x, centerShift_y, image?.width * ratio, image?.height * ratio);
        ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
    });

    image.src = `/render?fileid=${fileid}`;

    const draw = (e) => {
        let line_color = document.getElementById("color-picker").value;
        let line_depth = document.getElementById("line-depth").value;

        ctx.beginPath();

        ctx.lineWidth = line_depth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = line_color;

        ctx.moveTo(coord.x, coord.y);

        reposition(e);

        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
    
    const start = (e) => {       
        document.addEventListener("mousemove", draw);
        reposition(e);
    }
    
    const reposition = (evt) => {
        let rect = canvas.getBoundingClientRect(),
        scaleX = canvas?.width / rect?.width,
        scaleY = canvas?.height / rect?.height;
        
        coord.x = (evt.clientX - rect.left) * scaleX;
        coord.y = (evt.clientY - rect.top) * scaleY;
    }
    
    const stop = () => {
        document.removeEventListener('mousemove', draw);
    };

    let canvas_zoom = document.getElementById("canvas-zoom");
    canvas_zoom.value = "100";

    canvas_zoom.addEventListener("change", () => {
        canvas.style.width = `calc(100% * ${canvas_zoom.value / 100} - 80px)`;
        canvas.style.height = `calc(100% * ${canvas_zoom.value / 100} - 80px)`;
    });

    canvas_height_res.addEventListener("change", () => {
        canvas.width = canvas_width_res.value;
        canvas.height = canvas_height_res.value;

        if (blankedit == "new-edit") {
            render_custom_dim(returnParams().fileid, "new-edit");
        } else {
            render_custom_dim(returnParams().fileid);
        }
    });

    canvas_width_res.addEventListener("change", () => {
        canvas.width = canvas_width_res.value;
        canvas.height = canvas_height_res.value;

        if (blankedit == "new-edit") {
            render_custom_dim(returnParams().fileid, "new-edit");
        } else {
            render_custom_dim(returnParams().fileid);
        }
    });

    document.addEventListener('mousedown', start);
    document.addEventListener('mouseup', stop);
};

const convertCanvasToBase = () => {
    let dataUrl = document.getElementById("canvas-edit").toDataURL();
    let link = document.createElement("a");
    link.download = `export-${returnParams().fileid}.png`;
    link.href = dataUrl;
    link.click();
    link.remove();
};

const reupload_image = async () => {
    let convDataUrl = document.getElementById("canvas-edit").toDataURL();

    const blob = await (await fetch(convDataUrl)).blob(); 
    const file = new File([blob], `${returnParams().fileid}.png`, { type:"image/png", lastModified: new Date() });

    let data = new FormData();
    data.append("file", file);
    data.append("userid", getCookie("userId"));
    data.append("session", getCookie("token"));

    let req = new XMLHttpRequest();
    req.open("POST", "/upload");

    req.upload.addEventListener("progress", (e) => {
        let completed = (e.loaded / e.total) * 100;

        if (completed > 99) {
            document.getElementById("reupload").innerHTML = `<i class="fas fa-save">`;
            popUp("Sync Completed");
        } else {
            document.getElementById("reupload").innerText = completed + "%";
        }
    });

    req.upload.addEventListener("load", (e) => {});
    req.addEventListener("error", (e) => {});
    req.send(data);
};


// Search Params
const returnParams = () => {
    let params = location.search;
    if (params.includes("&")) {
        let splitQ = params?.split("?");
        let splitAnd = splitQ?.[1]?.split("&");
        let obj = {};
        
        for (let i = 0; i < splitAnd?.length; i++) {
            let splitE = splitAnd?.[i]?.split("=");

            obj[splitE?.[0]] = splitE?.[1];
        }

        return obj;
    } else {
        let split_params = params.split("=");
        let key_split = params.replace("?", "");
    
        key_split = key_split.split("=");
        key_split = key_split?.[0];
        split_params = split_params?.[split_params?.length - 1];
    
        return { [key_split]: split_params };
    }
} 

const check_doc_data = async (textid) => {
    let load = {
        userid: getCookie("userId"),
        session: getCookie("token"),
        textid: textid
    }
    
    let data = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    };

    let f = await fetch(`/get-doc`, data);
    f = await f.text();

    if (f == "no-results") {
        f = "";
    }

    let setDocument = false;

    try {
        if (isJson(f) && JSON.parse(f)?.err) {
            JSON.parse(f)?.err == "file-exist-false" 
                ? newThrownErr("We couldn't find this file in your drive", { dism: false }) 
                : setDocument = true;
        } else {
            setDocument = true;
        }
    } catch (err) {
        setDocument = true;
    }

    if (setDocument === true) return f;
    else return "";
};


const load_doc_data = async () => {
    let cdd = await check_doc_data(returnParams()?.docid);
    let doc = document.getElementById("text-editable-doc");

    doc.innerHTML = cdd;
}

const new_text_doc = async () => {
    let canvas_selector = document.getElementsByClassName("canvas-area")?.[0];
    let ring_loader = document.getElementById("ring-fixed-loader");
    let main_con = document.getElementById("main-edit-con");
    canvas_selector.remove();
    ring_loader.remove();
    main_con.style.display = "block";

    function randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';

        for (let i = 0; i < len; i++) {
            let randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz,randomPoz+1);
        }

        return randomString;
    }

    let gr = randomString(50);
    const query = new URLSearchParams(window.location.search);
    
    if (query.get("newdoc")) {
        query.delete("newdoc");
        window.location.href = "/edit?" + query;
    }
    
    if (!query.get("docid")) {
        query.append("docid", gr);
        window.location.href = "/edit?" + query;
    } 

    let doc = document.getElementById("text-editable-doc");
    let itterate_changed = "";

    setInterval(() => {
        let nblob = new Blob([doc.textContent], { type: "text/plain" });
        const file = new File([nblob], `untitled.txt`, { type:"text/plain", lastModified: new Date() });

        if (itterate_changed == doc.innerText) return;
        itterate_changed = doc.innerText;

        let data = new FormData();
        data.append("file", file);
        data.append("textid", returnParams()?.docid);
        data.append("userid", getCookie("userId"));
        data.append("session", getCookie("token"));

        let req = new XMLHttpRequest();
        req.open("POST", "/save-text");

        req.upload.addEventListener("progress", (e) => {
            let completed = (e.loaded / e.total) * 100;

            if (completed > 99) {
                document.getElementById("reupload").innerHTML = `<i class="fas fa-save">`;
                popUp("Sync Completed");
            } else {
                document.getElementById("reupload").innerText = completed + "%";
            }
        });

        req.upload.addEventListener("load", (e) => {});
        req.addEventListener("error", (e) => {});
        req.send(data);
    }, 15000);
};

const reRender = () => {
    load_img(returnParams().fileid);
};

const hide_canvas_tooldbar = () => {
    let ct = document.getElementById("canvas-toolbar");
    let dt = document.getElementById("doc-toolbar");
    ct.remove();
    dt.style.display = "flex";
};

const downloadDoc = () => {
    let docData = document.getElementById("text-editable-doc");
    
    let nblob = new Blob([docData.textContent], { type: "text/plain" });
    const file = new File([nblob], `untitled.txt`, { type:"text/plain", lastModified: new Date() });

    let aClick = document.createElement("a");
    aClick.download = file?.name;
    aClick.href = `data:text/plain;charset=utf-8,${encodeURIComponent(docData?.innerText)}`;
    aClick.click();
    aClick.remove();
};

const saveDoc = () => {
    let doc = document.getElementById("text-editable-doc");

    let nblob = new Blob([doc.textContent], { type: "text/plain" });
    const file = new File([nblob], `untitled.txt`, { type:"text/plain", lastModified: new Date() });

    let data = new FormData();
    data.append("file", file);
    data.append("textid", returnParams()?.docid);
    data.append("userid", getCookie("userId"));
    data.append("session", getCookie("token"));

    let req = new XMLHttpRequest();
    req.open("POST", "/save-text");

    req.upload.addEventListener("progress", (e) => {
        let completed = (e.loaded / e.total) * 100;

        if (completed > 99) {
            document.getElementById("reupload").innerHTML = `<i class="fas fa-save">`;
            popUp("Sync Completed");
        } else {
            document.getElementById("reupload").innerText = completed + "%";
        }
    });

    req.upload.addEventListener("load", (e) => {});
    req.addEventListener("error", (e) => {});
    req.send(data);
};

if (returnParams().fileid == "blank-edit-file") {
    document.getElementById("main-hide-n").remove();
    load_img(returnParams().fileid, "new-edit");
    document.getElementsByClassName("analyzer-results")?.[0]?.remove();
} else if (returnParams()?.newdoc == "true" || returnParams()?.docid) {
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
          
            saveDoc();
        }
    });

    hide_canvas_tooldbar();
    load_doc_data();
    new_text_doc();
} else {
    document.getElementById("main-hide-n").remove();
    load_img(returnParams().fileid);
    document.getElementsByClassName("analyzer-results")?.[0]?.remove();
}
const public_fetch_url = "https://mangoz1x.com";
// const public_fetch_url = "http://localhost:5000";

const newBlank = () => {
    window.location.href = "/edit?fileid=blank-edit-file";
};

const newTextDoc = () => {
    window.location.href = "/edit?newdoc=true";
};

const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

const highlight = (e) => {
    let drop_area = document.getElementById("drop_area");
    drop_area.classList.add("highlight");
};

const unhighlight = (e) => {
    let drop_area = document.getElementById("drop_area");
    drop_area.classList.remove("highlight");
};

const handleDrop = (e) => {
    let dt = e?.dataTransfer;
    let files = dt?.files;

    upload_file(files);
};

const upload_file = async (provided_file) => {
    let con = document.getElementById("static-con");
    let stat = document.getElementById("upload-static");
    let attr = document.getElementById("file");
    let upload_num = document.getElementById("upload-num");
    let files = provided_file || attr?.files;

    stat.innerHTML = "";
    upload_num.textContent = `${files.length} Uploads`;
    if (con.style.display = "none") con.style.display = "block";

    for (let i = 0; i < files.length; i++) {
        // Dont close page 
        let talert = (e) => {
            e.returnValue = "Closing this tab will cancel your uploads.";
        }

        window.addEventListener("beforeunload", talert);

        // Loader
        let div = document.createElement("div");
        let l = document.createElement("div");
        let p = document.createElement("p");

        div.classList.add("upload-static-item");
        l.classList.add("static-item-loader");

        p.textContent = files[i]?.name;
        l.textContent = "0%";

        div.appendChild(p);
        div.appendChild(l);
        stat.appendChild(div);

        // File Handeling
        let data = new FormData();
        data.append("file", files[i]);
        data.append("userid", getCookie("userId"));
        data.append("session", getCookie("token"));

        let req = new XMLHttpRequest();
        req.open("POST", "/upload", true);
        req.responseType = "json";

        req.addEventListener("load", () => {
            if (req?.response?.err && req?.response?.err == "acc-storage-limit-reached") {
                newThrownErr("Your account storage limit has been reached");
            }
        });

        req.upload.addEventListener("progress", (e) => {
            let completed = (e.loaded / e.total) * 100;
            l.textContent = `${(completed.toFixed(0))}%`
        });

        req.upload.addEventListener("load", (e) => {
            removeEventListener("beforeunload", talert)

            setTimeout(() => { render_files(); }, 500);
        });
        
        req.addEventListener("error", (e) => {
            p.style.color = "red";
            l.style.border = "none";
            l.textContent = "X";

            l.addEventListener("click", () => { stat.innerHTML = ""; });
            
            if (e?.lengthComputable == false) 
                p.textContent = "File excedes 1GB";
                removeEventListener("beforeunload", talert)
        });

        req.send(data);
    }
};

document.getElementById("file").addEventListener("change", (e) => {
    let sfiles = document.getElementById("file");
    upload_file(sfiles.files);
});

document.getElementById("upload_selector").addEventListener("click", () => {
    document.getElementById("file").click();
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    document.addEventListener(eventName, highlight, false);
});
  
['dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, unhighlight, false);
});

document.addEventListener('drop', handleDrop, false);

if (btn_minus_switcher) btn_minus_switcher.addEventListener("click", () => {
    let stat_con = document.getElementById("upload-static");

    if (btn_minus_switcher.textContent == "--") {
        nav_stat.style.position = "unset";
        stat_con.style.display = "none";
        btn_minus_switcher.textContent = "+";
    } else {
        nav_stat.style.position = "fixed";
        stat_con.style.display = "flex";
        btn_minus_switcher.textContent = "--";
    }
});

const noFiles = () => {
    let file_container = document.getElementById("file-container");
    let div = document.createElement("div");
    let p = document.createElement("p");
    let a = document.createElement("a");

    div.classList.add("no-files-err");
    p.textContent = "🔍 Looks like you don't have any files";
    a.textContent = "Upload";

    div.appendChild(p);
    div.appendChild(a);

    a.addEventListener("click", () => {
        document.getElementById("file").click();
    });

    file_container.appendChild(div);
};

const render_files = async () => {
    let file_container = document.getElementById("file-container");
    renderFolders();

    let load = {
        userid: getCookie("userId"),
        session: getCookie("token")
    }
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    let response = await fetch(`${public_fetch_url}/get-files`, load_data)
    response = await response.json();
    file_container.innerHTML = "";
    
    if (response?.files?.length == 0) noFiles();
    handleAccountStorage(response);

    for (let i = (response?.files?.length - 1); i > -1; i--) {
        let data_s = response?.files?.[i];

        let date = data_s?.date;
        let encoding = data_s?.encoding;
        let extension = data_s?.extension;
        let fileid = data_s?.fileid;
        let id = data_s?.id;
        let md5 = data_s?.md5;
        let mime = data_s?.mime;
        let name = data_s?.name;
        let size = data_s?.size;
        let publicity = data_s?.publicity;

        let file_div = document.createElement("div");
        let image = document.createElement("img");
        let video = document.createElement("video");
        let audio = document.createElement("audio");
        let source = document.createElement("source");
        let text = document.createElement("textarea");
        let h2 = document.createElement("h2");

        image.draggable = false;
        video.draggable = false;
        audio.draggable = false;
        source.draggable = false;
        file_div.draggable = false;

        file_div.setAttribute("date", date);
        file_div.setAttribute("encoding", encoding);
        file_div.setAttribute("extension", extension);
        file_div.setAttribute("fileid", fileid);
        file_div.setAttribute("id", id);
        file_div.setAttribute("md5", md5);
        file_div.setAttribute("mime", mime);
        file_div.setAttribute("name", name);
        file_div.setAttribute("size", size);
        file_div.setAttribute("publicity", publicity)

        file_div.classList.add("file_div")

        if (mime.includes("image")) {
            image.src = `${public_fetch_url}/render?fileid=${fileid}`;
            loadFile(file_div, image);
        } else if (mime.includes("video")) {
            source.src = `${public_fetch_url}/render?fileid=${fileid}`;
            video.controls = true;
            video.appendChild(source);
            file_div.appendChild(video)
        } else if (mime.includes("audio")) {
            source.src = `${public_fetch_url}/render?fileid=${fileid}`;
            source.type = mime;
            audio.volume = 0.1;
            audio.controls = true;
            
            audio.appendChild(source);
            file_div.appendChild(audio);
        } else {
            h2.innerText = "Looks like we cant display this file 🤔";
            file_div.appendChild(h2);
        }
        
        file_container.appendChild(file_div);
    }

    selectMultiElement();
};

function loadFile(container, source) {
    let error = document.createElement("h3");
    error.textContent = "Unable to load file";

    source.addEventListener("load", () => {
        container.appendChild(source);
    });

    source.addEventListener("error", () => {
        container.appendChild(error);
    });
}

window.onload = () => {
    contextMenu();
}

render_files();
// const public_fetch_url = "http://localhost:5000";
const public_fetch_url = "https://mangoz1x.com";

const checkAuthStatus = async (mail) => {
    let load = {
        checkAuthStatus: true,
        mail: mail
    }
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    let response = await fetch(`${public_fetch_url}/login`, load_data)
    response = await response.json();
    return response;
};

const makeCustomFetch = async (data, uri) => {
    let load = data;
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    let response = await fetch(`${public_fetch_url}/${uri}`, load_data)
    response = await response.json();
    return response;
};

const changeTwoFaBtn = async (runQ) => {
    let cookie = getCookie("email");
    let stat = twofaStat.getAttribute("status") || "0";

    if (runQ != false) stat = await checkAuthStatus(cookie);

    if (stat?.status == "1" || stat == "1") {
        twofaStat.style.color = "green";
        twofaStat.textContent = "2FA ENABLED";
        twofaStat.setAttribute("status", 1);
    } else {
        twofaStat.style.color = "red";
        twofaStat.textContent = "2FA DISABLED";
        twofaStat.setAttribute("status", 0);
    }
};

const setAccInfo = () => {
    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    let bdate = new Date(parseInt(getCookie("birthdate")));
    bdate = new Date(bdate.getTime() + 60 * 60 * 24 * 1000);
    bdate = bdate.toLocaleDateString();
    bdate = replaceAll(bdate, "/", "-");

    let create = new Date(parseInt(getCookie("created").split(" ")[0]));
    create = new Date(create.getTime() + 60 * 60 * 24 * 1000);
    create = create.toLocaleDateString();
    create = replaceAll(create, "/", "-");

    username.textContent = `${getCookie("username")}`;
    vname.textContent = `${getCookie("name")}`;
    mail.textContent = `${getCookie("email")}`;
    birthdate.textContent = `${bdate}`;
    created.textContent = `${create}`;
};

twofaStat?.addEventListener("click", async () => {
    let updateTo = "0";

    if (twofaStat?.getAttribute("status") == "1") {
        updateTo = "0";
    } else {
        updateTo = "1";
    }

    let s_data = {
        updateAuth: updateTo,
        userId: getCookie("userId"),
        token: getCookie("token")
    };

    let res = await makeCustomFetch(s_data, "modify-account");
    
    twofaStat.setAttribute("status", res?.mod?.updateValue);
    changeTwoFaBtn(false);
});

const resetPfpSrc = () => {
    pfpImage.src = `/render-api?userid=${getCookie("userId")}&renderPfp=true?refreshTime=${new Date().getTime()}`;
};

const validateFile = (file) => {
    if (!file) return { err: "No file selected" };
    if (!(file?.type?.includes("image"))) return { err: "File type is not an image" };
    if (file?.size / 1024 / 1024 > 10) return { err: "This file is to big" };

    return { status: "valid" };
};

const setPfpErr = (err) => {
    pfpErr.style.display = "block";
    pfpErr.textContent = err;
};

const uploadPfp = (file) => {
    console.log(file)
    let data = new FormData();
    data.append("file", file);
    data.append("userid", getCookie("userId"));
    data.append("session", getCookie("token"));
    data.append("ispfp", true);

    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open("POST", "/upload");

    req.upload.addEventListener("progress", (e) => {
        let completed = (e.loaded / e.total) * 100;
        console.log(`${completed}% UPLOADED`);
    });

    req.addEventListener("load", (e) => {
        if (req?.response?.err) {
            let msg = `${req?.response?.err?.split("-")?.join(" ") || req?.response?.err} (MAX: 10MB)`;
            setPfpErr(msg);
        } else {
            resetPfpSrc();
        }
    });

    req.addEventListener("error", (e) => { 
        setPfpErr("Unknown Error");
    });

    req.send(data);
};

const handleFile = (data, file) => {
    if (data?.err) {
        pfpErr.style.display = "block";
        pfpErr.textContent = data?.err;

        return;
    } else {
        pfpErr.style.display = "none";
    }

    if (data?.status == "valid") {
        return uploadPfp(file);
    } else {
        pfpErr.style.display = "block";
        pfpErr.textContent = "Unknown Error";

        return;
    }
};

const setPfp = () => {
    pfpImage.src = `/render-api?userid=${getCookie("userId")}&renderPfp=true`;

    pfpImage?.addEventListener("click", () => {
        pfpInput.click();
    });

    pfpImageText?.addEventListener("click", () => {
        pfpInput.click();
    });

    pfpInput.addEventListener("change", (e) => {
        let res = validateFile(pfpInput?.files[pfpInput?.files?.length - 1]);
        handleFile(res, pfpInput?.files[pfpInput?.files?.length - 1]);
    });
};

const setNav = () => {
    let page = 0;

    let pages = document.querySelectorAll("[data-page]");
    let container = document.getElementById("nav-id");
    let buttons = container.getElementsByTagName("button");

    function buttonChanges(button) {
        let dp = button?.getAttribute("data-linked");
        
        if (page != dp)
            page = dp;
        
        for (let i = 0; i < buttons?.length; i++) { buttons[i].style.backgroundColor = "transparent" };
        button.style.backgroundColor = "#333";

        for (let i = 0; i < pages?.length; i++) {
            pages[i].style.display = "none";
            if (pages[i].getAttribute("data-page") == page) 
                pages[page].style.display = "block";
        }
    }

    for (let i = 0; i < pages?.length; i++) {
        if (pages?.[i]?.style?.display != "none") page = pages?.[i]?.getAttribute("data-page");
    }

    for (let i = 0; i < buttons?.length; i++) {
        if (buttons?.[i]?.getAttribute("data-linked") == page) {
            buttons[i].style.backgroundColor = "#333";
        }

        buttons?.[i]?.addEventListener("click", () => buttonChanges(buttons?.[i]));
    }
};

window.addEventListener("load", () => {
    changeTwoFaBtn();
    setAccInfo();
    setPfp();
    setNav();
});
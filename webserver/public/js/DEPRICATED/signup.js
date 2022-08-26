function finalizeLogin(data) {
    const token = data?.token;
    const email = data?.email;
    const privateid = data?.privateid;
    const publicid = data?.publicid;
    const userid = data?.userid;
    const username = data?.username;
    const name = data?.name;
    const birthdate = data?.birthdate;
    const created = data?.created;
    let code = "";
    
    if (data?.code) code = data?.code;

    setCookie("token", token, 90);
    setCookie("email", email, 90);
    setCookie("privateId", privateid, 90);
    setCookie("publicId", publicid, 90);
    setCookie("userId", userid, 90);
    setCookie("code", code, 90);
    setCookie("username", username, 90)
    setCookie("name", name, 90)
    setCookie("birthdate", birthdate, 90);
    setCookie("created", created, 90)

    window.location.reload();
};

function throwNewSigninErr(msg) {
    let msg_p = document.getElementById("err_msg");
    msg_p.style.display = "block";
    msg_p.textContent = msg;
}

function verifyInputs(load) {
    let username = load?.username;
    let password = load?.password;
    let name = load?.fullName;
    let mail = load?.mail;
    let birthday = load?.birthday;

    if (!(username || password || name || mail || birthday)) return { err: "Please fill out all fields" };
    if (password?.length < 7 || password.length > 512) return { err: "Password must be [8-512] characters" };
    if (!password.trim()) return { err: "Password must contain valid UTF-8 characters" };
    if (mail?.length < 3 || mail?.length > 512) return { err: "Email must be [3-512] characters" }; 
    if (name?.length < 2 || name?.length > 512) return { err: "Full name must be [3-512] characters" };

    return { status: "data-valid" };
}

async function fetchSignupInfo() {
    let username = document.getElementById("username")?.value;
    let password = document.getElementById("password")?.value;
    let name = document.getElementById("name")?.value;
    let email = document.getElementById("email")?.value;
    let birthday = document.getElementById("birthday")?.value;

    let load = {
        username: username,
        password: password,
        fullName: name,
        mail: email,
        birthday: birthday
    }

    let dataVal = verifyInputs(load);
    
    if (dataVal?.err) {
        throwNewSigninErr(dataVal?.err);
        return { err: dataVal?.err };
    }

    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }

    let response = await fetch(`/signup`, load_data)
    response = await response.json();
    
    handleFetchSignupInfo(response);
    return response;
}

function handleFetchSignupInfo(data) {
    finalizeLogin(data);
}

function addInputListeners() {
    let elem_arr = [
        document.getElementById("username"),
        document.getElementById("password"),
        document.getElementById("name"),
        document.getElementById("email"),
        document.getElementById("birthday")
    ];

    elem_arr?.forEach((item, i) => item?.addEventListener("keyup", async (e) => {
        if (e?.key != "Enter") return;
        await fetchSignupInfo();
    }));

    let btn = document.getElementById("signup-clickable");
    btn?.addEventListener("click", async () => {
        await fetchSignupInfo();
    });
}

window.addEventListener("load", () => {
    addInputListeners();
});
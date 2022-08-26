const public_fetch_url = `${window.location.protocol}//${window.location.hostname}${window.location.port != "80" || window.location.port != "443" ? ":" + window.location.port : ""}`;
// const public_fetch_url = "https://mangoz1x.com";
let user_completed_steps = {};

const throwNewSignInErr = (msg, step) => {
    if (document.getElementsByClassName("err_msg")?.[0]) 
        document.getElementsByClassName("err_msg")[0].remove();

    let err = document.createElement("p");
    err.style.color = "red";
    err.style.margin = "0";
    err.style.marginTop = "5px";
    err.classList.add("err_msg");

    err.textContent = `${msg}`;
    step.appendChild(err);

    return;
};

const finalizeLogin = async (data) => {
    let code = "";
    if (data?.code) code = data?.code;

    setCookie("token", data?.token, 90);
    setCookie("email", data?.email, 90);
    setCookie("privateId", data?.privateid, 90);
    setCookie("publicId", data?.publicid, 90);
    setCookie("userId", data?.userid, 90);
    setCookie("code", code, 90);
    setCookie("username", data?.username, 90)
    setCookie("name", data?.name, 90)
    setCookie("birthdate", data?.birthdate, 90);
    setCookie("created", data?.created, 90)

    window.location.reload();
};

const checkAuthStatus = async (username) => {
    let load = {
        checkAuthStatus: true,
        mail: username
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

const validateUsername = async (username) => {
    let load = {
        checkUsername: true,
        mail: username
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

const validatePassword = async (username, password) => {
    user_completed_steps.username = username;
    user_completed_steps.password = password;

    let load = {
        mail: username,
        password: password
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

const sendTwoFaCode = async () => {
    let load = {
        mail: user_completed_steps?.username,
        password: user_completed_steps?.password,
        send: "send"
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

const passwordDef = (step, stepthree, username, password, code) => {
    let pwdNext = async () => {
        let username = document.getElementById("username")?.value;
        let check = await validatePassword(username, password?.value)

        if (check?.err == "no-user") return throwNewSignInErr("Invalid username or password.", step);
            
        let authCheck = await checkAuthStatus(username);
        if (!(authCheck?.status == "1")) return finalizeLogin(check);

        sendTwoFaCode();

        step.classList.add("slide-next");
        setTimeout(() => { 
            step.classList.remove("slide-next");
            step.style.display = "none";

            stepthree.classList.add("slide-in");
            stepthree.style.display = "flex";
        }, 300)
    };

    password.addEventListener("keydown", (e) => {
        if (e?.keyCode == 13 || e?.code == 'Enter') {
            pwdNext();
        }       
    });

    document.getElementById("next-pwd").addEventListener("click", () => {
        pwdNext();
    });
}

const usernameDef = (step, stepthree, username, password, code) => {
    passwordDef(step, stepthree, username, password, code);
}

const authCodeCheck = async (cc, username, password) => {
    let load = {
        mail: username,
        password: password,
        code: cc
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
}

const setAnimation = () => {
    let step = document.getElementsByClassName("step-1")[0];
    let stepthree = document.getElementsByClassName("step-3")[0];

    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let code = document.getElementById("2fa");

    usernameDef(step, stepthree, username, password, code)

    let ain = document.getElementById("2fa");

    ain.addEventListener("keydown", async (e) => {
        if ((e?.keyCode != 13 || e?.code != 'Enter')) return;
        let response = await authCodeCheck(ain.value, user_completed_steps.username, user_completed_steps.password);
        
        if (!(response?.token && response?.userid)) throwNewSignInErr("Invalid verification code.", stepthree)
        finalizeLogin(response);
    });
};

setAnimation();
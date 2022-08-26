function signOutG() {
    let auth2 = gapi?.auth2?.getAuthInstance();

    auth2.signOut().then(() => {
        console.log("Google__SignedOut -> Event__WebSignIn")
    });
}

function setGoogleLogin(data) {
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
    setCookie("usedGoogleAuth", true, 90);

    signOutG();

    window.location.reload();
};

async function useGoogleLogin(data) {
    let load = {
        id_token: data?.id_token,
        googleLogin: true
    }

    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }

    let response = await fetch(`/login`, load_data)
    response = await response.json();
    return response;
}

async function onSignIn(googleUser) {
    let id_token = googleUser?.getAuthResponse()?.id_token;
    let step = document?.getElementsByClassName("step-1")?.[0];

    let data = {
        id_token: id_token
    }

    let useA = await useGoogleLogin(data);
    if (useA?.err) return throwNewSignInErr(useA?.err?.split("-").join(" "), step);
    setGoogleLogin(useA);
}

function attachSignIn(element) {
    auth2.attachClickHandler(element, {}, (googleUser) => {
        onSignIn(googleUser);
    }, (err) => {
        console.log(`G-SIGNIN-ERR=${err}`);
    });
}

function startApp() {
    gapi.load("auth2", () => {
        auth2 = gapi.auth2.init({
            client_id: '198499681155-691p76be8kc5r79vtbrtnib70f68joo8.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
        });
        
        attachSignIn(document.getElementById("google-signin2"));
    });
}

window.addEventListener("load", () => {
    startApp();
})
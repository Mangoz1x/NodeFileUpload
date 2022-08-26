let dataStep = 1;

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function setLogin(data) {
    setCookie("token", data?.token, 90);
    setCookie("email", data?.email, 90);
    setCookie("privateId", data?.privateid, 90);
    setCookie("publicId", data?.publicid, 90);
    setCookie("userId", data?.userid, 90);
    setCookie("code", data?.code, 90);
    setCookie("username", data?.username, 90)
    setCookie("name", data?.name, 90)
    setCookie("birthdate", data?.birthdate, 90);
    setCookie("created", data?.created, 90);

    window.location.reload();
}

function setStep(step) { 
    step = step - 1;

    let steps = document.querySelectorAll("[data-step]");
    if (!(steps[step])) return;

    steps[step].style.display = "flex";

    for (let i = 0; i < steps?.length; i++) 
        if (!(steps[i] == steps[step] || !(steps[i]))) 
            steps[i].style.display = "none";
}

function testLen(data) {
    let validLen = data?.length > 3 && data?.length < 513 ? true : false;
    
    if (validLen == false) return { err: `All fields must be between [3-512] characters`};
    return true; 
}

function testUsr(data) {
    let validCar = replaceAll(data, /[0-9A-Z_a-z]/, "") == "" ? true : false;
    
    if (validCar == false) return { err: "Username must only contain characters [A-Za-z0-9-_]"};
    return true; 
}

function testDate(data) {
    let dob = new Date(data);
    let month_diff = Date.now() - dob.getTime();
    let age_dt = new Date(month_diff); 
    let year = age_dt.getUTCFullYear();
    let age = Math.abs(year - 1970);

    if (age < 13) return { err: "You must be at 13 or older to create an account" };
    return true;
}

function throwNewSigninErr(msg) {
    let msg_p = document.getElementById("err_msg");
    msg_p.style.display = "block";
    msg_p.textContent = msg;
}

function clearSigninErr() {
    let msg_p = document.getElementById("err_msg");
    msg_p.style.display =  "none";
    msg_p.textContent = "";
}

function checkInputs(noErrUi) {
    let username = document.getElementById("username")?.value;
    let password = document.getElementById("password")?.value;
    let name = document.getElementById("name")?.value;
    let email = document.getElementById("email")?.value;
    let birthday = document.getElementById("birthday")?.value;

    if (testLen(username)?.err || testLen(password)?.err || testLen(name)?.err || testLen(email)?.err || testLen(birthday)?.err)
        if (noErrUi !== true) 
            return throwNewSigninErr("All fields must be between [3-512] characters");
        else 
            return { err: "All fields must be between [3-512] characters" };

    if (testUsr(username)?.err)
        if (noErrUi !== true) 
            return throwNewSigninErr("Username must only contain characters [A-Za-z0-9-_]");
        else 
            return { err: "Username must only contain characters [A-Za-z0-9-_]" };

    if (testDate(birthday)?.err) 
        if (noErrUi !== true) 
            return throwNewSigninErr("You must be at 13 or older to create an account");
        else 
            return { err: "You must be at 13 or older to create an account" };

    if (dataStep != 2) 
        return { err: "data-step-invalid" };

    return true;
}

function addInputListeners() {
    let elements = [
        document.getElementById("username"),
        document.getElementById("password"),
        document.getElementById("name"),
        document.getElementById("email"),
        document.getElementById("birthday")
    ];

    elements?.forEach((item, i) => item?.addEventListener("keyup", async (e) => {
        if (e?.key != "Enter") return;

        if (item?.id == "email" || item?.id == "name") {
            if (dataStep == 1 && !(testLen(elements?.[3]?.value)?.err || testLen(elements?.[2]?.value)?.err)) {
                dataStep = 2;
                setStep(2);
                return;
            }
        }

        let check = checkInputs(true);
        if (check?.err) return throwNewSigninErr(check?.err);

        await signupRequest();
    }));

    let btn = document.getElementById("signup-clickable");
    btn?.addEventListener("click", async () => {
        if (dataStep == 1 && !(testLen(elements?.[3]?.value)?.err || testLen(elements?.[2]?.value)?.err)) {
            dataStep = 2;
            setStep(2);
            return;
        }
        
        let check = checkInputs(true);        
        if (check?.err) return throwNewSigninErr(check?.err);

        await signupRequest();
    });

    let backStep = document.getElementById("backStep");
    backStep?.addEventListener("click", () => {
        dataStep = 1;
        setStep(1);
    });
}

async function signupRequest() {
    let username = document.getElementById("username")?.value;
    let password = document.getElementById("password")?.value;
    let name = document.getElementById("name")?.value;
    let email = document.getElementById("email")?.value;
    let birthday = document.getElementById("birthday")?.value;

    let check = checkInputs(true);
    if (check?.err) return throwNewSigninErr(check?.err);

    const load = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            username: username,
            password: password,
            fullName: name,
            mail: email,
            birthday: birthday
        })
    }

    let response = await fetch("/signup", load);
    response = await response.json();

    if (response?.err) 
        return throwNewSigninErr(response?.err);
    else
        return setLogin(response);
}

window.addEventListener("load", () => {
    addInputListeners();
});
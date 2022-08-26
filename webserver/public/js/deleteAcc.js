function ILST() {
    let btn = document.getElementById("delete_account");
    
    const closeTrigger = (c, e) => {
        if (e?.path?.[0]?.id != "uniqueid-194325") return;
        c.style.opacity = "0";

        setTimeout(() => {
            c.style.display = "none";
        }, 100)
    };

    const trigger = async () => {
        let c = document.getElementsByClassName("delete-account-container")[0];
        c.style.display = "flex";

        setTimeout(() => {
            c.style.opacity = "1";
        }, 10)

        c.addEventListener("click", (e) => {
            closeTrigger(c, e);
        });

        let uuid = getCookie("userId");
        let tok = getCookie("token");

        let load = {
            sendMail: true,
            uuid: uuid,
            token: tok 
        }
        
        let load_data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(load)
        }

        let fet = await fetch("/delete-account", load_data);
        fet = await fet.json();
    }

    btn.addEventListener("click", () => {
        trigger();
    });

    btn.addEventListener("touchend", () => {
        trigger();
    });
}

function ILSB() {
    let input = document.getElementById("confirm_password");
    let btn = document.getElementById("submit_confirm_pwd");

    const trigger = async (password) => {
        let uuid = getCookie("userId");
        let tok = getCookie("token");

        let load = {
            pwd: password,
            uuid: uuid,
            token: tok 
        }
        
        let load_data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(load)
        }

        let fet = await fetch("/delete-account", load_data);
        fet = await fet.json();
        
        if (fet?.err && fet?.err == "invalid-pwd") {
            document.getElementById("pwd-ver-err").textContent = "Invalid code";
        } else if (fet?.response && fet?.response == "deleted") {
            window.location.reload();
        }
    };  

    input.addEventListener("keydown", (e) => {
        if (e?.key != "Enter") return;
        trigger(input?.value);
    });

    btn.addEventListener("touchend", () => {
        trigger(input?.value);
    });

    btn.addEventListener("click", () => {
        trigger(input?.value);
    });
}

window.addEventListener("load", () => {
    ILST();
    ILSB();
});
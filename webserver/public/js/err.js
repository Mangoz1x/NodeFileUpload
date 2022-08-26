const animationTimeout = 300;

function animateDimmerIn(e) {
    e.classList.add("err-animate-in");

    setTimeout(() => {
        e.classList.remove("err-animate-in");
    }, animationTimeout)
}

function animateDimmerOut(e) {
    if (e?.classList?.contains("err-animate-in")) 
        e?.classList?.remove("err-animate-in");
    
    e.classList.add("err-animate-out");

    setTimeout(() => {
        e.remove();
    }, animationTimeout)
} 

function offsetClickCheck(e) {
    if (e?.path?.[0]?.classList?.contains("err-dimmer")) 
        animateDimmerOut(e?.path?.[0]);
}

function offsetClickListener(dimmer) {
    dimmer?.addEventListener("click", offsetClickCheck, true);
}

function newThrownErr(msg, options) {
    let dimmer = document.createElement("div");
    let inner = document.createElement("div");
    let mesg = document.createElement("h2");
    let dism = document.createElement("a");
    let home = document.createElement("a");

    dimmer.classList.add("err-dimmer", "err-animate-in");
    inner.classList.add("err-inner", "err-inner-in");
    mesg.classList.add("err-mesg");
    dism.classList.add("err-dism");
    home.classList.add("err-dism");

    mesg.textContent = msg || "Unknown";
    dism.textContent = "Dismiss";

    dism?.addEventListener("click", () => { animateDimmerOut(dimmer) });

    inner.appendChild(mesg);

    if (options?.dism != false) {
        offsetClickListener(dimmer);
        inner.appendChild(dism);
    } else {
        home.href = "/";
        
        home.textContent = "Back";
        inner.appendChild(home);
    }

    dimmer.appendChild(inner);

    document.body.appendChild(dimmer);
    document.body.style.overflow = "hidden";
}